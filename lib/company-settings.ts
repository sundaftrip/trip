/* Kunci CompanyInfo yang boleh diubah lewat CMS. Aman untuk client & server. */

export const COMPANY_SETTING_FIELDS: { key: string; label: string; hint?: string }[] = [
  { key: "company_name", label: "Nama brand" },
  { key: "company_legal_name", label: "Nama badan usaha", hint: "Tampil di halaman legalitas, privasi, receipt, dan media kit. Contoh: CV Sundaf Holiday Group." },
  { key: "company_nib", label: "NIB" },
  { key: "company_address", label: "Alamat" },
  { key: "company_phone", label: "Telepon" },
  { key: "company_whatsapp", label: "WhatsApp", hint: "Nomor untuk semua tombol WhatsApp di website, mis. 6281775202759." },
  { key: "company_email", label: "Email" },
  { key: "company_website", label: "Website" },
  { key: "company_description", label: "Deskripsi singkat perusahaan", hint: "Dipakai di media kit." },
  { key: "company_instagram", label: "Instagram", hint: "Username saja, mis. sundaf.trip" },
  { key: "company_tiktok", label: "TikTok", hint: "Username saja, mis. sundaf.trip" },
  { key: "company_youtube", label: "YouTube", hint: "URL channel atau @handle" },
  { key: "company_facebook", label: "Facebook", hint: "URL halaman atau username" },
  { key: "company_twitter", label: "X / Twitter", hint: "Username saja" },
  { key: "company_linkedin", label: "LinkedIn", hint: "URL halaman perusahaan" },
  { key: "company_google_business", label: "Google Business / Maps", hint: "URL profil" },
];

export const ABOUT_SETTING_KEYS = ["about_tagline", "about_story", "about_values", "about_destinations"] as const;

/** Semua kunci yang boleh ditulis lewat PUT /api/settings. */
export const EDITABLE_SETTING_KEYS = new Set<string>([
  ...COMPANY_SETTING_FIELDS.map((field) => field.key),
  "company_logo",
  ...ABOUT_SETTING_KEYS,
]);
