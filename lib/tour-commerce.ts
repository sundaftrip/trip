import { formatCurrency, toWaNumber } from "./utils";

export type CommerceTourStatus =
  | "available"
  | "last_seats"
  | "confirmed"
  | "sold_out"
  | "waitlist"
  | "completed"
  | "flexible";

export type CommerceTripType = "open_trip" | "private_land_tour" | "custom";

export type LegacyTourCommerceInput = {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
  country?: string | null;
  cityHighlight?: string | null;
  tripDate?: Date | string | null;
  status?: string | null;
  seatsLeft?: number | null;
  badge?: string | null;
  price?: number | null;
  promoPrice?: number | null;
  priceLandTour?: number | null;
  duration?: string | null;
};

export type CompatibleDeparture = {
  id: string;
  startDate: string;
  price?: number;
  status: Exclude<CommerceTourStatus, "flexible" | "completed">;
  seatsRemaining?: number;
};

export type BookingMessageInput = {
  tourName: string;
  departureDate?: string | null;
  formattedPrice?: string | null;
  priceCaption?: string | null;
  travelerCount?: number | null;
  childCount?: number | null;
  roomPreference?: string | null;
  addOnPreference?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  sourceUrl?: string | null;
  campaign?: string | null;
  intent?: "booking" | "waitlist" | "private";
};

function validDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function normalizedText(...values: Array<string | null | undefined>) {
  return values.filter(Boolean).join(" ").toLocaleLowerCase("id-ID");
}

export function getCommerceTourStatus(
  tour: LegacyTourCommerceInput,
  now = new Date(),
): CommerceTourStatus {
  const text = normalizedText(tour.status, tour.badge);
  const departure = validDate(tour.tripDate);

  if (departure) {
    const completionBoundary = new Date(departure);
    completionBoundary.setUTCDate(
      completionBoundary.getUTCDate() + Math.max(1, parseDurationDays(tour.duration) || 1),
    );
    if (completionBoundary.getTime() <= now.getTime()) return "completed";
  }
  if (/\b(waitlist|daftar tunggu)\b/i.test(text)) return "waitlist";
  if (tour.status === "FULL" || /\b(penuh|sold out)\b/i.test(text)) return "sold_out";
  if (!departure) return "flexible";
  if (/\b(confirmed|terkonfirmasi|pasti berangkat)\b/i.test(text)) return "confirmed";
  if ((tour.seatsLeft ?? 0) > 0 && (tour.seatsLeft ?? 0) <= 3) return "last_seats";
  return "available";
}

export function getCommerceTripType(tour: LegacyTourCommerceInput): CommerceTripType {
  const text = normalizedText(tour.slug, tour.title, tour.badge);
  if (/\b(custom|tailor made|tailormade)\b/i.test(text)) return "custom";
  if (!tour.tripDate || /\b(private|privat|land tour|fleksibel)\b/i.test(text)) {
    return "private_land_tour";
  }
  return "open_trip";
}

export function getCompatibleDeparture(
  tour: LegacyTourCommerceInput,
  now = new Date(),
): CompatibleDeparture | null {
  const date = validDate(tour.tripDate);
  const status = getCommerceTourStatus(tour, now);
  if (!date || status === "completed" || status === "flexible") return null;

  return {
    id: `${tour.id || tour.slug || "tour"}-${date.toISOString().slice(0, 10)}`,
    startDate: date.toISOString(),
    price: Number(tour.promoPrice ?? tour.price) || undefined,
    status,
    seatsRemaining: Number.isFinite(tour.seatsLeft) ? Number(tour.seatsLeft) : undefined,
  };
}

export function parseDurationDays(value?: string | null) {
  if (!value) return null;
  const dayMatch = value.match(/(\d+)\s*(?:hari|day|d)\b/i);
  if (dayMatch) return Number(dayMatch[1]);
  const compactMatch = value.match(/\b(\d+)\s*[Hh]\s*(?:\d+\s*[Mm])?/);
  return compactMatch ? Number(compactMatch[1]) : null;
}

export function mandatoryFeesTotal(items: Array<{ price?: number | null }>) {
  return items.reduce((total, item) => {
    const price = Number(item.price);
    return Number.isFinite(price) && price > 0 ? total + price : total;
  }, 0);
}

export function mandatoryAddOnsTotal(value: unknown) {
  if (!Array.isArray(value)) return 0;
  return mandatoryFeesTotal(
    value.filter(
      (item): item is { tag?: string; price?: number | null } =>
        Boolean(item)
        && typeof item === "object"
        && (item as { tag?: unknown }).tag === "wajib",
    ),
  );
}

export function getDestinationSlug(tour: LegacyTourCommerceInput) {
  const text = normalizedText(tour.country, tour.title, tour.cityHighlight);
  if (/(rusia|russia|aurora|murmansk|teriberka)/i.test(text)) return "rusia-aurora";
  if (/(asia tengah|central asia|kazakh|kyrgyz|uzbek|tajik)/i.test(text)) return "asia-tengah";
  if (/(vietnam|hanoi|sapa|danang|hoi an|phu quoc)/i.test(text)) return "vietnam";
  if (/(jepang|japan|tokyo|hokkaido|osaka|kyoto)/i.test(text)) return "jepang";
  return "lainnya";
}

export function formatBookingDate(value?: string | Date | null) {
  const date = validDate(value);
  if (!date) return "Fleksibel / belum dipilih";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function extractCampaignFromUrl(sourceUrl?: string | null) {
  if (!sourceUrl) return "";
  try {
    const url = new URL(sourceUrl);
    return [...url.searchParams.entries()]
      .filter(([key]) => key.toLowerCase().startsWith("utm_"))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
  } catch {
    return "";
  }
}

export function buildWhatsAppBookingMessage(input: BookingMessageInput) {
  const intentLead =
    input.intent === "waitlist"
      ? "Halo Sundaf Trip, saya ingin bergabung dalam daftar tunggu untuk:"
      : input.intent === "private"
        ? "Halo Sundaf Trip, saya ingin merancang perjalanan privat:"
        : "Halo Sundaf Trip, saya tertarik dengan:";

  const adults = Math.max(1, Number(input.travelerCount) || 1);
  const children = Math.max(0, Number(input.childCount) || 0);
  const participants = children > 0
    ? `${adults} dewasa, ${children} anak`
    : `${adults} orang`;
  const campaign = input.campaign || extractCampaignFromUrl(input.sourceUrl);

  return [
    intentLead,
    "",
    `Tour: ${input.tourName.trim()}`,
    `Tanggal: ${input.departureDate || "Fleksibel / belum dipilih"}`,
    `${input.priceCaption?.trim() || "Harga mulai"}: ${input.formattedPrice || "Mohon info"}/orang`,
    `Peserta: ${participants}`,
    `Kamar: ${input.roomPreference?.trim() || "Belum dipilih"}`,
    ...(input.addOnPreference?.trim() ? [`Add-on: ${input.addOnPreference.trim()}`] : []),
    `Nama: ${input.customerName?.trim() || "Belum diisi"}`,
    `WhatsApp: ${input.customerPhone?.trim() || "Belum diisi"}`,
    "",
    input.intent === "waitlist"
      ? "Mohon dibantu menginformasikan jika kursi kembali tersedia."
      : "Mohon dibantu cek ketersediaan dan langkah booking.",
    "",
    `Source: ${input.sourceUrl?.trim() || "sundaftrip.com"}`,
    ...(campaign ? [`Campaign: ${campaign}`] : []),
  ].join("\n");
}

export function buildWhatsAppBookingHref(
  phone: string | null | undefined,
  input: BookingMessageInput,
) {
  const number = toWaNumber(phone);
  if (!number) return "";
  return `https://wa.me/${number}?text=${encodeURIComponent(buildWhatsAppBookingMessage(input))}`;
}

export function getStartingPriceLabel(tour: LegacyTourCommerceInput) {
  const price = Number(tour.promoPrice ?? tour.price ?? tour.priceLandTour);
  return Number.isFinite(price) && price > 0 ? formatCurrency(price) : "Harga sesuai permintaan";
}
