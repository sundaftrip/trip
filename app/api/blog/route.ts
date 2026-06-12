import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";
import { pickInput, BLOG_INPUT_FIELDS } from "@/lib/api-input";
import { apiError } from "@/lib/api-error";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const published = searchParams.get("published");

  const where: Record<string, unknown> = {};
  if (published === "true") where.published = true;

  const posts = await prisma.blog.findMany({ where, orderBy: { date: "desc" } });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "blog_create"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk membuat post" }, { status: 403 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Whitelist field — hanya kolom Blog yang sah yang diteruskan ke Prisma
  const data = pickInput(body, BLOG_INPUT_FIELDS);

  if (typeof data.title !== "string" || !data.title.trim())
    return NextResponse.json({ error: "Judul post wajib diisi." }, { status: 422 });
  if (typeof data.slug !== "string" || !data.slug.trim())
    return NextResponse.json({ error: "Slug post wajib diisi." }, { status: 422 });

  try {
    const post = await prisma.blog.create({ data: data as unknown as Prisma.BlogUncheckedCreateInput });

    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "CREATE", resource: "BLOG",
      resourceId: post.id, resourceName: post.title,
    });

    revalidatePublicContent();
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    return apiError(err, { duplicate: "Slug post sudah dipakai." });
  }
}
