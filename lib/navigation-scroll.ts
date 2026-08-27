export function normalizeNavigationPath(pathname: string) {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "") || "/";
}

export const DESKTOP_SCROLL_RESET_MIN_WIDTH = 1024;

type ScrollInputCapabilities = {
  coarsePointer?: boolean;
  finePointer?: boolean;
  hover?: boolean;
  maxTouchPoints?: number;
};

export function isDesktopScrollResetViewport(
  viewportWidth: number,
  {
    coarsePointer = false,
    finePointer = true,
    hover = true,
    maxTouchPoints = 0,
  }: ScrollInputCapabilities = {},
) {
  return Number.isFinite(viewportWidth)
    && viewportWidth >= DESKTOP_SCROLL_RESET_MIN_WIDTH
    && !coarsePointer
    && finePointer
    && hover
    && maxTouchPoints <= 0;
}

export function getScrollInputCapabilities() {
  if (typeof window === "undefined") return {};

  return {
    coarsePointer: window.matchMedia?.("(pointer: coarse)").matches ?? false,
    finePointer: window.matchMedia?.("(pointer: fine)").matches ?? false,
    hover: window.matchMedia?.("(hover: hover)").matches ?? false,
    maxTouchPoints: typeof navigator === "undefined" ? 0 : navigator.maxTouchPoints,
  };
}

export function shouldResetScrollForNavigation(currentHref: string, nextHref: string) {
  try {
    const currentUrl = new URL(currentHref);
    const nextUrl = new URL(nextHref, currentUrl);

    if (!/^https?:$/.test(nextUrl.protocol) || nextUrl.origin !== currentUrl.origin) {
      return false;
    }

    return normalizeNavigationPath(nextUrl.pathname)
      !== normalizeNavigationPath(currentUrl.pathname);
  } catch {
    return false;
  }
}

export function resetDocumentScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!isDesktopScrollResetViewport(window.innerWidth, getScrollInputCapabilities())) return;

  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  window.requestAnimationFrame(() => {
    root.style.scrollBehavior = previousScrollBehavior;
  });
}
