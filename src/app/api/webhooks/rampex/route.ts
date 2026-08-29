import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

interface RampexWebhookPayload {
  event?: string;
  link_id?: string;
  payment_link_id?: string;
  status?: string;
  amount?: number;
  currency?: string;
  customer_email?: string;
  description?: string;
  transaction_hash?: string;
  paid_at?: string;
}

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  try {
    const hmac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const secret = process.env.RAMPEX_WEBHOOK_SECRET;

  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");

  // If secret is configured, enforce strict HMAC verification
  if (secret && !verifySignature(rawBody, signature, secret)) {
    console.warn("[Rampex Webhook] Invalid signature rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: RampexWebhookPayload = {};
  try {
    payload = JSON.parse(rawBody) as RampexWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const event = payload.event || payload.status;
  console.log(`[Rampex Webhook] Received event: ${event}`, {
    link_id: payload.link_id,
    amount: payload.amount,
    currency: payload.currency,
    customer_email: payload.customer_email,
  });

  if (event === "payment.completed" || payload.status === "completed") {
    // Payment verified and completed
    console.log(
      `[Launch48] Confirmed payment of $${payload.amount} ${payload.currency} for order ${payload.link_id}`
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
