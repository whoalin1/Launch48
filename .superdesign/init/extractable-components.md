# Extractable Components

The codebase has no third-party component system. The items below are the strongest candidates for reusable Superdesign `DraftComponent` entities. Existing standalone components are listed first; useful inline patterns are included because the rewritten `/example` target still keeps its branded sections in one page file.

## Layout Components

## SiteHeader

- Source: `components/SiteHeader.tsx`
- Category: layout
- Description: Shared responsive Launch48 top navigation with skip link, wordmark, section links, example link, mobile disclosure, and payment CTA.
- Extractable props: `paymentsConfigured` (boolean, no default), `menuOpen` (boolean state, default: false)
- Hardcoded: Launch48 wordmark, launch48.xyz label, navigation text and URLs, mobile button labels, CSS class names

## SiteFooter

- Source: `components/SiteFooter.tsx`
- Category: layout
- Description: Shared Launch48 footer used by home, brief, success, privacy, and terms pages.
- Extractable props: none
- Hardcoded: product summary, brief/privacy/terms labels and URLs, CSS class names

## FieldnoteSampleBar

- Source: `app/example/page.tsx` (inline disclosure bar)
- Category: layout
- Description: Rust announcement bar that discloses the fictional sample and links directly to the $349 brief.
- Extractable props: none
- Hardcoded: desktop/mobile disclosure text, brief URL, price label, arrow, CSS Module class names

## FieldnoteHeader

- Source: `app/example/page.tsx` (inline header)
- Category: layout
- Description: Sticky paper header with local SVG wordmark, Method/Coffee anchors, and a compact Launch48 conversion CTA.
- Extractable props: `activeSection` (string, optional if an active state is introduced)
- Hardcoded: Fieldnote/Coffee Co. wordmark, `/fieldnote-mark.svg`, navigation labels/hashes, brief URL and price label, CSS Module class names

## FieldnoteFooter

- Source: `app/example/page.tsx` (inline footer)
- Category: layout
- Description: Minimal disclosure footer confirming the concept is fictional and returning visitors to Launch48.
- Extractable props: none
- Hardcoded: disclosure sentence, Launch48 return link, arrow, CSS Module class names

## Basic Components

## PurchaseCta

- Source: `components/PurchaseCta.tsx`
- Category: basic
- Description: Shared purchase action that safely switches between the enabled crypto-payment link and disabled configuration state.
- Extractable props: `configured` (boolean, no default)
- Hardcoded: `/brief` URL, “Pay $349 in crypto” label, unconfigured label/title, default CSS classes

## FaqList

- Source: `components/FaqList.tsx`
- Category: basic
- Description: Single-open Launch48 FAQ accordion with accessible expanded/control state.
- Extractable props: `openIndex` (number or null state, default: null)
- Hardcoded: all six questions and answers, plus/minus symbols, CSS class names

## BriefForm

- Source: `components/BriefForm.tsx`
- Category: basic
- Description: Validated brief-and-checkout form with busy, configuration, field-error, and submission-error states.
- Extractable props: `paymentsConfigured` (boolean, no default), `busy` (boolean state, default: false), `paymentsUnavailable` (boolean state, default: false)
- Hardcoded: field labels, placeholders, validation messages, tone options, OxaPay button copy, endpoint URL, CSS class names

## TicketCard

- Source: `app/page.tsx` (repeated inline pattern; variants also appear in `app/brief/page.tsx` and `app/success/page.tsx`)
- Category: basic
- Description: Bordered cream work-order card with dashed header, price or status rows, offset black shadow, and rotated rust guarantee stamp.
- Extractable props: `status` (string for paid/pending/error variants)
- Hardcoded: ticket labels, row copy, $349 amount, stamp copy, CSS class names and decorative geometry

## SectionHeader

- Source: `app/page.tsx` (repeated inline pattern)
- Category: basic
- Description: Launch48 section lead-in pairing a mono numbered index with a bold sans heading over a full-width rule.
- Extractable props: none
- Hardcoded: section index and heading copy per instance, CSS class names

## FieldnoteHero

- Source: `app/example/page.tsx` (inline section)
- Category: basic
- Description: High-impact two-column hero with oversized Fraunces headline, rust actions, portrait coffee image, overlaid roast note, and stock-image disclosure.
- Extractable props: none
- Hardcoded: all copy and navigation hashes, Unsplash `src`/`srcSet`, image alt/caption, CSS Module class names

## FieldnoteRoastNote

- Source: `app/example/page.tsx` (inline hero aside)
- Category: basic
- Description: Cream information card overlaid on the hero image with lot, tasting, process, and brew details.
- Extractable props: none
- Hardcoded: illustrative label, origin, tasting notes, definition-list values, CSS Module class names

## FieldnoteMethodStep

- Source: `app/example/page.tsx` (three inline instances)
- Category: basic
- Description: Number-led editorial method item with oversized rust numeral, mono label, strong heading, and supporting copy.
- Extractable props: none
- Hardcoded: sequence number, label, title/body copy, CSS Module class names

## FieldnoteFeaturedLot

- Source: `app/example/page.tsx` (inline primary coffee card)
- Category: basic
- Description: Large ink feature card anchoring the asymmetric coffee-board composition.
- Extractable props: none
- Hardcoded: type, title, supporting copy, CSS Module class names

## FieldnoteSupportingLot

- Source: `app/example/page.tsx` (mapped from the module-level `lots` array)
- Category: basic
- Description: Cream product record repeated for the two fictional single origins.
- Extractable props: none
- Hardcoded: lot type/name/notes/copy from the `lots` array, CSS Module class names

## FieldnoteFaq

- Source: `app/example/page.tsx` (mapped native-details group)
- Category: basic
- Description: Paper-tile FAQ group with semantic `details`/`summary` elements and a rotating rust plus mark.
- Extractable props: none
- Hardcoded: all questions and answers from the `questions` array, plus mark, CSS Module class names

## FieldnoteWaitlist

- Source: `app/example/page.tsx` (inline form)
- Category: basic
- Description: Rust email-capture demonstration with explicit label, high-contrast input/button, and a state-aware no-storage disclosure.
- Extractable props: `submitted` (boolean state, default: false)
- Hardcoded: placeholder, label, button copy, demo disclosure copy, CSS Module class names

## FieldnoteLaunchCta

- Source: `app/example/page.tsx` (inline conversion band)
- Category: basic
- Description: Ink closing band that translates the sample into the real Launch48 $349 offer, guarantee, brief CTA, and scope link.
- Extractable props: none
- Hardcoded: offer/guarantee copy, `/brief` and `/#included` URLs, price label, CSS Module class names
