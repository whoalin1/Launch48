import { createHmac, timingSafeEqual } from "node:crypto";

import type { Brief } from "./brief";
import {
  getOxaPayConfig,
  PaymentsConfigurationError,
  type OxaPayConfig,
} from "./config";
import {
  LAUNCH48_CURRENCY,
  LAUNCH48_PRICE_CENTS,
  LAUNCH48_PRICE_USD,
  LAUNCH48_PRODUCT_NAME,
} from "./offer";
import {
  attachOxaPayInvoice,
  fulfillPaidOrder,
  loadStoredOrder,
  OrderStorageConfigurationError,
  persistPendingOrder,
} from "./orders";

const OXAPAY_API_ORIGIN = "https://api.oxapay.com";
const OXAPAY_PAYMENT_HOST = "pay.oxapay.com";
const PRODUCTION_SITE_ORIGIN = "https://launch48-psi.vercel.app";

type Environment = Record<string, string | undefined>;

export type HostedCheckout = {
  checkoutId: string;
  orderId: string;
  trackId: string;
  url: string;
};

export type OxaPayPaymentInformation = {
  trackId: string;
  orderId: string;
  type: string;
  status: string;
  amountCents: number;
  currency: string;
  email: string | null;
  description: string;
  sandbox: boolean;
};

export type PaymentConfirmationState =
  | "paid"
  | "pending"
  | "failed"
  | "not_found"
  | "not_configured"
  | "error";

export type PaymentConfirmation = {
  orderId: string;
  trackId: string | null;
  paid: boolean;
  state: PaymentConfirmationState;
  status: string;
  contactEmail: string | null;
};

export class OxaPayApiError extends Error {
  constructor(message = "OxaPay is temporarily unavailable.") {
    super(message);
    this.name = "OxaPayApiError";
  }
}

export class OxaPayPaymentNotFoundError extends OxaPayApiError {
  constructor() {
    super("OxaPay payment was not found.");
    this.name = "OxaPayPaymentNotFoundError";
  }
}

export class OxaPayOfferMismatchError extends Error {
  readonly code = "offer_mismatch";

  constructor(message = "The OxaPay invoice does not match the Launch48 offer.") {
    super(message);
    this.name = "OxaPayOfferMismatchError";
  }
}

function normalizeUrlOrigin(value: string, label: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new PaymentsConfigurationError([`${label} must be a valid URL`]);
  }

  const localhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  if (
    parsed.username ||
    parsed.password ||
    (parsed.protocol !== "https:" && !(localhost && parsed.protocol === "http:"))
  ) {
    throw new PaymentsConfigurationError([
      `${label} must use HTTPS (HTTP is allowed only on localhost)`,
    ]);
  }
  return parsed.origin;
}

/**
 * Never derives production callback URLs from an attacker-controlled Host.
 * SITE_URL wins; localhost is allowed in development; otherwise use production.
 */
export function resolveSiteOrigin(
  requestUrl: string,
  env: Environment = process.env,
): string {
  const configured = env.SITE_URL?.trim();
  if (configured) return normalizeUrlOrigin(configured, "SITE_URL");

  try {
    const requested = new URL(requestUrl);
    if (
      env.NODE_ENV !== "production" &&
      (requested.hostname === "localhost" || requested.hostname === "127.0.0.1")
    ) {
      return normalizeUrlOrigin(requested.origin, "Request URL");
    }
  } catch {
    // A malformed request URL cannot influence the trusted production fallback.
  }
  return PRODUCTION_SITE_ORIGIN;
}

function integerString(value: unknown): string | null {
  if (typeof value === "string" && /^\d{1,30}$/.test(value)) return value;
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) {
    return String(value);
  }
  return null;
}

export function usdAmountToCents(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const normalized = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

function objectData(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }
  const data = (payload as Record<string, unknown>).data;
  return data && typeof data === "object" && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : null;
}

export function parseOxaPayPaymentInformation(
  payload: unknown,
): OxaPayPaymentInformation {
  const data = objectData(payload);
  if (!data) throw new OxaPayApiError("OxaPay returned an invalid response.");

  const trackId = integerString(data.track_id);
  const orderId = typeof data.order_id === "string" ? data.order_id : null;
  const type = typeof data.type === "string" ? data.type : null;
  const status = typeof data.status === "string" ? data.status : null;
  const amountCents = usdAmountToCents(data.amount);
  const currency = typeof data.currency === "string" ? data.currency : null;
  const description =
    typeof data.description === "string" ? data.description : null;
  const sandbox = typeof data.sandbox === "boolean" ? data.sandbox : null;
  const email =
    typeof data.email === "string" && data.email.trim()
      ? data.email.trim()
      : null;

  if (
    !trackId ||
    !orderId ||
    !type ||
    !status ||
    amountCents === null ||
    !currency ||
    !description ||
    sandbox === null
  ) {
    throw new OxaPayApiError("OxaPay returned incomplete payment information.");
  }

  return {
    trackId,
    orderId,
    type: type.toLowerCase(),
    status: status.toLowerCase(),
    amountCents,
    currency: currency.toLowerCase(),
    email,
    description,
    sandbox,
  };
}

export function validateLaunch48PaymentInformation(
  payment: OxaPayPaymentInformation,
  expected: { orderId: string; trackId: string; sandbox: boolean },
): void {
  if (
    payment.type !== "invoice" ||
    payment.orderId !== expected.orderId ||
    payment.trackId !== expected.trackId ||
    payment.amountCents !== LAUNCH48_PRICE_CENTS ||
    payment.currency !== LAUNCH48_CURRENCY ||
    payment.description !== LAUNCH48_PRODUCT_NAME ||
    payment.sandbox !== expected.sandbox
  ) {
    throw new OxaPayOfferMismatchError();
  }
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new OxaPayApiError("OxaPay returned an unreadable response.");
  }
}

function oxaPayHeaders(config: OxaPayConfig): HeadersInit {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    merchant_api_key: config.merchantApiKey,
  };
}

export async function getOxaPayPaymentInformation(
  trackId: string,
  config: OxaPayConfig = getOxaPayConfig(),
): Promise<OxaPayPaymentInformation> {
  if (!/^\d{1,30}$/.test(trackId)) {
    throw new OxaPayPaymentNotFoundError();
  }
  const response = await fetch(
    `${OXAPAY_API_ORIGIN}/v1/payment/${encodeURIComponent(trackId)}`,
    {
      method: "GET",
      headers: oxaPayHeaders(config),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (response.status === 404 || response.status === 400) {
    throw new OxaPayPaymentNotFoundError();
  }
  if (!response.ok) throw new OxaPayApiError();
  return parseOxaPayPaymentInformation(await parseJsonResponse(response));
}

function parseHostedInvoice(payload: unknown): { trackId: string; url: string } {
  const data = objectData(payload);
  if (!data) throw new OxaPayApiError("OxaPay returned an invalid invoice response.");
  const trackId = integerString(data.track_id);
  const paymentUrl = typeof data.payment_url === "string" ? data.payment_url : null;
  if (!trackId || !paymentUrl) {
    throw new OxaPayApiError("OxaPay did not return a hosted invoice.");
  }

  let parsed: URL;
  try {
    parsed = new URL(paymentUrl);
  } catch {
    throw new OxaPayApiError("OxaPay returned an invalid hosted invoice URL.");
  }
  if (parsed.protocol !== "https:" || parsed.hostname.toLowerCase() !== OXAPAY_PAYMENT_HOST) {
    throw new OxaPayApiError("OxaPay returned an untrusted hosted invoice URL.");
  }
  return { trackId, url: parsed.toString() };
}

export async function createHostedCheckout(
  brief: Brief,
  requestUrl: string,
  env: Environment = process.env,
): Promise<HostedCheckout> {
  const config = getOxaPayConfig(env);
  const siteOrigin = resolveSiteOrigin(requestUrl, env);

  // The brief is durable before a payable URL is ever shown to the customer.
  const pending = await persistPendingOrder(brief, env);
  const response = await fetch(`${OXAPAY_API_ORIGIN}/v1/payment/invoice`, {
    method: "POST",
    headers: oxaPayHeaders(config),
    body: JSON.stringify({
      amount: LAUNCH48_PRICE_USD,
      currency: "USD",
      lifetime: 60,
      fee_paid_by_payer: 0,
      under_paid_coverage: 0,
      mixed_payment: false,
      callback_url: `${siteOrigin}/api/webhooks/oxapay`,
      return_url: `${siteOrigin}/success?order_id=${encodeURIComponent(pending.orderId)}`,
      email: brief.contactEmail,
      order_id: pending.orderId,
      thanks_message: "Payment received. Return to Launch48 to confirm your order.",
      description: LAUNCH48_PRODUCT_NAME,
      sandbox: config.sandbox,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new OxaPayApiError();
  const hosted = parseHostedInvoice(await parseJsonResponse(response));
  await attachOxaPayInvoice(pending.orderId, hosted.trackId, env);

  return {
    checkoutId: pending.orderId,
    orderId: pending.orderId,
    trackId: hosted.trackId,
    url: hosted.url,
  };
}

export function verifyOxaPayWebhookSignature(
  rawBody: string,
  signature: string | null,
  merchantApiKey: string,
): boolean {
  if (!signature || !/^[a-fA-F0-9]{128}$/.test(signature)) return false;
  const expected = createHmac("sha512", merchantApiKey)
    .update(rawBody, "utf8")
    .digest();
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function confirmation(
  orderId: string,
  values: Partial<PaymentConfirmation> &
    Pick<PaymentConfirmation, "paid" | "state" | "status">,
): PaymentConfirmation {
  return {
    orderId,
    trackId: values.trackId ?? null,
    paid: values.paid,
    state: values.state,
    status: values.status,
    contactEmail: values.contactEmail ?? null,
  };
}

export async function getPaymentConfirmation(
  orderId: string,
  env: Environment = process.env,
): Promise<PaymentConfirmation> {
  const cleanOrderId = orderId.trim();
  if (!/^l48-(?:db-[a-f0-9]{32}|gh-\d+-[a-f0-9]{32})$/.test(cleanOrderId)) {
    return confirmation(cleanOrderId, {
      paid: false,
      state: "not_found",
      status: "not_found",
    });
  }

  try {
    const config = getOxaPayConfig(env);
    const stored = await loadStoredOrder(cleanOrderId, env);
    if (!stored) {
      return confirmation(cleanOrderId, {
        paid: false,
        state: "not_found",
        status: "not_found",
      });
    }
    if (stored.status === "paid") {
      return confirmation(cleanOrderId, {
        trackId: stored.trackId,
        paid: true,
        state: "paid",
        status: "paid",
        contactEmail: stored.brief.contactEmail,
      });
    }
    if (!stored.trackId) {
      return confirmation(cleanOrderId, {
        paid: false,
        state: "pending",
        status: "invoice_pending",
        contactEmail: stored.brief.contactEmail,
      });
    }

    const payment = await getOxaPayPaymentInformation(stored.trackId, config);
    validateLaunch48PaymentInformation(payment, {
      orderId: stored.orderId,
      trackId: stored.trackId,
      sandbox: config.sandbox,
    });
    const paid = payment.status === "paid";
    const failed = ["expired", "refunding", "refunded", "failed"].includes(
      payment.status,
    );
    if (paid) {
      await fulfillPaidOrder(
        {
          orderId: payment.orderId,
          trackId: payment.trackId,
          status: "paid",
          amountCents: payment.amountCents,
          currency: payment.currency,
          paymentEmail: payment.email,
          verifiedAt: new Date(),
        },
        env,
      );
    }
    return confirmation(cleanOrderId, {
      trackId: stored.trackId,
      paid,
      state: paid ? "paid" : failed ? "failed" : "pending",
      status: payment.status,
      contactEmail: stored.brief.contactEmail,
    });
  } catch (error) {
    if (
      error instanceof PaymentsConfigurationError ||
      error instanceof OrderStorageConfigurationError
    ) {
      return confirmation(cleanOrderId, {
        paid: false,
        state: "not_configured",
        status: "not_configured",
      });
    }
    if (error instanceof OxaPayPaymentNotFoundError) {
      return confirmation(cleanOrderId, {
        paid: false,
        state: "not_found",
        status: "not_found",
      });
    }
    return confirmation(cleanOrderId, {
      paid: false,
      state: "error",
      status: error instanceof OxaPayOfferMismatchError ? "offer_mismatch" : "error",
    });
  }
}
