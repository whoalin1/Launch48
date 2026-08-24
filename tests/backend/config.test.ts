import { describe, expect, it } from "vitest";

import {
  getPolarConfig,
  inspectPolarConfig,
  isPolarConfigured,
  PaymentsConfigurationError,
} from "../../lib/config";

const configuredEnv = {
  POLAR_ACCESS_TOKEN: "polar_token",
  POLAR_PRODUCT_ID: "product_123",
  POLAR_WEBHOOK_SECRET: "webhook_secret",
  NEXT_PUBLIC_POLAR_SERVER: "sandbox",
};

describe("Polar configuration", () => {
  it("accepts sandbox and production explicitly", () => {
    expect(getPolarConfig(configuredEnv).server).toBe("sandbox");
    expect(
      getPolarConfig({
        ...configuredEnv,
        NEXT_PUBLIC_POLAR_SERVER: "production",
      }).server,
    ).toBe("production");
  });

  it.each([
    "POLAR_ACCESS_TOKEN",
    "POLAR_PRODUCT_ID",
    "POLAR_WEBHOOK_SECRET",
    "NEXT_PUBLIC_POLAR_SERVER",
  ])("reports missing or blank %s without throwing at inspection", (key) => {
    const env = { ...configuredEnv, [key]: "  " };
    const result = inspectPolarConfig(env);
    expect(result.configured).toBe(false);
    expect(result.problems).toContain(`Missing ${key}`);
    expect(isPolarConfigured(env)).toBe(false);
  });

  it("rejects an unknown Polar server", () => {
    const env = {
      ...configuredEnv,
      NEXT_PUBLIC_POLAR_SERVER: "staging",
    };
    expect(inspectPolarConfig(env)).toMatchObject({ configured: false });
    expect(() => getPolarConfig(env)).toThrow(PaymentsConfigurationError);
  });

  it("trims environment values and does not cache them", () => {
    expect(
      getPolarConfig({
        ...configuredEnv,
        POLAR_PRODUCT_ID: " product_live ",
      }).productId,
    ).toBe("product_live");
    expect(isPolarConfigured({})).toBe(false);
  });
});
