import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";
import { apiError } from "@/lib/api-error";
import { BLOG_PINS_KEY, MAX_PINNED_POSTS } from "@/lib/blog-pins";
import { getPinnedBlogIds } from "@/lib/blog-pins-server";

export async function GET() {
  return NextResponse.json({ ids: await getPinnedBlogIds(), max: MAX_PINNED_POSTS });
}

/** Simpan daftar artikel tersemat: { ids: string[] } (urutan = urutan tampil, maks 3). */
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "blog_edit"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk menyematkan artikel" }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const raw = (body as { ids?: unknown })?.ids;
  if (!Array.isArray(raw) || raw.some((id) => typeof id !== "string"))
    return NextResponse.json({ error: "Format daftar sematan tidak valid." }, { status: 422 });
  const ids = Array.from(new Set((raw as string[]).map((id) => id.trim()).filter(Boolean)));
  if (ids.length > MAX_PINNED_POSTS)
    return NextResponse.json({ error: `Maksimal ${MAX_PINNED_POSTS} artikel bisa disematkan.` }, { status: 422 });

  try {
    // Hanya artikel yang ada dan sudah dipublish yang boleh disematkan.
    const found = await prisma.blog.findMany({
      where: { id: { in: ids }, published: true },
      select: { id: true, title: true },
    });
    const valid = ids.filter((id) => found.some((post) => post.id === id));
    if (valid.length !== ids.length)
      return NextResponse.json({ error: "Hanya artikel yang sudah dipublish yang bisa disematkan." }, { status: 422 });

    const value = JSON.stringify(valid);
    await prisma.companyInfo.upsert({ where: { key: BLOG_PINS_KEY }, update: { value }, create: { key: BLOG_PINS_KEY, value } });

    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "UPDATE", resource: "BLOG",
      resourceName: "Artikel tersemat",
      detail: valid.length ? `Disematkan: ${valid.map((id) => found.find((p) => p.id === id)?.title).join(" | ")}` : "Semua sematan dilepas",
    });
    await revalidatePublicContent();
    return NextResponse.json({ ids: valid });
  } catch (err) {
    return apiError(err);
  }
}
