# Shared UI Components

## Stack and component-library detection

- Framework: React 19.2 with Next.js 16.3 App Router.
- Language: TypeScript with React Server Components by default and explicit `"use client"` boundaries.
- Component library: none. The project uses custom React components and semantic HTML.
- Styling: global vanilla CSS in `css/site.css` plus App Router additions in `app/globals.css`; the example page uses a CSS Module.
- Shared component directory: `components/`.

Layout-specific components are documented with full source in `layouts.md` to avoid duplicating them here. The rewritten Fieldnote sample remains inline in `app/example/page.tsx`; its extraction candidates are cataloged in `extractable-components.md`.

## PurchaseCta

- File: `components/PurchaseCta.tsx`
- Description: Shared payment CTA that links to the brief when OxaPay and order storage are configured, otherwise renders a safe disabled state.
- Key props: `configured: boolean`; `className?: string` (default `"btn btn-accent"`).

```tsx
import Link from "next/link";

type PurchaseCtaProps = {
  configured: boolean;
  className?: string;
};

export function PurchaseCta({
  configured,
  className = "btn btn-accent",
}: PurchaseCtaProps) {
  if (!configured) {
    return (
      <button
        className={`${className} btn-disabled`}
        type="button"
        disabled
        aria-disabled="true"
        title="OxaPay payments have not been configured for this deployment."
      >
        Payments not configured
      </button>
    );
  }

  return (
    <Link className={className} href="/brief">
      Pay $349 in crypto
    </Link>
  );
}
```

## FaqList

- File: `components/FaqList.tsx`
- Description: Client-side single-open accordion for the home-page FAQ.
- Key props: none; question and answer copy are currently hardcoded.

```tsx
"use client";

import { useState } from "react";

const faqs = [
  {
    question: "When does the 48-hour clock start?",
    answer:
      "After you complete the brief and OxaPay confirms the $349 crypto payment. Incomplete briefs or unsuccessful payments do not start the clock. Weekends and holidays are counted as working time unless we write otherwise before you pay.",
  },
  {
    question: "What if you miss 48 hours?",
    answer:
      "You get a full refund. That is the guarantee. If you still want the page after a late delivery, we can finish it as a separate agreement — you are not obligated.",
  },
  {
    question: "What does the one revision cover?",
    answer:
      "Copy edits, layout order, spacing, color, and type adjustments on the shipped page. It does not cover a new sitemap, extra pages, a brand-identity pass, or adding app features.",
  },
  {
    question: "Can you write all the copy?",
    answer:
      "Yes, from your brief. The stronger the brief — especially the one-sentence pitch and audience — the closer the first draft will be. You can also paste existing copy and we will typeset and edit it.",
  },
  {
    question: "Do I need a domain?",
    answer:
      "No. We deploy to a Vercel URL. If you already have a domain, you can point it after launch. Domain purchase and DNS changes are yours to handle.",
  },
  {
    question: "Why isn’t there a wall of testimonials?",
    answer:
      "We do not invent customers, revenue, or user counts. The offer is the process, the scope, and the 48-hour refund. A fictional shipped example is linked in the navigation so you can see the kind of work this ticket produces.",
  },
] as const;

export function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const answerId = `faq-answer-${index}`;

        return (
          <div className={`faq-item${isOpen ? " open" : ""}`} key={faq.question}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              {faq.question} <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
            </button>
            <div className="answer" id={answerId} hidden={!isOpen}>
              {faq.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

## BriefForm

- File: `components/BriefForm.tsx`
- Description: Client-side, fully validated customer brief form that creates the OxaPay checkout and redirects only to an approved OxaPay host.
- Key props: `paymentsConfigured: boolean`.

```tsx
"use client";

import type { FormEvent, InvalidEvent } from "react";
import { useRef, useState } from "react";

const fieldNames = [
  "businessName",
  "pitch",
  "audience",
  "tone",
  "referenceUrls",
  "colors",
  "mustHaveSections",
  "contactEmail",
  "domain",
] as const;

type FieldName = (typeof fieldNames)[number];
type FieldErrors = Partial<Record<FieldName, string>>;
type FieldControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

type CheckoutPayload = {
  businessName: string;
  pitch: string;
  audience: string;
  tone: string;
  referenceUrls: string;
  colors: string;
  mustHaveSections: string;
  contactEmail: string;
  domain?: string;
};

type CheckoutResponse = {
  paymentUrl?: string;
  checkoutId?: string;
  checkoutUrl?: string;
  url?: string;
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string | string[]>;
  };
};

const requiredMessages: Record<Exclude<FieldName, "domain">, string> = {
  businessName: "Enter your business name.",
  pitch: "Write one sentence explaining what you sell and why it matters.",
  audience: "Describe the specific audience this page should speak to.",
  tone: "Choose the tone you want us to use.",
  referenceUrls: "Add at least one reference URL.",
  colors: "Add your colors, or write “set something temporary.”",
  mustHaveSections: "List the sections the page must include.",
  contactEmail: "Enter the email address we should use for fulfillment.",
};

function validityMessage(control: FieldControl, name: FieldName): string {
  if (control.validity.valueMissing && name !== "domain") {
    return requiredMessages[name];
  }

  if (control.validity.typeMismatch && name === "contactEmail") {
    return "Enter a complete email address, such as you@company.com.";
  }

  if (control.validity.typeMismatch && name === "domain") {
    return "Enter a full domain URL beginning with https://, or leave it blank.";
  }

  if (control.validity.tooShort) {
    return "Add a little more detail so we can build from this answer.";
  }

  if (control.validity.tooLong && !(control instanceof HTMLSelectElement)) {
    return `Keep this answer under ${control.maxLength} characters.`;
  }

  return "Check this field and try again.";
}

function RequiredMark() {
  return (
    <>
      <span className="required-mark" aria-hidden="true">
        *
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}

function isOxaPayCheckoutUrl(value: string | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "oxapay.com" || url.hostname.endsWith(".oxapay.com"))
    );
  } catch {
    return false;
  }
}

export function BriefForm({ paymentsConfigured }: { paymentsConfigured: boolean }) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [paymentsUnavailable, setPaymentsUnavailable] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const canSubmit = paymentsConfigured && !paymentsUnavailable;

  function setFieldError(name: FieldName, message?: string) {
    setFieldErrors((current) => {
      if (!message && !(name in current)) return current;
      const next = { ...current };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  }

  function validateControl(control: FieldControl) {
    const name = control.name as FieldName;
    if (!fieldNames.includes(name)) return;

    if (!control.validity.valid) {
      setFieldError(name, validityMessage(control, name));
      return;
    }

    if (name !== "domain" && !control.value.trim()) {
      setFieldError(name, requiredMessages[name]);
      return;
    }

    if (name === "referenceUrls" && !/https?:\/\/\S+/i.test(control.value)) {
      setFieldError(name, "Add at least one full URL beginning with http:// or https://.");
      return;
    }

    setFieldError(name);
  }

  function handleInvalid(event: InvalidEvent<HTMLFormElement>) {
    const control = event.target as FieldControl;
    const name = control.name as FieldName;
    if (!fieldNames.includes(name)) return;
    setFieldError(name, validityMessage(control, name));
  }

  function focusFirstField(names: FieldName[]) {
    const first = names[0];
    if (!first) return;
    document.querySelector<FieldControl>(`[name="${first}"]`)?.focus();
  }

  function payloadFromForm(form: HTMLFormElement): CheckoutPayload {
    const values = new FormData(form);
    const value = (name: FieldName) => String(values.get(name) ?? "").trim();
    const domain = value("domain");

    return {
      businessName: value("businessName"),
      pitch: value("pitch"),
      audience: value("audience"),
      tone: value("tone"),
      referenceUrls: value("referenceUrls"),
      colors: value("colors"),
      mustHaveSections: value("mustHaveSections"),
      contactEmail: value("contactEmail"),
      ...(domain ? { domain } : {}),
    };
  }

  function validatePayload(payload: CheckoutPayload): FieldErrors {
    const next: FieldErrors = {};

    for (const name of fieldNames) {
      if (name === "domain") continue;
      if (!payload[name].trim()) next[name] = requiredMessages[name];
    }

    if (!/https?:\/\/\S+/i.test(payload.referenceUrls)) {
      next.referenceUrls =
        "Add at least one full URL beginning with http:// or https://.";
    }

    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (!canSubmit) {
      setSubmissionError(
        "Payments are not configured for this deployment, so checkout cannot open yet.",
      );
      requestAnimationFrame(() => bannerRef.current?.focus());
      return;
    }

    const payload = payloadFromForm(event.currentTarget);
    const localErrors = validatePayload(payload);

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      focusFirstField(fieldNames.filter((name) => Boolean(localErrors[name])));
      return;
    }

    setBusy(true);
    setSubmissionError(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as CheckoutResponse | null;

      if (!response.ok) {
        const serverFields: FieldErrors = {};
        if (data?.error?.fields) {
          for (const [name, messages] of Object.entries(data.error.fields)) {
            if (!fieldNames.includes(name as FieldName)) continue;
            const message = Array.isArray(messages) ? messages[0] : messages;
            if (message) serverFields[name as FieldName] = message;
          }
        }

        if (Object.keys(serverFields).length > 0) {
          setFieldErrors(serverFields);
          focusFirstField(fieldNames.filter((name) => Boolean(serverFields[name])));
        }

        if (
          response.status === 503 ||
          data?.error?.code === "payments_not_configured"
        ) {
          setPaymentsUnavailable(true);
        }

        setSubmissionError(
          data?.error?.message ??
            "Checkout could not be opened. No payment was collected; please try again.",
        );
        requestAnimationFrame(() => bannerRef.current?.focus());
        return;
      }

      const checkoutUrl = data?.paymentUrl ?? data?.checkoutUrl ?? data?.url;
      if (!isOxaPayCheckoutUrl(checkoutUrl)) {
        setSubmissionError(
          "Checkout did not return a secure OxaPay URL. No payment was collected; please try again.",
        );
        requestAnimationFrame(() => bannerRef.current?.focus());
        return;
      }

      window.location.assign(checkoutUrl);
    } catch {
      setSubmissionError(
        "We could not reach checkout. No payment was collected; check your connection and try again.",
      );
      requestAnimationFrame(() => bannerRef.current?.focus());
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="brief"
      onSubmit={handleSubmit}
      onInvalid={handleInvalid}
      aria-describedby="brief-terms-note"
    >
      {!paymentsConfigured ? (
        <div className="banner show config-banner" role="status">
          Payments not configured. You can review the brief, but this deployment
          cannot open OxaPay checkout yet.
        </div>
      ) : null}

      {submissionError ? (
        <div
          className="banner show"
          ref={bannerRef}
          tabIndex={-1}
          role="alert"
        >
          {submissionError}
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="businessName">
          Business name <RequiredMark />
        </label>
        <div className="field-control">
          <input
            id="businessName"
            name="businessName"
            type="text"
            required
            minLength={2}
            maxLength={100}
            placeholder="e.g. Fieldnote Coffee"
            autoComplete="organization"
            aria-invalid={Boolean(fieldErrors.businessName)}
            aria-describedby={fieldErrors.businessName ? "businessName-error" : undefined}
            onBlur={(event) => validateControl(event.currentTarget)}
            onChange={(event) => {
              if (event.currentTarget.validity.valid) setFieldError("businessName");
            }}
          />
          {fieldErrors.businessName ? (
            <p className="field-error" id="businessName-error" role="alert">
              {fieldErrors.businessName}
            </p>
          ) : null}
        </div>
      </div>

      <div className="field">
        <label htmlFor="pitch">
          One-sentence pitch <RequiredMark />
        </label>
        <div className="field-control">
          <textarea
            id="pitch"
            name="pitch"
            required
            minLength={10}
            maxLength={300}
            placeholder="What you sell, to whom, and why they should care."
            aria-invalid={Boolean(fieldErrors.pitch)}
            aria-describedby={fieldErrors.pitch ? "pitch-error" : undefined}
            onBlur={(event) => validateControl(event.currentTarget)}
            onChange={(event) => {
              if (event.currentTarget.validity.valid) setFieldError("pitch");
            }}
          />
          {fieldErrors.pitch ? (
            <p className="field-error" id="pitch-error" role="alert">
              {fieldErrors.pitch}
            </p>
          ) : null}
        </div>
      </div>

      <div className="field">
        <label htmlFor="audience">
          Audience <RequiredMark />
        </label>
        <div className="field-control">
          <textarea
            id="audience"
            name="audience"
            required
            minLength={10}
            maxLength={500}
            placeholder="Who this page is for: role, context, and what they have already tried."
            aria-invalid={Boolean(fieldErrors.audience)}
            aria-describedby={fieldErrors.audience ? "audience-error" : undefined}
            onBlur={(event) => validateControl(event.currentTarget)}
            onChange={(event) => {
              if (event.currentTarget.validity.valid) setFieldError("audience");
            }}
          />
          {fieldErrors.audience ? (
            <p className="field-error" id="audience-error" role="alert">
              {fieldErrors.audience}
            </p>
          ) : null}
        </div>
      </div>

      <div className="field">
        <label htmlFor="tone">
          Tone <RequiredMark />
        </label>
        <div className="field-control">
          <select
            id="tone"
            name="tone"
            required
            defaultValue=""
            aria-invalid={Boolean(fieldErrors.tone)}
            aria-describedby={fieldErrors.tone ? "tone-error" : undefined}
            onBlur={(event) => validateControl(event.currentTarget)}
            onChange={(event) => {
              if (event.currentTarget.validity.valid) setFieldError("tone");
            }}
          >
            <option value="" disabled>
              Choose a register
            </option>
            <option>Quiet and editorial</option>
            <option>Direct and commercial</option>
            <option>Warm and neighborly</option>
            <option>Technical and precise</option>
            <option>Playful but grown-up</option>
          </select>
          {fieldErrors.tone ? (
            <p className="field-error" id="tone-error" role="alert">
              {fieldErrors.tone}
            </p>
          ) : null}
        </div>
      </div>

      <div className="field">
        <label htmlFor="referenceUrls">
          Reference URLs <RequiredMark />
        </label>
        <div className="field-control">
          <textarea
            id="referenceUrls"
            name="referenceUrls"
            required
            minLength={8}
            maxLength={500}
            placeholder="Sites you like — or dislike. One full URL per line, with a note if useful."
            inputMode="url"
            aria-invalid={Boolean(fieldErrors.referenceUrls)}
            aria-describedby={fieldErrors.referenceUrls ? "referenceUrls-error" : undefined}
            onBlur={(event) => validateControl(event.currentTarget)}
            onChange={(event) => {
              if (event.currentTarget.validity.valid && /https?:\/\/\S+/i.test(event.currentTarget.value)) {
                setFieldError("referenceUrls");
              }
            }}
          />
          {fieldErrors.referenceUrls ? (
            <p className="field-error" id="referenceUrls-error" role="alert">
              {fieldErrors.referenceUrls}
            </p>
          ) : null}
        </div>
      </div>

      <div className="field">
        <label htmlFor="colors">
          Colors <RequiredMark />
        </label>
        <div className="field-control">
          <input
            id="colors"
            name="colors"
            type="text"
            required
            minLength={2}
            maxLength={200}
            placeholder="Existing palette, or “set something temporary”"
            aria-invalid={Boolean(fieldErrors.colors)}
            aria-describedby={fieldErrors.colors ? "colors-error" : undefined}
            onBlur={(event) => validateControl(event.currentTarget)}
            onChange={(event) => {
              if (event.currentTarget.validity.valid) setFieldError("colors");
            }}
          />
          {fieldErrors.colors ? (
            <p className="field-error" id="colors-error" role="alert">
              {fieldErrors.colors}
            </p>
          ) : null}
        </div>
      </div>

      <div className="field">
        <label htmlFor="mustHaveSections">
          Must-have sections <RequiredMark />
        </label>
        <div className="field-control">
          <textarea
            id="mustHaveSections"
            name="mustHaveSections"
            required
            minLength={2}
            maxLength={500}
            placeholder="Hero, proof, features, FAQ, and CTA are the default. Add anything else that must appear."
            aria-invalid={Boolean(fieldErrors.mustHaveSections)}
            aria-describedby={fieldErrors.mustHaveSections ? "mustHaveSections-error" : undefined}
            onBlur={(event) => validateControl(event.currentTarget)}
            onChange={(event) => {
              if (event.currentTarget.validity.valid) setFieldError("mustHaveSections");
            }}
          />
          {fieldErrors.mustHaveSections ? (
            <p className="field-error" id="mustHaveSections-error" role="alert">
              {fieldErrors.mustHaveSections}
            </p>
          ) : null}
        </div>
      </div>

      <div className="field">
        <label htmlFor="contactEmail">
          Contact email <RequiredMark />
        </label>
        <div className="field-control">
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            required
            maxLength={254}
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.contactEmail)}
            aria-describedby={fieldErrors.contactEmail ? "contactEmail-error" : undefined}
            onBlur={(event) => validateControl(event.currentTarget)}
            onChange={(event) => {
              if (event.currentTarget.validity.valid) setFieldError("contactEmail");
            }}
          />
          {fieldErrors.contactEmail ? (
            <p className="field-error" id="contactEmail-error" role="alert">
              {fieldErrors.contactEmail}
            </p>
          ) : null}
        </div>
      </div>

      <div className="field">
        <label htmlFor="domain">Domain (optional)</label>
        <div className="field-control">
          <input
            id="domain"
            name="domain"
            type="url"
            maxLength={253}
            placeholder="https://yourdomain.com"
            inputMode="url"
            autoComplete="url"
            aria-invalid={Boolean(fieldErrors.domain)}
            aria-describedby={fieldErrors.domain ? "domain-error" : undefined}
            onBlur={(event) => validateControl(event.currentTarget)}
            onChange={(event) => {
              if (event.currentTarget.validity.valid) setFieldError("domain");
            }}
          />
          {fieldErrors.domain ? (
            <p className="field-error" id="domain-error" role="alert">
              {fieldErrors.domain}
            </p>
          ) : null}
        </div>
      </div>

      <div className="form-actions">
        <button
          className="btn btn-accent"
          type="submit"
          disabled={!canSubmit || busy}
          aria-busy={busy}
        >
          {busy
            ? "Opening OxaPay checkout…"
            : canSubmit
              ? "Pay $349 in crypto"
              : "Payments not configured"}
        </button>
        <p className="note" id="brief-terms-note">
          $349 USD is paid in crypto through OxaPay after this brief. The 48-hour
          clock starts after successful payment + a complete brief. One revision.
          Full refund if we miss 48 hours.
        </p>
      </div>
    </form>
  );
}
```
