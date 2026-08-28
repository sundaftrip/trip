"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import {
  normalizeNavigationPath,
  resetDocumentScroll,
  resetDocumentScrollAfterNavigation,
  shouldResetScrollForNavigation,
} from "@/lib/navigation-scroll";

const RESET_AFTER_NAVIGATION_ATTRIBUTE = "data-scroll-reset-after-navigation";

function closestAnchor(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLAnchorElement>("a[href]");
}

export default function RouteScrollReset() {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const resetOnNextPathRef = useRef<string | null>(null);

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

      if (anchor.hasAttribute(RESET_AFTER_NAVIGATION_ATTRIBUTE)) {
        const nextPathname = normalizeNavigationPath(
          new URL(href, window.location.href).pathname,
        );

        // Wait until bubbling finishes so a cancelled click cannot arm a later reset.
        window.queueMicrotask(() => {
          if (!event.defaultPrevented) resetOnNextPathRef.current = nextPathname;
        });
        return;
      }

      // Preserve the established behavior for all other public links.
      resetDocumentScroll();
    }

    document.addEventListener("click", handleNavigationClick, { capture: true });
    return () => document.removeEventListener("click", handleNavigationClick, { capture: true });
  }, []);

  useLayoutEffect(() => {
    if (previousPathnameRef.current === pathname) return;

    const resetPathname = resetOnNextPathRef.current;
    previousPathnameRef.current = pathname;
    resetOnNextPathRef.current = null;

    if (resetPathname === normalizeNavigationPath(pathname)) {
      resetDocumentScrollAfterNavigation();
    }
  }, [pathname]);

  return null;
}
