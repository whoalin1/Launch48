"use client";

import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const offerFacts = [
  {
    eyebrow: "Delivery",
    value: "48",
    label: "hours",
    detail: "Delivery begins when your complete brief lands.",
    range: [0, 0.045, 0.265, 0.3],
  },
  {
    eyebrow: "Price",
    value: "$149",
    label: "one price",
    detail: "A focused project price with no agency drag.",
    range: [0.3, 0.345, 0.595, 0.635],
  },
  {
    eyebrow: "Refinement",
    value: "3",
    label: "revisions",
    detail: "Three chances to sharpen the details before launch.",
    range: [0.635, 0.69, 0.998, 1],
  },
] as const;

const filmFps = 24;

type OfferFact = (typeof offerFacts)[number];

function OfferScene({
  fact,
  progress,
  first = false,
  last = false,
}: {
  fact: OfferFact;
  progress: MotionValue<number>;
  first?: boolean;
  last?: boolean;
}) {
  const [start, enter, hold, end] = fact.range;
  const opacity = useTransform(
    progress,
    first
      ? [0, hold, end, 1]
      : last
        ? [0, start, enter, 1]
        : [0, start, enter, hold, end, 1],
    first
      ? [1, 1, 0, 0]
      : last
        ? [0, 0, 1, 1]
        : [0, 0, 1, 1, 0, 0]
  );
  const y = useTransform(
    progress,
    first
      ? [0, hold, end, 1]
      : last
        ? [0, start, enter, 1]
        : [0, start, enter, hold, end, 1],
    first
      ? [0, -2, -18, -18]
      : last
        ? [18, 18, 0, 0]
        : [18, 18, 0, -2, -18, -18]
  );
  const ruleScale = useTransform(
    progress,
    first
      ? [0, hold, end, 1]
      : last
        ? [0, start, enter, 1]
        : [0, start, enter, hold, end, 1],
    first
      ? [1, 1, 0, 0]
      : last
        ? [0, 0, 1, 1]
        : [0, 0, 1, 1, 0, 0]
  );
  const labelY = useTransform(
    progress,
    first
      ? [0, hold, end, 1]
      : last
        ? [0, start, enter, 1]
        : [0, start, enter, hold, end, 1],
    first
      ? [0, -4, -28, -28]
      : last
        ? [28, 28, 0, 0]
        : [28, 28, 0, -4, -28, -28]
  );

  return (
    <motion.article
      className="offer-scene"
      style={{ opacity, y }}
    >
      <motion.span className="offer-scene__eyebrow" style={{ y: labelY }}>
        {fact.eyebrow}
      </motion.span>
      <div className="offer-scene__metric">
        <strong>{fact.value}</strong>
        <span>{fact.label}</span>
      </div>
      <div className="offer-scene__detail">
        <motion.span
          aria-hidden="true"
          className="offer-scene__rule"
          style={{ scaleX: ruleScale }}
        />
        <p>{fact.detail}</p>
      </div>
    </motion.article>
  );
}

export function OfferSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [videoState, setVideoState] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const timelineProgress = scrollYProgress;
  const filmScale = useTransform(
    timelineProgress,
    [0, 0.26, 0.34, 0.6, 0.68, 1],
    [0.985, 1.015, 0.99, 1.012, 0.985, 1]
  );
  const filmY = useTransform(
    timelineProgress,
    [0, 0.26, 0.34, 0.6, 0.68, 1],
    ["1.5%", "0%", "-1.5%", "0%", "1.5%", "-1%"]
  );
  const filmRotate = useTransform(
    timelineProgress,
    [0, 0.24, 0.5, 0.76, 1],
    [-1.2, -0.3, 0.45, -0.25, 0]
  );
  const filmClip = useTransform(
    timelineProgress,
    [0, 0.12, 0.5, 0.88, 1],
    [
      "inset(1.5% 1.5% 1.5% 1.5% round 2rem)",
      "inset(0% 0% 0% 0% round 2rem)",
      "inset(0% 0% 0% 0% round 2rem)",
      "inset(0% 0% 0% 0% round 2rem)",
      "inset(1.5% 1.5% 1.5% 1.5% round 2rem)",
    ]
  );

  const pendingTimeRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleNavbarNav(e: Event) {
      const customEvent = e as CustomEvent<{ targetId: string; position: "top" | "bottom" }>;
      const video = videoRef.current;
      if (!video) return;

      isNavigatingRef.current = true;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      const duration = Number.isFinite(video.duration) ? video.duration : 10;

      // When moving via navbar:
      // If navigating below the video (Process / FAQ): video snaps to the end.
      // If navigating above/to the video (Hero / Offer): video snaps to the start.
      if (customEvent.detail?.position === "bottom") {
        video.pause();
        video.currentTime = Math.max(0, duration - 0.04);
      } else {
        video.pause();
        video.currentTime = 0;
      }

      navigationTimeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1200);
    }

    function handleUserScroll() {
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }
      }
    }

    window.addEventListener("navbar-navigating", handleNavbarNav);
    window.addEventListener("wheel", handleUserScroll, { passive: true });
    window.addEventListener("touchmove", handleUserScroll, { passive: true });
    window.addEventListener("keydown", handleUserScroll, { passive: true });

    return () => {
      window.removeEventListener("navbar-navigating", handleNavbarNav);
      window.removeEventListener("wheel", handleUserScroll);
      window.removeEventListener("touchmove", handleUserScroll);
      window.removeEventListener("keydown", handleUserScroll);
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const driveVideoFromScroll = useCallback(
    (progress: number) => {
      if (isNavigatingRef.current) {
        return;
      }

      const clamped = Math.min(1, Math.max(0, progress));
      const video = videoRef.current;
      if (
        !video ||
        reduceMotion ||
        video.readyState < HTMLMediaElement.HAVE_METADATA
      ) {
        return;
      }

      const duration = Number.isFinite(video.duration) ? video.duration : 10;
      const targetTime = Math.min(
        Math.max(0, duration - 0.04),
        clamped * duration
      );
      const frameTime = Math.round(targetTime * filmFps) / filmFps;

      video.pause();

      if (Math.abs(video.currentTime - frameTime) < 1 / (filmFps * 2)) {
        return;
      }

      // If video is busy seeking, queue the latest target to prevent decode thrashing
      if (video.seeking) {
        pendingTimeRef.current = frameTime;
        return;
      }

      video.currentTime = frameTime;
    },
    [reduceMotion]
  );

  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (pendingTimeRef.current !== null) {
      const nextTime = pendingTimeRef.current;
      pendingTimeRef.current = null;
      video.currentTime = nextTime;
    }
  }, []);

  useMotionValueEvent(timelineProgress, "change", (latest) => {
    driveVideoFromScroll(latest);
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;

    function markVideoReady() {
      if (!video) return;
      setVideoState("ready");
      video.pause();
      driveVideoFromScroll(timelineProgress.get());
    }

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      markVideoReady();
    } else {
      video.addEventListener("loadedmetadata", markVideoReady, { once: true });
      video.load();
    }

    return () => {
      video.removeEventListener("loadedmetadata", markVideoReady);
    };
  }, [driveVideoFromScroll, reduceMotion, timelineProgress]);

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    setVideoState("ready");
    video.pause();
    driveVideoFromScroll(timelineProgress.get());
  }

  function handleCanPlay() {
    setVideoState("ready");
  }

  function handleVideoError() {
    setVideoState("error");
  }

  return (
    <section
      ref={sectionRef}
      id="offer"
      className="offer-scroll"
      aria-labelledby="offer-heading"
    >
      <h2 id="offer-heading" className="sr-only">
        The Launch48 offer
      </h2>

      <ul className="sr-only">
        {offerFacts.map((fact) => (
          <li key={fact.value}>
            {fact.value} {fact.label}. {fact.detail}
          </li>
        ))}
      </ul>

      <div ref={trackRef} className="offer-track">
        <div className="offer-sticky">
          <div className="page-container offer-cinema" aria-hidden="true">
            <motion.div
              className="offer-cinema__media-shell"
              style={{ y: filmY }}
            >
              <motion.div
                className="offer-cinema__media"
                data-video-state={videoState}
                style={{ scale: filmScale, rotate: filmRotate, clipPath: filmClip }}
              >
                <video
                  ref={videoRef}
                  className="offer-cinema__video"
                  poster="/media/offer-film-poster.webp"
                  preload="auto"
                  muted
                  playsInline
                  tabIndex={-1}
                  onLoadedMetadata={handleLoadedMetadata}
                  onCanPlay={handleCanPlay}
                  onSeeked={handleSeeked}
                  onError={handleVideoError}
                >
                  <source src="/media/offer-film-scroll-intra.mp4" type="video/mp4" />
                  <source src="/media/offer-film-scroll.mp4" type="video/mp4" />
                  <source src="/media/offer-film.mp4" type="video/mp4" />
                  <source src="/media/offer-scrub.mp4" type="video/mp4" />
                </video>
                <div className="offer-cinema__frame" />
              </motion.div>
            </motion.div>

            <div className="offer-cinema__scenes">
              {offerFacts.map((fact, index) => (
                <OfferScene
                  key={fact.value}
                  fact={fact}
                  progress={timelineProgress}
                  first={index === 0}
                  last={index === offerFacts.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="page-container offer-static">
        <figure className="offer-static__poster">
          <Image
            src="/media/offer-film-poster.webp"
            alt="Translucent website layers unfolding into one finished website"
            fill
            sizes="(max-width: 767px) calc(100vw - 2rem), 760px"
          />
        </figure>
        <div className="offer-static__content">
          <div className="offer-static__heading">
            <h2>Simple terms. Zero agency drag.</h2>
            <p>Three focused commitments that protect the 48-hour delivery promise.</p>
          </div>
          <div className="offer-static__facts">
            {offerFacts.map((fact) => (
              <article key={fact.value} className="offer-static__fact">
                <span>{fact.eyebrow}</span>
                <div className="offer-static__metric">
                  <strong>{fact.value}</strong>
                  <h3>{fact.label}</h3>
                </div>
                <p>{fact.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container offer-summary">
        <p>
          <span>48 hours.</span>
          <span>$149.</span>
          <span>3 revisions.</span>
        </p>
      </div>
    </section>
  );
}
