"use client";

import { ArrowUpRight } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import {
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import type { PointerEvent, MouseEvent } from "react";
import { usePaymentModal } from "@/components/payment-modal-context";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type CheckoutLinkProps = {
  href?: string;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
};

const spring = {
  stiffness: 420,
  damping: 32,
  mass: 0.22,
};

export function CheckoutLink({
  compact = false,
  className = "",
  onClick,
}: CheckoutLinkProps) {
  const { openModal } = usePaymentModal();
  const reduceMotion = usePrefersReducedMotion();
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, spring);
  const y = useSpring(targetY, spring);
  const classes = `checkout-link${compact ? " checkout-link--compact" : ""} ${className}`.trim();

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
    targetX.set(relativeX * 8);
    targetY.set(relativeY * 6);
  }

  function resetPosition() {
    targetX.set(0);
    targetY.set(0);
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (onClick) {
      onClick();
    }
    openModal();
  }

  const content = (
    <>
      <span>Start for $149</span>
      <ArrowUpRight aria-hidden="true" size={compact ? 16 : 18} weight="bold" />
    </>
  );

  return (
    <motion.button
      type="button"
      className={classes}
      aria-label="Start your Launch48 website for $149"
      style={{ x, y }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", bounce: 0, duration: 0.36 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      onPointerCancel={resetPosition}
      onClick={handleClick}
    >
      {content}
    </motion.button>
  );
}
