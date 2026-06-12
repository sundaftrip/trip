import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";
import { apiError } from "@/lib/api-error";

export async function GET() {
  const items = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(items, {
    // Data publik (hanya yang published) — boleh di-cache CDN.
    // Admin tidak membaca lewat endpoint ini (list admin pakai Prisma langsung).
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (typeof body.name !== "string" || !body.name.trim() || typeof body.content !== "string" || !body.content.trim())
    return NextResponse.json({ error: "Nama dan isi testimoni wajib diisi." }, { status: 422 });

  try {
    const item = await prisma.testimonial.create({
      data: {
        name: body.name,
        role: (body.role as string) || null,
        content: body.content,
        // rating dijepit 1–5, order tidak boleh negatif
        rating: Math.min(5, Math.max(1, Math.round(Number(body.rating) || 5))),
        avatar: (body.avatar as string) || null,
        category: body.category === "visa" ? "visa" : "trip",
        tourId: (body.tourId as string) || null,
        published: (body.published as boolean) ?? true,
        order: Math.max(0, Number(body.order) || 0),
      },
    });

    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? "-",
      userRole: session.user.role, action: "CREATE", resource: "SETTINGS",
      resourceId: item.id, resourceName: item.name,
      detail: "Tambah testimoni",
    });

    revalidatePublicContent();
    return NextResponse.json(item);
  } catch (err) {
    return apiError(err);
  }
}
