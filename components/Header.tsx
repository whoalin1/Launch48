import { isPolarConfigured } from "@/lib/config";
import { isOrderStorageConfigured } from "@/lib/orders";
import { SiteHeader } from "./SiteHeader";

export function Header() {
  const paymentsConfigured =
    isPolarConfigured() && isOrderStorageConfigured();
  return <SiteHeader paymentsConfigured={paymentsConfigured} />;
}
