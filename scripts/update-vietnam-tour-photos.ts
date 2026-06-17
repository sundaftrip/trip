import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { galleryForVietnamTour, heroForVietnamTour } from "../lib/vietnam-tour-images";

type ImportFile = {
  tours: Array<{
    slug: string;
    title: string;
    route_summary?: string;
    highlights?: string[];
    brief_itinerary?: Array<{ route?: string }>;
    detailed_itinerary?: Array<{ heading?: string; details?: string[] }>;
    internal_flights?: Array<{ route?: string }>;
  }>;
};

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const body = fs.readFileSync(filePath, "utf8");
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, "");
  }
}

async function assertImagesExist(images: string[]) {
  const missing = images
    .filter((image) => image.startsWith("/"))
    .filter((image) => !fs.existsSync(path.join(process.cwd(), "public", image.replace(/^\/+/, ""))));

  const failedRemote: string[] = [];
  for (const image of images.filter((item) => /^https?:\/\//i.test(item))) {
    const response = await fetch(image, { method: "HEAD" });
    if (!response.ok) failedRemote.push(`${response.status} ${image}`);
  }

  if (missing.length > 0) {
    throw new Error(`Missing public Vietnam catalog images:\n${missing.join("\n")}`);
  }
  if (failedRemote.length > 0) {
    throw new Error(`Unavailable remote Vietnam catalog images:\n${failedRemote.join("\n")}`);
  }
}

async function main() {
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  loadEnvFile(path.resolve(process.cwd(), ".env"));

  const sourcePath = path.resolve(process.argv[2] ?? "sundaftrip_vietnam_tours_import.json");
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Import file not found: ${sourcePath}`);
  }

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as ImportFile;
  if (!Array.isArray(source.tours) || source.tours.length !== 23) {
    throw new Error(`Expected 23 Vietnam tours, got ${source.tours?.length ?? 0}`);
  }

  const allImages = source.tours.flatMap((tour) => [heroForVietnamTour(tour), ...galleryForVietnamTour(tour)]);
  await assertImagesExist([...new Set(allImages)]);

  const prisma = new PrismaClient();
  let updated = 0;
  let missing = 0;
  try {
    for (const tour of source.tours) {
      const existing = await prisma.tour.findFirst({
        where: { slug: tour.slug, country: "Vietnam" },
        select: { id: true },
      });
      if (!existing) {
        missing += 1;
        console.warn(`Missing Vietnam tour in database: ${tour.slug}`);
        continue;
      }

      await prisma.tour.update({
        where: { id: existing.id },
        data: {
          heroImg: heroForVietnamTour(tour),
          gallery: galleryForVietnamTour(tour),
        },
      });
      updated += 1;
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`Vietnam tour photos updated: ${updated} updated, ${missing} missing`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
