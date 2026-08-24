"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import styles from "./example.module.css";

export default function ExamplePage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className={styles.page}>
      <div className={styles.sampleBar}>
        Sample shipped page · fictional roaster · <Link href="/">Back to Launch48</Link>
      </div>

      <div className={styles.wrap}>
        <header className={styles.header}>
          <Link className={styles.mark} href="/example">
            <svg viewBox="0 0 34 34" aria-hidden="true">
              <circle
                cx="17"
                cy="17"
                r="16"
                fill="none"
                stroke="#c4a056"
                strokeWidth="1.2"
              />
              <path
                d="M10 22c3-8 11-8 14 0"
                fill="none"
                stroke="#c4a056"
                strokeWidth="1.2"
              />
              <circle cx="17" cy="13" r="3" fill="#c4a056" />
            </svg>
            <span>
              <strong>Fieldnote</strong>
              <small>Coffee Co.</small>
            </span>
          </Link>
          <nav className={styles.nav} aria-label="Fieldnote sections">
            <a href="#roast">The roast</a>
            <a href="#lots">Lots</a>
            <a href="#faq">FAQ</a>
            <a href="#waitlist">Waitlist</a>
          </nav>
        </header>

        <section className={styles.hero}>
          <div>
            <p className={styles.kicker}>
              Converted mill · small lots · roasted to order
            </p>
            <h1>
              Coffee with a <em>fieldnote.</em>
            </h1>
            <p>
              We roast in small lots and write down what the week actually
              tasted like—altitude, weather, and the cup, not a slogan.
              Subscriptions for the table. Single origins when the lot is worth
              a bag of its own.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.button} href="#waitlist">
                Join the waitlist
              </a>
              <a className={`${styles.button} ${styles.buttonGhost}`} href="#lots">
                See current lots
              </a>
            </div>
          </div>
          <figure className={styles.heroPanel}>
            <img
              className={styles.heroImage}
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=76"
              srcSet="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=480&q=76 480w, https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=720&q=76 720w, https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1080&q=76 1080w"
              sizes="(max-width: 800px) calc(100vw - 2.2rem), (max-width: 1200px) 38vw, 440px"
              width="1080"
              height="810"
              alt="Coffee being prepared at a cupping table"
              loading="eager"
              fetchPriority="high"
            />
            <figcaption>
              Photograph: a cupping table—decorative, not a customer claim.
            </figcaption>
          </figure>
        </section>
      </div>

      <section className={styles.band} id="roast">
        <div className={styles.wrap}>
          <p className={`${styles.kicker} ${styles.kickerDark}`}>
            How a week is built
          </p>
          <h2>Three things, every roast day.</h2>
          <p className={styles.lead}>
            No app. No membership points. A mill floor, a 15-kilo roaster, and a
            note taped to the bag.
          </p>
          <div className={styles.gridThree}>
            <article className={styles.card}>
              <div className={styles.index}>01 — Source</div>
              <h3>Lots we can name.</h3>
              <p>
                We buy from importers who can tell us the mill, the cultivar,
                and how it was processed. If we cannot write a fieldnote, we do
                not roast it.
              </p>
            </article>
            <article className={styles.card}>
              <div className={styles.index}>02 — Roast</div>
              <h3>Small enough to taste.</h3>
              <p>
                Batches stay small so a change in moisture or density does not
                disappear into a blend. Profiles are written down and dated.
              </p>
            </article>
            <article className={styles.card}>
              <div className={styles.index}>03 — Note</div>
              <h3>A line on every bag.</h3>
              <p>
                Not tasting-wheel poetry. A short note: origin, process, and
                what showed up in the cup that week. That is the product.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={`${styles.band} ${styles.lotsBand}`} id="lots">
        <div className={styles.wrap}>
          <p className={`${styles.kicker} ${styles.kickerDark}`}>
            On the board this month
          </p>
          <h2>Single origins &amp; the house box.</h2>
          <p className={styles.lead}>
            Fictional lots for this sample page—written in the voice of a weekly
            board, not as reviews from customers.
          </p>
          <div className={styles.origins}>
            <article className={styles.origin}>
              <div className={styles.index}>Subscription</div>
              <h3>House box · 340g</h3>
              <p>
                Two bags, rotating. One washed, one natural or honey. Shipped
                roasted-to-order. Pause whenever you like.
              </p>
            </article>
            <article className={styles.origin}>
              <div className={styles.index}>Washed</div>
              <h3>Yirgacheffe, Kochere</h3>
              <p>
                High floral, lemon peel, black tea. For filter. A quiet morning
                coffee that does not need milk to make sense.
              </p>
            </article>
            <article className={styles.origin}>
              <div className={styles.index}>Natural</div>
              <h3>Huila, Colombia</h3>
              <p>
                Ripe plum, cocoa, a little cola. Espresso or moka. Sweeter than
                the washed lot, still clean.
              </p>
            </article>
            <article className={styles.origin}>
              <div className={styles.index}>Office</div>
              <h3>Mill blend · 1kg</h3>
              <p>
                A weekday blend for the office kettle. Chocolate and toasted
                nut. Built to be drinkable at 9 and still fine at 4.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.dark} id="faq">
        <div className={styles.wrap}>
          <p className={styles.kicker}>Questions</p>
          <h2>Before you join the list.</h2>
          <div className={styles.faq}>
            <details>
              <summary>When do you ship?</summary>
              <p>
                Roast days are Tuesday and Friday. Subscriptions go out the
                following morning. This is sample copy for a Launch48 page—not a
                live roaster schedule.
              </p>
            </details>
            <details>
              <summary>Do you have a café?</summary>
              <p>
                No public bar. The mill is roasting space. Pickup can be
                arranged in the brief if a real client wants it; this sample
                uses a waitlist instead.
              </p>
            </details>
            <details>
              <summary>Can I pause a subscription?</summary>
              <p>
                Yes. The house box is meant to be paused. Billing and accounts
                are outside a Launch48 page—the live version of this sample
                would collect the waitlist only.
              </p>
            </details>
            <details>
              <summary>Is this a real company?</summary>
              <p>
                No. Fieldnote Coffee is a fictional specialty roaster built as
                a shipped example for Launch48. No bags, no mill, no customer
                list.
              </p>
            </details>
          </div>

          <div id="waitlist">
            <p className={`${styles.kicker} ${styles.waitlistKicker}`}>Waitlist</p>
            <h2>Get the next roast note.</h2>
            <p className={styles.waitlistIntro}>
              Leave an email. On a real Launch48 page this would feed a waitlist
              or contact form. This sample never sends or stores it.
            </p>
            <form className={styles.waitlist} onSubmit={handleSubmit}>
              <input
                type="email"
                required
                placeholder="you@example.com"
                aria-label="Email"
              />
              <button className={styles.button} type="submit">
                Join waitlist
              </button>
            </form>
            <p
              className={`${styles.waitlistNote} ${submitted ? styles.show : ""}`}
              role="status"
              aria-live="polite"
            >
              Sample capture only—this sample page does not store emails.
            </p>
          </div>
        </div>
      </section>

      <div className={styles.wrap}>
        <footer className={styles.footer}>
          <span>Fieldnote Coffee Co. · sample page for Launch48</span>
          <span>
            <Link href="/">launch48.xyz</Link>
          </span>
        </footer>
      </div>
    </main>
  );
}
