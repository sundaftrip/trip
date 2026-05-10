import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  const token =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  const isAuthenticated = !!token;

  if (!isLoginPage && !isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: reqHeaders } });
}

export const config = {
  matcher: ["/admin/:path*"],
};
