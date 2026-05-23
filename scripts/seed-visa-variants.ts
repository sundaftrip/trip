/* Seed VisaVariant dari pricelist Heyvisa.
   Harga sudah di-markup:
     - vendor >= Rp 1.000.000 → +Rp 100.000
     - vendor <  Rp 1.000.000 → +Rp  50.000
   Idempotent: untuk setiap negara, hapus semua variant lama lalu insert
   ulang yang baru. Aman dijalankan ulang.

   Jalankan: npx tsx --env-file=.env.local scripts/seed-visa-variants.ts
*/
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface VariantSeed {
  name: string;
  priceIDR: number;
  processingTime?: string;
  notes?: string;
}

interface CountrySeed {
  en: string | string[];
  variants: VariantSeed[];
}

const SCHENGEN = [
  "France", "Germany", "Italy", "Spain", "Netherlands", "Switzerland",
  "Austria", "Belgium", "Greece", "Portugal", "Czech Republic", "Hungary",
  "Poland", "Sweden", "Norway", "Denmark", "Finland", "Slovakia",
  "Slovenia", "Estonia", "Latvia", "Lithuania", "Malta", "Iceland",
];

const SEEDS: CountrySeed[] = [
  {
    en: "Argentina",
    variants: [
      { name: "Sticker", priceIDR: 4_600_000, processingTime: "4-8 minggu" },
      { name: "Evisa Online", priceIDR: 8_600_000, processingTime: "2-4 minggu" },
    ],
  },
  {
    en: "Australia",
    variants: [
      { name: "Evisa Turis", priceIDR: 3_400_000, processingTime: "2-4 minggu" },
      { name: "Evisa Transit s/d 72 jam", priceIDR: 500_000, processingTime: "2-4 minggu" },
    ],
  },
  {
    en: "Canada",
    variants: [
      { name: "Sticker Visa (s/d 10 tahun)", priceIDR: 3_600_000, processingTime: "3-8 minggu", notes: "Biometrik wajib via VFS." },
    ],
  },
  {
    en: "China",
    variants: [
      { name: "Single Entry — Jakarta", priceIDR: 1_450_000, processingTime: "8 hari kerja" },
      { name: "Single Entry — Non-Jakarta", priceIDR: 1_650_000, processingTime: "8 hari kerja" },
      { name: "Double Entry — Jakarta", priceIDR: 1_800_000, processingTime: "8 hari kerja" },
      { name: "Double Entry — Non-Jakarta", priceIDR: 2_000_000, processingTime: "8 hari kerja" },
      { name: "Multiple 6 bulan", priceIDR: 2_100_000, processingTime: "8 hari kerja" },
      { name: "Multiple 12 bulan", priceIDR: 2_550_000, processingTime: "8 hari kerja" },
    ],
  },
  {
    en: "Egypt",
    variants: [
      { name: "Single Entry", priceIDR: 2_100_000, processingTime: "2-3 minggu" },
      { name: "Multiple Entry", priceIDR: 2_550_000, processingTime: "2-3 minggu" },
    ],
  },
  {
    en: "India",
    variants: [
      { name: "E-Tourist Visa", priceIDR: 550_000, processingTime: "5 hari kerja", notes: "Pilihan durasi 30/90/365 hari." },
    ],
  },
  {
    en: "Japan",
    variants: [
      { name: "e-Visa Waiver (e-paspor terdaftar)", priceIDR: 300_000, processingTime: "3 hari kerja" },
      { name: "Sticker Visa Waiver", priceIDR: 500_000, processingTime: "3-5 hari kerja" },
      { name: "Single Entry — Jakarta", priceIDR: 1_000_000, processingTime: "5-8 hari kerja" },
      { name: "Single Entry — Non-Jakarta", priceIDR: 1_350_000, processingTime: "5-10 hari kerja" },
      { name: "Multiple Entry — Jakarta", priceIDR: 1_650_000, processingTime: "5-8 hari kerja" },
      { name: "Multiple Entry — Non-Jakarta", priceIDR: 1_950_000, processingTime: "5-10 hari kerja" },
    ],
  },
  {
    en: "Nepal",
    variants: [
      { name: "VOA Application", priceIDR: 300_000, processingTime: "1 hari kerja" },
    ],
  },
  {
    en: "New Zealand",
    variants: [
      { name: "Evisa — Pemohon Utama", priceIDR: 5_800_000, processingTime: "2-6 minggu" },
      { name: "Dependant (pasangan/anak ≤17 thn)", priceIDR: 2_100_000, processingTime: "2-6 minggu" },
    ],
  },
  {
    en: "Russia",
    variants: [
      { name: "e-Visa", priceIDR: 1_500_000, processingTime: "5 hari kerja", notes: "Masa tinggal 30 hari sejak Agustus 2025." },
    ],
  },
  {
    en: "Saudi Arabia",
    variants: [
      { name: "Evisa Tourist (pemegang visa UK/US/Schengen)", priceIDR: 2_500_000, processingTime: "2 hari kerja" },
      { name: "Evisa Umroh", priceIDR: 3_100_000, processingTime: "5 hari kerja" },
    ],
  },
  // Schengen: 1 varian seragam diterapkan ke 24 negara
  {
    en: SCHENGEN,
    variants: [
      { name: "Sticker Schengen (s/d 5 tahun)", priceIDR: 3_500_000, processingTime: "1-3 minggu", notes: "Berlaku di 27 negara Schengen." },
    ],
  },
  {
    en: "South Africa",
    variants: [
      { name: "Evisa", priceIDR: 300_000, processingTime: "1 hari kerja" },
      { name: "Sticker", priceIDR: 1_450_000, processingTime: "15 hari kerja" },
    ],
  },
  {
    en: "South Korea",
    variants: [
      { name: "Single Entry", priceIDR: 1_550_000, processingTime: "2-3 minggu" },
      { name: "Double Entry", priceIDR: 2_000_000, processingTime: "2-3 minggu" },
      { name: "Multiple Entry", priceIDR: 2_700_000, processingTime: "2-3 minggu" },
    ],
  },
  {
    en: "Taiwan",
    variants: [
      { name: "Evisa", priceIDR: 300_000, processingTime: "1 hari kerja" },
      { name: "Sticker Single Entry", priceIDR: 1_450_000, processingTime: "1-2 minggu" },
      { name: "Sticker Multiple Entry", priceIDR: 2_550_000, processingTime: "1-2 minggu" },
    ],
  },
  {
    en: "UAE",
    variants: [
      { name: "Transit 48 jam", priceIDR: 650_000, processingTime: "3 hari kerja" },
      { name: "Transit 96 jam", priceIDR: 1_600_000, processingTime: "3 hari kerja" },
      { name: "Single Entry 30 hari", priceIDR: 2_500_000, processingTime: "5 hari kerja" },
      { name: "Multiple Entry 30 hari", priceIDR: 5_150_000, processingTime: "5 hari kerja" },
      { name: "Single Entry 60 hari", priceIDR: 3_550_000, processingTime: "5 hari kerja" },
      { name: "Multiple Entry 60 hari", priceIDR: 5_450_000, processingTime: "5 hari kerja" },
    ],
  },
  {
    en: "United Kingdom",
    variants: [
      { name: "Standard Visitor 6 bulan", priceIDR: 4_300_000, processingTime: "3-5 minggu" },
      { name: "Standard Visitor 2 tahun", priceIDR: 14_600_000, processingTime: "3-5 minggu" },
      { name: "Standard Visitor 5 tahun", priceIDR: 24_600_000, processingTime: "3-5 minggu" },
      { name: "Standard Visitor 10 tahun", priceIDR: 32_100_000, processingTime: "3-5 minggu" },
    ],
  },
  {
    en: "United States",
    variants: [
      { name: "Sticker B1/B2 (s/d 5 tahun)", priceIDR: 4_300_000, processingTime: "3-5 hari kerja" },
    ],
  },
];

async function main() {
  let countriesTouched = 0;
  let variantsCreated = 0;
  const notFound: string[] = [];

  for (const seed of SEEDS) {
    const names = Array.isArray(seed.en) ? seed.en : [seed.en];
    for (const en of names) {
      const country = await prisma.countryVisa.findFirst({ where: { en } });
      if (!country) {
        notFound.push(en);
        console.log(`⚠ ${en.padEnd(24)} — not found in DB`);
        continue;
      }
      // Hapus semua variant lama untuk negara ini, lalu insert ulang.
      await prisma.visaVariant.deleteMany({ where: { countryVisaId: country.id } });
      const data = seed.variants.map((v, i) => ({
        countryVisaId: country.id,
        sortOrder: i,
        name: v.name,
        priceIDR: v.priceIDR,
        processingTime: v.processingTime ?? null,
        notes: v.notes ?? null,
      }));
      await prisma.visaVariant.createMany({ data });
      countriesTouched += 1;
      variantsCreated += data.length;
      console.log(`✓ ${en.padEnd(24)} ${data.length} variant`);
    }
  }

  console.log(
    `\nSelesai. ${countriesTouched} negara, ${variantsCreated} variant total.`,
  );
  if (notFound.length > 0) {
    console.log(`Tidak ditemukan: ${notFound.join(", ")}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
