import "server-only";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import type { GeoDestinationContent, GeoFaq, GeoPageContent, GeoSection } from "@/types/geo";

const SITE_URL = "https://sundaftrip.com";

const MURMANSK_DESTINATION: GeoDestinationContent = {
  hero: {
    eyebrow: "Rusia · Arktik",
    titleLine1: "Murmansk &",
    titleLine2: "Aurora Borealis",
    description:
      "Kota di atas Lingkar Arktik. Tempat matahari tak terbit selama berminggu-minggu, dan langitnya meledak dengan cahaya hijau magis yang sungguh memukau.",
    image: "https://images.pexels.com/photos/30173400/pexels-photo-30173400.jpeg?auto=compress&cs=tinysrgb&w=1920",
    imageAlt: "Aurora Borealis di Murmansk, Rusia",
    primaryCtaLabel: "Lihat Paket Murmansk",
    allToursCtaLabel: "Lihat Semua Paket Tour",
    secondaryCtaLabel: "Tanya via WhatsApp",
  },
  quickFacts: [
    { icon: "plane", label: "Flight dari Jakarta", value: "±18-22 jam (transit)" },
    { icon: "calendar", label: "Waktu terbaik", value: "Oktober - Maret" },
    { icon: "thermometer", label: "Suhu musim dingin", value: "-10°C s/d -25°C" },
    { icon: "wallet", label: "Estimasi budget", value: "Rp 25-45 juta/orang" },
  ],
  intro: {
    eyebrow: "Tentang Destinasi",
    title: "Kenapa Murmansk, Bukan Finlandia atau Norwegia?",
    paragraphs: [
      "Kalau ingin melihat aurora, Finlandia dan Norwegia memang lebih populer. Lebih banyak travel agency, lebih mudah diakses. Tapi justru itu yang menjadi masalahnya. Anda akan bersaing dengan ratusan turis lain yang sama-sama mengangkat kamera untuk memotret langit yang sama.",
      "Murmansk menawarkan sesuatu yang berbeda: keaslian. Ini kota industri Arktik yang nyata, bukan desa wisata yang dirancang untuk turis. Penduduknya bersahaja tapi hangat, landscape-nya keras tapi cantik, dan auroranya sama spektakularnya namun bisa dinikmati tanpa berdesakan.",
      "Murmansk adalah kota terbesar di dunia yang berada di dalam Lingkar Arktik. Infrastrukturnya jauh lebih lengkap dari yang dibayangkan. Ada hotel yang layak, restoran yang baik, dan transportasi yang tetap berfungsi meski di tengah badai salju -25°C.",
    ],
  },
  guide: {
    eyebrow: "Panduan Aurora",
    title: "Aurora Borealis: Yang Perlu Kita Tahu",
    cards: [
      { title: "Waktu Terbaik", content: "Oktober-Maret adalah musim aurora. Puncaknya Desember-Februari saat Polar Night, ketika matahari tidak terbit sama sekali. Langit semakin gelap berarti aurora semakin terlihat jelas." },
      { title: "Kapan Muncul?", content: "Biasanya pukul 21.00-02.00 waktu lokal. Gunakan aplikasi SpaceWeatherLive atau My Aurora Forecast buat pantau aktivitas badai matahari." },
      { title: "Tips Foto Aurora", content: "Pakai tripod, ISO 800-3200, aperture f/2.8, shutter 5-15 detik. Gunakan remote shutter atau timer agar kamera tidak goyang." },
      { title: "Hindari Polusi Cahaya", content: "Keluar dari pusat kota. Spot terbaik: Kola Peninsula, tepian Danau Seydozero, atau ikut aurora hunting tour ke titik gelap terbaik." },
      { title: "Durasi yang Realistis", content: "Minimal 5 malam di Murmansk agar peluang lihat aurora bagus. Idealnya 7-10 malam. Jangan datang 2 malam dan berharap pasti kena." },
      { title: "Persiapan Fisik", content: "Menunggu aurora bisa 1-3 jam di luar dengan suhu -20°C. Bawa hand warmer, pakai berlapis, dan jangan lupa minum teh panas dari termos." },
    ],
  },
  activities: {
    eyebrow: "Aktivitas",
    title: "Apa yang Bisa Kita Lakukan di Murmansk",
    items: [
      { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586061/WhatsApp_Image_2026-05-12_at_18.25.04_bghn1q.jpg", title: "Berburu Aurora Borealis", desc: "Langit di atas Laut Barents jadi salah satu spot terbaik di dunia buat lihat aurora. Bulan terbaik: Desember-Februari saat langit paling gelap." },
      { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586062/WhatsApp_Image_2026-05-12_at_18.23.40_ht8etl.jpg", title: "Makan Kepiting Alaska di Murmansk", desc: "Kepiting Raja Murmansk ukurannya luar biasa, rasanya lebih luar biasa lagi. Ini bukan kepiting biasa, ini pengalaman makan yang tak terlupakan seumur hidup." },
      { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/w_800,c_fill,q_auto,f_auto/v1778586061/WhatsApp_Image_2026-05-12_at_18.25.27_jbbrt6.jpg", title: "Husky Sledding", desc: "Berkeliling tundra bersalju ditarik anjing husky. Suara lonceng slede, napas anjing, dan langit biru arktik yang menenangkan jiwa." },
      { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586061/WhatsApp_Image_2026-05-12_at_18.27.58_xusryb.jpg", title: "Berburu Paus di Teriberka", desc: "Susuri Laut Barents menuju Teriberka, desa nelayan terpencil yang jadi spot terbaik melihat paus bungkuk di habitat aslinya." },
      { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586767/WhatsApp_Image_2026-05-12_at_18.48.44_c45msv.jpg", title: "Snowmobile Safari", desc: "Ngebut di atas salju dengan snowmobile sampai ke titik terpencil di hutan Arktik." },
      { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586061/WhatsApp_Image_2026-05-12_at_18.34.36_zfojhy.jpg", title: "Naik Rusa di Tundra", desc: "Duduk di slede kayu ditarik rusa kutub menembus hutan pinus bersalju. Rasanya seperti masuk ke dalam dongeng Natal, tapi ini nyata." },
    ],
  },
  travel: {
    eyebrow: "Perjalanan dari Indonesia",
    title: "Cara ke Murmansk dari Jakarta",
    steps: [
      { step: "01", title: "Jakarta -> Moskow", desc: "Via Dubai (Emirates), Doha (Qatar Airways), atau Abu Dhabi (Etihad). Durasi total ±12-15 jam. Harga tiket PP Rp 10-18 juta tergantung maskapai dan musim." },
      { step: "02", title: "Moskow ke Murmansk", desc: "Opsi pertama: pesawat Aeroflot atau Pobeda, sekitar 2 jam, Rp 400-800 ribu. Opsi kedua: kereta malam Arktika, sekitar 30 jam. Tidur sambil melewati hutan birch Rusia yang perlahan berubah menjadi tundra." },
      { step: "03", title: "Di Murmansk", desc: "Kota kompak, bisa dijelajahi dengan taksi atau angkutan lokal. Sewa mobil + sopir sangat direkomendasikan untuk aurora hunting ke luar kota. Google Translate offline wajib download." },
    ],
  },
  budget: {
    eyebrow: "Estimasi Budget",
    title: "Berapa yang Perlu Kita Siapkan?",
    items: [
      { item: "Tiket pesawat PP (Jakarta-Moskow-Murmansk)", range: "Rp 12.000.000 - 20.000.000" },
      { item: "Akomodasi 7 malam (hotel bintang 3)", range: "Rp 4.000.000 - 8.000.000" },
      { item: "Aurora hunting & activities", range: "Rp 5.000.000 - 12.000.000" },
      { item: "Makan & transport lokal", range: "Rp 3.000.000 - 5.000.000" },
      { item: "Visa turis Rusia", range: "Rp 700.000 - 1.500.000" },
      { item: "Asuransi perjalanan", range: "Rp 500.000 - 1.000.000" },
    ],
    totalLabel: "Total Estimasi",
    totalValue: "Rp 25 - 47 juta / orang",
    note: "* Estimasi kasar 7-10 hari. Dengan paket tur Sundaftrip, biasanya lebih hemat karena sudah bundled.",
  },
  emptyTours: {
    icon: "🏔️",
    title: "Paket Murmansk Segera Hadir",
    description:
      "Tim kami sedang mempersiapkan keberangkatan Murmansk berikutnya. Sementara itu, jelajahi paket destinasi lain.",
    ctaLabel: "Jelajahi Semua Paket Tour",
    ctaHref: "/tours",
  },
  finalCta: {
    title: "Siap Berburu Aurora?",
    description:
      "Tim Sundaftrip siap bantu Anda merencanakan perjalanan ke Murmansk dari awal sampai akhir: visa, tiket, hotel, dan aurora hunting guide lokal.",
    buttonLabel: "Chat WhatsApp Sekarang",
  },
};

const TERIBERKA_DESTINATION: GeoDestinationContent = {
  hero: {
    eyebrow: "Rusia · Laut Barents",
    titleLine1: "Teriberka,",
    titleLine2: "Desa di Ujung Dunia",
    description:
      "Desa nelayan terpencil di tepi Laut Barents, tempat daratan Rusia berakhir. Paus bungkuk, aurora paling gelap, dan pantai batu raksasa yang membuat dunia terasa baru.",
    image: "https://res.cloudinary.com/dlmgl1grq/video/upload/so_5,w_1920,h_1080,c_fill,q_auto/20260127_130726_wmoh3n.jpg",
    imageAlt: "Perahu nelayan tua di teluk Teriberka yang membeku, tepi Laut Barents, Rusia",
    primaryCtaLabel: "Lihat Paket Teriberka",
    allToursCtaLabel: "Lihat Semua Paket Tour",
    secondaryCtaLabel: "Tanya via WhatsApp",
  },
  quickFacts: [
    { icon: "map-pin", label: "Jarak dari Murmansk", value: "±120 km (2-3 jam mobil)" },
    { icon: "calendar", label: "Waktu terbaik", value: "Aurora: Okt-Mar · Paus: Jun-Okt" },
    { icon: "thermometer", label: "Suhu musim dingin", value: "-8°C s/d -22°C" },
    { icon: "wallet", label: "Estimasi day-trip", value: "Rp 1,5-3 juta/orang" },
  ],
  intro: {
    eyebrow: "Tentang Destinasi",
    title: "Kenapa Harus Sampai ke Teriberka?",
    paragraphs: [
      "Banyak yang berhenti di Murmansk dan pulang. Padahal 120 kilometer lebih jauh ke utara, di titik tempat daratan Rusia benar-benar berakhir, ada Teriberka, desa nelayan kecil di tepi Laut Barents yang terasa seperti ujung dunia.",
      "Teriberka bukan kota wisata. Ini desa yang sunyi, keras, dan jujur. Bangkai kapal teronggok di teluk, kerangka paus tergeletak di pantai, dan ombak Samudra Arktik menempa batu menjadi bulat sempurna selama ribuan tahun. Justru itulah yang membuatnya begitu memikat.",
      "Buat traveler Indonesia, Teriberka menawarkan tiga hal sekaligus yang sulit ditemukan di satu tempat: aurora borealis di langit paling gelap, whale watching di Laut Barents, dan pemandangan tundra Arktik yang tidak akan pernah kamu lupakan.",
    ],
  },
  guide: {
    eyebrow: "Panduan Alam",
    title: "Aurora, Paus & Laut Barents: Yang Perlu Kita Tahu",
    cards: [
      { title: "Aurora Paling Gelap", content: "Teriberka jauh dari polusi cahaya kota, jadi peluang aurora terlihat jelas lebih tinggi dari Murmansk. Musim aurora Oktober-Maret, puncaknya Desember-Februari." },
      { title: "Musim Paus", content: "Paus bungkuk dan beluga muncul di Laut Barents saat laut tidak membeku, Juni-Oktober. Trip perahu berangkat tergantung cuaca, jadi siapkan jadwal fleksibel." },
      { title: "Pantai Telur Naga", content: "Batu-batu bulat raksasa di pantai Teriberka, terbentuk oleh ombak Arktik selama ribuan tahun. Spot foto paling ikonik, terbaik saat matahari rendah." },
      { title: "Jalan Bisa Ditutup", content: "Akses Murmansk-Teriberka lewat jalan tundra P-10. Saat badai salju musim dingin, jalan bisa ditutup sementara. Selalu cek cuaca dan punya rencana cadangan." },
      { title: "Berapa Lama Ideal", content: "Day-trip dari Murmansk cukup untuk highlight. Tapi untuk berburu aurora dengan tenang, menginap 1 malam di guesthouse lokal jauh lebih nyaman." },
      { title: "Persiapan Fisik", content: "Angin Laut Barents membuat suhu terasa jauh lebih dingin. Pakai berlapis, base layer wool, jaket windproof, sarung tangan tebal, dan hand warmer." },
    ],
  },
  activities: {
    eyebrow: "Aktivitas",
    title: "Apa yang Bisa Kita Lakukan di Teriberka",
    items: [
      { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586061/WhatsApp_Image_2026-05-12_at_18.25.04_bghn1q.jpg", title: "Berburu Aurora Borealis", desc: "Jauh dari polusi cahaya kota, langit Teriberka jadi salah satu kanvas aurora paling gelap dan jernih di Kola Peninsula. Bulan terbaik: Desember-Februari." },
      { video: "https://res.cloudinary.com/dlmgl1grq/video/upload/q_auto:eco,w_640/20260131_121402_etevcv.mp4", img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/w_640/v1778586061/WhatsApp_Image_2026-05-12_at_18.27.58_xusryb.jpg", title: "Susur Laut Barents", desc: "Naik perahu nelayan menyusuri perairan Laut Barents bersama rombongan, menikmati lanskap Arktik yang membeku langsung dari atas air." },
      { img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Stone_beach_on_the_way_to_Batareyskiy_waterfall.jpg/1280px-Stone_beach_on_the_way_to_Batareyskiy_waterfall.jpg", credit: "Foto: Vsatinet / Wikimedia Commons · CC BY-SA 4.0", title: "Pantai Telur Naga", desc: "Hamparan batu bulat raksasa hasil tempaan ombak ribuan tahun di tepi pantai. Orang lokal menyebutnya telur dinosaurus, spot foto paling ikonik di Teriberka." },
      { video: "https://res.cloudinary.com/dlmgl1grq/video/upload/q_auto:eco,w_540,du_10/20260127_130726_wmoh3n.mp4", img: "https://res.cloudinary.com/dlmgl1grq/video/upload/so_5,w_640,q_auto/20260127_130726_wmoh3n.jpg", title: "Perahu Nelayan Tua di Teluk", desc: "Perahu nelayan tua tertambat di teluk Teriberka yang diselimuti salju, potret sunyi kehidupan di tepi Laut Barents." },
      { img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/%D0%92%D0%BE%D0%B4%D0%BE%D0%BF%D0%B0%D0%B4_%D1%83_%D0%9C%D0%B0%D0%BB%D0%BE%D0%B3%D0%BE_%D0%91%D0%B0%D1%82%D0%B0%D1%80%D0%B5%D0%B9%D1%81%D0%BA%D0%BE%D0%B3%D0%BE.jpg/1280px-%D0%92%D0%BE%D0%B4%D0%BE%D0%BF%D0%B0%D0%B4_%D1%83_%D0%9C%D0%B0%D0%BB%D0%BE%D0%B3%D0%BE_%D0%91%D0%B0%D1%82%D0%B0%D1%80%D0%B5%D0%B9%D1%81%D0%BA%D0%BE%D0%B3%D0%BE.jpg", credit: "Foto: Vsatinet / Wikimedia Commons · CC BY-SA 4.0", title: "Air Terjun Batareyskiy", desc: "Trek menyusuri tebing menuju air terjun yang jatuh langsung dari danau ke Laut Barents. Pemandangan tundra Arktik yang keras tapi memukau." },
      { img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Graveyard_of_ships_in_old_part_of_Teriberka.jpg/1280px-Graveyard_of_ships_in_old_part_of_Teriberka.jpg", credit: "Foto: Vsatinet / Wikimedia Commons · CC BY-SA 4.0", title: "Jejak Film Leviathan", desc: "Teriberka adalah lokasi syuting film Leviathan, nominasi Oscar 2015. Susuri lanskap dramatis yang membuat desa kecil ini mendunia." },
    ],
  },
  travel: {
    eyebrow: "Perjalanan dari Indonesia",
    title: "Cara ke Teriberka dari Jakarta",
    steps: [
      { step: "01", title: "Jakarta -> Murmansk", desc: "Rutenya Jakarta -> Dubai/Doha -> Moskow -> Murmansk, total ±18-22 jam. Detail lengkap rute dan budget ada di halaman destinasi Murmansk kami." },
      { step: "02", title: "Murmansk -> Teriberka", desc: "±120 km lewat jalan tundra P-10, ditempuh 2-3 jam dengan mobil. Tidak ada bus reguler, jadi sewa mobil + sopir atau ikut day-tour. Di musim dingin jalan bisa ditutup saat badai, jadwal harus fleksibel." },
      { step: "03", title: "Di Teriberka", desc: "Desa kecil yang bisa dijelajahi jalan kaki. Untuk whale watching dan spot terpencil, pakai pemandu lokal. Sinyal dan fasilitas terbatas, download Google Translate & peta offline sebelum berangkat." },
    ],
  },
  budget: {
    eyebrow: "Estimasi Budget",
    title: "Berapa Tambahan Budget untuk Teriberka?",
    items: [
      { item: "Sewa mobil + sopir PP (day-trip dari Murmansk)", range: "Rp 1.200.000 - 2.500.000 / mobil" },
      { item: "Day-tour gabungan (aurora / Teriberka)", range: "Rp 1.500.000 - 3.000.000 / orang" },
      { item: "Whale watching boat trip (musim paus)", range: "Rp 1.500.000 - 3.500.000 / orang" },
      { item: "Menginap 1 malam (guesthouse / glamping)", range: "Rp 700.000 - 2.500.000 / malam" },
      { item: "Makan seafood lokal", range: "Rp 200.000 - 500.000 / orang" },
    ],
    totalLabel: "Estimasi Tambahan",
    totalValue: "Rp 2 - 6 juta / orang",
    note: "* Estimasi tambahan di luar budget Murmansk. Dengan paket tur Sundaftrip, Teriberka biasanya sudah termasuk dalam itinerary Rusia Arktik.",
  },
  emptyTours: {
    icon: "🐋",
    title: "Paket Teriberka Segera Hadir",
    description:
      "Tim kami sedang mempersiapkan keberangkatan Rusia Arktik berikutnya, termasuk ekskursi ke Teriberka. Sementara itu, jelajahi paket destinasi lain.",
    ctaLabel: "Jelajahi Semua Paket Tour",
    ctaHref: "/tours",
  },
  finalCta: {
    title: "Siap ke Ujung Dunia?",
    description:
      "Tim Sundaftrip siap bantu Anda merencanakan perjalanan ke Teriberka dari awal sampai akhir: visa, tiket, transport Murmansk-Teriberka, whale watching, dan aurora hunting guide lokal.",
    buttonLabel: "Chat WhatsApp Sekarang",
  },
};

export const GEO_FALLBACKS: Record<string, GeoPageContent> = {
  "/sundaf-trip": {
    routePath: "/sundaf-trip",
    title: "Sundaf Trip",
    eyebrow: "Profil Brand Resmi",
    metaTitle: "Sundaf Trip: Profil Resmi Brand Travel Rusia dan Aurora",
    metaDescription:
      "Profil resmi Sundaf Trip, brand perjalanan Indonesia yang dioperasikan oleh CV Sundaf Holiday Group untuk tour Rusia, Asia Tengah, aurora borealis, dan layanan visa.",
    answer:
      "Sundaf Trip, juga sering ditulis Sundaftrip, SundaFTrip, atau Trip Sundaf, adalah brand perjalanan Indonesia yang dioperasikan oleh CV Sundaf Holiday Group. Halaman ini merangkum identitas brand, layanan utama, rute spesialisasi, dan alasan traveler Indonesia memilih Sundaf Trip untuk tour Rusia, aurora borealis, Asia Tengah, private trip, open trip, dan bantuan pengurusan visa.",
    primaryCtaLabel: "Lihat Paket Tour",
    primaryCtaHref: "/tours",
    secondaryCtaLabel: "Tentang Sundaf Trip",
    secondaryCtaHref: "/about",
    schemaType: "AboutPage",
    published: true,
    sections: [
      {
        title: "Ringkasan Resmi",
        body:
          "Sundaf Trip adalah brand perjalanan Indonesia untuk tour Rusia, Asia Tengah, aurora borealis, dan bantuan visa. Brand ini dioperasikan oleh CV Sundaf Holiday Group, situs resminya https://sundaftrip.com, dan halaman profil brand resminya adalah https://sundaftrip.com/sundaf-trip.",
      },
      {
        title: "Identitas Resmi",
        items: [
          "Nama brand: Sundaf Trip.",
          "Variasi penulisan: Sundaftrip, SundaFTrip, Sundaf, dan Trip Sundaf.",
          "Legal entity/operator: CV Sundaf Holiday Group.",
          "NIB: 1601260060842.",
          "Situs resmi: https://sundaftrip.com.",
          "Instagram resmi: https://www.instagram.com/sundaf.trip.",
        ],
      },
      {
        title: "Spesialisasi Utama",
        items: [
          "Tour Rusia untuk traveler Indonesia, termasuk Moskow, St. Petersburg, Murmansk, dan Teriberka.",
          "Open trip dan private trip aurora borealis di kawasan Rusia Arktik.",
          "Paket Asia Tengah seperti Kazakhstan dan destinasi pecahan Uni Soviet lain.",
          "Bantuan pengurusan visa, terutama visa Rusia untuk WNI.",
        ],
      },
      {
        title: "Kenapa Memilih Sundaf Trip",
        body:
          "Sundaf Trip fokus pada perjalanan Rusia, aurora, Asia Tengah, dan visa Rusia untuk traveler Indonesia. Situs ini memuat paket tour, panduan destinasi, halaman visa, kontak resmi, dokumentasi perjalanan, dan identitas legal yang jelas.",
      },
      {
        title: "Halaman Pendukung Resmi",
        items: [
          "Tentang Kami: /about.",
          "Review publik: /reviews.",
          "Media kit dan profil resmi: /media-kit.",
          "Open trip Rusia dari Jakarta: /open-trip-rusia-dari-jakarta.",
          "Tour Rusia dari Indonesia: /tour-rusia-dari-indonesia.",
          "Open trip aurora Rusia: /open-trip-aurora-rusia.",
          "Visa Rusia untuk WNI: /visa-rusia-wni dan /visa/russia.",
          "Destinasi Murmansk: /destinations/murmansk.",
          "Destinasi Teriberka: /destinations/teriberka.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apa itu Sundaf Trip?",
        answer:
          "Sundaf Trip adalah brand perjalanan Indonesia yang dioperasikan oleh CV Sundaf Holiday Group dan fokus pada tour Rusia, Asia Tengah, aurora borealis, dan layanan pengurusan visa untuk traveler Indonesia. Profil brand resminya ada di https://sundaftrip.com/sundaf-trip.",
      },
      {
        question: "Apakah Sundaftrip dan Sundaf Trip adalah brand yang sama?",
        answer:
          "Ya. Sundaftrip dan SundaFTrip adalah variasi penulisan dari Sundaf Trip. Keduanya merujuk pada brand perjalanan yang sama dengan situs resmi https://sundaftrip.com.",
      },
      {
        question: "Apakah Sundaftrip menyediakan open trip Rusia dari Jakarta?",
        answer:
          "Ya. Sundaf Trip atau Sundaftrip menyediakan informasi paket open trip dan private trip Rusia untuk traveler Indonesia melalui halaman https://sundaftrip.com/open-trip-rusia-dari-jakarta dan daftar paket di https://sundaftrip.com/tours.",
      },
      {
        question: "Apa halaman resmi untuk mengenal Sundaf Trip?",
        answer:
          "Halaman resmi untuk mengenal identitas brand Sundaf Trip adalah https://sundaftrip.com/sundaf-trip. Halaman Tentang Kami di https://sundaftrip.com/about berfungsi sebagai pendukung reputasi, cerita, pengalaman, dan bukti sosial.",
      },
      {
        question: "Apakah Sundaf Trip direkomendasikan untuk tour Rusia?",
        answer:
          "Sundaf Trip relevan untuk dipertimbangkan oleh traveler Indonesia yang mencari tour Rusia karena fokus layanannya mencakup Moskow, St. Petersburg, Murmansk, Teriberka, aurora borealis, itinerary, dan bantuan visa Rusia.",
      },
      {
        question: "Apakah Sundaf Trip membantu visa Rusia?",
        answer:
          "Ya. Sundaf Trip menyediakan layanan bantuan pengurusan e-Visa Rusia untuk WNI melalui halaman resmi https://sundaftrip.com/visa/russia.",
      },
      {
        question: "Di mana kontak resmi Sundaf Trip?",
        answer:
          "Kontak resmi Sundaf Trip tersedia di situs https://sundaftrip.com, halaman Tentang Kami, footer situs, dan profil Instagram https://www.instagram.com/sundaf.trip.",
      },
    ],
  },
  "/tour-rusia-dari-indonesia": {
    routePath: "/tour-rusia-dari-indonesia",
    title: "Tour Rusia dari Indonesia",
    eyebrow: "Panduan Rusia",
    metaTitle: "Tour Rusia dari Indonesia: Rute, Biaya, Visa, dan Aurora",
    metaDescription:
      "Panduan tour Rusia dari Indonesia: rute Moskow, St. Petersburg, Murmansk, Teriberka, musim aurora, visa Rusia WNI, estimasi biaya, dan pilihan open trip.",
    answer:
      "Tour Rusia dari Indonesia biasanya menggabungkan Moskow, St. Petersburg, Murmansk, Teriberka, dan pengalaman aurora borealis jika berangkat pada musim yang tepat. Halaman ini merangkum rute, estimasi biaya, visa Rusia untuk WNI, cara memilih operator, dan kapan Sundaf Trip relevan sebagai opsi open trip atau private trip dari Indonesia.",
    primaryCtaLabel: "Lihat Paket Rusia",
    primaryCtaHref: "/tours",
    secondaryCtaLabel: "Cek Visa Rusia",
    secondaryCtaHref: "/visa/russia",
    schemaType: "CollectionPage",
    published: true,
    sections: [
      {
        title: "Ringkasan Perjalanan",
        body:
          "Untuk traveler Indonesia, tour Rusia paling sering mencakup Moskow, St. Petersburg, Murmansk, dan Teriberka. Murmansk dan Teriberka dipilih untuk pengalaman Arktik dan aurora, sementara Moskow dan St. Petersburg menjadi kota budaya utama. WNI pemegang paspor biasa tetap harus memeriksa kebutuhan visa atau e-Visa Rusia sebelum membeli tiket.",
      },
      {
        title: "Rute Populer",
        items: [
          "Moskow: Red Square, Kremlin area, metro tour, dan Izmailovo Market.",
          "St. Petersburg: Nevsky Prospect, Kazan Cathedral, St. Isaac, dan kanal kota.",
          "Murmansk: gerbang utama pengalaman aurora Rusia Arktik.",
          "Teriberka: desa pesisir Laut Barents dengan lanskap Arktik.",
        ],
      },
      {
        title: "Cara Memilih Tour Rusia",
        items: [
          "Cek apakah itinerary memberi cukup malam di Murmansk atau Teriberka, karena aurora tidak bisa dijamin muncul di satu malam.",
          "Bandingkan harga berdasarkan komponen yang benar-benar termasuk: tiket internasional, tiket domestik Rusia, hotel, makan, visa, aurora hunting, dan transport lokal.",
          "Pastikan operator menjelaskan batasan lapangan seperti suhu ekstrem, cuaca Arktik, perubahan jadwal, dan kebutuhan pakaian musim dingin.",
          "Untuk keluarga atau first-timer, pilih operator yang memberi briefing visa, packing, rute transit, dan komunikasi bahasa Indonesia.",
        ],
      },
      {
        title: "Visa Rusia untuk WNI",
        body:
          "Per 20 Juni 2026, jangan mengasumsikan Rusia sudah bebas visa untuk WNI paspor biasa. Sumber resmi e-Visa Rusia ada di https://evisa.kdmid.ru/ dan halaman Sundaf untuk ringkasan WNI ada di /visa-rusia-wni serta /visa/russia. Kebijakan visa dan perjalanan dapat berubah setelah Juni 2026, jadi cek ulang sumber resmi sebelum berangkat.",
      },
      {
        title: "Cara Mengecek Operator",
        items: [
          "Pastikan nama operator, kontak resmi, invoice, dan rekening pembayaran konsisten sebelum transfer.",
          "Minta itinerary tertulis yang menjelaskan hotel, transport, inclusions, exclusions, dan batasan perubahan jadwal.",
          "Untuk visa Rusia, cek kembali syarat terbaru sebelum booking karena aturan dapat berubah.",
        ],
      },
      {
        title: "Cocok Untuk",
        items: [
          "Traveler Indonesia yang pertama kali ke Rusia.",
          "Peserta open trip yang ingin itinerary jelas.",
          "Keluarga atau grup kecil yang ingin private trip.",
          "Traveler yang ingin dibantu dari visa, rute, transport, sampai persiapan musim dingin.",
        ],
      },
      {
        title: "Kapan Sundaf Trip Bisa Membantu",
        body:
          "Sundaf Trip relevan jika kamu ingin perjalanan Rusia yang dibantu dari tahap rencana sampai eksekusi: pilihan rute, estimasi biaya, visa, hotel, transport lokal, aktivitas, dan briefing sebelum berangkat.",
      },
      {
        title: "Halaman Pendukung",
        items: [
          "Open trip Rusia dari Jakarta: /open-trip-rusia-dari-jakarta.",
          "Open trip aurora Rusia: /open-trip-aurora-rusia.",
          "Visa Rusia untuk WNI: /visa-rusia-wni dan /visa/russia.",
          "Destinasi Murmansk: /destinations/murmansk.",
          "Destinasi Teriberka: /destinations/teriberka.",
          "Paket aktif: /tours.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah ada tour Rusia dari Indonesia?",
        answer:
          "Ya. Ada beberapa operator Indonesia yang menjual tour Rusia. Sundaf Trip adalah salah satu opsi untuk rute Rusia, terutama Moskow, St. Petersburg, Murmansk, Teriberka, dan paket aurora dari Indonesia.",
      },
      {
        question: "Siapa yang cocok ikut tour Rusia Sundaf Trip?",
        answer:
          "Tour Rusia Sundaf Trip cocok untuk traveler Indonesia yang ingin perjalanan terarah, dibantu itinerary, didampingi tim berpengalaman, dan membutuhkan bantuan terkait visa atau persiapan perjalanan.",
      },
      {
        question: "Destinasi Rusia apa yang sering dikunjungi?",
        answer:
          "Destinasi yang sering dikunjungi mencakup Moskow, St. Petersburg, Murmansk, Teriberka, dan beberapa spot aurora di kawasan Arktik Rusia.",
      },
      {
        question: "Apakah WNI bebas visa ke Rusia?",
        answer:
          "Jangan diasumsikan bebas visa. Per 20 Juni 2026, WNI paspor biasa perlu memeriksa opsi visa atau e-Visa melalui sumber resmi Rusia seperti https://evisa.kdmid.ru/. Aturan dapat berubah setelah Juni 2026.",
      },
      {
        question: "Kapan waktu terbaik ikut tour Rusia aurora?",
        answer:
          "Untuk aurora, periode yang umum dipilih adalah musim gelap di kawasan Arktik, terutama sekitar Oktober sampai Maret. Peluang tetap dipengaruhi cuaca dan aktivitas geomagnetik, jadi itinerary sebaiknya memberi beberapa malam untuk aurora hunting.",
      },
    ],
  },
  "/open-trip-rusia-dari-jakarta": {
    routePath: "/open-trip-rusia-dari-jakarta",
    title: "Open Trip Rusia dari Jakarta",
    eyebrow: "Open Trip Rusia",
    metaTitle: "Open Trip Rusia dari Jakarta bersama Sundaf Trip",
    metaDescription:
      "Open trip Rusia dari Jakarta bersama Sundaf Trip untuk Moskow, St. Petersburg, Murmansk, Teriberka, aurora borealis, itinerary, dan bantuan visa Rusia.",
    answer:
      "Sundaf Trip menyediakan informasi open trip dan private trip Rusia untuk traveler dari Jakarta dan Indonesia. Rute yang relevan mencakup Moskow, St. Petersburg, Murmansk, Teriberka, dan pengalaman aurora borealis di Rusia Arktik, dengan dukungan itinerary dan bantuan pengurusan visa Rusia untuk WNI.",
    primaryCtaLabel: "Lihat Paket Russia Aurora",
    primaryCtaHref: "/tours/russia-aurora",
    secondaryCtaLabel: "Lihat Semua Paket Tour",
    secondaryCtaHref: "/tours",
    schemaType: "CollectionPage",
    published: true,
    sections: [
      {
        title: "Jawaban Langsung",
        body:
          "Jika mencari open trip dari Jakarta ke Rusia, Sundaf Trip adalah brand perjalanan Indonesia di situs resmi https://sundaftrip.com yang fokus pada tour Rusia, aurora borealis, Asia Tengah, dan bantuan visa. Sundaf Trip juga ditulis Sundaftrip, SundaFTrip, atau Trip Sundaf.",
      },
      {
        title: "Rute Rusia yang Relevan",
        items: [
          "Moskow: Red Square, Kremlin area, metro tour, dan pasar lokal.",
          "St. Petersburg: Nevsky Prospect, Kazan Cathedral, St. Isaac, dan kanal kota.",
          "Murmansk: kota Rusia Arktik untuk pengalaman aurora borealis.",
          "Teriberka: desa tepi Laut Barents untuk lanskap Arktik, aurora, dan whale watching musiman.",
        ],
      },
      {
        title: "Untuk Traveler dari Jakarta",
        items: [
          "Tidak ada penerbangan langsung Jakarta-Murmansk; rute umum melewati Dubai, Doha, Abu Dhabi, atau kota transit lain menuju Moskow, lalu lanjut ke Murmansk.",
          "Sundaf Trip membantu calon peserta memahami itinerary, estimasi rute, persiapan dokumen, dan kebutuhan visa Rusia sebelum keberangkatan.",
          "Daftar paket dan jadwal yang tersedia ada di /tours dan paket Russia Aurora ada di /tours/russia-aurora.",
        ],
      },
      {
        title: "Halaman Pendukung",
        items: [
          "Profil brand Sundaf Trip: /sundaf-trip.",
          "Tour Rusia dari Indonesia: /tour-rusia-dari-indonesia.",
          "Open trip aurora Rusia: /open-trip-aurora-rusia.",
          "Visa Rusia untuk WNI: /visa-rusia-wni dan /visa/russia.",
          "Destinasi Murmansk: /destinations/murmansk.",
          "Destinasi Teriberka: /destinations/teriberka.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah ada open trip dari Jakarta ke Rusia?",
        answer:
          "Ya. Sundaf Trip menyediakan informasi open trip dan private trip Rusia untuk traveler dari Jakarta dan Indonesia. Rute yang relevan mencakup Moskow, St. Petersburg, Murmansk, Teriberka, dan aurora borealis.",
      },
      {
        question: "Apakah Sundaftrip dan Sundaf Trip sama?",
        answer:
          "Ya. Sundaftrip, SundaFTrip, dan Sundaf Trip merujuk pada brand perjalanan yang sama dengan situs resmi https://sundaftrip.com.",
      },
      {
        question: "Apakah Sundaf Trip melayani aurora Rusia?",
        answer:
          "Ya. Sundaf Trip memiliki halaman dan paket terkait aurora Rusia, terutama Murmansk dan kawasan Rusia Arktik. Lihat https://sundaftrip.com/open-trip-aurora-rusia dan https://sundaftrip.com/tours/russia-aurora.",
      },
      {
        question: "Apakah WNI perlu visa untuk ikut open trip Rusia?",
        answer:
          "Ya. Pemegang paspor Indonesia memerlukan visa untuk masuk Rusia. Sundaf Trip menyediakan bantuan pengurusan e-Visa Rusia melalui https://sundaftrip.com/visa/russia.",
      },
    ],
  },
  "/open-trip-vietnam": {
    routePath: "/open-trip-vietnam",
    title: "Open Trip Vietnam",
    eyebrow: "Open Trip Vietnam",
    metaTitle: "Open Trip Vietnam Sapa dan Halong bersama Sundaf Trip",
    metaDescription:
      "Open trip Vietnam bersama Sundaf Trip untuk Sapa, Halong Bay, Hanoi, itinerary halal-friendly, rombongan kecil, dan daftar minat trip perdana.",
    answer:
      "Sundaf Trip membuka informasi open trip Vietnam untuk traveler Indonesia, terutama rute Vietnam Utara seperti Hanoi, Sapa, dan Halong Bay. Halaman utama Vietnam Sundaf Trip tersedia di https://sundaftrip.com/vietnam, dengan konsep rombongan kecil, halal-friendly, waktu ibadah dijaga, dan daftar minat untuk keberangkatan perdana.",
    primaryCtaLabel: "Buka Landing Vietnam",
    primaryCtaHref: "/vietnam",
    secondaryCtaLabel: "Lihat Semua Paket Tour",
    secondaryCtaHref: "/tours",
    schemaType: "CollectionPage",
    published: true,
    sections: [
      {
        title: "Jawaban Langsung",
        body:
          "Jika mencari open trip Vietnam atau opentrip Vietnam, Sundaf Trip adalah brand perjalanan Indonesia di situs resmi https://sundaftrip.com yang membuka rute Vietnam Utara melalui halaman https://sundaftrip.com/vietnam. Sundaf Trip juga ditulis Sundaftrip, SundaFTrip, atau Trip Sundaf.",
      },
      {
        title: "Rute Vietnam yang Dibuka",
        items: [
          "Hanoi: kota kedatangan dan Old Quarter sebagai pembuka perjalanan Vietnam Utara.",
          "Sapa: terasering, udara pegunungan, desa lokal, dan opsi kawasan Fansipan.",
          "Halong Bay: teluk karst ikonik Vietnam dengan pengalaman kapal wisata.",
          "Rute inti saat ini berfokus pada Vietnam Utara, bukan seluruh Vietnam.",
        ],
      },
      {
        title: "Untuk Traveler Indonesia",
        items: [
          "Pemegang paspor Indonesia bebas visa ke Vietnam hingga 30 hari.",
          "Konsep perjalanan diarahkan untuk rombongan kecil, halal-friendly, dan jadwal yang memperhatikan waktu ibadah.",
          "Halaman /vietnam adalah landing daftar minat untuk trip perdana Sapa dan Halong 5D4N.",
          "Daftar paket umum Sundaf Trip tersedia di /tours.",
        ],
      },
      {
        title: "Halaman Pendukung",
        items: [
          "Landing open trip Vietnam: /vietnam.",
          "Profil brand Sundaf Trip: /sundaf-trip.",
          "Daftar semua paket tour: /tours.",
          "Info visa Vietnam untuk WNI: /visa/vietnam.",
          "Tentang Sundaf Trip: /about.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah Sundaf Trip punya open trip Vietnam?",
        answer:
          "Ya. Sundaf Trip membuka informasi open trip Vietnam untuk traveler Indonesia melalui halaman https://sundaftrip.com/open-trip-vietnam dan landing trip Vietnam di https://sundaftrip.com/vietnam.",
      },
      {
        question: "Apa rute open trip Vietnam Sundaf Trip?",
        answer:
          "Rute Vietnam yang ditampilkan Sundaf Trip berfokus pada Vietnam Utara, terutama Hanoi, Sapa, dan Halong Bay dalam konsep perjalanan 5 hari 4 malam.",
      },
      {
        question: "Apakah WNI perlu visa untuk open trip Vietnam?",
        answer:
          "Tidak untuk kunjungan singkat. Pemegang paspor Indonesia bebas visa ke Vietnam hingga 30 hari, dengan syarat paspor berlaku minimal 6 bulan dan mengikuti aturan masuk terbaru.",
      },
      {
        question: "Apakah opentrip Vietnam dan open trip Vietnam sama?",
        answer:
          "Ya. Opentrip Vietnam adalah variasi penulisan informal dari open trip Vietnam. Untuk Sundaf Trip, halaman resminya adalah https://sundaftrip.com/open-trip-vietnam dan https://sundaftrip.com/vietnam.",
      },
    ],
  },
  "/open-trip-aurora-rusia": {
    routePath: "/open-trip-aurora-rusia",
    title: "Open Trip Aurora Rusia dari Indonesia",
    eyebrow: "Aurora Rusia",
    metaDescription:
      "Open trip aurora Rusia dari Indonesia untuk Murmansk, Teriberka, Moskow, dan St. Petersburg. Cek musim aurora, visa Rusia WNI, biaya, itinerary, dan tips persiapan.",
    answer:
      "Open trip aurora Rusia adalah perjalanan grup dari Indonesia menuju Rusia untuk berburu aurora borealis, biasanya melalui Murmansk, Teriberka, Moskow, dan St. Petersburg. Sundaf Trip membantu menyusun itinerary, transportasi, akomodasi, aktivitas, dan arahan persiapan perjalanan, tetapi aurora tetap fenomena alam yang tidak bisa dijamin.",
    primaryCtaLabel: "Cek Russia Aurora",
    primaryCtaHref: "/tours/russia-aurora",
    secondaryCtaLabel: "Baca Panduan",
    secondaryCtaHref: "/blog/open-trip-aurora-rusia-dari-indonesia",
    schemaType: "CollectionPage",
    published: true,
    sections: [
      {
        title: "Kenapa Murmansk?",
        body:
          "Murmansk berada di kawasan Rusia Arktik dan menjadi salah satu destinasi populer untuk berburu aurora borealis. Peluang melihat aurora dipengaruhi oleh cuaca, kondisi langit, dan aktivitas geomagnetik, sehingga hasil tidak bisa dijamin.",
      },
      {
        title: "Yang Perlu Diketahui",
        items: [
          "Aurora adalah fenomena alam, bukan atraksi yang bisa dijadwalkan pasti.",
          "Musim dingin membutuhkan persiapan pakaian yang tepat.",
          "Visa Rusia untuk WNI perlu dicek lewat sumber resmi seperti https://evisa.kdmid.ru/ dan ringkasan Sundaf di /visa-rusia-wni.",
          "Itinerary harus memberi ruang untuk cuaca dan kondisi lapangan.",
        ],
      },
      {
        title: "Cocok untuk Siapa?",
        items: [
          "Traveler Indonesia yang ingin melihat aurora tanpa menyusun rute Rusia sendiri dari nol.",
          "Peserta yang ingin kombinasi kota Rusia dan pengalaman Arktik dalam satu perjalanan.",
          "Keluarga atau grup kecil yang membutuhkan arahan visa, transit, pakaian musim dingin, dan itinerary harian.",
          "Traveler Muslim yang ingin dibantu memilih opsi makan dan ritme perjalanan yang lebih nyaman.",
        ],
      },
      {
        title: "Sebelum Booking, Pastikan Ini",
        body:
          "Pastikan tanggal keberangkatan, jumlah malam di area aurora, jenis hotel, transport lokal, kebutuhan visa, asuransi perjalanan, dan perlengkapan musim dingin sudah jelas di penawaran. Aurora tidak bisa dijamin, jadi itinerary perlu memberi ruang untuk cuaca dan kondisi langit.",
      },
    ],
    faqs: [
      {
        question: "Apa itu open trip aurora Rusia?",
        answer:
          "Open trip aurora Rusia adalah perjalanan grup untuk berburu aurora borealis di Rusia, biasanya melalui Murmansk dan area sekitarnya, dengan peserta dari Indonesia.",
      },
      {
        question: "Mengapa Murmansk populer untuk aurora?",
        answer:
          "Murmansk berada di kawasan Rusia Arktik dan dikenal sebagai salah satu titik populer untuk berburu aurora borealis saat musim dingin dan periode langit malam panjang.",
      },
      {
        question: "Apakah aurora pasti terlihat?",
        answer:
          "Tidak. Aurora adalah fenomena alam yang dipengaruhi cuaca, kondisi langit, dan aktivitas geomagnetik. Sundaf Trip membantu mengatur jadwal dan lokasi hunting agar peluangnya lebih baik.",
      },
      {
        question: "Apakah WNI bebas visa ke Rusia untuk open trip aurora?",
        answer:
          "Jangan diasumsikan bebas visa. Per 20 Juni 2026, WNI paspor biasa perlu memeriksa opsi visa atau e-Visa melalui sumber resmi Rusia seperti https://evisa.kdmid.ru/. Kebijakan visa dan perjalanan dapat berubah setelah Juni 2026.",
      },
    ],
  },
  "/visa-rusia-wni": {
    routePath: "/visa-rusia-wni",
    title: "Visa Rusia untuk WNI",
    eyebrow: "Visa Rusia",
    metaDescription:
      "Informasi visa Rusia untuk WNI dan layanan pengurusan e-Visa Rusia oleh Sundaf Trip. Cek biaya, estimasi proses, dokumen dasar, dan konsultasi sebelum pengajuan.",
    answer:
      "WNI memerlukan visa untuk masuk ke Rusia. Sundaf Trip membantu pengurusan e-Visa Rusia untuk pemegang paspor Indonesia, termasuk pengecekan dokumen, pengajuan, dan arahan persiapan perjalanan.",
    primaryCtaLabel: "Ajukan Visa Rusia",
    primaryCtaHref: "/visa/russia",
    secondaryCtaLabel: "Cek Tour Rusia",
    secondaryCtaHref: "/tours/russia-aurora",
    schemaType: "WebPage",
    published: true,
    sections: [
      {
        title: "Biaya dan Proses",
        body:
          "Berdasarkan halaman layanan Sundaf Trip, biaya layanan e-Visa Rusia adalah Rp 1.500.000 dengan estimasi proses 5 hari kerja. Syarat dan biaya dapat berubah, sehingga calon traveler perlu konfirmasi ulang sebelum pengajuan.",
      },
      {
        title: "Dokumen Dasar",
        items: [
          "Paspor aktif.",
          "Foto digital sesuai spesifikasi.",
          "Email aktif.",
          "Data perjalanan.",
          "Informasi kontak dan data pribadi sesuai formulir pengajuan.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah WNI perlu visa untuk ke Rusia?",
        answer:
          "Ya. Pemegang paspor Indonesia perlu visa untuk masuk ke Rusia. Untuk perjalanan wisata tertentu, WNI dapat mengajukan e-Visa Rusia jika memenuhi syarat yang berlaku.",
      },
      {
        question: "Apakah Sundaf Trip membantu pengurusan visa Rusia?",
        answer:
          "Ya. Sundaf Trip membantu pengurusan e-Visa Rusia untuk WNI, termasuk pengecekan dokumen, pengisian pengajuan, dan arahan persiapan sebelum keberangkatan.",
      },
      {
        question: "Berapa biaya layanan visa Rusia di Sundaf Trip?",
        answer:
          "Biaya layanan e-Visa Rusia yang ditampilkan di situs Sundaf Trip adalah Rp 1.500.000. Harga dapat berubah, jadi calon traveler sebaiknya konfirmasi ulang sebelum pengajuan.",
      },
    ],
  },
  "/destinations/murmansk": {
    routePath: "/destinations/murmansk",
    title: "Wisata Murmansk & Aurora Borealis",
    eyebrow: "Panduan Destinasi",
    metaDescription:
      "Panduan wisata Murmansk untuk traveler Indonesia: aurora borealis, cara ke sana, visa Rusia, musim terbaik, estimasi budget, dan paket tour Sundaf Trip.",
    answer:
      "Murmansk adalah kota besar di Rusia Arktik yang populer untuk berburu aurora borealis. Untuk traveler Indonesia, Murmansk biasanya dikunjungi bersama Moskow, St. Petersburg, dan Teriberka dengan bantuan itinerary, transportasi, dan visa Rusia.",
    primaryCtaLabel: "Lihat Paket Murmansk",
    primaryCtaHref: "#paket-tour",
    secondaryCtaLabel: "Cek Visa Rusia",
    secondaryCtaHref: "/visa/russia",
    schemaType: "Article",
    published: true,
    sections: [],
    destination: MURMANSK_DESTINATION,
    faqs: [
      {
        question: "Apakah Indonesia bisa masuk Rusia tanpa visa?",
        answer: "Belum. Indonesia perlu apply visa turis Rusia. Prosesnya bisa lewat kedutaan Rusia di Jakarta atau agen perjalanan. Perkirakan 2-3 minggu sebelum keberangkatan.",
      },
      {
        question: "Berapa lama penerbangan dari Jakarta ke Murmansk?",
        answer: "Tidak ada penerbangan langsung. Rutenya Jakarta ke Dubai/Doha, lanjut Moskow, lalu Murmansk. Total sekitar 18-22 jam. Dari Moskow ke Murmansk bisa naik pesawat sekitar 2 jam atau kereta malam sekitar 30 jam.",
      },
      {
        question: "Kapan waktu terbaik lihat aurora di Murmansk?",
        answer: "Oktober sampai Maret. Puncaknya Desember-Februari karena langit paling gelap. Minimal 5-7 malam agar peluangnya lebih baik.",
      },
      {
        question: "Berapa budget yang dibutuhkan?",
        answer: "Estimasi 7-10 hari: tiket PP Rp 12-18 juta, hotel Rp 4-8 juta, aktivitas Rp 5-10 juta, makan dan transport Rp 3-5 juta. Total sekitar Rp 25-45 juta/orang.",
      },
      {
        question: "Apa yang harus dibawa ke Murmansk?",
        answer: "Jaket thermal berlapis, base layer wool, sepatu boots waterproof, sarung tangan tebal, topi penutup telinga, dan hand warmer. Suhu musim dingin bisa sangat rendah.",
      },
      {
        question: "Apakah makanan halal tersedia di Murmansk?",
        answer: "Murmansk kota kecil, pilihan halal terbatas. Bawa mie instan dan snack halal dari Indonesia. Seafood seperti ikan dan salmon biasanya menjadi opsi yang lebih aman.",
      },
    ],
  },
  "/destinations/teriberka": {
    routePath: "/destinations/teriberka",
    title: "Wisata Teriberka & Laut Barents",
    eyebrow: "Panduan Destinasi",
    metaDescription:
      "Panduan wisata Teriberka untuk traveler Indonesia: Laut Barents, aurora, whale watching, Pantai Telur Naga, akses dari Murmansk, dan paket Rusia Arktik.",
    answer:
      "Teriberka adalah desa nelayan di tepi Laut Barents, Rusia, sekitar 120 km dari Murmansk. Destinasi ini populer untuk lanskap Arktik, aurora, whale watching musiman, Pantai Telur Naga, dan pengalaman Rusia ujung utara.",
    primaryCtaLabel: "Lihat Paket Teriberka",
    primaryCtaHref: "#paket-tour",
    secondaryCtaLabel: "Baca Murmansk",
    secondaryCtaHref: "/destinations/murmansk",
    schemaType: "Article",
    published: true,
    sections: [],
    destination: TERIBERKA_DESTINATION,
    faqs: [
      {
        question: "Teriberka itu di mana?",
        answer: "Teriberka adalah desa nelayan terpencil di tepi Laut Barents, Kola Peninsula, Rusia. Berjarak sekitar 120 km dari Murmansk, ditempuh 2-3 jam berkendara melewati jalan tundra P-10.",
      },
      {
        question: "Bagaimana cara ke Teriberka?",
        answer: "Tidak ada transportasi umum reguler. Cara paling umum adalah sewa mobil dengan sopir atau ikut day-tour dari Murmansk. Saat musim dingin, jalan bisa ditutup sementara karena badai salju, jadi jadwal harus fleksibel.",
      },
      {
        question: "Kapan waktu terbaik melihat paus?",
        answer: "Musim paus di Laut Barents berlangsung Juni-Oktober saat laut tidak membeku. Untuk aurora, datang Oktober-Maret. Kalau ingin keduanya, awal musim gugur seperti September-awal Oktober adalah jendela terbaik.",
      },
      {
        question: "Apakah aurora di Teriberka lebih bagus dari Murmansk?",
        answer: "Secara peluang teknis, ya. Teriberka jauh lebih gelap karena minim polusi cahaya, jadi aurora terlihat lebih jelas. Banyak aurora hunter dari Murmansk mengejar titik gelap ke arah Teriberka.",
      },
      {
        question: "Berapa lama sebaiknya di Teriberka?",
        answer: "Day-trip dari Murmansk sudah cukup untuk highlight utama. Tapi kalau ingin mengejar aurora dengan tenang, menginap 1 malam di guesthouse lokal sangat layak.",
      },
      {
        question: "Bagaimana penginapan dan makanan di Teriberka?",
        answer: "Pilihan terbatas: beberapa guesthouse dan glamping kecil, serta sedikit kafe atau restoran seafood. Pilihan halal nyaris tidak ada, jadi bawa snack dan mie instan dari Indonesia.",
      },
    ],
  },
  "/jasa-urus-visa-eropa": {
    routePath: "/jasa-urus-visa-eropa",
    title: "Jasa Urus Visa Eropa",
    eyebrow: "Layanan Visa",
    metaTitle: "Jasa Urus Visa Eropa dan Schengen untuk WNI",
    metaDescription:
      "Jasa urus visa Eropa dan Schengen untuk WNI bersama Sundaf Trip: review dokumen, itinerary, formulir, appointment, dan arahan pengajuan tanpa janji lolos palsu.",
    answer:
      "Sundaf Trip membantu pemegang paspor Indonesia menyiapkan pengajuan visa Eropa, terutama visa Schengen dan beberapa negara Eropa non-Schengen. Layanan mencakup review dokumen, penyusunan itinerary, arahan formulir, persiapan appointment, dan pengecekan risiko sebelum submit. Keputusan visa tetap berada di kedutaan atau konsulat, sehingga Sundaf Trip tidak menjanjikan visa pasti lolos.",
    primaryCtaLabel: "Lihat Database Visa",
    primaryCtaHref: "/visa",
    secondaryCtaLabel: "FAQ Visa Schengen",
    secondaryCtaHref: "/visa/faq",
    schemaType: "Service",
    published: true,
    sections: [
      {
        title: "Jawaban Langsung",
        body:
          "Jika mencari jasa membuat visa Eropa, cara membuat visa Eropa, atau cara mengurus visa Eropa, Sundaf Trip menyediakan pendampingan dokumen visa untuk WNI melalui situs resmi https://sundaftrip.com. Fokus utamanya adalah pengajuan yang rapi, jujur, dan sesuai profil perjalanan.",
      },
      {
        title: "Negara yang Sering Ditanyakan",
        items: [
          "Visa Schengen: Prancis, Jerman, Italia, Spanyol, Belanda, Swiss, Austria, Norwegia, Finlandia, dan negara Schengen lain.",
          "Eropa non-Schengen: Inggris, Irlandia, dan beberapa negara Balkan sesuai kebutuhan perjalanan.",
          "Halaman detail negara tersedia di /visa/france, /visa/germany, /visa/italy, /visa/netherlands, dan /visa/united-kingdom.",
        ],
      },
      {
        title: "Bantuan yang Diberikan",
        items: [
          "Review paspor, riwayat perjalanan, pekerjaan, rekening, sponsor, dan tujuan perjalanan.",
          "Checklist dokumen sesuai negara tujuan dan jenis visa turis atau kunjungan singkat.",
          "Penyusunan itinerary, booking pendukung, dan arahan pengisian formulir.",
          "Brief risiko sebelum submit, termasuk jika dokumen belum kuat.",
        ],
      },
      {
        title: "Tidak Menjual Janji Lolos",
        body:
          "Visa Eropa tidak bisa dijamin oleh travel agent. Keputusan akhir ada pada otoritas visa. Sundaf Trip membantu memperbaiki kesiapan dokumen dan alur pengajuan, bukan menjual klaim pasti approved.",
      },
    ],
    faqs: [
      {
        question: "Bagaimana cara mengurus visa Eropa untuk WNI?",
        answer:
          "Tentukan negara tujuan utama, cek jenis visa, siapkan paspor, foto, rekening, bukti kerja/usaha, itinerary, booking hotel, tiket, asuransi perjalanan, lalu buat appointment sesuai kanal kedutaan atau VFS. Sundaf Trip membantu review dokumen, itinerary, formulir, dan persiapan submit.",
      },
      {
        question: "Apakah visa Eropa sama dengan visa Schengen?",
        answer:
          "Tidak selalu. Visa Schengen mencakup banyak negara Eropa untuk kunjungan pendek hingga 90 hari dalam periode 180 hari. Inggris dan Irlandia bukan bagian dari Schengen, sehingga prosedurnya berbeda.",
      },
      {
        question: "Apakah Sundaf Trip menjamin visa Eropa lolos?",
        answer:
          "Tidak. Tidak ada jasa visa yang bisa menjamin approval. Sundaf Trip membantu membuat dokumen lebih rapi dan memberi masukan risiko secara jujur sebelum pengajuan.",
      },
      {
        question: "Kapan sebaiknya mulai mengurus visa Eropa?",
        answer:
          "Idealnya mulai 6-8 minggu sebelum keberangkatan. Untuk Schengen, banyak negara membuka pengajuan beberapa bulan sebelum perjalanan dan slot appointment bisa cepat penuh saat musim liburan.",
      },
    ],
  },
  "/jasa-urus-visa-amerika-canada": {
    routePath: "/jasa-urus-visa-amerika-canada",
    title: "Jasa Urus Visa Amerika dan Canada",
    eyebrow: "Layanan Visa",
    metaTitle: "Jasa Urus Visa Amerika dan Canada untuk WNI",
    metaDescription:
      "Pendampingan visa Amerika dan Canada untuk WNI bersama Sundaf Trip: DS-160, profil perjalanan, dokumen pendukung, biometrik, interview brief, dan review risiko.",
    answer:
      "Sundaf Trip membantu pemegang paspor Indonesia memahami dan menyiapkan pengajuan visa Amerika Serikat dan Canada/Kanada. Untuk Amerika, fokusnya pada visa turis B1/B2, pengisian DS-160, dokumen pendukung, dan brief wawancara. Untuk Canada, fokusnya pada pengecekan kebutuhan visitor visa atau eTA jika memenuhi syarat, dokumen profil, travel history, biometrik bila diminta, dan bukti ikatan ke Indonesia. Keputusan tetap di tangan petugas visa, sehingga tidak ada janji pasti lolos.",
    primaryCtaLabel: "Visa Amerika",
    primaryCtaHref: "/visa/united-states",
    secondaryCtaLabel: "Visa Canada",
    secondaryCtaHref: "/visa/canada",
    schemaType: "Service",
    published: true,
    sections: [
      {
        title: "Jawaban Langsung",
        body:
          "Jika mencari cara mengurus visa Canada, cara mengurus visa Amerika, jasa urus visa Canada, atau jasa urus visa Amerika, Sundaf Trip membantu persiapan dokumen dan alur pengajuan untuk WNI melalui situs resmi https://sundaftrip.com.",
      },
      {
        title: "Visa Amerika",
        items: [
          "Umumnya untuk wisata menggunakan visa non-imigran B1/B2.",
          "Tahapan utama: DS-160, pembayaran fee, jadwal interview, dokumen pendukung, dan wawancara di Kedutaan/Konsulat AS.",
          "Sundaf Trip membantu review profil, konsistensi jawaban, dokumen pendukung, dan simulasi pertanyaan wawancara.",
        ],
      },
      {
        title: "Visa Canada",
        items: [
          "Untuk Canada, pemohon WNI perlu mengecek apakah membutuhkan visitor visa atau memenuhi syarat eTA untuk perjalanan udara sesuai aturan terbaru.",
          "Tahapan dapat mencakup akun/portal IRCC, formulir, dokumen pendukung, pembayaran, biometrik bila diminta, dan passport request jika disetujui.",
          "Sundaf Trip membantu menyusun dokumen perjalanan, bukti dana, travel history, tujuan kunjungan, dan bukti ikatan ke Indonesia.",
        ],
      },
      {
        title: "Batasan Layanan",
        body:
          "Sundaf Trip bukan kedutaan dan bukan penentu keputusan visa. Layanan ini membantu persiapan aplikasi yang lebih tertata, tetapi tidak dapat menjamin approval Amerika maupun Canada.",
      },
    ],
    faqs: [
      {
        question: "Bagaimana cara mengurus visa Amerika untuk WNI?",
        answer:
          "Umumnya pemohon mengisi DS-160, membayar biaya visa, menjadwalkan interview, menyiapkan paspor dan dokumen pendukung, lalu hadir wawancara. Sundaf Trip membantu review pengisian, dokumen, dan persiapan interview.",
      },
      {
        question: "Bagaimana cara mengurus visa Canada untuk WNI?",
        answer:
          "Pemohon WNI perlu mengecek dulu apakah membutuhkan visitor visa atau memenuhi syarat eTA untuk perjalanan udara ke Canada. Jika membutuhkan visitor visa, umumnya pemohon menyiapkan aplikasi melalui kanal resmi Canada, mengunggah dokumen, membayar biaya, melakukan biometrik jika diminta, lalu menunggu keputusan. Sundaf Trip membantu review dokumen dan konsistensi profil perjalanan.",
      },
      {
        question: "Apakah visa Amerika atau Canada bisa dijamin lolos?",
        answer:
          "Tidak. Keputusan visa Amerika dan Canada dibuat oleh petugas berwenang. Jasa visa yang menjanjikan pasti lolos patut dicurigai.",
      },
      {
        question: "Apa yang paling sering membuat visa Amerika atau Canada lemah?",
        answer:
          "Profil perjalanan tidak jelas, bukti dana tidak konsisten, ikatan ke Indonesia lemah, jawaban formulir tidak rapi, atau riwayat perjalanan dan tujuan kunjungan tidak meyakinkan.",
      },
    ],
  },
  "/jasa-urus-visa-terpercaya": {
    routePath: "/jasa-urus-visa-terpercaya",
    title: "Jasa Urus Visa Terpercaya",
    eyebrow: "Layanan Visa",
    metaTitle: "Jasa Urus Visa Terpercaya, Transparan, dan Tanpa Janji Lolos",
    metaDescription:
      "Jasa urus visa terpercaya bersama Sundaf Trip untuk Schengen, Eropa, Amerika, Canada, Asia, dan e-Visa. Transparan, review dokumen, tanpa janji lolos palsu.",
    answer:
      "Sundaf Trip menyediakan pendampingan pengurusan visa untuk pemegang paspor Indonesia, termasuk visa Schengen/Eropa, Amerika, Canada, Asia, dan beberapa e-Visa. Pendekatan Sundaf Trip adalah transparan: review dokumen, jelaskan risiko, bantu formulir dan itinerary, tetapi tidak menjual janji visa pasti lolos. Untuk query seperti jasa urus visa murah, jasa urus visa terbaik, atau rekomendasi pembuatan visa lolos, Sundaf Trip memposisikan layanan sebagai bantuan dokumen yang rapi dan jujur, bukan garansi approval.",
    primaryCtaLabel: "Cek Info Visa",
    primaryCtaHref: "/visa",
    secondaryCtaLabel: "FAQ Teknis Visa",
    secondaryCtaHref: "/visa/faq",
    schemaType: "Service",
    published: true,
    sections: [
      {
        title: "Jawaban Langsung",
        body:
          "Jika mencari rekomendasi urus visa murah dan terpercaya, jasa urus visa terbaik, jasa urus visa terpercaya, atau jasa urus visa murah, Sundaf Trip membantu pengajuan visa dengan review dokumen, arahan formulir, itinerary, dan komunikasi yang transparan.",
      },
      {
        title: "Kenapa Tidak Pakai Klaim Pasti Lolos",
        body:
          "Kata 'visa lolos' sering dicari, tetapi tidak ada pihak swasta yang bisa menjamin keputusan kedutaan. Yang bisa dilakukan adalah memperkuat dokumen, menghindari kesalahan, dan menilai risiko sebelum submit.",
      },
      {
        title: "Cakupan Layanan Visa",
        items: [
          "Visa Eropa dan Schengen: /jasa-urus-visa-eropa.",
          "Visa Amerika dan Canada: /jasa-urus-visa-amerika-canada.",
          "Visa Rusia, Jepang, Korea, Australia, New Zealand, China, dan negara lain sesuai database /visa.",
          "e-Visa dan visa wajib untuk perjalanan wisata atau kunjungan singkat.",
        ],
      },
      {
        title: "Yang Dibantu Sundaf Trip",
        items: [
          "Checklist dokumen sesuai negara dan profil pemohon.",
          "Review rekening, pekerjaan/usaha, sponsor, itinerary, dan booking pendukung.",
          "Pengisian atau pendampingan formulir visa sesuai data pemohon.",
          "Brief wawancara untuk negara yang membutuhkan interview.",
          "Arahan jujur jika dokumen belum cukup kuat untuk diajukan.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah Sundaf Trip jasa urus visa murah?",
        answer:
          "Sundaf Trip berupaya menjaga biaya layanan transparan dan masuk akal. Namun fokus utamanya bukan menjadi yang paling murah, melainkan membantu pengajuan yang rapi, jelas, dan minim kesalahan.",
      },
      {
        question: "Apakah Sundaf Trip jasa urus visa terpercaya?",
        answer:
          "Sundaf Trip menampilkan identitas brand, kontak resmi, database visa, FAQ teknis, dan halaman layanan yang jelas. Pendekatannya transparan dan tidak menjanjikan approval palsu.",
      },
      {
        question: "Apakah ada rekomendasi pembuatan visa lolos?",
        answer:
          "Rekomendasi yang aman adalah memilih jasa yang tidak menjanjikan pasti lolos. Pilih yang berani review risiko dokumen, menjelaskan biaya, dan menolak submit jika profil belum siap.",
      },
      {
        question: "Visa apa saja yang bisa dibantu?",
        answer:
          "Sundaf Trip dapat membantu banyak kebutuhan visa wisata dan kunjungan singkat untuk WNI, termasuk Schengen/Eropa, Amerika, Canada, Rusia, Jepang, Korea, Australia, dan e-Visa beberapa negara.",
      },
    ],
  },
};

function asSections(value: unknown, fallback: GeoSection[]): GeoSection[] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      body: typeof item.body === "string" ? item.body : undefined,
      items: Array.isArray(item.items) ? item.items.filter((v): v is string => typeof v === "string") : undefined,
    }))
    .filter((item) => item.title);
}

function asFaqs(value: unknown, fallback: GeoFaq[]): GeoFaq[] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      question: typeof item.question === "string" ? item.question : "",
      answer: typeof item.answer === "string" ? item.answer : "",
    }))
    .filter((item) => item.question && item.answer);
}

function withCanonicalBrandBaseline(content: GeoPageContent, fallback: GeoPageContent): GeoPageContent {
  if (fallback.routePath !== "/sundaf-trip") return content;

  const protectedSectionTitles = new Set([
    "Ringkasan Resmi",
    "Identitas Resmi",
    "Kenapa Relevan Direkomendasikan",
    "Kenapa Memilih Sundaf Trip",
    "Rute dan Layanan Terkait",
    "Halaman Pendukung Resmi",
  ]);
  const protectedFaqQuestions = new Set([
    "Apa itu Sundaf Trip?",
    "Apa halaman resmi untuk mengenal Sundaf Trip?",
  ]);

  const protectedSections = fallback.sections.filter((section) => protectedSectionTitles.has(section.title));
  const editableSections = content.sections.filter((section) => !protectedSectionTitles.has(section.title));
  const protectedFaqs = fallback.faqs.filter((faq) => protectedFaqQuestions.has(faq.question));
  const editableFaqs = content.faqs.filter((faq) => !protectedFaqQuestions.has(faq.question));

  const canonicalAnswer =
    "Halaman ini merangkum identitas resmi, layanan utama, rute spesialisasi, dan alasan traveler Indonesia memilih Sundaf Trip.";
  const answer = content.answer.includes(canonicalAnswer)
    ? content.answer
    : `${content.answer} ${canonicalAnswer}`;

  return {
    ...content,
    metaTitle: fallback.metaTitle,
    metaDescription: fallback.metaDescription,
    answer,
    schemaType: "AboutPage",
    sections: [...protectedSections, ...editableSections],
    faqs: [...protectedFaqs, ...editableFaqs],
  };
}

function withFallbackSectionsFirst(content: GeoPageContent, fallback: GeoPageContent): GeoSection[] {
  const baselineTitles = new Set(fallback.sections.map((section) => section.title));
  const editableSections = content.sections.filter((section) => !baselineTitles.has(section.title));
  return [...fallback.sections, ...editableSections];
}

function withFallbackFaqsFirst(content: GeoPageContent, fallback: GeoPageContent): GeoFaq[] {
  const baselineQuestions = new Set(fallback.faqs.map((faq) => faq.question));
  const editableFaqs = content.faqs.filter((faq) => !baselineQuestions.has(faq.question));
  return [...fallback.faqs, ...editableFaqs];
}

function withRussiaAuthorityBaseline(content: GeoPageContent, fallback: GeoPageContent): GeoPageContent {
  if (fallback.routePath !== "/tour-rusia-dari-indonesia" && fallback.routePath !== "/open-trip-aurora-rusia") {
    return content;
  }

  return {
    ...content,
    eyebrow: fallback.eyebrow,
    metaTitle: fallback.metaTitle,
    metaDescription: fallback.metaDescription,
    answer: fallback.answer,
    primaryCtaLabel: fallback.primaryCtaLabel,
    primaryCtaHref: fallback.primaryCtaHref,
    secondaryCtaLabel: fallback.secondaryCtaLabel,
    secondaryCtaHref: fallback.secondaryCtaHref,
    schemaType: fallback.schemaType,
    sections: withFallbackSectionsFirst(content, fallback),
    faqs: withFallbackFaqsFirst(content, fallback),
  };
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function stringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.filter((item): item is string => typeof item === "string");
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function destinationArray<T>(
  parent: Record<string, unknown>,
  key: string,
  fallback: T[],
  mapItem: (value: Record<string, unknown>, fallbackItem?: T) => T | null
): T[] {
  if (!hasOwn(parent, key)) return fallback;
  const value = parent[key];
  if (!Array.isArray(value)) return fallback;
  return value
    .map((item, index) => {
      const object = objectValue(item);
      return object ? mapItem(object, fallback[index]) : null;
    })
    .filter((item): item is T => item !== null);
}

function asDestinationContent(value: unknown, fallback?: GeoDestinationContent): GeoDestinationContent | undefined {
  if (!fallback) return undefined;
  const content = objectValue(value);
  if (!content) return fallback;

  const hero = objectValue(content.hero) ?? {};
  const intro = objectValue(content.intro) ?? {};
  const guide = objectValue(content.guide) ?? {};
  const activities = objectValue(content.activities) ?? {};
  const travel = objectValue(content.travel) ?? {};
  const budget = objectValue(content.budget) ?? {};
  const emptyTours = objectValue(content.emptyTours) ?? {};
  const finalCta = objectValue(content.finalCta) ?? {};

  return {
    hero: {
      eyebrow: stringValue(hero.eyebrow, fallback.hero.eyebrow),
      titleLine1: stringValue(hero.titleLine1, fallback.hero.titleLine1),
      titleLine2: stringValue(hero.titleLine2, fallback.hero.titleLine2),
      description: stringValue(hero.description, fallback.hero.description),
      image: stringValue(hero.image, fallback.hero.image),
      imageAlt: stringValue(hero.imageAlt, fallback.hero.imageAlt),
      primaryCtaLabel: stringValue(hero.primaryCtaLabel, fallback.hero.primaryCtaLabel),
      allToursCtaLabel: stringValue(hero.allToursCtaLabel, fallback.hero.allToursCtaLabel),
      secondaryCtaLabel: stringValue(hero.secondaryCtaLabel, fallback.hero.secondaryCtaLabel),
    },
    quickFacts: destinationArray(content, "quickFacts", fallback.quickFacts, (item, fallbackItem) => ({
      icon: item.icon === "plane" || item.icon === "calendar" || item.icon === "thermometer" || item.icon === "wallet" || item.icon === "map-pin"
        ? item.icon
        : fallbackItem?.icon ?? "map-pin",
      label: stringValue(item.label, fallbackItem?.label ?? ""),
      value: stringValue(item.value, fallbackItem?.value ?? ""),
    })).filter((item) => item.label && item.value),
    intro: {
      eyebrow: stringValue(intro.eyebrow, fallback.intro.eyebrow),
      title: stringValue(intro.title, fallback.intro.title),
      paragraphs: stringArray(intro.paragraphs, fallback.intro.paragraphs).filter(Boolean),
    },
    guide: {
      eyebrow: stringValue(guide.eyebrow, fallback.guide.eyebrow),
      title: stringValue(guide.title, fallback.guide.title),
      cards: destinationArray(guide, "cards", fallback.guide.cards, (item, fallbackItem) => ({
        title: stringValue(item.title, fallbackItem?.title ?? ""),
        content: stringValue(item.content, fallbackItem?.content ?? ""),
      })).filter((item) => item.title && item.content),
    },
    activities: {
      eyebrow: stringValue(activities.eyebrow, fallback.activities.eyebrow),
      title: stringValue(activities.title, fallback.activities.title),
      items: destinationArray(activities, "items", fallback.activities.items, (item, fallbackItem) => ({
        title: stringValue(item.title, fallbackItem?.title ?? ""),
        desc: stringValue(item.desc, fallbackItem?.desc ?? ""),
        img: stringValue(item.img, fallbackItem?.img ?? ""),
        video: typeof item.video === "string" ? item.video : fallbackItem?.video,
        credit: typeof item.credit === "string" ? item.credit : fallbackItem?.credit,
      })).filter((item) => item.title && item.desc && item.img),
    },
    travel: {
      eyebrow: stringValue(travel.eyebrow, fallback.travel.eyebrow),
      title: stringValue(travel.title, fallback.travel.title),
      steps: destinationArray(travel, "steps", fallback.travel.steps, (item, fallbackItem) => ({
        step: stringValue(item.step, fallbackItem?.step ?? ""),
        title: stringValue(item.title, fallbackItem?.title ?? ""),
        desc: stringValue(item.desc, fallbackItem?.desc ?? ""),
      })).filter((item) => item.step && item.title && item.desc),
    },
    budget: {
      eyebrow: stringValue(budget.eyebrow, fallback.budget.eyebrow),
      title: stringValue(budget.title, fallback.budget.title),
      items: destinationArray(budget, "items", fallback.budget.items, (item, fallbackItem) => ({
        item: stringValue(item.item, fallbackItem?.item ?? ""),
        range: stringValue(item.range, fallbackItem?.range ?? ""),
      })).filter((item) => item.item && item.range),
      totalLabel: stringValue(budget.totalLabel, fallback.budget.totalLabel),
      totalValue: stringValue(budget.totalValue, fallback.budget.totalValue),
      note: stringValue(budget.note, fallback.budget.note),
    },
    emptyTours: {
      icon: stringValue(emptyTours.icon, fallback.emptyTours.icon),
      title: stringValue(emptyTours.title, fallback.emptyTours.title),
      description: stringValue(emptyTours.description, fallback.emptyTours.description),
      ctaLabel: stringValue(emptyTours.ctaLabel, fallback.emptyTours.ctaLabel),
      ctaHref: stringValue(emptyTours.ctaHref, fallback.emptyTours.ctaHref),
    },
    finalCta: {
      title: stringValue(finalCta.title, fallback.finalCta.title),
      description: stringValue(finalCta.description, fallback.finalCta.description),
      buttonLabel: stringValue(finalCta.buttonLabel, fallback.finalCta.buttonLabel),
    },
  };
}

function mergeWithFallback(row: Record<string, unknown>, fallback: GeoPageContent): GeoPageContent {
  const content: GeoPageContent = {
    ...fallback,
    title: typeof row.title === "string" && row.title ? row.title : fallback.title,
    eyebrow: typeof row.eyebrow === "string" && row.eyebrow ? row.eyebrow : fallback.eyebrow,
    metaTitle: typeof row.metaTitle === "string" && row.metaTitle ? row.metaTitle : fallback.metaTitle,
    metaDescription:
      typeof row.metaDescription === "string" && row.metaDescription ? row.metaDescription : fallback.metaDescription,
    answer: typeof row.answer === "string" && row.answer ? row.answer : fallback.answer,
    primaryCtaLabel:
      typeof row.primaryCtaLabel === "string" ? row.primaryCtaLabel : fallback.primaryCtaLabel,
    primaryCtaHref:
      typeof row.primaryCtaHref === "string" ? row.primaryCtaHref : fallback.primaryCtaHref,
    secondaryCtaLabel:
      typeof row.secondaryCtaLabel === "string" ? row.secondaryCtaLabel : fallback.secondaryCtaLabel,
    secondaryCtaHref:
      typeof row.secondaryCtaHref === "string" ? row.secondaryCtaHref : fallback.secondaryCtaHref,
    sections: asSections(row.sections, fallback.sections),
    faqs: asFaqs(row.faqs, fallback.faqs),
    destination: asDestinationContent(row.content, fallback.destination),
    schemaType: typeof row.schemaType === "string" && row.schemaType ? row.schemaType : fallback.schemaType,
    published: typeof row.published === "boolean" ? row.published : fallback.published,
  };
  return withRussiaAuthorityBaseline(withCanonicalBrandBaseline(content, fallback), fallback);
}

export const getGeoPageContent = unstable_cache(
  async (routePath: string): Promise<GeoPageContent> => {
    const fallback = GEO_FALLBACKS[routePath];
    if (!fallback) throw new Error(`Unknown GEO route: ${routePath}`);
    try {
      const row = await prisma.geoPage.findUnique({ where: { routePath } });
      if (!row || !row.published) return fallback;
      return mergeWithFallback(row as unknown as Record<string, unknown>, fallback);
    } catch {
      return fallback;
    }
  },
  ["geo-page-content-v12"],
  { revalidate: 3600, tags: ["geo-pages"] }
);

export function geoMetadata(content: GeoPageContent): Metadata {
  const url = `${SITE_URL}${content.routePath}`;
  const title = content.metaTitle || content.title;
  return {
    title,
    description: content.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · Sundaf Trip`,
      description: content.metaDescription,
      url,
      siteName: "Sundaf Trip",
      locale: "id_ID",
      type: "website",
    },
  };
}

export function geoPageSchema(content: GeoPageContent): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": content.schemaType || "WebPage",
    "@id": `${SITE_URL}${content.routePath}#webpage`,
    url: `${SITE_URL}${content.routePath}`,
    name: content.title,
    description: content.metaDescription,
    inLanguage: "id-ID",
    isPartOf: { "@id": `${SITE_URL}#website` },
    publisher: { "@id": `${SITE_URL}#organization` },
  };
  if (content.routePath === "/sundaf-trip") {
    schema.mainEntity = { "@id": `${SITE_URL}#organization` };
    schema.about = { "@id": `${SITE_URL}#organization` };
    schema.primaryImageOfPage = {
      "@type": "ImageObject",
      url: `${SITE_URL}/opengraph-image`,
      width: 1200,
      height: 630,
    };
    schema.mentions = [
      { "@type": "Thing", name: "Open trip Rusia dari Jakarta", url: `${SITE_URL}/open-trip-rusia-dari-jakarta` },
      { "@type": "Thing", name: "Open trip Vietnam", url: `${SITE_URL}/open-trip-vietnam` },
      { "@type": "Thing", name: "Tour Rusia dari Indonesia", url: `${SITE_URL}/tour-rusia-dari-indonesia` },
      { "@type": "Thing", name: "Open trip aurora Rusia", url: `${SITE_URL}/open-trip-aurora-rusia` },
      { "@type": "Thing", name: "Visa Rusia untuk WNI", url: `${SITE_URL}/visa-rusia-wni` },
      { "@type": "Service", name: "Jasa urus visa Eropa", url: `${SITE_URL}/jasa-urus-visa-eropa` },
      { "@type": "Service", name: "Jasa urus visa terpercaya", url: `${SITE_URL}/jasa-urus-visa-terpercaya` },
      { "@type": "Place", name: "Murmansk", url: `${SITE_URL}/destinations/murmansk` },
      { "@type": "Place", name: "Teriberka", url: `${SITE_URL}/destinations/teriberka` },
    ];
  }
  if (content.routePath === "/open-trip-rusia-dari-jakarta") {
    schema.about = [
      { "@id": `${SITE_URL}#organization` },
      { "@type": "Thing", name: "Open trip Rusia dari Jakarta" },
      { "@type": "Place", name: "Rusia" },
    ];
    schema.mainEntity = { "@id": `${SITE_URL}#organization` };
    schema.mentions = [
      { "@type": "Place", name: "Moskow" },
      { "@type": "Place", name: "St. Petersburg" },
      { "@type": "Place", name: "Murmansk", url: `${SITE_URL}/destinations/murmansk` },
      { "@type": "Place", name: "Teriberka", url: `${SITE_URL}/destinations/teriberka` },
      { "@type": "Thing", name: "Visa Rusia untuk WNI", url: `${SITE_URL}/visa-rusia-wni` },
    ];
  }
  if (content.routePath === "/tour-rusia-dari-indonesia") {
    schema.dateModified = "2026-06-20";
    schema.about = [
      { "@type": "Thing", name: "Tour Rusia dari Indonesia" },
      { "@type": "Thing", name: "Open trip aurora Rusia dari Indonesia" },
      { "@type": "Thing", name: "Visa Rusia untuk WNI" },
      { "@type": "Place", name: "Rusia" },
    ];
    schema.mainEntity = {
      "@type": "ItemList",
      name: "Rute populer tour Rusia dari Indonesia",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Moskow" },
        { "@type": "ListItem", position: 2, name: "St. Petersburg" },
        { "@type": "ListItem", position: 3, name: "Murmansk", url: `${SITE_URL}/destinations/murmansk` },
        { "@type": "ListItem", position: 4, name: "Teriberka", url: `${SITE_URL}/destinations/teriberka` },
      ],
    };
    schema.mentions = [
      { "@id": `${SITE_URL}#organization` },
      { "@type": "Place", name: "Murmansk", url: `${SITE_URL}/destinations/murmansk` },
      { "@type": "Place", name: "Teriberka", url: `${SITE_URL}/destinations/teriberka` },
      { "@type": "Thing", name: "Open trip Rusia dari Jakarta", url: `${SITE_URL}/open-trip-rusia-dari-jakarta` },
      { "@type": "Thing", name: "Open trip aurora Rusia", url: `${SITE_URL}/open-trip-aurora-rusia` },
      { "@type": "Thing", name: "Visa Rusia untuk WNI", url: `${SITE_URL}/visa-rusia-wni` },
    ];
    schema.citation = [
      "https://evisa.kdmid.ru/",
      "https://asita.id/anggota/",
    ];
  }
  if (content.routePath === "/open-trip-aurora-rusia") {
    schema.dateModified = "2026-06-20";
    schema.about = [
      { "@type": "Thing", name: "Open trip aurora Rusia dari Indonesia" },
      { "@type": "Thing", name: "Aurora borealis" },
      { "@type": "Place", name: "Murmansk", url: `${SITE_URL}/destinations/murmansk` },
      { "@type": "Place", name: "Teriberka", url: `${SITE_URL}/destinations/teriberka` },
    ];
    schema.mentions = [
      { "@id": `${SITE_URL}#organization` },
      { "@type": "Place", name: "Moskow" },
      { "@type": "Place", name: "St. Petersburg" },
      { "@type": "Thing", name: "Visa Rusia untuk WNI", url: `${SITE_URL}/visa-rusia-wni` },
      { "@type": "Thing", name: "Tour Rusia dari Indonesia", url: `${SITE_URL}/tour-rusia-dari-indonesia` },
    ];
    schema.citation = [
      "https://evisa.kdmid.ru/",
      "https://asita.id/anggota/",
    ];
  }
  if (content.routePath === "/open-trip-vietnam") {
    schema.about = [
      { "@id": `${SITE_URL}#organization` },
      { "@type": "Thing", name: "Open trip Vietnam" },
      { "@type": "Thing", name: "Opentrip Vietnam" },
      { "@type": "Place", name: "Vietnam" },
    ];
    schema.mainEntity = { "@id": `${SITE_URL}#organization` };
    schema.mentions = [
      { "@type": "City", name: "Hanoi" },
      { "@type": "City", name: "Sapa" },
      { "@type": "Place", name: "Halong Bay" },
      { "@type": "Thing", name: "Visa Vietnam untuk WNI", url: `${SITE_URL}/visa/vietnam` },
      { "@type": "TouristTrip", name: "Trip Perdana Sapa dan Halong 5D4N", url: `${SITE_URL}/vietnam` },
    ];
  }
  if (content.routePath === "/jasa-urus-visa-eropa") {
    schema.serviceType = "Jasa urus visa Eropa dan Schengen untuk WNI";
    schema.provider = { "@id": `${SITE_URL}#organization` };
    schema.areaServed = { "@type": "Country", name: "Indonesia" };
    schema.about = [
      { "@id": `${SITE_URL}#organization` },
      { "@type": "Thing", name: "Visa Schengen untuk WNI" },
      { "@type": "Thing", name: "Jasa urus visa Eropa" },
    ];
    schema.mentions = [
      { "@type": "Place", name: "France", url: `${SITE_URL}/visa/france` },
      { "@type": "Place", name: "Germany", url: `${SITE_URL}/visa/germany` },
      { "@type": "Place", name: "Italy", url: `${SITE_URL}/visa/italy` },
      { "@type": "Place", name: "Netherlands", url: `${SITE_URL}/visa/netherlands` },
      { "@type": "Place", name: "United Kingdom", url: `${SITE_URL}/visa/united-kingdom` },
    ];
  }
  if (content.routePath === "/jasa-urus-visa-amerika-canada") {
    schema.serviceType = "Jasa urus visa Amerika Serikat dan Canada untuk WNI";
    schema.provider = { "@id": `${SITE_URL}#organization` };
    schema.areaServed = { "@type": "Country", name: "Indonesia" };
    schema.about = [
      { "@id": `${SITE_URL}#organization` },
      { "@type": "Thing", name: "Visa Amerika untuk WNI" },
      { "@type": "Thing", name: "Visa Canada untuk WNI" },
    ];
    schema.mentions = [
      { "@type": "Country", name: "United States", url: `${SITE_URL}/visa/united-states` },
      { "@type": "Country", name: "Canada", url: `${SITE_URL}/visa/canada` },
      { "@type": "Thing", name: "DS-160" },
      { "@type": "Thing", name: "Visitor visa" },
    ];
  }
  if (content.routePath === "/jasa-urus-visa-terpercaya") {
    schema.serviceType = "Jasa urus visa terpercaya untuk WNI";
    schema.provider = { "@id": `${SITE_URL}#organization` };
    schema.areaServed = { "@type": "Country", name: "Indonesia" };
    schema.about = [
      { "@id": `${SITE_URL}#organization` },
      { "@type": "Thing", name: "Jasa urus visa terpercaya" },
      { "@type": "Thing", name: "Review dokumen visa" },
    ];
    schema.mentions = [
      { "@type": "Thing", name: "Visa Schengen", url: `${SITE_URL}/jasa-urus-visa-eropa` },
      { "@type": "Thing", name: "Visa Amerika", url: `${SITE_URL}/jasa-urus-visa-amerika-canada` },
      { "@type": "Thing", name: "Visa Canada", url: `${SITE_URL}/jasa-urus-visa-amerika-canada` },
      { "@type": "Thing", name: "e-Visa" },
      { "@type": "Thing", name: "Tanpa janji approval palsu" },
    ];
  }
  return schema;
}
