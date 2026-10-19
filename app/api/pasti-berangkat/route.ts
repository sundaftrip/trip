import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { forwardSignup, parseSignup, pbScriptUrl, readPools } from "@/lib/pasti-berangkat";

// Halaman /pastiberangkat, /2tans, dan /turharian (public/<nama>/index.html) membaca dan mengirim data lewat route ini.
// Apps Script bisa butuh beberapa detik, jadi data publik di-cache CDN sebentar.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const PUBLIC_CACHE = "public, s-maxage=30, stale-while-revalidate=300";

// GET publik: jumlah orang per tanggal tiba dan per tur per hari. Tanpa nama dan nomor WA.
export async function GET() {
  const result = await readPools(pbScriptUrl());
  return NextResponse.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": result.cacheable ? PUBLIC_CACHE : "no-store" },
  });
}

// POST publik: rencana trip atau tur harian dari salah satu dari tiga halaman.
export async function POST(req: NextRequest) {
  if (!rateLimit(`pasti-berangkat:${clientIp(req)}`, 8, 60_000)) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak percobaan. Coba lagi sebentar." },
      { status: 429, headers: { "Retry-After": "60", "Cache-Control": "no-store" } },
    );
  }
  const parsed = parseSignup(await req.text());
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: parsed.status, headers: { "Cache-Control": "no-store" } });
  }
  const result = await forwardSignup(pbScriptUrl(), parsed.body);
  return NextResponse.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
}
