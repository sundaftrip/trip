/**
 * New client onboarding script.
 * Run AFTER setting up .env with correct DATABASE_URL.
 *
 * Usage:
 *   ADMIN_EMAIL=owner@mytravelco.com ADMIN_PASSWORD='use-a-strong-password' node scripts/setup-client.js
 *
 * ADMIN_PASSWORD is required and is never printed back to the terminal.
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Super Admin";
const COMPANY_NAME = process.env.COMPANY_NAME ?? "";

async function main() {
  console.log("🚀 Setting up new client deployment...\n");

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_EMAIL dan ADMIN_PASSWORD sebelum menjalankan setup-client.js");
  }
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("ADMIN_PASSWORD minimal 12 karakter.");
  }

  // 1. Create superadmin
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: await bcrypt.hash(ADMIN_PASSWORD, 12),
        role: "SUPERADMIN",
      },
    });
    console.log(`✅ SuperAdmin created`);
    console.log(`   Email    : ${ADMIN_EMAIL}`);
  } else {
    console.log("ℹ️  SuperAdmin already exists, skipping");
  }

  // 2. Seed company info placeholders (only if empty)
  const companyInfoKeys = [
    ["company_name", COMPANY_NAME || "Nama Travel Anda"],
    ["company_nib", ""],
    ["company_address", ""],
    ["company_phone", ""],
    ["company_whatsapp", ""],
    ["company_email", ""],
    ["company_website", ""],
  ];

  for (const [key, value] of companyInfoKeys) {
    await prisma.companyInfo.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("\n✅ Company info placeholders created");
  console.log("   → Login to /admin/settings to fill in your company details\n");

  // 3. Seed default color settings
  const colorKeys = [
    ["color_hero", "#0d2018"],
    ["color_heading", "#111827"],
    ["color_tour_title", "#111827"],
    ["color_blog_title", "#111827"],
    ["color_accent", "#2d6a4f"],
    ["color_eyebrow", "#6b7280"],
  ];

  for (const [key, value] of colorKeys) {
    await prisma.companyInfo.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("✅ Default color settings applied");
  console.log("   → Customize colors in /admin/settings\n");

  console.log("🎉 Setup complete! Next steps:");
  console.log("   1. Go to /admin/login");
  console.log(`   2. Login with: ${ADMIN_EMAIL}`);
  console.log("   3. Fill in company info at /admin/settings");
  console.log("   4. Upload your logo to /public/logo.png");
  console.log("   5. Start adding tour packages at /admin/tours\n");
}

main()
  .catch((e) => {
    console.error("❌ Setup failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
