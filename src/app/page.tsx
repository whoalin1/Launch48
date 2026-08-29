import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { CheckoutLink } from "@/components/checkout-link";
import { OfferSequence } from "@/components/offer-sequence";
import { PaymentModal } from "@/components/payment-modal";
import { PaymentModalProvider } from "@/components/payment-modal-context";
import { ProcessStack } from "@/components/process-stack";
import { SiteHeader } from "@/components/site-header";
import { HeroVisual, ProofVisual } from "@/components/visual-art";
import { siteConfig } from "@/lib/site-config";

const includedItems = [
  {
    title: "Custom direction",
    copy: "A visual system shaped around your brief, not a recycled theme.",
  },
  {
    title: "Responsive build",
    copy: "A polished experience across phones, tablets, and large screens.",
  },
  {
    title: "48-hour delivery",
    copy: "The window starts after payment is complete and your brief is ready.",
  },
  {
    title: "3 revisions",
    copy: "Three focused changes are included to sharpen the finished work.",
  },
] as const;

const faqs = [
  {
    question: "Is it really $149?",
    answer:
      "Yes. The project price is $149, including three revisions. Payment is accepted via Crypto or Card.",
  },
  {
    question: "When does the 48-hour clock start?",
    answer:
      "The clock starts after payment and once your brief, content, assets, and references are complete.",
  },
  {
    question: "What can I ask you to build?",
    answer:
      "Your brief sets the scope. We confirm a focused website scope that protects the 48-hour delivery promise.",
  },
  {
    question: "How do revisions work?",
    answer:
      "Three revisions are included. Send clear, focused feedback and we apply each change before the final handoff.",
  },
  {
    question: "Where do I send my brief or questions?",
    answer:
      "Send your brief, assets, and references directly to customers@launch48.space. We confirm the scope before the clock starts.",
  },
] as const;

function Faq() {
  return (
    <section id="faq" className="faq-section deferred-section" aria-labelledby="faq-heading">
      <div className="page-container faq-layout">
        <div className="faq-heading">
          <h2 id="faq-heading">Clear answers before you pay.</h2>
          <p>No calls, mystery pricing, or drawn-out proposal stage.</p>
        </div>
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.question} name="launch48-faq">
              <summary>
                <span>{item.question}</span>
                <Plus aria-hidden="true" size={24} weight="regular" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Launch48 website design and development",
    description: siteConfig.description,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
      email: siteConfig.email,
    },
    offers: {
      "@type": "Offer",
      price: "149",
      priceCurrency: "USD",
      url: siteConfig.checkoutUrl ?? siteConfig.siteUrl,
    },
  };

  return (
    <PaymentModalProvider
      cryptoUrl={siteConfig.checkoutUrl}
      cardUrl={siteConfig.cardCheckoutUrl}
    >
      <div className="site-shell">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader checkoutUrl={siteConfig.checkoutUrl} />

        <main id="main-content">
          <section id="top" className="hero" aria-labelledby="hero-heading">
            <div className="page-container hero-grid">
              <div className="hero-copy">
                <h1 id="hero-heading">
                  <span className="hero-line-mask">
                    <span className="hero-line hero-line--first">Your website.</span>
                  </span>
                  <span className="hero-line-mask">
                    <span className="hero-line hero-line--second">Live in 48 hours.</span>
                  </span>
                </h1>
                <p className="hero-copy__intro">
                  High-end design for $149, with three revisions. The clock starts when your complete brief lands.
                </p>
                <div className="hero-actions">
                  <CheckoutLink href={siteConfig.checkoutUrl} />
                  <a className="text-link" href="#process">
                    See the process
                  </a>
                </div>
              </div>
              <HeroVisual />
            </div>
          </section>

          <OfferSequence />

          <section className="proof-section" aria-labelledby="proof-heading">
            <div className="page-container">
              <div className="section-heading">
                <h2 id="proof-heading">The website is the proof.</h2>
                <p>
                  No fake clients or borrowed case studies. Judge the work by the page in front of you.
                </p>
              </div>
              <ProofVisual />
            </div>
          </section>

          <ProcessStack />

          <section className="pricing-section deferred-section" aria-labelledby="pricing-heading">
            <div className="page-container pricing-layout">
              <div className="pricing-figure" aria-hidden="true">
                <span>$</span>149
              </div>
              <div className="pricing-content">
                <h2 id="pricing-heading">One price. Flexible scope.</h2>
                <p className="pricing-content__intro">
                  Your brief sets the scope. We keep it focused enough to protect the 48-hour promise.
                </p>
                <ul className="included-grid" aria-label="What is included">
                  {includedItems.map((item) => (
                    <li key={item.title}>
                      <strong>{item.title}</strong>
                      <p>{item.copy}</p>
                    </li>
                  ))}
                </ul>
                <div className="pricing-action">
                  <CheckoutLink href={siteConfig.checkoutUrl} />
                  <p>Payment opens in OxaPay or Card checkout.</p>
                </div>
              </div>
            </div>
          </section>

          <Faq />

          <section className="final-section deferred-section" aria-labelledby="final-heading">
            <div className="page-container">
              <div className="final-panel">
                <h2 id="final-heading">Stop waiting on your website.</h2>
                <p>Send the complete brief. We will take it from there.</p>
                <CheckoutLink href={siteConfig.checkoutUrl} className="checkout-link--inverse" />
              </div>
            </div>
          </section>
        </main>

        <footer className="site-footer deferred-section">
          <div className="page-container site-footer__inner">
            <a href="#top" className="wordmark" aria-label="Back to the top">
              Launch<span>48</span>
            </a>
            <div className="site-footer__middle">
              <p>High-quality websites. Ready in 48 hours.</p>
              <a
                href={`mailto:${siteConfig.email}`}
                className="site-footer__email"
              >
                {siteConfig.email}
              </a>
            </div>
            <small>© 2026 Launch48.</small>
          </div>
        </footer>
      </div>
      <PaymentModal />
    </PaymentModalProvider>
  );
}
