import { prisma } from "@/lib/prisma";
import { BLOG_PINS_KEY, parsePinnedIds } from "@/lib/blog-pins";

/** Baca daftar ID artikel tersemat. Gagal baca = tidak ada yang disematkan. */
export async function getPinnedBlogIds(): Promise<string[]> {
  try {
    const row = await prisma.companyInfo.findUnique({ where: { key: BLOG_PINS_KEY } });
    return parsePinnedIds(row?.value);
  } catch {
    return [];
  }
}
