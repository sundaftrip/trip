import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dlmgl1grq/image/upload/sundaftrip/vietnam/catalog";
const PROTECTED_SLUGS = new Set(["central-asia-4-tan", "russia-aurora"]);

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

function vietnamImage(destination: string, fileName: string) {
  return `${CLOUDINARY_BASE}/${destination}/${fileName}`;
}

const PREMIUM_HERO_BY_SLUG: Record<string, string> = {
  "winter-hokkaido-tokyo":
    "https://images.pexels.com/photos/31416900/pexels-photo-31416900.jpeg?auto=compress&cs=tinysrgb&w=1400",
  "7d6n-northern-and-central-vietnam": vietnamImage("halong-bay", "ha-long-view.webp"),
  "7d6n-northern-and-southern-vietnam": vietnamImage("ninh-binh", "mua-cave.webp"),
  "4d3n-central-vietnam": vietnamImage("da-nang", "sun-world-cable-car.webp"),
  "7d6n-vietnam-from-north-to-south": vietnamImage("da-nang", "golden-bridge-sunset.webp"),
  "8d7n-vietnam-south-to-north": vietnamImage("mekong-delta", "delta-sunset.webp"),
  "10d9n-vietnam-from-north-to-south": vietnamImage("phu-quoc", "sao-beach.webp"),
};

async function assertImagesReachable(images: string[]) {
  const failures: string[] = [];
  for (const image of images) {
    const response = await fetch(image, { method: "HEAD" });
    if (!response.ok) failures.push(`${response.status} ${image}`);
  }

  if (failures.length > 0) {
    throw new Error(`Unavailable premium hero images:\n${failures.join("\n")}`);
  }
}

async function main() {
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  loadEnvFile(path.resolve(process.cwd(), ".env"));

  for (const slug of Object.keys(PREMIUM_HERO_BY_SLUG)) {
    if (PROTECTED_SLUGS.has(slug)) {
      throw new Error(`Protected tour must not be updated by this script: ${slug}`);
    }
  }

  await assertImagesReachable([...new Set(Object.values(PREMIUM_HERO_BY_SLUG))]);

  const dryRun = process.env.DRY_RUN === "1";
  const prisma = new PrismaClient();
  let updated = 0;
  try {
    for (const [slug, nextHeroImg] of Object.entries(PREMIUM_HERO_BY_SLUG)) {
      const tour = await prisma.tour.findUnique({
        where: { slug },
        select: { id: true, slug: true, title: true, heroImg: true },
      });

      if (!tour) throw new Error(`Tour not found: ${slug}`);

      const unchanged = tour.heroImg === nextHeroImg;
      console.log(`${dryRun ? "DRY" : unchanged ? "KEEP" : "SET"} ${tour.slug} -> ${nextHeroImg}`);
      if (dryRun || unchanged) continue;

      await prisma.tour.update({
        where: { id: tour.id },
        data: { heroImg: nextHeroImg },
      });
      updated += 1;
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`${dryRun ? "Dry run complete" : "Homepage premium scenery updated"}: ${updated} changed`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
