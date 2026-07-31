export function normalizeNavigationPath(pathname: string) {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "") || "/";
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

  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  window.requestAnimationFrame(() => {
    root.style.scrollBehavior = previousScrollBehavior;
  });
}
