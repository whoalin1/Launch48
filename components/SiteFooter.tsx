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
