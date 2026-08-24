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
