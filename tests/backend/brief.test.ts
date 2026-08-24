import { describe, expect, it } from "vitest";

import {
  BRIEF_METADATA_KEYS,
  briefSchema,
  fromPolarMetadata,
  toPolarMetadata,
} from "../../lib/brief";

const validBrief = {
  businessName: "  Acme Studio  ",
  pitch: "A focused launch page for careful founders.",
  audience: "Independent founders preparing a launch.",
  tone: "Quiet and editorial",
  referenceUrls: "https://example.com\nhttps://example.org — typography",
  colors: "Rust, paper, and ink",
  mustHaveSections: "Hero\nOffer\nFAQ\nCTA",
  contactEmail: " hello@example.com ",
  domain: "launch.example.com",
};

describe("brief validation", () => {
  it("normalizes a complete brief", () => {
    const parsed = briefSchema.parse(validBrief);
    expect(parsed.businessName).toBe("Acme Studio");
    expect(parsed.contactEmail).toBe("hello@example.com");
    expect(parsed.domain).toBe("launch.example.com");
  });

  it.each([
    "businessName",
    "pitch",
    "audience",
    "tone",
    "referenceUrls",
    "colors",
    "mustHaveSections",
    "contactEmail",
  ])("rejects a blank required field: %s", (field) => {
    expect(
      briefSchema.safeParse({ ...validBrief, [field]: " " }).success,
    ).toBe(false);
  });

  it("accepts an omitted or blank optional domain", () => {
    const { domain: _domain, ...withoutDomain } = validBrief;
    expect(briefSchema.parse(withoutDomain).domain).toBeUndefined();
    expect(briefSchema.parse({ ...validBrief, domain: " " }).domain).toBeUndefined();
  });

  it("rejects malformed contact email, references, and domain", () => {
    expect(
      briefSchema.safeParse({ ...validBrief, contactEmail: "not-an-email" })
        .success,
    ).toBe(false);
    expect(
      briefSchema.safeParse({ ...validBrief, referenceUrls: "example dot com" })
        .success,
    ).toBe(false);
    expect(
      briefSchema.safeParse({ ...validBrief, domain: "not a domain" }).success,
    ).toBe(false);
  });

  it("keeps every Polar metadata string within 500 characters", () => {
    const brief = briefSchema.parse({ ...validBrief, audience: "a".repeat(500) });
    const metadata = toPolarMetadata(brief);
    expect(Object.values(metadata).every((value) => value.length <= 500)).toBe(
      true,
    );
    expect(
      briefSchema.safeParse({ ...validBrief, audience: "a".repeat(501) }).success,
    ).toBe(false);
  });
});

describe("Polar brief metadata", () => {
  it("round-trips the full normalized brief, including Unicode", () => {
    const brief = briefSchema.parse({
      ...validBrief,
      pitch: "A warm page for caf\u00e9 owners & makers.",
      colors: "Rugin\u0103 #c4451c",
    });
    expect(fromPolarMetadata(toPolarMetadata(brief))).toEqual(brief);
  });

  it("rejects absent, version-mismatched, and incomplete metadata", () => {
    expect(fromPolarMetadata(null)).toBeNull();
    const metadata = toPolarMetadata(briefSchema.parse(validBrief));
    expect(
      fromPolarMetadata({ ...metadata, [BRIEF_METADATA_KEYS.schema]: "2" }),
    ).toBeNull();
    const { [BRIEF_METADATA_KEYS.pitch]: _pitch, ...missingPitch } = metadata;
    expect(fromPolarMetadata(missingPitch)).toBeNull();
  });
});
