import "server-only";

import slugify from "slugify";
import { prisma } from "@/lib/prisma";

/** Slug URL rapi & unik dari judul tour (mis. "Russia Aurora" → "russia-aurora"). */
export async function uniqueTourSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title || "tour", { lower: true, strict: true }) || "tour";
  let slug = base;
  let suffix = 2;
  for (;;) {
    const existing = await prisma.tour.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${suffix++}`;
  }
}
