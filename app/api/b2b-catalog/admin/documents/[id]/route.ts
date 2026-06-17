import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireB2bCatalogAdmin } from "@/lib/b2b-catalog-admin";
import { logActivity } from "@/lib/activityLog";
import { revalidatePath } from "next/cache";

function toInt(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireB2bCatalogAdmin();
  if (guard.response) return guard.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Judul PDF wajib diisi." }, { status: 422 });

  const document = await prisma.b2bCatalogDocument.update({
    where: { id },
    data: {
      title,
      sortOrder: toInt(body?.sortOrder),
      active: body?.active === true,
    },
  });

  await logActivity({
    userId: guard.session!.user.id!,
    userName: guard.session!.user.name ?? guard.session!.user.email ?? "-",
    userRole: guard.session!.user.role,
    action: "UPDATE",
    resource: "B2B_CATALOG",
    resourceId: document.id,
    resourceName: document.title,
    detail: "Update PDF B2B Russia",
  });

  revalidatePath("/b2b-russia-catalog");
  return NextResponse.json(document);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireB2bCatalogAdmin();
  if (guard.response) return guard.response;

  const { id } = await params;
  const document = await prisma.b2bCatalogDocument.delete({ where: { id } });

  await logActivity({
    userId: guard.session!.user.id!,
    userName: guard.session!.user.name ?? guard.session!.user.email ?? "-",
    userRole: guard.session!.user.role,
    action: "DELETE",
    resource: "B2B_CATALOG",
    resourceId: document.id,
    resourceName: document.title,
    detail: "Hapus PDF B2B Russia",
  });

  revalidatePath("/b2b-russia-catalog");
  return NextResponse.json({ success: true });
}
