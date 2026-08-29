"use client";

import { List } from "@phosphor-icons/react/dist/csr/List";
import { X } from "@phosphor-icons/react/dist/csr/X";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { CheckoutLink } from "@/components/checkout-link";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const navItems = [
  { href: "#offer", id: "offer", label: "Offer", index: "01" },
  { href: "#process", id: "process", label: "Process", index: "02" },
  { href: "#faq", id: "faq", label: "FAQ", index: "03" },
] as const;

export function SiteHeader({ checkoutUrl }: { checkoutUrl?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        closeMenu();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeMenu]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768 && isOpen) {
        closeMenu();
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, closeMenu]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
    href: string
  ) => {
    e.preventDefault();
    closeMenu();

    if (id === "top") {
      setActiveSection(null);
    } else {
      setActiveSection(id);
    }
    setHoveredSection(null);

    const target = document.getElementById(id);
    if (!target) return;

    const currentScrollY = window.scrollY;
    const headerOffset = 68;
    const targetTop =
      target.getBoundingClientRect().top + currentScrollY - headerOffset;

    // Determine direction for the bespoke directional warp animation
    const direction = targetTop > currentScrollY ? "down" : "up";

    // 1. Contextual video positioning:
    // If target is above/at video (Hero / Offer): video at start.
    // If target is below video (Process / FAQ): video at end.
    const position = id === "top" || id === "offer" ? "top" : "bottom";
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("navbar-navigating", {
          detail: { targetId: id, position },
        })
      );
    }

    // 2. Trigger the bespoke visual warp animation
    document.body.dataset.navTransition = direction;

    // 3. At peak blur (150ms), instantly teleport scroll to destination
    setTimeout(() => {
      const lenis = window.__lenis;
      if (lenis) {
        lenis.scrollTo(target, { immediate: true, offset: -headerOffset });
      } else {
        window.scrollTo({ top: targetTop, behavior: "instant" });
      }
    }, 150);

    // 4. Conclude the warp animation at 340ms
    setTimeout(() => {
      delete document.body.dataset.navTransition;
    }, 340);

    history.pushState(null, "", href);
  };

  useEffect(() => {
    const sectionIds = ["offer", "process", "faq"];

    function updateActiveSection() {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY + windowHeight >= documentHeight - 70) {
        setActiveSection("faq");
        return;
      }

      if (scrollY < 240) {
        setActiveSection(null);
        return;
      }

      let found: string | null = null;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= windowHeight * 0.45 && rect.bottom >= 80) {
            found = id;
          }
        }
      }

      if (found) {
        setActiveSection(found);
      }
    }

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });

    const lenis = window.__lenis;
    let unsubscribe: (() => void) | undefined;
    if (lenis && typeof lenis.on === "function") {
      unsubscribe = lenis.on("scroll", updateActiveSection);
    }

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const highlightedSection = hoveredSection ?? activeSection;

  return (
    <header className="site-header">
      <div className="nav-transition-laser" aria-hidden="true" />
      <div className="site-header__inner">
        <a
          href="#top"
          className="site-logo-link"
          aria-label="Launch48 home"
          onClick={(e) => handleNavClick(e, "top", "#top")}
        >
          <Image
            src="/launch48-logo-dark.png"
            alt="Launch48"
            width={184}
            height={25}
            priority
            className="site-logo-img"
          />
        </a>

        <nav
          className="site-nav"
          aria-label="Primary navigation"
          onMouseLeave={() => setHoveredSection(null)}
        >
          {navItems.map((item) => {
            const isHighlighted = highlightedSection === item.id;
            return (
              <a
                key={item.href}
                href={item.href}
                className={isHighlighted ? "is-active" : undefined}
                onMouseEnter={() => setHoveredSection(item.id)}
                onClick={(e) => handleNavClick(e, item.id, item.href)}
              >
                {isHighlighted && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="site-nav__active-pill"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 32, mass: 0.22 }
                    }
                  />
                )}
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="site-header__actions">
          <CheckoutLink href={checkoutUrl} compact />
          <button
            type="button"
            className="site-header__toggle"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? (
              <X size={20} weight="bold" aria-hidden="true" />
            ) : (
              <List size={20} weight="bold" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav-menu"
            className="site-header__mobile-menu"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav className="site-header__mobile-nav" aria-label="Mobile navigation">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`site-header__mobile-link${isActive ? " is-active" : ""}`}
                    onClick={(e) => handleNavClick(e, item.id, item.href)}
                  >
                    <span className="site-header__mobile-index">{item.index}</span>
                    <span className="site-header__mobile-label">{item.label}</span>
                  </a>
                );
              })}
            </nav>
            <div className="site-header__mobile-footer">
              <CheckoutLink
                className="checkout-link--mobile"
                onClick={closeMenu}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
