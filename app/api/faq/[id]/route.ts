import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { revalidatePublicContent } from "@/lib/revalidate";

// PUT — update a FAQ item
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "text_edit")) {
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { group, section, question, answer, service, order, active } = body;

    const faq = await prisma.faq.update({
      where: { id },
      data: {
        ...(group     !== undefined && { group: group === "visa" ? "visa" : "umum" }),
        ...(section   !== undefined && { section }),
        ...(question  !== undefined && { question }),
        ...(answer    !== undefined && { answer }),
        ...(service   !== undefined && { service: typeof service === "string" && service.trim() ? service : null }),
        ...(order     !== undefined && { order }),
        ...(active    !== undefined && { active }),
      },
    });
    revalidatePublicContent(); // /faq & /visa/faq kini ISR — segarkan langsung
    return NextResponse.json(faq);
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate FAQ" }, { status: 500 });
  }
}

// DELETE — delete a FAQ item
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "text_edit")) {
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.faq.delete({ where: { id } });
    revalidatePublicContent();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus FAQ" }, { status: 500 });
  }
}
