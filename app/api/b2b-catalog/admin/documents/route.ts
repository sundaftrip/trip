import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireB2bCatalogAdmin } from "@/lib/b2b-catalog-admin";
import { logActivity } from "@/lib/activityLog";
import { revalidatePath } from "next/cache";

const MAX_B2B_PDF_BYTES = 25 * 1024 * 1024;

function toInt(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

export async function POST(req: NextRequest) {
  const guard = await requireB2bCatalogAdmin();
  if (guard.response) return guard.response;

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const fileUrl = typeof body?.fileUrl === "string" ? body.fileUrl.trim() : "";
  const fileName = typeof body?.fileName === "string" ? body.fileName.trim() : "";
  const mimeType = typeof body?.mimeType === "string" ? body.mimeType.trim() : "application/pdf";
  const fileSize = toInt(body?.fileSize);

  if (!title) return NextResponse.json({ error: "Judul PDF wajib diisi." }, { status: 422 });
  if (mimeType !== "application/pdf" || !fileName.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "File katalog harus PDF." }, { status: 422 });
  }
  if (fileSize <= 0 || fileSize > MAX_B2B_PDF_BYTES) {
    return NextResponse.json({ error: "Ukuran PDF harus 1 byte sampai 25 MB." }, { status: 422 });
  }
  if (!fileUrl.startsWith("https://res.cloudinary.com/")) {
    return NextResponse.json({ error: "File PDF belum berhasil diupload." }, { status: 422 });
  }

  const document = await prisma.b2bCatalogDocument.create({
    data: {
      title,
      fileUrl,
      fileName: fileName || `${title}.pdf`,
      mimeType: mimeType || "application/pdf",
      fileSize,
      sortOrder: toInt(body?.sortOrder),
      active: body?.active !== false,
    },
  });

  await logActivity({
    userId: guard.session!.user.id!,
    userName: guard.session!.user.name ?? guard.session!.user.email ?? "-",
    userRole: guard.session!.user.role,
    action: "CREATE",
    resource: "B2B_CATALOG",
    resourceId: document.id,
    resourceName: document.title,
    detail: "Tambah PDF B2B Russia",
  });

  revalidatePath("/b2b-russia-catalog");
  return NextResponse.json(document, { status: 201 });
}
