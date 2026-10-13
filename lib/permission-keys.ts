/* Daftar izin CMS. Aman di-import dari client maupun server (tanpa Prisma). */

export const PERMISSION_SECTIONS = [
  "Tour",
  "Lead",
  "Receipt",
  "Keuangan",
  "Blog",
  "GEO",
  "Konten",
  "Visa",
  "B2B",
  "Scraper",
] as const;

export const PERMISSION_LABELS: Record<string, { label: string; section: string }> = {
  tour_create:      { label: "Buat tour baru",                              section: "Tour" },
  tour_edit:        { label: "Edit tour (harga, foto, itinerary, kursi)",    section: "Tour" },
  tour_status:      { label: "Ubah status tour (draft, aktif, penuh, batal)", section: "Tour" },
  tour_delete:      { label: "Hapus tour",                                  section: "Tour" },
  inquiry_view:     { label: "Lihat lead masuk",                            section: "Lead" },
  inquiry_edit:     { label: "Ubah status & hapus lead",                    section: "Lead" },
  receipt_view:     { label: "Lihat receipt",                               section: "Receipt" },
  receipt_create:   { label: "Buat receipt",                                section: "Receipt" },
  receipt_edit:     { label: "Edit receipt",                                section: "Receipt" },
  receipt_delete:   { label: "Hapus receipt",                               section: "Receipt" },
  finance_view:     { label: "Lihat keuangan",                              section: "Keuangan" },
  finance_edit:     { label: "Edit keuangan",                               section: "Keuangan" },
  blog_create:      { label: "Buat artikel",                                section: "Blog" },
  blog_edit:        { label: "Edit artikel",                                section: "Blog" },
  blog_delete:      { label: "Hapus artikel",                               section: "Blog" },
  blog_publish:     { label: "Publish / unpublish artikel",                 section: "Blog" },
  geo_create:       { label: "Buat halaman GEO",                            section: "GEO" },
  geo_edit:         { label: "Edit halaman GEO",                            section: "GEO" },
  geo_delete:       { label: "Hapus halaman GEO",                           section: "GEO" },
  geo_publish:      { label: "Publish / unpublish GEO",                     section: "GEO" },
  text_edit:        { label: "Edit teks beranda, FAQ visa, syarat & ketentuan", section: "Konten" },
  company_edit:     { label: "Edit info perusahaan & halaman Tentang Kami",  section: "Konten" },
  testimonial_edit: { label: "Kelola testimoni",                            section: "Konten" },
  visa_edit:        { label: "Kelola database visa",                        section: "Visa" },
  b2b_catalog_view: { label: "Lihat katalog B2B",                           section: "B2B" },
  b2b_catalog_edit: { label: "Kelola katalog B2B",                          section: "B2B" },
  scraper_view:     { label: "Lihat scraper blog",                          section: "Scraper" },
  scraper_run:      { label: "Jalankan scraper",                            section: "Scraper" },
  scraper_rewrite:  { label: "AI rewrite konten",                           section: "Scraper" },
};

export const ALL_PERMISSION_KEYS = Object.keys(PERMISSION_LABELS);

function only(enabled: readonly string[]): Record<string, boolean> {
  const allowed = new Set(enabled);
  return Object.fromEntries(ALL_PERMISSION_KEYS.map((key) => [key, allowed.has(key)]));
}

export const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  ADMIN: only(ALL_PERMISSION_KEYS),
  // Editor lama: konten + receipt. Status tour tetap butuh izin terpisah.
  EDITOR: only([
    "tour_edit",
    "inquiry_view", "inquiry_edit",
    "receipt_view", "receipt_create", "receipt_edit",
    "blog_create", "blog_edit",
    "geo_create", "geo_edit",
    "text_edit", "testimonial_edit", "visa_edit",
    "scraper_view",
  ]),
  // Akun demo: hanya melihat. Lead (data pelanggan) tidak ikut terlihat.
  VIEWER: only(["receipt_view", "finance_view", "b2b_catalog_view", "scraper_view"]),
};

export type AccessPresetKey = "catalog";

/**
 * Paket izin siap pakai saat membuat akun. "Admin Katalog" untuk tim yang
 * rutin memperbarui katalog: buat & edit tour serta ubah status, tanpa hapus,
 * keuangan, lead, pengguna, atau pengaturan.
 */
export const ACCESS_PRESETS: Record<AccessPresetKey, {
  label: string;
  description: string;
  role: "EDITOR";
  permissions: Record<string, boolean>;
}> = {
  catalog: {
    label: "Admin Katalog",
    description: "Buat & edit tour, harga, foto, itinerary, dan status. Tidak bisa menghapus tour atau membuka keuangan, lead, pengguna, dan pengaturan.",
    role: "EDITOR",
    permissions: only(["tour_create", "tour_edit", "tour_status"]),
  },
};

function isPermissionRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Izin efektif: SUPERADMIN semua; izin tersimpan per akun; lalu default role. */
export function resolvePermissionMap(role: string, stored: unknown): Record<string, boolean> {
  return Object.fromEntries(ALL_PERMISSION_KEYS.map((key) => {
    if (role === "SUPERADMIN") return [key, true];
    if (isPermissionRecord(stored) && Object.hasOwn(stored, key)) return [key, stored[key] === true];
    return [key, DEFAULT_PERMISSIONS[role]?.[key] === true];
  }));
}

/** Mengenali akun yang izinnya persis sama dengan sebuah paket. */
export function detectAccessPreset(role: string, stored: unknown): AccessPresetKey | null {
  for (const [key, preset] of Object.entries(ACCESS_PRESETS) as [AccessPresetKey, (typeof ACCESS_PRESETS)[AccessPresetKey]][]) {
    if (role !== preset.role || !isPermissionRecord(stored)) continue;
    const effective = resolvePermissionMap(role, stored);
    if (ALL_PERMISSION_KEYS.every((permission) => effective[permission] === preset.permissions[permission])) return key;
  }
  return null;
}

export const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
  VIEWER: "Demo (hanya lihat)",
};

export function accessLabel(role: string, stored: unknown) {
  const preset = detectAccessPreset(role, stored);
  if (preset) return ACCESS_PRESETS[preset].label;
  return ROLE_LABELS[role] ?? role;
}
