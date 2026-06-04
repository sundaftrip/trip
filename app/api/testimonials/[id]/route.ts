import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const item = await prisma.testimonial.update({
    where: { id },
    data: {
      name: body.name,
      role: body.role || null,
      content: body.content,
      rating: Number(body.rating) || 5,
      avatar: body.avatar || null,
      category: body.category === "visa" ? "visa" : "trip",
      tourId: body.tourId || null,
      published: body.published ?? true,
      order: Number(body.order) || 0,
    },
  });

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? "-",
    userRole: session.user.role, action: "UPDATE", resource: "SETTINGS",
    resourceId: item.id, resourceName: item.name, detail: "Edit testimoni",
  });

  revalidatePublicContent();
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await prisma.testimonial.delete({ where: { id } });

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? "-",
    userRole: session.user.role, action: "DELETE", resource: "SETTINGS",
    resourceId: id, resourceName: item.name, detail: "Hapus testimoni",
  });

  revalidatePublicContent();
  return NextResponse.json({ success: true });
}
