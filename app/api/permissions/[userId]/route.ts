import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activityLog";
import { ALL_PERMISSION_KEYS } from "@/lib/permission-keys";
import { apiError } from "@/lib/api-error";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return NextResponse.json({ error: "Format izin tidak valid." }, { status: 422 });

  // Hanya key izin yang dikenal sistem (lib/permission-keys.ts), nilai dipaksa boolean
  const raw = body as Record<string, unknown>;
  const permissions: Record<string, boolean> = {};
  for (const key of ALL_PERMISSION_KEYS) {
    if (key in raw) permissions[key] = raw[key] === true;
  }

  try {
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
  } catch (err) {
    return apiError(err);
  }
}
