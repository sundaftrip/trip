"use client";

import { useLayoutEffect } from "react";

export default function CleanThemeBoundary({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const interactiveSelector =
      'a[href], button:not(:disabled), summary, [role="button"]:not([aria-disabled="true"])';

    function applyPublicTheme() {
      root.classList.remove("dark");
      root.classList.add("light");
      root.classList.add("public-site-active");
      root.style.colorScheme = "light";
    }

    function animatePress(target: EventTarget | null) {
      const interactive =
        target instanceof Element ? target.closest<HTMLElement>(interactiveSelector) : null;
      const publicShell = document.querySelector(".public-site-shell");

      if (!interactive || !publicShell?.contains(interactive)) return;

      interactive.classList.remove("public-soft-press");
      window.requestAnimationFrame(() => interactive.classList.add("public-soft-press"));
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.button === 0) animatePress(event.target);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter" || event.key === " ") animatePress(event.target);
    }

    function handleAnimationEnd(event: AnimationEvent) {
      if (event.animationName === "public-soft-press") {
        (event.target as HTMLElement).classList.remove("public-soft-press");
      }
    }

    applyPublicTheme();
    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("animationend", handleAnimationEnd);

    const observer = new MutationObserver(() => {
      if (
        root.classList.contains("dark") ||
        !root.classList.contains("light") ||
        !root.classList.contains("public-site-active")
      ) {
        applyPublicTheme();
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("animationend", handleAnimationEnd);
      root.classList.remove("public-site-active");
      root.style.removeProperty("color-scheme");
    };
  }, []);

  return <div className="public-site-shell">{children}</div>;
}
