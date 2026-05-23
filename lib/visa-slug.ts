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
