import { PrismaClient } from "@prisma/client";
import { FAQ_SECTIONS, faqAnswerText } from "../lib/faq-content";

const prisma = new PrismaClient();

const FAQS = FAQ_SECTIONS.flatMap((section) =>
  section.items.map((item, index) => ({
    group: "umum",
    section: section.title,
    order: index,
    question: item.question,
    answer: faqAnswerText(item),
    active: true,
  })),
);

async function main() {
  console.log("Seeding FAQ...");
  const existing = await prisma.faq.count({ where: { group: "umum" } });
  if (existing > 0) {
    console.log(`Sudah ada ${existing} FAQ umum di database. Skip seeding.`);
    return;
  }
  await prisma.faq.createMany({ data: FAQS });
  console.log(`${FAQS.length} FAQ umum berhasil ditambahkan.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
