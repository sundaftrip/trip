"use client";

import { useEffect } from "react";

/**
 * Calm motion helpers for the homepage.
 *
 * - Scroll reveal: elements marked `data-reveal` (or the children of
 *   `data-reveal="group"`) glide in once they reach the viewport. Content is visible
 *   by default: nothing is hidden without JavaScript, for visitors who prefer reduced
 *   motion, or for anything that is already on screen when the page loads.
 * - The hero (`data-motion-scene`) pauses its slow photo drift while it is off screen.
 */
export default function HomeReveal({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scene = root.querySelector<HTMLElement>("[data-motion-scene]");
    const sceneObserver = new IntersectionObserver(([entry]) => {
      if (scene && entry) scene.dataset.motionPaused = entry.isIntersecting ? "false" : "true";
    });
    if (scene) sceneObserver.observe(scene);

    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const viewportHeight = window.innerHeight;
    for (const item of items) {
      const box = item.getBoundingClientRect();
      if (box.top < viewportHeight && box.bottom > 0) item.dataset.revealed = "instant";
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "true";
          revealObserver.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );

    root.dataset.revealReady = "true";
    for (const item of items) {
      if (!item.dataset.revealed) revealObserver.observe(item);
    }

    return () => {
      sceneObserver.disconnect();
      revealObserver.disconnect();
      delete root.dataset.revealReady;
    };
  }, [rootId]);

  return null;
}
