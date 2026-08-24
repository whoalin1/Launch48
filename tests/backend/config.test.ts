import { describe, expect, it } from "vitest";

import {
  getOxaPayConfig,
  inspectOxaPayConfig,
  isOxaPayConfigured,
  PaymentsConfigurationError,
} from "../../lib/config";

const configuredEnv = {
  OXAPAY_MERCHANT_API_KEY: "merchant_key",
  OXAPAY_SANDBOX: "true",
};

describe("OxaPay configuration", () => {
  it("accepts explicit sandbox and production modes", () => {
    expect(getOxaPayConfig(configuredEnv)).toEqual({
      merchantApiKey: "merchant_key",
      sandbox: true,
    });
    expect(
      getOxaPayConfig({ ...configuredEnv, OXAPAY_SANDBOX: "false" }).sandbox,
    ).toBe(false);
  });

  it.each(["OXAPAY_MERCHANT_API_KEY", "OXAPAY_SANDBOX"])(
    "reports missing or blank %s without throwing at inspection",
    (key) => {
      const env = { ...configuredEnv, [key]: "  " };
      const result = inspectOxaPayConfig(env);
      expect(result.configured).toBe(false);
      expect(result.problems).toContain(`Missing ${key}`);
      expect(isOxaPayConfigured(env)).toBe(false);
    },
  );

  it("rejects non-boolean sandbox values", () => {
    const env = { ...configuredEnv, OXAPAY_SANDBOX: "production" };
    expect(inspectOxaPayConfig(env)).toMatchObject({ configured: false });
    expect(() => getOxaPayConfig(env)).toThrow(PaymentsConfigurationError);
  });

  it("trims values and does not cache configuration", () => {
    expect(
      getOxaPayConfig({
        OXAPAY_MERCHANT_API_KEY: " merchant_live ",
        OXAPAY_SANDBOX: "false",
      }).merchantApiKey,
    ).toBe("merchant_live");
    expect(isOxaPayConfigured({})).toBe(false);
  });
});
