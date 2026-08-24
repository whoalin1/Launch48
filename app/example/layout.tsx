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
