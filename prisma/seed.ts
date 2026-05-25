import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import visaSeed from "./visa-seed.json";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin2025!";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Super Admin";
const SEED_THEME = process.env.SEED_THEME ?? "classic";
const SEED_COMPANY_NAME = process.env.SEED_COMPANY_NAME ?? "";

async function main() {
  // Bikin superadmin HANYA kalau DB benar-benar kosong (tidak ada user sama sekali).
  // Mencegah clutter user dummy di deployment existing yang sudah punya admin.
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    await prisma.user.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: await bcrypt.hash(ADMIN_PASSWORD, 12),
        role: "SUPERADMIN",
      },
    });
    console.log(`✅ Superadmin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    console.log(`ℹ️  ${userCount} user(s) sudah ada, skip seed admin`);
  }

  // Seed default site texts (generic, client customizes via CMS)
  const defaultTexts = [
    { key: "hero_eyebrow", valueId: "Perjalanan Terpercaya", valueEn: "Trusted Travel Partner" },
    { key: "hero_title", valueId: "Wujudkan Perjalanan Impian Anda", valueEn: "Make Your Dream Journey Come True" },
    { key: "hero_subtitle", valueId: "Paket wisata pilihan dengan pelayanan terbaik.", valueEn: "Curated tour packages with the best service." },
    { key: "hero_btn", valueId: "Lihat Paket Tour", valueEn: "See Tour Packages" },
    { key: "why_1_title", valueId: "Terpercaya & Berpengalaman", valueEn: "Trusted & Experienced" },
    { key: "why_1_desc", valueId: "Lebih dari 10 tahun melayani pelanggan dengan standar terbaik.", valueEn: "Over 10 years serving customers with the highest standards." },
    { key: "why_2_title", valueId: "Pelayanan Penuh Kasih", valueEn: "Caring Service" },
    { key: "why_2_desc", valueId: "Tim kami siap membantu 24/7 selama perjalanan Anda.", valueEn: "Our team is ready to assist 24/7 during your journey." },
    { key: "why_3_title", valueId: "Jadwal Fleksibel", valueEn: "Flexible Schedule" },
    { key: "why_3_desc", valueId: "Berbagai pilihan jadwal keberangkatan sesuai kebutuhan Anda.", valueEn: "Various departure schedule options tailored to your needs." },
    { key: "why_4_title", valueId: "Bersertifikat Resmi", valueEn: "Officially Certified" },
    { key: "why_4_desc", valueId: "Terdaftar dan berizin resmi dari instansi terkait.", valueEn: "Officially registered and licensed by relevant authorities." },
    { key: "about_title", valueId: "Tentang Kami", valueEn: "About Us" },
    { key: "about_desc_1", valueId: "Kami adalah biro perjalanan wisata yang berfokus pada kepuasan pelanggan.", valueEn: "We are a travel agency focused on customer satisfaction." },
    { key: "about_desc_2", valueId: "Kami berkomitmen memberikan pelayanan terbaik dengan harga yang terjangkau.", valueEn: "We are committed to providing the best service at affordable prices." },
    { key: "contact_title", valueId: "Hubungi Kami", valueEn: "Contact Us" },
    { key: "contact_desc", valueId: "Konsultasikan perjalanan impian Anda bersama kami.", valueEn: "Consult your dream journey with us." },
    { key: "payment_bank_name", valueId: "BCA", valueEn: "BCA" },
    { key: "payment_bank_acc", valueId: "0000000000", valueEn: "0000000000" },
    { key: "payment_bank_holder", valueId: "NAMA PERUSAHAAN", valueEn: "COMPANY NAME" },
  ];

  for (const text of defaultTexts) {
    await prisma.siteText.upsert({
      where: { key: text.key },
      update: {},
      create: text,
    });
  }
  console.log("✅ Default site texts seeded");

  // Theme + nama perusahaan: di-set hanya saat row PERTAMA KALI dibuat.
  // Tidak override existing value — jadi klien yang sudah ganti theme via CMS
  // tidak akan ke-reset tiap deploy.
  await prisma.companyInfo.upsert({
    where: { key: "site_theme" },
    update: {},
    create: { key: "site_theme", value: SEED_THEME },
  });
  if (SEED_COMPANY_NAME) {
    await prisma.companyInfo.upsert({
      where: { key: "company_name" },
      update: {},
      create: { key: "company_name", value: SEED_COMPANY_NAME },
    });
  }
  console.log(`✅ Theme=${SEED_THEME}${SEED_COMPANY_NAME ? ` company=${SEED_COMPANY_NAME}` : ""}`);

  // Seed library komponen biaya untuk modul Kuotasi — HANYA kalau kosong.
  // Data dasar dari sheet "MASTER DATA" RUSSIA 2026.xlsx — Ferdiansah.
  const tplCount = await prisma.costComponentTemplate.count();
  if (tplCount === 0) {
    const rusiaTpl = [
      // Hotel per kota — harga RUB per malam per pax
      { category: "HOTEL", city: "Moscow", label: "Hotel Moscow standar", currency: "RUB", valueForeign: 7000 },
      { category: "HOTEL", city: "St Petersburg", label: "Hotel St Petersburg standar", currency: "RUB", valueForeign: 6000 },
      { category: "HOTEL", city: "Murmansk", label: "Hotel Murmansk standar", currency: "RUB", valueForeign: 10000 },
      // Aktivitas
      { category: "AKTIVITAS", city: "Murmansk", label: "Aurora hunting (paket utama)", currency: "RUB", valueForeign: 4000 },
      { category: "AKTIVITAS", city: "Murmansk", label: "Husky sledding", currency: "RUB", valueForeign: 0, valueIdr: 1400000, isIdr: true },
      { category: "AKTIVITAS", city: "Murmansk", label: "Sami Village", currency: "IDR", valueIdr: 1600000, isIdr: true },
      { category: "AKTIVITAS", city: "Murmansk", label: "Teriberka day-trip", currency: "RUB", valueForeign: 4000 },
      { category: "AKTIVITAS", city: "Murmansk", label: "Snow Mobile / ATV", currency: "IDR", valueIdr: 1600000, isIdr: true },
      { category: "TIKET_MASUK", city: "St Petersburg", label: "Hermitage Museum", currency: "RUB", valueForeign: 0, valueIdr: 0 },
      { category: "TIKET_MASUK", city: "St Petersburg", label: "Peterhof Palace", currency: "IDR", valueIdr: 400000, isIdr: true },
      { category: "TIKET_MASUK", city: "Moscow", label: "Tsaritsyno Palace ticket", currency: "IDR", valueIdr: 200000, isIdr: true },
      { category: "TIKET_MASUK", city: "Moscow", label: "Tsaritsyno Costume rental", currency: "IDR", valueIdr: 250000, isIdr: true },
      // Transport
      { category: "TRANSPORT", city: "Moscow→Murmansk", label: "Pesawat Moscow → Murmansk", currency: "RUB", valueForeign: 8000 },
      { category: "TRANSPORT", city: "Murmansk→St Petersburg", label: "Pesawat Murmansk → St Petersburg", currency: "RUB", valueForeign: 8000 },
      { category: "TRANSPORT", city: "St Petersburg→Moscow", label: "Sapsan Train Eco", currency: "RUB", valueForeign: 4000 },
      { category: "TRANSPORT", city: "Moscow", label: "Aeroexpress airport transfer", currency: "RUB", valueForeign: 300 },
      { category: "TRANSPORT", city: "Moscow", label: "Metro pass harian", currency: "RUB", valueForeign: 300 },
      { category: "TRANSPORT", city: "Moscow", label: "Sewa Bus harian", currency: "RUB", valueForeign: 25000, perPax: false },
      { category: "TRANSPORT", city: "St Petersburg", label: "Sewa Bus harian", currency: "RUB", valueForeign: 15000, perPax: false },
      { category: "TRANSPORT", city: "Murmansk", label: "Sewa Bus harian", currency: "RUB", valueForeign: 20000, perPax: false },
      // Makan & TL
      { category: "MAKAN", city: "Murmansk", label: "Makan di Murmansk (paket harian)", currency: "RUB", valueForeign: 4000 },
      { category: "TL_FEE", city: null, label: "TL fee harian", currency: "IDR", valueIdr: 7000, isIdr: true, perPax: false, notes: "per hari, flat" },
      { category: "TL_FEE", city: null, label: "Tiket TL Jakarta", currency: "IDR", valueIdr: 22000000, isIdr: true, perPax: false, notes: "flat untuk seluruh trip" },
      // Tax & lain
      { category: "TAX", city: "Moscow", label: "Tax hotel Moscow", currency: "RUB", valueForeign: 6500 },
      { category: "TAX", city: "St Petersburg", label: "Tax hotel St Petersburg", currency: "RUB", valueForeign: 5000 },
      { category: "TAX", city: "Murmansk", label: "Tax hotel Murmansk", currency: "RUB", valueForeign: 8000 },
      { category: "ASURANSI", city: null, label: "Asuransi perjalanan", currency: "IDR", valueIdr: 300000, isIdr: true },
    ];

    await prisma.costComponentTemplate.createMany({
      data: rusiaTpl.map((t) => ({
        category: t.category as never,
        country: "Rusia",
        city: t.city ?? null,
        label: t.label,
        currency: t.currency,
        valueForeign: t.isIdr ? null : (t.valueForeign ?? null),
        valueIdr: t.isIdr ? (t.valueIdr ?? null) : null,
        perPax: t.perPax !== false,
        notes: t.notes ?? null,
      })),
    });
    console.log(`✅ ${rusiaTpl.length} cost templates di-seed untuk Rusia`);
  } else {
    console.log(`ℹ️  ${tplCount} cost templates sudah ada, skip seed`);
  }

  // Seed database visa 88 negara — HANYA kalau tabel kosong.
  // Sekali admin mengedit data via CMS, deploy berikutnya tidak akan menimpa.
  const visaCount = await prisma.countryVisa.count();
  if (visaCount === 0) {
    await prisma.countryVisa.createMany({
      data: (visaSeed as Array<{
        id: number; flag: string; name: string; en: string;
        region: string; visa: string; stay: string; cost: string; notes: string;
      }>).map((c) => ({
        sortOrder: c.id,
        flag: c.flag,
        name: c.name,
        en: c.en,
        region: c.region,
        visa: c.visa,
        stay: c.stay,
        cost: c.cost,
        notes: c.notes,
      })),
    });
    console.log(`✅ ${visaSeed.length} entri visa di-seed`);
  } else {
    console.log(`ℹ️  ${visaCount} entri visa sudah ada, skip seed visa`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
