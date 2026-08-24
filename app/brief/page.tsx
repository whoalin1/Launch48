import type { Metadata } from "next";
import Link from "next/link";

import { BriefForm } from "@/components/BriefForm";
import { Footer, Header } from "@/components";
import { isOxaPayConfigured } from "@/lib/config";
import { isOrderStorageConfigured } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Start a brief",
  description:
    "Complete the Launch48 brief, then continue to OxaPay’s hosted checkout to pay the one-time $349 price in crypto.",
};

export default function BriefPage() {
  const paymentsConfigured =
    isOxaPayConfigured() && isOrderStorageConfigured();

  return (
    <>
      <Header />
      <main id="main">
        <div className="wrap page-intro">
          <p className="kicker">Work order · LP-48</p>
          <h1>The brief.</h1>
          <p className="lede">
            Complete the brief first, then continue to OxaPay’s hosted crypto
            checkout for the $349 payment. The 48-hour clock starts only after
            payment succeeds and this brief is complete.
          </p>
        </div>

        <div className="wrap form-shell">
          <BriefForm paymentsConfigured={paymentsConfigured} />

          <aside aria-label="Brief checklist">
            <div className="ticket">
              <div className="ticket-head">
                <span>Checklist</span>
                <span>Required</span>
              </div>
              <div className="ticket-body">
                <dl>
                  <div>
                    <dt>Name + pitch</dt>
                    <dd>So the headline can be specific</dd>
                  </div>
                  <div>
                    <dt>Audience + tone</dt>
                    <dd>So the page speaks to one person</dd>
                  </div>
                  <div>
                    <dt>References + scope</dt>
                    <dd>So the first build has clear direction</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>So we can send the live URL</dd>
                  </div>
                  <div>
                    <dt>Payment</dt>
                    <dd>OxaPay crypto checkout after the brief</dd>
                  </div>
                </dl>
                <div className="stamp">Brief → payment</div>
              </div>
            </div>
            <p className="note ticket-copy-link">
              Need the rules in writing? See <Link href="/terms">terms</Link> and{" "}
              <Link href="/privacy">privacy</Link>.
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
