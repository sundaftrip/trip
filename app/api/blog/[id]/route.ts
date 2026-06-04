import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blog.findFirst({ where: { OR: [{ id }, { slug: id }] } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const isPublishOnly = "published" in body && Object.keys(body).length === 1;
  const permKey = isPublishOnly ? "blog_publish" : "blog_edit";
  if (!await checkPermission(session, permKey))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const post = await prisma.blog.update({ where: { id }, data: body });

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role, action: "UPDATE", resource: "BLOG",
    resourceId: post.id, resourceName: post.title,
    detail: isPublishOnly ? (body.published ? "Dipublish" : "Di-unpublish") : undefined,
  });

  revalidatePublicContent();
  return NextResponse.json(post);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "blog_delete"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk menghapus post" }, { status: 403 });

  const { id } = await params;
  const post = await prisma.blog.findUnique({ where: { id }, select: { title: true } });
  await prisma.blog.delete({ where: { id } });

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role, action: "DELETE", resource: "BLOG",
    resourceId: id, resourceName: post?.title,
  });

  revalidatePublicContent();
  return NextResponse.json({ success: true });
}
