import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import visaSeed from "./visa-seed.json";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin2025!";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Super Admin";
// The public site runs on the Atlas theme; the CMS no longer switches themes.
const SEED_THEME = process.env.SEED_THEME ?? "atlas";
const SEED_COMPANY_NAME = process.env.SEED_COMPANY_NAME ?? "";

async function main() {
  // Bikin superadmin HANYA kalau DB benar-benar kosong (tidak ada user sama sekali).
  // Mencegah clutter user dummy di deployment existing yang sudah punya admin.
  const userCount = await prisma.user.count();
  const isProduction = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  if (userCount === 0 && isProduction && !process.env.SEED_ADMIN_PASSWORD) {
    // Jangan pernah membuat admin production dengan password default yang tertulis di repo.
    console.warn("⚠️  DB kosong tapi SEED_ADMIN_PASSWORD tidak di-set — skip pembuatan admin. Set env lalu jalankan ulang seed.");
  } else if (userCount === 0) {
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

  // Theme + nama perusahaan: di-set hanya saat row PERTAMA KALI dibuat.
  // Nilai yang sudah ada tidak pernah ditimpa.
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

  // Seed database visa 88 negara — HANYA kalau tabel kosong.
  // Sekali admin mengedit data via CMS, deploy berikutnya tidak akan menimpa.
  const visaCount = await prisma.countryVisa.count();
  if (visaCount === 0) {
    await prisma.countryVisa.createMany({
      data: (visaSeed as Array<{
        id: number; flag: string; name: string; en: string;
        region: string; visa: string; stay: string; cost: string; notes: string;
        officialFee?: string | null; servicePrice?: string | null;
        conditions?: string[]; sourceUrl?: string | null; lastVerifiedAt?: string | null;
      }>).map((c) => ({
        sortOrder: c.id,
        flag: c.flag,
        name: c.name,
        en: c.en,
        region: c.region,
        visa: c.visa,
        stay: c.stay,
        cost: c.cost,
        officialFee: c.officialFee ?? null,
        servicePrice: c.servicePrice ?? null,
        notes: c.notes,
        conditions: c.conditions ?? [],
        sourceUrl: c.sourceUrl ?? null,
        lastVerifiedAt: c.lastVerifiedAt ? new Date(c.lastVerifiedAt) : null,
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
