import type { Metadata } from "next";
import { SuccessView } from "@/components/success-view";

export const metadata: Metadata = {
  title: "Thank You — Launch48",
  description:
    "Payment confirmed. Share your brief so the 48-hour delivery countdown can start.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuccessPage() {
  return <SuccessView />;
}
