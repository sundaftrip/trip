import { NextRequest } from "next/server";
import { catalogPayload, cleanText, isDateKey } from "@/lib/pool/core";
import { POOL_PUBLIC_CACHE, isBotSubmission, poolRead, poolWrite, readPoolForm } from "@/lib/pool/http";
import { loadBundles, publicContext, submitGeneric } from "@/lib/pool/store";

// Halaman /pool (public/pool/index.html) membaca dan mengirim data lewat route ini.
// Data disimpan di database website. Yang dikirim ke pengunjung hanya angka per
// tanggal; nama dan nomor WhatsApp pendaftar hanya terlihat di CMS (/admin/pool).
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// GET publik: isi tiap negara dan jumlah peserta per tanggal.
export async function GET() {
  return poolRead(async () => {
    const ctx = await publicContext();
    return catalogPayload(await loadBundles(ctx.today), ctx);
  }, POOL_PUBLIC_CACHE);
}

// POST publik: pendaftaran pool atau daftar minat dari formulir di /pool/<kode>.
export async function POST(req: NextRequest) {
  const form = await readPoolForm(req, "pool");
  if (!form.ok) return form.response;
  if (isBotSubmission(form.value)) {
    const d = isDateKey(form.value.d) ? form.value.d : "";
    return poolWrite(async () => ({
      ok: true, kode: "OK-0000", updated: false, dest: cleanText(form.value.dest, 40), group: "", wa: "", share: "",
      kind: "minat", prev: 0, minat: 0, pool: { d, n: 0, by: {}, px: 0, r: 0 },
    }));
  }
  return poolWrite(() => submitGeneric(form.value));
}
