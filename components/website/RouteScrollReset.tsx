"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  normalizeNavigationPath,
  resetDocumentScrollAfterNavigation,
  shouldResetScrollOnPathChange,
} from "@/lib/navigation-scroll";

export default function RouteScrollReset() {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const historyPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    function handlePopState() {
      // Browser Back/Forward owns restoration, including same-page history.
      const nextPath = normalizeNavigationPath(window.location.pathname);
      historyPathnameRef.current = nextPath === normalizeNavigationPath(previousPathnameRef.current)
        ? null
        : nextPath;
    }

    window.addEventListener("popstate", handlePopState, { capture: true });
    return () => window.removeEventListener("popstate", handlePopState, { capture: true });
  }, []);

  useLayoutEffect(() => {
    if (previousPathnameRef.current === pathname) return;

    const previousPathname = previousPathnameRef.current;
    const historyPathname = historyPathnameRef.current;
    previousPathnameRef.current = pathname;
    historyPathnameRef.current = null;

    // Run only after the destination commits. This also covers search and card
    // navigation through router.push, without scrolling the outgoing page.
    if (shouldResetScrollOnPathChange(previousPathname, pathname, {
      hash: window.location.hash,
      historyPathname,
    })) {
      resetDocumentScrollAfterNavigation();
      document.getElementById("website-main")?.focus({ preventScroll: true });
    }
  }, [pathname]);

  return null;
}
