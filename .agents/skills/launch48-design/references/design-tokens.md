# launch48 Design Tokens Reference

This document provides the canonical design tokens, color formulas, typography clamp scales, and layout variables used throughout launch48.

---

## 1. Color System

All colors are defined as CSS variables in `:root` inside `src/app/globals.css`.

| Variable | Hex Value | Semantic Purpose | Notes |
| :--- | :--- | :--- | :--- |
| `--canvas` | `#f3f3ee` | Default page background, panel surface | Warm architectural off-white / putty |
| `--paper` | `#fbfbf7` | Elevated content sections, cards | Crisp warm white |
| `--mist` | `#e8e8e0` | Subtle contrast panels, disabled CTAs | Neutral stone grey |
| `--ink` | `#11110f` | Headings, primary text, dark CTA buttons | Deep charcoal/black |
| `--muted` | `#66665e` | Secondary body copy, intro text, captions | Warm slate/stone |
| `--line` | `#d6d6cd` | Grid lines, table borders, dividers | Fine architectural hairline |
| `--accent` | `#b8f34a` | Selection highlight, hover pop, lime panels | Volt electric lime |

### High-Contrast Mode Overrides (`@media (prefers-contrast: more)`)
When higher contrast is requested:
- `--muted`: `#44443f`
- `--line`: `#9f9f96`
- Borders on panels and visual planes snap directly to `var(--ink)`.

### Translucency & `color-mix` Formulas
Do not use arbitrary alpha channel hexes (e.g. `#11110f20`). Use `color-mix`:
- **Subtle borders**: `1px solid color-mix(in srgb, var(--ink) 9%, transparent)`
- **Standard panel borders**: `1px solid color-mix(in srgb, var(--ink) 10%, transparent)`
- **Header border**: `1px solid color-mix(in srgb, var(--ink) 11%, transparent)`
- **Header glass background**: `color-mix(in srgb, var(--paper) 82%, transparent)` with `backdrop-filter: blur(18px) saturate(135%)`
- **Ambient soft shadow**: `box-shadow: 0 28px 80px color-mix(in srgb, var(--ink) 8%, transparent)`
- **Accent shadow**: `box-shadow: 0 12px 30px color-mix(in srgb, var(--accent) 28%, transparent)`

---

## 2. Typography Scales & Rules

The font stacks are powered by `next/font/google`:
- **Sans**: Geist (`var(--font-geist-sans)`), Arial, sans-serif
- **Mono**: Geist Mono (`var(--font-geist-mono)`), monospace

### Heading Scales & Tracking Rules

| Role | Font Size CSS | Weight | Line Height | Letter Spacing | Line Width Limit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero H1** | `clamp(4.2rem, 7.85vw, 8.65rem)` | 635 | 0.85 | `-0.085em` | `max-width: 12ch` |
| **Section H2** | `clamp(3.5rem, 7.8vw, 8.4rem)` | 625 | 0.87 | `-0.082em` | `max-width: 8ch` to `10ch` |
| **Process Panel H3** | `clamp(4rem, 9.3vw, 10rem)` | 630 | 0.82 | `-0.088em` | `max-width: 8ch` |
| **Giant Metric (48 / $149)** | `clamp(9rem, 25vw, 27rem)` | 650 | 0.72 | `-0.105em` | N/A |
| **Pricing Sticky Figure** | `clamp(7rem, 16.5vw, 17rem)` | 640 | 0.72 | `-0.11em` | N/A |
| **Panel / List Strong Title** | `clamp(1.2rem, 1.6vw, 1.55rem)` | 650 | 1.2 | `-0.045em` | N/A |
| **FAQ Question** | `clamp(1.25rem, 2vw, 1.8rem)` | 570 | 1.2 | `-0.045em` | N/A |

### Body, Subtitles & Metadata

| Role | Font Size CSS | Weight | Line Height | Letter Spacing | Color |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Intro / Lead Copy** | `clamp(1rem, 1.25vw, 1.22rem)` | 400 | 1.5 | `-0.035em` | `var(--muted)` |
| **Section Lead Copy** | `clamp(1rem, 1.25vw, 1.18rem)` | 400 | 1.5 | `-0.03em` | `var(--muted)` |
| **Body / Description** | `0.93rem` to `1rem` | 400 | 1.55 to 1.62 | `-0.02em` to `-0.025em` | `var(--muted)` |
| **Technical Note (Mono)** | `clamp(0.68rem, 0.8vw, 0.8rem)` | 400 | 1.55 | `-0.025em` | `var(--ink)` (font: Mono) |
| **Metadata Tag (Mono)** | `0.72rem` | 400 | 1.0 | `0.08em` (uppercase) | `var(--ink)` at 55% opacity |
| **Nav & Button Label** | `0.78rem` to `0.86rem` | 620 to 680 | 1.0 | `-0.015em` to `-0.025em` | `var(--paper)` or `var(--muted)` |
| **Footer Microcopy** | `0.74rem` | 400 | 1.4 | `-0.015em` | `var(--muted)` |

---

## 3. Layout & Geometry

```css
:root {
  --header-height: 4.25rem;
  --page-gutter: clamp(1rem, 2.4vw, 2.75rem);
  --page-width: 94rem;
  --radius-large: clamp(1.5rem, 2.4vw, 2.25rem);
}
```

### Mobile Overrides (`@media (max-width: 47.99rem)`)
```css
:root {
  --header-height: 3.75rem;
  --page-gutter: 1rem;
}
```

### Radii Hierarchy
- **Pills / CTAs**: `border-radius: 999px`
- **Header Floating Island**: `border-radius: 1.15rem` (desktop), `1rem` (mobile)
- **Large Panels / Visual Frames**: `border-radius: var(--radius-large)` (`clamp(1.5rem, 2.4vw, 2.25rem)`)
- **Internal Cards / Dividers**: Sharp rectangular corners connected by architectural `1px solid var(--line)`.

---

## 4. Breakpoints & Media Query Strategy

launch48 uses 3 primary responsive breakpoints:
1. **Desktop Large**: Default styles (> `68.75rem` / 1100px)
2. **Desktop Medium / Tablet Landscape**: `@media (max-width: 68.75rem)` (1100px)
   - Tightens grid gaps, scales down giant hero headers.
3. **Mobile / Tablet Portrait**: `@media (max-width: 47.99rem)` (768px)
   - Converts 2-column asymmetric grids to single column.
   - Converts sticky scroll stacks into vertical static sequences.
   - Hides navigation links and keeps compact header.
4. **Small Mobile**: `@media (max-width: 25rem)` (400px)
   - Collapses CTA text to "$149".
