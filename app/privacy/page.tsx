import type { Metadata } from "next";
import { Footer, Header } from "@/components";

export const metadata: Metadata = {
  title: "Privacy — Launch48",
  description:
    "Launch48 privacy notice. What we collect from a brief and how it is used.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="wrap legal" id="main">
        <p className="meta">Privacy · last updated 24 Aug 2026</p>
        <h1>Privacy</h1>
        <p>
          This is a short notice for a productized design/build service. It is
          written in plain language on purpose.
        </p>

        <h2>What we collect</h2>
        <p>
          When you send a brief, we collect the fields you fill in: business
          name, one-sentence pitch, audience, tone, reference URLs, colors,
          must-have sections, contact email, and an optional domain. OxaPay also
          shares invoice and crypto-payment information with us, including the
          payment tracking identifier, payer details, and whether the $349 USD
          payment succeeded.
        </p>

        <h2>How the brief and payment are handled</h2>
        <p>
          Your brief is stored server-side before checkout and tied to an opaque
          order ID and OxaPay payment tracking ID. Payment is processed through
          OxaPay&apos;s hosted crypto checkout; Launch48 never asks for or receives
          your wallet&apos;s private keys.
        </p>

        <h2>What we use it for</h2>
        <p>
          We use the information to confirm payment, design and ship your
          landing page, email you the live URL, handle the included revision
          round, and process a refund if we miss the 48-hour deadline. We do not
          sell this information.
        </p>

        <h2>Where an order is stored</h2>
        <p>
          Launch48 stores the order, OxaPay tracking ID, and full brief in
          Postgres when a database is configured. If no database is configured,
          the fallback is a GitHub Issue in the public Launch48 repository. That
          issue is created before the hosted checkout opens with opaque order
          identifiers and an encrypted brief. After payment is confirmed, it is
          updated with the full brief—including the contact email—which is then
          publicly visible. Do not put passwords, API keys, or other sensitive
          personal information in the brief.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Briefs, order records, and project files are kept as long as needed to
          deliver the page and revision, then for ordinary bookkeeping and
          dispute handling. Public fallback issues may remain in the
          repository&apos;s history even after an issue is edited or closed.
        </p>

        <h2>Contact</h2>
        <p>
          If you have an active order, reply to the fulfillment email you
          receive from Launch48. This site does not publish a separate privacy
          inbox.
        </p>
      </main>
      <Footer />
    </>
  );
}
