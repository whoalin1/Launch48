"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const processItems = [
  {
    step: "01",
    phase: "Scope & Assets",
    title: "Send the brief.",
    body: "Share your offer, content, assets, and references. We confirm the scope before the clock starts.",
    note: "Payment and a complete brief start the 48-hour window.",
    tone: "mist",
  },
  {
    step: "02",
    phase: "Design & Build",
    title: "Watch it take shape.",
    body: "We turn the essentials into a custom, responsive website with a clear visual point of view.",
    note: "Design and build happen in one focused sprint.",
    tone: "paper",
  },
  {
    step: "03",
    phase: "Refine & Launch",
    title: "Make it yours.",
    body: "Use three included revisions to sharpen the details and get the finished website ready to launch.",
    note: "Specific feedback keeps every revision useful.",
    tone: "lime",
  },
] as const;

type ProcessItem = (typeof processItems)[number];

function ProcessPanel({ item }: { item: ProcessItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.42, 0.75, 1], [0.97, 1, 1, 0.98]);
  const y = useTransform(scrollYProgress, [0, 0.42, 1], [32, 0, -16]);

  return (
    <div ref={ref} className="process-step">
      <motion.article
        className={`process-panel process-panel--${item.tone}`}
        style={reduceMotion ? undefined : { scale, y }}
      >
        <header className="process-panel__header">
          <div className="process-panel__index">
            <span className="process-panel__num">{item.step}</span>
            <span className="process-panel__phase">{item.phase}</span>
          </div>
        </header>

        <div className="process-panel__body">
          <h3>{item.title}</h3>
          <p className="process-panel__desc">{item.body}</p>
          <div className="process-panel__note">
            <span className="process-panel__note-dot" aria-hidden="true" />
            <span>{item.note}</span>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export function ProcessStack() {
  return (
    <section id="process" className="process-section" aria-labelledby="process-heading">
      <div className="page-container process-heading">
        <h2 id="process-heading">Fast because the process is clear.</h2>
        <p>Three focused moves take the project from brief to finished website.</p>
      </div>
      <div className="process-stack">
        {processItems.map((item) => (
          <ProcessPanel key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}
