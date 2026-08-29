# launch48 Motion Physics & Accessibility Reference

This document outlines the animation standards, Motion v13 spring parameters, pointer interactions, and accessibility compliance rules for launch48.

---

## 1. Physics Parameters

All animations must feel tactile, weighted, and physical. Never use cartoonish high-bounce curves or robotic linear transitions.

### Button Magnetic Spring
Used for cursor-pull on `.checkout-link`:
```ts
export const buttonSpring = {
  stiffness: 420,
  damping: 32,
  mass: 0.22,
};
```
- **Range**: Pointer offset multiplied by `8` (X axis) and `6` (Y axis).
- **On Tap**: `scale: 0.97` with spring transition `{ type: "spring", bounce: 0, duration: 0.36 }`.

### 3D Plane Tilt Spring
Used for interactive visual showcases (`HeroVisual` and `ProofVisual`):
```ts
export const visualSpring = {
  stiffness: 130,
  damping: 24,
  mass: 0.55,
};
```
- **Perspective**: `transformPerspective: 1200` to `1500`.
- **Rotation Range**:
  - `rotateY`: `[-4.5deg, 4.5deg]` (Hero) or `[-2.2deg, 2.2deg]` (Proof).
  - `rotateX`: `[4deg, -4deg]` (Hero) or `[1.8deg, -1.8deg]` (Proof).
- **Parallax Offset**:
  - Background image moves `[-12px, 12px]`.
  - Foreground text moves `[6px, -6px]` (inverse direction for physical depth).

---

## 2. Scroll-Driven Sequences

### Motion Values & Transforms
When implementing scroll-driven animations with `useScroll`:
- Always bind target using a `ref`:
  ```tsx
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  ```
- Use clamped step ranges rather than full-length animations so each piece has resting reading time:
  ```tsx
  // Opacity: fades in, stays visible, fades out
  const opacity = useTransform(progress, [0, 0.035, 0.2, 0.29], [0, 1, 1, 0]);
  const y = useTransform(progress, [0, 0.035, 0.2, 0.29], [72, 0, 0, -72]);
  ```

---

## 3. Accessibility & Reduced Motion

Every motion-powered component in launch48 **must** support users who prefer reduced motion.

### Hook: `usePrefersReducedMotion`
Location: `src/hooks/use-prefers-reduced-motion.ts`
```ts
"use client";

import { useSyncExternalStore } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribe(listener: () => void) {
  const mediaQuery = window.matchMedia(reducedMotionQuery);
  mediaQuery.addEventListener("change", listener);
  return () => mediaQuery.removeEventListener("change", listener);
}

function getSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getServerSnapshot() {
  return false;
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

### Component Integration Pattern
```tsx
const reduceMotion = usePrefersReducedMotion();

return (
  <motion.div
    style={reduceMotion ? undefined : { x, y, rotate }}
    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
  >
    {/* Content */}
  </motion.div>
);
```

### CSS Reduced Motion Fallbacks
Inside `src/app/globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .hero-line,
  .hero-copy__intro,
  .hero-actions {
    opacity: 1;
    transform: none;
  }

  .checkout-link,
  .hero-visual,
  .hero-visual__plane,
  .proof-visual,
  .proof-visual__image-wrap,
  .proof-visual__copy,
  .process-panel {
    transform: none !important;
  }
}
```

---

## 4. Other Environmental Media Queries

### Reduced Transparency
```css
@media (prefers-reduced-transparency: reduce) {
  .site-header__inner {
    background: var(--paper);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

### High Contrast
```css
@media (prefers-contrast: more) {
  :root {
    --muted: #44443f;
    --line: #9f9f96;
  }

  .site-header__inner,
  .hero-visual__plane,
  .proof-visual,
  .process-panel {
    border-color: var(--ink);
  }
}
```

---

## 5. Rendering Performance

For heavy sections below the fold, use `.deferred-section` to enable modern browser paint optimization:
```css
.deferred-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 60rem;
}
```
Apply this class to the FAQ section, Pricing section, Final callout, and Footer.
