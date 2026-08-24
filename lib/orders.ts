import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

import postgres from "postgres";

import { briefSchema, type Brief } from "./brief";
import { LAUNCH48_CURRENCY, LAUNCH48_PRICE_CENTS } from "./offer";

const GITHUB_OWNER = "whoalin1";
const GITHUB_REPO = "Launch48";
const GITHUB_API_VERSION = "2022-11-28";
const STATE_MARKER_PREFIX = "<!-- launch48-state:v1:";
const STATE_AAD = Buffer.from("Launch48 checkout state v1", "utf8");

type Environment = Record<string, string | undefined>;

export type OrderStorageConfig =
  | { kind: "postgres"; databaseUrl: string }
  | { kind: "github"; token: string; stateSecret: string };

export type StoredOrderRecord = {
  orderId: string;
  trackId: string | null;
  status: "pending" | "paid";
  amountCents: number;
  currency: "usd";
  createdAt: string;
  paidAt: string | null;
  paymentEmail: string | null;
  brief: Brief;
};

export type PaidOrderRecord = StoredOrderRecord & {
  trackId: string;
  status: "paid";
  paidAt: string;
};

export type VerifiedOxaPayPayment = {
  orderId: string;
  trackId: string;
  status: "paid";
  amountCents: number;
  currency: string;
  paymentEmail: string | null;
  verifiedAt: Date | string;
};

export class OrderProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderProcessingError";
  }
}

export class OrderNotFoundError extends OrderProcessingError {
  constructor() {
    super("Launch48 order was not found.");
    this.name = "OrderNotFoundError";
  }
}

export class OrderStorageConfigurationError extends Error {
  readonly code = "order_storage_not_configured";

  constructor() {
    super(
      "Order storage is not configured. Set DATABASE_URL, or set GITHUB_ISSUES_TOKEN and CHECKOUT_STATE_SECRET (32+ characters).",
    );
    this.name = "OrderStorageConfigurationError";
  }
}

function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getOrderStorageConfig(
  env: Environment = process.env,
): OrderStorageConfig | null {
  const databaseUrl = nonEmpty(env.DATABASE_URL);
  if (databaseUrl) {
    return { kind: "postgres", databaseUrl };
  }

  const token = nonEmpty(env.GITHUB_ISSUES_TOKEN);
  const stateSecret = nonEmpty(env.CHECKOUT_STATE_SECRET);
  if (!token || !stateSecret || stateSecret.length < 32) {
    return null;
  }
  return { kind: "github", token, stateSecret };
}

export function isOrderStorageConfigured(
  env: Environment = process.env,
): boolean {
  return getOrderStorageConfig(env) !== null;
}

function requireOrderStorageConfig(env: Environment): OrderStorageConfig {
  const config = getOrderStorageConfig(env);
  if (!config) {
    throw new OrderStorageConfigurationError();
  }
  return config;
}

function newNonce(): string {
  return randomBytes(16).toString("hex");
}

function normalizeDate(value: Date | string, label: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new OrderProcessingError(`${label} is invalid.`);
  }
  return date.toISOString();
}

function buildPendingRecord(brief: Brief, orderId: string): StoredOrderRecord {
  return {
    orderId,
    trackId: null,
    status: "pending",
    amountCents: LAUNCH48_PRICE_CENTS,
    currency: LAUNCH48_CURRENCY,
    createdAt: new Date().toISOString(),
    paidAt: null,
    paymentEmail: null,
    brief,
  };
}

function parseStoredOrder(value: unknown): StoredOrderRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new OrderProcessingError("Stored checkout state is invalid.");
  }
  const source = value as Record<string, unknown>;
  const brief = briefSchema.safeParse(source.brief);
  const status = source.status;
  const orderId = source.orderId;
  const trackId = source.trackId;
  const createdAt = source.createdAt;
  const paidAt = source.paidAt;
  const paymentEmail = source.paymentEmail;

  if (
    !brief.success ||
    (status !== "pending" && status !== "paid") ||
    typeof orderId !== "string" ||
    !isLaunch48OrderId(orderId) ||
    (trackId !== null &&
      (typeof trackId !== "string" || !/^\d{1,30}$/.test(trackId))) ||
    source.amountCents !== LAUNCH48_PRICE_CENTS ||
    source.currency !== LAUNCH48_CURRENCY ||
    typeof createdAt !== "string" ||
    (paidAt !== null && typeof paidAt !== "string") ||
    (paymentEmail !== null && typeof paymentEmail !== "string") ||
    (status === "paid" && (!trackId || !paidAt))
  ) {
    throw new OrderProcessingError("Stored checkout state is invalid.");
  }

  return {
    orderId,
    trackId,
    status,
    amountCents: LAUNCH48_PRICE_CENTS,
    currency: LAUNCH48_CURRENCY,
    createdAt: normalizeDate(createdAt, "Stored creation timestamp"),
    paidAt: paidAt ? normalizeDate(paidAt, "Stored paid timestamp") : null,
    paymentEmail,
    brief: brief.data,
  };
}

function stateKey(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

/** Encrypts abandoned checkout state before it is written to a public issue. */
export function encryptCheckoutState(
  record: StoredOrderRecord,
  secret: string,
): string {
  if (secret.trim().length < 32) {
    throw new OrderStorageConfigurationError();
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", stateKey(secret), iv);
  cipher.setAAD(STATE_AAD);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(record), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${STATE_MARKER_PREFIX}${iv.toString("base64url")}:${tag.toString("base64url")}:${ciphertext.toString("base64url")} -->`;
}

export function decryptCheckoutState(
  issueBody: string,
  secret: string,
): StoredOrderRecord {
  const escapedPrefix = STATE_MARKER_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = issueBody.match(
    new RegExp(`${escapedPrefix}([^:\\s]+):([^:\\s]+):([^\\s]+) -->`),
  );
  if (!match) {
    throw new OrderProcessingError("Encrypted checkout state is missing.");
  }

  try {
    const iv = Buffer.from(match[1], "base64url");
    const tag = Buffer.from(match[2], "base64url");
    const ciphertext = Buffer.from(match[3], "base64url");
    if (iv.length !== 12 || tag.length !== 16 || ciphertext.length === 0) {
      throw new Error("Invalid encrypted state lengths.");
    }
    const decipher = createDecipheriv("aes-256-gcm", stateKey(secret), iv);
    decipher.setAAD(STATE_AAD);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString("utf8");
    return parseStoredOrder(JSON.parse(plaintext));
  } catch (error) {
    if (error instanceof OrderProcessingError) {
      throw error;
    }
    throw new OrderProcessingError("Encrypted checkout state could not be read.");
  }
}

export function isLaunch48OrderId(value: string): boolean {
  return /^l48-(?:db-[a-f0-9]{32}|gh-\d+-[a-f0-9]{32})$/.test(value);
}

function githubIssueNumber(orderId: string): number | null {
  const match = orderId.match(/^l48-gh-(\d+)-[a-f0-9]{32}$/);
  if (!match) return null;
  const issueNumber = Number(match[1]);
  return Number.isSafeInteger(issueNumber) && issueNumber > 0
    ? issueNumber
    : null;
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

export function formatPendingIssueBody(
  record: StoredOrderRecord,
  stateSecret: string,
): string {
  return [
    encryptCheckoutState(record, stateSecret),
    "# Pending Launch48 crypto payment",
    "",
    "Customer brief data is encrypted until OxaPay verifies the $349 payment.",
    "This issue is updated in place after payment; do not fulfill it yet.",
  ].join("\n");
}

export function formatOrderIssueTitle(record: PaidOrderRecord): string {
  const businessName = record.brief.businessName.replace(/\s+/g, " ").trim();
  return `Order: ${businessName}`;
}

export function formatOrderIssueBody(
  record: PaidOrderRecord,
  stateSecret: string,
): string {
  const domain = record.brief.domain ?? "Not provided";
  return [
    encryptCheckoutState(record, stateSecret),
    "# Paid Launch48 order",
    "",
    `- OxaPay order ID: \`${record.orderId}\``,
    `- OxaPay track ID: \`${record.trackId}\``,
    `- Payment status: \`${record.status}\``,
    `- Verified price: ${formatMoney(record.amountCents, record.currency)}`,
    `- Paid/verified at: ${record.paidAt}`,
    ...(record.paymentEmail
      ? [`- OxaPay payer email: ${escapeHtml(record.paymentEmail)}`]
      : []),
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
  launch48OxaPaySchemaPromise?: Promise<void>;
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
    launch48Global.launch48OxaPaySchemaPromise = undefined;
  }
  return launch48Global.launch48Sql;
}

async function ensurePostgresSchema(
  sql: ReturnType<typeof postgres>,
): Promise<void> {
  if (!launch48Global.launch48OxaPaySchemaPromise) {
    launch48Global.launch48OxaPaySchemaPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS launch48_oxapay_orders (
          order_id text PRIMARY KEY,
          track_id text UNIQUE,
          status text NOT NULL CHECK (status IN ('pending', 'paid')),
          amount_cents integer NOT NULL CHECK (amount_cents = 34900),
          currency text NOT NULL CHECK (currency = 'usd'),
          business_name text NOT NULL,
          contact_email text NOT NULL,
          brief jsonb NOT NULL CHECK (jsonb_typeof(brief) = 'object'),
          payment_email text,
          paid_at timestamptz,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now(),
          CHECK (status <> 'paid' OR (track_id IS NOT NULL AND paid_at IS NOT NULL))
        )
      `;
    })().catch((error: unknown) => {
      launch48Global.launch48OxaPaySchemaPromise = undefined;
      throw error;
    });
  }
  await launch48Global.launch48OxaPaySchemaPromise;
}

type PostgresOrderRow = {
  order_id: string;
  track_id: string | null;
  status: string;
  amount_cents: number;
  currency: string;
  created_at: Date | string;
  paid_at: Date | string | null;
  payment_email: string | null;
  brief: unknown;
};

function postgresRowToRecord(row: PostgresOrderRow): StoredOrderRecord {
  return parseStoredOrder({
    orderId: row.order_id,
    trackId: row.track_id,
    status: row.status,
    amountCents: row.amount_cents,
    currency: row.currency,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
    paidAt:
      row.paid_at instanceof Date ? row.paid_at.toISOString() : row.paid_at,
    paymentEmail: row.payment_email,
    brief: row.brief,
  });
}

async function insertPostgresPending(
  record: StoredOrderRecord,
  databaseUrl: string,
): Promise<void> {
  const sql = getSql(databaseUrl);
  await ensurePostgresSchema(sql);
  await sql`
    INSERT INTO launch48_oxapay_orders (
      order_id, track_id, status, amount_cents, currency,
      business_name, contact_email, brief, created_at
    ) VALUES (
      ${record.orderId}, NULL, 'pending', ${record.amountCents},
      ${record.currency}, ${record.brief.businessName},
      ${record.brief.contactEmail}, ${JSON.stringify(record.brief)}::jsonb,
      ${record.createdAt}
    )
  `;
}

async function loadPostgresOrder(
  orderId: string,
  databaseUrl: string,
): Promise<StoredOrderRecord | null> {
  const sql = getSql(databaseUrl);
  await ensurePostgresSchema(sql);
  const rows = await sql<PostgresOrderRow[]>`
    SELECT order_id, track_id, status, amount_cents, currency, created_at,
           paid_at, payment_email, brief
      FROM launch48_oxapay_orders
     WHERE order_id = ${orderId}
     LIMIT 1
  `;
  return rows[0] ? postgresRowToRecord(rows[0]) : null;
}

async function updatePostgresRecord(
  record: StoredOrderRecord,
  databaseUrl: string,
): Promise<void> {
  const sql = getSql(databaseUrl);
  await ensurePostgresSchema(sql);
  const rows = await sql<{ order_id: string }[]>`
    UPDATE launch48_oxapay_orders
       SET track_id = ${record.trackId},
           status = ${record.status},
           paid_at = ${record.paidAt},
           payment_email = ${record.paymentEmail},
           updated_at = now()
     WHERE order_id = ${record.orderId}
       AND (track_id IS NULL OR track_id = ${record.trackId})
    RETURNING order_id
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

async function parseGitHubError(response: Response, action: string): Promise<never> {
  // Never include GitHub's response body: it can echo issue content or details.
  throw new Error(`${action} failed with HTTP ${response.status}.`);
}

async function createGitHubPending(
  brief: Brief,
  token: string,
  stateSecret: string,
): Promise<StoredOrderRecord> {
  const nonce = newNonce();
  const provisional = buildPendingRecord(brief, `l48-gh-0-${nonce}`);
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
    {
      method: "POST",
      headers: githubHeaders(token),
      body: JSON.stringify({
        title: "Pending Launch48 payment",
        body: formatPendingIssueBody(provisional, stateSecret),
      }),
    },
  );
  if (!response.ok) {
    return parseGitHubError(response, "GitHub pending issue creation");
  }
  const payload: unknown = await response.json();
  const issueNumber =
    payload &&
    typeof payload === "object" &&
    "number" in payload &&
    typeof payload.number === "number" &&
    Number.isSafeInteger(payload.number) &&
    payload.number > 0
      ? payload.number
      : null;
  if (!issueNumber) {
    throw new Error("GitHub pending issue response was invalid.");
  }

  const record = { ...provisional, orderId: `l48-gh-${issueNumber}-${nonce}` };
  await updateGitHubIssue(record, issueNumber, token, stateSecret);
  return record;
}

async function getGitHubIssue(
  issueNumber: number,
  token: string,
): Promise<{ body: string } | null> {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNumber}`,
    { headers: githubHeaders(token), cache: "no-store" },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    return parseGitHubError(response, "GitHub issue lookup");
  }
  const payload: unknown = await response.json();
  if (
    !payload ||
    typeof payload !== "object" ||
    !("body" in payload) ||
    typeof payload.body !== "string"
  ) {
    throw new Error("GitHub issue response was invalid.");
  }
  return { body: payload.body };
}

async function loadGitHubOrder(
  orderId: string,
  token: string,
  stateSecret: string,
): Promise<StoredOrderRecord | null> {
  const issueNumber = githubIssueNumber(orderId);
  if (!issueNumber) return null;
  const issue = await getGitHubIssue(issueNumber, token);
  if (!issue) return null;
  const record = decryptCheckoutState(issue.body, stateSecret);
  if (record.orderId !== orderId) {
    throw new OrderProcessingError("GitHub order identity conflict.");
  }
  return record;
}

async function updateGitHubIssue(
  record: StoredOrderRecord,
  issueNumber: number,
  token: string,
  stateSecret: string,
): Promise<void> {
  const paid = record.status === "paid";
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNumber}`,
    {
      method: "PATCH",
      headers: githubHeaders(token),
      body: JSON.stringify({
        title: paid
          ? formatOrderIssueTitle(record as PaidOrderRecord)
          : "Pending Launch48 payment",
        body: paid
          ? formatOrderIssueBody(record as PaidOrderRecord, stateSecret)
          : formatPendingIssueBody(record, stateSecret),
      }),
    },
  );
  if (!response.ok) {
    return parseGitHubError(response, "GitHub issue update");
  }
}

async function loadWithStorage(
  orderId: string,
  storage: OrderStorageConfig,
): Promise<StoredOrderRecord | null> {
  if (storage.kind === "postgres") {
    return loadPostgresOrder(orderId, storage.databaseUrl);
  }
  return loadGitHubOrder(orderId, storage.token, storage.stateSecret);
}

async function updateWithStorage(
  record: StoredOrderRecord,
  storage: OrderStorageConfig,
): Promise<void> {
  if (storage.kind === "postgres") {
    return updatePostgresRecord(record, storage.databaseUrl);
  }
  const issueNumber = githubIssueNumber(record.orderId);
  if (!issueNumber) {
    throw new OrderProcessingError("GitHub order ID is invalid.");
  }
  return updateGitHubIssue(
    record,
    issueNumber,
    storage.token,
    storage.stateSecret,
  );
}

/** Persists the full validated brief before a hosted invoice can be returned. */
export async function persistPendingOrder(
  brief: Brief,
  env: Environment = process.env,
): Promise<StoredOrderRecord> {
  const storage = requireOrderStorageConfig(env);
  if (storage.kind === "github") {
    return createGitHubPending(brief, storage.token, storage.stateSecret);
  }

  const record = buildPendingRecord(brief, `l48-db-${newNonce()}`);
  await insertPostgresPending(record, storage.databaseUrl);
  return record;
}

export async function attachOxaPayInvoice(
  orderId: string,
  trackId: string,
  env: Environment = process.env,
): Promise<StoredOrderRecord> {
  if (!isLaunch48OrderId(orderId) || !/^\d{1,30}$/.test(trackId)) {
    throw new OrderProcessingError("OxaPay invoice identity is invalid.");
  }
  const storage = requireOrderStorageConfig(env);
  const current = await loadWithStorage(orderId, storage);
  if (!current) throw new OrderNotFoundError();
  if (current.trackId && current.trackId !== trackId) {
    throw new OrderProcessingError("OxaPay track ID conflict.");
  }
  if (current.trackId === trackId) return current;

  const updated = { ...current, trackId };
  await updateWithStorage(updated, storage);
  return updated;
}

export async function loadStoredOrder(
  orderId: string,
  env: Environment = process.env,
): Promise<StoredOrderRecord | null> {
  if (!isLaunch48OrderId(orderId)) return null;
  return loadWithStorage(orderId, requireOrderStorageConfig(env));
}

export function buildPaidOrderRecord(args: {
  stored: StoredOrderRecord;
  payment: VerifiedOxaPayPayment;
}): PaidOrderRecord {
  const { stored, payment } = args;
  if (
    payment.status !== "paid" ||
    payment.orderId !== stored.orderId ||
    !stored.trackId ||
    payment.trackId !== stored.trackId ||
    payment.amountCents !== LAUNCH48_PRICE_CENTS ||
    payment.currency.toLowerCase() !== LAUNCH48_CURRENCY
  ) {
    throw new OrderProcessingError("Verified OxaPay payment does not match order.");
  }

  return {
    ...stored,
    trackId: payment.trackId,
    status: "paid",
    amountCents: LAUNCH48_PRICE_CENTS,
    currency: LAUNCH48_CURRENCY,
    paidAt: normalizeDate(payment.verifiedAt, "Payment verification timestamp"),
    paymentEmail: payment.paymentEmail,
  };
}

/** Idempotently promotes an encrypted pending brief into a fulfillable order. */
export async function fulfillPaidOrder(
  payment: VerifiedOxaPayPayment,
  env: Environment = process.env,
): Promise<{ record: PaidOrderRecord; alreadyPaid: boolean }> {
  const storage = requireOrderStorageConfig(env);
  const stored = await loadWithStorage(payment.orderId, storage);
  if (!stored) throw new OrderNotFoundError();
  const record = buildPaidOrderRecord({ stored, payment });

  if (stored.status === "paid") {
    return { record: stored as PaidOrderRecord, alreadyPaid: true };
  }
  await updateWithStorage(record, storage);
  return { record, alreadyPaid: false };
}
