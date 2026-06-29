export type FaqLink = {
  label: string;
  href: string;
};

export type FaqButton = FaqLink & {
  variant?: "primary" | "secondary" | "outline";
  external?: boolean;
};

export type FaqCta = {
  title: string;
  body: string;
  buttons: FaqButton[];
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string[];
  relatedLinks?: FaqLink[];
};

export type FaqSection = {
  id: string;
  title: string;
  description: string;
  items: FaqItem[];
  cta?: FaqCta;
};

export const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "tentang-sundaf-trip",
    title: "Tentang Sundaf Trip",
    description: "Identitas brand, fokus layanan, dan cara Sundaf Trip membantu traveler Indonesia.",
    items: [
      {
        id: "apa-itu-sundaf-trip",
        question: "Apa itu Sundaf Trip?",
        answer: [
          "Sundaf Trip adalah brand travel dan tour operations yang dioperasikan oleh CV Sundaf Holiday Group. Fokus layanannya mencakup perjalanan internasional terkurasi, group tour, private trip, corporate travel arrangement, dan bantuan persiapan visa untuk traveler Indonesia.",
          "Produk yang ditawarkan dapat mencakup Rusia, Asia Tengah, trip aurora, dan destinasi internasional lain yang dinilai siap secara operasional.",
        ],
        relatedLinks: [
          { label: "Profil Sundaf Trip", href: "/sundaf-trip" },
          { label: "Paket tour luar negeri", href: "/tours" },
        ],
      },
      {
        id: "pembeda-sundaf-trip",
        question: "Apa yang membedakan Sundaf Trip dari agen wisata lain?",
        answer: [
          "Sundaf Trip menekankan kurasi destinasi, koordinasi perjalanan yang praktis, dukungan dokumen, persiapan sebelum berangkat, dan komunikasi yang jelas sebelum peserta mengambil keputusan booking.",
          "Pendekatannya bukan sekadar menjual itinerary. Tim membantu calon peserta memahami format perjalanan, risiko yang perlu diperhatikan, dokumen yang harus disiapkan, dan batasan operasional yang mungkin berlaku di setiap destinasi.",
        ],
        relatedLinks: [
          { label: "Legalitas & Keamanan", href: "/legalitas-dan-keamanan" },
          { label: "Review peserta", href: "/reviews" },
        ],
      },
      {
        id: "hanya-paket-rusia",
        question: "Apakah Sundaf Trip hanya menjual paket Rusia?",
        answer: [
          "Rusia, Asia Tengah, trip aurora, dan layanan visa adalah fokus penting Sundaf Trip. Namun, Sundaf Trip juga dapat menawarkan produk perjalanan internasional lain sesuai musim, ketersediaan supplier, kesiapan operasional, dan kebutuhan calon peserta.",
          "Daftar paket dapat berubah mengikuti periode perjalanan dan kesiapan produk. Calon peserta sebaiknya mengecek halaman paket atau bertanya ke admin resmi untuk ketersediaan terbaru.",
        ],
        relatedLinks: [
          { label: "Lihat paket tour", href: "/tours" },
          { label: "Custom trip", href: "/custom-trip" },
        ],
      },
      {
        id: "cocok-pertama-kali-ke-luar-negeri",
        question: "Apakah Sundaf Trip cocok untuk peserta yang baru pertama kali ke luar negeri?",
        answer: [
          "Ya, Sundaf Trip dapat membantu peserta yang baru pertama kali ke luar negeri melalui checklist dokumen, arahan persiapan, briefing itinerary, koordinasi grup, dan pengingat kebutuhan perjalanan.",
          "Peserta tetap perlu membaca detail paket dengan teliti, memahami inclusions dan exclusions, serta menyampaikan kondisi khusus sejak awal, misalnya kebutuhan makanan, mobilitas, status paspor, atau riwayat visa.",
        ],
        relatedLinks: [
          { label: "Bantuan visa", href: "/visa" },
          { label: "Kontak resmi", href: "/#contact" },
        ],
      },
    ],
  },
  {
    id: "legalitas-keamanan",
    title: "Legalitas & Keamanan",
    description: "Cara memeriksa identitas bisnis, channel resmi, pembayaran, dan batasan keamanan perjalanan.",
    cta: {
      title: "Masih ingin memastikan legalitas dan keamanan transaksi?",
      body: "Cek identitas usaha dan gunakan hanya channel resmi sebelum transfer atau mengirim dokumen pribadi.",
      buttons: [
        { label: "Lihat Legalitas & Keamanan", href: "/legalitas-dan-keamanan", variant: "primary" },
        { label: "Chat WhatsApp Resmi", href: "WHATSAPP", variant: "outline", external: true },
      ],
    },
    items: [
      {
        id: "legalitas-resmi",
        question: "Apakah Sundaf Trip terdaftar resmi?",
        answer: [
          "Sundaf Trip dioperasikan oleh CV Sundaf Holiday Group. Informasi legalitas usaha, termasuk identitas bisnis dan NIB yang dipublikasikan oleh perusahaan, dapat dicek melalui halaman Legalitas & Keamanan.",
          "Gunakan informasi yang tampil di situs resmi sebagai rujukan awal, lalu hubungi kontak resmi bila membutuhkan konfirmasi sebelum booking atau pembayaran.",
        ],
        relatedLinks: [{ label: "Legalitas & Keamanan", href: "/legalitas-dan-keamanan" }],
      },
      {
        id: "channel-resmi",
        question: "Bagaimana cara memastikan saya bertransaksi dengan channel resmi Sundaf Trip?",
        answer: [
          "Gunakan situs resmi Sundaf Trip, nomor WhatsApp yang tercantum di website, invoice atau konfirmasi tertulis resmi, dan channel pembayaran yang dikonfirmasi oleh tim Sundaf Trip.",
          "Jangan transfer ke rekening yang tidak dikenal, jangan mengikuti instruksi dari kontak yang tidak ada di kanal resmi, dan jangan mengirim dokumen pribadi ke akun yang tidak dapat diverifikasi.",
        ],
        relatedLinks: [
          { label: "Kontak resmi", href: "/#contact" },
          { label: "Legalitas & Keamanan", href: "/legalitas-dan-keamanan" },
        ],
      },
      {
        id: "rekening-resmi",
        question: "Apakah pembayaran dilakukan ke rekening resmi?",
        answer: [
          "Pembayaran hanya boleh dilakukan melalui channel pembayaran resmi yang dikonfirmasi oleh Sundaf Trip. Untuk keamanan transaksi, peserta disarankan mengikuti instruksi pembayaran dari kontak resmi Sundaf Trip dan menyimpan bukti pembayaran.",
          "Jika ada perubahan instruksi pembayaran, minta konfirmasi tertulis dari admin resmi sebelum melakukan transfer.",
        ],
        relatedLinks: [{ label: "Syarat & Ketentuan", href: "/terms" }],
      },
      {
        id: "keamanan-peserta",
        question: "Bagaimana Sundaf Trip menjaga keamanan peserta selama perjalanan?",
        answer: [
          "Sundaf Trip melakukan pengelolaan risiko secara operasional, seperti memantau kondisi destinasi sebelum keberangkatan, berkoordinasi dengan partner lokal, menyusun itinerary yang realistis, dan memberi informasi persiapan kepada peserta.",
          "Selama perjalanan, dukungan dapat mencakup grup WhatsApp, tour leader atau local guide bila termasuk dalam paket, informasi kontak darurat, dan koordinasi bila ada perubahan situasi. Tidak ada perjalanan yang bebas risiko, sehingga peserta tetap perlu mengikuti arahan lapangan dan regulasi setempat.",
        ],
        relatedLinks: [{ label: "Legalitas & Keamanan", href: "/legalitas-dan-keamanan" }],
      },
      {
        id: "keamanan-destinasi",
        question: "Apakah perjalanan ke destinasi seperti Rusia, Asia Tengah, atau aurora aman?",
        answer: [
          "Keamanan perjalanan bergantung pada kondisi destinasi, musim, cuaca, regulasi lokal, jadwal penerbangan, dan travel advisory yang berlaku. Sundaf Trip memantau kesiapan operasional dan dapat menyesuaikan itinerary bila diperlukan.",
          "Sundaf Trip tidak menyatakan destinasi mana pun bebas risiko sepenuhnya. Keputusan perjalanan tetap harus mempertimbangkan kondisi terbaru, dokumen perjalanan, asuransi, dan kesiapan pribadi peserta.",
        ],
        relatedLinks: [
          { label: "Paket tour", href: "/tours" },
          { label: "Syarat & Ketentuan", href: "/terms" },
        ],
      },
    ],
  },
  {
    id: "paket-tour-keberangkatan",
    title: "Paket Tour & Keberangkatan",
    description: "Isi paket, perubahan itinerary, kepastian operasional, dan format grup.",
    items: [
      {
        id: "harga-termasuk",
        question: "Apa saja yang biasanya termasuk dalam harga paket?",
        answer: [
          "Inclusions dapat berbeda untuk setiap paket. Secara umum, harga paket dapat mencakup tiket pesawat, hotel, transportasi, makan sesuai itinerary, tiket masuk objek wisata, tour leader, local guide, dan koordinasi perjalanan bila hal tersebut tertulis di detail paket.",
          "Peserta perlu membaca bagian inclusions di penawaran masing-masing paket sebelum booking, karena tidak semua produk memiliki komponen layanan yang sama.",
        ],
        relatedLinks: [{ label: "Lihat paket tour", href: "/tours" }],
      },
      {
        id: "harga-tidak-termasuk",
        question: "Apa saja yang biasanya tidak termasuk dalam harga paket?",
        answer: [
          "Exclusions dapat mencakup visa, asuransi perjalanan, tips, pengeluaran pribadi, optional tour, kelebihan bagasi, SIM card atau eSIM, laundry, deposit hotel, makan di luar itinerary, dan item lain yang tidak tertulis sebagai inclusions.",
          "Rincian exclusions selalu perlu dibaca pada penawaran paket karena kondisi supplier, destinasi, dan jenis perjalanan dapat berbeda.",
        ],
        relatedLinks: [
          { label: "Bantuan visa", href: "/visa" },
          { label: "Syarat & Ketentuan", href: "/terms" },
        ],
      },
      {
        id: "itinerary-berubah",
        question: "Apakah itinerary bisa berubah?",
        answer: [
          "Ya. Itinerary dapat berubah karena cuaca, jadwal penerbangan, lalu lintas, regulasi lokal, pertimbangan keselamatan, kondisi supplier, jam operasional objek wisata, atau kebutuhan operasional lain.",
          "Jika perubahan diperlukan, Sundaf Trip akan membantu koordinasi dan memprioritaskan kelancaran perjalanan, keselamatan, serta pengalaman peserta dalam batas kondisi yang tersedia.",
        ],
        relatedLinks: [{ label: "Syarat & Ketentuan", href: "/terms" }],
      },
      {
        id: "keberangkatan-berjalan",
        question: "Apakah keberangkatan pasti berjalan?",
        answer: [
          "Sebagian keberangkatan membutuhkan kelayakan operasional, jumlah peserta terkonfirmasi, status ticketing, konfirmasi supplier, kesiapan destinasi, dan batas waktu pembayaran tertentu.",
          "Jika sebuah keberangkatan sudah berstatus confirmed, Sundaf Trip akan menginformasikannya secara resmi kepada peserta. Sebelum status tersebut jelas, calon peserta sebaiknya membaca ketentuan paket dan bertanya ke admin resmi.",
        ],
        relatedLinks: [
          { label: "Lihat paket tour", href: "/tours" },
          { label: "Tanya admin", href: "/#contact" },
        ],
      },
      {
        id: "jumlah-peserta-grup",
        question: "Berapa jumlah peserta dalam satu grup?",
        answer: [
          "Jumlah peserta dapat berbeda untuk setiap keberangkatan, tergantung destinasi, periode perjalanan, jenis paket, ketersediaan operasional, dan jumlah peminat. Beberapa program dapat berjalan dalam format small group, group tour reguler, private trip, atau corporate group.",
          "Detail format grup akan diinformasikan dalam penawaran masing-masing paket sebelum booking.",
        ],
        relatedLinks: [
          { label: "Private trip", href: "/custom-trip" },
          { label: "Corporate & group", href: "/#contact" },
        ],
      },
      {
        id: "private-trip",
        question: "Apakah Sundaf Trip menyediakan private trip?",
        answer: [
          "Ya. Private trip dapat disiapkan bergantung pada destinasi, tanggal perjalanan, jumlah peserta, kelas hotel, kompleksitas rute, kebutuhan transportasi, dan budget.",
          "Untuk private trip, calon peserta sebaiknya mengirim tanggal, jumlah peserta, preferensi hotel, kota keberangkatan, dan kebutuhan khusus agar tim dapat menilai opsi yang realistis.",
        ],
        relatedLinks: [{ label: "Custom trip", href: "/custom-trip" }],
      },
      {
        id: "corporate-trip",
        question: "Apakah tersedia corporate trip atau group incentive?",
        answer: [
          "Ya. Sundaf Trip dapat membantu corporate travel, incentive trip, community trip, family group, delegation trip, dan custom group arrangement sesuai kebutuhan.",
          "Rincian seperti objective perjalanan, jumlah peserta, standar hotel, ruang meeting, kebutuhan transportasi, dan batas budget perlu disampaikan sejak awal agar penawaran lebih akurat.",
        ],
        relatedLinks: [
          { label: "Corporate & group", href: "/#contact" },
          { label: "Diskusi kerja sama", href: "/#contact" },
        ],
      },
    ],
  },
  {
    id: "visa-dokumen",
    title: "Visa & Dokumen",
    description: "Bantuan dokumen, batasan keputusan visa, dan langkah bila visa ditolak.",
    cta: {
      title: "Ragu soal dokumen visa?",
      body: "Cek layanan visa dan FAQ teknis sebelum menentukan jadwal booking atau pembayaran paket.",
      buttons: [
        { label: "Layanan Visa", href: "/visa", variant: "primary" },
        { label: "FAQ Visa", href: "/visa/faq", variant: "secondary" },
        { label: "Konsultasi WhatsApp", href: "WHATSAPP", variant: "outline", external: true },
      ],
    },
    items: [
      {
        id: "bantuan-proses-visa",
        question: "Apakah Sundaf Trip membantu proses visa?",
        answer: [
          "Ya. Sundaf Trip dapat membantu checklist dokumen, arahan pengisian formulir, koordinasi appointment, panduan submission, dan persiapan dokumen perjalanan sesuai destinasi dan jenis visa.",
          "Ruang lingkup bantuan visa dapat berbeda untuk setiap negara. Detail layanan dan biaya akan diinformasikan sebelum proses dimulai.",
        ],
        relatedLinks: [
          { label: "Layanan visa", href: "/visa" },
          { label: "FAQ Visa", href: "/visa/faq" },
        ],
      },
      {
        id: "visa-disetujui",
        question: "Apakah visa pasti disetujui?",
        answer: [
          "Tidak. Keputusan visa sepenuhnya berada pada kedutaan, konsulat, otoritas imigrasi, atau visa center yang berwenang.",
          "Sundaf Trip dapat membantu mempersiapkan dokumen dan memperbaiki konsistensi aplikasi, tetapi tidak dapat menjamin approval visa.",
        ],
        relatedLinks: [{ label: "FAQ Visa", href: "/visa/faq" }],
      },
      {
        id: "visa-ditolak",
        question: "Apa yang terjadi jika visa saya ditolak?",
        answer: [
          "Biaya visa, biaya kedutaan, dan biaya pihak ketiga biasanya tidak dapat dikembalikan setelah diproses. Untuk biaya tour, opsi refund atau reschedule bergantung pada status ticketing, aturan hotel, ketentuan supplier, dan waktu pembatalan.",
          "Sundaf Trip dapat membantu meninjau opsi yang tersedia, tetapi tidak dapat menjamin refund, reschedule, atau perubahan keputusan visa. Peserta juga dapat mempertimbangkan asuransi visa bila tersedia dan sesuai kebutuhan, dengan biaya terpisah.",
        ],
        relatedLinks: [
          { label: "FAQ Visa", href: "/visa/faq" },
          { label: "Syarat & Ketentuan", href: "/terms" },
        ],
      },
      {
        id: "dokumen-visa",
        question: "Dokumen apa saja yang biasanya dibutuhkan untuk visa?",
        answer: [
          "Dokumen umum dapat mencakup paspor yang masih berlaku setidaknya 6 bulan setelah tanggal kepulangan, foto, rekening koran, surat kerja atau dokumen usaha, dokumen keluarga, itinerary perjalanan, reservasi hotel atau penerbangan bila diminta, asuransi bila dipersyaratkan, dan dokumen tambahan sesuai negara tujuan.",
          "Checklist final harus mengikuti aturan destinasi dan jenis visa yang diajukan karena persyaratan dapat berubah.",
        ],
        relatedLinks: [{ label: "Database visa", href: "/visa" }],
      },
      {
        id: "kapan-mulai-visa",
        question: "Kapan sebaiknya mulai proses visa?",
        answer: [
          "Sebagai arahan umum, proses visa sebaiknya dimulai 4 sampai 8 minggu sebelum keberangkatan, tergantung destinasi, musim, ketersediaan appointment, dan estimasi proses kedutaan.",
          "Untuk destinasi yang kompleks, musim ramai, atau profil dokumen yang perlu dirapikan, lebih awal akan lebih aman secara operasional.",
        ],
        relatedLinks: [{ label: "FAQ Visa", href: "/visa/faq" }],
      },
      {
        id: "belum-punya-paspor",
        question: "Apakah Sundaf Trip bisa membantu jika saya belum punya paspor?",
        answer: [
          "Sundaf Trip dapat memberikan arahan persiapan umum, tetapi penerbitan paspor dilakukan oleh kantor imigrasi. Peserta perlu mengurus paspor lebih dulu sebelum proses visa dan booking yang membutuhkan data paspor.",
          "Jika paspor belum tersedia, informasikan sejak awal agar tim dapat menilai apakah timeline perjalanan masih realistis.",
        ],
        relatedLinks: [{ label: "Bantuan visa", href: "/visa" }],
      },
    ],
  },
  {
    id: "pembayaran-deposit-refund",
    title: "Pembayaran, Deposit & Refund",
    description: "Informasi deposit tour, invoice, pelunasan, refund, dan biaya tambahan.",
    cta: {
      title: "Sebelum booking, pastikan Anda memahami detail pembayaran dan ketentuan paket.",
      body: "Baca ketentuan paket, deadline pembayaran, dan konsekuensi pembatalan sebelum membayar deposit.",
      buttons: [
        { label: "Lihat Syarat & Ketentuan", href: "/terms", variant: "primary" },
        { label: "Tanya Admin", href: "WHATSAPP", variant: "outline", external: true },
      ],
    },
    items: [
      {
        id: "deposit-booking",
        question: "Berapa deposit untuk booking?",
        answer: [
          "Jumlah deposit bergantung pada jenis paket, destinasi, musim, deadline ticketing, kebijakan hotel, dan ketentuan supplier. Nominal final akan tertulis dalam penawaran atau invoice.",
          "Calon peserta sebaiknya tidak melakukan pembayaran sebelum menerima informasi paket, nominal, dan channel pembayaran resmi secara jelas.",
        ],
        relatedLinks: [{ label: "Syarat & Ketentuan", href: "/terms" }],
      },
      {
        id: "pelunasan",
        question: "Kapan pelunasan dilakukan?",
        answer: [
          "Deadline pelunasan bergantung pada paket, tanggal keberangkatan, status ticketing, dan ketentuan supplier. Batas akhir pembayaran akan diinformasikan dalam invoice atau konfirmasi booking.",
          "Keterlambatan pelunasan dapat memengaruhi ketersediaan tiket, hotel, atau komponen perjalanan lain sesuai ketentuan paket.",
        ],
        relatedLinks: [{ label: "Syarat & Ketentuan", href: "/terms" }],
      },
      {
        id: "metode-pembayaran",
        question: "Metode pembayaran apa yang diterima?",
        answer: [
          "Pembayaran dilakukan melalui channel pembayaran resmi yang dikonfirmasi oleh Sundaf Trip. Untuk keamanan transaksi, peserta disarankan hanya mengikuti instruksi pembayaran dari kontak resmi Sundaf Trip.",
          "Jika ada metode pembayaran baru atau instruksi berbeda, minta konfirmasi tertulis dari admin resmi sebelum membayar.",
        ],
        relatedLinks: [
          { label: "Kontak resmi", href: "/#contact" },
          { label: "Legalitas & Keamanan", href: "/legalitas-dan-keamanan" },
        ],
      },
      {
        id: "invoice-kuitansi",
        question: "Apakah tersedia invoice atau kuitansi?",
        answer: [
          "Ya. Sundaf Trip dapat memberikan invoice, konfirmasi pembayaran, atau kuitansi untuk transaksi yang sudah terkonfirmasi, sesuai kebutuhan administrasi dan jenis transaksi.",
          "Simpan invoice dan bukti pembayaran karena dokumen tersebut dapat diperlukan untuk pencocokan data booking.",
        ],
        relatedLinks: [{ label: "Syarat & Ketentuan", href: "/terms" }],
      },
      {
        id: "deposit-dikembalikan",
        question: "Apakah deposit bisa dikembalikan?",
        answer: [
          "Pengembalian deposit bergantung pada ketentuan paket, waktu pembatalan, status tiket, hotel, visa, dan biaya pihak ketiga yang sudah diproses. Sebagian biaya dapat bersifat non-refundable setelah booking dikonfirmasi.",
          "Rincian refund harus merujuk pada penawaran, invoice, dan Syarat & Ketentuan yang berlaku untuk paket tersebut.",
        ],
        relatedLinks: [{ label: "Syarat & Ketentuan", href: "/terms" }],
      },
      {
        id: "membatalkan-perjalanan",
        question: "Bagaimana jika saya membatalkan perjalanan?",
        answer: [
          "Ketentuan pembatalan bergantung pada kondisi paket, aturan supplier, aturan maskapai, kebijakan hotel, proses visa, dan tanggal pembatalan.",
          "Hubungi admin resmi secepat mungkin agar tim dapat mengecek status komponen yang sudah diproses dan opsi yang masih tersedia.",
        ],
        relatedLinks: [
          { label: "Syarat & Ketentuan", href: "/terms" },
          { label: "Chat admin", href: "/#contact" },
        ],
      },
      {
        id: "biaya-tambahan",
        question: "Apakah ada biaya tambahan di luar paket?",
        answer: [
          "Ada biaya tambahan bila item tersebut tertulis sebagai exclusions atau muncul sebagai kebutuhan pribadi peserta. Contohnya visa, asuransi, tips, pengeluaran pribadi, optional activities, bagasi tambahan, SIM card atau eSIM, laundry, dan makan di luar itinerary.",
          "Baca inclusions dan exclusions sebelum booking agar estimasi total biaya perjalanan lebih jelas.",
        ],
        relatedLinks: [
          { label: "Paket tour", href: "/tours" },
          { label: "Syarat & Ketentuan", href: "/terms" },
        ],
      },
    ],
  },
  {
    id: "selama-perjalanan",
    title: "Selama Perjalanan",
    description: "Pendampingan, komunikasi, kondisi darurat, internet, cuaca, dan aurora.",
    items: [
      {
        id: "tour-leader",
        question: "Apakah ada tour leader?",
        answer: [
          "Untuk keberangkatan grup, tour leader berbahasa Indonesia dapat termasuk dalam paket tergantung jenis produk dan ketentuan masing-masing keberangkatan.",
          "Pastikan bagian inclusions pada penawaran paket menyebutkan tour leader sebelum menganggap layanan tersebut termasuk.",
        ],
        relatedLinks: [{ label: "Paket tour", href: "/tours" }],
      },
      {
        id: "komunikasi-perjalanan",
        question: "Bagaimana komunikasi sebelum dan selama perjalanan?",
        answer: [
          "Komunikasi biasanya dilakukan melalui WhatsApp group, informasi pre-departure, pengingat dokumen, arahan packing, dan update perjalanan yang relevan.",
          "Format komunikasi dapat berbeda sesuai jenis paket, jumlah peserta, dan kebutuhan operasional.",
        ],
        relatedLinks: [{ label: "Kontak resmi", href: "/#contact" }],
      },
      {
        id: "local-guide",
        question: "Apakah Sundaf Trip menyediakan local guide?",
        answer: [
          "Local guide bergantung pada destinasi dan ketentuan paket. Sebagian program menyertakan local guide, sebagian menggunakan driver-guide, dan sebagian lain memakai koordinasi lokal sesuai kebutuhan rute.",
          "Detailnya akan tertulis pada itinerary atau penawaran paket.",
        ],
        relatedLinks: [{ label: "Paket tour", href: "/tours" }],
      },
      {
        id: "kondisi-darurat",
        question: "Bagaimana jika terjadi kondisi darurat saat perjalanan?",
        answer: [
          "Peserta dapat menghubungi tour leader, partner lokal, hotel, emergency services, atau kontak kedutaan dan konsuler bila situasinya membutuhkan. Sundaf Trip akan membantu koordinasi sesuai kapasitas operasional.",
          "Untuk kondisi medis, hukum, imigrasi, atau keamanan tertentu, keputusan akhir dapat melibatkan otoritas setempat, fasilitas kesehatan, maskapai, asuransi, atau perwakilan diplomatik.",
        ],
        relatedLinks: [
          { label: "Legalitas & Keamanan", href: "/legalitas-dan-keamanan" },
          { label: "Syarat & Ketentuan", href: "/terms" },
        ],
      },
      {
        id: "internet-sim-card",
        question: "Bagaimana dengan internet atau SIM card di destinasi?",
        answer: [
          "Sundaf Trip dapat memberikan rekomendasi SIM card, eSIM, roaming, atau opsi konektivitas lokal sesuai destinasi. Ketersediaan dan kualitas jaringan dapat berbeda antar negara dan kota.",
          "Beberapa negara dapat membatasi aplikasi atau platform tertentu. Tim akan memberi arahan praktis bila hal tersebut relevan untuk destinasi perjalanan.",
        ],
      },
      {
        id: "cuaca-dingin",
        question: "Seberapa dingin cuaca di destinasi aurora atau Rusia?",
        answer: [
          "Suhu bergantung pada musim, kota, dan kondisi cuaca saat keberangkatan. Destinasi musim dingin dan area aurora dapat terasa sangat dingin, terutama saat aktivitas luar ruangan pada malam hari.",
          "Sundaf Trip akan memberi arahan packing lebih dekat ke tanggal keberangkatan berdasarkan rute dan musim paket.",
        ],
        relatedLinks: [{ label: "Trip aurora", href: "/open-trip-aurora-rusia" }],
      },
      {
        id: "aurora-terlihat",
        question: "Apakah aurora pasti terlihat?",
        answer: [
          "Tidak. Aurora adalah fenomena alam yang dipengaruhi cuaca, tutupan awan, aktivitas matahari, cahaya bulan, dan lokasi pengamatan.",
          "Sundaf Trip dapat menyusun rute dan timing menuju area atau musim dengan peluang lebih baik, tetapi kemunculan aurora tidak dapat dijamin.",
        ],
        relatedLinks: [{ label: "Open trip aurora Rusia", href: "/open-trip-aurora-rusia" }],
      },
    ],
  },
  {
    id: "private-corporate-kerja-sama",
    title: "Private Trip, Corporate & Kerja Sama",
    description: "Kebutuhan custom, corporate travel, supplier, dan kerja sama melalui kontak resmi.",
    items: [
      {
        id: "itinerary-custom",
        question: "Apakah Sundaf Trip bisa membuat itinerary custom?",
        answer: [
          "Ya. Itinerary dapat disesuaikan berdasarkan destinasi, tanggal, jumlah peserta, gaya perjalanan, kelas hotel, preferensi makanan, minat belanja, kebutuhan mobilitas, dan budget.",
          "Semakin jelas data awal yang diberikan, semakin realistis penawaran yang dapat disiapkan.",
        ],
        relatedLinks: [{ label: "Custom trip", href: "/custom-trip" }],
      },
      {
        id: "melayani-corporate",
        question: "Apakah Sundaf Trip melayani corporate trip?",
        answer: [
          "Ya. Sundaf Trip dapat membantu company outing, incentive trip, business group, delegation trip, community trip, family group, dan koordinasi perjalanan bergaya MICE bila sesuai kapasitas operasional.",
          "Kebutuhan seperti agenda, standar hotel, ruang meeting, transportasi, dokumentasi, dan approval internal perusahaan perlu disampaikan sejak awal.",
        ],
        relatedLinks: [{ label: "Corporate & group", href: "/#contact" }],
      },
      {
        id: "agent-supplier-kerja-sama",
        question: "Apakah travel agent lain atau supplier bisa bekerja sama dengan Sundaf Trip?",
        answer: [
          "Ya. Sundaf Trip terbuka untuk pembahasan kerja sama agen, DMC, supplier, land arrangement, partnership, dan koordinasi produk perjalanan yang relevan melalui kontak resmi.",
          "Calon partner sebaiknya mengirim profil usaha, coverage destinasi, rate, terms, PIC, dan batasan operasional agar proses review lebih efisien.",
        ],
        relatedLinks: [
          { label: "Kontak resmi", href: "/#contact" },
          { label: "Diskusi kerja sama", href: "/#contact" },
        ],
      },
      {
        id: "request-hotel-maskapai-makanan",
        question: "Apakah bisa request hotel, maskapai, atau makanan tertentu?",
        answer: [
          "Bisa, bergantung pada ketersediaan, budget, rute, regulasi setempat, dan ketentuan supplier. Request sebaiknya disampaikan sejak awal sebelum penawaran difinalkan.",
          "Untuk kebutuhan khusus seperti makanan, mobilitas, anak kecil, lansia, atau kondisi kesehatan, informasikan sejak konsultasi agar tim dapat mengecek kelayakannya.",
        ],
        relatedLinks: [{ label: "Custom trip", href: "/custom-trip" }],
      },
    ],
  },
  {
    id: "bantuan-kontak",
    title: "Bantuan & Kontak",
    description: "Apa yang perlu disiapkan sebelum konsultasi dan ke mana harus menghubungi Sundaf Trip.",
    items: [
      {
        id: "konsultasi-sebelum-booking",
        question: "Bagaimana cara konsultasi sebelum booking?",
        answer: [
          "Hubungi WhatsApp resmi Sundaf Trip atau gunakan halaman kontak di website. Agar admin bisa membantu lebih cepat, kirim destinasi, tanggal perjalanan, jumlah peserta, status paspor, status visa, preferensi kamar, dan kisaran budget.",
          "Untuk paket tertentu, admin dapat mengirim penawaran, itinerary, inclusions, exclusions, deadline pembayaran, dan ketentuan booking yang perlu dibaca sebelum deposit.",
        ],
        relatedLinks: [
          { label: "Kontak resmi", href: "/#contact" },
          { label: "Paket tour", href: "/tours" },
        ],
      },
      {
        id: "konsultasi-berbayar",
        question: "Apakah konsultasi awal berbayar?",
        answer: [
          "Konsultasi awal dapat dilakukan tanpa biaya untuk memahami kebutuhan dasar calon peserta. Namun, penawaran custom yang detail membutuhkan informasi perjalanan yang jelas agar tim tidak memberi estimasi yang menyesatkan.",
          "Untuk pekerjaan khusus, riset rute kompleks, atau pengurusan dokumen tertentu, biaya layanan akan diinformasikan sebelum diproses.",
        ],
        relatedLinks: [{ label: "Custom trip", href: "/custom-trip" }],
      },
      {
        id: "siapkan-sebelum-hubungi-admin",
        question: "Apa yang harus saya siapkan sebelum menghubungi admin?",
        answer: [
          "Siapkan destinasi, estimasi tanggal, jumlah peserta, kota keberangkatan, status paspor, status visa, kelas hotel yang diinginkan, susunan kamar, kebutuhan khusus, dan kisaran budget.",
          "Jika sudah memiliki itinerary referensi atau preferensi maskapai, kirimkan juga agar admin dapat menilai kecocokan rute dan biaya.",
        ],
        relatedLinks: [
          { label: "Paket tour", href: "/tours" },
          { label: "Bantuan visa", href: "/visa" },
        ],
      },
      {
        id: "review-peserta",
        question: "Di mana saya bisa melihat review peserta?",
        answer: [
          "Review dan testimonial yang dipublikasikan dapat dilihat di halaman Review Sundaf Trip. Anda juga dapat mengecek media sosial resmi atau meminta admin mengarahkan ke bukti sosial yang tersedia.",
          "Gunakan review sebagai salah satu pertimbangan, lalu tetap cek detail paket, legalitas, dan channel pembayaran resmi sebelum booking.",
        ],
        relatedLinks: [
          { label: "Review peserta", href: "/reviews" },
          { label: "Legalitas & Keamanan", href: "/legalitas-dan-keamanan" },
        ],
      },
    ],
  },
];

export const FAQ_BOTTOM_CTA: FaqCta = {
  title: "Masih punya pertanyaan sebelum ikut trip?",
  body: "Kirim tujuan, tanggal, jumlah peserta, status paspor, dan budget agar admin bisa memberi arahan yang relevan.",
  buttons: [
    { label: "Chat WhatsApp", href: "WHATSAPP", variant: "primary", external: true },
    { label: "Lihat Paket Tour", href: "/tours", variant: "secondary" },
    { label: "Layanan Visa", href: "/visa", variant: "outline" },
  ],
};

export function faqAnswerText(item: FaqItem) {
  const parts = [...item.answer];
  if (item.relatedLinks?.length) {
    parts.push(`Terkait: ${item.relatedLinks.map((link) => link.label).join(", ")}.`);
  }
  return parts.join("\n\n");
}

export function allFaqItems() {
  return FAQ_SECTIONS.flatMap((section) => section.items);
}
