/* Helpers slug untuk halaman detail visa per-negara di /visa/[slug].
   Database CountryVisa belum punya kolom slug — slug diturunkan dari kolom `en`
   (nama Inggris) supaya stabil & SEO-friendly: "Saudi Arabia" → "saudi-arabia".
   88 baris masih kecil — lookup linier OK. Kalau nanti banyak, tinggal tambah
   kolom @unique slug di schema. */
import slugify from "slugify";

export function visaSlug(en: string): string {
  return slugify(en, { lower: true, strict: true });
}

/** Cari satu negara dari array berdasarkan slug. */
export function findBySlug<T extends { en: string }>(
  items: T[],
  slug: string,
): T | undefined {
  return items.find((c) => visaSlug(c.en) === slug);
}

/* ── Pencocokan nama negara yang toleran typo (untuk add-on visa) ──────
   "Visa Kirgyztan 1.7jt" tetap nyambung ke "Kyrgyzstan". Pakai substring
   dulu (paling kuat), lalu fuzzy via edit-distance Levenshtein. */

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // buang aksen (combining marks)
    .replace(/[^a-z\s]/g, " ") // buang angka/simbol
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

export function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const max = Math.max(a.length, b.length);
  return max === 0 ? 0 : 1 - levenshtein(a, b) / max;
}

/**
 * Cocokkan teks (mis. nama add-on "Visa Kirgyztan") ke salah satu negara.
 * Mengembalikan negara dengan skor tertinggi bila >= threshold, atau null.
 */
export function matchCountryFuzzy<T extends { name?: string | null; en?: string | null }>(
  countries: T[],
  text: string,
  threshold = 0.74,
): T | undefined {
  const q = normalizeName(text).replace(/\bvisa\b/g, "").trim();
  if (!q) return undefined;
  const qWords = q.split(" ").filter((w) => w.length >= 3);

  let best: T | undefined;
  let bestScore = 0;
  for (const c of countries) {
    for (const raw of [c.name, c.en]) {
      if (!raw) continue;
      const nc = normalizeName(raw);
      if (!nc) continue;
      let score = 0;
      if (q.includes(nc) || nc.includes(q)) {
        score = 1; // kecocokan substring = paling kuat
      } else {
        const ncWords = nc.split(" ");
        for (const qw of qWords) {
          score = Math.max(score, similarity(qw, nc));
          for (const cw of ncWords) score = Math.max(score, similarity(qw, cw));
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }
  }
  return bestScore >= threshold ? best : undefined;
}
