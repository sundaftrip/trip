import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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

  await seedFinance();
}

// ── Modul Keuangan ───────────────────────────────────────────
// Seed contoh realistis untuk dashboard keuangan. Idempoten:
// hanya jalan kalau belum ada rekening bank sama sekali.
// Data dikaitkan ke trip (Tour) yang sudah ada di database.
async function seedFinance() {
  if ((await prisma.bankAccount.count()) > 0) {
    console.log("ℹ️  Data keuangan sudah ada, skip seed keuangan");
    return;
  }

  const day = (n: number) => new Date(Date.now() - n * 86400000);

  await prisma.bankAccount.createMany({
    data: [
      {
        name: "Bank Mandiri Operasional",
        kind: "BANK",
        accountNo: "1370012345678",
        openingBalance: 0,
        note: "Rekening utama operasional",
      },
      { name: "BCA Penampungan Peserta", kind: "BANK", accountNo: "8455098765", openingBalance: 0 },
      { name: "Kas Tunai Kantor", kind: "CASH", openingBalance: 2500000 },
    ],
  });

  const vendorSpec = [
    { name: "Aeroflot Russian Airlines", category: "AIRLINE", contact: "+7 495 223 5555" },
    { name: "Azimut Hotel Saint Petersburg", category: "HOTEL", contact: "reservations@azimut.ru" },
    { name: "Moscow DMC Land Operator", category: "LAND_OPERATOR", contact: "+7 499 110 2200" },
    { name: "VFS Global — Visa Rusia", category: "VISA" },
    { name: "Zurich Travel Insurance", category: "INSURANCE" },
  ] as const;

  const vendorId: Record<string, string> = {};
  for (const v of vendorSpec) {
    const row = await prisma.vendor.create({ data: v });
    vendorId[v.name] = row.id;
  }

  async function bill(o: {
    vendor: string;
    tourId: string | null;
    desc: string;
    amount: number; // SELALU IDR
    paid: number;
    isDeposit?: boolean;
    date: Date;
    currency?: string;
    fxRate?: number;
  }) {
    const status = (o.paid >= o.amount ? "PAID" : o.paid > 0 ? "PARTIAL" : "UNPAID") as
      | "PAID"
      | "PARTIAL"
      | "UNPAID";
    const b = await prisma.vendorBill.create({
      data: {
        vendorId: vendorId[o.vendor],
        tourId: o.tourId,
        description: o.desc,
        amount: o.amount,
        amountPaid: o.paid,
        currency: o.currency ?? "IDR",
        fxRate: o.fxRate ?? 1,
        status,
        isDeposit: !!o.isDeposit,
        dueDate: new Date(Date.now() + 20 * 86400000),
      },
    });
    if (o.paid > 0) {
      await prisma.ledgerEntry.create({
        data: {
          date: o.date,
          direction: "OUT",
          amount: o.paid,
          category: o.isDeposit ? "Deposit Vendor" : "Bayar Vendor",
          description: `${o.vendor} — ${o.desc}`,
          source: o.isDeposit ? "DEPOSIT" : "VENDOR_PAYMENT",
          tourId: o.tourId,
          vendorBillId: b.id,
        },
      });
    }
  }

  const tours = await prisma.tour.findMany({ orderBy: { createdAt: "desc" }, take: 4 });

  if (tours[0]) {
    const t = tours[0];
    await prisma.tripFinance.create({
      data: {
        tourId: t.id,
        sellingPrice: 32000000,
        targetPax: 18,
        projHpp: 410000000,
        status: "CONFIRMED",
        note: "Proyeksi dikunci finance",
      },
    });
    await bill({ vendor: "Aeroflot Russian Airlines", tourId: t.id, desc: "Tiket pesawat grup 18 pax", amount: 198000000, paid: 120000000, isDeposit: true, date: day(40), currency: "USD", fxRate: 16500 });
    await bill({ vendor: "Azimut Hotel Saint Petersburg", tourId: t.id, desc: "Akomodasi 6 malam", amount: 96000000, paid: 0, date: day(20), currency: "USD", fxRate: 16000 });
    await bill({ vendor: "Moscow DMC Land Operator", tourId: t.id, desc: "Land tour + transport", amount: 116000000, paid: 116000000, date: day(15), currency: "USD", fxRate: 16000 });
  }
  if (tours[1]) {
    const t = tours[1];
    await prisma.tripFinance.create({
      data: { tourId: t.id, sellingPrice: 28000000, targetPax: 15, projHpp: 320000000, status: "DRAFT" },
    });
    await bill({ vendor: "Aeroflot Russian Airlines", tourId: t.id, desc: "Deposit blocking seat", amount: 148500000, paid: 50000000, isDeposit: true, date: day(28), currency: "USD", fxRate: 16500 });
    await bill({ vendor: "VFS Global — Visa Rusia", tourId: t.id, desc: "Visa rombongan 15 pax", amount: 22500000, paid: 0, date: day(10) });
  }
  if (tours[2]) {
    await bill({ vendor: "Azimut Hotel Saint Petersburg", tourId: tours[2].id, desc: "Booking awal hotel", amount: 64000000, paid: 0, date: day(8), currency: "USD", fxRate: 16000 });
  }
  if (tours[3]) {
    const t = tours[3];
    await prisma.tripFinance.create({
      data: { tourId: t.id, sellingPrice: 30000000, targetPax: 12, projHpp: 250000000, status: "CONFIRMED" },
    });
    await bill({ vendor: "Moscow DMC Land Operator", tourId: t.id, desc: "Paket land tour 12 pax", amount: 92000000, paid: 92000000, date: day(55), currency: "USD", fxRate: 16000 });
    await bill({ vendor: "Zurich Travel Insurance", tourId: t.id, desc: "Asuransi perjalanan", amount: 8400000, paid: 8400000, date: day(50) });
  }

  await prisma.ledgerEntry.createMany({
    data: [
      { date: day(120), direction: "OUT", amount: 12000000, category: "Gaji Tim", source: "OPERATIONAL", description: "Penggajian bulanan" },
      { date: day(118), direction: "OUT", amount: 5000000, category: "Sewa Kantor", source: "OPERATIONAL" },
      { date: day(90), direction: "OUT", amount: 12000000, category: "Gaji Tim", source: "OPERATIONAL" },
      { date: day(88), direction: "OUT", amount: 5000000, category: "Sewa Kantor", source: "OPERATIONAL" },
      { date: day(60), direction: "OUT", amount: 12000000, category: "Gaji Tim", source: "OPERATIONAL" },
      { date: day(45), direction: "OUT", amount: 6500000, category: "Marketing & Iklan", source: "OPERATIONAL" },
      { date: day(30), direction: "OUT", amount: 12000000, category: "Gaji Tim", source: "OPERATIONAL" },
      { date: day(12), direction: "IN", amount: 3500000, category: "Jasa Konsultasi Visa", source: "OTHER", description: "Fee pengurusan visa walk-in" },
      { date: day(5), direction: "OUT", amount: 1800000, category: "Internet & Utilitas", source: "OPERATIONAL" },
    ],
  });

  console.log(`✅ Data keuangan ter-seed (${tours.length} trip dikaitkan)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
