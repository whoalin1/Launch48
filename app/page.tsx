import Link from "next/link";

import { FaqList } from "@/components/FaqList";
import { Footer, Header, PurchaseCta } from "@/components";
import { isPolarConfigured } from "@/lib/config";
import { isOrderStorageConfigured } from "@/lib/orders";

export default function HomePage() {
  const paymentsConfigured =
    isPolarConfigured() && isOrderStorageConfigured();

  return (
    <>
      <Header />
      <main id="main">
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="kicker">Productized design / build · one page</p>
              <h1>
                Send a brief.
                <br />
                Get a live page.
                <br />
                <em>Forty-eight hours.</em>
              </h1>
              <p className="lede">
                One marketing landing page — hero, proof, features, FAQ, and a
                call to action — written, designed, and deployed on Vercel. $349,
                once. Complete the brief first, pay securely through Polar
                second, and the clock starts only when both are in.
              </p>
              <div className="hero-actions">
                <PurchaseCta configured={paymentsConfigured} />
                <Link className="btn btn-ghost" href="/example">
                  See a shipped example
                </Link>
              </div>
            </div>
            <aside className="ticket" aria-label="Job ticket">
              <div className="ticket-head">
                <span>Job ticket</span>
                <span>LP-48</span>
              </div>
              <div className="ticket-body">
                <div className="price">
                  $349 <small>USD · one-time</small>
                </div>
                <dl>
                  <div>
                    <dt>Deliverable</dt>
                    <dd>One live marketing landing page</dd>
                  </div>
                  <div>
                    <dt>Clock</dt>
                    <dd>48 hours from complete brief + successful payment</dd>
                  </div>
                  <div>
                    <dt>Revision</dt>
                    <dd>One round, included</dd>
                  </div>
                </dl>
                <div className="stamp">Refund if we miss 48h</div>
              </div>
            </aside>
          </div>
        </section>

        <section id="how">
          <div className="wrap">
            <div className="section-head">
              <span className="idx">01 / Process</span>
              <h2>Brief. Pay. We ship.</h2>
            </div>
            <div className="steps">
              <article className="step">
                <div className="step-num">01 — Brief</div>
                <h3>Fill the form</h3>
                <p>
                  Business name, pitch, audience, tone, references, colors,
                  must-have sections, contact email, and an optional domain.
                </p>
              </article>
              <article className="step">
                <div className="step-num">02 — Pay</div>
                <h3>$349, once</h3>
                <p>
                  A complete brief continues to Polar’s hosted checkout. No
                  retainer and no hourly meter; payment confirms your production
                  slot.
                </p>
              </article>
              <article className="step">
                <div className="step-num">03 — Ship</div>
                <h3>Live in 48 hours</h3>
                <p>
                  Successful payment plus the complete brief starts the clock.
                  You get a mobile-ready Vercel page and one revision round.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="included">
          <div className="wrap">
            <div className="section-head">
              <span className="idx">02 / Scope</span>
              <h2>What’s on the page — and what isn’t.</h2>
            </div>
            <div className="split">
              <article>
                <h3>Included</h3>
                <ul>
                  <li>
                    <span className="mark-yes" aria-hidden="true">+</span>
                    <span>
                      One marketing landing page: hero, proof, features, FAQ,
                      CTA
                    </span>
                  </li>
                  <li>
                    <span className="mark-yes" aria-hidden="true">+</span>
                    <span>Mobile-ready layout</span>
                  </li>
                  <li>
                    <span className="mark-yes" aria-hidden="true">+</span>
                    <span>Deployed on Vercel</span>
                  </li>
                  <li>
                    <span className="mark-yes" aria-hidden="true">+</span>
                    <span>Waitlist or contact capture</span>
                  </li>
                  <li>
                    <span className="mark-yes" aria-hidden="true">+</span>
                    <span>Basic SEO (title, description, sensible headings)</span>
                  </li>
                  <li>
                    <span className="mark-yes" aria-hidden="true">+</span>
                    <span>One revision round</span>
                  </li>
                </ul>
              </article>
              <article>
                <h3>Not included</h3>
                <ul>
                  <li>
                    <span className="mark-no" aria-hidden="true">–</span>
                    <span>Custom app or backend</span>
                  </li>
                  <li>
                    <span className="mark-no" aria-hidden="true">–</span>
                    <span>Blog or content system</span>
                  </li>
                  <li>
                    <span className="mark-no" aria-hidden="true">–</span>
                    <span>Auth, dashboards, or accounts</span>
                  </li>
                  <li>
                    <span className="mark-no" aria-hidden="true">–</span>
                    <span>
                      From-scratch brand identity (logo systems, full guidelines)
                    </span>
                  </li>
                </ul>
                <p className="note">
                  If you already have a mark and a palette, we work with them. If
                  you don’t, we set a temporary visual system for the page — not
                  a complete brand.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="price">
          <div className="wrap">
            <div className="section-head">
              <span className="idx">03 / Price</span>
              <h2>One number. One clock.</h2>
            </div>
            <div className="price-block">
              <div className="price-copy">
                <h3>A productized page, not a project.</h3>
                <p className="fine">
                  You are buying a defined job: one landing page, shipped in
                  forty-eight hours. You complete the brief first and pay through
                  Polar second. The clock starts only after the brief is complete
                  and the $349 payment succeeds. Miss the clock and you get a full
                  refund.
                </p>
                <p className="fine">
                  After launch, you get one revision round — copy tweaks, section
                  order, color or type adjustments. New pages, extra languages,
                  or product work are outside this ticket.
                </p>
                <div className="hero-actions price-actions">
                  <PurchaseCta configured={paymentsConfigured} />
                  <Link className="btn btn-ghost" href="/terms">
                    Read the terms
                  </Link>
                </div>
              </div>
              <aside className="ticket" aria-label="Work order">
                <div className="ticket-head">
                  <span>Work order</span>
                  <span>$349 USD</span>
                </div>
                <div className="ticket-body">
                  <div className="price">
                    $349 <small>one-time</small>
                  </div>
                  <dl>
                    <div>
                      <dt>Starts</dt>
                      <dd>After complete brief + successful payment</dd>
                    </div>
                    <div>
                      <dt>Ships</dt>
                      <dd>Live URL on Vercel within 48 hours</dd>
                    </div>
                    <div>
                      <dt>Guarantee</dt>
                      <dd>Full refund if we miss 48 hours</dd>
                    </div>
                    <div>
                      <dt>Revisions</dt>
                      <dd>One round included</dd>
                    </div>
                  </dl>
                  <div className="stamp">48h or refund</div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section id="faq">
          <div className="wrap">
            <div className="section-head">
              <span className="idx">04 / FAQ</span>
              <h2>Plain answers.</h2>
            </div>
            <FaqList />
          </div>
        </section>

        <section className="cta-band">
          <div className="wrap">
            <p className="kicker cta-kicker">Ready when the brief is</p>
            <h2>
              Brief it. Pay securely.
              <br />
              We’ll make it live.
            </h2>
            <p>
              Complete the brief, continue to Polar’s hosted checkout, and pay
              $349 once. The 48-hour clock starts only after payment succeeds and
              the brief is complete.
            </p>
            <div className="cta-actions">
              <PurchaseCta configured={paymentsConfigured} />
              <Link className="btn btn-ghost cta-ghost" href="/example">
                View example page
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
