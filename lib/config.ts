export type OxaPayConfig = {
  merchantApiKey: string;
  sandbox: boolean;
};

type Environment = Record<string, string | undefined>;

export type OxaPayConfigInspection =
  | { configured: true; config: OxaPayConfig; problems: [] }
  | { configured: false; config: null; problems: string[] };

function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Inspect payment configuration without throwing. Server components use this
 * to render an honest disabled CTA when the merchant account is not ready.
 */
export function inspectOxaPayConfig(
  env: Environment = process.env,
): OxaPayConfigInspection {
  const merchantApiKey = nonEmpty(env.OXAPAY_MERCHANT_API_KEY);
  const sandboxValue = nonEmpty(env.OXAPAY_SANDBOX);
  const problems: string[] = [];

  if (!merchantApiKey) {
    problems.push("Missing OXAPAY_MERCHANT_API_KEY");
  }
  if (!sandboxValue) {
    problems.push("Missing OXAPAY_SANDBOX");
  } else if (sandboxValue !== "true" && sandboxValue !== "false") {
    problems.push("OXAPAY_SANDBOX must be either true or false");
  }

  if (problems.length > 0) {
    return { configured: false, config: null, problems };
  }

  return {
    configured: true,
    config: {
      merchantApiKey: merchantApiKey as string,
      sandbox: sandboxValue === "true",
    },
    problems: [],
  };
}

export class PaymentsConfigurationError extends Error {
  readonly code = "payments_not_configured";
  readonly problems: readonly string[];

  constructor(problems: readonly string[]) {
    super("Payments are not configured.");
    this.name = "PaymentsConfigurationError";
    this.problems = problems;
  }
}

export function getOxaPayConfig(env: Environment = process.env): OxaPayConfig {
  const inspection = inspectOxaPayConfig(env);
  if (!inspection.configured) {
    throw new PaymentsConfigurationError(inspection.problems);
  }
  return inspection.config;
}

export function isOxaPayConfigured(env: Environment = process.env): boolean {
  return inspectOxaPayConfig(env).configured;
}
