import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";

type Ctx = { params: Promise<{ id: string }> };

// Bulk replace: kirim array hari → wipe & insert ulang.
// Sederhana dan cocok untuk editor yang menampilkan semua hari sekaligus.
export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkPermission(session, "kuotasi_edit")))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const { id } = await params;
  const days: Array<{
    dayIndex: number;
    date?: string | null;
    city?: string | null;
    title?: string | null;
    narrativeHtml?: string;
    highlights?: string[];
    imageUrl?: string | null;
  }> = await req.json();

  await prisma.$transaction([
    // Detach cost items dari days yang akan dihapus (jangan ikut terhapus —
    // cost item bisa global / dipindah ke day baru via UI berikutnya).
    prisma.quotationCostItem.updateMany({
      where: { quotationId: id, dayId: { not: null } },
      data: { dayId: null },
    }),
    prisma.quotationDay.deleteMany({ where: { quotationId: id } }),
    prisma.quotationDay.createMany({
      data: days.map((d) => ({
        quotationId: id,
        dayIndex: d.dayIndex,
        date: d.date ? new Date(d.date) : null,
        city: d.city ?? null,
        title: d.title ?? null,
        narrativeHtml: d.narrativeHtml ?? "",
        highlights: d.highlights ?? [],
        imageUrl: d.imageUrl ?? null,
      })),
    }),
    prisma.quotation.update({
      where: { id },
      data: { durationDays: days.length },
    }),
  ]);

  return NextResponse.json({ ok: true, count: days.length });
}
