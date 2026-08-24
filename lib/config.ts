export type PolarServer = "sandbox" | "production";

export type PolarConfig = {
  accessToken: string;
  productId: string;
  webhookSecret: string;
  server: PolarServer;
};

type Environment = Record<string, string | undefined>;

export type PolarConfigInspection =
  | { configured: true; config: PolarConfig; problems: [] }
  | { configured: false; config: null; problems: string[] };

const REQUIRED_POLAR_ENV = [
  "POLAR_ACCESS_TOKEN",
  "POLAR_PRODUCT_ID",
  "POLAR_WEBHOOK_SECRET",
  "NEXT_PUBLIC_POLAR_SERVER",
] as const;

function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function inspectPolarConfig(
  env: Environment = process.env,
): PolarConfigInspection {
  const values = Object.fromEntries(
    REQUIRED_POLAR_ENV.map((key) => [key, nonEmpty(env[key])]),
  ) as Record<(typeof REQUIRED_POLAR_ENV)[number], string | null>;

  const problems = REQUIRED_POLAR_ENV.filter((key) => !values[key]).map(
    (key) => `Missing ${key}`,
  );

  const server = values.NEXT_PUBLIC_POLAR_SERVER;
  if (server && server !== "sandbox" && server !== "production") {
    problems.push(
      "NEXT_PUBLIC_POLAR_SERVER must be either sandbox or production",
    );
  }

  if (problems.length > 0) {
    return { configured: false, config: null, problems };
  }

  return {
    configured: true,
    config: {
      accessToken: values.POLAR_ACCESS_TOKEN as string,
      productId: values.POLAR_PRODUCT_ID as string,
      webhookSecret: values.POLAR_WEBHOOK_SECRET as string,
      server: server as PolarServer,
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

export function getPolarConfig(env: Environment = process.env): PolarConfig {
  const inspection = inspectPolarConfig(env);
  if (!inspection.configured) {
    throw new PaymentsConfigurationError(inspection.problems);
  }
  return inspection.config;
}

export function isPolarConfigured(env: Environment = process.env): boolean {
  return inspectPolarConfig(env).configured;
}
