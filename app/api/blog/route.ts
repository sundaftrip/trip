import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";

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

  const body = await req.json();
  const post = await prisma.blog.create({ data: body });

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role, action: "CREATE", resource: "BLOG",
    resourceId: post.id, resourceName: post.title,
  });

  revalidatePublicContent();
  return NextResponse.json(post, { status: 201 });
}
