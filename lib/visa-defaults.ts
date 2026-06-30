/* Konten default per-kategori visa.
   Dipakai sebagai fallback di /visa/[slug] kalau field eligibility/documents/faqs
   pada CountryVisa masih kosong. Admin bisa override per-negara via CMS.

   Tujuan: setiap halaman detail visa selalu punya konten kaya, tanpa harus
   menulis dari nol untuk 88 negara. */

export type VisaCategory = "bebas" | "voa" | "evisa" | "wajib" | "conditional";

export interface VisaDocument {
  name: string;
  hint?: string;
}

export interface VisaFaq {
  question: string;
  answer: string;
}

export interface VisaDefaults {
  eligibility: string[];
  documents: VisaDocument[];
  faqs: VisaFaq[];
}

export interface VisaDefaultContext {
  category: string;
  countryName: string;
  stay?: string | null;
  officialFee?: string | null;
  servicePrice?: string | null;
  processTime?: string | null;
  conditions?: string[] | null;
}

export const VISA_PROTECTION_PATH = "/visa/asuransi-visa-protection";

const COMMON_PASSPORT: VisaDocument = {
  name: "Paspor",
  hint: "Berlaku min. 6 bulan dari tanggal keberangkatan, halaman kosong min. 2 lembar.",
};

const BEBAS: VisaDefaults = {
  eligibility: [
    "Pemegang paspor Indonesia",
    "Paspor berlaku min. 6 bulan dari tanggal masuk",
    "Tiket pulang terkonfirmasi (return ticket)",
    "Bukti akomodasi selama di sana",
    "Tujuan kunjungan: wisata / kunjungan singkat",
  ],
  documents: [
    COMMON_PASSPORT,
    { name: "Tiket pulang", hint: "Dicetak atau softcopy, petugas imigrasi sering minta." },
    { name: "Booking akomodasi", hint: "Hotel, Airbnb, atau alamat tempat menginap." },
    { name: "Bukti dana (opsional)", hint: "Rekening atau kartu kredit, kadang ditanya petugas." },
  ],
  faqs: [
    {
      question: "Saya tetap perlu lapor ke imigrasi?",
      answer:
        "Tidak ada pengajuan visa, tapi tetap melalui pos imigrasi saat tiba. Pegang dokumen pendukung (paspor, tiket pulang, booking) untuk wawancara singkat.",
    },
    {
      question: "Bisa diperpanjang masa tinggalnya?",
      answer:
        "Tergantung kebijakan negara setempat. Sebagian besar negara bebas visa BISA diperpanjang di kantor imigrasi lokal, sebagian tidak. Hubungi kami untuk panduan negara spesifik.",
    },
    {
      question: "Layanan kalian tetap dibutuhkan?",
      answer:
        "Kalau kamu cuma butuh dokumen pendukung (surat sponsor, itinerary terpercaya, jaminan), kami bantu siapkan. Untuk pengajuan visa: tidak diperlukan karena bebas visa.",
    },
  ],
};

const VOA: VisaDefaults = {
  eligibility: [
    "Pemegang paspor Indonesia",
    "Paspor berlaku min. 6 bulan dari tanggal masuk",
    "Tiket pulang terkonfirmasi",
    "Bukti dana yang cukup selama tinggal",
    "Tidak punya catatan overstay / pelanggaran imigrasi sebelumnya",
  ],
  documents: [
    COMMON_PASSPORT,
    { name: "Pas foto", hint: "Ukuran 4x6 cm, latar putih, terbaru (≤6 bulan)." },
    { name: "Tiket pulang", hint: "Bisa printout atau email." },
    { name: "Booking akomodasi", hint: "Hotel atau Airbnb yang sudah dipesan." },
    { name: "Bukti dana", hint: "Cash USD atau kartu kredit aktif." },
    { name: "Formulir VOA", hint: "Diisi di counter saat tiba, kami bantu siapkan formulirnya." },
  ],
  faqs: [
    {
      question: "Saya bisa diproses langsung di bandara?",
      answer:
        "Ya. Visa diterbitkan saat tiba, tidak perlu apply dari Indonesia. Antrian biasanya 30-90 menit tergantung jam masuk.",
    },
    {
      question: "Apa beda VOA vs e-Visa?",
      answer:
        "VOA: bayar dan dapat visa di counter saat tiba. e-Visa: apply online sebelum berangkat, dapat email dengan barcode/sticker visa. Kalau dua-duanya tersedia, e-Visa lebih cepat lewat imigrasi karena tidak antri di counter.",
    },
    {
      question: "Bisa bayar pakai kartu kredit?",
      answer:
        "Sebagian besar negara terima cash USD/EUR + kartu kredit. Tapi jaga-jaga, siapkan cash USD pas-pas-an untuk biaya VOA + sedikit lebihan untuk transport awal.",
    },
  ],
};

const EVISA: VisaDefaults = {
  eligibility: [
    "Pemegang paspor Indonesia",
    "Paspor berlaku min. 6 bulan dari tanggal masuk",
    "Memiliki email aktif (e-Visa dikirim via email)",
    "Foto digital sesuai spesifikasi negara tujuan",
    "Tujuan kunjungan: wisata, bisnis, atau yang diizinkan jenis e-Visa-nya",
  ],
  documents: [
    { name: "Scan paspor", hint: "Halaman biodata, format JPG/PDF, file ≤2 MB." },
    { name: "Foto digital terbaru", hint: "Latar putih, format JPG, ≤6 bulan terakhir." },
    { name: "Tiket pulang (booking)", hint: "Printout atau softcopy." },
    { name: "Booking akomodasi", hint: "Konfirmasi hotel/Airbnb." },
    { name: "Itinerary perjalanan", hint: "Outline kasar tanggal & destinasi, kami bantu siapkan." },
    {
      name: "Bukti dana (kadang diminta)",
      hint: "Rekening 1-3 bulan terakhir, tergantung negara.",
    },
  ],
  faqs: [
    {
      question: "Berapa lama proses e-Visa?",
      answer:
        "Tergantung negara, paling cepat instan (Singapura tidak butuh visa, Turki dulu instan), umumnya 3-7 hari kerja. Untuk antisipasi, ajukan minimal 2 minggu sebelum keberangkatan.",
    },
    {
      question: "e-Visa harus dicetak?",
      answer:
        "Beberapa negara: ya, cetak hitam putih cukup. Sebagian lain: cukup tunjukkan di HP. Aman: bawa cetakan + softcopy di HP.",
    },
    {
      question: "Kalau visa ditolak, biaya kembali?",
      answer:
        "Biaya kedutaan TIDAK refundable, biaya layanan kami juga tidak (kerjaan sudah dilakukan). Tapi konsultasi awal gratis, kami review dokumen dulu sebelum submit untuk minimalisir penolakan. Kami juga sarankan mempertimbangkan asuransi visa. Pelajari dulu benefitnya; bisa kami siapkan juga bila cocok. Biaya asuransi terpisah.",
    },
  ],
};

const WAJIB: VisaDefaults = {
  eligibility: [
    "Pemegang paspor Indonesia",
    "Paspor berlaku min. 6 bulan dari tanggal masuk",
    "Tujuan kunjungan jelas dan terdokumentasi (turis/bisnis/keluarga)",
    "Bukti dana yang cukup untuk seluruh perjalanan",
    "Tidak punya riwayat overstay atau pelanggaran imigrasi",
    "Tiket pulang & itinerary sudah ditentukan",
  ],
  documents: [
    COMMON_PASSPORT,
    { name: "Pas foto", hint: "Ukuran sesuai standar negara, biasanya 3.5x4.5 cm atau 5x5 cm, latar putih." },
    { name: "Formulir visa", hint: "Diisi lengkap, kami bantu pengisian." },
    { name: "Bukti pekerjaan", hint: "Surat keterangan kerja + slip gaji 3 bulan, atau SIUP untuk pengusaha." },
    { name: "Rekening koran 3 bulan", hint: "Saldo terlihat stabil, bukan deposit mendadak, kami bantu strategi presentasi keuangan yang jujur (surat referensi bank, gabung bukti aset & sponsor)." },
    { name: "Tiket pulang (booking)", hint: "Belum lunas tidak masalah, yang penting ada bukti rencana. Kami bantu pesankan tiket reservasi." },
    { name: "Booking hotel / akomodasi", hint: "Bisa free-cancel di Booking.com kalau belum yakin, kami bantu pesankan." },
    { name: "Itinerary perjalanan", hint: "Outline harian, kami bantu susun yang masuk akal." },
    { name: "Surat sponsor (jika ada)", hint: "Untuk visa kunjungan keluarga atau dibiayai pihak lain." },
  ],
  faqs: [
    {
      question: "Berapa lama proses pengajuan?",
      answer:
        "Tergantung kedutaan, biasanya 2-8 minggu. Untuk negara dengan banyak applicant (Schengen, US, UK, Jepang), pakai slot bulanan. Ajukan minimal 6-8 minggu sebelum keberangkatan.",
    },
    {
      question: "Wawancara wajib?",
      answer:
        "Tergantung negara. US, UK, Schengen sebagian: ya. Korea, Taiwan, Australia: sebagian besar tidak. Kami brief kamu kalau ada wawancara, apa yang akan ditanya, cara jawab yang aman, dan cara berpakaian.",
    },
    {
      question: "Kalau visa ditolak, biaya kembali?",
      answer:
        "Biaya kedutaan TIDAK refundable. Biaya layanan kami juga tidak, kerjaan sudah dilakukan. Tapi kami review dokumen dulu sebelum submit dan kasih estimasi peluang lolos secara jujur. Kalau dokumenmu kurang kuat, kami sarankan jangan submit dulu. Kami juga sarankan mempertimbangkan asuransi visa. Pelajari dulu benefitnya; bisa kami siapkan juga bila cocok. Biaya asuransi terpisah.",
    },
    {
      question: "Saya pernah ditolak negara X, bisa apply ke negara Y?",
      answer:
        "Bisa, tapi WAJIB declare di formulir visa. Kalau dikuping (kedutaan saling tukar info untuk daftar overstay), risiko ditolak lagi besar. Bicara terus-terang ke kami, kami susun strategi.",
    },
  ],
};

const CONDITIONAL: VisaDefaults = {
  eligibility: [
    "Pemegang paspor Indonesia",
    "Memenuhi kondisi khusus yang tertulis di halaman negara",
    "Paspor berlaku min. 6 bulan dari tanggal masuk",
    "Tiket pulang terkonfirmasi",
    "Bukti akomodasi dan dana cukup selama tinggal",
  ],
  documents: [
    COMMON_PASSPORT,
    { name: "Bukti kondisi khusus", hint: "Misalnya e-paspor, visa negara tertentu, atau bukti registrasi waiver." },
    { name: "Tiket pulang", hint: "Dicetak atau softcopy." },
    { name: "Booking akomodasi", hint: "Hotel, Airbnb, atau alamat tempat menginap." },
    { name: "Dokumen pendukung", hint: "Disesuaikan dengan jalur yang dipakai: waiver, e-Visa, ETA, atau visa reguler." },
  ],
  faqs: [
    {
      question: "Apa arti visa bersyarat?",
      answer:
        "Artinya tidak semua WNI memakai jalur yang sama. Sebagian bisa bebas visa, waiver, e-Visa, atau ETA jika memenuhi kondisi tertentu. Jika tidak memenuhi kondisi itu, visa reguler tetap perlu diajukan.",
    },
    {
      question: "Bagaimana cara tahu saya memenuhi syarat?",
      answer:
        "Kirim foto paspor dan riwayat visa/perjalanan yang relevan. Tim kami cek jalur yang paling aman sebelum menyarankan pengajuan.",
    },
    {
      question: "Apakah bisa langsung berangkat tanpa pengajuan?",
      answer:
        "Jangan berangkat sebelum kondisi khususnya jelas. Untuk negara bersyarat, salah memilih jalur bisa membuat boarding ditolak atau ditahan di imigrasi.",
    },
  ],
};

const BY_CATEGORY: Record<VisaCategory, VisaDefaults> = {
  bebas: BEBAS,
  voa: VOA,
  evisa: EVISA,
  wajib: WAJIB,
  conditional: CONDITIONAL,
};

export function visaDefaults(category: string): VisaDefaults {
  if (
    category === "bebas" ||
    category === "voa" ||
    category === "evisa" ||
    category === "wajib" ||
    category === "conditional"
  ) {
    return BY_CATEGORY[category];
  }
  return WAJIB; // fallback paling aman
}

export function visaDefaultsForCountry(ctx: VisaDefaultContext): VisaDefaults {
  const category = normalizeCategory(ctx.category);
  const base = visaDefaults(category);

  return {
    eligibility: base.eligibility,
    documents: base.documents,
    faqs: countryFaqs(category, ctx),
  };
}

function normalizeCategory(category: string): VisaCategory {
  if (
    category === "bebas" ||
    category === "voa" ||
    category === "evisa" ||
    category === "wajib" ||
    category === "conditional"
  ) {
    return category;
  }
  return "wajib";
}

function countryFaqs(category: VisaCategory, ctx: VisaDefaultContext): VisaFaq[] {
  switch (category) {
    case "bebas":
      return bebasVisaFaqs(ctx);
    case "voa":
      return voaFaqs(ctx);
    case "evisa":
      return eVisaFaqs(ctx);
    case "conditional":
      return conditionalFaqs(ctx);
    case "wajib":
    default:
      return wajibVisaFaqs(ctx);
  }
}

function bebasVisaFaqs(ctx: VisaDefaultContext): VisaFaq[] {
  return [
    {
      question: `Apakah WNI perlu mengajukan visa ${ctx.countryName}?`,
      answer: `Untuk kategori saat ini, pemegang paspor Indonesia tidak perlu mengajukan visa sebelum masuk ${ctx.countryName}. Tetap siapkan paspor yang masih berlaku, tiket pulang, bukti akomodasi, dan dana perjalanan karena keputusan masuk terakhir tetap berada di petugas imigrasi.`,
    },
    {
      question: `Berapa lama WNI bisa tinggal di ${ctx.countryName} tanpa visa?`,
      answer: `Batas tinggal yang tercatat di database Sundaf Trip adalah ${ctx.stay || "mengikuti aturan bebas visa terbaru negara tujuan"}. Jangan memakai batas ini untuk overstay; cek ulang sebelum berangkat karena aturan bebas visa bisa berubah.`,
    },
    {
      question: `Kapan Sundaf Trip tetap bisa membantu perjalanan ke ${ctx.countryName}?`,
      answer:
        "Bantuan kami relevan untuk itinerary, booking akomodasi, tiket, asuransi perjalanan, dan dokumen pendukung yang sering diminta saat pemeriksaan imigrasi. Untuk kategori bebas visa, tidak ada pengajuan visa yang perlu kami proses.",
    },
  ];
}

function voaFaqs(ctx: VisaDefaultContext): VisaFaq[] {
  return [
    {
      question: `Apakah visa ${ctx.countryName} bisa diurus saat tiba?`,
      answer: `Untuk kategori Visa on Arrival, proses visa dilakukan saat tiba di bandara atau pintu masuk yang ditunjuk. Masa tinggal yang tercatat adalah ${ctx.stay || "mengikuti izin yang diberikan petugas"}. Siapkan paspor, tiket pulang, bukti akomodasi, dan metode pembayaran biaya VOA bila diminta.`,
    },
    {
      question: `Apa risiko Visa on Arrival ${ctx.countryName}?`,
      answer:
        "Risikonya berbeda dari e-Visa. Hambatan biasanya terjadi di counter kedatangan: antrean panjang, dokumen pendukung kurang, metode pembayaran tidak diterima, atau petugas meminta klarifikasi tujuan perjalanan. Karena itu dokumen pendukung tetap perlu rapi meski visanya diurus saat tiba.",
    },
    {
      question: `Apakah Visa Protection relevan untuk ${ctx.countryName}?`,
      answer:
        "Visa Protection biasanya paling relevan untuk negara yang memerlukan pengajuan visa sebelum berangkat. Untuk VOA, perlindungan yang lebih sering dibutuhkan adalah asuransi perjalanan biasa, kecuali produk tertentu secara tertulis mencakup risiko visa atau penolakan masuk. Sundaf Trip dapat bantu cek polis sebelum kamu membeli.",
    },
  ];
}

function eVisaFaqs(ctx: VisaDefaultContext): VisaFaq[] {
  return [
    {
      question: `Apakah e-Visa ${ctx.countryName} diajukan sebelum berangkat?`,
      answer: `Ya. Untuk kategori e-Visa, pengajuan ${ctx.countryName} dilakukan online sebelum keberangkatan. Traveler biasanya perlu scan paspor, foto digital, data perjalanan, dan dokumen pendukung sesuai aturan negara tujuan.`,
    },
    {
      question: `Berapa lama proses e-Visa ${ctx.countryName}?`,
      answer: processAnswer(ctx, "e-Visa"),
    },
    {
      question: `Kalau e-Visa ${ctx.countryName} ditolak, biaya kembali?`,
      answer: rejectionAnswer(ctx),
    },
    {
      question: `Apakah semua penolakan e-Visa ${ctx.countryName} bisa diklaim ke asuransi?`,
      answer:
        "Tidak. Visa Protection hanya berlaku jika manfaat itu tertulis di polis, dibeli sebelum pengajuan, alasan penolakan memenuhi syarat, dan dokumen klaim lengkap. Klaim juga bisa gugur jika ada data palsu, dokumen tidak konsisten, pengajuan terlambat, atau alasan penolakan termasuk pengecualian polis.",
    },
  ];
}

function wajibVisaFaqs(ctx: VisaDefaultContext): VisaFaq[] {
  return [
    {
      question: `Apa jalur pengajuan visa ${ctx.countryName} untuk WNI?`,
      answer: `Untuk kategori visa wajib, pemegang paspor Indonesia perlu mengajukan visa ${ctx.countryName} sebelum berangkat. Jalurnya bisa melalui kedutaan, konsulat, visa center resmi, atau sistem online tergantung aturan negara tujuan. Sundaf Trip membantu review dokumen, formulir, itinerary, appointment bila diperlukan, dan briefing risiko.`,
    },
    {
      question: `Kapan sebaiknya mulai proses visa ${ctx.countryName}?`,
      answer: processAnswer(ctx, "visa"),
    },
    {
      question: `Apakah visa ${ctx.countryName} butuh appointment atau wawancara?`,
      answer:
        "Tergantung negara, jenis visa, dan profil pemohon. Sebagian visa hanya perlu dokumen, sebagian meminta biometrik, appointment, atau wawancara. Tim Sundaf Trip akan cek jalur terbaru sebelum menyarankan jadwal submit.",
    },
    {
      question: `Kalau visa ${ctx.countryName} ditolak, biaya kembali?`,
      answer: rejectionAnswer(ctx),
    },
    {
      question: `Saya pernah ditolak visa, apakah bisa apply ke ${ctx.countryName}?`,
      answer:
        "Bisa saja, tetapi riwayat penolakan harus dijelaskan dengan jujur bila diminta di formulir. Jangan menutup-nutupi riwayat reject, overstay, atau pelanggaran imigrasi. Strategi terbaik adalah memperbaiki penyebab penolakan sebelumnya sebelum submit lagi.",
    },
  ];
}

function conditionalFaqs(ctx: VisaDefaultContext): VisaFaq[] {
  const conditions = Array.isArray(ctx.conditions) && ctx.conditions.length > 0
    ? ` Kondisi yang sedang tercatat: ${ctx.conditions.join("; ")}.`
    : "";

  return [
    {
      question: `Mengapa aturan visa ${ctx.countryName} disebut bersyarat?`,
      answer: `Artinya tidak semua WNI memakai jalur masuk yang sama. Sebagian traveler bisa memenuhi syarat bebas visa, waiver, ETA, e-Visa, atau visa reguler tergantung paspor, riwayat visa, tujuan perjalanan, dan dokumen pendukung.${conditions}`,
    },
    {
      question: `Bagaimana cara memilih jalur yang aman untuk ${ctx.countryName}?`,
      answer:
        "Kirim foto paspor, rencana tanggal perjalanan, tujuan kunjungan, dan riwayat visa yang relevan. Tim Sundaf Trip akan cek apakah kamu bisa memakai jalur bersyarat atau lebih aman mengajukan visa reguler sebelum berangkat.",
    },
    {
      question: `Apakah Visa Protection relevan untuk ${ctx.countryName}?`,
      answer:
        "Relevan hanya bila jalur yang kamu pakai benar-benar memiliki proses pengajuan visa atau izin masuk yang bisa ditolak sebelum keberangkatan. Jika kamu masuk lewat bebas visa murni, manfaat visa rejection biasanya tidak cocok. Baca halaman Asuransi Visa Protection Sundaf Trip untuk screening awal.",
    },
  ];
}

function processAnswer(ctx: VisaDefaultContext, label: string): string {
  if (ctx.processTime) {
    return `Estimasi proses ${label} ${ctx.countryName} yang terbaca dari database Sundaf Trip adalah ${ctx.processTime}. Tetap mulai lebih awal karena slot appointment, permintaan dokumen tambahan, libur kedutaan, dan musim ramai bisa membuat proses lebih lama.`;
  }

  return `Waktu proses ${label} ${ctx.countryName} bergantung pada aturan negara tujuan, volume pengajuan, kelengkapan dokumen, dan kebutuhan appointment. Untuk visa reguler, mulai 6-8 minggu sebelum berangkat lebih aman; untuk e-Visa, mulai minimal 2 minggu sebelum berangkat bila jadwal memungkinkan.`;
}

function rejectionAnswer(ctx: VisaDefaultContext): string {
  const costs = [
    ctx.officialFee ? `biaya resmi/kedutaan: ${ctx.officialFee}` : null,
    ctx.servicePrice ? `biaya layanan Sundaf: ${ctx.servicePrice}` : null,
  ].filter(Boolean);
  const costNote = costs.length > 0 ? ` Catatan biaya saat ini: ${costs.join("; ")}.` : "";

  return `Biaya kedutaan, biaya visa center, dan biaya pihak ketiga biasanya tidak refundable setelah proses berjalan. Biaya layanan Sundaf juga tidak otomatis kembali karena pekerjaan review dan pengajuan sudah dilakukan.${costNote} Untuk mengurangi risiko finansial, Sundaf Trip menawarkan screening terpisah untuk Asuransi Visa Protection di ${VISA_PROTECTION_PATH}. Manfaat klaim hanya berlaku sesuai polis, bukan jaminan visa disetujui atau semua biaya pasti kembali.`;
}
