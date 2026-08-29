# launch48 Component Recipes Reference

This document provides production-tested component patterns and code templates that conform strictly to the launch48 design system.

---

## 1. Buttons & Links

### Primary Magnetic CTA (`CheckoutLink`)
Pill button with spring physics, cursor pull, and hover state.

```tsx
"use client";

import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { PointerEvent } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const spring = { stiffness: 420, damping: 32, mass: 0.22 };

export function CheckoutLink({
  href,
  compact = false,
  className = "",
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, spring);
  const y = useSpring(targetY, spring);
  const classes = `checkout-link${compact ? " checkout-link--compact" : ""} ${className}`.trim();

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
    targetX.set(relativeX * 8);
    targetY.set(relativeY * 6);
  }

  function resetPosition() {
    targetX.set(0);
    targetY.set(0);
  }

  const content = (
    <>
      <span>Start for $149</span>
      <ArrowUpRight aria-hidden="true" size={compact ? 16 : 18} weight="bold" />
    </>
  );

  if (!href) {
    return (
      <motion.span
        role="link"
        aria-disabled="true"
        tabIndex={0}
        title="Payment link is being configured."
        className={`${classes} checkout-link--disabled`}
        style={{ x, y }}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPosition}
      >
        {content}
      </motion.span>
    );
  }

  return (
    <motion.a
      href={href}
      className={classes}
      style={{ x, y }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", bounce: 0, duration: 0.36 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
    >
      {content}
    </motion.a>
  );
}
```

### CSS Rules for CTA Variants
```css
/* Standard: Ink background flipping to Volt Lime */
.checkout-link {
  display: inline-flex;
  min-height: 3.35rem;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.05rem 0.85rem 1.25rem;
  border: 1px solid var(--ink);
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
  font-size: 0.86rem;
  font-weight: 680;
  letter-spacing: -0.025em;
  box-shadow: 0 9px 24px color-mix(in srgb, var(--ink) 14%, transparent);
  transition: background-color 180ms ease, color 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.checkout-link:hover {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--ink);
  box-shadow: 0 12px 30px color-mix(in srgb, var(--accent) 28%, transparent);
}

.checkout-link:hover svg {
  transform: translate(2px, -2px);
}

/* Compact: For header navigation */
.checkout-link--compact {
  min-height: 3.05rem;
  padding: 0.72rem 0.95rem 0.72rem 1.05rem;
  font-size: 0.78rem;
}

/* Inverse: For lime callout panels (Ink flipping to Paper) */
.checkout-link--inverse {
  border-color: var(--ink);
  background: var(--ink);
  color: var(--paper);
}

.checkout-link--inverse:hover {
  border-color: var(--paper);
  background: var(--paper);
  color: var(--ink);
  box-shadow: none;
}

/* Disabled: When URL is missing */
.checkout-link--disabled {
  border-color: var(--line);
  background: var(--mist);
  color: var(--muted);
  cursor: not-allowed;
  box-shadow: none;
}
```

### Underlined Secondary Text Link (`.text-link`)
Used beside the primary button in the hero:
```css
.text-link {
  position: relative;
  padding-block: 0.5rem;
  color: var(--muted);
  font-size: 0.84rem;
  font-weight: 620;
}

.text-link::after {
  position: absolute;
  right: 0;
  bottom: 0.32rem;
  left: 0;
  height: 1px;
  background: currentColor;
  content: "";
  transform-origin: right;
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.text-link:hover::after {
  transform: scaleX(0.35);
}
```

---

## 2. Layout & Structure

### Standard Page Shell & Container
```tsx
<div className="site-shell">
  <Header />
  <main id="main-content">
    <div className="page-container">
      {/* Content */}
    </div>
  </main>
  <Footer />
</div>
```

### Section Heading Split
Used across Proof, Process, and FAQ sections:
```tsx
<div className="section-heading">
  <h2 id="section-heading">Tight headline.</h2>
  <p>Compact explanatory lead copy positioned at the bottom baseline of the heading.</p>
</div>
```
```css
.section-heading {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(18rem, 0.55fr);
  gap: clamp(2rem, 6vw, 8rem);
  align-items: end;
  margin-bottom: clamp(3rem, 6vw, 6rem);
}

.section-heading h2 {
  max-width: 9ch;
  font-size: clamp(3.5rem, 7.8vw, 8.4rem);
  font-weight: 625;
  line-height: 0.87;
  letter-spacing: -0.082em;
}

.section-heading p {
  max-width: 29rem;
  color: var(--muted);
  font-size: clamp(1rem, 1.25vw, 1.18rem);
  line-height: 1.5;
  letter-spacing: -0.03em;
}
```

### Architectural Hairline Grid (`included-grid`)
Used in the pricing section to present structured inclusions without cards:
```tsx
<ul className="included-grid" aria-label="Inclusions">
  {items.map((item) => (
    <li key={item.title}>
      <strong>{item.title}</strong>
      <p>{item.copy}</p>
    </li>
  ))}
</ul>
```
```css
.included-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--line);
  list-style: none;
}

.included-grid li {
  min-height: 12rem;
  padding: 1.45rem 1.5rem 2rem 0;
  border-bottom: 1px solid var(--line);
}

.included-grid li:nth-child(odd) {
  padding-right: 2rem;
  border-right: 1px solid var(--line);
}

.included-grid li:nth-child(even) {
  padding-left: 2rem;
}

.included-grid strong {
  display: block;
  font-size: clamp(1.2rem, 1.6vw, 1.55rem);
  font-weight: 650;
  letter-spacing: -0.045em;
}

.included-grid p {
  max-width: 25rem;
  margin: 0.85rem 0 0;
  color: var(--muted);
  font-size: 0.93rem;
  line-height: 1.55;
  letter-spacing: -0.02em;
}
```

---

## 3. Interactive Patterns

### Native Exclusive Accordion (FAQ)
Uses HTML `<details>` and `<summary>` with Phosphor `<Plus />` rotating 45deg.
```tsx
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";

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
```
```css
.faq-list {
  border-top: 1px solid var(--line);
}

.faq-list details {
  border-bottom: 1px solid var(--line);
}

.faq-list summary {
  display: flex;
  min-height: 7.4rem;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 1.5rem 0;
  cursor: pointer;
  list-style: none;
}

.faq-list summary::-webkit-details-marker {
  display: none;
}

.faq-list summary span {
  font-size: clamp(1.25rem, 2vw, 1.8rem);
  font-weight: 570;
  line-height: 1.2;
  letter-spacing: -0.045em;
}

.faq-list summary svg {
  flex: 0 0 auto;
  transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.faq-list details[open] summary svg {
  transform: rotate(45deg);
}

.faq-list details > p {
  max-width: 42rem;
  margin: -0.4rem 3.5rem 2.2rem 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.62;
  letter-spacing: -0.025em;
}
```

### Stacking Process Cards (`ProcessStack`)
Sticky stacking editorial panels with progress transforms.
```tsx
"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

function ProcessPanel({
  item,
}: {
  item: {
    step: string;
    phase: string;
    badge: string;
    title: string;
    body: string;
    note: string;
    tone: "mist" | "paper" | "lime";
  };
}) {
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
          <span className="process-panel__badge">{item.badge}</span>
        </header>

        <div className="process-panel__main">
          <h3>{item.title}</h3>
          <div className="process-panel__copy">
            <p>{item.body}</p>
            <div className="process-panel__note">
              <span className="process-panel__note-dot" aria-hidden="true" />
              <span>{item.note}</span>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
```
Tone variants:
- `.process-panel--mist`: `background: var(--mist)`
- `.process-panel--paper`: `background: var(--canvas); box-shadow: 0 24px 64px color-mix(in srgb, var(--ink) 9%, transparent)`
- `.process-panel--lime`: `background: var(--accent)`

