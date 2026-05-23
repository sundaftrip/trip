/* Integrasi pricelist Heyvisa ke tabel CountryVisa.
   Harga sudah ditambah markup:
     - +Rp 100.000 untuk harga vendor ≥ Rp 1.000.000
     - +Rp 50.000 untuk harga vendor < Rp 1.000.000
   Cost yang ditampilkan = harga TERMURAH dari paket yang ditawarkan (prefix "Mulai")
   atau harga tunggal kalau cuma satu varian. Detail semua varian masuk ke notes
   dengan prefiks "Layanan kami:" supaya jelas ini adalah penawaran jasa.

   Jalankan: npx tsx --env-file=.env.local scripts/integrate-heyvisa-prices.ts
*/
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface VisaUpdate {
  en: string | string[];
  cost: string;
  notes: string;
}

// 24 negara Eropa Schengen di database — semua pakai harga Heyvisa Schengen.
const SCHENGEN_COUNTRIES = [
  "France", "Germany", "Italy", "Spain", "Netherlands", "Switzerland",
  "Austria", "Belgium", "Greece", "Portugal", "Czech Republic", "Hungary",
  "Poland", "Sweden", "Norway", "Denmark", "Finland", "Slovakia",
  "Slovenia", "Estonia", "Latvia", "Lithuania", "Malta", "Iceland",
];

const UPDATES: VisaUpdate[] = [
  {
    en: "Argentina",
    cost: "Mulai Rp 4.600.000",
    notes:
      "Layanan kami: Sticker Rp 4.600.000 (proses 4-8 minggu) atau Evisa Online Rp 8.600.000 (proses 2-4 minggu). AVE elektronik tersedia bagi pemegang visa US berlaku.",
  },
  {
    en: "Australia",
    cost: "Mulai Rp 3.400.000",
    notes:
      "Layanan kami: Evisa Turis Rp 3.400.000 (proses 2-4 minggu) atau Evisa Transit s/d 72 jam Rp 500.000. Biometrik via VFS Jakarta.",
  },
  {
    en: "Canada",
    cost: "Rp 3.600.000",
    notes:
      "Layanan kami: Sticker Visa Rp 3.600.000, berlaku s/d 10 tahun. Proses 3-8 minggu. Biometrik wajib via VFS.",
  },
  {
    en: "China",
    cost: "Mulai Rp 1.450.000",
    notes:
      "Layanan kami: Single Entry Jakarta Rp 1.450.000 / Non-Jakarta Rp 1.650.000. Double Entry Jakarta Rp 1.800.000 / Non-Jakarta Rp 2.000.000. Multiple 6 bulan Rp 2.100.000 / 12 bulan Rp 2.550.000. Proses 8 hari kerja, express 6 hari +Rp 700.000.",
  },
  {
    en: "Egypt",
    cost: "Mulai Rp 2.100.000",
    notes:
      "Layanan kami: Single Entry Rp 2.100.000 atau Multiple Entry Rp 2.550.000. Proses 2-3 minggu.",
  },
  {
    en: "India",
    cost: "Rp 550.000",
    notes:
      "Layanan kami: E-Tourist Visa Rp 550.000. Proses 5 hari kerja. Pilihan durasi 30/90/365 hari.",
  },
  {
    en: "Japan",
    cost: "Mulai Rp 300.000",
    notes:
      "Layanan kami: e-Visa Waiver Rp 300.000 (untuk e-paspor terdaftar, proses 3 hari kerja) atau Sticker Visa Waiver Rp 500.000. Visa turis Single Entry Jakarta Rp 1.000.000 / Non-Jakarta Rp 1.350.000. Multiple Entry Jakarta Rp 1.650.000 / Non-Jakarta Rp 1.950.000. Proses 5-10 hari kerja.",
  },
  {
    en: "Nepal",
    cost: "Rp 300.000",
    notes:
      "Layanan kami: VOA Application Rp 300.000. Proses 1 hari kerja. Tersedia di Tribhuvan Airport & border utama.",
  },
  {
    en: "New Zealand",
    cost: "Mulai Rp 5.800.000",
    notes:
      "Layanan kami: Evisa Pemohon Utama Rp 5.800.000 atau Dependant (pasangan/anak ≤17 thn) Rp 2.100.000. Proses 2-6 minggu. NZeTA tidak berlaku untuk WNI — wajib Visitor Visa.",
  },
  {
    en: "Russia",
    cost: "Rp 1.500.000",
    notes:
      "Layanan kami: e-Visa Rp 1.500.000. Proses 5 hari kerja. Masa tinggal 30 hari sejak Agustus 2025. Verifikasi kondisi terkini mengingat situasi geopolitik.",
  },
  {
    en: "Saudi Arabia",
    cost: "Mulai Rp 2.500.000",
    notes:
      "Layanan kami: Evisa Tourist (pemegang visa UK/US/Schengen berlaku) Rp 2.500.000, proses 2 hari kerja. Evisa Umroh Rp 3.100.000, proses 5 hari kerja. Evisa Tourist umum: tanya update.",
  },
  // Schengen — diterapkan ke 24 negara di region "Eropa Schengen".
  {
    en: SCHENGEN_COUNTRIES,
    cost: "Rp 3.500.000",
    notes:
      "Layanan kami: Sticker Visa Schengen s/d 5 tahun Rp 3.500.000. Proses 1-3 minggu. Berlaku di 27 negara Schengen (Austria, Belgia, Kroasia, Ceko, Denmark, Finlandia, Prancis, Jerman, Yunani, Hungaria, Italia, Belanda, Norwegia, Polandia, Portugal, Spanyol, Swedia, Swiss, dll).",
  },
  {
    en: "South Africa",
    cost: "Mulai Rp 300.000",
    notes:
      "Layanan kami: Evisa Rp 300.000 (proses 1 hari kerja) atau Sticker Rp 1.450.000 (proses 15 hari kerja). Sistem ETA/e-visa berlaku WNI sejak Feb 2026.",
  },
  {
    en: "South Korea",
    cost: "Mulai Rp 1.550.000",
    notes:
      "Layanan kami: Single Entry Rp 1.550.000, Double Entry Rp 2.000.000, Multiple Entry Rp 2.700.000. Proses 2-3 minggu, express 5-8 hari kerja +Rp 700.000.",
  },
  {
    en: "Taiwan",
    cost: "Mulai Rp 300.000",
    notes:
      "Layanan kami: Evisa Rp 300.000 (proses 1 hari kerja). Sticker Single Entry Rp 1.450.000 (proses 1-2 minggu) atau Sticker Multiple Entry Rp 2.550.000. Express 5 hari +Rp 600.000.",
  },
  {
    en: "UAE",
    cost: "Mulai Rp 2.500.000",
    notes:
      "Layanan kami: Transit 48 jam Rp 650.000 / 96 jam Rp 1.600.000. Single Entry 30 hari Rp 2.500.000 / 60 hari Rp 3.550.000. Multiple Entry 30 hari Rp 5.150.000 / 60 hari Rp 5.450.000. Proses 3-5 hari kerja.",
  },
  {
    en: "United Kingdom",
    cost: "Mulai Rp 4.300.000",
    notes:
      "Layanan kami: Standard Visitor 6 bulan Rp 4.300.000, 2 tahun Rp 14.600.000, 5 tahun Rp 24.600.000, 10 tahun Rp 32.100.000. Proses 3-5 minggu. Non-Jakarta (Surabaya/Bali) +VFS Rp 1.900.000. Priority 5 hari +Rp 14.000.000. Super Priority 3 hari +Rp 28.000.000.",
  },
  {
    en: "United States",
    cost: "Rp 4.300.000",
    notes:
      "Layanan kami: Sticker B1/B2 berlaku s/d 5 tahun, Rp 4.300.000. Proses 3-5 hari kerja. Wawancara wajib di Kedutaan/Konsulat AS via usvisas.state.gov.",
  },
];

async function main() {
  let totalUpdated = 0;
  const notFound: string[] = [];

  for (const u of UPDATES) {
    const names = Array.isArray(u.en) ? u.en : [u.en];
    for (const en of names) {
      const result = await prisma.countryVisa.updateMany({
        where: { en },
        data: { cost: u.cost, notes: u.notes },
      });
      if (result.count > 0) {
        console.log(`✓ ${en.padEnd(24)} → ${u.cost}`);
        totalUpdated += result.count;
      } else {
        notFound.push(en);
        console.log(`⚠ ${en.padEnd(24)} → not found in DB`);
      }
    }
  }

  console.log(`\nSelesai. ${totalUpdated} entri diperbarui.`);
  if (notFound.length > 0) {
    console.log(`Tidak ditemukan (${notFound.length}): ${notFound.join(", ")}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
