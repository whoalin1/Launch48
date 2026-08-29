import "server-only";

const FALLBACK_SITE_URL = "http://localhost:3000";

function parseHttpsUrl(value: string | undefined) {
  if (!value) return undefined;

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}

function parseOxaPayUrl(value: string | undefined) {
  const url = parseHttpsUrl(value);
  if (!url) return undefined;

  const hostname = url.hostname.toLowerCase();
  const isOxaPay = hostname === "oxapay.com" || hostname.endsWith(".oxapay.com");

  return isOxaPay ? url.toString() : undefined;
}

const configuredSiteUrl = parseHttpsUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const siteConfig = {
  name: "Launch48",
  description:
    "High-quality websites delivered in 48 hours for $149, including three revisions.",
  email: "customers@launch48.space",
  siteUrl: configuredSiteUrl?.toString() ?? FALLBACK_SITE_URL,
  checkoutUrl:
    parseOxaPayUrl(process.env.NEXT_PUBLIC_OXAPAY_PAYMENT_URL) ??
    "/api/checkout/crypto",
  cardCheckoutUrl:
    parseHttpsUrl(process.env.NEXT_PUBLIC_CARD_PAYMENT_URL)?.toString() ??
    "/api/checkout/card",
} as const;
