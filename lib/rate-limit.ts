/* Rate limiter in-memory sederhana — sliding window per kunci (mis. per IP).
   Tanpa dependency eksternal.

   KETERBATASAN (serverless/Vercel): Map ini hidup per-instance fungsi.
   Kalau traffic dilayani beberapa instance paralel, limit efektifnya
   limit × jumlah instance — jadi ini BUKAN limiter global yang presisi,
   tapi cukup untuk meredam burst/abuse kasar dari satu sumber. Untuk
   limit global yang ketat perlu store eksternal (Redis/Upstash/KV). */

const buckets = new Map<string, number[]>();

// Auto-cleanup supaya Map tidak bocor memori di instance yang hidup lama:
// setiap CLEANUP_EVERY_MS, kunci yang sudah lama tidak aktif dibuang.
const CLEANUP_EVERY_MS = 60_000;
const MAX_IDLE_MS = 10 * 60_000;
let lastCleanup = Date.now();

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_EVERY_MS) return;
  lastCleanup = now;
  for (const [key, stamps] of buckets) {
    if (stamps.length === 0 || now - stamps[stamps.length - 1] > MAX_IDLE_MS) {
      buckets.delete(key);
    }
  }
}

/** true = boleh lanjut; false = limit terlampaui (balas 429). */
export function rateLimit(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  cleanup(now);
  const stamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (stamps.length >= limit) {
    buckets.set(key, stamps);
    return false;
  }
  stamps.push(now);
  buckets.set(key, stamps);
  return true;
}

/** IP klien dari x-forwarded-for (entri pertama = klien asli di belakang proxy). */
export function clientIp(req: { headers: { get(name: string): string | null } }): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
