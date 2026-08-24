import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { absolute: "Fieldnote Coffee — small-batch roasting" },
  description:
    "Fieldnote Coffee. Small-lot roasting from a converted mill. Subscriptions and single origins. A fictional sample landing page shipped in the Launch48 format.",
};

export default function ExampleLayout({ children }: { children: ReactNode }) {
  return children;
}
