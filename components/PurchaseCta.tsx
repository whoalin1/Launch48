import Link from "next/link";

type PurchaseCtaProps = {
  configured: boolean;
  className?: string;
};

export function PurchaseCta({
  configured,
  className = "btn btn-accent",
}: PurchaseCtaProps) {
  if (!configured) {
    return (
      <button
        className={`${className} btn-disabled`}
        type="button"
        disabled
        aria-disabled="true"
        title="Polar payments have not been configured for this deployment."
      >
        Payments not configured
      </button>
    );
  }

  return (
    <Link className={className} href="/brief">
      Pay $349
    </Link>
  );
}
