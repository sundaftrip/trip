import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { shouldBlockViewerMutation } from "@/lib/viewer-access";

// CMS modules that were removed. Old bookmarks land on the dashboard instead of a 404.
const REMOVED_ADMIN_MODULES = ["ai-ops", "partners", "leads", "commissions", "disputes", "visa-discussions"];

function isRemovedAdminModule(pathname: string) {
  return REMOVED_ADMIN_MODULES.some((name) => pathname === `/admin/${name}` || pathname.startsWith(`/admin/${name}/`));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin || pathname.startsWith("/api")) {
    const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
    const token = authSecret ? await getToken({ req, secret: authSecret }) : null;
    if (shouldBlockViewerMutation(req.method, pathname, token?.role)) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Akun viewer hanya boleh melihat data CMS." }, { status: 403 });
      }
      return new NextResponse("Akun viewer hanya boleh melihat data CMS.", { status: 403 });
    }
  }

  // Auth guard hanya untuk /admin (tidak pernah dijalankan untuk halaman publik)
  if (isAdmin) {
    if (isRemovedAdminModule(pathname)) {
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
  }

  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: reqHeaders } });
}

export const config = {
  matcher: [
    "/api/:path*",
    // Match semua kecuali aset Next internal dan file statik.
    "/((?!_next/static|_next/image|favicon|.*\\..*).*)",
  ],
};
