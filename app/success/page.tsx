import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Footer, Header } from "@/components";
import { getCheckoutConfirmation } from "@/lib/polar";

export const metadata: Metadata = {
  title: "Checkout status — Launch48",
  description: "Confirm the status of your Launch48 checkout.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const POLAR_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type StatusView = {
  kicker: string;
  title: string;
  description: ReactNode;
  ticketLabel: string;
  ticketValue: string;
  payment: string;
  brief: string;
  clock: string;
  stamp: string;
  note?: ReactNode;
  primaryHref: string;
  primaryLabel: string;
};

function StatusPage({ view }: { view: StatusView }) {
  return (
    <>
      <Header />
      <main id="main" aria-live="polite">
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="kicker">{view.kicker}</p>
              <h1>{view.title}</h1>
              <div className="lede">{view.description}</div>
              <div className="hero-actions">
                <a className="btn btn-accent" href={view.primaryHref}>
                  {view.primaryLabel}
                </a>
                {view.primaryHref === "/" ? null : (
                  <a className="btn btn-ghost" href="/">
                    Back to Launch48
                  </a>
                )}
              </div>
              {view.note ? <p className="note">{view.note}</p> : null}
            </div>

            <aside className="ticket" aria-label="Checkout status">
              <div className="ticket-head">
                <span>{view.ticketLabel}</span>
                <span>{view.ticketValue}</span>
              </div>
              <div className="ticket-body">
                <div className="price">
                  $349 <small>USD · one-time</small>
                </div>
                <dl>
                  <div>
                    <dt>Payment</dt>
                    <dd>{view.payment}</dd>
                  </div>
                  <div>
                    <dt>Brief</dt>
                    <dd>{view.brief}</dd>
                  </div>
                  <div>
                    <dt>48-hour clock</dt>
                    <dd>{view.clock}</dd>
                  </div>
                </dl>
                <div className="stamp">{view.stamp}</div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function invalidCheckoutView(reason: "missing" | "invalid"): StatusView {
  return {
    kicker: "Checkout · Action needed",
    title: "We need the checkout link.",
    description:
      reason === "missing" ? (
        <p>
          This page is missing its Polar checkout ID, so it cannot confirm a
          payment.
        </p>
      ) : (
        <p>
          This checkout ID is not valid, so no payment status was looked up.
        </p>
      ),
    ticketLabel: "Checkout status",
    ticketValue: reason === "missing" ? "Missing ID" : "Invalid ID",
    payment: "Not verified",
    brief: "Return to the brief to continue",
    clock: "Not started",
    stamp: "Action needed",
    primaryHref: "/brief",
    primaryLabel: "Return to the brief",
  };
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const checkoutParam = params.checkout_id;
  const checkoutId = Array.isArray(checkoutParam)
    ? checkoutParam[0]
    : checkoutParam;

  if (!checkoutId) {
    return <StatusPage view={invalidCheckoutView("missing")} />;
  }

  if (!POLAR_ID_PATTERN.test(checkoutId)) {
    return <StatusPage view={invalidCheckoutView("invalid")} />;
  }

  let confirmation: Awaited<ReturnType<typeof getCheckoutConfirmation>>;

  try {
    confirmation = await getCheckoutConfirmation(checkoutId);
  } catch {
    return (
      <StatusPage
        view={{
          kicker: "Checkout · Verification",
          title: "We couldn’t confirm this checkout.",
          description: (
            <p>
              The payment lookup failed. If you saw a charge, do not pay again;
              refresh this page and keep your Polar receipt.
            </p>
          ),
          ticketLabel: "Checkout status",
          ticketValue: "Lookup error",
          payment: "Not verified",
          brief: "Submitted before checkout",
          clock: "Waiting for verified payment",
          stamp: "Check again",
          primaryHref: `/success?checkout_id=${encodeURIComponent(checkoutId)}`,
          primaryLabel: "Check again",
        }}
      />
    );
  }

  const polarStatus = String(confirmation.status ?? "").toLowerCase();

  if (
    confirmation.paid &&
    confirmation.state === "paid" &&
    polarStatus === "succeeded"
  ) {
    const contactEmail = confirmation.contactEmail;

    return (
      <StatusPage
        view={{
          kicker: "Order · LP-48",
          title: "Payment confirmed.",
          description: (
            <>
              <p>
                Your brief was submitted before checkout. The 48-hour clock
                starts once that brief is complete, and your $349 payment is now
                confirmed.
              </p>
              <p>
                We’ll email{" "}
                <strong>{contactEmail ?? "the contact address in your brief"}</strong>{" "}
                with any questions and the live page.
              </p>
            </>
          ),
          ticketLabel: "Order status",
          ticketValue: "Paid",
          payment: "Confirmed by Polar",
          brief: "Submitted before checkout",
          clock: "Starts once the brief is complete",
          stamp: "Payment confirmed",
          note:
            "Order fulfillment is triggered by a signed Polar webhook; this page verifies the checkout separately.",
          primaryHref: "/",
          primaryLabel: "Back to Launch48",
        }}
      />
    );
  }

  if (confirmation.state === "not_configured") {
    return (
      <StatusPage
        view={{
          kicker: "Checkout · Configuration",
          title: "Payments not configured.",
          description: (
            <p>
              This server does not have the Polar settings needed to verify a
              checkout. No paid order is being claimed by this page.
            </p>
          ),
          ticketLabel: "Checkout status",
          ticketValue: "Unavailable",
          payment: "Not verified",
          brief: "No change",
          clock: "Not started",
          stamp: "Not configured",
          primaryHref: "/",
          primaryLabel: "Back to Launch48",
        }}
      />
    );
  }

  if (polarStatus === "failed" || polarStatus === "expired") {
    return (
      <StatusPage
        view={{
          kicker: "Checkout · Not completed",
          title:
            polarStatus === "expired"
              ? "This checkout expired."
              : "This payment failed.",
          description: (
            <p>
              Polar did not report a succeeded payment for this checkout. No paid
              Launch48 order has been confirmed, and the 48-hour clock has not
              started.
            </p>
          ),
          ticketLabel: "Checkout status",
          ticketValue: polarStatus,
          payment: "Not completed",
          brief: "Submitted before checkout",
          clock: "Not started",
          stamp: polarStatus,
          primaryHref: "/brief",
          primaryLabel: "Return to the brief",
        }}
      />
    );
  }

  if (
    confirmation.state === "pending" ||
    polarStatus === "confirmed" ||
    polarStatus === "open"
  ) {
    return (
      <StatusPage
        view={{
          kicker: "Checkout · Processing",
          title: "Payment is still processing.",
          description: (
            <p>
              Polar has not returned a succeeded payment status yet. A confirmed
              or open checkout is not treated as paid, and the 48-hour clock has
              not started.
            </p>
          ),
          ticketLabel: "Checkout status",
          ticketValue: polarStatus || "Processing",
          payment: "Awaiting succeeded status",
          brief: "Submitted before checkout",
          clock: "Starts after payment and a complete brief",
          stamp: "Processing",
          primaryHref: `/success?checkout_id=${encodeURIComponent(checkoutId)}`,
          primaryLabel: "Check again",
        }}
      />
    );
  }

  return (
    <StatusPage
      view={{
        kicker: "Checkout · Verification",
        title: "We couldn’t confirm this checkout.",
        description: (
          <p>
            We could not verify a succeeded $349 Launch48 payment for this
            checkout. If you saw a charge, do not pay again; refresh this page and
            keep your Polar receipt.
          </p>
        ),
        ticketLabel: "Checkout status",
        ticketValue: "Not verified",
        payment: "Not confirmed",
        brief: "Submitted before checkout",
        clock: "Waiting for verified payment",
        stamp: "Check again",
        primaryHref: `/success?checkout_id=${encodeURIComponent(checkoutId)}`,
        primaryLabel: "Check again",
      }}
    />
  );
}
