export const PERMISSION_LABELS: Record<string, { label: string; section: string }> = {
  tour_create:    { label: "Buat Tour",             section: "Tour" },
  tour_edit:      { label: "Edit Tour",              section: "Tour" },
  tour_delete:    { label: "Hapus Tour",             section: "Tour" },
  tour_status:    { label: "Ubah Status Tour",       section: "Tour" },
  receipt_view:   { label: "Lihat Receipt",          section: "Receipt" },
  receipt_create: { label: "Buat Receipt",           section: "Receipt" },
  receipt_edit:   { label: "Edit Receipt",           section: "Receipt" },
  receipt_delete: { label: "Hapus Receipt",          section: "Receipt" },
  blog_create:    { label: "Buat Post Blog",         section: "Blog" },
  blog_edit:      { label: "Edit Post Blog",         section: "Blog" },
  blog_delete:    { label: "Hapus Post Blog",        section: "Blog" },
  blog_publish:   { label: "Publish/Unpublish Blog", section: "Blog" },
  text_edit:      { label: "Edit Teks Website",      section: "Konten" },
  color_edit:     { label: "Edit Warna & Tema",      section: "Konten" },
  company_edit:   { label: "Edit Info Perusahaan",   section: "Konten" },
  scraper_view:   { label: "Lihat Scraper",          section: "Scraper" },
  scraper_run:    { label: "Jalankan Scraper",       section: "Scraper" },
  scraper_rewrite:{ label: "AI Rewrite Konten",      section: "Scraper" },
  kuotasi_view:   { label: "Lihat Kuotasi",          section: "Kuotasi" },
  kuotasi_create: { label: "Buat Kuotasi",           section: "Kuotasi" },
  kuotasi_edit:   { label: "Edit Kuotasi",           section: "Kuotasi" },
  kuotasi_delete: { label: "Hapus Kuotasi",          section: "Kuotasi" },
};

export const ALL_PERMISSION_KEYS = Object.keys(PERMISSION_LABELS);

export const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  ADMIN: {
    tour_create: true,  tour_edit: true,  tour_delete: true,  tour_status: true,
    receipt_view: true, receipt_create: true, receipt_edit: true, receipt_delete: true,
    blog_create: true,  blog_edit: true,  blog_delete: true,  blog_publish: true,
    text_edit: true,    color_edit: true, company_edit: true,
    scraper_view: true, scraper_run: true, scraper_rewrite: true,
    kuotasi_view: true, kuotasi_create: true, kuotasi_edit: true, kuotasi_delete: true,
  },
  EDITOR: {
    tour_create: false, tour_edit: true,  tour_delete: false, tour_status: false,
    receipt_view: true, receipt_create: true, receipt_edit: true, receipt_delete: false,
    blog_create: true,  blog_edit: true,  blog_delete: false, blog_publish: false,
    text_edit: true,    color_edit: false, company_edit: false,
    scraper_view: true, scraper_run: false, scraper_rewrite: false,
    kuotasi_view: true, kuotasi_create: true, kuotasi_edit: true, kuotasi_delete: false,
  },
};
