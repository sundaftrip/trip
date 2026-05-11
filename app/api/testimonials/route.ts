import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activityLog";

export async function GET() {
  const items = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const item = await prisma.testimonial.create({
    data: {
      name: body.name,
      role: body.role || null,
      content: body.content,
      rating: Number(body.rating) || 5,
      avatar: body.avatar || null,
      published: body.published ?? true,
      order: Number(body.order) || 0,
    },
  });

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? "-",
    userRole: session.user.role, action: "CREATE", resource: "SETTINGS",
    resourceId: item.id, resourceName: item.name,
    detail: "Tambah testimoni",
  });

  return NextResponse.json(item);
}
