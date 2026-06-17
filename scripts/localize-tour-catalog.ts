import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import {
  hasEnglishCatalogHint,
  localizeCatalogRecord,
  localizeCatalogStringArray,
  localizeCatalogText,
} from "../lib/tour-catalog-localization";

type ItineraryItem = {
  day: number;
  title: string;
  description: string;
};

type AddOnItem = {
  name: string;
  price: number;
  tag?: "" | "wajib" | "recommended";
  desc?: string | null;
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

function stableJson(value: unknown) {
  return JSON.stringify(value ?? null);
}

function englishHintBlob(value: unknown) {
  return hasEnglishCatalogHint(typeof value === "string" ? value : stableJson(value));
}

async function main() {
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  loadEnvFile(path.resolve(process.cwd(), ".env"));

  const prisma = new PrismaClient();
  let updated = 0;
  let unchanged = 0;

  try {
    const tours = await prisma.tour.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        country: true,
        cityHighlight: true,
        description: true,
        notes: true,
        duration: true,
        badge: true,
        visaInfo: true,
        itinerary: true,
        inclusions: true,
        exclusions: true,
        hotel: true,
        addOns: true,
      },
      orderBy: { createdAt: "asc" },
    });

    for (const tour of tours) {
      const itinerary = Array.isArray(tour.itinerary) ? (tour.itinerary as ItineraryItem[]) : [];
      const addOns = Array.isArray(tour.addOns) ? (tour.addOns as AddOnItem[]) : [];
      const hotel =
        tour.hotel && !Array.isArray(tour.hotel) && typeof tour.hotel === "object"
          ? (tour.hotel as Record<string, string>)
          : null;

      const next = {
        title: (await localizeCatalogText(tour.title)) ?? tour.title,
        country: (await localizeCatalogText(tour.country)) ?? tour.country,
        cityHighlight: (await localizeCatalogText(tour.cityHighlight)) ?? null,
        description: (await localizeCatalogText(tour.description)) ?? null,
        notes: (await localizeCatalogText(tour.notes)) ?? null,
        duration: (await localizeCatalogText(tour.duration)) ?? null,
        badge: (await localizeCatalogText(tour.badge)) ?? null,
        visaInfo: (await localizeCatalogText(tour.visaInfo)) ?? null,
        itinerary: await Promise.all(
          itinerary.map(async (item) => ({
            ...item,
            title: (await localizeCatalogText(item.title)) ?? item.title,
            description: (await localizeCatalogText(item.description)) ?? item.description,
          }))
        ),
        inclusions: await localizeCatalogStringArray(tour.inclusions),
        exclusions: await localizeCatalogStringArray(tour.exclusions),
        hotel: (await localizeCatalogRecord(hotel)) ?? undefined,
        addOns: await Promise.all(
          addOns.map(async (item) => ({
            ...item,
            name: (await localizeCatalogText(item.name)) ?? item.name,
            desc: (await localizeCatalogText(item.desc)) ?? item.desc,
          }))
        ),
      };

      const before = stableJson({
        title: tour.title,
        country: tour.country,
        cityHighlight: tour.cityHighlight,
        description: tour.description,
        notes: tour.notes,
        duration: tour.duration,
        badge: tour.badge,
        visaInfo: tour.visaInfo,
        itinerary: tour.itinerary,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        hotel: tour.hotel,
        addOns: tour.addOns,
      });
      const after = stableJson(next);

      if (before === after) {
        unchanged += 1;
        continue;
      }

      await prisma.tour.update({
        where: { id: tour.id },
        data: next,
      });
      updated += 1;
      console.log(`localized ${tour.slug ?? tour.id}`);
    }

    const remaining = await prisma.tour.findMany({
      select: {
        slug: true,
        title: true,
        country: true,
        cityHighlight: true,
        description: true,
        notes: true,
        itinerary: true,
        inclusions: true,
        exclusions: true,
        hotel: true,
        addOns: true,
      },
    });
    const remainingHits = remaining.filter((tour) =>
      englishHintBlob([
        tour.title,
        tour.country,
        tour.cityHighlight,
        tour.description,
        tour.notes,
        tour.itinerary,
        tour.inclusions,
        tour.exclusions,
        tour.hotel,
        tour.addOns,
      ])
    );

    console.log(`Tour catalog localization complete: ${updated} updated, ${unchanged} unchanged`);
    console.log(`Remaining English-hint rows: ${remainingHits.length}`);
    for (const tour of remainingHits.slice(0, 20)) {
      console.log(`remaining ${tour.slug ?? tour.title}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
