import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePublicContent } from "@/lib/revalidate";

// GET — ?all=true returns all items (admin), otherwise only active (public)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true";
    const group = searchParams.get("group") || undefined;

    const faqs = await prisma.faq.findMany({
      where: { ...(group ? { group } : {}), ...(showAll ? {} : { active: true }) },
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
    const { group, section, question, answer, service, order, active } = body;

    if (!section || !question || !answer) {
      return NextResponse.json({ error: "section, question, answer wajib diisi" }, { status: 400 });
    }

    const faq = await prisma.faq.create({
      data: {
        group: group === "visa" ? "visa" : "umum",
        section, question, answer,
        service: typeof service === "string" && service.trim() ? service : null,
        order: order ?? 0, active: active ?? true,
      },
    });
    revalidatePublicContent(); // /faq & /visa/faq kini ISR — segarkan langsung
    return NextResponse.json(faq, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat FAQ" }, { status: 500 });
  }
}
