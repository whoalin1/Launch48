import { isOxaPayConfigured } from "@/lib/config";
import { isOrderStorageConfigured } from "@/lib/orders";
import { SiteHeader } from "./SiteHeader";

export function Header() {
  const paymentsConfigured =
    isOxaPayConfigured() && isOrderStorageConfigured();
  return <SiteHeader paymentsConfigured={paymentsConfigured} />;
}
