import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireB2bCatalogAdmin } from "@/lib/b2b-catalog-admin";
import { logActivity } from "@/lib/activityLog";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireB2bCatalogAdmin();
  if (guard.response) return guard.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const password = typeof body?.password === "string" ? body.password.trim() : "";

  if (!label) return NextResponse.json({ error: "Nama travel agent wajib diisi." }, { status: 422 });
  if (password && password.length < 6) return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 422 });

  const passwordRow = await prisma.b2bCatalogPassword.update({
    where: { id },
    data: {
      label,
      active: body?.active === true,
      ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
    },
  });

  await logActivity({
    userId: guard.session!.user.id!,
    userName: guard.session!.user.name ?? guard.session!.user.email ?? "-",
    userRole: guard.session!.user.role,
    action: "UPDATE",
    resource: "B2B_CATALOG",
    resourceId: passwordRow.id,
    resourceName: passwordRow.label,
    detail: password ? "Update password agen B2B" : "Update akses agen B2B",
  });

  return NextResponse.json({ ...passwordRow, passwordHash: undefined });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireB2bCatalogAdmin();
  if (guard.response) return guard.response;

  const { id } = await params;
  const passwordRow = await prisma.b2bCatalogPassword.delete({ where: { id } });

  await logActivity({
    userId: guard.session!.user.id!,
    userName: guard.session!.user.name ?? guard.session!.user.email ?? "-",
    userRole: guard.session!.user.role,
    action: "DELETE",
    resource: "B2B_CATALOG",
    resourceId: passwordRow.id,
    resourceName: passwordRow.label,
    detail: "Hapus password agen B2B",
  });

  return NextResponse.json({ success: true });
}
