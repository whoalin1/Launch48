import { NextResponse } from "next/server";

import { getOxaPayConfig, PaymentsConfigurationError } from "../../../../lib/config";
import {
  fulfillPaidOrder,
  isLaunch48OrderId,
  OrderNotFoundError,
} from "../../../../lib/orders";
import {
  getOxaPayPaymentInformation,
  OxaPayApiError,
  OxaPayOfferMismatchError,
  validateLaunch48PaymentInformation,
  verifyOxaPayWebhookSignature,
} from "../../../../lib/oxapay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function textResponse(body: string, status: number) {
  return new NextResponse(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

function safeErrorName(error: unknown): string {
  return error instanceof Error ? error.name : typeof error;
}

function stringValue(value: unknown): string | null {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) {
    return String(value);
  }
  return null;
}

export async function POST(request: Request) {
  let config;
  try {
    config = getOxaPayConfig();
  } catch (error) {
    if (error instanceof PaymentsConfigurationError) {
      return textResponse("Payments not configured", 503);
    }
    return textResponse("Payments unavailable", 503);
  }

  const rawBody = await request.text();
  if (
    !verifyOxaPayWebhookSignature(
      rawBody,
      request.headers.get("hmac"),
      config.merchantApiKey,
    )
  ) {
    return textResponse("Invalid signature", 403);
  }

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return textResponse("OK", 200);
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    // A signed but unusable delivery cannot become an order and should not loop.
    return textResponse("OK", 200);
  }

  const type = stringValue(payload.type)?.toLowerCase();
  const callbackStatus = stringValue(payload.status)?.toLowerCase();
  const trackId = stringValue(payload.track_id);
  const callbackOrderId = stringValue(payload.order_id);
  if (
    type !== "invoice" ||
    callbackStatus !== "paid" ||
    !trackId ||
    !/^\d{1,30}$/.test(trackId) ||
    !callbackOrderId ||
    !isLaunch48OrderId(callbackOrderId)
  ) {
    return textResponse("OK", 200);
  }

  let payment;
  try {
    payment = await getOxaPayPaymentInformation(trackId, config);
    validateLaunch48PaymentInformation(payment, {
      orderId: callbackOrderId,
      trackId,
      sandbox: config.sandbox,
    });
  } catch (error) {
    if (error instanceof OxaPayOfferMismatchError) {
      // Valid OxaPay delivery, but not this fixed-price offer.
      return textResponse("OK", 200);
    }
    console.error("[Launch48 webhook] OxaPay verification failed.", {
      trackId,
      error: safeErrorName(error),
      providerUnavailable: error instanceof OxaPayApiError,
    });
    return textResponse("Retry", 503);
  }

  if (payment.status !== "paid") {
    // OxaPay can deliver the signed Paid callback just before its read API
    // converges. Ask for a retry instead of permanently acknowledging it.
    return textResponse("Retry", 503);
  }

  try {
    await fulfillPaidOrder({
      orderId: payment.orderId,
      trackId: payment.trackId,
      status: "paid",
      amountCents: payment.amountCents,
      currency: payment.currency,
      paymentEmail: payment.email,
      verifiedAt: new Date(),
    });
  } catch (error) {
    // Do not log the signed payload, brief, email, or any secret. A transient
    // storage failure gets a non-200 so OxaPay can retry fulfillment safely.
    console.error("[Launch48 webhook] Paid order persistence failed.", {
      orderId: payment.orderId,
      trackId: payment.trackId,
      missingOrder: error instanceof OrderNotFoundError,
      error: safeErrorName(error),
    });
    return textResponse("Retry", 503);
  }

  return textResponse("OK", 200);
}
