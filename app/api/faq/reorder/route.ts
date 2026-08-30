import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePublicContent } from "@/lib/revalidate";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "text_edit")) return NextResponse.json({ error: "Tidak memiliki izin mengelola FAQ" }, { status: 403 });
  let ids: unknown;
  try { ({ ids } = await req.json()); } catch { return NextResponse.json({ error: "Urutan tidak valid" }, { status: 400 }); }
  if (!Array.isArray(ids) || ids.length < 2 || ids.length > 500 || !ids.every((id) => typeof id === "string") || new Set(ids).size !== ids.length) return NextResponse.json({ error: "Urutan tidak valid" }, { status: 400 });
  const orderedIds: string[] = ids;
  try {
    const rows = await prisma.faq.findMany({ where: { id: { in: orderedIds } }, select: { id: true, section: true, group: true } });
    if (rows.length !== orderedIds.length || rows.some((row) => row.section !== rows[0].section || row.group !== rows[0].group)) return NextResponse.json({ error: "FAQ harus berasal dari grup dan seksi yang sama. Muat ulang daftar." }, { status: 400 });
    const count = await prisma.faq.count({ where: { section: rows[0].section, group: rows[0].group } });
    if (count !== rows.length) return NextResponse.json({ error: "Daftar FAQ berubah. Muat ulang sebelum mengatur urutan." }, { status: 409 });
    await prisma.$transaction(orderedIds.map((id, order) => prisma.faq.update({ where: { id }, data: { order } })));
    revalidatePublicContent();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Urutan FAQ belum tersimpan. Coba lagi." }, { status: 500 });
  }
}
