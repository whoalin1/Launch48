import { z } from "zod";

const POLAR_METADATA_MAX = 500;

const requiredText = (label: string, max = POLAR_METADATA_MAX) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

function containsHttpUrl(value: string): boolean {
  const candidates = value.match(/https?:\/\/[^\s,]+/gi) ?? [];
  return candidates.some((candidate) => {
    try {
      const url = new URL(candidate.replace(/[.)\]}]+$/, ""));
      return (
        (url.protocol === "http:" || url.protocol === "https:") &&
        Boolean(url.hostname)
      );
    } catch {
      return false;
    }
  });
}

function isDomainOrHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

const optionalDomain = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  z
    .string({ error: "Domain must be text" })
    .trim()
    .max(POLAR_METADATA_MAX, "Domain must be 500 characters or fewer")
    .refine(isDomainOrHttpUrl, "Enter a valid domain or URL")
    .optional(),
);

export const briefSchema = z
  .object({
    businessName: requiredText("Business name", 160),
    pitch: requiredText("One-sentence pitch"),
    audience: requiredText("Audience"),
    tone: requiredText("Tone"),
    referenceUrls: requiredText("Reference URLs").refine(
      containsHttpUrl,
      "Include at least one valid http:// or https:// reference URL",
    ),
    colors: requiredText("Colors"),
    mustHaveSections: requiredText("Must-have sections"),
    contactEmail: z
      .string({ error: "Contact email is required" })
      .trim()
      .min(1, "Contact email is required")
      .max(254, "Contact email must be 254 characters or fewer")
      .email("Enter a valid contact email"),
    domain: optionalDomain,
  })
  .strict();

export type Brief = z.infer<typeof briefSchema>;

export const BRIEF_METADATA_KEYS = {
  schema: "launch48_schema",
  businessName: "business_name",
  pitch: "pitch",
  audience: "audience",
  tone: "tone",
  referenceUrls: "reference_urls",
  colors: "colors",
  mustHaveSections: "must_have_sections",
  contactEmail: "contact_email",
  domain: "domain",
} as const;

export type PolarBriefMetadata = Record<string, string>;

export function toPolarMetadata(brief: Brief): PolarBriefMetadata {
  return {
    [BRIEF_METADATA_KEYS.schema]: "1",
    [BRIEF_METADATA_KEYS.businessName]: brief.businessName,
    [BRIEF_METADATA_KEYS.pitch]: brief.pitch,
    [BRIEF_METADATA_KEYS.audience]: brief.audience,
    [BRIEF_METADATA_KEYS.tone]: brief.tone,
    [BRIEF_METADATA_KEYS.referenceUrls]: brief.referenceUrls,
    [BRIEF_METADATA_KEYS.colors]: brief.colors,
    [BRIEF_METADATA_KEYS.mustHaveSections]: brief.mustHaveSections,
    [BRIEF_METADATA_KEYS.contactEmail]: brief.contactEmail,
    [BRIEF_METADATA_KEYS.domain]: brief.domain ?? "",
  };
}

export function fromPolarMetadata(metadata: unknown): Brief | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const source = metadata as Record<string, unknown>;
  if (source[BRIEF_METADATA_KEYS.schema] !== "1") {
    return null;
  }

  const parsed = briefSchema.safeParse({
    businessName: source[BRIEF_METADATA_KEYS.businessName],
    pitch: source[BRIEF_METADATA_KEYS.pitch],
    audience: source[BRIEF_METADATA_KEYS.audience],
    tone: source[BRIEF_METADATA_KEYS.tone],
    referenceUrls: source[BRIEF_METADATA_KEYS.referenceUrls],
    colors: source[BRIEF_METADATA_KEYS.colors],
    mustHaveSections: source[BRIEF_METADATA_KEYS.mustHaveSections],
    contactEmail: source[BRIEF_METADATA_KEYS.contactEmail],
    domain: source[BRIEF_METADATA_KEYS.domain],
  });

  return parsed.success ? parsed.data : null;
}

export function briefFieldErrors(
  error: z.ZodError,
): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    (fields[field] ??= []).push(issue.message);
  }
  return fields;
}
