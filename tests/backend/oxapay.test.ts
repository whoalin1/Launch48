import { createHmac } from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

import { briefSchema } from "../../lib/brief";
import {
  formatPendingIssueBody,
  type StoredOrderRecord,
} from "../../lib/orders";

import {
  OxaPayOfferMismatchError,
  createHostedCheckout,
  getPaymentConfirmation,
  parseOxaPayPaymentInformation,
  resolveSiteOrigin,
  usdAmountToCents,
  validateLaunch48PaymentInformation,
  verifyOxaPayWebhookSignature,
} from "../../lib/oxapay";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const paymentPayload = {
  data: {
    track_id: "184747701",
    order_id: "l48-db-0123456789abcdef0123456789abcdef",
    type: "invoice",
    status: "paid",
    amount: 349,
    currency: "USD",
    email: "buyer@example.com",
    description: "Launch48 landing page",
    sandbox: false,
  },
  status: 200,
};

describe("OxaPay authoritative payment parsing", () => {
  it("parses the exact fixed-price invoice shape", () => {
    expect(parseOxaPayPaymentInformation(paymentPayload)).toEqual({
      trackId: "184747701",
      orderId: "l48-db-0123456789abcdef0123456789abcdef",
      type: "invoice",
      status: "paid",
      amountCents: 34_900,
      currency: "usd",
      email: "buyer@example.com",
      description: "Launch48 landing page",
      sandbox: false,
    });
  });

  it("rejects offer, identity, and sandbox mismatches", () => {
    const expected = {
      orderId: paymentPayload.data.order_id,
      trackId: paymentPayload.data.track_id,
      sandbox: false,
    };
    expect(() =>
      validateLaunch48PaymentInformation(
        parseOxaPayPaymentInformation(paymentPayload),
        expected,
      ),
    ).not.toThrow();

    for (const data of [
      { ...paymentPayload.data, amount: 348.99 },
      { ...paymentPayload.data, currency: "EUR" },
      { ...paymentPayload.data, description: "Another product" },
      { ...paymentPayload.data, sandbox: true },
      { ...paymentPayload.data, track_id: "999" },
    ]) {
      expect(() =>
        validateLaunch48PaymentInformation(
          parseOxaPayPaymentInformation({ data }),
          expected,
        ),
      ).toThrow(OxaPayOfferMismatchError);
    }
  });
});

describe("OxaPay webhook signature", () => {
  it("verifies HMAC-SHA512 over the exact raw body", () => {
    const raw = '{"track_id":"184747701","status":"Paid"}';
    const secret = "merchant_api_key_secret";
    const signature = createHmac("sha512", secret).update(raw).digest("hex");
    expect(verifyOxaPayWebhookSignature(raw, signature, secret)).toBe(true);
    expect(verifyOxaPayWebhookSignature(`${raw}\n`, signature, secret)).toBe(false);
    expect(verifyOxaPayWebhookSignature(raw, "not-hex", secret)).toBe(false);
  });
});

describe("checkout URL and money hardening", () => {
  it("uses SITE_URL or the canonical production host, never an arbitrary Host", () => {
    expect(
      resolveSiteOrigin("https://attacker.example/api/checkout", {}),
    ).toBe("https://launch48-psi.vercel.app");
    expect(
      resolveSiteOrigin("https://attacker.example/api/checkout", {
        SITE_URL: "https://launch48.example/path",
      }),
    ).toBe("https://launch48.example");
    expect(
      resolveSiteOrigin("http://localhost:3000/api/checkout", {
        NODE_ENV: "development",
      }),
    ).toBe("http://localhost:3000");
  });

  it("persists the encrypted brief before creating an exact $349 hosted invoice", async () => {
    const brief = briefSchema.parse({
      businessName: "Fieldnote Coffee",
      pitch: "Small-lot coffee roasted with restraint.",
      audience: "Home brewers",
      tone: "Warm and precise",
      referenceUrls: "https://example.com/reference",
      colors: "Rust and paper",
      mustHaveSections: "Hero, story, offer, FAQ",
      contactEmail: "founder@example.com",
      domain: "fieldnote.example",
    });
    let issueBody = "";
    let invoiceRequest: Record<string, unknown> | null = null;
    let call = 0;
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      call += 1;
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      if (call === 1 && url.endsWith("/issues") && init?.method === "POST") {
        const request = JSON.parse(String(init.body)) as { body: string };
        expect(request.body).not.toContain(brief.contactEmail);
        return Response.json({ number: 42 });
      }
      if (url.endsWith("/issues/42") && init?.method === "PATCH") {
        const request = JSON.parse(String(init.body)) as { body: string };
        issueBody = request.body;
        return Response.json({ number: 42 });
      }
      if (url.endsWith("/payment/invoice") && init?.method === "POST") {
        invoiceRequest = JSON.parse(String(init.body)) as Record<string, unknown>;
        return Response.json({
          data: {
            track_id: "184747701",
            payment_url: "https://pay.oxapay.com/123/184747701",
          },
          status: 200,
        });
      }
      if (url.endsWith("/issues/42") && (!init?.method || init.method === "GET")) {
        return Response.json({ body: issueBody });
      }
      throw new Error(`Unexpected fetch #${call}: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const checkout = await createHostedCheckout(
      brief,
      "https://attacker.example/api/checkout",
      {
        OXAPAY_MERCHANT_API_KEY: "merchant-key",
        OXAPAY_SANDBOX: "false",
        SITE_URL: "https://launch48.example",
        GITHUB_ISSUES_TOKEN: "issues-token",
        CHECKOUT_STATE_SECRET: "strong-checkout-state-secret-at-least-32-characters",
      },
    );

    expect(checkout.orderId).toMatch(/^l48-gh-42-[a-f0-9]{32}$/);
    expect(checkout.trackId).toBe("184747701");
    expect(checkout.url).toBe("https://pay.oxapay.com/123/184747701");
    const capturedInvoiceRequest = invoiceRequest as Record<string, unknown> | null;
    expect(capturedInvoiceRequest).not.toBeNull();
    expect(capturedInvoiceRequest).toMatchObject({
      amount: 349,
      currency: "USD",
      fee_paid_by_payer: 0,
      under_paid_coverage: 0,
      mixed_payment: false,
      callback_url: "https://launch48.example/api/webhooks/oxapay",
      email: brief.contactEmail,
      order_id: checkout.orderId,
      description: "Launch48 landing page",
      sandbox: false,
    });
    expect(String(capturedInvoiceRequest?.return_url)).toBe(
      `https://launch48.example/success?order_id=${checkout.orderId}`,
    );
    expect(issueBody).not.toContain(brief.contactEmail);
  });

  it("converts only exact two-decimal-safe USD values", () => {
    expect(usdAmountToCents(349)).toBe(34_900);
    expect(usdAmountToCents("349.00")).toBe(34_900);
    expect(usdAmountToCents("349.001")).toBeNull();
    expect(usdAmountToCents("not-money")).toBeNull();
  });
});

describe("success-page confirmation", () => {
  it("recovers a missed webhook by promoting an authoritatively paid order", async () => {
    const secret = "another-strong-checkout-state-secret-32-plus";
    const orderId = "l48-gh-77-abcdefabcdefabcdefabcdefabcdefab";
    const brief = briefSchema.parse({
      businessName: "Fieldnote Coffee",
      pitch: "Small-lot coffee roasted with restraint.",
      audience: "Home brewers",
      tone: "Warm and precise",
      referenceUrls: "https://example.com/reference",
      colors: "Rust and paper",
      mustHaveSections: "Hero, story, offer, FAQ",
      contactEmail: "founder@example.com",
    });
    const pending: StoredOrderRecord = {
      orderId,
      trackId: "184747701",
      status: "pending",
      amountCents: 34_900,
      currency: "usd",
      createdAt: "2026-08-24T18:00:00.000Z",
      paidAt: null,
      paymentEmail: null,
      brief,
    };
    const pendingBody = formatPendingIssueBody(pending, secret);
    const updates: Array<Record<string, unknown>> = [];
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      if (url.endsWith("/issues/77") && (!init?.method || init.method === "GET")) {
        return Response.json({ body: pendingBody });
      }
      if (url === "https://api.oxapay.com/v1/payment/184747701") {
        return Response.json({
          data: {
            ...paymentPayload.data,
            order_id: orderId,
          },
        });
      }
      if (url.endsWith("/issues/77") && init?.method === "PATCH") {
        updates.push(JSON.parse(String(init.body)) as Record<string, unknown>);
        return Response.json({ number: 77 });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPaymentConfirmation(orderId, {
      OXAPAY_MERCHANT_API_KEY: "merchant-key",
      OXAPAY_SANDBOX: "false",
      GITHUB_ISSUES_TOKEN: "issues-token",
      CHECKOUT_STATE_SECRET: secret,
    });
    expect(result).toMatchObject({
      orderId,
      trackId: "184747701",
      paid: true,
      state: "paid",
      status: "paid",
      contactEmail: brief.contactEmail,
    });
    expect(updates).toHaveLength(1);
    expect(updates[0].title).toBe("Order: Fieldnote Coffee");
  });
});
