import { HOME_COPY, LEGACY_HOME_COPY, replaceLegacyHomepageCopy } from "./home-copy";
import { getHomeFaqs } from "./home-faqs";

export type WebsiteTextValue = { id?: string; en?: string };
export type WebsiteTextSection = { section: string; keys: string[]; hint?: string };

// Current public copy, not new marketing claims. Separate active keys keep old
// theme seed values from silently replacing the reviewed Atlas homepage.
export const HOME_TEXT_DEFAULTS: Record<string, string> = {
  home_hero_eyebrow: HOME_COPY.heroEyebrow,
  home_hero_title: HOME_COPY.heroTitle,
  home_hero_body: HOME_COPY.heroBody,
  home_hero_image: "/images/home/murmansk-aurora-group.png",
  home_hero_image_alt: "Rombongan Sundaf Trip menyaksikan Aurora di Murmansk",
  home_benefits_eyebrow: "CARA KERJA SUNDAF",
  home_benefits_title: "Kami urus yang rumit. Kamu nikmati yang penting.",
  home_benefit_1_title: "Visa & dokumen dibantu",
  home_benefit_1_desc: "Kami cek kebutuhan dokumen dan menjelaskan alurnya sebelum pengajuan dimulai.",
  home_benefit_2_title: "Itinerary punya ruang bernapas",
  home_benefit_2_desc: "Rute disusun agar kamu tidak hanya datang, foto, lalu bergegas pindah kota.",
  home_benefit_3_title: "Persiapan dari awal",
  home_benefit_3_desc: "Info keberangkatan, kebutuhan cuaca, dan detail pertemuan dibagikan sebelum hari H.",
  home_benefit_4_title: "Didampingi selama perjalanan",
  home_benefit_4_desc: "Tour leader membantu koordinasi grup, supaya kamu bisa fokus pada pengalaman di perjalanan.",
  home_footer_tagline: "Perjalanan Rusia, Asia Tengah, aurora, dan private trip yang dirancang untuk traveler Indonesia.",
};

export const TEXT_LABELS: Record<string, string> = {
  home_hero_eyebrow: "Label di atas judul",
  home_hero_title: "Judul utama beranda",
  home_hero_body: "Paragraf pembuka",
  home_hero_image: "URL / path gambar utama",
  home_hero_image_alt: "Deskripsi gambar utama",
  home_benefits_eyebrow: "Label bagian cara kerja",
  home_benefits_title: "Judul bagian cara kerja",
  home_footer_tagline: "Deskripsi singkat di footer",
  ...Object.fromEntries([1, 2, 3, 4].flatMap((n) => [[`home_benefit_${n}_title`, `Poin ${n}: judul`], [`home_benefit_${n}_desc`, `Poin ${n}: penjelasan`]])),
  ...Object.fromEntries([1, 2, 3, 4, 5].flatMap((n) => [[`home_faq_${n}_question`, `FAQ ${n}: pertanyaan`], [`home_faq_${n}_answer`, `FAQ ${n}: jawaban`]])),
};

export const ACTIVE_TEXT_SECTIONS: WebsiteTextSection[] = [
  { section: "Beranda: pembuka", keys: ["home_hero_eyebrow", "home_hero_title", "home_hero_body", "home_hero_image", "home_hero_image_alt"], hint: "Tampil di beranda aktif. Gambar memakai path lokal atau URL CDN yang sudah didukung website." },
  { section: "Beranda: cara kerja Sundaf", keys: ["home_benefits_eyebrow", "home_benefits_title", ...[1, 2, 3, 4].flatMap((n) => [`home_benefit_${n}_title`, `home_benefit_${n}_desc`])] },
  { section: "Footer aktif", keys: ["home_footer_tagline"] },
  { section: "FAQ singkat beranda", keys: [1, 2, 3, 4, 5].flatMap((n) => [`home_faq_${n}_question`, `home_faq_${n}_answer`]), hint: "Lima tanya jawab di beranda, terpisah dari halaman /faq. Nilai bawaan tetap mengikuti identitas perusahaan selama jawaban belum diedit." },
  { section: "Halaman kontak", keys: ["contact_title", "contact_desc"] },
  { section: "Pembayaran", keys: ["payment_bank_name", "payment_bank_acc", "payment_bank_holder"] },
];

export const LEGACY_TEXT_SECTIONS: WebsiteTextSection[] = [
  { section: "Arsip tema lama", hint: "Tidak dipakai beranda dan footer Atlas. Disimpan agar konten tema lama tidak hilang.", keys: ["hero_eyebrow", "hero_title", "hero_subtitle", "hero_btn", ...[1, 2, 3, 4].flatMap((n) => [`why_${n}_title`, `why_${n}_desc`]), "footer_tagline"] },
];

export function activeTextValues(existing: Record<string, WebsiteTextValue>, company: Record<string, string> = {}): Record<string, WebsiteTextValue> {
  const result = { ...existing };
  getHomeFaqs(company.company_nib || "1601260060842", company.company_legal_name || "CV Sundaf Holiday Group").forEach((item, index) => {
    for (const field of ["question", "answer"] as const) {
      const key = `home_faq_${index + 1}_${field}`;
      result[key] = { ...existing[key], id: existing[key]?.id?.trim() || item[field] };
    }
  });
  for (const [key, fallback] of Object.entries(HOME_TEXT_DEFAULTS)) {
    const alias = key === "home_hero_body" ? "home_hero_subtitle" : key === "home_hero_image" ? "home_hero_img" : key;
    result[key] = { ...existing[key], id: existing[key]?.id?.trim() || existing[alias]?.id?.trim() || fallback };
  }
  for (const [key, old, current] of [
    ["home_hero_eyebrow", LEGACY_HOME_COPY.heroEyebrow, HOME_COPY.heroEyebrow],
    ["home_hero_title", LEGACY_HOME_COPY.heroTitle, HOME_COPY.heroTitle],
    ["home_hero_body", LEGACY_HOME_COPY.heroBody, HOME_COPY.heroBody],
  ]) {
    result[key] = { ...result[key], id: replaceLegacyHomepageCopy(result[key].id || current, old, current) };
  }
  return result;
}
