"use client";

import { useEffect } from "react";
import {
  resetDocumentScroll,
  shouldResetScrollForNavigation,
} from "@/lib/navigation-scroll";

function closestAnchor(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLAnchorElement>("a[href]");
}

export default function RouteScrollReset() {
  useEffect(() => {
    function handleNavigationClick(event: MouseEvent) {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
      ) {
        return;
      }

      const anchor = closestAnchor(event.target);
      if (
        !anchor
        || anchor.hasAttribute("download")
        || (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || !shouldResetScrollForNavigation(window.location.href, href)) return;

      // Next.js keeps the old page visible while the next route is prepared.
      // Move that old page to its header immediately so its footer cannot flash.
      resetDocumentScroll();
    }

    document.addEventListener("click", handleNavigationClick, { capture: true });
    return () => document.removeEventListener("click", handleNavigationClick, { capture: true });
  }, []);

  return null;
}
