import { NextRequest, NextResponse } from "next/server";

const VALID_THEMES = new Set([
  "classic", "vibrant", "bold", "tropical", "kawaii", "pixel",
  "globe", "map", "atlas", "atelier", "jojo", "teri", "attic", "nusantara",
  "corei",
]);

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const isAdmin = pathname.startsWith("/admin");

  // Auth guard hanya untuk /admin (tidak pernah dijalankan untuk halaman publik)
  if (isAdmin) {
    if (pathname === "/admin/ai-ops" || pathname.startsWith("/admin/ai-ops/")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    const isLoginPage = pathname === "/admin/login";
    // Halaman auth publik — boleh diakses tanpa login.
    const isPublicAuthPage = isLoginPage;
    const token =
      req.cookies.get("authjs.session-token")?.value ||
      req.cookies.get("__Secure-authjs.session-token")?.value ||
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value;
    const isAuthenticated = !!token;
    if (!isPublicAuthPage && !isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (isLoginPage && isAuthenticated) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // Preview theme override via ?theme=<key>
  // Set cookie + redirect ke URL tanpa query supaya server-side render pakai cookie.
  const themeParam = searchParams.get("theme");
  if (themeParam && VALID_THEMES.has(themeParam)) {
    const cleanUrl = new URL(req.nextUrl);
    cleanUrl.searchParams.delete("theme");
    const res = NextResponse.redirect(cleanUrl);
    res.cookies.set("preview-theme", themeParam, {
      path: "/", maxAge: 60 * 60 * 24, sameSite: "lax",
    });
    return res;
  }
  // ?theme=clear menghapus override
  if (themeParam === "clear") {
    const cleanUrl = new URL(req.nextUrl);
    cleanUrl.searchParams.delete("theme");
    const res = NextResponse.redirect(cleanUrl);
    res.cookies.delete("preview-theme");
    return res;
  }

  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: reqHeaders } });
}

export const config = {
  matcher: [
    // Match semua kecuali aset Next internal, api, dan file statik
    "/((?!_next/static|_next/image|favicon|api|.*\\..*).*)",
  ],
};
