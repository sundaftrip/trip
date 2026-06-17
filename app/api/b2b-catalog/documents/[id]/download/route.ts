import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  B2B_CATALOG_ACCESS_COOKIE,
  B2B_CATALOG_ROUTE,
  sanitizeDownloadFileName,
  verifyCatalogAccessToken,
} from "@/lib/b2b-catalog";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const accessId = verifyCatalogAccessToken(req.cookies.get(B2B_CATALOG_ACCESS_COOKIE)?.value);
  if (!accessId) {
    return NextResponse.redirect(new URL(B2B_CATALOG_ROUTE, req.url), { status: 303 });
  }

  const password = await prisma.b2bCatalogPassword.findFirst({
    where: { id: accessId, active: true },
    select: { id: true },
  });
  if (!password) {
    return NextResponse.redirect(new URL(B2B_CATALOG_ROUTE, req.url), { status: 303 });
  }

  const { id } = await params;
  const document = await prisma.b2bCatalogDocument.findFirst({
    where: { id, active: true },
  });
  if (!document) {
    return NextResponse.json({ error: "PDF tidak ditemukan." }, { status: 404 });
  }

  const upstream = await fetch(document.fileUrl, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "PDF belum bisa diunduh." }, { status: 502 });
  }

  const fileName = sanitizeDownloadFileName(document.fileName || `${document.title}.pdf`);
  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": document.mimeType || upstream.headers.get("content-type") || "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
