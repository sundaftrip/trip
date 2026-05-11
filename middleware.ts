import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Set x-pathname header for layout detection
  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);

  // Protect admin routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isPrintPage = pathname.endsWith("/print");

  if (isAdminRoute && !isLoginPage && !isPrintPage) {
    if (!req.auth) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
});

export const config = {
  matcher: ["/admin/:path*"],
};
