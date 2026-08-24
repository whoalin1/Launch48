import type { Metadata } from "next";
import { Footer, Header } from "@/components";

export const metadata: Metadata = {
  title: "Terms — Launch48",
  description:
    "Launch48 terms: productized design/build, 48-hour clock, one revision, and a full refund if the deadline is missed.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="wrap legal" id="main">
        <p className="meta">Terms · last updated 24 Aug 2026</p>
        <h1>Terms</h1>
        <p>
          Launch48 is a productized design and build service. You buy a defined
          job, not an open-ended project.
        </p>

        <h2>The job</h2>
        <p>
          For $349 USD, one-time, you receive one marketing landing page (hero,
          proof, features, FAQ, and a call to action), mobile-ready, deployed on
          Vercel, with waitlist or contact capture, basic SEO, and one revision
          round.
        </p>

        <h2>Payment</h2>
        <p>
          Payment is collected through Polar&apos;s hosted checkout. An order is
          accepted only after the $349 payment has cleared and the brief is
          complete.
        </p>

        <h2>When the 48 hours start</h2>
        <p>
          The 48-hour clock starts when both of these are true: (1) we have a
          complete brief, and (2) payment has cleared. A complete brief includes
          business name, one-sentence pitch, audience, tone, reference URLs,
          colors, must-have sections, and a contact email. Missing required
          information does not start the clock.
        </p>

        <h2>What “shipped” means</h2>
        <p>
          A live URL on Vercel that matches the scope above. Domain purchase and
          DNS are yours. We will use your existing mark and colors if you
          provide them; we do not deliver a from-scratch brand identity.
        </p>

        <h2>One revision</h2>
        <p>
          After you see the live page, you get one revision round covering copy,
          order of sections, spacing, color, and type. New pages, backends,
          blogs, authentication, or a new identity are not included.
        </p>

        <h2>Refund if we miss 48 hours</h2>
        <p>
          If we do not ship within 48 hours of a complete brief plus cleared
          payment, you get a full refund of the $349. That is the guarantee. A
          missed deadline does not automatically create a new obligation to
          keep working unless we both agree in writing.
        </p>

        <h2>Not included</h2>
        <ul>
          <li>Custom app or backend</li>
          <li>Blog or CMS</li>
          <li>Authentication or accounts</li>
          <li>From-scratch brand identity</li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
