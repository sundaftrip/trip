import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { forwardSubmission, parseSubmission, poolScriptUrl, readCatalog } from "@/lib/pool-trip";

// Halaman /pool (public/pool/index.html) membaca dan mengirim data Pool Trip lewat route ini.
// Apps Script bisa butuh beberapa detik, jadi data publik di-cache CDN sebentar.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const PUBLIC_CACHE = "public, s-maxage=30, stale-while-revalidate=300";

// GET publik: isi tiap negara dan jumlah peserta per tanggal. Tanpa nama dan nomor WA.
export async function GET() {
  const result = await readCatalog(poolScriptUrl());
  return NextResponse.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": result.cacheable ? PUBLIC_CACHE : "no-store" },
  });
}

// POST publik: pendaftaran pool atau daftar minat dari formulir di /pool/<kode>.
export async function POST(req: NextRequest) {
  if (!rateLimit(`pool:${clientIp(req)}`, 8, 60_000)) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak percobaan. Coba lagi sebentar." },
      { status: 429, headers: { "Retry-After": "60", "Cache-Control": "no-store" } },
    );
  }
  const parsed = parseSubmission(await req.text());
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: parsed.status, headers: { "Cache-Control": "no-store" } });
  }
  const result = await forwardSubmission(poolScriptUrl(), parsed.body);
  return NextResponse.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
}
