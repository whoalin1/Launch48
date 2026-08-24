"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useState } from "react";

import styles from "./example.module.css";

const lots = [
  {
    type: "Washed · Ethiopia",
    name: "Kochere",
    notes: "Jasmine, lemon peel, black tea.",
    copy: "A clean, bright cup written for filter and unhurried mornings.",
  },
  {
    type: "Natural · Colombia",
    name: "Huila",
    notes: "Ripe plum, cocoa, cola.",
    copy: "Fruit-forward but balanced enough for espresso, moka, or milk.",
  },
] as const;

const questions = [
  {
    question: "When is the coffee roasted?",
    answer:
      "In this concept, Fieldnote roasts twice a week and dispatches the following morning. A real Launch48 page would use your actual schedule and policies.",
  },
  {
    question: "Can I pause the house box?",
    answer:
      "Yes—the concept subscription is written to pause or skip anytime. Subscription billing itself needs an ecommerce platform and is outside the Launch48 one-page build.",
  },
  {
    question: "Does Launch48 include checkout?",
    answer:
      "The $349 ticket includes one marketing landing page with a waitlist or contact capture. Custom product checkout, accounts, and subscription billing are outside that scope.",
  },
  {
    question: "Is Fieldnote Coffee real?",
    answer:
      "No. It is an original fictional brand created to show the copy, visual direction, responsive layout, and lead-capture flow Launch48 can ship—without inventing client results.",
  },
] as const;

export default function ExamplePage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className={styles.page} id="top">
      <a className={styles.skip} href="#main-content">
        Skip to content
      </a>

      <div className={styles.sampleBar}>
        <div className={`${styles.wrap} ${styles.sampleBarInner}`}>
          <span className={styles.sampleDesktop}>
            Launch48 sample build · Fieldnote Coffee is fictional
          </span>
          <span className={styles.sampleMobile}>Fictional sample</span>
          <Link href="/brief">
            Start your brief — $349 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <header className={styles.header}>
        <div className={`${styles.wrap} ${styles.headerInner}`}>
          <Link className={styles.mark} href="#top" aria-label="Fieldnote Coffee home">
            <img src="/fieldnote-mark.svg" alt="" width="36" height="36" />
            <span>
              <strong>Fieldnote</strong>
              <small>Coffee Co.</small>
            </span>
          </Link>

          <nav className={styles.nav} aria-label="Fieldnote sections">
            <a href="#method">Method</a>
            <a href="#lots">Coffee</a>
            <Link className={styles.headerCta} href="/brief">
              Start brief · $349
            </Link>
          </nav>
        </div>
      </header>

      <section className={`${styles.wrap} ${styles.hero}`} id="main-content">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Small-lot coffee · roasted to order</p>
          <h1>
            Coffee with a <em>fieldnote.</em>
          </h1>
          <p className={styles.heroLead}>
            Every bag comes with the details that matter: where it grew, how it
            was processed, and the brew we liked best. Pick a rotating house box
            or a single origin worth slowing down for.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.button} href="#waitlist">
              Get the next fieldnote
            </a>
            <a className={styles.textLink} href="#lots">
              Explore the coffee <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <figure className={styles.heroVisual}>
          <img
            className={styles.heroImage}
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=82"
            srcSet="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=560&q=80 560w, https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=82 900w, https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=82 1200w"
            sizes="(max-width: 900px) calc(100vw - 2.2rem), 46vw"
            width="1200"
            height="1500"
            alt="Three hands holding coffee drinks with latte art"
            loading="eager"
            fetchPriority="high"
          />
          <aside className={styles.roastNote} aria-label="Illustrative roast note">
            <span>Illustrative roast note · 04</span>
            <strong>Kochere, Ethiopia</strong>
            <p>Jasmine · lemon peel · black tea</p>
            <dl>
              <div>
                <dt>Process</dt>
                <dd>Washed</dd>
              </div>
              <div>
                <dt>Brew</dt>
                <dd>Filter</dd>
              </div>
            </dl>
          </aside>
          <figcaption>
            Stock photography · Fieldnote Coffee is a fictional Launch48 sample.
          </figcaption>
        </figure>
      </section>

      <section className={styles.method} id="method">
        <div className={styles.wrap}>
          <div className={styles.sectionIntro}>
            <p className={styles.kicker}>The Fieldnote method</p>
            <h2>Less coffee theatre. More useful detail.</h2>
            <p>
              Traceable lots, careful roasts, and one plain-English note to help
              you get the best from every bag.
            </p>
          </div>

          <div className={styles.methodGrid}>
            <article>
              <span className={styles.methodNumber}>01</span>
              <p className={styles.methodLabel}>Source</p>
              <h3>Know where it came from.</h3>
              <p>
                Farm or mill, cultivar, process, harvest. If the story stops at a
                country name, it does not make the board.
              </p>
            </article>
            <article>
              <span className={styles.methodNumber}>02</span>
              <p className={styles.methodLabel}>Roast</p>
              <h3>Roasted for the cup.</h3>
              <p>
                Each lot gets its own profile, adjusted for density and moisture,
                then dated so the next roast starts smarter.
              </p>
            </article>
            <article>
              <span className={styles.methodNumber}>03</span>
              <p className={styles.methodLabel}>Note</p>
              <h3>Brew without guessing.</h3>
              <p>
                Every bag includes the useful bits: what we tasted, how we brewed
                it, and what changed from the last roast.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.lots} id="lots">
        <div className={styles.wrap}>
          <div className={styles.sectionIntro}>
            <p className={styles.kicker}>Illustrative menu · not for sale</p>
            <h2>Four coffees. Four kinds of morning.</h2>
            <p>
              Start with the rotating house box, choose a single origin, or stock
              the office shelf.
            </p>
          </div>

          <div className={styles.lotBoard}>
            <article className={styles.featuredLot}>
              <div>
                <p className={styles.lotType}>House box · 340 g</p>
                <h3>One bright.<br />One sweet.</h3>
              </div>
              <p>
                Two contrasting bags in every drop, roasted to order and written
                up with a practical brew note.
              </p>
            </article>

            <div className={styles.supportingLots}>
              {lots.map((lot) => (
                <article className={styles.supportingLot} key={lot.name}>
                  <p className={styles.lotType}>{lot.type}</p>
                  <h3>{lot.name}</h3>
                  <strong>{lot.notes}</strong>
                  <p>{lot.copy}</p>
                </article>
              ))}
              <article className={styles.millLot}>
                <div>
                  <p className={styles.lotType}>Office · 1 kg</p>
                  <h3>Mill blend</h3>
                </div>
                <p>Chocolate, toasted almond, brown sugar. Easygoing by design.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.detailsSection} id="faq">
        <div className={`${styles.wrap} ${styles.detailsGrid}`}>
          <div>
            <div className={styles.sectionIntro}>
              <p className={styles.kicker}>Questions, answered</p>
              <h2>Coffee first. Fine print second.</h2>
            </div>
            <div className={styles.faqList}>
              {questions.map((item) => (
                <details key={item.question}>
                  <summary>
                    <span>{item.question}</span>
                    <span className={styles.faqMark} aria-hidden="true">+</span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className={styles.waitlist} id="waitlist">
            <p className={styles.waitlistKicker}>The next roast</p>
            <h2>Get the fieldnote first.</h2>
            <p>
              One email when a new lot lands: origin, roast date, and the brew
              we would try first. No daily drip.
            </p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="fieldnote-email">Email address</label>
              <input
                id="fieldnote-email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
              <button className={styles.waitlistButton} type="submit">
                Send me the fieldnote
              </button>
            </form>
            <p className={styles.demoNote}>
              {submitted
                ? "Demo complete—this sample does not store or send your email."
                : "Demo only—nothing is stored or sent."}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.launchCta}>
        <div className={`${styles.wrap} ${styles.launchCtaGrid}`}>
          <div>
            <p className={styles.launchKicker}>Built by Launch48</p>
            <h2>Need a page with this much point of view?</h2>
          </div>
          <div className={styles.launchCopy}>
            <p>
              Complete the brief, pay $349 in crypto, and we will write, design,
              and deploy one responsive marketing page on Vercel. Your 48-hour
              clock starts after the brief is complete and payment clears.
            </p>
            <p className={styles.guarantee}>
              One revision included · full refund if we miss the deadline.
            </p>
            <div className={styles.launchActions}>
              <Link className={styles.launchButton} href="/brief">
                Start my brief — $349
              </Link>
              <Link className={styles.launchGhost} href="/#included">
                See exact scope
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={`${styles.wrap} ${styles.footerInner}`}>
          <span>Fieldnote Coffee is a fictional concept. No products are sold.</span>
          <Link href="/">Back to Launch48 <span aria-hidden="true">→</span></Link>
        </div>
      </footer>
    </main>
  );
}
