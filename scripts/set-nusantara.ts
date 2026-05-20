import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.companyInfo.upsert({
    where: { key: "site_theme" },
    update: { value: "nusantara" },
    create: { key: "site_theme", value: "nusantara" },
  });
  console.log("site_theme = nusantara");
}

main().finally(() => prisma.$disconnect());
