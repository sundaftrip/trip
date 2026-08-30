/** Public routes whose existing renderers read GEO CMS content. Keep the
 * regression test in sync when connecting another renderer, not just a URL. */
export const GEO_CMS_ROUTES = [
  { routePath: "/sundaf-trip", label: "Tentang Sundaf Trip" },
  { routePath: "/tour-rusia-dari-indonesia", label: "Tour Rusia dari Indonesia" },
  { routePath: "/open-trip-rusia-dari-jakarta", label: "Open Trip Rusia dari Jakarta" },
  { routePath: "/open-trip-vietnam", label: "Open Trip Vietnam" },
  { routePath: "/open-trip-aurora-rusia", label: "Open Trip Aurora Rusia" },
  { routePath: "/visa-rusia-wni", label: "Visa Rusia untuk WNI" },
  { routePath: "/destinations/murmansk", label: "Destinasi Murmansk" },
  { routePath: "/destinations/teriberka", label: "Destinasi Teriberka" },
  { routePath: "/jasa-urus-visa-eropa", label: "Layanan Visa Eropa" },
  { routePath: "/jasa-urus-visa-amerika-canada", label: "Layanan Visa Amerika dan Canada" },
] as const;

export function normalizeGeoRoutePath(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed ? (trimmed.startsWith("/") ? trimmed : `/${trimmed}`) : "";
}

export function isSupportedGeoRoute(routePath: string): boolean {
  return GEO_CMS_ROUTES.some((route) => route.routePath === routePath);
}

export function validateGeoRouteMutation(
  data: Record<string, unknown>,
  currentRoutePath?: string,
): string | null {
  if ("routePath" in data) data.routePath = normalizeGeoRoutePath(data.routePath);
  const routePath = "routePath" in data ? data.routePath : currentRoutePath;
  if (typeof routePath !== "string" || !routePath) return "Pilih alamat halaman GEO yang tersedia.";
  if (currentRoutePath !== undefined && routePath !== currentRoutePath) {
    return "Alamat catatan tersimpan tidak dapat diganti. Buka halaman yang sesuai dari daftar GEO.";
  }
  if (isSupportedGeoRoute(routePath)) return null;
  // A publisher may switch off an old record without having to migrate it.
  if (currentRoutePath && data.published === false && Object.keys(data).length === 1) return null;
  return "Alamat ini belum terhubung ke CMS. Pilih halaman GEO yang tersedia; menyimpan data tidak membuat alamat website baru.";
}

export function buildGeoSaveInput<T extends { published: boolean }>(
  form: T,
  initialPublished: boolean,
  isEdit: boolean,
): Omit<T, "published"> & { published?: boolean } {
  const { published, ...fields } = form;
  return isEdit && published === initialPublished ? fields : { ...fields, published };
}

export function getGeoCmsDisplayState(routePath: string, published?: boolean): {
  label: string;
  description: string;
  publicHref: string | null;
} {
  if (!isSupportedGeoRoute(routePath)) return {
    label: "Belum terhubung",
    description: "Catatan ini belum terhubung ke tampilan publik. Status simpan tidak mengubah halaman website.",
    publicHref: null,
  };
  return published ? {
    label: "Konten CMS aktif",
    description: "Halaman menampilkan konten CMS pada bagian yang didukung. Informasi bawaan tertentu tetap digunakan.",
    publicHref: routePath,
  } : {
    label: "Konten bawaan aktif",
    description: "Halaman tetap dapat dibuka dengan konten bawaan. Konten CMS tidak ditampilkan.",
    publicHref: routePath,
  };
}

export function getGeoCmsBaselineNotice(routePath: string): string | null {
  if (routePath === "/sundaf-trip") return "Metadata, schema, blok identitas resmi, dan dua FAQ identitas mengikuti versi bawaan website. Judul, CTA, ringkasan, serta blok dan FAQ tambahan dapat diedit; kalimat identitas resmi tetap disertakan pada ringkasan.";
  if (routePath === "/tour-rusia-dari-indonesia" || routePath === "/open-trip-aurora-rusia") return "Ringkasan utama, eyebrow, metadata, schema, CTA, serta blok dan FAQ bawaan mengikuti versi website. CMS dapat mengubah judul dan menambah blok atau FAQ dengan judul atau pertanyaan baru. Mengubah isian bawaan tersebut tidak menggantikan tampilan publik.";
  return null;
}

export function getGeoSaveError(status: number, payload: unknown): string {
  if (status === 401) return "Sesi login berakhir. Buka halaman login di tab lain, lalu coba simpan kembali. Isi formulir tetap ada.";
  if (status === 403) return "Anda belum memiliki izin untuk perubahan ini. Isi formulir tetap ada; hubungi admin untuk memeriksa akses Anda.";
  if (payload && typeof payload === "object" && "error" in payload
    && typeof payload.error === "string" && payload.error.trim()) return payload.error;
  return "Gagal menyimpan konten GEO. Isi formulir tetap ada; silakan coba kembali.";
}
