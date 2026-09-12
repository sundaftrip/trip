import { resolveCanadaRockiesAddOns } from "./canada-catalog-preview";
import { canonicalTourPath } from "./seo-routes";
import { getCommerceTourStatus, mandatoryAddOnsTotal } from "./tour-commerce";
import { normalizeTourDisplayTitle } from "./tour-display";
import { parseTourHotelRoomPricing, resolveTourStartingPrice } from "./tour-room-pricing";
import { formatCurrency } from "./utils";

export const RUSSIA_GUIDE_PATH = "/tour-rusia-dari-indonesia";

export type RussiaTourCandidate = {
  title?: string | null;
  country?: string | null;
  cityHighlight?: string | null;
  status?: string | null;
  badge?: string | null;
  tripDate?: Date | string | null;
  duration?: string | null;
  seatsLeft?: number | null;
};

export type RussiaSummaryTour = RussiaTourCandidate & {
  id: string;
  slug: string | null;
  title: string;
  price: number;
  promoPrice: number | null;
  addOns: unknown;
  hotel: unknown;
};

const RUSSIA_COUNTRY = /\b(rusia|russia|russian federation)\b/i;
const RUSSIA_PLACE = /\b(rusia|russia|murmansk|teriberka|moscow|moskow|(?:saint|st)[.\s-]+petersburg)\b/i;
const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta",
});

export function isRussiaTour(tour: RussiaTourCandidate) {
  const country = tour.country?.trim();
  // An explicit country takes precedence over an ambiguous product title.
  // Aurora alone is not evidence of Russia (e.g. Canada or Finland).
  return country
    ? RUSSIA_COUNTRY.test(country)
    : RUSSIA_PLACE.test(`${tour.title || ""} ${tour.cityHighlight || ""}`);
}

export function isRussiaGuideTour(tour: RussiaTourCandidate, now = new Date()) {
  if (tour.status !== "ACTIVE" || !isRussiaTour(tour) || !tour.tripDate) return false;
  const departure = new Date(tour.tripDate).getTime();
  if (!Number.isFinite(departure) || departure <= now.getTime()) return false;
  return ["available", "last_seats", "confirmed"].includes(getCommerceTourStatus(tour, now));
}

export function selectRussiaGuideTours<T extends RussiaTourCandidate & { id: string }>(
  tours: readonly T[], now = new Date(),
) {
  return tours.filter((tour) => isRussiaGuideTour(tour, now)).sort((a, b) => (
    new Date(a.tripDate!).getTime() - new Date(b.tripDate!).getTime()
    || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  )).slice(0, 3);
}

function statusLabel(tour: RussiaTourCandidate, now: Date) {
  const status = getCommerceTourStatus(tour, now);
  if (status === "confirmed") return "Pasti berangkat";
  if (status === "last_seats") return "Kursi terakhir";
  return (tour.seatsLeft ?? 0) > 0 ? "Tersedia" : "Cek ketersediaan";
}

export function formatRussiaTourSummary(tour: RussiaSummaryTour, now = new Date()) {
  const mandatoryTotal = mandatoryAddOnsTotal(resolveCanadaRockiesAddOns(tour.addOns, tour.slug));
  const { roomPrices } = parseTourHotelRoomPricing(tour.hotel, mandatoryTotal);
  const startingPrice = resolveTourStartingPrice(
    Number(tour.promoPrice ?? tour.price), mandatoryTotal, roomPrices,
  );
  const price = startingPrice.headlinePrice > 0
    ? `${mandatoryTotal > 0 ? "Total wajib" : "Harga paket"} mulai ${formatCurrency(startingPrice.mandatoryTotalPrice)}/orang${mandatoryTotal > 0 ? ` (termasuk ${formatCurrency(mandatoryTotal)} biaya wajib)` : ""}`
    : "Konfirmasi harga";
  const facts = [
    normalizeTourDisplayTitle(tour.title),
    DATE_FORMATTER.format(new Date(tour.tripDate!)),
    tour.duration,
    tour.cityHighlight || tour.country,
    statusLabel(tour, now),
    price,
  ].filter(Boolean).join(" · ");
  return `${facts}. Lihat detail: ${canonicalTourPath(tour)}`;
}

export function buildRussiaTourSummarySection(tours: readonly RussiaSummaryTour[] | null, now = new Date()) {
  const selected = selectRussiaGuideTours(tours ?? [], now);
  return {
    title: "Jadwal tour Rusia",
    body: tours === null
      ? "Jadwal belum dapat ditampilkan. Lihat katalog Rusia di /tours?destination=rusia atau ajukan private trip melalui /custom-trip."
      : selected.length
        ? "Periksa rincian biaya, fasilitas, dan ketersediaan pada halaman perjalanan. Lihat pilihan lainnya di /tours?destination=rusia atau rancang private trip melalui /custom-trip."
        : "Belum ada jadwal mendatang yang ditawarkan pada daftar ini. Lihat katalog Rusia di /tours?destination=rusia atau ajukan private trip melalui /custom-trip.",
    items: selected.map((tour) => formatRussiaTourSummary(tour, now)),
  };
}
