import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Footer, Header } from "@/components";
import { getPaymentConfirmation } from "@/lib/oxapay";

export const metadata: Metadata = {
  title: "Payment status — Launch48",
  description: "Confirm the status of your Launch48 crypto payment.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const ORDER_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$/;

type SuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ConfirmationView = {
  state?: string;
  status?: string;
  paid?: boolean;
  contactEmail?: string | null;
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

function displayStatus(value: string, fallback: string): string {
  if (!value) return fallback;
  const readable = value.replaceAll("_", " ");
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

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

            <aside className="ticket" aria-label="Payment status">
              <div className="ticket-head">
                <span>{view.ticketLabel}</span>
                <span>{view.ticketValue}</span>
              </div>
              <div className="ticket-body">
                <div className="price">
                  $349 <small>USD · crypto only</small>
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

function invalidOrderView(reason: "missing" | "invalid"): StatusView {
  return {
    kicker: "Payment · Action needed",
    title: "We need the order link.",
    description:
      reason === "missing" ? (
        <p>
          This page is missing its order ID, so it cannot verify a crypto
          payment.
        </p>
      ) : (
        <p>
          This order ID is not valid, so no payment status was looked up.
        </p>
      ),
    ticketLabel: "Payment status",
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
  const orderParam = params.order_id;
  const orderId = Array.isArray(orderParam) ? orderParam[0] : orderParam;

  if (!orderId) {
    return <StatusPage view={invalidOrderView("missing")} />;
  }

  if (!ORDER_ID_PATTERN.test(orderId)) {
    return <StatusPage view={invalidOrderView("invalid")} />;
  }

  let confirmation: ConfirmationView;

  try {
    confirmation = (await getPaymentConfirmation(orderId)) as ConfirmationView;
  } catch {
    return (
      <StatusPage
        view={{
          kicker: "Payment · Verification",
          title: "We couldn’t confirm this payment.",
          description: (
            <p>
              The payment lookup failed. If you already sent crypto, do not pay
              again; keep your OxaPay receipt and check this page again.
            </p>
          ),
          ticketLabel: "Payment status",
          ticketValue: "Lookup error",
          payment: "Not verified",
          brief: "Submitted before checkout",
          clock: "Waiting for verified payment",
          stamp: "Check again",
          primaryHref: `/success?order_id=${encodeURIComponent(orderId)}`,
          primaryLabel: "Check again",
        }}
      />
    );
  }

  const state = String(confirmation.state ?? "").toLowerCase();
  const paymentStatus = String(confirmation.status ?? state).toLowerCase();

  if (confirmation.paid === true && state === "paid") {
    return (
      <StatusPage
        view={{
          kicker: "Order · LP-48",
          title: "Payment confirmed.",
          description: (
            <>
              <p>
                Your brief was submitted before checkout. Your $349 crypto
                payment is confirmed, and the 48-hour clock starts once that
                brief is complete.
              </p>
              <p>
                We’ll email{" "}
                <strong>
                  {confirmation.contactEmail ??
                    "the contact address in your brief"}
                </strong>{" "}
                with any questions and the live page.
              </p>
            </>
          ),
          ticketLabel: "Order status",
          ticketValue: "Paid",
          payment: "Confirmed by OxaPay",
          brief: "Submitted before checkout",
          clock: "Starts once the brief is complete",
          stamp: "Payment confirmed",
          note:
            "This page verifies the payment server-side; fulfillment is also protected by OxaPay’s signed webhook.",
          primaryHref: "/",
          primaryLabel: "Back to Launch48",
        }}
      />
    );
  }

  if (state === "not_configured") {
    return (
      <StatusPage
        view={{
          kicker: "Payment · Configuration",
          title: "Payments not configured.",
          description: (
            <p>
              This server does not have the OxaPay settings needed to verify a
              payment. No paid order is being claimed by this page.
            </p>
          ),
          ticketLabel: "Payment status",
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

  if (state === "not_found") {
    return (
      <StatusPage
        view={{
          kicker: "Payment · Verification",
          title: "We couldn’t find this order.",
          description: (
            <p>
              No stored Launch48 order matches this link, so no crypto payment
              has been confirmed here.
            </p>
          ),
          ticketLabel: "Payment status",
          ticketValue: "Order not found",
          payment: "Not verified",
          brief: "Not found",
          clock: "Not started",
          stamp: "Action needed",
          primaryHref: "/brief",
          primaryLabel: "Start a new brief",
        }}
      />
    );
  }

  if (paymentStatus === "expired" || state === "expired") {
    return (
      <StatusPage
        view={{
          kicker: "Payment · Not completed",
          title: "This crypto invoice expired.",
          description: (
            <p>
              OxaPay did not confirm a paid $349 invoice. No paid Launch48 order
              has been confirmed, and the 48-hour clock has not started.
            </p>
          ),
          ticketLabel: "Payment status",
          ticketValue: "Expired",
          payment: "Not completed",
          brief: "Submitted before checkout",
          clock: "Not started",
          stamp: "Expired",
          primaryHref: "/brief",
          primaryLabel: "Start a new brief",
        }}
      />
    );
  }

  if (
    state === "pending" ||
    ["new", "waiting", "paying", "underpaid", "manual_accept"].includes(
      paymentStatus,
    )
  ) {
    return (
      <StatusPage
        view={{
          kicker: "Payment · Processing",
          title: "Payment is not confirmed yet.",
          description: (
            <p>
              OxaPay has not reported this invoice as paid. Pending, underpaid,
              or manually reviewed payments are not treated as paid, and the
              48-hour clock has not started.
            </p>
          ),
          ticketLabel: "Payment status",
          ticketValue: displayStatus(paymentStatus, "Processing"),
          payment: "Awaiting paid status",
          brief: "Submitted before checkout",
          clock: "Starts after payment + a complete brief",
          stamp: "Processing",
          primaryHref: `/success?order_id=${encodeURIComponent(orderId)}`,
          primaryLabel: "Check again",
        }}
      />
    );
  }

  if (state === "failed") {
    return (
      <StatusPage
        view={{
          kicker: "Payment · Not completed",
          title: "This payment is not confirmed.",
          description: (
            <p>
              OxaPay’s current status is not paid, so this page cannot confirm
              an active paid Launch48 order. If you already sent crypto, do not
              pay again; keep your OxaPay receipt and check once more.
            </p>
          ),
          ticketLabel: "Payment status",
          ticketValue: displayStatus(paymentStatus, "Not paid"),
          payment: "Not confirmed",
          brief: "Submitted before checkout",
          clock: "Not started by this status",
          stamp: "Not paid",
          primaryHref: `/success?order_id=${encodeURIComponent(orderId)}`,
          primaryLabel: "Check again",
        }}
      />
    );
  }

  return (
    <StatusPage
      view={{
        kicker: "Payment · Verification",
        title: "We couldn’t confirm this payment.",
        description: (
          <p>
            We could not verify a paid $349 Launch48 crypto invoice for this
            order. If you already sent crypto, do not pay again; keep your OxaPay
            receipt and check this page again.
          </p>
        ),
        ticketLabel: "Payment status",
        ticketValue: "Not verified",
        payment: "Not confirmed",
        brief: "Submitted before checkout",
        clock: "Waiting for verified payment",
        stamp: "Check again",
        primaryHref: `/success?order_id=${encodeURIComponent(orderId)}`,
        primaryLabel: "Check again",
      }}
    />
  );
}
