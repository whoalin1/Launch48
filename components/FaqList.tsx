"use client";

import { useState } from "react";

const faqs = [
  {
    question: "When does the 48-hour clock start?",
    answer:
      "After you complete the brief and OxaPay confirms the $349 crypto payment. Incomplete briefs or unsuccessful payments do not start the clock. Weekends and holidays are counted as working time unless we write otherwise before you pay.",
  },
  {
    question: "What if you miss 48 hours?",
    answer:
      "You get a full refund. That is the guarantee. If you still want the page after a late delivery, we can finish it as a separate agreement — you are not obligated.",
  },
  {
    question: "What does the one revision cover?",
    answer:
      "Copy edits, layout order, spacing, color, and type adjustments on the shipped page. It does not cover a new sitemap, extra pages, a brand-identity pass, or adding app features.",
  },
  {
    question: "Can you write all the copy?",
    answer:
      "Yes, from your brief. The stronger the brief — especially the one-sentence pitch and audience — the closer the first draft will be. You can also paste existing copy and we will typeset and edit it.",
  },
  {
    question: "Do I need a domain?",
    answer:
      "No. We deploy to a Vercel URL. If you already have a domain, you can point it after launch. Domain purchase and DNS changes are yours to handle.",
  },
  {
    question: "Why isn’t there a wall of testimonials?",
    answer:
      "We do not invent customers, revenue, or user counts. The offer is the process, the scope, and the 48-hour refund. A fictional shipped example is linked in the navigation so you can see the kind of work this ticket produces.",
  },
] as const;

export function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const answerId = `faq-answer-${index}`;

        return (
          <div className={`faq-item${isOpen ? " open" : ""}`} key={faq.question}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              {faq.question} <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
            </button>
            <div className="answer" id={answerId} hidden={!isOpen}>
              {faq.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
