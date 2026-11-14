import { NextRequest } from "next/server";
import { isDateKey, kzPublicPayload } from "@/lib/pool/core";
import { isBotSubmission, poolRead, poolWrite, readPoolForm } from "@/lib/pool/http";
import { loadBundles, publicContext, submitKz } from "@/lib/pool/store";

// Halaman /kazakhstan (public/kazakhstan/index.html) membaca dan mengirim data lewat
// route ini. Bentuk datanya sama dengan API Apps Script versi 3 yang digantikannya.
// Yang dikirim ke pengunjung hanya angka per tanggal, pengaturan tampilan, dan harga.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// GET publik: jumlah orang per tanggal tiba. Selalu segar supaya orang yang baru
// mendaftar langsung melihat dirinya terhitung.
export async function GET() {
  return poolRead(async () => {
    const ctx = await publicContext();
    const [bundle] = await loadBundles(ctx.today, { engine: "kazakhstan" });
    return bundle ? kzPublicPayload(bundle.dest, bundle.rows, bundle.dates, ctx) : null;
  }, "no-store");
}

// POST publik: pendaftaran dari formulir /kazakhstan.
export async function POST(req: NextRequest) {
  const form = await readPoolForm(req, "pool-kz");
  if (!form.ok) return form.response;
  if (isBotSubmission(form.value)) {
    const d = isDateKey(form.value.d) ? form.value.d : "";
    return poolWrite(async () => ({
      ok: true, kind: "KZ", interest: false, joined: false, kode: "KZ-0000", updated: false, prev: 0,
      pool: { d, n: 1, p5: 1, p6: 0, p8: 0, kg: 0, px: 0, r: 1, e: d, q: 30 }, group: "", night: false, wa: "", share: "",
    }));
  }
  return poolWrite(() => submitKz(form.value));
}
