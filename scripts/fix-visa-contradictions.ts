import { PrismaClient, Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const VERIFIED_AT = new Date("2026-06-28T00:00:00.000Z");
const VERIFIED_AT_BATCH_2 = new Date("2026-06-29T00:00:00.000Z");

type CountryPatch = Prisma.CountryVisaUpdateManyMutationInput;

const SCHENGEN_COUNTRIES = [
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Netherlands",
  "Switzerland",
  "Austria",
  "Belgium",
  "Greece",
  "Portugal",
  "Czech Republic",
  "Hungary",
  "Poland",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Slovakia",
  "Slovenia",
  "Estonia",
  "Latvia",
  "Lithuania",
  "Malta",
  "Iceland",
];

const sourceOnlyFix = (
  en: string,
  sourceUrl: string,
  conditions: string[] = ["Paspor dan dokumen perjalanan tetap harus memenuhi syarat imigrasi"],
): { en: string; data: CountryPatch } => ({
  en,
  data: {
    conditions,
    sourceUrl,
    lastVerifiedAt: VERIFIED_AT_BATCH_2,
  },
});

const BASE_FIXES: Array<{ en: string; data: CountryPatch }> = [
  {
    en: "Japan",
    data: {
      visa: "conditional",
      stay: "15 hari (waiver) / sesuai visa",
      cost: "Mulai Rp 300.000",
      officialFee: "Gratis untuk visa waiver; biaya visa reguler mengikuti jenis visa",
      servicePrice: "Mulai Rp 300.000",
      notes:
        "Bebas visa hanya untuk e-paspor Indonesia yang sudah registrasi waiver. Paspor biasa atau e-paspor tanpa registrasi tetap perlu visa.",
      conditions: [
        "Khusus e-paspor ICAO Indonesia yang sudah registrasi visa waiver",
        "Masa tinggal waiver maksimal 15 hari",
        "Paspor biasa atau e-paspor tanpa registrasi tetap perlu visa",
      ],
      sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html",
      lastVerifiedAt: VERIFIED_AT,
    },
  },
  {
    en: "Taiwan",
    data: {
      visa: "conditional",
      stay: "30 hari (TAC) / sesuai visa",
      cost: "Mulai Rp 300.000",
      officialFee: "Gratis untuk Travel Authorization Certificate; visa reguler mengikuti TETO",
      servicePrice: "Mulai Rp 300.000",
      notes:
        "Travel Authorization Certificate Taiwan bersifat bersyarat, bukan e-Visa umum. Jika tidak memenuhi syarat TAC, ajukan visa reguler via TETO.",
      conditions: [
        "TAC hanya untuk pemohon yang memenuhi kriteria BOCA",
        "Jika tidak memenuhi TAC, gunakan visa reguler via TETO",
        "Masa tinggal TAC maksimal 30 hari",
      ],
      sourceUrl: "https://www.boca.gov.tw/cp-152-274-8c0e2-2.html",
      lastVerifiedAt: VERIFIED_AT,
    },
  },
  {
    en: "Nepal",
    data: {
      visa: "voa",
      stay: "15/30/90 hari",
      cost: "Rp 300.000",
      officialFee: "USD 30/50/125",
      servicePrice: "Rp 300.000",
      notes:
        "Tourist visa on arrival tersedia di Tribhuvan Airport dan border utama. Siapkan paspor, foto, tiket pulang, dan biaya sesuai durasi.",
      conditions: [
        "Durasi VOA tersedia 15, 30, atau 90 hari",
        "Biaya resmi berbeda sesuai durasi tinggal",
        "Keputusan akhir tetap di petugas imigrasi Nepal",
      ],
      sourceUrl: "https://ntb.gov.np/plan-your-trip/before-you-come/tourist-visa",
      lastVerifiedAt: VERIFIED_AT,
    },
  },
  {
    en: "Kyrgyzstan",
    data: {
      visa: "bebas",
      stay: "30 hari (dalam periode 60 hari)",
      cost: "Gratis",
      officialFee: "Gratis",
      servicePrice: null,
      notes:
        "Bebas visa 30 hari dalam periode 60 hari. Untuk tinggal lebih lama, cek jalur e-Visa atau izin lain sebelum berangkat.",
      conditions: [
        "Bebas visa maksimal 30 hari dalam periode 60 hari",
        "Tinggal lebih lama perlu cek e-Visa/izin lain",
      ],
      sourceUrl: "https://www.evisa.e-gov.kg/get_information.php?lng=en",
      lastVerifiedAt: VERIFIED_AT,
    },
  },
  {
    en: "Tajikistan",
    data: {
      visa: "conditional",
      stay: "30 hari bebas visa / 60 hari e-Visa",
      cost: "Gratis / USD 30",
      officialFee: "Gratis untuk bebas visa 30 hari; e-Visa mulai USD 30",
      servicePrice: null,
      notes:
        "WNI masuk daftar bebas visa Tajikistan 30 hari. e-Visa tetap relevan untuk kebutuhan tinggal lebih lama atau izin khusus seperti GBAO.",
      conditions: [
        "Bebas visa maksimal 30 hari",
        "e-Visa diperlukan untuk kebutuhan tertentu atau tinggal lebih lama",
        "Izin GBAO diperlukan jika masuk wilayah Pamir/GBAO",
      ],
      sourceUrl: "https://mfa.tj/en/brussels/view/9213/visa-free-travel-to-tajikistan",
      lastVerifiedAt: VERIFIED_AT,
    },
  },
  {
    en: "Saudi Arabia",
    data: {
      visa: "conditional",
      stay: "90 hari (maks. 180/tahun)",
      cost: "Mulai Rp 2.500.000",
      officialFee: "SAR 535 (~USD 140)",
      servicePrice: "Mulai Rp 2.500.000",
      notes:
        "e-Visa turis Saudi bersifat bersyarat untuk sebagian WNI. Jika tidak memenuhi syarat e-Visa, gunakan jalur visa sesuai tujuan perjalanan.",
      conditions: [
        "e-Visa turis tidak boleh dianggap otomatis untuk semua WNI",
        "Cek syarat berdasarkan riwayat visa, tujuan perjalanan, dan jalur masuk",
        "Aturan dapat berubah cepat menjelang musim umrah/haji",
      ],
      sourceUrl: "https://visa.visitsaudi.com/",
      lastVerifiedAt: VERIFIED_AT,
    },
  },
  {
    en: "Oman",
    data: {
      visa: "conditional",
      stay: "14 hari bebas visa / 30 hari e-Visa",
      cost: "Gratis / OMR 20",
      officialFee: "Gratis untuk bebas visa 14 hari; OMR 20 untuk e-Visa 30 hari",
      servicePrice: null,
      notes:
        "WNI dapat memakai bebas visa 14 hari untuk kunjungan singkat. Untuk tinggal 30 hari, gunakan e-Visa Oman.",
      conditions: [
        "Bebas visa hanya untuk kunjungan singkat sampai 14 hari",
        "e-Visa diperlukan untuk masa tinggal 30 hari",
        "Paspor dan dokumen perjalanan tetap harus memenuhi syarat masuk",
      ],
      sourceUrl: "https://evisa.rop.gov.om/",
      lastVerifiedAt: VERIFIED_AT,
    },
  },
  {
    en: "Brazil",
    data: {
      visa: "bebas",
      stay: "30 hari",
      cost: "Gratis",
      officialFee: "Gratis",
      servicePrice: null,
      notes:
        "Bebas visa 30 hari untuk kunjungan wisata singkat. Verifikasi durasi final sebelum berangkat karena aturan dapat berubah.",
      conditions: [
        "Paspor berlaku dan dokumen perjalanan lengkap",
        "Durasi final mengikuti izin imigrasi saat masuk",
      ],
      sourceUrl: "https://www.gov.br/mre/",
      lastVerifiedAt: VERIFIED_AT,
    },
  },
  {
    en: "Peru",
    data: {
      visa: "bebas",
      stay: "90 hari",
      cost: "Gratis",
      officialFee: "Gratis",
      servicePrice: null,
      notes:
        "Bebas visa 90 hari untuk kunjungan wisata singkat. Verifikasi durasi final sebelum berangkat karena izin masuk dapat ditentukan petugas imigrasi.",
      conditions: [
        "Paspor berlaku dan dokumen perjalanan lengkap",
        "Durasi final mengikuti izin imigrasi saat masuk",
      ],
      sourceUrl: "https://www.gob.pe/rree",
      lastVerifiedAt: VERIFIED_AT,
    },
  },
  {
    en: "Chile",
    data: {
      visa: "bebas",
      stay: "60 hari",
      cost: "Gratis",
      officialFee: "Gratis",
      servicePrice: null,
      notes:
        "Bebas visa 60 hari untuk kunjungan wisata singkat. Verifikasi durasi final sebelum berangkat karena izin masuk dapat ditentukan petugas imigrasi.",
      conditions: [
        "Paspor berlaku dan dokumen perjalanan lengkap",
        "Durasi final mengikuti izin imigrasi saat masuk",
      ],
      sourceUrl: "https://www.serviciosconsulares.cl/",
      lastVerifiedAt: VERIFIED_AT,
    },
  },
  {
    en: "South Africa",
    data: {
      visa: "conditional",
      stay: "Maks. 90 hari",
      cost: "Mulai Rp 300.000",
      officialFee: "IDR 462.000 untuk visitor visa; ETA cek situs resmi",
      servicePrice: "Mulai Rp 300.000",
      notes:
        "Paspor biasa Indonesia masih memerlukan visitor visa sampai perjanjian bebas visa diterapkan. ETA direkomendasikan sebagai jalur pengajuan online yang lebih cepat.",
      conditions: [
        "Paspor biasa Indonesia masih perlu visitor visa/ETA",
        "Bebas visa 30 hari hanya untuk paspor diplomatik dan dinas",
        "ETA tersedia lewat situs resmi Department of Home Affairs",
      ],
      sourceUrl: "https://dirco1.azurewebsites.net/jakarta/immigration.html",
      lastVerifiedAt: VERIFIED_AT,
    },
  },
];

const SCHENGEN_FIXES: Array<{ en: string; data: CountryPatch }> = SCHENGEN_COUNTRIES.map((en) => ({
  en,
  data: {
    visa: "wajib",
    stay: "Maks. 90 hari/180 hari",
    cost: "Rp 3.500.000",
    officialFee: "EUR 90 untuk visa Schengen short-stay dewasa",
    servicePrice: "Rp 3.500.000",
    notes:
      "Visa Schengen short-stay berlaku maksimal 90 hari dalam periode 180 hari. Ajukan ke negara tujuan utama atau negara masuk pertama jika durasi sama.",
    conditions: [
      "WNI pemegang paspor biasa perlu visa Schengen untuk kunjungan singkat",
      "Batas tinggal short-stay maksimal 90 hari dalam periode 180 hari",
      "Biaya dan pengecualian dapat berbeda untuk anak, keluarga warga EU/EEA, atau kategori khusus",
    ],
    sourceUrl: "https://home-affairs.ec.europa.eu/policies/schengen/visa-policy/applying-schengen-visa_en",
    lastVerifiedAt: VERIFIED_AT_BATCH_2,
  },
}));

const BATCH_2_FIXES: Array<{ en: string; data: CountryPatch }> = [
  sourceOnlyFix("Singapore", "https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements", [
    "SG Arrival Card tetap wajib diisi sebelum kedatangan",
    "Izin masuk akhir ditentukan petugas ICA di Singapura",
  ]),
  sourceOnlyFix("Malaysia", "https://malaysiavisa.imi.gov.my/", [
    "Bebas visa untuk kunjungan sosial singkat",
    "Izin masuk akhir ditentukan petugas Imigresen Malaysia",
  ]),
  sourceOnlyFix("Thailand", "https://www.thaievisa.go.th/", [
    "Skema visa exemption Thailand dapat berubah cepat",
    "Pastikan paspor, tiket keluar, dan bukti akomodasi siap saat masuk",
  ]),
  sourceOnlyFix("Hong Kong", "https://www.immd.gov.hk/eng/services/visas/visit-transit/visit-visa-entry-permit.html", [
    "Hong Kong memiliki kebijakan imigrasi sendiri, terpisah dari visa China daratan",
    "Izin masuk akhir ditentukan petugas Immigration Department",
  ]),
  sourceOnlyFix("Macao SAR", "https://www.gov.mo/en/services/ps-1474/", [
    "Macao memiliki kebijakan imigrasi sendiri, terpisah dari visa China daratan",
    "Izin masuk akhir ditentukan petugas Public Security Police Force",
  ]),
  {
    en: "South Korea",
    data: {
      visa: "wajib",
      stay: "Sesuai visa",
      cost: "Mulai Rp 1.550.000",
      officialFee: "Cek Kedutaan/KVAC untuk fee resmi terbaru",
      servicePrice: "Mulai Rp 1.550.000",
      notes:
        "Paspor biasa Indonesia perlu visa Korea Selatan untuk wisata. Layanan Sundaf dipisahkan dari biaya resmi kedutaan/KVAC.",
      conditions: [
        "Visa turis C-3 diajukan melalui jalur resmi Kedutaan/KVAC",
        "K-ETA tidak menggantikan visa untuk pemegang paspor biasa Indonesia yang tidak eligible",
      ],
      sourceUrl: "https://www.visa.go.kr/",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "China",
    data: {
      visa: "wajib",
      stay: "Sesuai visa",
      cost: "Mulai Rp 1.450.000",
      officialFee: "Cek Chinese Visa Application Service Center",
      servicePrice: "Mulai Rp 1.450.000",
      notes:
        "Paspor biasa Indonesia perlu visa China untuk wisata, kecuali skema transit bebas visa yang memenuhi syarat dan rute tertentu.",
      conditions: [
        "Visa turis L diperlukan untuk kunjungan wisata reguler",
        "Transit bebas visa hanya berlaku jika memenuhi syarat rute, tiket lanjutan, dan kota/port tertentu",
      ],
      sourceUrl: "https://www.visaforchina.cn/",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "India",
    data: {
      visa: "evisa",
      stay: "30 / 90 / 365 hari",
      cost: "Rp 550.000",
      officialFee: "Gratis untuk e-Tourist Visa 30 hari bagi WNI; cek tabel resmi untuk tipe lain",
      servicePrice: "Rp 550.000",
      notes:
        "India memakai e-Tourist Visa via portal resmi. Biaya resmi harus dipisahkan dari biaya layanan Sundaf.",
      conditions: [
        "Ajukan hanya lewat portal resmi Indian Visa Online",
        "Durasi dan masa berlaku mengikuti tipe e-Tourist Visa yang dipilih",
        "Biaya resmi dapat berbeda untuk tipe 1 tahun, 5 tahun, atau kewarganegaraan lain",
      ],
      sourceUrl: "https://indianvisaonline.gov.in/evisa/tvoa.html",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "Sri Lanka",
    data: {
      visa: "evisa",
      stay: "30 hari",
      cost: "Gratis",
      officialFee: "Gratis untuk ETA/tourist visa 30 hari mulai 25 Mei 2026",
      servicePrice: null,
      notes:
        "Sri Lanka memberlakukan bebas biaya ETA/tourist visa 30 hari untuk WNI per 25 Mei 2026. Tetap cek portal resmi sebelum berangkat.",
      conditions: [
        "Kebijakan gratis berlaku untuk kunjungan wisata 30 hari sesuai pengumuman resmi",
        "Aturan dapat berubah, terutama untuk durasi lebih panjang atau tujuan non-wisata",
      ],
      sourceUrl: "https://www.immigration.gov.lk/pages_e.php?id=14",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "Jordan",
    data: {
      visa: "voa",
      stay: "30 hari",
      cost: "JD 40",
      officialFee: "JD 40 untuk single-entry tourist visa; dapat gratis dengan Jordan Pass sesuai syarat",
      servicePrice: null,
      notes:
        "Jordan menyediakan visa on arrival/eVisa untuk kunjungan wisata. Jordan Pass dapat menghapus biaya visa jika memenuhi minimum stay.",
      conditions: [
        "Visa on arrival/eVisa tersedia untuk kunjungan wisata reguler",
        "Jordan Pass hanya relevan jika memenuhi syarat paket dan lama tinggal",
        "Entry point dan keputusan akhir tetap mengikuti otoritas Jordan",
      ],
      sourceUrl: "https://eservices.moi.gov.jo/MOI_EVISA/",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "Egypt",
    data: {
      visa: "evisa",
      stay: "30 hari",
      cost: "Mulai Rp 2.100.000",
      officialFee: "USD 25 single entry / USD 60 multiple entry",
      servicePrice: "Mulai Rp 2.100.000",
      notes:
        "Paspor biasa Indonesia dapat memakai e-Visa Mesir untuk kunjungan wisata. Biaya resmi e-Visa dipisahkan dari layanan Sundaf.",
      conditions: [
        "Ajukan lewat portal resmi Egypt e-Visa",
        "Visa on arrival tidak boleh diasumsikan untuk semua kondisi perjalanan",
        "Masa tinggal dan jumlah masuk mengikuti tipe e-Visa yang dipilih",
      ],
      sourceUrl: "https://www.visa2egypt.gov.eg/",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "Kenya",
    data: {
      visa: "evisa",
      stay: "90 hari",
      cost: "USD 30",
      officialFee: "Cek portal resmi eTA Kenya",
      servicePrice: null,
      notes:
        "Kenya memakai Electronic Travel Authorization (eTA), bukan visa tempel lama. Pengajuan dilakukan sebelum berangkat via portal resmi.",
      conditions: [
        "eTA wajib diajukan sebelum perjalanan kecuali kategori yang dikecualikan",
        "Persetujuan eTA bukan jaminan masuk; keputusan akhir di imigrasi Kenya",
      ],
      sourceUrl: "https://www.etakenya.go.ke/",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "Tanzania",
    data: {
      visa: "voa",
      stay: "90 hari",
      cost: "USD 50",
      officialFee: "USD 50 untuk ordinary/tourist visa single entry",
      servicePrice: null,
      notes:
        "Tanzania menyediakan e-Visa dan visa on arrival untuk kunjungan wisata. e-Visa disarankan untuk mengurangi risiko antrean.",
      conditions: [
        "Visa on arrival tersedia di bandara dan perbatasan tertentu",
        "e-Visa tetap tersedia sebagai jalur pra-keberangkatan",
        "Paspor harus berlaku minimal 6 bulan",
      ],
      sourceUrl: "https://visa.immigration.go.tz/",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "Rwanda",
    data: {
      visa: "voa",
      stay: "30 hari",
      cost: "USD 50",
      officialFee: "USD 50 untuk single-entry visitor visa; USD 70 untuk multiple-entry",
      servicePrice: null,
      notes:
        "Rwanda memberi visa on arrival untuk semua negara, tetapi WNI tidak boleh ditulis sebagai bebas visa umum tanpa pengecualian fee.",
      conditions: [
        "Visa on arrival tersedia untuk semua negara",
        "Single-entry visitor visa berlaku 30 hari",
        "Multiple-entry visitor visa dapat berlaku 90 hari dengan fee berbeda",
      ],
      sourceUrl: "https://www.migration.gov.rw/visa/visitors-visa",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "Russia",
    data: {
      visa: "evisa",
      stay: "30 hari",
      cost: "Rp 1.500.000",
      officialFee: "Cek portal resmi e-Visa Rusia",
      servicePrice: "Rp 1.500.000",
      notes:
        "Rusia memakai unified e-Visa untuk WNI. Masa tinggal e-Visa 30 hari, tetapi kondisi perjalanan perlu dicek ulang karena aturan dapat berubah.",
      conditions: [
        "Ajukan lewat portal resmi Kementerian Luar Negeri Rusia",
        "e-Visa hanya berlaku untuk tujuan dan port masuk yang diizinkan",
        "Kondisi geopolitik dapat memengaruhi rute dan penerimaan aplikasi",
      ],
      sourceUrl: "https://evisa.kdmid.ru/",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "United Kingdom",
    data: {
      visa: "wajib",
      stay: "Maks. 6 bulan",
      cost: "Mulai Rp 4.300.000",
      officialFee: "Cek GOV.UK visa fees untuk Standard Visitor",
      servicePrice: "Mulai Rp 4.300.000",
      notes:
        "Paspor biasa Indonesia perlu Standard Visitor visa untuk kunjungan wisata ke Inggris. Biometrik wajib di jalur resmi UKVI/VFS.",
      conditions: [
        "Visa visitor tidak boleh dipakai untuk bekerja atau tinggal jangka panjang",
        "Biaya resmi berubah mengikuti GOV.UK visa fees",
        "Priority/Super Priority adalah layanan tambahan, bukan jaminan persetujuan",
      ],
      sourceUrl: "https://www.gov.uk/standard-visitor",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "United States",
    data: {
      visa: "wajib",
      stay: "Maks. 6 bulan (B1/B2)",
      cost: "Rp 4.300.000",
      officialFee: "USD 185 untuk visa visitor B1/B2",
      servicePrice: "Rp 4.300.000",
      notes:
        "Paspor biasa Indonesia perlu visa B1/B2 untuk wisata/bisnis singkat. Wawancara dan keputusan akhir mengikuti Kedutaan/Konsulat AS.",
      conditions: [
        "Appointment dan DS-160 dilakukan melalui jalur resmi",
        "Fee MRV tidak dikembalikan meski visa ditolak",
        "Durasi izin tinggal ditentukan petugas CBP saat masuk",
      ],
      sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/fees-visa-services.html",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "Canada",
    data: {
      visa: "wajib",
      stay: "Maks. 6 bulan",
      cost: "Rp 3.600.000",
      officialFee: "CAD 100 visa visitor + CAD 85 biometrik jika wajib",
      servicePrice: "Rp 3.600.000",
      notes:
        "Paspor biasa Indonesia perlu visitor visa Canada. Biometrik biasanya wajib dan dibayar terpisah dari biaya aplikasi.",
      conditions: [
        "Pengajuan dilakukan lewat akun resmi IRCC",
        "Biometrik dilakukan di VAC/VFS jika diminta",
        "Durasi izin tinggal ditentukan petugas perbatasan Canada",
      ],
      sourceUrl: "https://ircc.canada.ca/english/information/fees/fees.asp",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "Australia",
    data: {
      visa: "wajib",
      stay: "Maks. 3 bulan (turis)",
      cost: "Mulai Rp 3.400.000",
      officialFee: "Cek ImmiAccount untuk Visitor visa subclass 600",
      servicePrice: "Mulai Rp 3.400.000",
      notes:
        "Paspor biasa Indonesia perlu Visitor visa subclass 600 untuk wisata Australia. Biometrik dapat diminta melalui VFS.",
      conditions: [
        "Ajukan melalui ImmiAccount resmi Department of Home Affairs",
        "Biaya resmi dan dokumen dapat berubah sesuai stream dan lokasi pemohon",
        "Masa tinggal mengikuti grant letter",
      ],
      sourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "New Zealand",
    data: {
      visa: "wajib",
      stay: "Sesuai visa",
      cost: "Mulai Rp 5.800.000",
      officialFee: "Cek Immigration New Zealand untuk Visitor Visa dan IVL",
      servicePrice: "Mulai Rp 5.800.000",
      notes:
        "NZeTA tidak berlaku untuk paspor biasa Indonesia. WNI perlu Visitor Visa sebelum berangkat.",
      conditions: [
        "Ajukan melalui portal resmi Immigration New Zealand",
        "IVL dapat dikenakan bersama biaya aplikasi",
        "Masa tinggal mengikuti visa grant",
      ],
      sourceUrl: "https://www.immigration.govt.nz/new-zealand-visas/visas/visa/visitor-visa",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  sourceOnlyFix("Turkey", "https://www.evisa.gov.tr/en/apply/", [
    "Paspor biasa Indonesia mendapat bebas visa untuk kunjungan singkat",
    "Pastikan paspor berlaku minimal 6 bulan dan tiket keluar tersedia",
  ]),
  sourceOnlyFix("Qatar", "https://visitqatar.com/intl-en/practical-info/visas", [
    "Visa waiver diberikan saat tiba jika memenuhi syarat dokumen",
    "Akomodasi, tiket pulang, atau asuransi dapat diminta sesuai kebijakan Qatar",
  ]),
  sourceOnlyFix("Bahrain", "https://www.evisa.gov.bh/", [
    "eVisa atau visa on arrival tergantung paspor, rute, dan kategori kunjungan",
    "Gunakan portal resmi NPRA untuk cek fee dan eligibility terbaru",
  ]),
  sourceOnlyFix("Iran", "https://evisa.mfa.ir/en/", [
    "Skema bebas visa Iran untuk WNI berlaku untuk kunjungan singkat",
    "Situasi keamanan dan rute penerbangan perlu dicek ulang sebelum berangkat",
  ]),
  sourceOnlyFix("Mexico", "https://embamex.sre.gob.mx/indonesia/index.php/en/consular-services/visas", [
    "WNI perlu visa Mexico kecuali memegang visa/izin tinggal tertentu yang diakui",
    "Pengecualian umum meliputi visa/izin tinggal US, Canada, Schengen, UK, atau Jepang yang masih berlaku",
  ]),
  {
    en: "Argentina",
    data: {
      visa: "conditional",
      stay: "Sesuai visa / AVE",
      cost: "Mulai Rp 4.600.000",
      officialFee: "Cek Kedutaan Argentina atau portal AVE resmi",
      servicePrice: "Mulai Rp 4.600.000",
      notes:
        "WNI perlu visa Argentina, kecuali memenuhi syarat AVE elektronik berbasis visa US yang masih berlaku.",
      conditions: [
        "AVE hanya untuk pemohon yang memenuhi syarat dokumen pendukung tertentu",
        "Jika tidak eligible AVE, gunakan visa kedutaan",
        "Biaya dan proses berbeda antara visa tempel dan AVE",
      ],
      sourceUrl: "https://cancilleria.gob.ar/en/services/visas/tourist-visa",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  sourceOnlyFix("Colombia", "https://www.cancilleria.gov.co/tramites_servicios/visa/requisitos", [
    "Bebas visa untuk kunjungan singkat hanya untuk tujuan yang diizinkan",
    "Izin masuk akhir ditentukan otoritas migrasi Colombia",
  ]),
  sourceOnlyFix("Morocco", "https://www.acces-maroc.ma/#/", [
    "Bebas visa untuk WNI berlaku untuk kunjungan singkat",
    "Pastikan paspor, tiket keluar, dan bukti akomodasi tersedia",
  ]),
  sourceOnlyFix("Fiji", "https://www.immigration.gov.fj/travel-requirements/visa-exempted-countries", [
    "WNI termasuk daftar negara bebas visa Fiji untuk kunjungan singkat",
    "Izin masuk akhir tetap mengikuti petugas imigrasi Fiji",
  ]),
  sourceOnlyFix("Vietnam", "https://evisa.gov.vn/", [
    "WNI mendapat bebas visa untuk kunjungan singkat sesuai kebijakan Vietnam",
    "e-Visa tetap relevan untuk durasi atau tujuan yang tidak masuk skema bebas visa",
  ]),
  sourceOnlyFix("Philippines", "https://evisa.gov.ph/page/policy", [
    "Bebas visa berlaku untuk kunjungan singkat yang memenuhi syarat",
    "Izin masuk akhir ditentukan Bureau of Immigration Philippines",
  ]),
  sourceOnlyFix("Brunei", "https://www.immigration.gov.bn/", [
    "Bebas visa berlaku untuk kunjungan singkat yang memenuhi syarat",
    "Perpanjangan atau tujuan non-wisata mengikuti Imigresen Brunei",
  ]),
  sourceOnlyFix("Cambodia", "https://www.evisa.gov.kh/", [
    "WNI mendapat bebas visa ASEAN untuk kunjungan singkat",
    "e-Visa Cambodia tetap relevan untuk paspor/tujuan yang tidak memenuhi bebas visa",
  ]),
  sourceOnlyFix("Laos", "https://laoevisa.gov.la/", [
    "WNI mendapat bebas visa ASEAN untuk kunjungan singkat",
    "e-Visa Laos tetap relevan untuk paspor/tujuan yang tidak memenuhi bebas visa",
  ]),
  sourceOnlyFix("Myanmar", "https://evisa.moip.gov.mm/", [
    "Kebijakan masuk Myanmar dapat berubah karena situasi politik dan keamanan",
    "Cek portal resmi sebelum menjual atau menerbitkan itinerary",
  ]),
  sourceOnlyFix("Timor-Leste", "https://migracao.gov.tl/", [
    "Bebas visa berlaku untuk kunjungan singkat yang memenuhi syarat",
    "Izin masuk akhir ditentukan Serviço de Migração Timor-Leste",
  ]),
  {
    en: "Mongolia",
    data: {
      visa: "evisa",
      stay: "30 hari",
      cost: "~USD 50",
      officialFee: "Cek portal resmi e-Visa Mongolia",
      servicePrice: null,
      notes:
        "WNI menggunakan e-Visa Mongolia untuk kunjungan wisata. Tarif resmi perlu dicek langsung di portal karena dapat berubah.",
      conditions: [
        "Ajukan lewat portal resmi e-Visa Mongolia",
        "Masa tinggal dan jumlah masuk mengikuti tipe visa yang disetujui",
      ],
      sourceUrl: "https://evisa.mn/",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  sourceOnlyFix("Maldives", "https://immigration.gov.mv/visa/tourist-visa/", [
    "Tourist visa diberikan saat kedatangan jika memenuhi syarat masuk",
    "Tiket keluar, akomodasi, dan bukti dana dapat diminta",
  ]),
  {
    en: "Bangladesh",
    data: {
      visa: "voa",
      stay: "30 hari",
      cost: "~USD 51",
      officialFee: "Cek Department of Immigration & Passports Bangladesh",
      servicePrice: null,
      notes:
        "VOA Bangladesh bersifat diskresioner. Pemohon harus siap dengan tiket pulang, bukti dana, dan akomodasi.",
      conditions: [
        "Visa on arrival tidak boleh dianggap jaminan masuk",
        "Petugas imigrasi dapat meminta dokumen pendukung tambahan",
      ],
      sourceUrl: "https://dip.gov.bd/",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "Pakistan",
    data: {
      visa: "evisa",
      stay: "90 hari",
      cost: "~USD 20",
      officialFee: "Cek kalkulator resmi Pakistan Online Visa System",
      servicePrice: null,
      notes:
        "Pakistan memakai Online Visa System. Status bebas biaya/berbayar harus dicek ulang di portal resmi sebelum menjual layanan.",
      conditions: [
        "Ajukan lewat Pakistan Online Visa System",
        "Fee mengikuti tipe visa, durasi, dan kewarganegaraan",
      ],
      sourceUrl: "https://visa.nadra.gov.pk/",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  sourceOnlyFix("Uzbekistan", "https://e-visa.gov.uz/main", [
    "WNI masuk daftar bebas visa untuk kunjungan singkat",
    "Registrasi tempat tinggal dapat berlaku untuk masa tinggal tertentu",
  ]),
  sourceOnlyFix("Kazakhstan", "https://www.gov.kz/memleket/entities/mfa/press/article/details/6764", [
    "WNI masuk skema bebas visa Kazakhstan untuk kunjungan singkat",
    "Aturan registrasi dan durasi tinggal perlu dicek untuk perjalanan panjang",
  ]),
  {
    en: "Georgia",
    data: {
      visa: "evisa",
      stay: "30 hari",
      cost: "USD 20",
      officialFee: "USD 20 + biaya layanan/verifikasi sesuai portal",
      servicePrice: null,
      notes:
        "WNI tidak termasuk daftar bebas visa Georgia satu tahun, sehingga gunakan e-Visa untuk wisata reguler.",
      conditions: [
        "Ajukan lewat portal resmi e-Visa Georgia",
        "Pemegang visa/izin tinggal tertentu dapat punya jalur pengecualian terpisah",
      ],
      sourceUrl: "https://www.evisa.gov.ge/GeoVisa/",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  sourceOnlyFix("Azerbaijan", "https://evisa.gov.az/en/", [
    "ASAN e-Visa tersedia untuk kunjungan wisata",
    "Visa on arrival hanya tersedia untuk kondisi/kebangsaan tertentu, jadi e-Visa lebih aman",
  ]),
  sourceOnlyFix("Armenia", "https://www.mfa.am/en/visa/", [
    "e-Visa dan visa on arrival Armenia tersedia untuk sejumlah kewarganegaraan",
    "Gunakan portal resmi untuk memilih durasi 21 atau 120 hari",
  ]),
  {
    en: "UAE",
    data: {
      visa: "wajib",
      stay: "30/60 hari sesuai visa",
      cost: "Mulai Rp 2.500.000",
      officialFee: "Mulai AED 252 untuk 30-day tourist visa Dubai; tipe lain bervariasi",
      servicePrice: "Mulai Rp 2.500.000",
      notes:
        "WNI perlu visa UAE yang diatur sebelum berangkat melalui sponsor, maskapai, hotel, atau agen resmi. Tidak boleh ditulis sebagai VOA gratis.",
      conditions: [
        "Biaya resmi bergantung pada sponsor dan jenis visa",
        "Transit visa berbeda dari tourist visa",
        "Persetujuan akhir mengikuti otoritas UAE",
      ],
      sourceUrl: "https://www.gdrfad.gov.ae/en/services/f9e586fe-0642-11ec-0320-0050569629e8",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  sourceOnlyFix("Kuwait", "https://evisa.moi.gov.kw/evisa/home_e.do", [
    "Kuwait tidak boleh diasumsikan bebas visa untuk WNI",
    "Cek eligibility e-Visa dan jalur kedutaan sebelum menjual layanan",
  ]),
  sourceOnlyFix("Ireland", "https://www.irishimmigration.ie/coming-to-visit-ireland/visit-ireland-travel-path/", [
    "Irlandia bukan bagian dari Schengen",
    "Visa Irlandia harus dicek terpisah dari visa Schengen/UK",
  ]),
  sourceOnlyFix("Serbia", "https://www.mfa.gov.rs/en/citizens/travel-serbia/visa-regime", [
    "Bebas visa Serbia untuk WNI berlaku untuk kunjungan singkat",
    "Tujuan non-wisata atau tinggal lebih lama perlu cek izin lain",
  ]),
  {
    en: "Montenegro",
    data: {
      visa: "conditional",
      stay: "Sesuai visa / pengecualian visa holder",
      cost: "Via kedutaan",
      officialFee: "Cek Kedutaan/Konsulat Montenegro",
      servicePrice: null,
      notes:
        "WNI perlu visa Montenegro, kecuali memenuhi pengecualian seperti pemegang visa Schengen/US/UK tertentu yang masih berlaku.",
      conditions: [
        "Pengecualian hanya berlaku jika visa/izin tinggal pendukung masih valid dan memenuhi syarat",
        "Jika tidak memenuhi pengecualian, ajukan visa kedutaan",
      ],
      sourceUrl: "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/indonesia",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "Albania",
    data: {
      visa: "conditional",
      stay: "90 hari",
      cost: "EUR 60 (~USD 65)",
      officialFee: "EUR 60 atau sesuai portal e-Visa Albania",
      servicePrice: null,
      notes:
        "Albania tidak boleh ditulis e-Visa murni karena ada pengecualian untuk pemegang visa/izin tinggal tertentu dan kebijakan musiman yang harus dicek per tahun.",
      conditions: [
        "e-Visa berlaku jika tidak memenuhi pengecualian",
        "Pemegang visa/izin tinggal Schengen, US, atau UK tertentu dapat dikecualikan",
        "Kebijakan musiman harus dicek ulang setiap tahun",
      ],
      sourceUrl: "https://e-visa.al/",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "Bosnia and Herzegovina",
    data: {
      visa: "conditional",
      stay: "Sesuai visa / pengecualian visa holder",
      cost: "Via kedutaan",
      officialFee: "Cek Kedutaan Bosnia dan Herzegovina",
      servicePrice: null,
      notes:
        "WNI perlu visa Bosnia dan Herzegovina, kecuali memenuhi pengecualian seperti pemegang visa Schengen multiple-entry yang masih berlaku.",
      conditions: [
        "Pengecualian hanya berlaku jika visa pendukung masih valid dan memenuhi syarat masuk",
        "Jika tidak memenuhi pengecualian, ajukan visa kedutaan",
      ],
      sourceUrl: "https://mvp.gov.ba/en/vize",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
  {
    en: "North Macedonia",
    data: {
      visa: "conditional",
      stay: "Sesuai visa / pengecualian visa holder",
      cost: "Via kedutaan",
      officialFee: "Cek Kementerian Luar Negeri North Macedonia",
      servicePrice: null,
      notes:
        "WNI perlu visa North Macedonia, kecuali memenuhi pengecualian seperti pemegang Schengen type-C multiple-entry yang masih berlaku.",
      conditions: [
        "Pengecualian visa holder hanya berlaku jika visa masih valid dan memenuhi syarat",
        "Jika tidak memenuhi pengecualian, ajukan visa kedutaan",
      ],
      sourceUrl: "https://mfa.gov.mk/en-GB/konzularni-uslugi/informacii-za-vlez-vo-rsm",
      lastVerifiedAt: VERIFIED_AT_BATCH_2,
    },
  },
];

const FIXES = [...BASE_FIXES, ...SCHENGEN_FIXES, ...BATCH_2_FIXES];

async function backfillSeparatedFees() {
  const countries = await prisma.countryVisa.findMany();
  let count = 0;

  for (const country of countries) {
    const patch: CountryPatch = {};
    const cost = country.cost.trim();
    const notes = country.notes.trim();

    if (!country.servicePrice && /^Layanan kami:/i.test(notes) && cost) {
      patch.servicePrice = cost;
    }

    if (!country.officialFee) {
      if (cost === "Gratis" && country.visa === "bebas") {
        patch.officialFee = "Gratis";
      } else if (
        cost &&
        !/^Mulai Rp/i.test(cost) &&
        !/^Rp/i.test(cost) &&
        !/^Via kedutaan/i.test(cost) &&
        !/^Cek/i.test(cost)
      ) {
        patch.officialFee = cost;
      }
    }

    if (Object.keys(patch).length === 0) continue;
    await prisma.countryVisa.update({ where: { id: country.id }, data: patch });
    count += 1;
  }

  return count;
}

function serializePatchForSeed(data: CountryPatch) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString() : value,
    ]),
  );
}

function updateSeedFile() {
  const seedPath = path.join(process.cwd(), "prisma/visa-seed.json");
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8")) as Array<Record<string, unknown>>;
  let count = 0;

  for (const fix of FIXES) {
    const country = seed.find((entry) => entry.en === fix.en);
    if (!country) continue;

    Object.assign(country, serializePatchForSeed(fix.data));
    count += 1;
  }

  for (const country of seed) {
    const cost = typeof country.cost === "string" ? country.cost : "";
    const visa = typeof country.visa === "string" ? country.visa : "";
    const notes = typeof country.notes === "string" ? country.notes : "";

    if (!country.officialFee) {
      if (cost === "Gratis" && (visa === "bebas" || visa === "voa")) {
        country.officialFee = "Gratis";
      } else if (
        cost &&
        !/^Mulai Rp/i.test(cost) &&
        !/^Rp/i.test(cost) &&
        !/^Via kedutaan/i.test(cost) &&
        !/^Cek/i.test(cost)
      ) {
        country.officialFee = cost;
      }
    }

    if (!country.servicePrice && /^Layanan kami:/i.test(notes) && cost) {
      country.servicePrice = cost;
    }
  }

  fs.writeFileSync(seedPath, `${JSON.stringify(seed, null, 2)}\n`);
  return count;
}

async function main() {
  const backfilled = await backfillSeparatedFees();
  const seedUpdated = updateSeedFile();
  let fixed = 0;

  for (const fix of FIXES) {
    const result = await prisma.countryVisa.updateMany({
      where: { en: fix.en },
      data: fix.data,
    });
    fixed += result.count;
    console.log(`${fix.en}: ${result.count > 0 ? "updated" : "not found"}`);
  }

  console.log(`Backfilled fee fields: ${backfilled}`);
  console.log(`Updated seed records: ${seedUpdated}`);
  console.log(`Corrected countries: ${fixed}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
