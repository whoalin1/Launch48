"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import type { PointerEvent } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const visualSpring = {
  stiffness: 130,
  damping: 24,
  mass: 0.55,
};

function getPointerPosition(event: PointerEvent<HTMLElement>) {
  const bounds = event.currentTarget.getBoundingClientRect();
  return {
    x: (event.clientX - bounds.left) / bounds.width - 0.5,
    y: (event.clientY - bounds.top) / bounds.height - 0.5,
  };
}

export function HeroVisual() {
  const reduceMotion = usePrefersReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, visualSpring);
  const smoothY = useSpring(pointerY, visualSpring);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-4.5, 4.5]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [4, -4]);
  const shiftX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const shiftY = useTransform(smoothY, [-0.5, 0.5], [-6, 6]);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const position = getPointerPosition(event);
    pointerX.set(position.x);
    pointerY.set(position.y);
  }

  function reset() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <motion.figure
      className="hero-visual"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.965, y: 22 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.7, delay: 0.14 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <motion.div
        className="hero-visual__plane"
        style={
          reduceMotion
            ? undefined
            : { rotateX, rotateY, x: shiftX, y: shiftY, transformPerspective: 1200 }
        }
      >
        <Image
          src="/media/hero-48.webp"
          alt="Sculptural silver 48 with a volt-green glass edge"
          fill
          priority
          sizes="(max-width: 767px) 92vw, (max-width: 1100px) 44vw, 620px"
          className="hero-visual__image"
        />
      </motion.div>
    </motion.figure>
  );
}

export function ProofVisual() {
  const reduceMotion = usePrefersReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, visualSpring);
  const smoothY = useSpring(pointerY, visualSpring);
  const imageX = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const imageY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);
  const copyX = useTransform(smoothX, [-0.5, 0.5], [6, -6]);
  const copyY = useTransform(smoothY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-2.2, 2.2]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [1.8, -1.8]);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const position = getPointerPosition(event);
    pointerX.set(position.x);
    pointerY.set(position.y);
  }

  function reset() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <motion.figure
      className="proof-visual"
      style={reduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 1500 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <motion.div
        className="proof-visual__image-wrap"
        style={reduceMotion ? undefined : { x: imageX, y: imageY }}
      >
        <Image
          src="/media/fold-form.webp"
          alt="Precision-cut metal and glass sheets lifting from a flat plane"
          fill
          sizes="(max-width: 767px) 94vw, 1400px"
          className="proof-visual__image"
        />
      </motion.div>
      <motion.figcaption
        className="proof-visual__copy"
        style={reduceMotion ? undefined : { x: copyX, y: copyY }}
      >
        <span>We keep the process tight.</span>
        <strong>Not the design.</strong>
      </motion.figcaption>
    </motion.figure>
  );
}
