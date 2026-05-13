import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET — ?all=true returns all items (admin), otherwise only active (public)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true";

    const faqs = await prisma.faq.findMany({
      where: showAll ? undefined : { active: true },
      orderBy: [{ section: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(faqs);
  } catch {
    return NextResponse.json({ error: "Gagal memuat FAQ" }, { status: 500 });
  }
}

// POST — admin only, create new FAQ item
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { section, question, answer, order, active } = body;

    if (!section || !question || !answer) {
      return NextResponse.json({ error: "section, question, answer wajib diisi" }, { status: 400 });
    }

    const faq = await prisma.faq.create({
      data: { section, question, answer, order: order ?? 0, active: active ?? true },
    });
    return NextResponse.json(faq, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat FAQ" }, { status: 500 });
  }
}
