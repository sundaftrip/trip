import type { PackageDetails } from "./latin-america-package-types";

export const LATIN_AMERICA_PACKAGES: Record<string, PackageDetails> = {
  "peru": {
    "duration": "10 hari dari Jakarta · 6 malam hotel",
    "travelNote": "Perjalanan berlangsung sekitar 10 hari kalender dari Jakarta: 7 hari di Peru, 6 malam hotel dan 3 malam dalam perjalanan. Hari 01–07 di bawah dihitung sejak tiba di Lima. Jadwal lengkap mengikuti tanggal dan koneksi penerbangan pilihanmu.",
    "price": {
      "from": 64500000,
      "groupSize": 20,
      "hotel": "Hotel 3★",
      "options": [
        {
          "id": "hotel-4",
          "name": "Upgrade hotel 4★",
          "amount": 2680000,
          "description": "Upgrade untuk seluruh grup, sesuai susunan kamar paket."
        },
        {
          "id": "vistadome",
          "name": "Kereta Vistadome PP",
          "amount": 3850000,
          "description": "Upgrade kereta peserta pada dua arah. Jadwal dan tempat duduk dikonfirmasi kembali."
        }
      ],
      "basisNote": "Layanan lokal dapat digabung dengan peserta lain. Layanan privat tersedia melalui penawaran terpisah.",
      "groups": [
        {
          "groupSize": 10,
          "from": 68500000,
          "optionPrices": {
            "hotel-4": 2920000,
            "vistadome": 3850000
          },
          "roomNote": "5 kamar berdua untuk peserta.",
          "landOnlyFrom": 26000000
        },
        {
          "groupSize": 15,
          "from": 64700000,
          "optionPrices": {
            "hotel-4": 2600000,
            "vistadome": 3850000
          },
          "roomNote": "7 kamar berdua + 1 kamar bersama tour leader untuk peserta ke-15.",
          "landOnlyFrom": 22300000
        },
        {
          "groupSize": 20,
          "from": 64500000,
          "optionPrices": {
            "hotel-4": 2680000,
            "vistadome": 3850000
          },
          "roomNote": "10 kamar berdua untuk peserta.",
          "landOnlyFrom": 22100000
        }
      ]
    },
    "days": [
      {
        "title": "Tiba di Lima",
        "description": "Penjemputan di bandara dan transfer ke hotel kawasan Miraflores. Sisa hari untuk beristirahat setelah penerbangan panjang.",
        "overnight": "Lima"
      },
      {
        "title": "Lima: pusat kota & pesisir",
        "description": "Kunjungi pusat kolonial Lima, kompleks San Francisco dan kawasan Miraflores. Kembali ke hotel di Lima.",
        "overnight": "Lima"
      },
      {
        "title": "Lima → Cusco",
        "description": "Terbang ke Cusco, transfer hotel, lalu kunjungan kota sesuai waktu dan kondisi peserta. Beri waktu untuk menyesuaikan diri dengan ketinggian.",
        "overnight": "Cusco"
      },
      {
        "title": "Sacred Valley → Aguas Calientes",
        "description": "Pisac, makan siang di Urubamba, lalu Ollantaytambo. Naik kereta Voyager atau Expedition menuju Aguas Calientes.",
        "overnight": "Aguas Calientes",
        "meals": "Makan siang"
      },
      {
        "title": "Machu Picchu → Cusco",
        "description": "Bus menuju pintu masuk, kunjungan bersama pemandu, lalu kembali dengan bus dan kereta. Transfer dari Ollantaytambo ke Cusco.",
        "overnight": "Cusco"
      },
      {
        "title": "Vinicunca / Rainbow Mountain",
        "description": "Perjalanan ke pegunungan Vinicunca, termasuk sarapan dan makan siang. Aktivitas melibatkan pendakian di ketinggian; peserta dapat memilih beristirahat di Cusco tanpa potongan otomatis.",
        "overnight": "Cusco",
        "meals": "Sarapan & makan siang"
      },
      {
        "title": "Cusco → Lima → perjalanan pulang",
        "description": "Transfer ke bandara Cusco untuk penerbangan ke Lima dan sambungan pulang. Layanan darat selesai di bandara Cusco. Tiket penerbangan termasuk pada paket dengan tiket pesawat; untuk land tour only, tiket dipesan terpisah.",
        "overnight": "Perjalanan pulang"
      }
    ],
    "included": [
      "6 malam hotel 3★ sesuai susunan kamar grup.",
      "Transfer bandara dan transportasi untuk rangkaian kunjungan; beberapa layanan bersifat gabungan.",
      "Pemandu lokal berbahasa Inggris/Spanyol dan 1 tour leader dari Indonesia.",
      "Kereta standar, bus Machu Picchu dan tiket masuk sesuai sirkuit yang tersedia.",
      "Kunjungan Lima, Cusco, Sacred Valley dan Vinicunca; makan yang disebut dalam itinerary."
    ],
    "excluded": [
      "Makan yang tidak disebut, minuman, tip dan pengeluaran pribadi.",
      "Asuransi perjalanan, visa atau dokumen transit bila diperlukan.",
      "Permintaan kamar sendiri di luar susunan kamar paket, layanan privat, tambahan malam dan perubahan rute.",
      "Kelebihan bagasi serta biaya Wi-Fi yang tidak termasuk tarif maskapai."
    ],
    "hotels": [
      {
        "city": "Lima",
        "nights": 2,
        "note": "Kawasan Miraflores"
      },
      {
        "city": "Cusco",
        "nights": 3,
        "note": "Hotel kategori 3★"
      },
      {
        "city": "Aguas Calientes",
        "nights": 1,
        "note": "Bermalam sebelum Machu Picchu"
      }
    ],
    "gallery": [
      {
        "src": "/images/latin-america/lima-plaza-1280.webp",
        "alt": "Plaza Mayor dengan bangunan kolonial di Lima",
        "caption": "Lima · Plaza Mayor"
      },
      {
        "src": "/images/latin-america/cusco-plaza-1280.webp",
        "alt": "Gereja bersejarah dan Plaza de Armas di Cusco",
        "caption": "Cusco · Plaza de Armas"
      },
      {
        "src": "/images/latin-america/ollantaytambo-1280.webp",
        "alt": "Teras batu Inca di Ollantaytambo, Sacred Valley",
        "caption": "Sacred Valley · Ollantaytambo"
      }
    ],
    "flightRoute": "Jakarta → Doha → Madrid → Lima · Lima ↔ Cusco",
    "flightNote": "Prioritas Qatar Airways untuk penerbangan jarak jauh, dengan maskapai partner pada sambungan ke Peru. Wi-Fi mengikuti pesawat dan operator setiap segmen; akses sepanjang perjalanan tidak dijamin.",
    "englishSummary": "Explore Lima, Cusco, the Sacred Valley, Machu Picchu and Rainbow Mountain. Choose a 10-day package from Jakarta with flights or a 7-day land-only tour with 6 hotel nights. Both include local guides and an Indonesian tour leader, for groups of 10, 15 or 20 travellers. Land-only excludes all participant flights, including Lima–Cusco and the return connection via Lima. Final arrangements are confirmed in your written quotation.",
    "flightInclusions": "Tiket internasional Jakarta–Lima PP dan domestik Lima–Cusco PP.",
    "landTour": {
      "duration": "7 hari di Peru · 6 malam hotel",
      "meetingPoint": "Bandara Lima (LIM)",
      "finishPoint": "Bandara Cusco (CUZ)",
      "flightSectors": [
        "Lima → Cusco",
        "Cusco → Lima untuk sambungan pulang"
      ]
    }
  },
  "empat-negara": {
    "duration": "16 hari dari Jakarta · 12 malam hotel",
    "travelNote": "Perjalanan berlangsung sekitar 16 hari kalender dari Jakarta: 13 hari di Amerika Selatan, 12 malam hotel dan 3 malam dalam perjalanan. Hari 01–13 di bawah dihitung sejak tiba di São Paulo. Jadwal akhir mengikuti koneksi internasional dan regional.",
    "price": {
      "from": 152600000,
      "groupSize": 20,
      "hotel": "Hotel 3★/setara",
      "options": [
        {
          "id": "hotel-4",
          "name": "Upgrade hotel 4★",
          "amount": 6390000,
          "description": "Upgrade untuk seluruh grup, sesuai susunan kamar paket."
        },
        {
          "id": "vistadome",
          "name": "Kereta Vistadome PP",
          "amount": 1630000,
          "description": "Upgrade kereta peserta pada dua arah, sesuai jadwal yang tersedia."
        },
        {
          "id": "palcoyo",
          "name": "Tur Palcoyo",
          "amount": 1830000,
          "description": "Mengisi hari bebas di Cusco. Detail layanan dan jumlah peserta dikonfirmasi kembali."
        }
      ],
      "basisNote": "Kendaraan kunjungan untuk grup sendiri; kereta, bus situs dan cable car menggunakan layanan umum.",
      "groups": [
        {
          "groupSize": 10,
          "from": 181400000,
          "optionPrices": {
            "hotel-4": 10640000,
            "vistadome": 1630000,
            "palcoyo": 1830000
          },
          "roomNote": "5 kamar berdua untuk peserta.",
          "landOnlyFrom": 78000000
        },
        {
          "groupSize": 15,
          "from": 155500000,
          "optionPrices": {
            "hotel-4": 7100000,
            "vistadome": 1630000,
            "palcoyo": 1830000
          },
          "roomNote": "7 kamar berdua + 1 kamar bersama tour leader untuk peserta ke-15.",
          "landOnlyFrom": 52000000
        },
        {
          "groupSize": 20,
          "from": 152600000,
          "optionPrices": {
            "hotel-4": 6390000,
            "vistadome": 1630000,
            "palcoyo": 1830000
          },
          "roomNote": "10 kamar berdua untuk peserta.",
          "landOnlyFrom": 49100000
        }
      ]
    },
    "days": [
      {
        "title": "Tiba di São Paulo",
        "description": "Penjemputan di GRU, transfer privat ke hotel, dan istirahat sebelum rangkaian lintas negara.",
        "overnight": "São Paulo"
      },
      {
        "title": "São Paulo → Bogotá → Lima",
        "description": "Terbang melalui Bogotá. City tour saat stopover bila koneksi menyediakan waktu yang cukup, lalu penerbangan ke Lima dan transfer hotel larut malam.",
        "overnight": "Lima"
      },
      {
        "title": "Lima → Cusco",
        "description": "City tour Lima ke Plaza de Armas dan Huaca Pucllana. Transfer bandara, terbang ke Cusco, lalu ke hotel.",
        "overnight": "Cusco"
      },
      {
        "title": "Cusco → Aguas Calientes",
        "description": "Perjalanan darat ke stasiun Ollantaytambo dilanjutkan kereta Expedition. Bermalam di Aguas Calientes sebelum kunjungan Machu Picchu.",
        "overnight": "Aguas Calientes"
      },
      {
        "title": "Machu Picchu → Cusco",
        "description": "Kunjungan Machu Picchu bersama pemandu, termasuk bus dan tiket masuk. Kembali dengan kereta dan transfer ke Cusco.",
        "overnight": "Cusco"
      },
      {
        "title": "Sehari di Cusco",
        "description": "Hari bebas untuk istirahat atau menikmati kota. Tur Palcoyo tersedia sebagai pilihan tambahan dengan biaya terpisah.",
        "overnight": "Cusco"
      },
      {
        "title": "Cusco → Santiago",
        "description": "Transfer bandara, penerbangan menuju Chile, lalu penjemputan dan transfer ke hotel di Santiago.",
        "overnight": "Santiago"
      },
      {
        "title": "Trekking di Andes",
        "description": "Trekking sehari dengan pemandu ke kawasan Embalse el Yeso / Laguna Negra. Peserta perlu siap berjalan kaki di pegunungan. Rute dan akses mengikuti cuaca, kondisi jalan dan kemampuan grup.",
        "overnight": "Santiago"
      },
      {
        "title": "Santiago → Rio de Janeiro",
        "description": "Penerbangan pagi ke Rio. Rangkaian kunjungan mencakup Maracanã, Sugarloaf, Copacabana dan Ipanema, disesuaikan jam kedatangan.",
        "overnight": "Rio de Janeiro"
      },
      {
        "title": "Rio de Janeiro",
        "description": "Christ the Redeemer, Selarón, Botanical Garden, Royal Portuguese Reading Room dan Metropolitan Cathedral dalam rangkaian city tour.",
        "overnight": "Rio de Janeiro"
      },
      {
        "title": "Rio → Iguazu",
        "description": "Terbang ke Foz do Iguaçu, transfer hotel, lalu kunjungan air terjun sisi Brasil. Sisi Argentina tidak masuk paket dasar.",
        "overnight": "Foz do Iguaçu"
      },
      {
        "title": "Iguazu → São Paulo",
        "description": "Penerbangan kembali ke São Paulo, transfer dan city tour sebelum malam terakhir di Brasil.",
        "overnight": "São Paulo"
      },
      {
        "title": "São Paulo → perjalanan pulang",
        "description": "Transfer hotel ke bandara GRU. Layanan darat berakhir di bandara; lanjutkan penerbangan pulang sesuai rencana perjalananmu.",
        "overnight": "Perjalanan pulang"
      }
    ],
    "included": [
      "12 malam hotel sesuai susunan kamar grup, dengan sarapan sesuai jadwal dan jam layanan hotel.",
      "Transfer privat, kendaraan kunjungan dan pemandu lokal berbahasa Inggris sesuai itinerary.",
      "1 tour leader dari Indonesia, mendampingi perjalanan grup.",
      "Kereta Expedition PP, bus serta tiket Machu Picchu sesuai sirkuit yang tersedia.",
      "Kunjungan dan tiket yang tercantum pada itinerary, termasuk Iguazu sisi Brasil."
    ],
    "excluded": [
      "Makan siang, makan malam, minuman, tip dan pengeluaran pribadi.",
      "Asuransi perjalanan, visa atau dokumen transit bila diperlukan.",
      "Palcoyo, upgrade hotel/kereta, kamar sendiri di luar susunan kamar paket dan tambahan malam.",
      "Iguazu sisi Argentina; perlu rute dan tambahan malam tersendiri.",
      "Kelebihan bagasi serta biaya Wi-Fi yang tidak termasuk tarif maskapai."
    ],
    "hotels": [
      {
        "city": "São Paulo",
        "nights": 2,
        "note": "Slim Frei Caneca atau setara"
      },
      {
        "city": "Lima",
        "nights": 1,
        "note": "Casa Andina Standard San Antonio atau setara"
      },
      {
        "city": "Cusco",
        "nights": 3,
        "note": "Jose Antonio Cusco atau setara"
      },
      {
        "city": "Aguas Calientes",
        "nights": 1,
        "note": "Casa Andina Standard Machu Picchu atau setara"
      },
      {
        "city": "Santiago",
        "nights": 2,
        "note": "Hampton by Hilton Las Condes atau setara"
      },
      {
        "city": "Rio de Janeiro",
        "nights": 2,
        "note": "Windsor Martinique atau setara"
      },
      {
        "city": "Foz do Iguaçu",
        "nights": 1,
        "note": "Viale Tower atau setara"
      }
    ],
    "gallery": [
      {
        "src": "/images/latin-america/iguazu-falls-1280.webp",
        "alt": "Air terjun Iguazu dilihat dari sisi Brasil",
        "caption": "Brasil · Iguazu"
      },
      {
        "src": "/images/latin-america/machu-picchu-panorama-1280.webp",
        "alt": "Machu Picchu dengan puncak Huayna Picchu",
        "caption": "Peru · Machu Picchu"
      },
      {
        "src": "/images/latin-america/rio-de-janeiro-sunrise-1280.webp",
        "alt": "Rio de Janeiro dan Sugarloaf saat matahari terbit",
        "caption": "Brasil · Rio de Janeiro"
      }
    ],
    "flightRoute": "Jakarta ↔ Doha ↔ São Paulo · GRU–BOG–LIM–CUZ–SCL–GIG–IGU–GRU",
    "flightNote": "Prioritas Qatar Airways untuk Jakarta–Doha–São Paulo. Penerbangan regional memakai operator yang melayani tiap rute. Bagasi, waktu transit dan Wi-Fi diperiksa per segmen; stopover Bogotá membutuhkan jadwal yang memadai.",
    "englishSummary": "Explore Brazil, Colombia, Peru and Chile. Choose a 16-day package from Jakarta with flights or a 13-day land-only tour starting and ending in São Paulo, with 12 hotel nights. Both include local guides and an Indonesian tour leader, for groups of 10, 15 or 20 travellers. Land-only excludes all participant flights, including the seven regional sectors. The Bogotá visit depends on the flight schedule; final arrangements are confirmed in your written quotation.",
    "flightInclusions": "Tiket Jakarta–São Paulo PP dan 7 penerbangan regional untuk rangkaian empat negara.",
    "landTour": {
      "duration": "13 hari di Amerika Selatan · 12 malam hotel",
      "meetingPoint": "Bandara São Paulo (GRU)",
      "finishPoint": "Bandara São Paulo (GRU)",
      "flightSectors": [
        "São Paulo → Bogotá",
        "Bogotá → Lima",
        "Lima → Cusco",
        "Cusco → Santiago",
        "Santiago → Rio de Janeiro",
        "Rio de Janeiro → Foz do Iguaçu",
        "Foz do Iguaçu → São Paulo"
      ]
    }
  }
};
