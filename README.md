# launch48

The official launch48 homepage: high-quality websites delivered in 48 hours for $149, including three revisions.

## Local setup

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

Set these public environment variables before deployment:

- `NEXT_PUBLIC_SITE_URL`: the production HTTPS origin used in metadata, `robots.txt`, and `sitemap.xml`.
- `NEXT_PUBLIC_OXAPAY_PAYMENT_URL`: the hosted OxaPay payment-link URL. It must use the `oxapay.com` domain. Until it is configured, every payment CTA renders in a disabled state.

The site intentionally does not include payment APIs, secrets, webhooks, or a post-payment onboarding flow.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```
