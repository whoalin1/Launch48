import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";

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
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
