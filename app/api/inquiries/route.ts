import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const str = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

// POST publik — pengunjung submit form konsultasi (tanpa login).
export async function POST(req: NextRequest) {
  // Rate limit per IP: 5 request/menit (anti spam form publik)
  if (!rateLimit(`inquiry:${clientIp(req)}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Honeypot anti-bot: field "website" harus kosong (disembunyikan di form).
  if (str(body.website)) return NextResponse.json({ ok: true });

  const name = str(body.name, 120);
  const whatsapp = str(body.whatsapp, 40);
  if (!name || !whatsapp) {
    return NextResponse.json({ error: "Nama dan WhatsApp wajib diisi." }, { status: 422 });
  }
  // WhatsApp minimal mengandung 8 digit
  if ((whatsapp.replace(/\D/g, "").length) < 8) {
    return NextResponse.json({ error: "Nomor WhatsApp tidak valid." }, { status: 422 });
  }

  try {
    await prisma.inquiry.create({
      data: {
        name,
        whatsapp,
        email: str(body.email, 160) || null,
        destination: str(body.destination, 120) || null,
        travelDate: str(body.travelDate, 60) || null,
        message: str(body.message, 1500) || null,
        source: str(body.source, 200) || null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan. Coba lagi." }, { status: 500 });
  }
}

// GET admin — daftar lead.
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.inquiry.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(items);
}
