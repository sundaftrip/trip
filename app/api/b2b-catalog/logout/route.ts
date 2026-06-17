import { NextRequest, NextResponse } from "next/server";
import { B2B_CATALOG_ACCESS_COOKIE, B2B_CATALOG_ROUTE } from "@/lib/b2b-catalog";

export async function POST(req: NextRequest) {
  const response = NextResponse.redirect(new URL(B2B_CATALOG_ROUTE, req.url), { status: 303 });
  response.cookies.set(B2B_CATALOG_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
