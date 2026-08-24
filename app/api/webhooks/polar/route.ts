import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { NextResponse } from "next/server";

import { getPolarConfig, PaymentsConfigurationError } from "@/lib/config";
import { buildPaidOrderRecord, persistPaidOrder } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function response(status: number, code: string, message: string) {
  return NextResponse.json(
    { received: status === 200, error: status === 200 ? undefined : { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function safeErrorName(error: unknown): string {
  return error instanceof Error ? error.name : typeof error;
}

export async function POST(request: Request) {
  let config;
  try {
    config = getPolarConfig();
  } catch (error) {
    if (error instanceof PaymentsConfigurationError) {
      return response(
        503,
        "payments_not_configured",
        "Polar webhook verification is not configured.",
      );
    }
    return response(503, "payments_not_configured", "Payments are unavailable.");
  }

  const rawBody = await request.text();
  const signatureHeaders: Record<string, string> = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
  };

  let event;
  try {
    event = validateEvent(rawBody, signatureHeaders, config.webhookSecret);
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return response(403, "invalid_signature", "Invalid Polar webhook signature.");
    }

    // The signature library accepted the delivery, but the event schema was not
    // actionable. Acknowledge it so Polar does not retry an unusable payload.
    console.error("[Launch48 webhook] Verified payload could not be parsed.", {
      error: safeErrorName(error),
    });
    return response(200, "ignored_event", "Event ignored.");
  }

  if (event.type !== "order.paid" || event.data.productId !== config.productId) {
    return response(200, "ignored_event", "Event ignored.");
  }

  try {
    const order = buildPaidOrderRecord({
      order: event.data,
      expectedProductId: config.productId,
      webhookId: signatureHeaders["webhook-id"],
      paidAt: event.timestamp,
    });
    await persistPaidOrder(order);
  } catch (error) {
    // Never log the brief, customer email, tokens, or request body. A verified
    // delivery is still acknowledged to avoid an endless retry loop.
    console.error("[Launch48 webhook] Paid order processing failed.", {
      orderId: event.data.id,
      checkoutId: event.data.checkoutId,
      error: safeErrorName(error),
    });
  }

  return response(200, "accepted", "Event accepted.");
}
