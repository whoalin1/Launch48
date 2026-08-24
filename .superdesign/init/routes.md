# Routes

## Routing model

- Meta-framework: Next.js 16.3.2.
- Router: App Router with file-based routes under `app/`.
- Root layout: `app/layout.tsx` applies to every page route and imports `app/globals.css`.
- There is no React Router-style router configuration.
- `next.config.ts` adds legacy static-file redirects and site-wide response headers.

## Page routes

| URL | Entry file | Layouts | Rendering and summary |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | `app/layout.tsx` | Server-rendered Launch48 sales page: hero, $349 work ticket, process, scope, price, FAQ, and repeated payment CTAs. |
| `/brief` | `app/brief/page.tsx` | `app/layout.tsx` | Server page with the validated client brief form, OxaPay configuration state, checklist ticket, and legal links. |
| `/success?order_id=…` | `app/success/page.tsx` | `app/layout.tsx` | Dynamic, no-store server page that verifies the stored order and OxaPay status, then renders paid, pending, expired, failed, missing, invalid, or unconfigured states. |
| `/example` | `app/example/page.tsx` | `app/layout.tsx` → `app/example/layout.tsx` | Client-rendered, noindex fictional Fieldnote Coffee proof page: disclosure/conversion bar, sticky branded header, portrait editorial hero, method narrative, product-board layout, FAQ/waitlist panel, explicit Launch48 offer CTA, and bespoke footer. |
| `/privacy` | `app/privacy/page.tsx` | `app/layout.tsx` | Plain-language privacy notice covering briefs, OxaPay payment data, Postgres storage, and the GitHub Issue fallback. |
| `/terms` | `app/terms/page.tsx` | `app/layout.tsx` | Productized-service terms covering $349 crypto payment, the 48-hour clock, scope, one revision, and refund guarantee. |

## API routes

| Method and URL | Entry file | Runtime | Purpose |
| --- | --- | --- | --- |
| `POST /api/checkout` | `app/api/checkout/route.ts` | Node.js, force-dynamic | Validates the full brief, persists a pending order, creates the hosted OxaPay invoice, and returns the checkout URL. |
| `POST /api/webhooks/oxapay` | `app/api/webhooks/oxapay/route.ts` | Node.js, force-dynamic | Verifies the OxaPay HMAC signature, checks authoritative payment information, and fulfills a valid paid order. |

## Redirects

| Legacy source | Destination |
| --- | --- |
| `/index.html` | `/` |
| `/brief.html` | `/brief` |
| `/privacy.html` | `/privacy` |
| `/terms.html` | `/terms` |
| `/example/index.html` | `/example` |

All redirects are permanent.

## Routing-related configuration

Full source of `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/brief.html", destination: "/brief", permanent: true },
      { source: "/privacy.html", destination: "/privacy", permanent: true },
      { source: "/terms.html", destination: "/terms", permanent: true },
      {
        source: "/example/index.html",
        destination: "/example",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```
