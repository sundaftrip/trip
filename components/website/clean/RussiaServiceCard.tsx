"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type RussiaServiceMotion = "catering" | "flight" | "train" | "hotel" | "bus" | "luggage" | "compass";

export default function RussiaServiceCard({
  motion,
  children,
}: {
  motion: RussiaServiceMotion;
  children: ReactNode;
}) {
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  function play() {
    if (timer.current !== null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setPlaying(true);
    // Let every icon and steam trail finish before allowing another interaction.
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setPlaying(false);
    }, 1000);
  }

  return (
    <article
      data-motion={motion}
      data-motion-active={playing ? "true" : undefined}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") play();
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") play();
      }}
      onFocusCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) play();
      }}
    >
      {children}
    </article>
  );
}
