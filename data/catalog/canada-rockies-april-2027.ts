const MEDIA = {
  banff: "https://images.pexels.com/photos/33894963/pexels-photo-33894963.jpeg?auto=compress&cs=tinysrgb&w=1800",
  revelstoke: "https://images.pexels.com/photos/36473779/pexels-photo-36473779.jpeg?auto=compress&cs=tinysrgb&w=1800",
  emeraldLake: "https://images.pexels.com/photos/35714229/pexels-photo-35714229.jpeg?auto=compress&cs=tinysrgb&w=1600",
  icefield: "https://images.pexels.com/photos/31812639/pexels-photo-31812639.jpeg?auto=compress&cs=tinysrgb&w=1600",
  vancouver: "https://images.pexels.com/photos/37359916/pexels-photo-37359916.jpeg?auto=compress&cs=tinysrgb&w=1600",
  okanagan: "https://images.pexels.com/photos/31909341/pexels-photo-31909341.jpeg?auto=compress&cs=tinysrgb&w=1600",
  ferry: "https://images.unsplash.com/photo-1714169568067-ab8c4f753a1d?auto=format&fit=crop&w=1800&q=85",
  victoria: "https://images.pexels.com/photos/729007/pexels-photo-729007.jpeg?auto=compress&cs=tinysrgb&w=1600",
} as const;

export const CANADA_ROCKIES_SLUG = "canada-rockies-spring-victoria-april-2027";

export const CANADA_ROCKIES_MANDATORY_TOTAL = 5_400_000;

export const CANADA_ROCKIES_ROOM_PRICES = {
  quad: 40_900_000,
  triple: 42_900_000,
  twin: 44_900_000,
} as const;

/**
 * Internal audit snapshot for the public price guard. Recheck the source
 * before the package is promoted from pre-registration to a fixed price.
 */
export const CANADA_ROCKIES_PRICE_GUARD = {
  minimumGap: 1_000_000,
  maximumGap: 2_000_000,
  checkedAt: "2026-08-25",
  source: "https://www.hakikileisure.id/product/1-11-apr-2027-11-hari-canada-rocky-mountain-spring-2027",
  comparisonMandatoryTotal: 5_400_000,
  comparisonRoomPrices: {
    quad: 41_900_000,
    triple: 43_900_000,
    twin: 45_900_000,
  },
} as const;

/**
 * Public package content. The import script deliberately creates this as a
 * draft unless an explicit publish flag is supplied.
 */
export const CANADA_ROCKIES_TOUR = {
  title: "Canada Rocky Mountain Spring 11 Hari",
  slug: CANADA_ROCKIES_SLUG,
  country: "Kanada",
  cityHighlight: "Vancouver • Revelstoke • Banff • Calgary • Okanagan • Victoria",
  price: CANADA_ROCKIES_ROOM_PRICES.quad,
  promoPrice: null,
  priceLandTour: null,
  seatsLeft: 20,
  status: "DRAFT" as const,
  pinned: false,
  tripDate: new Date("2027-04-15T00:00:00.000Z"),
  duration: "11 Hari • 8 Malam Hotel",
  heroImg: MEDIA.banff,
  badge: "PRE-REGISTRATION • TARGET 20 PESERTA",
  description: [
    "Perjalanan musim semi melintasi Vancouver, Canadian Rockies, Okanagan, dan Victoria dengan dua kali pelayaran BC Ferries.",
    "Program Kanada berlangsung 15–23 April 2027, dilanjutkan perjalanan pulang hingga estimasi tiba di Jakarta pada hari ke-11. Jadwal penerbangan akan mengikuti allotment grup yang dikonfirmasi.",
    "Menginap delapan malam di hotel bintang 3 atau setara dengan sarapan harian termasuk.",
    "Harga ditampilkan berdasarkan jumlah peserta dalam satu kamar: berempat, bertiga, atau berdua.",
  ].join("\n\n"),
  itinerary: [
    {
      day: 1,
      title: "Tiba di Vancouver",
      description: "Tiba di Vancouver International Airport (YVR), bertemu tim lokal, lalu transfer menuju hotel di Vancouver/Richmond. Bermalam di Vancouver/Richmond.",
      image: MEDIA.vancouver,
    },
    {
      day: 2,
      title: "Vancouver → Kamloops → Revelstoke",
      description: "Perjalanan menuju Canadian Rockies melalui Kamloops dan koridor pegunungan British Columbia. Bermalam di Revelstoke.",
      image: MEDIA.revelstoke,
    },
    {
      day: 3,
      title: "Revelstoke → Yoho → Banff",
      description: "Melintasi Rogers Pass menuju Yoho National Park, dengan kunjungan ke Emerald Lake dan Natural Bridge sesuai kondisi akses. Bermalam di Banff/Canmore.",
      image: MEDIA.emeraldLake,
    },
    {
      day: 4,
      title: "Banff → Icefields Parkway → Calgary",
      description: "Menikmati koridor Bow Lake, Peyto Lake, dan Columbia Icefield dari titik yang dapat diakses. Seluruh pemberhentian mengikuti kondisi jalan, cuaca, dan otoritas taman. Bermalam di Calgary.",
      image: MEDIA.icefield,
    },
    {
      day: 5,
      title: "Calgary → Banff",
      description: "Panoramic city tour singkat Calgary, lalu kembali ke kawasan Banff untuk menikmati suasana kota pegunungan. Bermalam di Banff/Canmore.",
      image: MEDIA.banff,
    },
    {
      day: 6,
      title: "Lake Louise → Glacier corridor → Vernon",
      description: "Perjalanan melalui Lake Louise, Field/Kicking Horse Pass, dan koridor Glacier National Park menuju Vernon. Bermalam di Vernon.",
      image: MEDIA.revelstoke,
    },
    {
      day: 7,
      title: "Vernon → Kelowna → Vancouver",
      description: "Menjelajahi kawasan Okanagan dan Kelowna, termasuk panorama Okanagan Lake, lalu kembali ke Vancouver/Richmond. Bermalam di Vancouver/Richmond.",
      image: MEDIA.okanagan,
    },
    {
      day: 8,
      title: "Vancouver → Victoria",
      description: "Menyeberang dengan BC Ferries menuju Vancouver Island, dilanjutkan city tour Victoria dan waktu bebas di Inner Harbour. Bermalam di Victoria.",
      image: MEDIA.ferry,
    },
    {
      day: 9,
      title: "Victoria → Vancouver → YVR",
      description: "Kembali dengan BC Ferries, kemudian panoramic tour Vancouver sesuai waktu penerbangan sebelum transfer ke YVR. Jadwal ini memerlukan penerbangan pulang yang cukup malam atau penyesuaian program.",
      image: MEDIA.victoria,
    },
    {
      day: 10,
      title: "Perjalanan pulang & transit",
      description: "Penerbangan internasional menuju kota transit. Waktu dan bandara transit mengikuti group fare yang dikonfirmasi.",
      image: MEDIA.vancouver,
    },
    {
      day: 11,
      title: "Tiba di Jakarta",
      description: "Melanjutkan penerbangan menuju Jakarta dan perjalanan berakhir. Waktu kedatangan final mengikuti jadwal maskapai.",
      image: MEDIA.banff,
    },
  ],
  inclusions: [
    "Tiket pesawat ekonomi pulang-pergi Jakarta–Vancouver sesuai group fare yang dikonfirmasi",
    "Bagasi check-in sesuai ketentuan fare grup maskapai",
    "Delapan malam hotel bintang 3 atau setara, termasuk sarapan harian",
    "Private coach dan transfer bandara selama program Kanada",
    "Dua kali penyeberangan BC Ferries untuk rute Vancouver–Victoria–Vancouver",
    "Tour Leader dari Indonesia yang berbagi kamar bersama grup",
    "Biaya masuk taman nasional dan parkir bus yang tercantum dalam quotation final",
  ],
  exclusions: [
    "Makan siang dan makan malam",
    "Visa Kanada atau eTA bagi peserta yang memenuhi syarat",
    "Aktivitas Columbia Icefield Adventure, Ice Explorer, dan Skywalk",
    "Pengeluaran pribadi, porter, laundry, serta minibar",
    "Biaya akibat perubahan jadwal yang disebabkan cuaca, penutupan jalan, atau keadaan kahar",
    "Komponen wajib yang ditampilkan terpisah pada rincian harga",
  ],
  gallery: [
    MEDIA.vancouver,
    MEDIA.revelstoke,
    MEDIA.emeraldLake,
    MEDIA.icefield,
    MEDIA.okanagan,
    MEDIA.ferry,
    MEDIA.victoria,
  ],
  hotel: {
    __room_price_quad: CANADA_ROCKIES_ROOM_PRICES.quad,
    __room_price_triple: CANADA_ROCKIES_ROOM_PRICES.triple,
    __room_price_twin: CANADA_ROCKIES_ROOM_PRICES.twin,
    "Standar akomodasi": "Hotel bintang 3 atau setara, delapan malam",
    "Pembagian kamar": "Berempat, bertiga, atau berdua; mengikuti tier harga yang dipilih",
    "Tour Leader": "Berbagi kamar bersama peserta; tidak dihitung sebagai kamar tunggal",
    "Fasilitas makan": "Sarapan harian termasuk; bentuk layanan mengikuti kebijakan hotel",
  },
  visaInfo: "Visa Kanada belum termasuk. Kelayakan eTA, bila relevan, harus dikonfirmasi berdasarkan dokumen dan riwayat perjalanan masing-masing peserta.",
  notes: "Pendaftaran awal dibuka untuk mengumpulkan peserta dan membentuk grup keberangkatan. Setelah grup terbentuk, Sundaf Trip akan menyampaikan harga final dan jadwal pembayaran melalui invoice resmi.",
  addOns: [
    {
      name: "Tips Tour Leader & Driver + city tax",
      price: 3_000_000,
      tag: "wajib" as const,
      desc: "Dibayar bersama pelunasan paket.",
    },
    {
      name: "Airport tax & fuel surcharge",
      price: 1_400_000,
      tag: "wajib" as const,
      desc: "Nilai target; dikonfirmasi kembali saat tiket grup dikunci.",
    },
    {
      name: "Asuransi perjalanan usia sampai 69 tahun",
      price: 1_000_000,
      tag: "wajib" as const,
      desc: "Premi final mengikuti usia, manfaat, dan persetujuan perusahaan asuransi.",
    },
    {
      name: "Tambahan premi usia 70 tahun ke atas",
      price: 500_000,
      tag: "recommended" as const,
      desc: "Ditambahkan bila berlaku; nilai final mengikuti quotation asuransi.",
    },
  ],
  paymentPlan: {
    mode: "hidden" as const,
  },
} as const;

export const CANADA_ROCKIES_IMAGE_CREDITS = [
  { label: "Lake Louise, Banff", creator: "Andrew Patrick Photo", source: "https://www.pexels.com/photo/breathtaking-view-of-lake-louise-and-rocky-mountains-33894963/" },
  { label: "Revelstoke", creator: "Jay Johnson", source: "https://www.pexels.com/photo/snowy-landscape-in-revelstoke-british-columbia-36473779/" },
  { label: "Emerald Lake, Yoho", creator: "Abhilash Venkat", source: "https://www.pexels.com/photo/scenic-view-of-emerald-lake-and-mountains-35714229/" },
  { label: "Columbia Icefield", creator: "The Six", source: "https://www.pexels.com/photo/stunning-mountain-view-with-glacier-and-tour-bus-31812639/" },
  { label: "Vancouver", creator: "Uzay Yildirim", source: "https://www.pexels.com/photo/vancouver-skyline-by-the-waterfront-on-a-clear-day-37359916/" },
  { label: "Okanagan", creator: "Ally Bootsma", source: "https://www.pexels.com/photo/scenic-view-of-okanagan-vineyard-and-lake-31909341/" },
  { label: "BC Ferries", creator: "Ronin", source: "https://unsplash.com/photos/a-cruise-ship-sailing-on-the-water-near-a-forest-3AlAV5ZDnoY" },
  { label: "Victoria", creator: "Lenka XIA", source: "https://www.pexels.com/photo/landscape-photo-of-boats-on-the-port-729007/" },
] as const;
