import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  const visas = await prisma.countryVisa.findMany({
    orderBy: [{ region: "asc" }, { name: "asc" }],
    select: { name: true, en: true, region: true, visa: true },
  });

  console.log(`Total: ${visas.length} negara\n`);

  let currentRegion = "";
  for (const v of visas) {
    if (v.region !== currentRegion) {
      console.log(`\n── ${v.region} ──`);
      currentRegion = v.region;
    }
    const slug = slugify(v.en, { lower: true, strict: true });
    console.log(`  ${v.name.padEnd(28)} https://sundaftrip.com/visa/${slug}  [${v.visa}]`);
  }
  await prisma.$disconnect();
}
main().catch(console.error);
