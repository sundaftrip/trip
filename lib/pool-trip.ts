// Pool Trip multi-negara: halaman statis public/pool/index.html (URL /pool dan /pool/<kode>)
// membaca dan mengirim data lewat /api/pool. Route itu meneruskan permintaan ke Apps Script
// di Google Sheet "SUNDAF · Pool Trip". Terpisah dari pool Kazakhstan (/kazakhstan).

/** Web app Apps Script (URL /exec). Bukan rahasia: endpoint publik yang tidak mengembalikan nama atau nomor WA. */
export const POOL_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxj-o13J28YMm2aoa1aHgoOWKtI_vvyxO1g3tni2V_Y7FEreBJWlASA7ZVWBh-TQCVjBQ/exec";

/** Batas ukuran isi formulir yang diteruskan ke Apps Script. */
export const POOL_MAX_BODY = 4000;

const FORM_FIELDS = ["dest", "d", "pkg", "pax", "flex", "name", "wa", "hp"] as const;

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type PoolResult = { status: number; body: unknown; cacheable: boolean };

export function isAppsScriptUrl(url: string): boolean {
  return /^https:\/\/script\.google\.com\/macros\/s\/[\w-]{20,}\/exec$/.test(url);
}

/** URL Apps Script yang dipakai: env POOL_SCRIPT_URL (kalau valid), lalu konstanta di atas. */
export function poolScriptUrl(env: Record<string, string | undefined> = process.env): string {
  const fromEnv = (env.POOL_SCRIPT_URL ?? "").trim();
  if (isAppsScriptUrl(fromEnv)) return fromEnv;
  return isAppsScriptUrl(POOL_SCRIPT_URL) ? POOL_SCRIPT_URL : "";
}

export async function readCatalog(base: string, fetchImpl: FetchLike = fetch): Promise<PoolResult> {
  if (!base) return { status: 503, body: { ok: false, error: "Pool belum tersambung." }, cacheable: false };
  try {
    const res = await fetchImpl(`${base}?api=catalog`, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    const data = (await res.json()) as { ok?: unknown; dests?: unknown } | null;
    if (!res.ok || !data || data.ok !== true || !Array.isArray(data.dests)) throw new Error("unexpected catalog");
    return { status: 200, body: data, cacheable: true };
  } catch {
    return { status: 502, body: { ok: false, error: "Data pool belum bisa dimuat. Coba lagi sebentar." }, cacheable: false };
  }
}

/** Validasi isi formulir: JSON objek, ukuran wajar, dan hanya field formulir yang diteruskan. */
export function parseSubmission(text: string):
  | { ok: true; body: string }
  | { ok: false; status: number; error: string } {
  if (text.length > POOL_MAX_BODY) return { ok: false, status: 413, error: "Isi formulir terlalu panjang." };
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
  const picked: Record<string, unknown> = {};
  for (const key of FORM_FIELDS) if (key in source) picked[key] = source[key];
  return { ok: true, body: JSON.stringify(picked) };
}

export async function forwardSubmission(base: string, body: string, fetchImpl: FetchLike = fetch): Promise<PoolResult> {
  if (!base) {
    return { status: 503, body: { ok: false, error: "Pendaftaran belum tersambung. Coba lagi nanti, ya." }, cacheable: false };
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
    return { status: 502, body: { ok: false, error: "Koneksi lagi bermasalah. Coba tekan kirim sekali lagi." }, cacheable: false };
  }
}
