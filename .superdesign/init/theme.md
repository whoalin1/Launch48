# Theme

## Part 1 — Compact token summary

### Framework and CSS approach

- Vanilla CSS; no Tailwind configuration, CSS-in-JS library, component theme provider, or dark-mode theme.
- Global cascade: `app/globals.css` imports `css/site.css`.
- `/example` adds the isolated CSS Module `app/example/example.module.css`, but its rewrite now deliberately reuses the Launch48 paper/ink/rust color and typography language rather than a separate coffee-brand theme.
- Overall art direction: tactile paper, dense ink, a single rust accent, Fraunces display type, Bricolage Grotesque UI text, IBM Plex Mono labels, square geometry, and restrained interaction.

### Global Launch48 color tokens

| Token | Value | Role |
| --- | --- | --- |
| `--paper` | `#efe8da` | Main page background |
| `--paper-2` | `#e4d9c6` | Disabled/configuration surfaces |
| `--cream` | `#f7f1e6` | Light cards and inverse text |
| `--ink` | `#16130f` | Primary text, borders, dark bands |
| `--ink-2` | `#3c362e` | Secondary body copy |
| `--muted` | `#746c60` | Metadata and helper copy |
| `--rule` | `#cfc4af` | Dividers |
| `--accent` | `#c4451c` | Rust CTA/stamp/focus color |
| `--accent-dark` | `#8f2e12` | Rust hover/error color |
| Alert surface | `#f6e4d8` | Error/configuration banner |
| Inverse muted copy | `#d9d0c2` / `#c8b8a4` | Dark CTA-band copy |

No `.dark` or alternate global theme is defined.

### Global typography

- Display: `"Fraunces", "Iowan Old Style", "Palatino Linotype", Palatino, serif`.
- Sans: `"Bricolage Grotesque", "Avenir Next", "Segoe UI", sans-serif`.
- Mono: `"IBM Plex Mono", "SFMono-Regular", ui-monospace, Menlo, monospace`.
- Google Fonts are loaded in `app/layout.tsx`: Fraunces 500/700/900 plus italic 500; Bricolage Grotesque 400/500/600/800; IBM Plex Mono 400/500.
- Global body: 18px, weight 400, line-height 1.55, tracking `-0.01em`.
- Global hero H1: `clamp(2.6rem, 7.2vw, 5.35rem)`, line-height 0.95, weight 700, tracking `-0.035em`.
- Global section H2: `clamp(1.6rem, 3vw, 2.15rem)`, sans 800, line-height 1.05.
- Global CTA-band H2: `clamp(2.1rem, 5vw, 3.6rem)`, line-height 0.98.
- Kicker/index labels: mono, roughly 0.65–0.72rem, uppercase, `0.12em–0.14em` tracking.

### Global sizing, spacing, borders, shadows, motion

- Content maximum: `--max: 1120px`.
- Responsive gutter: `--gutter: clamp(1.1rem, 3.2vw, 2.25rem)`.
- Section vertical padding: `clamp(2.4rem, 6vw, 4.5rem)`.
- Hero vertical padding: `clamp(2.5rem, 7vw, 5.5rem)` top and `clamp(2.2rem, 5vw, 4rem)` bottom.
- Buttons: at least 44px tall; `0.72rem 1.05rem` padding; 1.5px border.
- Border radius: none; the visual system is deliberately square.
- Standard rules: 1px solid `--ink` or `--rule`.
- Ticket shadow: `6px 6px 0 var(--ink)`.
- Stamp: 2px rust border, `rotate(-6deg)`.
- Grain overlay: fixed SVG fractal-noise texture at 0.045 opacity.
- Ease: `cubic-bezier(0.2, 0.7, 0.2, 1)`; button color transitions are 160ms.
- Main global breakpoint: `max-width: 860px`.
- Reduced motion: smooth scrolling removed and transition duration reduced to 0.01ms.

### Rewritten `/example` scoped tokens and scale

The example scopes a near-identical set under `.page` so the sample remains insulated while looking unmistakably like Launch48:

| Example token | Value | Global equivalent |
| --- | --- | --- |
| `--paper` | `#efe8da` | `--paper` |
| `--cream` | `#f7f1e6` | `--cream` |
| `--ink` | `#16130f` | `--ink` |
| `--ink-2` | `#3c362e` | `--ink-2` |
| `--muted` | `#746c60` | `--muted` |
| `--rust` | `#c4451c` | `--accent` |
| `--rust-dark` | `#8f2e12` | `--accent-dark` |
| `--display` | Fraunces stack | Global display stack |
| `--sans` | Bricolage Grotesque stack | Global sans stack |
| `--mono` | IBM Plex Mono stack | Global mono stack |
| `--ease` | `cubic-bezier(0.2, 0.7, 0.2, 1)` | Global ease |

- Example base: 18px, line-height 1.55, tracking `-0.012em`.
- Example content maximum: 1120px with the same `clamp(1.1rem, 3.2vw, 2.25rem)` effective gutter.
- Example hero H1: `clamp(3.65rem, 7.7vw, 7rem)`, line-height 0.88, weight 700; italic word uses rust at weight 500.
- Example main section H2: `clamp(2.45rem, 5.5vw, 4.75rem)`; launch CTA reaches `clamp(2.9rem, 6vw, 5.5rem)`.
- Example method numerals: `clamp(4rem, 8vw, 7.5rem)`.
- Example primary CTAs: minimum 46px, square 1.5px rust borders, 160ms transitions, 1px active translation; the brand, navigation, and footer links enforce 44px touch targets.
- Example surfaces rely on flat paper/cream/ink/rust blocks; inputs explicitly set `border-radius: 0`.
- Example disclosure bar and its CTA link use a 2.75rem minimum height.
- Example focus ring: 3px rust with 4px offset.
- Responsive breakpoints: 900px (major grids collapse), 720px (header/navigation and supporting grids simplify), and 460px (compact mobile typography/actions).
- Reduced-motion media query collapses transition and scroll durations.
- Local identity asset: `public/fieldnote-mark.svg`; hero imagery remains remote Unsplash content.

## Part 2 — Raw source dumps

### `app/globals.css`

```css
@import "../css/site.css";

/* App Router interaction and accessibility additions. */
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

.btn {
  min-height: 44px;
}

.btn:disabled,
.btn-disabled,
.btn-disabled:hover {
  cursor: not-allowed;
  background: var(--paper-2);
  border-color: var(--muted);
  color: var(--muted);
  opacity: 1;
}

.nav .btn:disabled {
  font-family: var(--sans);
  font-size: 0.92rem;
}

.faq-item button:focus-visible {
  outline-offset: -3px;
}

.faq-item .answer[hidden] {
  display: none;
}

.field-control {
  min-width: 0;
}

.field select:focus {
  border-bottom-color: var(--accent);
}

.field input[aria-invalid="true"],
.field textarea[aria-invalid="true"],
.field select[aria-invalid="true"] {
  border-bottom-color: var(--accent);
}

.field-error {
  margin: 0.35rem 0 0;
  color: var(--accent-dark);
  font-family: var(--sans);
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.35;
}

.required-mark {
  color: var(--accent);
}

.banner.show {
  display: block;
  margin-top: 1rem;
}

.banner.config-banner {
  color: var(--ink-2);
  border-color: var(--ink);
  background: var(--paper-2);
}

.form-actions .note {
  flex: 1 1 18rem;
  margin: 0;
}

.ticket-copy-link {
  margin-top: 1.2rem;
}

.ticket-copy-link a {
  font-weight: 600;
}

.price-actions {
  margin-top: 1.3rem;
}

.cta-band .cta-kicker {
  color: #c8b8a4;
}

.cta-band .cta-ghost {
  color: var(--cream);
  border-color: var(--cream);
}

.cta-band .cta-ghost:hover {
  color: var(--ink);
  background: var(--cream);
  border-color: var(--cream);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 860px) {
  .field label {
    padding-top: 0;
  }

  .nav .btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

### `css/site.css`

```css
/* Launch48 — studio system. Paper, ink, one rust stamp. */
:root {
  --paper: #efe8da;
  --paper-2: #e4d9c6;
  --cream: #f7f1e6;
  --ink: #16130f;
  --ink-2: #3c362e;
  --muted: #746c60;
  --rule: #cfc4af;
  --accent: #c4451c;
  --accent-dark: #8f2e12;
  --max: 1120px;
  --gutter: clamp(1.1rem, 3.2vw, 2.25rem);
  --display: "Fraunces", "Iowan Old Style", "Palatino Linotype", Palatino, serif;
  --sans: "Bricolage Grotesque", "Avenir Next", "Segoe UI", sans-serif;
  --mono: "IBM Plex Mono", "SFMono-Regular", ui-monospace, Menlo, monospace;
  --ease: cubic-bezier(0.2, 0.7, 0.2, 1);
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--display);
  font-optical-sizing: auto;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.55;
  letter-spacing: -0.01em;
  min-height: 100%;
}

body::before {
  content: "";
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.045;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

img, svg { display: block; max-width: 100%; }
a { color: inherit; text-decoration-thickness: 1px; text-underline-offset: 0.18em; }
a:hover { color: var(--accent); }
button, input, textarea, select { font: inherit; color: inherit; }
button { cursor: pointer; }

.skip {
  position: absolute;
  left: -999px;
  top: 0;
}
.skip:focus {
  left: var(--gutter);
  top: 0.5rem;
  z-index: 50;
  background: var(--ink);
  color: var(--cream);
  padding: 0.4rem 0.7rem;
}

.wrap {
  position: relative;
  z-index: 1;
  width: min(var(--max), calc(100% - var(--gutter) * 2));
  margin-inline: auto;
}

.kicker {
  font-family: var(--mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

/* Header */
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: color-mix(in srgb, var(--paper) 88%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--rule);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4.25rem;
}
.wordmark {
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
  text-decoration: none;
  color: var(--ink);
}
.wordmark strong {
  font-family: var(--sans);
  font-weight: 800;
  font-size: 1.15rem;
  letter-spacing: -0.04em;
}
.wordmark span {
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.nav {
  display: flex;
  align-items: center;
  gap: 1.35rem;
}
.nav a {
  font-family: var(--sans);
  font-size: 0.92rem;
  font-weight: 500;
  text-decoration: none;
  letter-spacing: -0.02em;
}
.nav a:hover { color: var(--accent); }
.menu-toggle {
  display: none;
  background: none;
  border: 1px solid var(--ink);
  padding: 0.35rem 0.55rem;
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  font-family: var(--sans);
  font-weight: 600;
  font-size: 0.92rem;
  letter-spacing: -0.02em;
  text-decoration: none;
  border: 1.5px solid var(--ink);
  padding: 0.72rem 1.05rem;
  background: var(--ink);
  color: var(--cream);
  transition: background 160ms var(--ease), color 160ms var(--ease), border-color 160ms var(--ease);
}
.btn:hover { background: var(--accent); border-color: var(--accent); color: var(--cream); }
.btn-ghost {
  background: transparent;
  color: var(--ink);
}
.btn-ghost:hover { background: var(--ink); color: var(--cream); border-color: var(--ink); }
.btn-accent {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--cream);
}
.btn-accent:hover { background: var(--accent-dark); border-color: var(--accent-dark); }

/* Hero */
.hero {
  padding: clamp(2.5rem, 7vw, 5.5rem) 0 clamp(2.2rem, 5vw, 4rem);
  border-bottom: 1px solid var(--rule);
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: clamp(1.5rem, 4vw, 3.5rem);
  align-items: end;
}
.hero h1 {
  font-family: var(--display);
  font-weight: 700;
  font-optical-sizing: auto;
  font-size: clamp(2.6rem, 7.2vw, 5.35rem);
  line-height: 0.95;
  letter-spacing: -0.035em;
  margin: 0.55rem 0 1rem;
}
.hero h1 em {
  font-style: italic;
  font-weight: 500;
  color: var(--accent);
}
.lede {
  font-size: clamp(1.05rem, 1.7vw, 1.28rem);
  line-height: 1.45;
  max-width: 36rem;
  color: var(--ink-2);
  margin: 0 0 1.6rem;
}
.hero-actions { display: flex; flex-wrap: wrap; gap: 0.7rem; }

.ticket {
  background: var(--cream);
  border: 1px solid var(--ink);
  padding: 1.15rem 1.15rem 1.05rem;
  box-shadow: 6px 6px 0 var(--ink);
  position: relative;
}
.ticket::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 2.55rem;
  border-top: 1px dashed var(--rule);
}
.ticket-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 0.85rem;
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.ticket-body { padding-top: 1.05rem; }
.ticket .price {
  font-family: var(--sans);
  font-weight: 800;
  font-size: clamp(2.4rem, 4vw, 3.1rem);
  letter-spacing: -0.05em;
  line-height: 1;
}
.ticket .price small {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--muted);
  margin-left: 0.25rem;
}
.ticket dl {
  margin: 1rem 0 0;
  display: grid;
  gap: 0.45rem;
}
.ticket dt {
  font-family: var(--mono);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.ticket dd { margin: 0; font-family: var(--sans); font-weight: 500; font-size: 0.95rem; }
.stamp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  padding: 0.35rem 0.55rem;
  border: 2px solid var(--accent);
  color: var(--accent);
  font-family: var(--sans);
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transform: rotate(-6deg);
}

/* Sections */
section { padding: clamp(2.4rem, 6vw, 4.5rem) 0; }
.section-head {
  display: grid;
  grid-template-columns: 8rem 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--ink);
}
.section-head h2 {
  margin: 0;
  font-family: var(--sans);
  font-weight: 800;
  font-size: clamp(1.6rem, 3vw, 2.15rem);
  letter-spacing: -0.04em;
  line-height: 1.05;
}
.idx {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  padding-top: 0.4rem;
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--ink);
}
.step {
  padding: 1.4rem 1.25rem 1.3rem;
  border-right: 1px solid var(--ink);
}
.step:last-child { border-right: 0; }
.step-num {
  font-family: var(--mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  color: var(--accent);
  margin-bottom: 0.7rem;
}
.step h3 {
  margin: 0 0 0.45rem;
  font-family: var(--sans);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}
.step p { margin: 0; color: var(--ink-2); }

.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border: 1px solid var(--ink);
}
.split article {
  padding: 1.5rem 1.4rem 1.6rem;
}
.split article + article { border-left: 1px solid var(--ink); }
.split h3 {
  font-family: var(--sans);
  margin: 0 0 1rem;
  font-size: 1.15rem;
  letter-spacing: -0.03em;
}
.split ul { margin: 0; padding: 0; list-style: none; }
.split li {
  display: grid;
  grid-template-columns: 1.1rem 1fr;
  gap: 0.55rem;
  padding: 0.55rem 0;
  border-top: 1px solid var(--rule);
  font-size: 1.02rem;
}
.split li:first-of-type { border-top: 0; }
.mark-yes, .mark-no {
  font-family: var(--mono);
  font-size: 0.85rem;
  padding-top: 0.12rem;
}
.mark-yes { color: var(--accent); }
.mark-no { color: var(--muted); }

.price-block {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: start;
}
.price-copy h3 {
  font-family: var(--display);
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0 0 0.8rem;
}
.fine { color: var(--ink-2); max-width: 34rem; }

.faq-list { border-top: 1px solid var(--ink); }
.faq-item { border-bottom: 1px solid var(--ink); }
.faq-item button {
  width: 100%;
  text-align: left;
  background: none;
  border: 0;
  padding: 1.05rem 0;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-family: var(--sans);
  font-weight: 650;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
}
.faq-item button span {
  font-family: var(--mono);
  font-weight: 400;
  color: var(--accent);
}
.faq-item .answer {
  display: none;
  padding: 0 0 1.15rem;
  color: var(--ink-2);
  max-width: 44rem;
}
.faq-item.open .answer { display: block; }

.cta-band {
  background: var(--ink);
  color: var(--cream);
  padding: clamp(2.6rem, 6vw, 4.4rem) 0;
}
.cta-band h2 {
  font-size: clamp(2.1rem, 5vw, 3.6rem);
  line-height: 0.98;
  letter-spacing: -0.035em;
  margin: 0 0 0.8rem;
  font-weight: 700;
}
.cta-band p { color: #d9d0c2; max-width: 36rem; }
.cta-band .btn { border-color: var(--cream); }
.cta-band .btn-accent { border-color: var(--accent); }
.cta-actions { display: flex; flex-wrap: wrap; gap: 0.7rem; margin-top: 1.4rem; }

.site-footer {
  border-top: 1px solid var(--rule);
  padding: 1.4rem 0 2rem;
  font-family: var(--sans);
  font-size: 0.88rem;
}
.footer-inner {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  color: var(--muted);
}
.footer-inner a { text-decoration: none; }
.footer-links { display: flex; gap: 1.1rem; }

/* Forms */
.page-intro { padding: 2.4rem 0 0.4rem; }
.page-intro h1 {
  font-size: clamp(2.2rem, 5.5vw, 4rem);
  line-height: 0.98;
  letter-spacing: -0.035em;
  margin: 0.4rem 0 0.7rem;
}
.form-shell {
  display: grid;
  grid-template-columns: 1.4fr 0.7fr;
  gap: 2rem;
  padding-bottom: 3.5rem;
}
form.brief {
  background: var(--cream);
  border: 1px solid var(--ink);
  padding: 0.2rem 0;
}
.field {
  display: grid;
  grid-template-columns: 11.5rem 1fr;
  gap: 1rem;
  padding: 0.95rem 1.15rem;
  border-bottom: 1px solid var(--rule);
  align-items: start;
}
.field:last-of-type { border-bottom: 1px solid var(--ink); }
.field label {
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding-top: 0.55rem;
  color: var(--muted);
}
.field input, .field textarea, .field select {
  width: 100%;
  background: transparent;
  border: 0;
  border-bottom: 1px solid transparent;
  padding: 0.45rem 0;
  outline: none;
}
.field input:focus, .field textarea:focus { border-bottom-color: var(--accent); }
.field textarea { min-height: 5.5rem; resize: vertical; }
.form-actions { padding: 1.1rem 1.15rem 1.2rem; display: flex; gap: 0.7rem; flex-wrap: wrap; align-items: center; }
.note { font-size: 0.92rem; color: var(--muted); }
.banner {
  display: none;
  margin: 0 1.15rem 1.1rem;
  padding: 0.85rem 1rem;
  border: 1.5px solid var(--accent);
  color: var(--accent-dark);
  background: #f6e4d8;
  font-family: var(--sans);
  font-weight: 600;
}
.banner.show { display: block; }

.legal {
  max-width: 42rem;
  padding-bottom: 4rem;
}
.legal h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  letter-spacing: -0.03em;
  margin: 0.3rem 0 0.4rem;
}
.legal .meta { font-family: var(--mono); font-size: 0.72rem; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; }
.legal h2 {
  font-family: var(--sans);
  font-size: 1.15rem;
  margin: 2rem 0 0.5rem;
  letter-spacing: -0.02em;
}
.legal p, .legal li { color: var(--ink-2); }
.legal ul { padding-left: 1.1rem; }

@media (max-width: 860px) {
  .hero-grid, .steps, .split, .price-block, .form-shell, .section-head, .field {
    grid-template-columns: 1fr;
  }
  .step, .split article + article { border-right: 0; border-left: 0; border-top: 1px solid var(--ink); }
  .nav { display: none; }
  .nav.open {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: absolute;
    left: 0; right: 0; top: 100%;
    background: var(--paper);
    border-bottom: 1px solid var(--ink);
    padding: 1rem var(--gutter) 1.2rem;
    gap: 0.85rem;
  }
  .menu-toggle { display: inline-flex; }
  .site-header { position: relative; }
  .header-inner { position: relative; }
  .section-head { gap: 0.35rem; }
}
```

### `app/example/example.module.css`

```css
.page {
  --paper: #efe8da;
  --cream: #f7f1e6;
  --ink: #16130f;
  --ink-2: #3c362e;
  --muted: #746c60;
  --rust: #c4451c;
  --rust-dark: #8f2e12;
  --display: "Fraunces", "Iowan Old Style", "Palatino Linotype", Palatino, serif;
  --sans: "Bricolage Grotesque", "Avenir Next", "Segoe UI", sans-serif;
  --mono: "IBM Plex Mono", "SFMono-Regular", ui-monospace, Menlo, monospace;
  --ease: cubic-bezier(0.2, 0.7, 0.2, 1);

  min-height: 100vh;
  overflow-x: clip;
  position: relative;
  z-index: 1;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 18px;
  font-optical-sizing: auto;
  line-height: 1.55;
  letter-spacing: -0.012em;
}

.page,
.page *,
.page *::before,
.page *::after {
  box-sizing: border-box;
}

.page a {
  color: inherit;
}

.page img,
.page svg {
  display: block;
  max-width: 100%;
}

.page button,
.page input {
  font: inherit;
}

.page :focus-visible {
  outline: 3px solid var(--rust);
  outline-offset: 4px;
}

.wrap {
  width: min(1120px, calc(100% - 2 * clamp(1.1rem, 3.2vw, 2.25rem)));
  margin-inline: auto;
}

.skip {
  position: fixed;
  left: 1rem;
  top: -5rem;
  z-index: 100;
  background: var(--ink);
  color: var(--cream) !important;
  padding: 0.65rem 0.9rem;
  font-family: var(--mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  text-decoration: none;
}

.skip:focus {
  top: 1rem;
}

.sampleBar {
  background: var(--rust);
  color: var(--cream);
  font-family: var(--mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.sampleBarInner {
  min-height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.sampleBar a {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  gap: 0.35rem;
  font-weight: 500;
  text-decoration: none;
}

.sampleMobile {
  display: none;
}

.header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: color-mix(in srgb, var(--paper) 94%, transparent);
  backdrop-filter: blur(12px);
}

.headerInner {
  min-height: 5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.mark {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  flex: 0 0 auto;
  color: var(--rust) !important;
  text-decoration: none;
}

.mark img {
  width: 36px;
  height: 36px;
}

.mark strong {
  display: block;
  color: var(--ink);
  font-family: var(--sans);
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1;
}

.mark small {
  display: block;
  margin-top: 0.22rem;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.59rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  line-height: 1;
  text-transform: uppercase;
}

.nav {
  display: flex;
  align-items: center;
  gap: clamp(0.9rem, 2.2vw, 1.6rem);
}

.nav > a {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  font-size: 0.86rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  text-decoration: none;
  transition: color 150ms var(--ease), background 150ms var(--ease);
}

.nav > a:hover {
  color: var(--rust);
}

.nav .headerCta {
  padding: 0.58rem 0.85rem;
  border: 1.5px solid var(--ink);
  background: var(--ink);
  color: var(--cream);
}

.nav .headerCta:hover {
  border-color: var(--rust);
  background: var(--rust);
  color: var(--cream);
}

.hero {
  min-height: min(760px, calc(100vh - 7.65rem));
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(360px, 0.98fr);
  align-items: center;
  gap: clamp(2.25rem, 6vw, 5.8rem);
  padding-block: clamp(3rem, 7vw, 6.4rem) clamp(5.5rem, 9vw, 8.5rem);
}

.heroCopy {
  max-width: 39rem;
}

.kicker,
.waitlistKicker,
.launchKicker,
.lotType,
.methodLabel {
  margin: 0;
  color: var(--rust);
  font-family: var(--mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  line-height: 1.4;
  text-transform: uppercase;
}

.hero h1 {
  margin: 0.65rem 0 1.35rem;
  font-family: var(--display);
  font-size: clamp(3.65rem, 7.7vw, 7rem);
  font-weight: 700;
  letter-spacing: -0.055em;
  line-height: 0.88;
}

.hero h1 em {
  color: var(--rust);
  font-style: italic;
  font-weight: 500;
}

.heroLead {
  max-width: 35rem;
  margin: 0;
  color: var(--ink-2);
  font-size: clamp(1.04rem, 1.65vw, 1.2rem);
  line-height: 1.5;
}

.heroActions,
.launchActions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
  margin-top: 1.8rem;
}

.button,
.waitlistButton,
.launchButton,
.launchGhost {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.72rem 1rem;
  border: 1.5px solid var(--rust);
  background: var(--rust);
  color: var(--cream) !important;
  font-weight: 700;
  letter-spacing: -0.025em;
  text-decoration: none;
  transition: background 160ms var(--ease), border-color 160ms var(--ease), color 160ms var(--ease), transform 160ms var(--ease);
}

.button:hover,
.waitlistButton:hover,
.launchButton:hover {
  border-color: var(--rust-dark);
  background: var(--rust-dark);
}

.button:active,
.waitlistButton:active,
.launchButton:active,
.launchGhost:active {
  transform: translateY(1px);
}

.textLink {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.72rem 0.35rem;
  font-weight: 700;
  text-decoration: none;
}

.textLink:hover {
  color: var(--rust);
}

.heroVisual {
  position: relative;
  margin: 0;
  padding-bottom: 1.8rem;
}

.heroImage {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: 52% center;
}

.roastNote {
  position: absolute;
  left: clamp(-2.8rem, -4vw, -1.2rem);
  bottom: 0;
  width: min(19rem, 76%);
  padding: 1.25rem 1.35rem 1.15rem;
  background: var(--cream);
  color: var(--ink);
}

.roastNote > span {
  display: block;
  margin-bottom: 0.65rem;
  color: var(--rust);
  font-family: var(--mono);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.roastNote > strong {
  display: block;
  font-family: var(--display);
  font-size: 1.55rem;
  letter-spacing: -0.035em;
  line-height: 1.05;
}

.roastNote > p {
  margin: 0.45rem 0 0.9rem;
  color: var(--ink-2);
  font-size: 0.92rem;
}

.roastNote dl {
  display: flex;
  gap: 1.5rem;
  margin: 0;
}

.roastNote dl div {
  min-width: 4rem;
}

.roastNote dt {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.roastNote dd {
  margin: 0.1rem 0 0;
  font-size: 0.82rem;
  font-weight: 700;
}

.heroVisual figcaption {
  margin: 0.75rem 0 0;
  padding-left: max(0px, calc(19rem - 2.8rem + 1rem));
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.61rem;
  letter-spacing: 0.09em;
  line-height: 1.45;
  text-transform: uppercase;
}

.method,
.lots,
.detailsSection,
.launchCta {
  scroll-margin-top: 5rem;
}

.method {
  padding-block: clamp(4.5rem, 9vw, 8rem);
  background: var(--cream);
}

.sectionIntro {
  max-width: 47rem;
}

.sectionIntro h2,
.waitlist h2,
.launchCta h2 {
  margin: 0.75rem 0 1rem;
  font-family: var(--display);
  font-size: clamp(2.45rem, 5.5vw, 4.75rem);
  font-weight: 700;
  letter-spacing: -0.05em;
  line-height: 0.96;
}

.sectionIntro > p:last-child {
  max-width: 39rem;
  margin: 0;
  color: var(--ink-2);
  font-size: clamp(1rem, 1.6vw, 1.16rem);
}

.methodGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(2rem, 5vw, 5rem);
  margin-top: clamp(3rem, 7vw, 5.5rem);
}

.methodGrid article {
  min-width: 0;
}

.methodNumber {
  display: block;
  margin-bottom: 1.6rem;
  color: var(--rust);
  font-family: var(--display);
  font-size: clamp(4rem, 8vw, 7.5rem);
  font-weight: 500;
  letter-spacing: -0.06em;
  line-height: 0.72;
}

.methodLabel {
  margin-bottom: 0.6rem;
}

.methodGrid h3 {
  margin: 0 0 0.7rem;
  font-size: clamp(1.25rem, 2vw, 1.55rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.08;
}

.methodGrid article > p:last-child {
  margin: 0;
  color: var(--ink-2);
  font-size: 0.98rem;
}

.lots {
  padding-block: clamp(4.5rem, 9vw, 8rem);
  background: var(--paper);
}

.lotBoard {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
  gap: clamp(1rem, 2vw, 1.5rem);
  margin-top: clamp(2.8rem, 6vw, 5rem);
}

.featuredLot {
  min-height: 35rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(2rem, 5vw, 4rem);
  background: var(--ink);
  color: var(--cream);
}

.featuredLot .lotType {
  color: var(--rust);
}

.featuredLot h3 {
  margin: 1rem 0 0;
  font-family: var(--display);
  font-size: clamp(3rem, 6vw, 5.7rem);
  font-weight: 500;
  letter-spacing: -0.06em;
  line-height: 0.88;
}

.featuredLot > p {
  max-width: 27rem;
  margin: 3rem 0 0;
  color: color-mix(in srgb, var(--cream) 78%, transparent);
  font-size: 1.08rem;
}

.supportingLots {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 2vw, 1.5rem);
}

.supportingLot,
.millLot {
  padding: clamp(1.5rem, 3vw, 2.35rem);
}

.supportingLot {
  min-height: 22rem;
  background: var(--cream);
}

.supportingLot h3,
.millLot h3 {
  margin: 0.8rem 0 1rem;
  font-family: var(--display);
  font-size: clamp(1.9rem, 3vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 0.98;
}

.supportingLot > strong {
  display: block;
  color: var(--rust);
  font-size: 0.93rem;
  line-height: 1.35;
}

.supportingLot > p:last-child {
  margin: 0.75rem 0 0;
  color: var(--ink-2);
  font-size: 0.92rem;
}

.millLot {
  grid-column: 1 / -1;
  min-height: 11.5rem;
  display: grid;
  grid-template-columns: 0.75fr 1.25fr;
  align-items: end;
  gap: 1.5rem;
  background: var(--rust);
  color: var(--cream);
}

.millLot .lotType {
  color: var(--cream);
}

.millLot h3 {
  margin-bottom: 0;
}

.millLot > p {
  margin: 0;
  font-size: 1rem;
}

.detailsSection {
  padding-block: clamp(4.5rem, 9vw, 8rem);
  background: var(--cream);
}

.detailsGrid {
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(340px, 0.78fr);
  align-items: start;
  gap: clamp(2.5rem, 7vw, 7rem);
}

.faqList {
  display: grid;
  gap: 0.75rem;
  margin-top: 2.5rem;
}

.faqList details {
  padding: 0.95rem 1.1rem;
  background: var(--paper);
}

.faqList summary {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: -0.03em;
  list-style: none;
}

.faqList summary::-webkit-details-marker {
  display: none;
}

.faqMark {
  flex: 0 0 auto;
  color: var(--rust);
  font-family: var(--mono);
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1;
  transition: transform 160ms var(--ease);
}

.faqList details[open] .faqMark {
  transform: rotate(45deg);
}

.faqList details > p {
  max-width: 39rem;
  margin: 0.45rem 2.5rem 0.35rem 0;
  color: var(--ink-2);
  font-size: 0.94rem;
}

.waitlist {
  padding: clamp(2rem, 5vw, 3.5rem);
  background: var(--rust);
  color: var(--cream);
}

.waitlistKicker {
  color: var(--cream);
}

.waitlist h2 {
  font-size: clamp(2.5rem, 5vw, 4rem);
}

.waitlist > p:not(.waitlistKicker):not(.demoNote) {
  margin: 0;
  color: color-mix(in srgb, var(--cream) 82%, transparent);
}

.waitlist form {
  display: grid;
  gap: 0.75rem;
  margin-top: 2rem;
}

.waitlist label {
  font-family: var(--mono);
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.waitlist input {
  width: 100%;
  min-height: 50px;
  padding: 0.72rem 0.85rem;
  border: 1.5px solid var(--cream);
  border-radius: 0;
  outline: none;
  background: transparent;
  color: var(--cream);
}

.waitlist input::placeholder {
  color: color-mix(in srgb, var(--cream) 58%, transparent);
}

.waitlist input:focus {
  border-color: var(--ink);
}

.waitlistButton {
  border-color: var(--ink);
  background: var(--ink);
}

.waitlistButton:hover {
  border-color: var(--cream);
  background: var(--cream);
  color: var(--ink) !important;
}

.demoNote {
  min-height: 1.2rem;
  margin: 1rem 0 0;
  color: var(--cream);
  font-family: var(--mono);
  font-size: 0.63rem;
  letter-spacing: 0.08em;
  line-height: 1.5;
  text-transform: uppercase;
}

.launchCta {
  padding-block: clamp(4rem, 8vw, 7rem);
  background: var(--ink);
  color: var(--cream);
}

.launchCtaGrid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(300px, 0.72fr);
  align-items: end;
  gap: clamp(2.5rem, 7vw, 7rem);
}

.launchKicker {
  color: var(--rust);
}

.launchCta h2 {
  max-width: 43rem;
  margin-bottom: 0;
  font-size: clamp(2.9rem, 6vw, 5.5rem);
  font-weight: 500;
  line-height: 0.91;
}

.launchCopy > p {
  margin: 0;
  color: color-mix(in srgb, var(--cream) 78%, transparent);
}

.launchCopy .guarantee {
  margin-top: 0.9rem;
  color: var(--cream);
  font-weight: 700;
}

.launchGhost {
  border-color: var(--cream);
  background: transparent;
}

.launchGhost:hover {
  background: var(--cream);
  color: var(--ink) !important;
}

.footer {
  padding-block: 1.6rem 2rem;
  background: var(--paper);
  color: var(--muted);
  font-size: 0.82rem;
}

.footerInner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
}

.footer a {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  color: var(--ink);
  font-weight: 700;
  text-decoration: none;
}

.footer a:hover {
  color: var(--rust);
}

@media (max-width: 900px) {
  .hero,
  .lotBoard,
  .detailsGrid,
  .launchCtaGrid {
    grid-template-columns: 1fr;
  }

  .hero {
    min-height: 0;
    gap: 3.2rem;
    padding-top: clamp(3rem, 10vw, 5rem);
  }

  .heroCopy {
    max-width: 42rem;
  }

  .heroVisual {
    width: min(100%, 39rem);
    margin-inline: auto;
  }

  .heroImage {
    aspect-ratio: 5 / 4;
  }

  .roastNote {
    left: 1rem;
    width: min(20rem, calc(100% - 2rem));
  }

  .heroVisual figcaption {
    padding-left: 1rem;
  }

  .methodGrid {
    gap: 2.5rem;
  }

  .featuredLot {
    min-height: 28rem;
  }

  .supportingLot {
    min-height: 18rem;
  }

  .detailsGrid,
  .launchCtaGrid {
    gap: 3.5rem;
  }

  .launchCopy {
    max-width: 42rem;
  }
}

@media (max-width: 720px) {
  .sampleDesktop {
    display: none;
  }

  .sampleMobile {
    display: inline;
  }

  .headerInner {
    min-height: 4.5rem;
  }

  .nav > a:not(.headerCta) {
    display: none;
  }

  .nav .headerCta {
    font-size: 0.8rem;
  }

  .hero {
    padding-bottom: 5.5rem;
  }

  .heroActions {
    align-items: stretch;
    flex-direction: column;
  }

  .button,
  .textLink {
    width: 100%;
  }

  .methodGrid,
  .supportingLots {
    grid-template-columns: 1fr;
  }

  .methodGrid {
    gap: 3rem;
  }

  .methodNumber {
    margin-bottom: 1rem;
    font-size: 4.6rem;
  }

  .supportingLot {
    min-height: 0;
  }

  .millLot {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .launchActions {
    align-items: stretch;
    flex-direction: column;
  }

  .launchButton,
  .launchGhost {
    width: 100%;
  }
}

@media (max-width: 460px) {
  .page {
    font-size: 17px;
  }

  .sampleBarInner {
    width: calc(100% - 1.4rem);
    gap: 0.55rem;
    font-size: 0.56rem;
    letter-spacing: 0.07em;
  }

  .sampleBar a {
    white-space: nowrap;
  }

  .mark img {
    width: 32px;
    height: 32px;
  }

  .mark strong {
    font-size: 0.98rem;
  }

  .mark small {
    font-size: 0.53rem;
  }

  .nav .headerCta {
    min-height: 44px;
    padding-inline: 0.7rem;
    font-size: 0.72rem;
  }

  .hero h1 {
    font-size: clamp(3.2rem, 17vw, 4.25rem);
  }

  .heroVisual {
    padding-bottom: 2.5rem;
  }

  .heroImage {
    aspect-ratio: 4 / 5;
  }

  .roastNote {
    bottom: 1rem;
    padding: 1.05rem;
  }

  .heroVisual figcaption {
    margin-top: 0.2rem;
    padding-left: 0;
  }

  .featuredLot {
    min-height: 24rem;
  }

  .faqList details {
    padding-inline: 0.9rem;
  }

  .waitlist {
    padding: 1.5rem;
  }

  .footerInner {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .page *,
  .page *::before,
  .page *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```
