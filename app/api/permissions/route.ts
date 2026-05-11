import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activityLog";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rows = await prisma.rolePermission.findMany();
  const result: Record<string, Record<string, boolean>> = {};
  rows.forEach((r) => { result[r.role] = r.permissions as Record<string, boolean>; });
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body: Record<string, Record<string, boolean>> = await req.json();

  await Promise.all(
    Object.entries(body).map(([role, permissions]) =>
      prisma.rolePermission.upsert({
        where: { role },
        update: { permissions },
        create: { role, permissions },
      })
    )
  );

  await logActivity({
    userId: session.user.id!,
    userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role,
    action: "UPDATE",
    resource: "PERMISSIONS",
    detail: "Memperbarui izin akses role",
  });

  return NextResponse.json({ success: true });
}
