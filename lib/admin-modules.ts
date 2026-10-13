/* Daftar modul CMS untuk menu dan pembatasan akses halaman. Aman untuk client. */

export type AdminModuleKey =
  | "dashboard"
  | "guide"
  | "tours"
  | "visa"
  | "b2b"
  | "inquiries"
  | "receipts"
  | "finance"
  | "blog"
  | "scraper"
  | "geo"
  | "testimonials"
  | "texts"
  | "about"
  | "faq"
  | "terms"
  | "users"
  | "permissions"
  | "logs"
  | "settings";

export type AdminModuleGroup = "Utama" | "Katalog" | "Penjualan" | "Konten" | "Sistem";

export type AdminModule = {
  key: AdminModuleKey;
  href: string;
  label: string;
  group: AdminModuleGroup;
  /** Cukup salah satu izin ini untuk membuka modul. Kosong = semua akun. */
  permissions: readonly string[];
  superadminOnly?: boolean;
  /** Akun demo boleh membuka modul ini dalam mode lihat saja. */
  demoVisible?: boolean;
  /** Modul tanpa entri menu sendiri (dibuka dari modul lain). */
  hiddenInNav?: boolean;
};

const TOUR_KEYS = ["tour_create", "tour_edit", "tour_status", "tour_delete"] as const;

export const ADMIN_MODULES: readonly AdminModule[] = [
  { key: "dashboard", href: "/admin", label: "Dashboard", group: "Utama", permissions: [] },
  { key: "guide", href: "/admin/panduan", label: "Panduan Katalog", group: "Utama", permissions: [] },

  { key: "tours", href: "/admin/tours", label: "Tour", group: "Katalog", permissions: TOUR_KEYS, demoVisible: true },
  { key: "visa", href: "/admin/database-visa", label: "Database Visa", group: "Katalog", permissions: ["visa_edit"], demoVisible: true },
  { key: "b2b", href: "/admin/b2b-catalog", label: "Katalog B2B", group: "Katalog", permissions: ["b2b_catalog_view", "b2b_catalog_edit"] },

  { key: "inquiries", href: "/admin/inquiries", label: "Lead Masuk", group: "Penjualan", permissions: ["inquiry_view", "inquiry_edit"] },
  { key: "receipts", href: "/admin/receipts", label: "Receipt", group: "Penjualan", permissions: ["receipt_view", "receipt_create", "receipt_edit", "receipt_delete"] },
  { key: "finance", href: "/admin/keuangan", label: "Keuangan", group: "Penjualan", permissions: ["finance_view", "finance_edit"] },

  { key: "blog", href: "/admin/blog", label: "Blog", group: "Konten", permissions: ["blog_create", "blog_edit", "blog_delete", "blog_publish"], demoVisible: true },
  { key: "scraper", href: "/admin/scraper", label: "Scraper Blog", group: "Konten", permissions: ["scraper_view", "scraper_run", "scraper_rewrite"], hiddenInNav: true },
  { key: "geo", href: "/admin/geo", label: "Halaman GEO", group: "Konten", permissions: ["geo_create", "geo_edit", "geo_delete", "geo_publish"], demoVisible: true },
  { key: "testimonials", href: "/admin/testimonials", label: "Testimoni", group: "Konten", permissions: ["testimonial_edit"], demoVisible: true },
  { key: "texts", href: "/admin/texts", label: "Teks Beranda", group: "Konten", permissions: ["text_edit"], demoVisible: true },
  { key: "about", href: "/admin/about", label: "Tentang Kami", group: "Konten", permissions: ["company_edit"], demoVisible: true },
  { key: "faq", href: "/admin/faq", label: "FAQ Visa", group: "Konten", permissions: ["text_edit"], demoVisible: true },
  { key: "terms", href: "/admin/terms", label: "Syarat & Ketentuan", group: "Konten", permissions: ["text_edit"], demoVisible: true },

  { key: "users", href: "/admin/users", label: "Pengguna", group: "Sistem", permissions: [], superadminOnly: true },
  { key: "permissions", href: "/admin/permissions", label: "Izin Akses", group: "Sistem", permissions: [], superadminOnly: true },
  { key: "logs", href: "/admin/logs", label: "Log Aktivitas", group: "Sistem", permissions: [], superadminOnly: true },
  { key: "settings", href: "/admin/settings", label: "Pengaturan", group: "Sistem", permissions: [], superadminOnly: true },
];

export const ADMIN_MODULE_GROUPS: readonly AdminModuleGroup[] = ["Utama", "Katalog", "Penjualan", "Konten", "Sistem"];

export type AdminAccessSubject = {
  role: string;
  permissions: Record<string, boolean>;
};

export function getAdminModule(key: AdminModuleKey): AdminModule {
  const found = ADMIN_MODULES.find((module) => module.key === key);
  if (!found) throw new Error(`Unknown admin module: ${key}`);
  return found;
}

export function canOpenAdminModule(module: AdminModule, subject: AdminAccessSubject) {
  if (subject.role === "SUPERADMIN") return true;
  if (module.superadminOnly) return false;
  if (module.permissions.length === 0) return true;
  if (module.permissions.some((key) => subject.permissions[key] === true)) return true;
  return subject.role === "VIEWER" && module.demoVisible === true;
}

/** Modul untuk path admin tertentu (prefix terpanjang menang). */
export function adminModuleForPath(pathname: string): AdminModule | null {
  const matches = ADMIN_MODULES.filter((module) =>
    module.href === "/admin"
      ? pathname === "/admin"
      : pathname === module.href || pathname.startsWith(`${module.href}/`),
  );
  return matches.sort((a, b) => b.href.length - a.href.length)[0] ?? null;
}
