import { Polar } from "@polar-sh/sdk";

import { fromPolarMetadata, toPolarMetadata, type Brief } from "./brief";
import {
  getPolarConfig,
  isPolarConfigured,
  PaymentsConfigurationError,
  type PolarConfig,
} from "./config";

export { isPolarConfigured } from "./config";

export const LAUNCH48_PRODUCT_NAME = "Launch48 landing page";
export const LAUNCH48_PRICE_CENTS = 34_900;
export const LAUNCH48_CURRENCY = "usd";

export type HostedCheckout = {
  checkoutId: string;
  url: string;
};

export type CheckoutConfirmationState =
  | "paid"
  | "pending"
  | "failed"
  | "not_found"
  | "not_configured"
  | "error";

export type CheckoutConfirmation = {
  checkoutId: string;
  paid: boolean;
  state: CheckoutConfirmationState;
  status: string;
  contactEmail: string | null;
};

function makePolar(config: PolarConfig): Polar {
  return new Polar({
    accessToken: config.accessToken,
    server: config.server,
  });
}

function normalizeOrigin(origin: string): string {
  const parsed = new URL(origin);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new TypeError("Checkout origin must use HTTP or HTTPS.");
  }
  return parsed.origin;
}

type OfferCheckout = {
  productId: string | null;
  product: { name: string; isRecurring: boolean } | null;
  amount: number;
  currency: string;
  discountId: string | null;
  discountAmount: number;
  allowDiscountCodes: boolean;
};

export function checkoutMatchesLaunch48Offer(
  checkout: OfferCheckout,
  productId: string,
): boolean {
  return (
    checkout.productId === productId &&
    checkout.product?.name === LAUNCH48_PRODUCT_NAME &&
    checkout.product.isRecurring === false &&
    checkout.amount === LAUNCH48_PRICE_CENTS &&
    checkout.currency.toLowerCase() === LAUNCH48_CURRENCY &&
    checkout.discountId === null &&
    checkout.discountAmount === 0 &&
    checkout.allowDiscountCodes === false
  );
}

export async function createHostedCheckout(
  brief: Brief,
  origin: string,
): Promise<HostedCheckout> {
  const config = getPolarConfig();
  const siteOrigin = normalizeOrigin(origin);
  const polar = makePolar(config);
  const checkout = await polar.checkouts.create({
    products: [config.productId],
    customerEmail: brief.contactEmail,
    metadata: toPolarMetadata(brief),
    successUrl: `${siteOrigin}/success?checkout_id={CHECKOUT_ID}`,
    returnUrl: `${siteOrigin}/brief`,
    allowDiscountCodes: false,
    discountId: null,
    allowTrial: false,
  });

  if (!checkoutMatchesLaunch48Offer(checkout, config.productId)) {
    throw new PolarProductConfigurationError();
  }

  return { checkoutId: checkout.id, url: checkout.url };
}

export class PolarProductConfigurationError extends Error {
  readonly code = "product_misconfigured";

  constructor() {
    super("The configured Polar product does not match the Launch48 offer.");
    this.name = "PolarProductConfigurationError";
  }
}

function statusCodeOf(error: unknown): number | null {
  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }
  return null;
}

export async function getCheckoutConfirmation(
  checkoutId: string,
): Promise<CheckoutConfirmation> {
  const cleanCheckoutId = checkoutId.trim();
  if (!cleanCheckoutId || cleanCheckoutId.length > 200) {
    return {
      checkoutId: cleanCheckoutId,
      paid: false,
      state: "not_found",
      status: "not_found",
      contactEmail: null,
    };
  }

  let config: PolarConfig;
  try {
    config = getPolarConfig();
  } catch (error) {
    if (error instanceof PaymentsConfigurationError) {
      return {
        checkoutId: cleanCheckoutId,
        paid: false,
        state: "not_configured",
        status: "not_configured",
        contactEmail: null,
      };
    }
    return {
      checkoutId: cleanCheckoutId,
      paid: false,
      state: "error",
      status: "error",
      contactEmail: null,
    };
  }

  try {
    const checkout = await makePolar(config).checkouts.get({ id: cleanCheckoutId });
    const brief = fromPolarMetadata(checkout.metadata);
    const contactEmail = brief?.contactEmail ?? null;

    if (!checkoutMatchesLaunch48Offer(checkout, config.productId)) {
      return {
        checkoutId: cleanCheckoutId,
        paid: false,
        state: "error",
        status: "offer_mismatch",
        contactEmail,
      };
    }

    if (checkout.status === "succeeded") {
      return {
        checkoutId: cleanCheckoutId,
        paid: true,
        state: "paid",
        status: checkout.status,
        contactEmail,
      };
    }

    const failed = checkout.status === "failed" || checkout.status === "expired";
    return {
      checkoutId: cleanCheckoutId,
      paid: false,
      state: failed ? "failed" : "pending",
      status: checkout.status,
      contactEmail,
    };
  } catch (error) {
    const notFound = statusCodeOf(error) === 404;
    return {
      checkoutId: cleanCheckoutId,
      paid: false,
      state: notFound ? "not_found" : "error",
      status: notFound ? "not_found" : "error",
      contactEmail: null,
    };
  }
}

// Keep the re-export exercised so accidental removal is caught by TypeScript.
void isPolarConfigured;
