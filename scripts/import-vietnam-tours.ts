import { PrismaClient, type Prisma } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

type ImportFile = {
  created_at?: string;
  assumptions?: Record<string, unknown>;
  tours: SourceTour[];
};

type SourceTour = {
  slug: string;
  title: string;
  country: string;
  category: string;
  product_type: string;
  duration: { days: number; nights: number };
  route_summary?: string;
  highlights?: string[];
  starting_price: {
    basis?: string;
    net_usd?: number;
    sell_idr_rounded: number;
    profit_idr?: number;
    formula?: string;
  };
  short_description_id: string;
  brief_itinerary?: BriefDay[];
  detailed_itinerary?: DetailedDay[];
  hotels?: HotelOption[];
  inclusions?: string[];
  exclusions?: string[];
  optional_services?: OptionalService[];
  internal_flights?: InternalFlight[];
  land_tour_note?: string;
  pricing_matrix?: unknown[];
  source_file?: string;
};

type BriefDay = {
  day: string;
  route?: string;
  meals?: string;
  overnight?: string;
};

type DetailedDay = {
  day: string;
  heading?: string;
  details?: string[];
};

type HotelOption = {
  option?: string;
  destination?: string;
  hotel_names?: string;
  website_room?: string;
  nights?: string;
};

type OptionalService = {
  service?: string;
  price?: string;
};

type InternalFlight = {
  route?: string;
  airline_or_class?: string;
  price_usd_ticket?: string;
};

const USD_IDR = 17_900;
const ADD_ON_MARKUP = 1.25;
const ROUNDING_IDR = 100_000;

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

function roundUpIdr(value: number) {
  return Math.ceil(value / ROUNDING_IDR) * ROUNDING_IDR;
}

function parseUsd(value?: string) {
  const match = (value ?? "").match(/([\d.]+)\s*USD/i);
  return match ? Number(match[1]) : null;
}

function addOnSellPrice(value?: string) {
  const netUsd = parseUsd(value);
  return netUsd && Number.isFinite(netUsd)
    ? roundUpIdr(netUsd * USD_IDR * ADD_ON_MARKUP)
    : 0;
}

function dayNumber(value: string, fallback: number) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : fallback;
}

function cleanLines(value?: string) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanHotelName(value?: string) {
  return cleanLines(value)
    .join(" ")
    .replace(/\(?\s*or similar\s*\)?/gi, "atau setara/or similar")
    .replace(/\s+/g, " ")
    .trim();
}

function roomLabel(value?: string) {
  return cleanLines(value)
    .filter((line) => !/^https?:\/\//i.test(line))
    .join(" / ");
}

function buildHotelRecord(hotels?: HotelOption[]) {
  const record: Record<string, string> = {};
  for (const [idx, hotel] of (hotels ?? []).entries()) {
    const option = (hotel.option ?? `Option ${idx + 1}`).replace(/\s+/g, " ").trim();
    const destination = (hotel.destination ?? "Hotel").trim();
    const nights = hotel.nights ? `${hotel.nights} malam` : "durasi sesuai itinerary";
    const key = `${option} - ${destination} (${nights})`;
    const room = roomLabel(hotel.website_room);
    const hotelName = cleanHotelName(hotel.hotel_names);
    record[key] = [hotelName, room].filter(Boolean).join(" - ");
  }
  return record;
}

function buildDescription(tour: SourceTour) {
  return [
    tour.short_description_id,
    tour.highlights?.length ? `Highlights: ${tour.highlights.join(", ")}` : null,
    tour.route_summary ? `Rute: ${tour.route_summary}` : null,
    `Produk: ${tour.product_type}.`,
  ].filter(Boolean).join("\n\n");
}

function uniqueFlightRoutes(flights?: InternalFlight[]) {
  return [...new Set((flights ?? [])
    .map((flight) => (flight.route ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean))];
}

function buildNotes(tour: SourceTour) {
  const routes = uniqueFlightRoutes(tour.internal_flights);
  const domesticFlightLine = routes.length
    ? `Domestic flights quote separately: ${routes.join("; ")}.`
    : "Domestic flights, jika ada, quote separately.";

  return [
    "Private Land Tour Only.",
    "Land tour only.",
    "All airfares excluded.",
    domesticFlightLine,
    "Harga subject to availability dan kurs.",
    "Hotel atau setara/or similar.",
  ].join("\n");
}

function buildItinerary(tour: SourceTour) {
  const briefByDay = new Map((tour.brief_itinerary ?? []).map((day) => [day.day, day]));
  const detailed = tour.detailed_itinerary ?? [];
  if (detailed.length > 0) {
    return detailed.map((day, index) => {
      const brief = briefByDay.get(day.day);
      const meta = [
        brief?.meals ? `Meals: ${brief.meals}` : null,
        brief?.overnight ? `Overnight: ${brief.overnight}` : null,
      ].filter(Boolean);
      return {
        day: dayNumber(day.day, index + 1),
        title: day.heading || brief?.route || day.day,
        description: [...meta, ...(day.details ?? [])].join("\n"),
      };
    });
  }

  return (tour.brief_itinerary ?? []).map((day, index) => ({
    day: dayNumber(day.day, index + 1),
    title: day.route || day.day,
    description: [
      day.meals ? `Meals: ${day.meals}` : null,
      day.overnight ? `Overnight: ${day.overnight}` : null,
    ].filter(Boolean).join("\n"),
  }));
}

function buildAddOns(tour: SourceTour) {
  return (tour.optional_services ?? [])
    .map((item) => ({
      name: item.service?.trim() ?? "",
      price: addOnSellPrice(item.price),
      desc: "Opsional, subject to availability.",
    }))
    .filter((item) => item.name && item.price > 0);
}

function heroForTour(tour: SourceTour) {
  const text = `${tour.title} ${tour.route_summary ?? ""} ${(tour.highlights ?? []).join(" ")}`.toLowerCase();
  if (text.includes("sapa")) return "/vietnam/assets/hero-sapa.jpg";
  if (text.includes("halong")) return "/vietnam/assets/halong-sunset.jpg";
  if (text.includes("hanoi") || text.includes("northern")) return "/vietnam/assets/hanoi-street.jpg";
  if (text.includes("phu quoc")) return "/vietnam/assets/og.jpg";
  return "/vietnam/assets/halong-boat.jpg";
}

function galleryForTour(tour: SourceTour) {
  const images = new Set<string>([heroForTour(tour)]);
  const text = `${tour.title} ${tour.route_summary ?? ""} ${(tour.highlights ?? []).join(" ")}`.toLowerCase();
  if (text.includes("sapa")) {
    images.add("/vietnam/assets/sapa-aerial.jpg");
    images.add("/vietnam/assets/hero-sapa-mobile.jpg");
  }
  if (text.includes("halong")) {
    images.add("/vietnam/assets/halong-boat.jpg");
    images.add("/vietnam/assets/halong-sunset.jpg");
  }
  if (text.includes("hanoi")) images.add("/vietnam/assets/hanoi-street.jpg");
  if (images.size < 3) images.add("/vietnam/assets/og.jpg");
  return [...images].slice(0, 4);
}

function toTourInput(tour: SourceTour): Prisma.TourUncheckedCreateInput {
  const duration = `${tour.duration.days} Hari ${tour.duration.nights} Malam`;
  return {
    title: tour.title,
    slug: tour.slug,
    country: "Vietnam",
    cityHighlight: tour.route_summary ?? null,
    price: tour.starting_price.sell_idr_rounded,
    promoPrice: null,
    priceLandTour: null,
    seatsLeft: 0,
    status: "ACTIVE",
    tripDate: null,
    duration,
    itinerary: buildItinerary(tour),
    inclusions: tour.inclusions ?? [],
    exclusions: tour.exclusions ?? [],
    gallery: galleryForTour(tour),
    hotel: buildHotelRecord(tour.hotels),
    visaInfo: null,
    heroImg: heroForTour(tour),
    badge: "Private Land Tour",
    notes: buildNotes(tour),
    description: buildDescription(tour),
    addOns: buildAddOns(tour),
  };
}

function internalPricingRecord(source: ImportFile) {
  return {
    generated_at: new Date().toISOString(),
    source_created_at: source.created_at ?? null,
    assumptions: source.assumptions ?? {
      usd_idr: USD_IDR,
      markup_percent: 0.25,
      minimum_margin_idr_per_pax: 1_000_000,
      rounding_idr: ROUNDING_IDR,
    },
    tours: source.tours.map((tour) => ({
      slug: tour.slug,
      title: tour.title,
      category: tour.category,
      product_type: tour.product_type,
      source_file: tour.source_file ?? null,
      starting_price: tour.starting_price,
      pricing_matrix: tour.pricing_matrix ?? [],
      optional_services_net: tour.optional_services ?? [],
      internal_flights: tour.internal_flights ?? [],
    })),
  };
}

async function main() {
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  loadEnvFile(path.resolve(process.cwd(), ".env"));

  const sourcePath = path.resolve(process.argv[2] ?? "sundaftrip_vietnam_tours_import.json");
  const internalPath = path.resolve(process.argv[3] ?? "data/internal/vietnam-tour-pricing-matrix.local.json");

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Import file not found: ${sourcePath}`);
  }

  const source = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as ImportFile;
  if (!Array.isArray(source.tours) || source.tours.length !== 23) {
    throw new Error(`Expected 23 tours, got ${source.tours?.length ?? 0}`);
  }

  const slugSet = new Set(source.tours.map((tour) => tour.slug));
  if (slugSet.size !== source.tours.length) {
    throw new Error("Duplicate tour slugs found in import file");
  }

  fs.mkdirSync(path.dirname(internalPath), { recursive: true });
  fs.writeFileSync(internalPath, `${JSON.stringify(internalPricingRecord(source), null, 2)}\n`);

  const prisma = new PrismaClient();
  let created = 0;
  let updated = 0;
  try {
    for (const sourceTour of source.tours) {
      const data = toTourInput(sourceTour);
      const existing = await prisma.tour.findUnique({ where: { slug: sourceTour.slug }, select: { id: true } });
      await prisma.tour.upsert({
        where: { slug: sourceTour.slug },
        create: data,
        update: data,
      });
      if (existing) updated += 1;
      else created += 1;
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`Vietnam tours import complete: ${created} created, ${updated} updated`);
  console.log(`Internal pricing matrix saved: ${internalPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
