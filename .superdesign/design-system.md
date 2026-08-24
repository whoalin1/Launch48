# Launch48 `/example` design system

## Product and page purpose

- `/example` is a fictional Fieldnote Coffee landing page that demonstrates the quality of a $349 Launch48 one-page build.
- Its primary job is to make a prospective Launch48 buyer think “my business could look this considered,” then give them a clear path to `/brief`.
- Fieldnote Coffee must always be presented as an original fictional concept. Do not imply it is a customer, a live roaster, or evidence of commercial results.
- Never add testimonials, revenue, conversion metrics, user counts, awards, press logos, customer logos, or other invented proof.

## Visual identity

- Baseline reproduction exception: the current Fieldnote page uses Cormorant Garamond, Hanken Grotesk, dark coffee brown `#16100c`, paper `#f3eadc`, and brass `#c4a056`. Those values are allowed only when reproducing the existing page as ground truth; the refined direction below replaces them.
- Preserve the Launch48 studio language: tactile paper, dense ink, one rust accent, expressive editorial typography, square geometry, and restrained motion.
- Use only the fonts already loaded by `app/layout.tsx`:
  - Display: Fraunces, weights 500/700/900 with italic 500.
  - Sans: Bricolage Grotesque, weights 400/500/600/800.
  - Utility labels only: IBM Plex Mono, weights 400/500.
- Use only this palette:
  - Paper: `#efe8da`
  - Cream: `#f7f1e6`
  - Ink: `#16130f`
  - Secondary ink: `#3c362e`
  - Muted warm gray: `#746c60`
  - Rust: `#c4451c`
  - Dark rust: `#8f2e12`
- Rust is the only saturated accent. Do not introduce gold, brass, tan buttons, gradients, neon colors, or extra brand colors.
- Use square corners throughout. Do not use generic SaaS rounded cards, pills, glass effects, drop shadows, or gradient backgrounds.

## Critical linework constraint

- Remove the current random black/brown decorative linework completely.
- Do not use horizontal rules, vertical rules, card outlines, image borders, section borders, grid-line backgrounds, footer rules, header rules, or ornamental pseudo-element strokes.
- Separate content with whitespace, scale, alignment, and solid tonal blocks.
- Borders are allowed only where interaction requires a clear affordance: buttons and the email input. Keep those borders local to the control, never spanning the page.

## Composition

- Keep the page editorial, asymmetrical, and image-led rather than a stack of equal bordered boxes.
- Preferred sequence:
  1. Compact rust concept bar with one explicit fictional disclosure and a direct “Start your brief — $349” link.
  2. Minimal Fieldnote header with the exact supplied Fieldnote mark, wordmark, two useful anchor links, and a Launch48 brief CTA.
  3. Asymmetric hero: oversized Fraunces headline, concise specific body copy, Fieldnote demo action, Launch48 action, and the supplied coffee photograph art-directed as a large crop. A tactile roast-note artifact may overlap the photograph without using border lines.
  4. Three-step Fieldnote method presented as open editorial columns with large rust numerals, not boxed cards.
  5. A visually weighted three-lot board: one featured lot and two supporting lots using ink/paper/rust tonal surfaces. Copy is illustrative; there is no fake checkout or false availability.
  6. Compact, useful FAQ with visible plus markers and no row rules.
  7. Demo email capture with an always-visible label and explicit “nothing is stored or sent” status.
  8. Strong Launch48 closing block: “Need a page with this much point of view?” with `/brief` and exact-scope links.
  9. Minimal disclosure footer.
- Maximum content width: about 1120px, with responsive gutters `clamp(1.1rem, 3.2vw, 2.25rem)`.
- Desktop hero should feel balanced at 1440px; mobile must work cleanly at 390px and 320px with no overflow.

## Typography and hierarchy

- Hero H1: Fraunces, `clamp(3.25rem, 8vw, 7rem)`, line-height about 0.88–0.94, tight tracking. Keep “Coffee with a fieldnote.” and use italic rust only for “fieldnote.”
- Section H2: Fraunces, `clamp(2.2rem, 5vw, 4.5rem)`, tight line-height.
- Body: Bricolage Grotesque, 17–20px, line-height 1.5–1.65, readable measure no wider than about 38rem.
- Kicker labels: IBM Plex Mono, 11–12px, uppercase, wide tracking, rust or muted ink.
- Avoid tiny captions. Nothing essential should be below 13px.

## Content and conversion guardrails

- Use one clear disclosure in the top bar, a factual image caption, an “Is Fieldnote Coffee real?” FAQ item, and a concise footer disclosure. Do not interrupt every section with defensive disclaimers.
- Avoid invented operational details such as a converted mill, exact roast days, equipment size, shipping promises, real subscriptions, billing behavior, or actual product stock.
- Product copy may describe fictional/illustrative coffees and tasting notes, but it must not imply that a customer can buy them here.
- The demo waitlist may update local UI state only. It must say no email is stored or sent.
- Launch48 CTA copy must be truthful: one responsive marketing page, $349 in crypto, 48-hour clock after completed brief plus cleared payment, one revision, full refund if the deadline is missed.

## Interaction and motion

- Minimum 44px interactive targets.
- Strong visible focus states using rust.
- Use native semantic controls and links.
- Motion should be limited to short 120–180ms color/transform feedback. Respect `prefers-reduced-motion`.
- FAQ markers must make the native disclosure affordance obvious.

## Responsive behavior

- At 800px and below: simplify the nav to the most useful anchors/CTA, stack the hero, place the image immediately after the main message, make primary actions full width, and collapse lot layouts to one column.
- The sample bar must not become a cramped two-line sentence at 320px; shorten its mobile-visible wording if necessary.
- No horizontal overflow, clipped focus rings, or long columns of identical bordered cards.
