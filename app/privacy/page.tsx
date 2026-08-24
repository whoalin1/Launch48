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
          must-have sections, contact email, and an optional domain. Polar also
          shares payment and checkout information with us, including the
          checkout identifier, payer details, and whether the $349 USD payment
          succeeded.
        </p>

        <h2>How the brief and payment are handled</h2>
        <p>
          Your brief is sent server-side to Polar as checkout metadata so it can
          be tied to the correct checkout. Payment is processed through
          Polar&apos;s hosted checkout; Launch48 does not receive or store your
          full card number.
        </p>

        <h2>What we use it for</h2>
        <p>
          We use the information to confirm payment, design and ship your
          landing page, email you the live URL, handle the included revision
          round, and process a refund if we miss the 48-hour deadline. We do not
          sell this information.
        </p>

        <h2>Where a paid order is stored</h2>
        <p>
          After Polar confirms a paid order, Launch48 stores the checkout and
          full brief in Postgres when a database is configured. If no database
          is configured, the fallback is a GitHub Issue in the public Launch48
          repository. That issue includes the Polar checkout ID and the full
          brief—including the contact email—and is publicly visible. Do not put
          passwords, API keys, or other sensitive personal information in the
          brief.
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
