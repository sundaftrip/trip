/*
 * Artikel blog yang disematkan (pinned) di atas halaman Jurnal.
 * Disimpan sebagai daftar ID (JSON) di CompanyInfo, jadi tidak perlu migrasi skema.
 * File ini murni (tanpa Prisma) supaya aman dipakai client & mudah diuji.
 */

export const BLOG_PINS_KEY = "blog_pinned";
export const MAX_PINNED_POSTS = 3;

/** Ubah nilai CompanyInfo menjadi daftar ID yang bersih (unik, maks 3). */
export function parsePinnedIds(value: string | null | undefined): string[] {
  if (!value) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { return []; }
  if (!Array.isArray(parsed)) return [];
  const ids: string[] = [];
  for (const item of parsed) {
    if (typeof item !== "string") continue;
    const id = item.trim();
    if (id && !ids.includes(id)) ids.push(id);
    if (ids.length === MAX_PINNED_POSTS) break;
  }
  return ids;
}

/** Artikel tersemat tampil paling atas (urut sesuai daftar), sisanya tetap urut tanggal. */
export function orderPostsWithPins<T extends { id: string }>(
  posts: T[],
  pinnedIds: string[],
): (T & { pinned: boolean })[] {
  const byId = new Map(posts.map((post) => [post.id, post]));
  const pinned = pinnedIds
    .map((id) => byId.get(id))
    .filter((post): post is T => Boolean(post))
    .map((post) => ({ ...post, pinned: true }));
  const pinnedSet = new Set(pinned.map((post) => post.id));
  const rest = posts
    .filter((post) => !pinnedSet.has(post.id))
    .map((post) => ({ ...post, pinned: false }));
  return [...pinned, ...rest];
}
