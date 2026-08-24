import postgres from "postgres";

import { fromPolarMetadata, type Brief } from "./brief";
import { LAUNCH48_CURRENCY, LAUNCH48_PRICE_CENTS } from "./polar";

const GITHUB_OWNER = "whoalin1";
const GITHUB_REPO = "Launch48";
const GITHUB_API_VERSION = "2022-11-28";

type Environment = Record<string, string | undefined>;

export type PolarPaidOrderInput = {
  id: string;
  checkoutId: string | null;
  productId: string | null;
  status: string;
  paid: boolean;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  metadata: unknown;
  customer: { email?: string | null };
};

export type PaidOrderRecord = {
  checkoutId: string;
  polarOrderId: string;
  productId: string;
  webhookId: string;
  status: "paid";
  paidAt: string;
  subtotalAmount: number;
  totalAmount: number;
  currency: string;
  polarCustomerEmail: string | null;
  brief: Brief;
};

export class OrderProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderProcessingError";
  }
}

export class OrderStorageConfigurationError extends Error {
  readonly code = "order_storage_not_configured";

  constructor() {
    super(
      "Order storage is not configured. Set DATABASE_URL or a GitHub issues token.",
    );
    this.name = "OrderStorageConfigurationError";
  }
}

function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getOrderStorageConfig(env: Environment = process.env):
  | { kind: "postgres"; databaseUrl: string }
  | { kind: "github"; token: string }
  | null {
  const databaseUrl = nonEmpty(env.DATABASE_URL);
  if (databaseUrl) {
    return { kind: "postgres", databaseUrl };
  }

  const token =
    nonEmpty(env.GITHUB_ISSUES_TOKEN) ?? nonEmpty(env.GITHUB_TOKEN);
  return token ? { kind: "github", token } : null;
}

export function isOrderStorageConfigured(
  env: Environment = process.env,
): boolean {
  return getOrderStorageConfig(env) !== null;
}

export function buildPaidOrderRecord(args: {
  order: PolarPaidOrderInput;
  expectedProductId: string;
  webhookId: string;
  paidAt: Date | string;
}): PaidOrderRecord {
  const { order, expectedProductId } = args;
  if (!order.paid || order.status !== "paid") {
    throw new OrderProcessingError("Polar order is not paid.");
  }
  if (order.productId !== expectedProductId) {
    throw new OrderProcessingError("Polar order product does not match.");
  }
  if (!order.checkoutId || !/^[A-Za-z0-9_-]{1,200}$/.test(order.checkoutId)) {
    throw new OrderProcessingError("Polar order has no valid checkout ID.");
  }
  if (!order.id || !/^[A-Za-z0-9_-]{1,200}$/.test(order.id)) {
    throw new OrderProcessingError("Polar order has no valid order ID.");
  }
  if (
    order.subtotalAmount !== LAUNCH48_PRICE_CENTS ||
    order.discountAmount !== 0 ||
    order.currency.toLowerCase() !== LAUNCH48_CURRENCY
  ) {
    throw new OrderProcessingError("Polar order amount does not match.");
  }

  const brief = fromPolarMetadata(order.metadata);
  if (!brief) {
    throw new OrderProcessingError("Polar order brief metadata is invalid.");
  }

  const paidAt = new Date(args.paidAt);
  if (Number.isNaN(paidAt.getTime())) {
    throw new OrderProcessingError("Polar paid timestamp is invalid.");
  }

  return {
    checkoutId: order.checkoutId,
    polarOrderId: order.id,
    productId: expectedProductId,
    webhookId: args.webhookId,
    status: "paid",
    paidAt: paidAt.toISOString(),
    subtotalAmount: order.subtotalAmount,
    totalAmount: order.totalAmount,
    currency: order.currency.toLowerCase(),
    polarCustomerEmail: order.customer.email ?? null,
    brief,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function preformatted(value: string): string {
  return `<pre>${escapeHtml(value)}</pre>`;
}

function formatMoney(cents: number, currency: string): string {
  return `${currency.toUpperCase()} ${(cents / 100).toFixed(2)}`;
}

export function launch48OrderMarker(checkoutId: string): string {
  return `<!-- launch48-order:${checkoutId} -->`;
}

export function formatOrderIssueTitle(record: PaidOrderRecord): string {
  const businessName = record.brief.businessName.replace(/\s+/g, " ").trim();
  return `Order: ${businessName}`;
}

export function formatOrderIssueBody(record: PaidOrderRecord): string {
  const domain = record.brief.domain ?? "Not provided";
  return [
    launch48OrderMarker(record.checkoutId),
    "# Paid Launch48 order",
    "",
    `- Polar checkout ID: \`${record.checkoutId}\``,
    `- Polar order ID: \`${record.polarOrderId}\``,
    `- Product ID: \`${record.productId}\``,
    `- Payment status: \`${record.status}\``,
    `- Price before tax: ${formatMoney(record.subtotalAmount, record.currency)}`,
    `- Total paid: ${formatMoney(record.totalAmount, record.currency)}`,
    `- Paid at: ${record.paidAt}`,
    "",
    "## Full brief",
    "",
    "### Business name",
    preformatted(record.brief.businessName),
    "",
    "### One-sentence pitch",
    preformatted(record.brief.pitch),
    "",
    "### Audience",
    preformatted(record.brief.audience),
    "",
    "### Tone",
    preformatted(record.brief.tone),
    "",
    "### Reference URLs",
    preformatted(record.brief.referenceUrls),
    "",
    "### Colors",
    preformatted(record.brief.colors),
    "",
    "### Must-have sections",
    preformatted(record.brief.mustHaveSections),
    "",
    "### Contact email",
    preformatted(record.brief.contactEmail),
    "",
    "### Optional domain",
    preformatted(domain),
  ].join("\n");
}

type Launch48Global = typeof globalThis & {
  launch48Sql?: ReturnType<typeof postgres>;
  launch48SqlUrl?: string;
  launch48SchemaPromise?: Promise<void>;
};

const launch48Global = globalThis as Launch48Global;

function getSql(databaseUrl: string): ReturnType<typeof postgres> {
  if (!launch48Global.launch48Sql || launch48Global.launch48SqlUrl !== databaseUrl) {
    launch48Global.launch48Sql = postgres(databaseUrl, {
      max: 1,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    launch48Global.launch48SqlUrl = databaseUrl;
    launch48Global.launch48SchemaPromise = undefined;
  }
  return launch48Global.launch48Sql;
}

async function ensurePostgresSchema(
  sql: ReturnType<typeof postgres>,
): Promise<void> {
  if (!launch48Global.launch48SchemaPromise) {
    launch48Global.launch48SchemaPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS launch48_orders (
          checkout_id text PRIMARY KEY,
          polar_order_id text NOT NULL UNIQUE,
          webhook_id text,
          product_id text NOT NULL,
          status text NOT NULL DEFAULT 'paid',
          paid_at timestamptz NOT NULL,
          subtotal_amount integer NOT NULL CHECK (subtotal_amount >= 0),
          total_amount integer NOT NULL CHECK (total_amount >= 0),
          currency text NOT NULL,
          polar_customer_email text,
          business_name text NOT NULL,
          contact_email text NOT NULL,
          brief jsonb NOT NULL CHECK (jsonb_typeof(brief) = 'object'),
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS launch48_orders_webhook_id_uidx
          ON launch48_orders (webhook_id)
          WHERE webhook_id IS NOT NULL
      `;
    })().catch((error: unknown) => {
      launch48Global.launch48SchemaPromise = undefined;
      throw error;
    });
  }
  await launch48Global.launch48SchemaPromise;
}

async function persistToPostgres(
  record: PaidOrderRecord,
  databaseUrl: string,
): Promise<void> {
  const sql = getSql(databaseUrl);
  await ensurePostgresSchema(sql);
  const rows = await sql<{ checkout_id: string }[]>`
    INSERT INTO launch48_orders (
      checkout_id,
      polar_order_id,
      webhook_id,
      product_id,
      status,
      paid_at,
      subtotal_amount,
      total_amount,
      currency,
      polar_customer_email,
      business_name,
      contact_email,
      brief
    ) VALUES (
      ${record.checkoutId},
      ${record.polarOrderId},
      ${record.webhookId},
      ${record.productId},
      ${record.status},
      ${record.paidAt},
      ${record.subtotalAmount},
      ${record.totalAmount},
      ${record.currency},
      ${record.polarCustomerEmail},
      ${record.brief.businessName},
      ${record.brief.contactEmail},
      ${JSON.stringify(record.brief)}::jsonb
    )
    ON CONFLICT (checkout_id) DO UPDATE SET
      webhook_id = COALESCE(launch48_orders.webhook_id, EXCLUDED.webhook_id),
      status = 'paid',
      paid_at = LEAST(launch48_orders.paid_at, EXCLUDED.paid_at),
      subtotal_amount = EXCLUDED.subtotal_amount,
      total_amount = EXCLUDED.total_amount,
      currency = EXCLUDED.currency,
      polar_customer_email = EXCLUDED.polar_customer_email,
      business_name = EXCLUDED.business_name,
      contact_email = EXCLUDED.contact_email,
      brief = EXCLUDED.brief,
      updated_at = now()
    WHERE launch48_orders.polar_order_id = EXCLUDED.polar_order_id
    RETURNING checkout_id
  `;

  if (rows.length !== 1) {
    throw new OrderProcessingError("Order identity conflict.");
  }
}

function githubHeaders(token: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "Launch48-order-webhook",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  };
}

async function githubIssueAlreadyExists(
  checkoutId: string,
  token: string,
): Promise<boolean> {
  const marker = launch48OrderMarker(checkoutId);
  const url = new URL("https://api.github.com/search/issues");
  url.searchParams.set(
    "q",
    `repo:${GITHUB_OWNER}/${GITHUB_REPO} is:issue in:body \"${checkoutId}\"`,
  );
  url.searchParams.set("per_page", "10");

  const response = await fetch(url, { headers: githubHeaders(token) });
  if (!response.ok) {
    throw new Error("GitHub issue search failed.");
  }
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !("items" in payload)) {
    throw new Error("GitHub issue search response was invalid.");
  }
  const items = (payload as { items: unknown }).items;
  if (!Array.isArray(items)) {
    throw new Error("GitHub issue search response was invalid.");
  }
  return items.some(
    (item) =>
      item !== null &&
      typeof item === "object" &&
      "body" in item &&
      typeof item.body === "string" &&
      item.body.includes(marker),
  );
}

async function persistToGitHub(
  record: PaidOrderRecord,
  token: string,
): Promise<void> {
  if (await githubIssueAlreadyExists(record.checkoutId, token)) {
    return;
  }

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
    {
      method: "POST",
      headers: githubHeaders(token),
      body: JSON.stringify({
        title: formatOrderIssueTitle(record),
        body: formatOrderIssueBody(record),
      }),
    },
  );
  if (!response.ok) {
    throw new Error("GitHub issue creation failed.");
  }
}

export async function persistPaidOrder(
  record: PaidOrderRecord,
  env: Environment = process.env,
): Promise<void> {
  const storage = getOrderStorageConfig(env);
  if (!storage) {
    throw new OrderStorageConfigurationError();
  }
  if (storage.kind === "postgres") {
    await persistToPostgres(record, storage.databaseUrl);
    return;
  }
  await persistToGitHub(record, storage.token);
}
