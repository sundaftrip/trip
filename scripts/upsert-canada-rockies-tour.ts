import { PrismaClient, type Prisma } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import {
  CANADA_ROCKIES_SLUG,
  CANADA_ROCKIES_TOUR,
} from "../data/catalog/canada-rockies-april-2027";

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

function assertSafeWriteTarget() {
  const writeApproved = process.env.ALLOW_CANADA_CATALOG_IMPORT === "true";
  const isProduction = process.env.VERCEL_ENV === "production";
  const productionApproved = process.env.ALLOW_PRODUCTION_CANADA_CATALOG_IMPORT === "true";
  if (!writeApproved) {
    throw new Error(
      "Catalog import refused. Set ALLOW_CANADA_CATALOG_IMPORT=true after reviewing the target database.",
    );
  }
  if (isProduction && !productionApproved) {
    throw new Error(
      "Production import refused. Set ALLOW_PRODUCTION_CANADA_CATALOG_IMPORT=true only after preview approval.",
    );
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }
}

function tourInput(): Prisma.TourUncheckedCreateInput {
  const publish = process.env.PUBLISH_CANADA_CATALOG === "true";
  return {
    ...CANADA_ROCKIES_TOUR,
    status: publish ? "ACTIVE" : "DRAFT",
    itinerary: [...CANADA_ROCKIES_TOUR.itinerary],
    inclusions: [...CANADA_ROCKIES_TOUR.inclusions],
    exclusions: [...CANADA_ROCKIES_TOUR.exclusions],
    gallery: [...CANADA_ROCKIES_TOUR.gallery],
    hotel: { ...CANADA_ROCKIES_TOUR.hotel },
    addOns: [...CANADA_ROCKIES_TOUR.addOns],
    paymentPlan: { ...CANADA_ROCKIES_TOUR.paymentPlan },
  };
}

async function main() {
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  loadEnvFile(path.resolve(process.cwd(), ".env"));
  assertSafeWriteTarget();

  const data = tourInput();
  const prisma = new PrismaClient();
  try {
    const tour = await prisma.tour.upsert({
      where: { slug: CANADA_ROCKIES_SLUG },
      create: data,
      update: data,
      select: { id: true, slug: true, status: true, updatedAt: true },
    });
    console.log(JSON.stringify({ result: "ok", tour }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
