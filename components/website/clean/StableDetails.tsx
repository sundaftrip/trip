"use client";

import {
  type DetailsHTMLAttributes,
  type MouseEvent,
  useRef,
} from "react";
import {
  getScrollInputCapabilities,
  isDesktopScrollResetViewport,
} from "@/lib/navigation-scroll";

type StableDetailsProps = DetailsHTMLAttributes<HTMLDetailsElement>;

export default function StableDetails({
  children,
  onClick,
  ...props
}: StableDetailsProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryTopRef = useRef<number | null>(null);

  function preserveSummaryPosition() {
    if (typeof window === "undefined") return;
    if (isDesktopScrollResetViewport(window.innerWidth, getScrollInputCapabilities())) return;

    const previousTop = summaryTopRef.current;
    summaryTopRef.current = null;
    if (previousTop === null) return;

    window.requestAnimationFrame(() => {
      const summary = detailsRef.current?.querySelector("summary");
      if (!summary) return;

      const nextTop = summary.getBoundingClientRect().top;
      const delta = nextTop - previousTop;
      if (Math.abs(delta) > 1) {
        const scrollingElement = document.scrollingElement;
        if (!scrollingElement) return;

        // The public shell enables smooth scrolling globally. Temporarily
        // override it so the position correction happens in the same frame
        // and never appears as a second bounce after the details toggle.
        const root = document.documentElement;
        const body = document.body;
        const previousRootBehavior = root.style.scrollBehavior;
        const previousBodyBehavior = body.style.scrollBehavior;

        root.style.scrollBehavior = "auto";
        body.style.scrollBehavior = "auto";
        scrollingElement.scrollTop += delta;
        root.style.scrollBehavior = previousRootBehavior;
        body.style.scrollBehavior = previousBodyBehavior;
      }
    });
  }

  function handleClick(event: MouseEvent<HTMLDetailsElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const target = event.target;
    const summary = target instanceof Element
      ? target.closest("summary")
      : null;
    if (!summary || summary.parentElement !== detailsRef.current) return;

    summaryTopRef.current = summary.getBoundingClientRect().top;
    preserveSummaryPosition();
  }

  return (
    <details ref={detailsRef} onClick={handleClick} {...props}>
      {children}
    </details>
  );
}
