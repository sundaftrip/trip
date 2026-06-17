"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface AnimatedStatValueProps {
  value: string;
}

function parseStatValue(value: string) {
  const match = value.match(/^(\D*?)(\d[\d.,]*)(.*)$/);
  if (!match) return null;

  const [, prefix, rawNumber, suffix] = match;
  const target = Number(rawNumber.replace(/[^\d]/g, ""));
  if (!Number.isFinite(target)) return null;

  return {
    prefix,
    rawNumber,
    suffix,
    target,
    shouldGroup: rawNumber.includes(",") || rawNumber.includes("."),
  };
}

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

export default function AnimatedStatValue({ value }: AnimatedStatValueProps) {
  const parsed = useMemo(() => parseStatValue(value), [value]);
  const ref = useRef<HTMLSpanElement | null>(null);
  const [current, setCurrent] = useState(() => (parsed ? 0 : null));

  useEffect(() => {
    if (!parsed) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      const frameId = requestAnimationFrame(() => setCurrent(parsed.target));
      return () => cancelAnimationFrame(frameId);
    }

    let frame = 0;
    let observer: IntersectionObserver | null = null;

    const run = () => {
      const duration = 850;
      const startedAt = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        setCurrent(Math.round(parsed.target * easeOutCubic(progress)));

        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        }
      };

      frame = requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      run();
      return () => cancelAnimationFrame(frame);
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer?.disconnect();
        run();
      },
      { rootMargin: "0px 0px 180px 0px", threshold: 0 },
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [parsed]);

  if (!parsed) return <>{value}</>;

  const number = parsed.shouldGroup
    ? (current ?? 0).toLocaleString("en-US")
    : String(current ?? 0);

  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden="true">
        {parsed.prefix}
        {number}
        {parsed.suffix}
      </span>
    </span>
  );
}
