import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create superadmin
  const existing = await prisma.user.findUnique({ where: { email: "admin@sundaftrip.com" } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@sundaftrip.com",
        password: await bcrypt.hash("sundaf2024!", 12),
        role: "SUPERADMIN",
      },
    });
    console.log("✅ Superadmin created: admin@sundaftrip.com / sundaf2024!");
  } else {
    console.log("ℹ️  Superadmin already exists");
  }

  // Seed default site texts
  const defaultTexts = [
    { key: "hero_eyebrow", valueId: "Perjalanan Terpercaya", valueEn: "Trusted Travel Partner" },
    { key: "hero_title", valueId: "Wujudkan Perjalanan Impian Anda", valueEn: "Make Your Dream Journey Come True" },
    { key: "hero_subtitle", valueId: "Paket wisata religi, umroh, haji, dan city tour terpercaya bersama CV Sundaf Holiday Group.", valueEn: "Trusted religious tours, umrah, hajj, and city tours with CV Sundaf Holiday Group." },
    { key: "hero_btn", valueId: "Lihat Paket Tour", valueEn: "See Tour Packages" },
    { key: "why_1_title", valueId: "Terpercaya & Berpengalaman", valueEn: "Trusted & Experienced" },
    { key: "why_1_desc", valueId: "Lebih dari 10 tahun melayani jamaah dengan standar terbaik.", valueEn: "Over 10 years serving pilgrims with the highest standards." },
    { key: "why_2_title", valueId: "Pelayanan Penuh Kasih", valueEn: "Caring Service" },
    { key: "why_2_desc", valueId: "Tim kami siap membantu 24/7 selama perjalanan Anda.", valueEn: "Our team is ready to assist 24/7 during your journey." },
    { key: "why_3_title", valueId: "Jadwal Fleksibel", valueEn: "Flexible Schedule" },
    { key: "why_3_desc", valueId: "Berbagai pilihan jadwal keberangkatan sesuai kebutuhan Anda.", valueEn: "Various departure schedule options tailored to your needs." },
    { key: "why_4_title", valueId: "Bersertifikat Resmi", valueEn: "Officially Certified" },
    { key: "why_4_desc", valueId: "Terdaftar dan berizin resmi dari Kementerian Agama RI.", valueEn: "Officially registered and licensed by the Indonesian Ministry of Religious Affairs." },
    { key: "about_title", valueId: "Tentang Sundaf Trip", valueEn: "About Sundaf Trip" },
    { key: "about_desc_1", valueId: "CV Sundaf Holiday Group adalah biro perjalanan wisata yang berfokus pada wisata religi dan halal.", valueEn: "CV Sundaf Holiday Group is a travel agency focused on religious and halal tourism." },
    { key: "about_desc_2", valueId: "Kami berkomitmen memberikan pelayanan terbaik dengan harga yang terjangkau.", valueEn: "We are committed to providing the best service at affordable prices." },
    { key: "contact_title", valueId: "Hubungi Kami", valueEn: "Contact Us" },
    { key: "contact_desc", valueId: "Konsultasikan perjalanan impian Anda bersama kami.", valueEn: "Consult your dream journey with us." },
    { key: "payment_bank_name", valueId: "BCA", valueEn: "BCA" },
    { key: "payment_bank_acc", valueId: "1234567890", valueEn: "1234567890" },
    { key: "payment_bank_holder", valueId: "CV SUNDAF HOLIDAY GROUP", valueEn: "CV SUNDAF HOLIDAY GROUP" },
  ];

  for (const text of defaultTexts) {
    await prisma.siteText.upsert({
      where: { key: text.key },
      update: {},
      create: text,
    });
  }
  console.log("✅ Default site texts seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
