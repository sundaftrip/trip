/* Pemeriksaan kelengkapan tour untuk CMS (dashboard, daftar tour, form). Murni, aman untuk client. */

import { LEGACY_PUBLIC_TOUR_SLUGS, isPublicTourVisible } from "@/lib/public-tours";
import { getPublicTourState } from "@/lib/tour-order";
import { parseTourHotelRoomPricing } from "@/lib/tour-room-pricing";

export type AdminTourCheckInput = {
  slug?: string | null;
  status?: string | null;
  price?: number | null;
  seatsLeft?: number | null;
  tripDate?: Date | string | null;
  heroImg?: string | null;
  description?: string | null;
  itinerary?: unknown;
  hotel?: unknown;
};

export type AdminTourVisibility = {
  /** Tampil di website (katalog & halaman detail). */
  visible: boolean;
  /** Ringkasan singkat untuk admin. */
  label: string;
  tone: "live" | "hidden" | "past" | "sold";
};

export const TOUR_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Aktif",
  FULL: "Penuh",
  CANCELLED: "Batal",
};

export const TOUR_STATUS_HELP: Record<string, string> = {
  DRAFT: "Belum tampil di website. Pakai saat tour masih disiapkan.",
  ACTIVE: "Tampil di website dan bisa dipesan.",
  FULL: "Tetap tampil, ditandai penuh. Pengunjung tidak bisa memesan.",
  CANCELLED: "Disembunyikan dari website.",
};

function isLegacyPublicSlug(slug?: string | null) {
  return LEGACY_PUBLIC_TOUR_SLUGS.includes(slug as (typeof LEGACY_PUBLIC_TOUR_SLUGS)[number]);
}

export function adminTourVisibility(tour: AdminTourCheckInput, now = new Date()): AdminTourVisibility {
  if (!isPublicTourVisible(tour)) return { visible: false, label: "Tidak tampil di website", tone: "hidden" };
  const state = getPublicTourState(tour, now);
  if (state === "completed") return { visible: true, label: "Tampil sebagai trip terdahulu", tone: "past" };
  if (state === "sold") return { visible: true, label: "Tampil, ditandai penuh", tone: "sold" };
  if (state === "flexible") return { visible: true, label: "Tampil, tanggal fleksibel", tone: "live" };
  return { visible: true, label: "Tampil & bisa dipesan", tone: "live" };
}

/** Hal yang sebaiknya dilengkapi sebelum / selama tour tampil di website. */
export function adminTourIssues(tour: AdminTourCheckInput): string[] {
  const issues: string[] = [];
  const hasRoomPrices = parseTourHotelRoomPricing(tour.hotel).roomPrices.length > 0;
  if (!tour.heroImg?.trim()) issues.push("Foto utama belum diisi");
  if (!(Number(tour.price) > 0) && !hasRoomPrices) issues.push("Harga belum diisi");
  if (!Array.isArray(tour.itinerary) || tour.itinerary.length === 0) issues.push("Itinerary masih kosong");
  if (!tour.description?.trim()) issues.push("Deskripsi belum diisi");
  if (tour.status === "ACTIVE" && tour.tripDate && (tour.seatsLeft ?? 0) <= 0) {
    issues.push("Sisa kursi 0: isi kursi atau ubah status ke Penuh");
  }
  if (tour.status !== "ACTIVE" && tour.status !== "FULL" && isLegacyPublicSlug(tour.slug)) {
    issues.push(`Status ${TOUR_STATUS_LABELS[tour.status ?? ""] ?? tour.status} tetapi tetap tampil (pengecualian lama): ubah ke Aktif`);
  }
  return issues;
}

/** Tour yang tampil dan belum lewat tanggalnya: yang perlu dijaga lengkap. */
export function needsCatalogAttention(tour: AdminTourCheckInput, now = new Date()) {
  const visibility = adminTourVisibility(tour, now);
  if (!visibility.visible || visibility.tone === "past") return [];
  return adminTourIssues(tour);
}
