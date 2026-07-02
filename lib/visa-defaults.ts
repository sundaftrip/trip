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
  countryEnglishName?: string | null;
  region?: string | null;
  stay?: string | null;
  officialFee?: string | null;
  servicePrice?: string | null;
  processTime?: string | null;
  conditions?: string[] | null;
  notes?: string | null;
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
  if (isUnitedStates(ctx)) return unitedStatesVisaFaqs(ctx);
  if (isSchengen(ctx)) return schengenVisaFaqs(ctx);
  if (isCanada(ctx)) return canadaVisaFaqs(ctx);
  if (mentionsBiometrics(ctx)) return biometricVisaFaqs(ctx);
  if (mentionsInterview(ctx)) return interviewVisaFaqs(ctx);

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
      question: `Apakah visa ${ctx.countryName} butuh biometrik, appointment, atau wawancara?`,
      answer:
        "Untuk visa wajib, jangan menganggap prosesnya hanya kirim dokumen. Banyak negara meminta appointment, biometrik, paspor fisik, atau wawancara tambahan sesuai profil pemohon. Tim Sundaf Trip akan cek jalur resmi terbaru sebelum menyarankan jadwal submit dan menyiapkan briefing yang relevan.",
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

function unitedStatesVisaFaqs(ctx: VisaDefaultContext): VisaFaq[] {
  return [
    {
      question: "Apa jalur pengajuan visa Amerika Serikat untuk WNI?",
      answer:
        "Untuk visa visitor B1/B2 Amerika Serikat, pemohon WNI mengisi DS-160, membayar MRV fee, membuat akun/appointment melalui jalur resmi, lalu hadir untuk wawancara di Kedutaan/Konsulat AS. Sundaf Trip membantu review profil, pengisian DS-160, susun dokumen pendukung, dan briefing wawancara; keputusan tetap berada di petugas konsuler.",
    },
    {
      question: "Kapan sebaiknya mulai proses visa Amerika Serikat?",
      answer:
        "Mulai jauh sebelum tanggal berangkat, idealnya 2-3 bulan bila jadwal memungkinkan. Angka proses yang terlihat di paket layanan bukan berarti slot interview selalu tersedia cepat; total timeline tetap dipengaruhi DS-160, pembayaran MRV, ketersediaan appointment, kebutuhan administrasi tambahan, dan pengembalian paspor setelah interview.",
    },
    {
      question: "Apakah visa Amerika Serikat wajib wawancara dan biometrik?",
      answer:
        "Untuk B1/B2, interview biasanya menjadi bagian utama proses, kecuali pemohon masuk kategori waiver yang sangat terbatas. Sidik jari/foto biometrik biasanya diambil dalam proses aplikasi, umumnya saat interview. Karena itu persiapan jawaban, konsistensi data DS-160, dan bukti ikatan ke Indonesia harus disiapkan sebelum jadwal kedutaan.",
    },
    {
      question: "Kalau visa Amerika Serikat ditolak, biaya kembali?",
      answer: rejectionAnswer(ctx),
    },
    {
      question: "Saya pernah ditolak visa, apakah bisa apply ke Amerika Serikat?",
      answer:
        "Bisa, tetapi riwayat penolakan harus dijawab jujur di DS-160. Jangan mengubah cerita hanya supaya terlihat lebih kuat. Yang perlu diperbaiki adalah penyebab penolakan sebelumnya: profil perjalanan, pekerjaan, dana, riwayat kunjungan, tujuan ke AS, dan bukti ikatan pulang ke Indonesia.",
    },
  ];
}

function schengenVisaFaqs(ctx: VisaDefaultContext): VisaFaq[] {
  return [
    {
      question: `Apa jalur pengajuan visa ${ctx.countryName} untuk WNI?`,
      answer: `Untuk ${ctx.countryName}, pemegang paspor Indonesia mengajukan visa Schengen short-stay melalui negara tujuan utama atau negara masuk pertama bila durasi tinggalnya sama. Jalurnya biasanya memakai portal resmi kedutaan/otoritas negara tersebut dan visa application centre yang ditunjuk. Sundaf Trip membantu susun itinerary, formulir, dokumen finansial, asuransi perjalanan, dan arahan appointment.`,
    },
    {
      question: `Kapan sebaiknya mulai proses visa ${ctx.countryName}?`,
      answer:
        "Mulai 6-8 minggu sebelum berangkat lebih aman. Estimasi 1-3 minggu pada paket Schengen biasanya mengacu pada proses setelah submit/biometrik, bukan jaminan slot appointment langsung tersedia. Musim ramai, dokumen tambahan, dan jadwal visa center bisa membuat total timeline lebih panjang.",
    },
    {
      question: `Apakah visa ${ctx.countryName} butuh biometrik atau wawancara?`,
      answer:
        "Untuk visa Schengen, pemohon biasanya perlu hadir pada appointment visa center/kedutaan untuk menyerahkan dokumen dan biometrik sidik jari, terutama jika belum pernah rekam biometrik atau rekaman sebelumnya sudah tidak berlaku. Wawancara formal tidak selalu seperti visa Amerika, tetapi petugas bisa meminta klarifikasi atau dokumen tambahan bila profil perjalanan perlu dijelaskan.",
    },
    {
      question: `Kalau visa ${ctx.countryName} ditolak, biaya kembali?`,
      answer: rejectionAnswer(ctx),
    },
    {
      question: `Saya pernah ditolak visa, apakah bisa apply ke ${ctx.countryName}?`,
      answer:
        "Bisa saja, tetapi penyebab penolakan sebelumnya harus dibaca dulu. Untuk Schengen, alasan seperti tujuan tidak jelas, dana tidak meyakinkan, itinerary lemah, atau keraguan akan pulang perlu diperbaiki sebelum submit lagi. Riwayat reject jangan disembunyikan bila diminta.",
    },
  ];
}

function canadaVisaFaqs(ctx: VisaDefaultContext): VisaFaq[] {
  return [
    {
      question: "Apa jalur pengajuan visa Kanada untuk WNI?",
      answer:
        "Untuk visitor visa Kanada, pengajuan dilakukan melalui akun resmi IRCC. Setelah formulir dan dokumen diunggah, pemohon dapat diminta memberikan biometrik di VAC/VFS. Sundaf Trip membantu review profil, susun dokumen pendukung, pengisian form, dan arahan jadwal biometrik bila instruksi sudah keluar.",
    },
    {
      question: "Kapan sebaiknya mulai proses visa Kanada?",
      answer:
        "Mulai 8-12 minggu sebelum berangkat lebih aman bila ada rencana perjalanan yang sensitif tanggal. Total timeline tidak hanya upload dokumen; ada tahap instruksi biometrik, appointment VAC/VFS, review IRCC, dan kemungkinan permintaan dokumen tambahan.",
    },
    {
      question: "Apakah visa Kanada butuh biometrik atau wawancara?",
      answer:
        "Biometrik biasanya menjadi bagian penting untuk visitor visa Kanada jika pemohon belum memiliki biometrik valid. Wawancara tidak selalu diminta, tetapi IRCC bisa meminta klarifikasi atau dokumen tambahan. Karena itu data perjalanan, dana, pekerjaan, dan sponsor harus konsisten sejak awal.",
    },
    {
      question: "Kalau visa Kanada ditolak, biaya kembali?",
      answer: rejectionAnswer(ctx),
    },
    {
      question: "Saya pernah ditolak visa, apakah bisa apply ke Kanada?",
      answer:
        "Bisa, tetapi alasan penolakan sebelumnya harus diperbaiki. Untuk Kanada, isu yang sering krusial adalah purpose of visit, dana, travel history, employment, family ties, dan konsistensi sponsor. Submit ulang tanpa memperbaiki inti masalah biasanya hanya mengulang risiko reject.",
    },
  ];
}

function biometricVisaFaqs(ctx: VisaDefaultContext): VisaFaq[] {
  return [
    {
      question: `Apa jalur pengajuan visa ${ctx.countryName} untuk WNI?`,
      answer: `Visa ${ctx.countryName} perlu diajukan sebelum berangkat melalui jalur resmi negara tujuan, seperti kedutaan, konsulat, visa center, VAC/VFS, atau sistem online. Data negara ini mencatat kebutuhan biometrik, jadi pemohon harus siap hadir sesuai instruksi resmi bila diminta.`,
    },
    {
      question: `Kapan sebaiknya mulai proses visa ${ctx.countryName}?`,
      answer: processAnswer(ctx, "visa"),
    },
    {
      question: `Apakah visa ${ctx.countryName} butuh biometrik atau wawancara?`,
      answer:
        "Data visa ini menunjukkan biometrik dapat menjadi bagian dari proses. Artinya pemohon mungkin perlu hadir untuk sidik jari/foto di visa center, VAC/VFS, kedutaan, atau titik layanan resmi lain. Wawancara tidak selalu diminta, tetapi petugas bisa meminta klarifikasi bila profil atau dokumen perlu dijelaskan.",
    },
    {
      question: `Kalau visa ${ctx.countryName} ditolak, biaya kembali?`,
      answer: rejectionAnswer(ctx),
    },
    {
      question: `Saya pernah ditolak visa, apakah bisa apply ke ${ctx.countryName}?`,
      answer:
        "Bisa saja, tetapi jangan submit ulang sebelum penyebab reject dibedah. Tim Sundaf Trip akan cek riwayat penolakan, kekuatan dokumen, dana, sponsor, pekerjaan, dan tujuan perjalanan agar pengajuan berikutnya tidak mengulang kelemahan yang sama.",
    },
  ];
}

function interviewVisaFaqs(ctx: VisaDefaultContext): VisaFaq[] {
  return [
    {
      question: `Apa jalur pengajuan visa ${ctx.countryName} untuk WNI?`,
      answer: `Visa ${ctx.countryName} perlu diajukan sebelum berangkat melalui jalur resmi negara tujuan. Data negara ini mencatat unsur wawancara atau interview, jadi persiapan tidak cukup hanya mengumpulkan dokumen; jawaban, tujuan perjalanan, dan bukti ikatan pulang juga perlu disiapkan.`,
    },
    {
      question: `Kapan sebaiknya mulai proses visa ${ctx.countryName}?`,
      answer: processAnswer(ctx, "visa"),
    },
    {
      question: `Apakah visa ${ctx.countryName} butuh appointment atau wawancara?`,
      answer:
        "Ada indikasi wawancara menjadi bagian dari jalur pengajuan negara ini. Sundaf Trip membantu briefing sebelum appointment: dokumen yang dibawa, pertanyaan yang mungkin muncul, cara menjelaskan tujuan perjalanan secara jujur, dan titik risiko yang perlu dijawab konsisten.",
    },
    {
      question: `Kalau visa ${ctx.countryName} ditolak, biaya kembali?`,
      answer: rejectionAnswer(ctx),
    },
    {
      question: `Saya pernah ditolak visa, apakah bisa apply ke ${ctx.countryName}?`,
      answer:
        "Bisa saja, tetapi riwayat penolakan harus dijelaskan dengan jujur bila diminta. Fokusnya bukan menutup cerita lama, melainkan memperbaiki alasan reject dan menyiapkan jawaban yang konsisten dengan dokumen.",
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

function isUnitedStates(ctx: VisaDefaultContext): boolean {
  return normalizedContext(ctx).some((value) =>
    ["amerika serikat", "united states", "b1/b2", "ds-160"].some((needle) => value.includes(needle)),
  );
}

function isCanada(ctx: VisaDefaultContext): boolean {
  return normalizedContext(ctx).some((value) =>
    ["kanada", "canada", "ircc"].some((needle) => value.includes(needle)),
  );
}

function isSchengen(ctx: VisaDefaultContext): boolean {
  return normalizedContext(ctx).some((value) => value.includes("schengen"));
}

function mentionsBiometrics(ctx: VisaDefaultContext): boolean {
  return normalizedContext(ctx).some((value) =>
    ["biometrik", "biometric", "biometrics", "sidik jari", "fingerprint", "fingerprints"].some(
      (needle) => value.includes(needle),
    ),
  );
}

function mentionsInterview(ctx: VisaDefaultContext): boolean {
  return normalizedContext(ctx).some((value) =>
    ["wawancara", "interview"].some((needle) => value.includes(needle)),
  );
}

function normalizedContext(ctx: VisaDefaultContext): string[] {
  return [
    ctx.countryName,
    ctx.countryEnglishName,
    ctx.region,
    ctx.officialFee,
    ctx.notes,
    ...(ctx.conditions ?? []),
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase());
}

function rejectionAnswer(ctx: VisaDefaultContext): string {
  const costs = [
    ctx.officialFee ? `biaya resmi/kedutaan: ${ctx.officialFee}` : null,
    ctx.servicePrice ? `biaya layanan Sundaf: ${ctx.servicePrice}` : null,
  ].filter(Boolean);
  const costNote = costs.length > 0 ? ` Catatan biaya saat ini: ${costs.join("; ")}.` : "";

  return `Biaya kedutaan, biaya visa center, dan biaya pihak ketiga biasanya tidak refundable setelah proses berjalan. Biaya layanan Sundaf juga tidak otomatis kembali karena pekerjaan review dan pengajuan sudah dilakukan.${costNote} Untuk mengurangi risiko finansial, Sundaf Trip menawarkan screening terpisah untuk Asuransi Visa Protection di ${VISA_PROTECTION_PATH}. Manfaat klaim hanya berlaku sesuai polis, bukan jaminan visa disetujui atau semua biaya pasti kembali.`;
}
