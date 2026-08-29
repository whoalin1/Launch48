import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const OXAPAY_API_URL = "https://api.oxapay.com/v1/payment/invoice";
const LAUNCH48_PRICE = 149.0;
const LAUNCH48_CURRENCY = "USD";
const LAUNCH48_DESCRIPTION = "Launch48 — Custom Website Build";

interface OxaPayInvoiceResponse {
  status: number;
  message?: string;
  data?: {
    track_id?: string;
    payment_url?: string;
    expired_at?: number;
    date?: number;
  };
  error?: Record<string, unknown>;
}

export async function GET(request: Request) {
  try {
    const { origin } = new URL(request.url);
    const apiKey = process.env.OXAPAY_MERCHANT_KEY;

    if (!apiKey) {
      const fallbackUrl = process.env.NEXT_PUBLIC_OXAPAY_PAYMENT_URL;
      if (fallbackUrl && fallbackUrl !== "https://app.oxapay.com/payment/your-payment-link") {
        return NextResponse.redirect(fallbackUrl, 303);
      }
      throw new Error("OXAPAY_MERCHANT_KEY is not configured on the server");
    }

    const payload = {
      amount: LAUNCH48_PRICE,
      currency: LAUNCH48_CURRENCY,
      description: LAUNCH48_DESCRIPTION,
      return_url: `${origin}/success`,
    };

    const response = await fetch(OXAPAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchant_api_key: apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as OxaPayInvoiceResponse;

    if (!response.ok || data.status !== 200 || !data.data?.payment_url) {
      const errorMsg = data.message || "Failed to create OxaPay invoice";
      throw new Error(errorMsg);
    }

    return NextResponse.redirect(data.data.payment_url, 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
