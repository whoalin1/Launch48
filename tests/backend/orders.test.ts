import { describe, expect, it } from "vitest";

import { briefSchema } from "../../lib/brief";
import {
  buildPaidOrderRecord,
  decryptCheckoutState,
  formatOrderIssueBody,
  formatOrderIssueTitle,
  formatPendingIssueBody,
  getOrderStorageConfig,
  type StoredOrderRecord,
} from "../../lib/orders";

const stateSecret = "a-strong-checkout-state-secret-at-least-32-chars";
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

const stored: StoredOrderRecord = {
  orderId: "l48-db-0123456789abcdef0123456789abcdef",
  trackId: "184747701",
  status: "pending",
  amountCents: 34_900,
  currency: "usd",
  createdAt: "2026-08-24T18:00:00.000Z",
  paidAt: null,
  paymentEmail: null,
  brief,
};

function makePaidRecord() {
  return buildPaidOrderRecord({
    stored,
    payment: {
      orderId: stored.orderId,
      trackId: stored.trackId as string,
      status: "paid",
      amountCents: 34_900,
      currency: "USD",
      paymentEmail: "billing@example.com",
      verifiedAt: "2026-08-24T18:05:00.000Z",
    },
  });
}

describe("OxaPay order extraction", () => {
  it("promotes a matching pending brief into a paid record", () => {
    expect(makePaidRecord()).toMatchObject({
      orderId: stored.orderId,
      trackId: "184747701",
      status: "paid",
      amountCents: 34_900,
      currency: "usd",
      paymentEmail: "billing@example.com",
      brief,
    });
  });

  it("rejects wrong amount, currency, order, and track identities", () => {
    const base = {
      orderId: stored.orderId,
      trackId: stored.trackId as string,
      status: "paid" as const,
      amountCents: 34_900,
      currency: "usd",
      paymentEmail: null,
      verifiedAt: new Date(),
    };
    const build = (payment: typeof base) =>
      buildPaidOrderRecord({ stored, payment });

    expect(() => build({ ...base, amountCents: 34_899 })).toThrow();
    expect(() => build({ ...base, currency: "eur" })).toThrow();
    expect(() => build({ ...base, orderId: "l48-db-ffffffffffffffffffffffffffffffff" })).toThrow();
    expect(() => build({ ...base, trackId: "999" })).toThrow();
  });
});

describe("encrypted GitHub fallback state", () => {
  it("does not expose an abandoned brief and round-trips with AES-GCM", () => {
    const body = formatPendingIssueBody(stored, stateSecret);
    for (const privateValue of [
      brief.businessName,
      brief.pitch,
      brief.contactEmail,
      brief.referenceUrls,
    ]) {
      expect(body).not.toContain(privateValue);
    }
    expect(decryptCheckoutState(body, stateSecret)).toEqual(stored);
    expect(() => decryptCheckoutState(body, `${stateSecret}!wrong`)).toThrow();
  });

  it("reveals the full brief only in the verified paid issue", () => {
    const record = makePaidRecord();
    const body = formatOrderIssueBody(record, stateSecret);
    expect(formatOrderIssueTitle(record)).toBe("Order: Fieldnote Coffee");
    for (const value of [
      brief.businessName,
      brief.pitch,
      brief.audience,
      brief.referenceUrls,
      brief.colors,
      brief.mustHaveSections,
      brief.contactEmail,
      brief.domain as string,
      stored.orderId,
      stored.trackId as string,
      "USD 349.00",
    ]) {
      expect(body).toContain(value);
    }
    expect(body).not.toContain("<script>");
    expect(body).toContain("&lt;script&gt;");
    expect(body).not.toContain(stateSecret);
  });
});

describe("order storage selection", () => {
  it("prefers Postgres and requires encryption for GitHub fallback", () => {
    expect(
      getOrderStorageConfig({
        DATABASE_URL: "postgres://db",
        GITHUB_ISSUES_TOKEN: "issues",
        CHECKOUT_STATE_SECRET: stateSecret,
      }),
    ).toEqual({ kind: "postgres", databaseUrl: "postgres://db" });
    expect(
      getOrderStorageConfig({
        GITHUB_ISSUES_TOKEN: "issues",
        CHECKOUT_STATE_SECRET: stateSecret,
      }),
    ).toEqual({ kind: "github", token: "issues", stateSecret });
    expect(getOrderStorageConfig({ GITHUB_ISSUES_TOKEN: "issues" })).toBeNull();
    expect(
      getOrderStorageConfig({
        GITHUB_TOKEN: "general-token-is-not-accepted",
        CHECKOUT_STATE_SECRET: stateSecret,
      }),
    ).toBeNull();
    expect(
      getOrderStorageConfig({
        GITHUB_ISSUES_TOKEN: "issues",
        CHECKOUT_STATE_SECRET: "too-short",
      }),
    ).toBeNull();
  });
});
