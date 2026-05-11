import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activityLog";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;
  const permissions: Record<string, boolean> = await req.json();

  const user = await prisma.user.update({
    where: { id: userId },
    data: { permissions },
    select: { name: true },
  });

  await logActivity({
    userId: session.user.id!,
    userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role,
    action: "UPDATE",
    resource: "PERMISSIONS",
    resourceId: userId,
    resourceName: user.name,
    detail: "Memperbarui izin akses pengguna",
  });

  return NextResponse.json({ success: true });
}
