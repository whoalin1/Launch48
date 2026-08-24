# Launch48

Launch48 is the Next.js App Router site for a $349 productized landing-page design and build. The buyer completes the project brief first, then pays through a Polar-hosted checkout. The 48-hour delivery clock starts only after both the complete brief and cleared payment are present.

Production site: <https://launch48-psi.vercel.app>

## Local development

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, copy the environment template with:

```powershell
Copy-Item .env.example .env.local
```

Open <http://localhost:3000>. Keep real secrets in `.env.local`; it is ignored by Git. Never put a Polar access token, webhook secret, database URL, or GitHub token in a `NEXT_PUBLIC_*` variable.

Useful commands:

```bash
npm run build
npm run typecheck
npm test
npm start
```

`npm start` serves a completed production build created by `npm run build`.

## Production Polar setup

Use the production Polar dashboard at <https://polar.sh>. Do not reuse sandbox IDs or credentials. Polar's reference pages for this setup are [Products](https://polar.sh/docs/features/products), [Organization Access Tokens](https://polar.sh/docs/integrate/oat), and [webhook endpoints](https://polar.sh/docs/integrate/webhooks/endpoints).

1. Select the production organization that will receive Launch48 payments.
2. Go to **Products → Catalogue → New Product** (some Polar accounts label the final control **Create Product**) and create this product exactly:

   - Name: `Launch48 landing page`
   - Billing cycle: **One-time purchase**
   - Pricing type: **Fixed price**
   - Currency: **USD**
   - Price: **$349.00**

3. Save it and leave it active/unarchived. In the Products list, open the product’s `…` menu and choose **Copy Product ID**. Store that UUID as `POLAR_PRODUCT_ID`; it is the product ID, not a price ID or checkout-link ID.
4. In the same organization, go to **Settings → General**, scroll to **Developers**, and choose **New Token** under Organization Access Tokens. Give it an identifiable name such as `Launch48 Vercel production`, select `checkouts:write` and `checkouts:read`, set an appropriate expiry, create it, and immediately copy the token into `POLAR_ACCESS_TOKEN`. Polar only shows the complete token once. This must be an Organization Access Token from the same organization as the product.
5. In **Settings → Developers → Webhooks**, choose **Add Endpoint** and configure exactly:

   - URL: `https://launch48-psi.vercel.app/api/webhooks/polar`
   - Format: **Raw**
   - Event: **`order.paid` only**

6. Generate or enter a strong webhook secret, save the endpoint, and copy that exact secret into `POLAR_WEBHOOK_SECRET`.

Use the exact endpoint URL shown above and confirm it responds without a redirect; Polar treats a `3xx` webhook response as a failed delivery and does not follow it.

The application creates a fresh hosted checkout for the configured product. Its success URL is generated from the request origin as `/success?checkout_id={CHECKOUT_ID}`; no separate Polar checkout link or static success URL is required.

## Vercel production configuration

In Vercel, switch to team **`whoalin1s-projects`**, open project **`launch48`**, then go to **Settings → Environment Variables**. Add these values to the **Production** environment:

| Variable | Production value |
| --- | --- |
| `POLAR_ACCESS_TOKEN` | Production Organization Access Token from the same Polar organization as the product |
| `POLAR_PRODUCT_ID` | Production ID of `Launch48 landing page` |
| `POLAR_WEBHOOK_SECRET` | Secret for the production webhook endpoint above |
| `NEXT_PUBLIC_POLAR_SERVER` | `production` |
| `DATABASE_URL` | Postgres connection string; strongly recommended |

`NEXT_PUBLIC_POLAR_SERVER` is safe to expose because it contains only the environment name. All other Polar values are server-only secrets.

After adding or changing environment variables, redeploy the latest `main` deployment from Vercel. Environment changes do not alter an already-built deployment. Production is deployed from `main` and Vercel auto-deploys new commits; a manual redeploy is still needed when only environment variables changed.

Before accepting an order, verify that the live brief submits to Polar, the checkout displays the exact product and $349 USD one-time price, a successful payment reaches `/success`, and the paid webhook creates exactly one fulfillment record.

### Order storage

`DATABASE_URL` is the preferred production storage path. On the first valid paid webhook, the app runs `CREATE TABLE IF NOT EXISTS` for `launch48_orders`; no manual migration is required. Paid deliveries are upserted idempotently by the Polar identifiers, so a duplicate delivery does not create a second order.

If `DATABASE_URL` is not set, the app falls back to a GitHub Issue in `whoalin1/Launch48`. Set one of these server-only variables in Vercel:

- `GITHUB_ISSUES_TOKEN` (preferred), or
- `GITHUB_TOKEN` (used only when `GITHUB_ISSUES_TOKEN` is absent).

Use a fine-grained GitHub personal access token scoped to repository **`whoalin1/Launch48`** with **Issues: Read and write** permission. The fallback searches for the Polar checkout marker before creating an issue, then opens `Order: {business name}` with the Polar checkout ID and full brief.

> **Privacy warning:** `whoalin1/Launch48` is a public repository. A fallback GitHub Issue publishes the full project brief and contact email. Use `DATABASE_URL` in production. The GitHub fallback is an emergency option, not the recommended live configuration.

Do not leave both persistence paths unavailable. A verified paid event cannot become a usable fulfillment record without `DATABASE_URL` or a valid GitHub token.

## Fulfillment flow

1. The customer completes the brief: business name, one-sentence pitch, audience, tone, reference URLs, colors, must-have sections, contact email, and optional domain. Required fields are validated on the server.
2. `POST /api/checkout` creates the Polar-hosted checkout and ties the full validated brief to its checkout ID.
3. After payment, Polar redirects to `/success?checkout_id=…`. The success page verifies that checkout against Polar server-side; it does not treat a query string alone as proof of payment.
4. Polar sends `order.paid` to `POST /api/webhooks/polar`. The handler verifies the Standard Webhooks signature against the untouched raw body and `POLAR_WEBHOOK_SECRET`.
5. The handler writes an idempotent `launch48_orders` record through `DATABASE_URL`, or uses the GitHub Issue fallback described above, and acknowledges the delivery so Polar does not retry it forever.
6. Fulfillment uses the contact email supplied in the brief. The 48-hour clock starts only when the brief is complete and payment has cleared. One revision is included; if the 48-hour delivery window is missed, the terms provide a full refund.

The order record is created by the signed paid webhook, not merely by returning from checkout. Treat the Polar dashboard and the stored order record as the operational source of truth before starting work.

## Missing payment configuration

All four Polar variables are required for live payments. If one is missing or invalid, the customer-facing buy action reports that payments are not configured instead of crashing. That state is a deployment warning, not a checkout substitute; correct the Vercel values and redeploy before taking orders.

## Sandbox setup and payment test

Polar sandbox is isolated from production. It requires a separate sandbox account/organization, product, Organization Access Token, webhook endpoint, product ID, and webhook secret. Production credentials do not work in sandbox and sandbox credentials cannot charge real cards.

1. Open <https://sandbox.polar.sh> and create/select the sandbox organization.
2. Create a separate sandbox product named `Launch48 landing page` with a one-time fixed **$349.00 USD** price. Copy its sandbox product ID.
3. Under the sandbox organization’s **Settings → General → Developers**, create a separate Organization Access Token with `checkouts:write` and `checkouts:read`.
4. Create a sandbox webhook in **Raw** format subscribed only to `order.paid`. For a deployed sandbox test, point it at that deployment’s `/api/webhooks/polar`. For local testing, install the [Polar CLI](https://polar.sh/docs/integrate/webhooks/endpoints) and run the listener below; Polar cannot deliver directly to localhost. Use the secret printed by that listener as the local `POLAR_WEBHOOK_SECRET` while it is running.

   ```bash
   polar listen http://localhost:3000/api/webhooks/polar
   ```
5. Put only the sandbox token, product ID, webhook secret, and `NEXT_PUBLIC_POLAR_SERVER=sandbox` in `.env.local` or in a dedicated Vercel Preview deployment. Use a separate test database if `DATABASE_URL` is enabled.
6. Start the app, submit a complete brief, and pay with card `4242 4242 4242 4242`, any future expiry date, and any valid CVC/billing details.
7. Confirm the verified success page appears and one order record is created. Re-deliver the same webhook from Polar and confirm it remains one record.

Sandbox customer emails are delivered only to members of that sandbox organization. An address alias such as `you+launch48-test@example.com` works when the underlying address belongs to a member.

Before going live, replace every sandbox value with its production counterpart, set `NEXT_PUBLIC_POLAR_SERVER=production`, and redeploy. Never switch only the server flag while leaving sandbox credentials or the sandbox product ID in place.

## Routes

- `/` — Launch48 home
- `/brief` — validated project brief and checkout start
- `/success` — server-verified payment result
- `/example` — Fieldnote Coffee example
- `/privacy` — privacy policy
- `/terms` — service terms
- `POST /api/checkout` — validates the brief and creates the hosted checkout
- `POST /api/webhooks/polar` — verifies `order.paid` and records the order
