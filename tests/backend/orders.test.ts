import { describe, expect, it } from "vitest";

import { briefSchema, toPolarMetadata } from "../../lib/brief";
import {
  buildPaidOrderRecord,
  formatOrderIssueBody,
  formatOrderIssueTitle,
  getOrderStorageConfig,
  launch48OrderMarker,
} from "../../lib/orders";

const brief = briefSchema.parse({
  businessName: "Fieldnote Coffee",
  pitch: "Small-lot coffee roasted with restraint.",
  audience: "Home brewers who care about provenance.",
  tone: "Warm & precise <script>alert(1)</script>",
  referenceUrls: "https://example.com/reference",
  colors: "Rust #c4451c and paper",
  mustHaveSections: "Hero\nStory\nOffer\nFAQ",
  contactEmail: "founder@example.com",
  domain: "fieldnote.example",
});

function makeRecord() {
  return buildPaidOrderRecord({
    order: {
      id: "order_123",
      checkoutId: "checkout_123",
      productId: "product_123",
      status: "paid",
      paid: true,
      subtotalAmount: 34_900,
      discountAmount: 0,
      totalAmount: 36_645,
      currency: "USD",
      metadata: toPolarMetadata(brief),
      customer: { email: "billing@example.com" },
    },
    expectedProductId: "product_123",
    webhookId: "webhook_123",
    paidAt: "2026-08-24T18:00:00.000Z",
  });
}

describe("paid order extraction", () => {
  it("extracts payment fields and the full brief", () => {
    const record = makeRecord();
    expect(record).toMatchObject({
      checkoutId: "checkout_123",
      polarOrderId: "order_123",
      productId: "product_123",
      status: "paid",
      subtotalAmount: 34_900,
      totalAmount: 36_645,
      currency: "usd",
      brief,
    });
  });

  it("rejects unpaid, discounted, wrong-product, and malformed-brief orders", () => {
    const base = {
      id: "order_123",
      checkoutId: "checkout_123",
      productId: "product_123",
      status: "paid",
      paid: true,
      subtotalAmount: 34_900,
      discountAmount: 0,
      totalAmount: 34_900,
      currency: "usd",
      metadata: toPolarMetadata(brief),
      customer: {},
    };
    const build = (order: typeof base) =>
      buildPaidOrderRecord({
        order,
        expectedProductId: "product_123",
        webhookId: "webhook_123",
        paidAt: new Date(),
      });

    expect(() => build({ ...base, paid: false })).toThrow();
    expect(() => build({ ...base, discountAmount: 1 })).toThrow();
    expect(() => build({ ...base, productId: "another_product" })).toThrow();
    expect(() => build({ ...base, metadata: {} })).toThrow();
  });
});

describe("order issue formatting", () => {
  it("uses the required title and an idempotency marker", () => {
    const record = makeRecord();
    expect(formatOrderIssueTitle(record)).toBe("Order: Fieldnote Coffee");
    expect(formatOrderIssueBody(record)).toContain(
      launch48OrderMarker("checkout_123"),
    );
  });

  it("includes all brief and payment fields and HTML-escapes input", () => {
    const body = formatOrderIssueBody(makeRecord());
    for (const value of [
      brief.businessName,
      brief.pitch,
      brief.audience,
      brief.referenceUrls,
      brief.colors,
      brief.mustHaveSections,
      brief.contactEmail,
      brief.domain as string,
      "checkout_123",
      "order_123",
      "USD 349.00",
      "USD 366.45",
    ]) {
      expect(body).toContain(value);
    }
    expect(body).not.toContain("<script>");
    expect(body).toContain("&lt;script&gt;");
  });

  it("does not format secrets into the issue body", () => {
    const body = formatOrderIssueBody(makeRecord());
    expect(body).not.toContain("polar_access_secret");
    expect(body).not.toContain("github_token_secret");
  });
});

describe("order storage selection", () => {
  it("prefers Postgres, then the narrow GitHub token", () => {
    expect(
      getOrderStorageConfig({
        DATABASE_URL: "postgres://db",
        GITHUB_ISSUES_TOKEN: "issues",
        GITHUB_TOKEN: "general",
      }),
    ).toEqual({ kind: "postgres", databaseUrl: "postgres://db" });
    expect(
      getOrderStorageConfig({
        GITHUB_ISSUES_TOKEN: "issues",
        GITHUB_TOKEN: "general",
      }),
    ).toEqual({ kind: "github", token: "issues" });
    expect(getOrderStorageConfig({})).toBeNull();
  });
});
