# Shared Layouts

## RootLayout

- File: `app/layout.tsx`
- Description: Root App Router layout for every page. It loads global CSS, defines site-wide metadata and favicon, imports the Fraunces/Bricolage Grotesque/IBM Plex Mono Google Fonts, and renders the route as the body child. Shared header and footer are intentionally rendered by individual pages, not by this root layout.

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

const favicon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect fill='%23c4451c' width='32' height='32'/%3E%3Ctext x='16' y='22' text-anchor='middle' font-size='11' font-family='Georgia' fill='%23efe8da'%3E48%3C/text%3E%3C/svg%3E";

export const metadata: Metadata = {
  title: {
    default: "Launch48 — a live landing page in 48 hours",
    template: "%s — Launch48",
  },
  description:
    "Send a brief. Pay $349 in crypto through OxaPay. Get one live marketing landing page in 48 hours, or receive a full refund.",
  icons: { icon: favicon },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,800&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,500&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## ExampleLayout

- File: `app/example/layout.tsx`
- Description: Nested layout for `/example`. It supplies the absolute “Fieldnote Coffee — Launch48 sample” title, a sample-specific description, and `noindex, nofollow` robots metadata, then passes children through. The page implements its own fictional-brand header and footer inline and does not use the shared Launch48 shell.

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { absolute: "Fieldnote Coffee — Launch48 sample" },
  description:
    "A fictional specialty-coffee landing page written, designed, and built to demonstrate the Launch48 one-page format.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ExampleLayout({ children }: { children: ReactNode }) {
  return children;
}
```

## Header

- File: `components/Header.tsx`
- Description: Server-side layout bridge used by the main Launch48 pages. It computes whether both OxaPay and order storage are configured, then passes that state to the client-side site header.

```tsx
import { isOxaPayConfigured } from "@/lib/config";
import { isOrderStorageConfigured } from "@/lib/orders";
import { SiteHeader } from "./SiteHeader";

export function Header() {
  const paymentsConfigured =
    isOxaPayConfigured() && isOrderStorageConfigured();
  return <SiteHeader paymentsConfigured={paymentsConfigured} />;
}
```

## SiteHeader

- File: `components/SiteHeader.tsx`
- Description: Shared sticky responsive header with skip link, Launch48 wordmark, anchor navigation, example link, mobile menu state, and the payment CTA.

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { PurchaseCta } from "./PurchaseCta";

type SiteHeaderProps = {
  paymentsConfigured: boolean;
};

export function SiteHeader({ paymentsConfigured }: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="wrap header-inner">
          <Link className="wordmark" href="/" onClick={() => setMenuOpen(false)}>
            <strong>Launch48</strong>
            <span>launch48.xyz</span>
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
          <nav
            className={`nav${menuOpen ? " open" : ""}`}
            id="site-nav"
            aria-label="Primary navigation"
          >
            <Link href="/#how" onClick={() => setMenuOpen(false)}>
              How it works
            </Link>
            <Link href="/#included" onClick={() => setMenuOpen(false)}>
              Included
            </Link>
            <Link href="/#price" onClick={() => setMenuOpen(false)}>
              Price
            </Link>
            <Link href="/#faq" onClick={() => setMenuOpen(false)}>
              FAQ
            </Link>
            <Link href="/example" onClick={() => setMenuOpen(false)}>
              Example
            </Link>
            <PurchaseCta configured={paymentsConfigured} className="btn" />
          </nav>
        </div>
      </header>
    </>
  );
}
```

## SiteFooter

- File: `components/SiteFooter.tsx`
- Description: Shared Launch48 footer with product summary and brief/privacy/terms navigation.

```tsx
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <span>Launch48 · launch48.xyz · $349 · 48 hours</span>
        <nav className="footer-links" aria-label="Footer navigation">
          <Link href="/brief">Brief</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
```

## Component barrel

- File: `components/index.ts`
- Description: Public exports used by page files; `SiteFooter` is also exported under the `Footer` alias.

```ts
export { Header } from "./Header";
export { SiteHeader } from "./SiteHeader";
export { SiteFooter, SiteFooter as Footer } from "./SiteFooter";
export { PurchaseCta } from "./PurchaseCta";
```

## Important page-shell exception

The `/example` route intentionally does not render `Header` or `SiteFooter`. Its skip link, Launch48 disclosure/conversion bar, sticky Fieldnote header, section navigation, conversion CTA, and footer live inline in `app/example/page.tsx` and are styled by `app/example/example.module.css`. Its wordmark references the local static asset `public/fieldnote-mark.svg`.
