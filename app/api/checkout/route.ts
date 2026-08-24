import { NextResponse } from "next/server";

import { briefFieldErrors, briefSchema } from "@/lib/brief";
import { isOxaPayConfigured, PaymentsConfigurationError } from "@/lib/config";
import {
  isOrderStorageConfigured,
  OrderStorageConfigurationError,
} from "@/lib/orders";
import {
  createHostedCheckout,
  OxaPayApiError,
  OxaPayOfferMismatchError,
} from "@/lib/oxapay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string[]>,
) {
  return NextResponse.json(
    { error: { code, message, ...(fields ? { fields } : {}) } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : typeof error;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "invalid_json", "Send a valid JSON brief.");
  }

  const parsed = briefSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      400,
      "invalid_brief",
      "Complete every required brief field before payment.",
      briefFieldErrors(parsed.error),
    );
  }

  if (!isOxaPayConfigured() || !isOrderStorageConfigured()) {
    return errorResponse(
      503,
      "payments_not_configured",
      "Payments are not configured yet. Please try again later.",
    );
  }

  try {
    const checkout = await createHostedCheckout(parsed.data, request.url);
    return NextResponse.json(
      {
        checkoutId: checkout.checkoutId,
        orderId: checkout.orderId,
        trackId: checkout.trackId,
        checkoutUrl: checkout.url,
        url: checkout.url,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (
      error instanceof PaymentsConfigurationError ||
      error instanceof OrderStorageConfigurationError
    ) {
      return errorResponse(
        503,
        "payments_not_configured",
        "Payments are not configured yet. Please try again later.",
      );
    }
    if (error instanceof OxaPayOfferMismatchError) {
      return errorResponse(
        503,
        "payments_not_configured",
        "The crypto payment is not configured for $349 USD yet.",
      );
    }

    console.error("[Launch48 checkout] OxaPay invoice creation failed.", {
      error: errorName(error),
      providerUnavailable: error instanceof OxaPayApiError,
    });
    return errorResponse(
      502,
      "checkout_unavailable",
      "Crypto checkout is temporarily unavailable. No charge was made.",
    );
  }
}
