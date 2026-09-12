type MetadataTitleAlias = {
  sourceTitle: string;
  metadataTitle: string;
};

// Reviewed metadata alternatives for the September 2026 Bing scan. Stable CMS
// IDs survive slug changes; exact source-title guards defer to future edits.
// Keep these out of visible headings, product names, and structured-data names.
const TITLE_ALIASES: Readonly<Record<string, MetadataTitleAlias>> = {
  "blog:cmtxcr1ly0004habt2k9ref3m": {
    "sourceTitle": "Amerika Latin di Meja Makan: Ceviche, Samba, Kopi, dan Empanada",
    "metadataTitle": "Amerika Latin: Ceviche, Samba, Kopi & Empanada"
  },
  "blog:cmtxci1h10000habtreaeovl8": {
    "sourceTitle": "Mengenal Budaya Rusia: Dari Metro Moskow ke Kanal Saint Petersburg",
    "metadataTitle": "Budaya Rusia: Metro Moskow & Kanal Saint Petersburg"
  },
  "blog:cmr27lowu00008k0hqoc7gz8j": {
    "sourceTitle": "N'Djamena: Kota di Persimpangan Dua Sungai dan Dua Takdir",
    "metadataTitle": "N'Djamena: Pertemuan Sungai dan Sejarah Chad"
  },
  "blog:cmqyca5420000erjtj42ehmqm": {
    "sourceTitle": "Northern Vietnam: Rute Karst, Pasar Etnis, dan Pilihan Transportasi untuk Traveler Indonesia",
    "metadataTitle": "Vietnam Utara: Rute, Pasar Etnis & Transportasi"
  },
  "blog:cmpzz0fmb0002xfpapj2i1znd": {
    "sourceTitle": "Tour Asia Tengah 4 Stan dari Indonesia: Itinerary 11 Hari & Negara Mana yang Wajib Visa",
    "metadataTitle": "Tour Asia Tengah 4 Stan: Itinerary 11 Hari & Visa"
  },
  "blog:cmpzz0f090001xfpafe3guu7g": {
    "sourceTitle": "Open Trip Aurora Rusia dari Indonesia 2026: Itinerary, Biaya All-in, dan Bulan Terbaik",
    "metadataTitle": "Open Trip Aurora Rusia 2026: Itinerary & Biaya"
  },
  "blog:cmpymlsnl00001mcwmfi7vnng": {
    "sourceTitle": "Murmansk: Kota Teratas Dunia yang Nyaris Aku Lewatkan — Cerita Liburan di Atas Lingkar Kutub",
    "metadataTitle": "Murmansk: Cerita Liburan di Lingkar Arktik"
  },
  "blog:cmpwuvwl10002a0f2vszcr7a3": {
    "sourceTitle": "Packing List Musim Dingin Rusia & Arktik: Apa yang Harus Dibawa",
    "metadataTitle": "Packing List Musim Dingin Rusia & Arktik"
  },
  "blog:cmpwuvwcw0001a0f2c40q1iw8": {
    "sourceTitle": "Itinerary 8 Hari Rusia: Moskow – St. Petersburg – Murmansk (Aurora)",
    "metadataTitle": "Rusia 8 Hari: Moskow, St. Petersburg & Murmansk"
  },
  "blog:cmpwuvvtw0000a0f2h10xq64a": {
    "sourceTitle": "Visa Rusia untuk WNI 2026: e-Visa vs Visa Tempel, Mana yang Tepat?",
    "metadataTitle": "Visa Rusia WNI 2026: e-Visa vs Visa Tempel"
  },
  "blog:cmpwun3800002q1kzsg13wg3p": {
    "sourceTitle": "Biaya Tour Rusia Aurora dari Indonesia 2026: Komponen & Kisaran",
    "metadataTitle": "Biaya Tour Rusia Aurora 2026: Komponen & Kisaran"
  },
  "blog:cmpwun30a0001q1kzmchprnac": {
    "sourceTitle": "Murmansk: Kota Aurora di Rusia, Kenapa Dipilih & Apa yang Bisa Dilakukan",
    "metadataTitle": "Murmansk: Wisata Kota & Aurora Rusia"
  },
  "blog:cmpwun2k90000q1kzduy5qjaa": {
    "sourceTitle": "Kapan Waktu Terbaik Berburu Aurora di Rusia? Panduan Bulan & Peluang",
    "metadataTitle": "Waktu Terbaik Berburu Aurora di Rusia"
  },
  "blog:cmphlb7fd0000brpism7wzbu6": {
    "sourceTitle": "Saint Petersburg: Istana, Kanal, dan Malam Putih yang Memukau (Cerita Traveler Indonesia yang Tersesat di Hermitage)",
    "metadataTitle": "Saint Petersburg: Istana, Kanal & Malam Putih"
  },
  "blog:cmp42sfka0000v7rl0k43qf9o": {
    "sourceTitle": "Ke Abkhazia Sendirian: Negara yang Tidak Ada di Peta Sebagian Dunia",
    "metadataTitle": "Ke Abkhazia Sendirian: Catatan Perjalanan"
  },
  "blog:cmp2zbpc20000spbcp1jjxjmi": {
    "sourceTitle": "Jejak Kekaisaran Ottoman: Perjalanan Saya Mengerti Kenapa Empir 600 Tahun Ini Mengubah Dunia",
    "metadataTitle": "Jejak Kekaisaran Ottoman: Catatan Perjalanan"
  },
  "blog:cmp2y42jg0004o889sszauwcv": {
    "sourceTitle": "72 Jam di Trans-Siberian: Mengapa Mereka Tidak Pernah Bilang Nama Keretanya",
    "metadataTitle": "72 Jam di Trans-Siberian: Kisah Perjalanan"
  },
  "blog:cmp2y2owx0000o88990gr1ig2": {
    "sourceTitle": "Lintas 27 Negara Tanpa Batas: Kisah Saya Menemukan Keajaiban Uni Eropa",
    "metadataTitle": "Cerita Perjalanan di Uni Eropa"
  },
  "blog:cmp2uupg90004uysg79fayosy": {
    "sourceTitle": "Aktau: Kota Kaspia yang Kejam dan Mempesona, Rupiah Saya Hampir Habis di Sini",
    "metadataTitle": "Aktau: Catatan Perjalanan di Laut Kaspia"
  },
  "blog:cmp2uua0f0000uysgyenykqgf": {
    "sourceTitle": "Danau Kaindy Kazakhstan: Pohon-Pohon Hantu di Tengah Air Biru Turquoise",
    "metadataTitle": "Danau Kaindy Kazakhstan: Pohon di Tengah Air Biru"
  },
  "blog:cmp2u5z0x0000wyh2gwciq9x4": {
    "sourceTitle": "Menunggu Aurora di Tromsø: Malam yang Membuat Kamera Saya Gemetar",
    "metadataTitle": "Menunggu Aurora di Tromsø: Catatan Perjalanan"
  },
  "blog:cmp2q6ecy0000jdaph8x3jv6m": {
    "sourceTitle": "Jejak Kekaisaran Rusia: Dari Istana Winter ke Kota-kota Terpencil yang Masih Bau Sejarah",
    "metadataTitle": "Jejak Kekaisaran Rusia: Dari Istana Winter"
  },
  "tour:cmqe4a4p50003e0z0vwjkpod0": {
    "sourceTitle": "4 Hari 3 Malam Vietnam Utara dengan Pelayaran Harian Teluk Halong",
    "metadataTitle": "Vietnam Utara 4H3M: Pelayaran Harian Teluk Halong"
  },
  "tour:cmqe4a3t20002e0z0hbqw8u24": {
    "sourceTitle": "5 Hari 4 Malam Vietnam Utara dengan Sapa dan Teluk Halong",
    "metadataTitle": "Vietnam Utara 5H4M: Sapa & Teluk Halong"
  },
  "/destinations/murmansk": {
    "sourceTitle": "Wisata Murmansk & Aurora Borealis dari Indonesia, Sundaftrip",
    "metadataTitle": "Wisata Murmansk & Aurora Borealis dari Indonesia"
  },
  "/destinations/teriberka": {
    "sourceTitle": "Wisata Teriberka, Desa di Ujung Dunia & Laut Barents, Sundaftrip",
    "metadataTitle": "Wisata Teriberka: Desa Ujung Dunia & Laut Barents"
  }
};

/** Return an alias only for the same document and unchanged editorial title. */
export function getMetadataTitleAlias(key: string, sourceTitle: string): string | undefined {
  const alias = TITLE_ALIASES[key];
  return alias?.sourceTitle === sourceTitle ? alias.metadataTitle : undefined;
}
