import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RAMPEX_API_URL = "https://api.rampex.io/api-create-payment-link";
const LAUNCH48_PRICE = 149.0;
const LAUNCH48_CURRENCY = "USD";
const LAUNCH48_DESCRIPTION = "Launch48 — Custom Website Build";
const DEFAULT_EMAIL = "customers@launch48.space";

export const VALID_PROVIDERS = [
  "stripe",
  "transak",
  "paypal",
  "coinbase",
  "revolut",
  "cashapp",
  "klarna",
  "hosted",
] as const;

export type ValidProvider = (typeof VALID_PROVIDERS)[number];

interface RampexCreateResponse {
  success: boolean;
  data?: {
    link_id: string;
    redirect_url: string;
    payment_url: string;
    amount: number;
    currency: string;
    status: string;
    short_code?: string;
    short_url?: string;
  };
  error?: {
    code?: string;
    message?: string;
  };
}

async function createRampexCheckout(
  customerEmail?: string,
  provider: string = "transak",
  returnUrl?: string
) {
  const apiKey = process.env.RAMPEX_API_KEY;

  if (!apiKey) {
    const fallbackUrl = process.env.NEXT_PUBLIC_CARD_PAYMENT_URL;
    if (fallbackUrl) {
      return { redirectUrl: fallbackUrl };
    }
    throw new Error("RAMPEX_API_KEY is not configured on the server");
  }

  const selectedProvider: ValidProvider = VALID_PROVIDERS.includes(
    provider as ValidProvider
  )
    ? (provider as ValidProvider)
    : "transak";

  const payload: Record<string, unknown> = {
    amount: LAUNCH48_PRICE,
    currency: LAUNCH48_CURRENCY,
    customer_email: customerEmail || DEFAULT_EMAIL,
    description: LAUNCH48_DESCRIPTION,
    provider: selectedProvider,
  };

  if (returnUrl) {
    payload.payment_url = returnUrl;
  }

  const response = await fetch(RAMPEX_API_URL, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as RampexCreateResponse;

  if (!response.ok || !data.success || !data.data?.redirect_url) {
    const errorMsg = data.error?.message || "Failed to create Rampex checkout session";
    throw new Error(errorMsg);
  }

  let finalRedirectUrl = data.data.redirect_url;
  try {
    const directRes = await fetch(`${finalRedirectUrl}&second_step=1`);
    if (directRes.ok) {
      const directData = (await directRes.json()) as { url?: string };
      if (directData?.url) {
        finalRedirectUrl = directData.url;
      }
    }
  } catch {
    // If direct resolution fails, finalRedirectUrl fallback handles it automatically
  }

  return {
    redirectUrl: finalRedirectUrl,
    linkId: data.data.link_id,
    shortUrl: data.data.short_url,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const provider = searchParams.get("provider") || "transak";
    const returnUrl = `${origin}/success`;
    const result = await createRampexCheckout(undefined, provider, returnUrl);
    return NextResponse.redirect(result.redirectUrl, 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    let customerEmail: string | undefined;
    let provider: string | undefined;
    try {
      const body = (await request.json()) as { email?: string; provider?: string };
      customerEmail = body.email;
      provider = body.provider;
    } catch {
      // Empty or non-JSON body is acceptable
    }

    const chosenProvider = provider || searchParams.get("provider") || "transak";
    const returnUrl = `${origin}/success`;
    const result = await createRampexCheckout(customerEmail, chosenProvider, returnUrl);
    return NextResponse.json({ success: true, url: result.redirectUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
