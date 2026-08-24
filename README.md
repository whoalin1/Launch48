# Launch48

Launch48 is the Next.js App Router site for a $349 productized landing-page design and build. The buyer completes the project brief first, then pays through an OxaPay-hosted crypto invoice. The 48-hour delivery clock starts only after both the complete brief and confirmed payment are present.

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

Open <http://localhost:3000>. Keep real secrets in `.env.local`; it is ignored by Git. Never expose the OxaPay Merchant API Key, checkout-state encryption secret, database URL, or GitHub token in a `NEXT_PUBLIC_*` variable.

Useful commands:

```bash
npm run build
npm run typecheck
npm test
npm start
```

`npm start` serves a completed production build created by `npm run build`.

## OxaPay merchant setup

Launch48 uses OxaPay's current v1 [Generate Invoice API](https://docs.oxapay.com/api-reference/payment/generate-invoice). Every checkout is a hosted crypto invoice for exactly **$349 USD**; customers choose from the cryptocurrencies enabled for the merchant account.

1. Sign in at <https://app.oxapay.com> and open **Merchant Service**.
2. Create a Merchant API Key for Launch48 and copy it immediately. Store it as `OXAPAY_MERCHANT_API_KEY`. This is a server-only secret.
3. In Merchant Service, enable the cryptocurrencies and networks you want customers to be able to use. OxaPay documents these as the account's [accepted currencies](https://docs.oxapay.com/api-reference/payment/accepted-currencies).
4. For live charges, set `OXAPAY_SANDBOX=false`. For tests, set `OXAPAY_SANDBOX=true`; OxaPay uses the same v1 invoice endpoint and receives the sandbox flag in each request.
5. Ensure OxaPay can reach this production callback URL over HTTPS:

   ```text
   https://launch48-psi.vercel.app/api/webhooks/oxapay
   ```

The application supplies the callback URL and `/success` return URL when it creates each invoice. There is no product ID or separate webhook secret to configure. OxaPay uses the Merchant API Key as the webhook HMAC secret.

## Vercel production configuration

In Vercel, switch to team **`whoalin1s-projects`**, open project **`launch48`**, then go to **Settings -> Environment Variables**. Add these server-only values to the **Production** environment:

| Variable | Production value |
| --- | --- |
| `OXAPAY_MERCHANT_API_KEY` | Merchant API Key created in OxaPay Merchant Service |
| `OXAPAY_SANDBOX` | `false` for real crypto payments |
| `SITE_URL` | `https://launch48-psi.vercel.app` |
| `DATABASE_URL` | Postgres connection string; strongly recommended |
| `GITHUB_ISSUES_TOKEN` | Fine-grained Issues token; required only when `DATABASE_URL` is absent |
| `CHECKOUT_STATE_SECRET` | Strong server-only encryption secret; required with the GitHub Issues fallback |

If `DATABASE_URL` is absent, configure the GitHub fallback described below with both `GITHUB_ISSUES_TOKEN` and `CHECKOUT_STATE_SECRET`. Generate the encryption secret with a cryptographically secure command such as `openssl rand -hex 32`; do not reuse the OxaPay or GitHub credential.

After adding or changing environment variables, redeploy the latest `main` deployment. Vercel environment changes do not modify an already-built deployment. Production auto-deploys from `main`, but a manual redeploy is still needed when only environment variables changed.

Before accepting orders, make one end-to-end test in sandbox mode and then switch `OXAPAY_SANDBOX` to `false`, redeploy, and verify that the live hosted invoice shows **349 USD** before sending crypto.

## Order storage

The complete brief must be saved before the browser leaves Launch48 because OxaPay does not store arbitrary brief fields. The checkout route creates an internal order ID and saves the pending brief first, requests the hosted invoice second, then attaches the returned OxaPay `track_id` before returning a payable URL. The signed paid callback promotes that pending record to a paid fulfillment order. Repeated callbacks are handled idempotently.

`DATABASE_URL` is the recommended production storage path. The application initializes its order table automatically; no separate migration command is required.

If `DATABASE_URL` is not set, the app falls back to GitHub Issues in `whoalin1/Launch48`. Set both of these server-only variables in Vercel:

- `GITHUB_ISSUES_TOKEN`
- `CHECKOUT_STATE_SECRET`

Use a fine-grained GitHub personal access token limited to repository **`whoalin1/Launch48`** with **Issues: Read and write** permission. Before payment, the fallback issue contains only identifiers and an opaque authenticated-encryption payload produced with `CHECKOUT_STATE_SECRET`; the brief, contact email, and optional domain are not readable in the public issue. Once payment is authoritatively verified, the app decrypts the pending state, updates the issue to the fulfillment title `Order: {business name}`, and publishes the full paid brief for fulfillment.

> **Privacy warning:** `whoalin1/Launch48` is a public repository. Abandoned or unpaid briefs remain encrypted, but a verified paid order is updated with the full brief, contact email, and optional domain in plaintext. Use `DATABASE_URL` for real customers unless publishing paid-order details is explicitly acceptable.

Do not leave both persistence paths unavailable. The brief cannot be recovered safely at callback time without Postgres or the complete GitHub fallback pair: a valid `GITHUB_ISSUES_TOKEN` and `CHECKOUT_STATE_SECRET`.

Keep the selected storage path and `CHECKOUT_STATE_SECRET` stable while invoices are pending and through OxaPay's webhook-retry window. Before switching from GitHub Issues to Postgres or rotating the encryption secret, let pending invoices expire or migrate their encrypted state so a later paid callback can still recover the brief.

## Payment and fulfillment flow

1. The customer completes the brief: business name, one-sentence pitch, audience, tone, reference URLs, colors, must-have sections, contact email, and optional domain. Required fields are validated on the server.
2. `POST /api/checkout` creates an internal order ID and durably stores the pending brief. With the GitHub fallback, the brief is encrypted before it is written to the public issue.
3. The route requests an OxaPay hosted invoice with `amount: 349`, `currency: "USD"`, the customer's email, and that order ID. It durably attaches the returned OxaPay `track_id` before redirecting the customer to pay in an enabled cryptocurrency.
4. OxaPay posts status updates to `POST /api/webhooks/oxapay`. The handler validates the `HMAC` header by computing an HMAC-SHA512 signature over the untouched raw POST body with `OXAPAY_MERCHANT_API_KEY`.
5. A signed callback alone does not fulfill the order. For a paid invoice, the app calls OxaPay's [Payment Information API](https://docs.oxapay.com/api-reference/payment/payment-information) and independently verifies the `track_id`, internal order ID, paid status, **349** amount, **USD** currency, `Launch48 landing page` description, and matching sandbox/production mode.
6. The app promotes the pending record to a paid order and returns HTTP `200` with `OK` so OxaPay does not keep retrying a successfully handled callback.
7. `/success` checks payment state server-side. It tells the customer that the 48-hour clock starts once the complete brief and payment are both confirmed, and that fulfillment updates go to the contact email from the brief.

The order record created from the verified paid callback is the operational signal to start fulfillment. One revision is included; if the 48-hour delivery window is missed, the terms provide a full refund.

## Missing payment configuration

`OXAPAY_MERCHANT_API_KEY` and `OXAPAY_SANDBOX` are required for payment checkout. If either is missing or invalid, the customer-facing buy action reports **Payments not configured** instead of crashing. Correct the Vercel values and redeploy before accepting an order.

## Sandbox test

1. Set `OXAPAY_SANDBOX=true` in `.env.local` or a dedicated Vercel Preview environment. Use a test database or a disposable GitHub fallback issue set.
2. If testing locally, expose the callback route through an HTTPS tunnel; OxaPay cannot post callbacks directly to localhost. Set the generated invoice's callback origin to that public URL.
3. Start the app and submit a complete brief.
4. Confirm the OxaPay hosted invoice shows **349 USD**, uses sandbox mode, and offers only the cryptocurrencies enabled in Merchant Service.
5. Complete the sandbox payment, confirm `/success` reports a verified payment, and confirm exactly one paid order record exists.
6. Re-deliver the same callback or replay it in the test environment and confirm the existing order is updated rather than duplicated.
7. For production, set `OXAPAY_SANDBOX=false`, use production persistence, redeploy, and re-check the amount before accepting a real crypto payment.

Never use `OXAPAY_SANDBOX=true` as proof that live settlement works. Do not send real cryptocurrency to a sandbox invoice.

## Routes

- `/` - Launch48 home
- `/brief` - validated project brief and crypto checkout start
- `/success` - server-verified payment result
- `/example` - Fieldnote Coffee example
- `/privacy` - privacy policy
- `/terms` - service terms
- `POST /api/checkout` - validates the brief, saves a pending order, and creates the hosted OxaPay invoice
- `POST /api/webhooks/oxapay` - verifies OxaPay callbacks and records confirmed paid orders
