---
name: launch48-design
description: Design system guidelines, styling tokens, typography scales, layout grids, Phosphor icons, Motion v13 animation physics, and component patterns for the launch48 website. Use whenever creating, styling, refactoring, or reviewing any UI component, page section, or interaction in this project to ensure pixel-perfect visual and behavioral consistency.
---

# launch48 Design System & UI Consistency Skill

This skill enforces the exact visual language, layout structure, typography rules, interaction physics, and component patterns of the **launch48** website.

Whenever building or modifying any user interface element in this codebase, you must follow these rules to guarantee that new work is indistinguishable from the existing production site.

---

## 1. Core Aesthetic Philosophy

- **Editorial Brutalism & Swiss Minimalism**: Unflinching typography, disciplined whitespace, tactile physical realism, and architectural hairline gridlines.
- **Radical Restraint**: 95% neutral warm paper/ink tones with intentional, high-voltage pops of electric lime (`#b8f34a`).
- **No Generic SaaS Clichés**: Never add purple/blue gradients, floating testimonial carousels, bubbly cards, multi-tier pricing cards, or generic pill tags.
- **Physicality & Precision**: Visuals feature 3D depth, subtle ambient shadows, and sculptural planes (metal, glass edges, crisp creases).

---

## 2. The Six Inviolable Design Laws

### Law 1: Never Hardcode Colors or Guess Tokens
- **Strict Color Tokens**: Only use the official CSS variables:
  - `--canvas` (`#f3f3ee`): Warm off-white page background.
  - `--paper` (`#fbfbf7`): Elevated crisp surface for alternating sections and cards.
  - `--mist` (`#e8e8e0`): Subtle neutral grey for secondary step surfaces and disabled buttons.
  - `--ink` (`#11110f`): Deep warm charcoal/black for primary text and dominant buttons.
  - `--muted` (`#66665e`): Neutral slate for secondary descriptions, metadata, and subheadings.
  - `--line` (`#d6d6cd`): Hairline border color for architectural grids and dividers.
  - `--accent` (`#b8f34a`): Volt electric lime for hover states, selection, callouts, and key accents.
- For detailed color values and contrast rules, see [design-tokens.md](./references/design-tokens.md).

### Law 2: The Header is the ONLY Glass Surface
- **No Gratuitous Glassmorphism**: `.site-header__inner` is the single persistent glass element on the site (`backdrop-filter: blur(18px) saturate(135%)`). All other cards, panels, and sections must be solid surfaces (`--canvas`, `--paper`, `--mist`, or `--accent`).

### Law 3: Exclusively Use `@phosphor-icons/react`
- Never import Lucide, Heroicons, FontAwesome, or craft inline SVGs.
- **SSR vs. CSR Import Convention**:
  - In Server Components: `import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";`
  - In Client Components: `import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";`
- **Icon Weights**:
  - Actions/Buttons: `weight="bold"` (e.g. `ArrowUpRight` at size 16 or 18).
  - Accordions/Controls: `weight="regular"` (e.g. `Plus` at size 24).

### Law 4: Physics-Driven Motion with Mandatory Reduced Motion Fallback
- Motion uses **Motion v13** (`motion/react`).
- Always use spring physics rather than bouncy or linear easing:
  - Magnetic buttons: `{ stiffness: 420, damping: 32, mass: 0.22 }`
  - 3D visual tilts: `{ stiffness: 130, damping: 24, mass: 0.55 }`
- **Accessibility Requirement**: Every interactive component with motion must import and check `usePrefersReducedMotion()`. If enabled, suppress motion values and transforms.
- For complete physics equations and code patterns, see [motion-and-accessibility.md](./references/motion-and-accessibility.md).

### Law 5: Asymmetrical Editorial Grids & Tight Tracking
- Large display headings must use negative tracking (`letter-spacing: -0.082em` to `-0.088em`) and compact leading (`line-height: 0.82` to `0.87`).
- Always constrain heading line length (`max-width: 8ch` to `12ch`).
- Use asymmetrical 2-column grid splits on desktop:
  - Dominant side: `minmax(0, 1.3fr)` to `minmax(0, 1.45fr)`.
  - Secondary/sidebar side: `minmax(18rem, 0.55fr)` to `minmax(20rem, 0.72fr)`.
  - Sticky sidebars on desktop: Sticky pricing `$149` figure and sticky FAQ heading at `top: 7rem`.

### Law 6: Zero Placeholder Code & Fully Wired States
- No dummy links (`href="#"` or unhandled clicks).
- When a link destination is configurable via environment variables (like OxaPay checkout), handle the pending state with `.checkout-link--disabled` and `aria-disabled="true"`.
- Never insert fake testimonial avatars or placeholder copy.

---

## 3. Core Component Recipes Quick Reference

Before creating any UI element, consult the verified component recipes:
- **Buttons & Links**: [component-recipes.md#buttons--links](./references/component-recipes.md#buttons--links)
  - Pill CTA with magnetic cursor pull (`.checkout-link`).
  - Animated underline text link (`.text-link`).
- **Layout & Structure**: [component-recipes.md#layout--structure](./references/component-recipes.md#layout--structure)
  - Floating island header (`.site-header`).
  - Architectural 2-column grid (`.included-grid`).
- **Interactive Patterns**: [component-recipes.md#interactive-patterns](./references/component-recipes.md#interactive-patterns)
  - Native exclusive accordion (`<details name="...">` with rotating Phosphor `Plus`).
  - Stacking sticky scroll cards (`.process-step` / `.process-panel`).
  - 3D interactive visual plane (`.hero-visual` / `.proof-visual`).

---

## 4. Pre-Flight UI Verification Checklist

Before finalizing any new UI component or page modification:

1. [ ] **Color Check**: Are all colors derived from `:root` CSS variables? (No raw hex codes or stock Tailwind blue/gray classes).
2. [ ] **Typography Check**: Does the heading have tight negative letter spacing (`-0.08em`), tight line-height (`< 0.9`), and a restrained character width (`max-width: 8-12ch`)?
3. [ ] **Icon Check**: Are icons sourced exclusively from `@phosphor-icons/react` using the correct SSR/CSR path?
4. [ ] **Motion Check**: Does every `motion/react` component consume `usePrefersReducedMotion()` and provide graceful static fallbacks?
5. [ ] **Mobile Parity Check**: Does the layout gracefully collapse from desktop split/sticky into clean vertical stacks on mobile (`@media (max-width: 47.99rem)`)?
6. [ ] **Build & Type Check**: Did you run `npm run typecheck` and `npm run lint` to verify zero errors?
