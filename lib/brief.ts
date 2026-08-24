import { z } from "zod";

const BRIEF_FIELD_MAX = 500;

const requiredText = (label: string, max = BRIEF_FIELD_MAX) =>
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
    .max(BRIEF_FIELD_MAX, "Domain must be 500 characters or fewer")
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
