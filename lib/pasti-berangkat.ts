// Tiga halaman statis "pasti berangkat": public/pastiberangkat, public/2tans, public/turharian
// (URL /pastiberangkat, /2tans, /turharian) membaca dan mengirim data lewat /api/pasti-berangkat.
// Route itu meneruskan permintaan ke Apps Script di Google Sheet "SUNDAF · Pasti Berangkat".
// Terpisah dari pool Kazakhstan (/kazakhstan) dan Pool Trip (/pool).
import { isAppsScriptUrl, type FetchLike } from "./pool-trip";

/** Web app Apps Script (URL /exec). Bukan rahasia: endpoint publik yang tidak mengembalikan nama atau nomor WA. */
export const PB_SCRIPT_URL = "";

/** Batas ukuran isi formulir yang diteruskan ke Apps Script (rencana per hari bisa panjang untuk trip 21 malam). */
export const PB_MAX_BODY = 12_000;

/** Halaman yang boleh mengirim pendaftaran. */
export const PB_PAGES = ["pastiberangkat", "2tans", "turharian"] as const;

const FORM_FIELDS = [
  "page", "v", "d", "e", "pax", "flex", "mode", "paket", "hotel", "kamar", "hn", "kg", "kgMulai", "hari", "add",
  "via", "t", "fl", "jemput", "antar", "note", "name", "wa", "hp", "est", "plan",
] as const;

export type PbResult = { status: number; body: unknown; cacheable: boolean };

/** URL Apps Script yang dipakai: env PB_SCRIPT_URL (kalau valid), lalu konstanta di atas. */
export function pbScriptUrl(env: Record<string, string | undefined> = process.env): string {
  const fromEnv = (env.PB_SCRIPT_URL ?? "").trim();
  if (isAppsScriptUrl(fromEnv)) return fromEnv;
  return isAppsScriptUrl(PB_SCRIPT_URL) ? PB_SCRIPT_URL : "";
}

/** Data publik: jumlah orang per tanggal tiba dan per tur per hari. Tanpa nama dan nomor WA. */
export async function readPools(base: string, fetchImpl: FetchLike = fetch): Promise<PbResult> {
  if (!base) return { status: 503, body: { ok: false, error: "Pendaftaran belum tersambung." }, cacheable: false };
  try {
    const res = await fetchImpl(`${base}?api=pools`, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    const data = (await res.json()) as { ok?: unknown; pools?: unknown; act?: unknown } | null;
    const valid = !!data && data.ok === true && Array.isArray(data.pools) && !!data.act && typeof data.act === "object";
    if (!res.ok || !valid) throw new Error("unexpected pools");
    return { status: 200, body: data, cacheable: true };
  } catch {
    return { status: 502, body: { ok: false, error: "Data belum bisa dimuat. Coba lagi sebentar." }, cacheable: false };
  }
}

/** Validasi isi formulir: JSON objek, ukuran wajar, halaman dikenal, dan hanya field formulir yang diteruskan. */
export function parseSignup(text: string):
  | { ok: true; body: string }
  | { ok: false; status: number; error: string } {
  if (text.length > PB_MAX_BODY) return { ok: false, status: 413, error: "Isi formulir terlalu panjang." };
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, status: 400, error: "Format formulir tidak dikenali." };
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, status: 400, error: "Format formulir tidak dikenali." };
  }
  const source = value as Record<string, unknown>;
  if (!(PB_PAGES as readonly unknown[]).includes(source.page)) {
    return { ok: false, status: 400, error: "Halaman tidak dikenali. Muat ulang halamannya, lalu kirim lagi." };
  }
  const picked: Record<string, unknown> = {};
  for (const key of FORM_FIELDS) if (key in source) picked[key] = source[key];
  return { ok: true, body: JSON.stringify(picked) };
}

export async function forwardSignup(base: string, body: string, fetchImpl: FetchLike = fetch): Promise<PbResult> {
  if (!base) {
    return { status: 503, body: { ok: false, error: "Pendaftaran belum tersambung. Kirim rencanamu lewat WhatsApp dulu, ya." }, cacheable: false };
  }
  try {
    const res = await fetchImpl(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(25_000),
    });
    const data = (await res.json()) as unknown;
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("unexpected reply");
    return { status: 200, body: data, cacheable: false };
  } catch {
    return { status: 502, body: { ok: false, error: "Koneksi lagi bermasalah. Coba tekan kirim sekali lagi, atau kirim rencanamu lewat WhatsApp." }, cacheable: false };
  }
}
