/* Teks beranda yang bisa diubah dari CMS (dibaca CleanHome). Aman untuk client. */
import { HOME_COPY } from "@/lib/home-copy";

export type HomeTextField = {
  key: string;
  label: string;
  hint: string;
  defaultValue: string;
  kind: "text" | "textarea" | "image";
  maxLength: number;
};

export const HOME_TEXT_FIELDS: HomeTextField[] = [
  {
    key: "home_hero_eyebrow",
    label: "Label kecil di atas judul",
    hint: "Huruf kapital pendek, mis. spesialisasi utama.",
    defaultValue: HOME_COPY.heroEyebrow,
    kind: "text",
    maxLength: 80,
  },
  {
    key: "home_hero_title",
    label: "Judul beranda",
    hint: "Satu kalimat pendek, maksimal sekitar 8 kata.",
    defaultValue: HOME_COPY.heroTitle,
    kind: "text",
    maxLength: 90,
  },
  {
    key: "home_hero_body",
    label: "Kalimat pendukung",
    hint: "Satu atau dua kalimat di bawah judul.",
    defaultValue: HOME_COPY.heroBody,
    kind: "textarea",
    maxLength: 260,
  },
  {
    key: "home_hero_image",
    label: "Foto beranda",
    hint: "Foto landscape yang tajam. Kosongkan untuk memakai foto aurora bawaan.",
    defaultValue: "",
    kind: "image",
    maxLength: 500,
  },
  {
    key: "home_hero_image_alt",
    label: "Deskripsi foto",
    hint: "Untuk pembaca layar dan Google, mis. Rombongan Sundaf Trip menyaksikan aurora di Murmansk.",
    defaultValue: "Rombongan Sundaf Trip menyaksikan Aurora di Murmansk",
    kind: "text",
    maxLength: 160,
  },
];

export const HOME_TEXT_KEYS = new Set(HOME_TEXT_FIELDS.map((field) => field.key));
