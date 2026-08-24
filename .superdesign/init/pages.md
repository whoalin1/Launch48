# Page Dependency Trees

Only local repository imports are shown; React, Next.js, Node built-ins, `postgres`, and `zod` are external and omitted. The trees intentionally include server-side configuration and payment modules where page rendering depends on them. Locally referenced public assets are noted even though URL-string references are not JavaScript imports.

## Shared root layout (all page routes)

Entry: `app/layout.tsx`

Dependencies:
- `app/globals.css`
  - `css/site.css`

## / (Home Page)

Entry: `app/page.tsx`

Summary: Main Launch48 conversion page with the offer hero, repeated $349 crypto CTAs, process, scope boundaries, pricing/guarantee ticket, FAQ accordion, and closing CTA.

Dependencies:
- `components/FaqList.tsx`
- `components/index.ts`
  - `components/Header.tsx`
    - `lib/config.ts`
    - `lib/orders.ts`
      - `lib/brief.ts`
      - `lib/offer.ts`
    - `components/SiteHeader.tsx`
      - `components/PurchaseCta.tsx`
  - `components/SiteHeader.tsx`
    - `components/PurchaseCta.tsx`
  - `components/SiteFooter.tsx`
  - `components/PurchaseCta.tsx`
- `lib/config.ts`
- `lib/orders.ts`
  - `lib/brief.ts`
  - `lib/offer.ts`

## /brief (Customer Brief)

Entry: `app/brief/page.tsx`

Summary: Brief-first checkout page with required-field validation, safe unconfigured state, OxaPay redirect, and a scope/payment checklist.

Dependencies:
- `components/BriefForm.tsx`
- `components/index.ts`
  - `components/Header.tsx`
    - `lib/config.ts`
    - `lib/orders.ts`
      - `lib/brief.ts`
      - `lib/offer.ts`
    - `components/SiteHeader.tsx`
      - `components/PurchaseCta.tsx`
  - `components/SiteHeader.tsx`
    - `components/PurchaseCta.tsx`
  - `components/SiteFooter.tsx`
  - `components/PurchaseCta.tsx`
- `lib/config.ts`
- `lib/orders.ts`
  - `lib/brief.ts`
  - `lib/offer.ts`

## /success (Payment Status)

Entry: `app/success/page.tsx`

Summary: Server-verified post-checkout status page with distinct paid, pending, expired, failed, lookup-error, missing-ID, invalid-ID, order-not-found, and unconfigured views.

Dependencies:
- `components/index.ts`
  - `components/Header.tsx`
    - `lib/config.ts`
    - `lib/orders.ts`
      - `lib/brief.ts`
      - `lib/offer.ts`
    - `components/SiteHeader.tsx`
      - `components/PurchaseCta.tsx`
  - `components/SiteHeader.tsx`
    - `components/PurchaseCta.tsx`
  - `components/SiteFooter.tsx`
  - `components/PurchaseCta.tsx`
- `lib/oxapay.ts`
  - `lib/brief.ts`
  - `lib/config.ts`
  - `lib/offer.ts`
  - `lib/orders.ts`
    - `lib/brief.ts`
    - `lib/offer.ts`

## /example (Fieldnote Coffee Sample)

Entry: `app/example/page.tsx`

Nested layout: `app/example/layout.tsx`

Summary: Rewritten standalone proof page that deliberately brings Fieldnote into the Launch48 paper/ink/rust system. It combines a fictional-brand disclosure and $349 CTA, sticky local navigation, oversized editorial hero with a roast-note overlay, three-part method, asymmetric coffee board, FAQ plus demo waitlist, a dedicated Launch48 conversion band, and a disclosure footer.

Dependencies:
- `app/example/example.module.css`
- `public/fieldnote-mark.svg` (referenced as `/fieldnote-mark.svg`)

Important target context:
- The route inherits `app/layout.tsx` → `app/globals.css` → `css/site.css`.
- `app/example/layout.tsx` has no local imports; it provides absolute sample metadata and `noindex, nofollow`.
- All Fieldnote sections and page-specific layout markup remain inline in `app/example/page.tsx`.
- The `lots` and `questions` content arrays are defined at module scope in the same page file.
- The portrait hero uses remote Unsplash `src`/`srcSet` URLs; the wordmark uses the local SVG listed above.
- The waitlist uses local `useState` only to swap disclosure copy. It never transmits or stores the entered email.
- Conversion links route to `/brief`, `/#included`, and the main Launch48 page.

## /privacy (Privacy Notice)

Entry: `app/privacy/page.tsx`

Summary: Legal content page explaining brief/payment collection, storage, processing, and public GitHub Issue fallback behavior.

Dependencies:
- `components/index.ts`
  - `components/Header.tsx`
    - `lib/config.ts`
    - `lib/orders.ts`
      - `lib/brief.ts`
      - `lib/offer.ts`
    - `components/SiteHeader.tsx`
      - `components/PurchaseCta.tsx`
  - `components/SiteHeader.tsx`
    - `components/PurchaseCta.tsx`
  - `components/SiteFooter.tsx`
  - `components/PurchaseCta.tsx`

## /terms (Terms)

Entry: `app/terms/page.tsx`

Summary: Legal content page defining the one-page deliverable, $349 crypto payment, complete-brief-plus-payment clock start, one revision, exclusions, and 48-hour refund.

Dependencies:
- `components/index.ts`
  - `components/Header.tsx`
    - `lib/config.ts`
    - `lib/orders.ts`
      - `lib/brief.ts`
      - `lib/offer.ts`
    - `components/SiteHeader.tsx`
      - `components/PurchaseCta.tsx`
  - `components/SiteHeader.tsx`
    - `components/PurchaseCta.tsx`
  - `components/SiteFooter.tsx`
  - `components/PurchaseCta.tsx`

## POST /api/checkout

Entry: `app/api/checkout/route.ts`

Dependencies:
- `lib/brief.ts`
- `lib/config.ts`
- `lib/orders.ts`
  - `lib/brief.ts`
  - `lib/offer.ts`
- `lib/oxapay.ts`
  - `lib/brief.ts`
  - `lib/config.ts`
  - `lib/offer.ts`
  - `lib/orders.ts`
    - `lib/brief.ts`
    - `lib/offer.ts`

## POST /api/webhooks/oxapay

Entry: `app/api/webhooks/oxapay/route.ts`

Dependencies:
- `lib/config.ts`
- `lib/orders.ts`
  - `lib/brief.ts`
  - `lib/offer.ts`
- `lib/oxapay.ts`
  - `lib/brief.ts`
  - `lib/config.ts`
  - `lib/offer.ts`
  - `lib/orders.ts`
    - `lib/brief.ts`
    - `lib/offer.ts`
