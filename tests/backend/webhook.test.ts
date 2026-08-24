import { createHmac } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../../app/api/webhooks/oxapay/route";
import { briefSchema } from "../../lib/brief";
import {
  formatPendingIssueBody,
  type StoredOrderRecord,
} from "../../lib/orders";

const merchantKey = "oxapay-merchant-key-for-tests";
const stateSecret = "checkout-state-secret-that-is-at-least-32-chars";
const orderId = "l48-gh-42-0123456789abcdef0123456789abcdef";
const trackId = "184747701";
const brief = briefSchema.parse({
  businessName: "Fieldnote Coffee",
  pitch: "Small-lot coffee roasted with restraint.",
  audience: "Home brewers who care about provenance.",
  tone: "Warm and precise",
  referenceUrls: "https://example.com/reference",
  colors: "Rust and paper",
  mustHaveSections: "Hero, story, offer, FAQ",
  contactEmail: "founder@example.com",
  domain: "fieldnote.example",
});
const pending: StoredOrderRecord = {
  orderId,
  trackId,
  status: "pending",
  amountCents: 34_900,
  currency: "usd",
  createdAt: "2026-08-24T18:00:00.000Z",
  paidAt: null,
  paymentEmail: null,
  brief,
};

const originalEnv = {
  OXAPAY_MERCHANT_API_KEY: process.env.OXAPAY_MERCHANT_API_KEY,
  OXAPAY_SANDBOX: process.env.OXAPAY_SANDBOX,
  DATABASE_URL: process.env.DATABASE_URL,
  GITHUB_ISSUES_TOKEN: process.env.GITHUB_ISSUES_TOKEN,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  CHECKOUT_STATE_SECRET: process.env.CHECKOUT_STATE_SECRET,
};

function restoreEnv() {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function paymentInfo(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      track_id: trackId,
      order_id: orderId,
      type: "invoice",
      status: "paid",
      amount: 349,
      currency: "USD",
      email: "billing@example.com",
      description: "Launch48 landing page",
      sandbox: false,
      ...overrides,
    },
    status: 200,
  };
}

function signedRequest(
  callback: Record<string, unknown>,
  signatureOverride?: string,
): Request {
  const raw = JSON.stringify(callback);
  const signature =
    signatureOverride ??
    createHmac("sha512", merchantKey).update(raw).digest("hex");
  return new Request("https://launch48-psi.vercel.app/api/webhooks/oxapay", {
    method: "POST",
    headers: { "Content-Type": "application/json", HMAC: signature },
    body: raw,
  });
}

const callback = {
  track_id: trackId,
  order_id: orderId,
  type: "invoice",
  status: "Paid",
};

beforeEach(() => {
  process.env.OXAPAY_MERCHANT_API_KEY = merchantKey;
  process.env.OXAPAY_SANDBOX = "false";
  delete process.env.DATABASE_URL;
  delete process.env.GITHUB_TOKEN;
  process.env.GITHUB_ISSUES_TOKEN = "github-issues-token";
  process.env.CHECKOUT_STATE_SECRET = stateSecret;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  restoreEnv();
});

describe("OxaPay webhook", () => {
  it("authoritatively verifies a paid invoice and promotes the same issue", async () => {
    const updates: Array<Record<string, unknown>> = [];
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      if (url === `https://api.oxapay.com/v1/payment/${trackId}`) {
        return Response.json(paymentInfo());
      }
      if (url.endsWith("/issues/42") && (!init?.method || init.method === "GET")) {
        return Response.json({ body: formatPendingIssueBody(pending, stateSecret) });
      }
      if (url.endsWith("/issues/42") && init?.method === "PATCH") {
        updates.push(JSON.parse(String(init.body)) as Record<string, unknown>);
        return Response.json({ number: 42 });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(signedRequest(callback));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("OK");
    expect(updates).toHaveLength(1);
    expect(updates[0].title).toBe("Order: Fieldnote Coffee");
    expect(String(updates[0].body)).toContain("# Paid Launch48 order");
    expect(String(updates[0].body)).toContain(brief.contactEmail);
  });

  it("rejects an invalid raw-body HMAC before any provider call", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(signedRequest(callback, "0".repeat(128)));
    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("acknowledges a signed non-matching offer without fulfillment", async () => {
    const fetchMock = vi.fn(async () => Response.json(paymentInfo({ amount: 1 })));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(signedRequest(callback));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("OK");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns a retryable error when verified fulfillment storage fails", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      if (url.includes("api.oxapay.com")) return Response.json(paymentInfo());
      return new Response("unavailable", { status: 503 });
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await POST(signedRequest(callback));
    expect(response.status).toBe(503);
    expect(await response.text()).toBe("Retry");
  });

  it("retries when a signed Paid callback arrives before payment-info converges", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json(paymentInfo({ status: "paying" })),
    );
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(signedRequest(callback));
    expect(response.status).toBe(503);
    expect(await response.text()).toBe("Retry");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
