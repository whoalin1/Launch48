"use client";

import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { motion } from "motion/react";
import { useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const BRIEF_EMAIL = "customers@launch48.space";
const MAILTO_LINK =
  "mailto:customers@launch48.space?subject=Launch48%20Brief%20Submission&body=Hi%20Launch48%20Team%2C%0A%0AHere%20is%20my%20brief%20for%20our%20website%20build%3A%0A%0A1.%20Business%20%2F%20Product%20Name%3A%0A2.%20Core%20Offer%20%26%20Target%20Audience%3A%0A3.%20Key%20Pages%20or%20Sections%3A%0A4.%20Brand%20Assets%20(Logos%2C%20Colors%2C%20Images)%3A%0A5.%20Reference%20Websites%20I%20Like%3A%0A6.%20Direct%201-on-1%20Contact%20(WhatsApp%20or%20Social%20App)%3A%0A%0AThank%20you!";

const EXAMPLE_BRIEF_TEXT = `To: customers@launch48.space
Subject: Launch48 Project Brief — [Your Project Name]

Hi Launch48 Team,

Here is our project brief for our website build:

1. Business / Product:
[Short 1-2 sentence description of what you do and who it is for]

2. Core Offer & Goal:
[What you are selling, key benefit, and main CTA button action]

3. Key Sections Desired:
[Hero, Features / Benefits, Proof / Visuals, Pricing / Offer, FAQ]

4. Brand Assets:
[Attached SVG or PNG logo, preferred color codes (e.g. #000, #b8f34a)]

5. Inspiration Websites:
[1-2 reference links whose typography, visual tone, or layout you admire]

6. Direct 1-on-1 Contact:
[WhatsApp number or preferred social app: Telegram / Discord / X handle]`;

const briefItems = [
  {
    step: "01",
    title: "Core offer & audience",
    desc: "What you sell, who it is for, and your primary call to action.",
  },
  {
    step: "02",
    title: "Headlines & copy",
    desc: "Rough draft text, bullet points, or talking points for the page.",
  },
  {
    step: "03",
    title: "Brand assets & logo",
    desc: "SVG or PNG logo, preferred color palette, and photography.",
  },
  {
    step: "04",
    title: "Reference websites",
    desc: "1–2 links to websites whose typography, style, or vibe you love.",
  },
] as const;

export function SuccessView() {
  const reduceMotion = usePrefersReducedMotion();
  const [copied, setCopied] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(BRIEF_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(EXAMPLE_BRIEF_TEXT);
      setCopiedTemplate(true);
      setTimeout(() => setCopiedTemplate(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="success-screen">
      {/* Main Content */}
      <motion.main
        className="success-body"
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="success-hero">
          <h1 className="success-heading">
            Thank you for trusting Launch48.
          </h1>

          <p className="success-sub">
            Your build is locked in. The 48-hour delivery countdown starts as soon as your brief lands in our inbox.
          </p>
        </div>

        {/* Action & Brief Tray */}
        <div className="success-tray">
          <div className="success-action-bar">
            <div className="success-inbox-meta">
              <span className="success-inbox-label">Send brief & assets to</span>
              <span className="success-inbox-email">{BRIEF_EMAIL}</span>
            </div>

            <div className="success-buttons">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="success-btn-ghost"
              >
                {copied ? "✓ Copied address" : "Copy email"}
              </button>

              <a href={MAILTO_LINK} className="success-btn-primary">
                <span>Email Your Brief</span>
                <span className="success-btn-arrow">
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </span>
              </a>
            </div>
          </div>

          {/* 4 Brief Essentials in a Unified 4-Column Row */}
          <div className="success-brief-grid">
            {briefItems.map((item) => (
              <div key={item.step} className="success-brief-item">
                <span className="success-brief-index">{item.step}</span>
                <span className="success-brief-title">{item.title}</span>
                <p className="success-brief-desc">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Clean 1-on-1 Direct Chat Callout */}
          <div className="success-direct-chat">
            <div className="success-direct-chat__header">
              <div className="success-direct-chat__tag">
                <span>1-on-1 Direct Chat Available</span>
              </div>
              <div className="success-direct-chat__apps">
                <span className="success-direct-chat__app-pill">WhatsApp</span>
                <span className="success-direct-chat__app-pill">Telegram</span>
                <span className="success-direct-chat__app-pill">Discord</span>
                <span className="success-direct-chat__app-pill">X</span>
              </div>
            </div>
            <p className="success-direct-chat__desc">
              <strong>Prefer to talk 1-on-1 directly?</strong> Include your WhatsApp number or preferred social app handle in your email and our founder will message you directly to coordinate the sprint.
            </p>
          </div>

          {/* Smooth 60fps CSS Grid Accordion for Example Template */}
          <div className="success-accordion-section">
            <button
              type="button"
              className="success-accordion-toggle"
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              aria-expanded={isAccordionOpen}
            >
              <div className="success-accordion-toggle__left">
                <span className="success-accordion-toggle__symbol" aria-hidden="true">
                  {isAccordionOpen ? "−" : "+"}
                </span>
                <span>View example brief email</span>
              </div>
              <span className="success-accordion-toggle__action">
                {isAccordionOpen ? "Close example" : "Click to view template"}
              </span>
            </button>

            <div
              className={`success-accordion-panel ${
                isAccordionOpen ? "success-accordion-panel--open" : ""
              }`}
            >
              <div className="success-accordion-content">
                <div className="success-terminal">
                  <div className="success-terminal__bar">
                    <span>example-brief.txt</span>
                    <button
                      type="button"
                      onClick={handleCopyTemplate}
                      className="success-terminal__copy"
                    >
                      {copiedTemplate ? "✓ Copied" : "Copy template"}
                    </button>
                  </div>
                  <pre className="success-terminal__code">{EXAMPLE_BRIEF_TEXT}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.main>

      {/* Bottom Bar */}
      <footer className="success-bottom-bar">
        <span>© 2026 Launch48.</span>
        <span>
          Questions?{" "}
          <a
            href={`mailto:${BRIEF_EMAIL}`}
            style={{ color: "var(--ink)", textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            {BRIEF_EMAIL}
          </a>
        </span>
      </footer>
    </div>
  );
}
