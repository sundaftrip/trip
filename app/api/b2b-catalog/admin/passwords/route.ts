import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireB2bCatalogAdmin } from "@/lib/b2b-catalog-admin";
import { logActivity } from "@/lib/activityLog";

export async function POST(req: NextRequest) {
  const guard = await requireB2bCatalogAdmin();
  if (guard.response) return guard.response;

  const body = await req.json().catch(() => null);
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const password = typeof body?.password === "string" ? body.password.trim() : "";

  if (!label) return NextResponse.json({ error: "Nama travel agent wajib diisi." }, { status: 422 });
  if (password.length < 6) return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 422 });

  const passwordRow = await prisma.b2bCatalogPassword.create({
    data: {
      label,
      passwordHash: await bcrypt.hash(password, 12),
      active: body?.active !== false,
    },
  });

  await logActivity({
    userId: guard.session!.user.id!,
    userName: guard.session!.user.name ?? guard.session!.user.email ?? "-",
    userRole: guard.session!.user.role,
    action: "CREATE",
    resource: "B2B_CATALOG",
    resourceId: passwordRow.id,
    resourceName: passwordRow.label,
    detail: "Tambah password agen B2B",
  });

  return NextResponse.json({ ...passwordRow, passwordHash: undefined }, { status: 201 });
}
