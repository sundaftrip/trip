import { prisma } from "@/lib/prisma";
import TextsForm from "@/components/admin/TextsForm";

const TEXT_KEYS = [
  { section: "Hero", keys: ["hero_eyebrow", "hero_title", "hero_subtitle", "hero_btn"] },
  { section: "Keunggulan", keys: ["why_1_title", "why_1_desc", "why_2_title", "why_2_desc", "why_3_title", "why_3_desc", "why_4_title", "why_4_desc"] },
  { section: "Tentang Kami", keys: ["about_title", "about_desc_1", "about_desc_2"] },
  { section: "Kontak", keys: ["contact_title", "contact_desc"] },
  { section: "Pembayaran", keys: ["payment_bank_name", "payment_bank_acc", "payment_bank_holder"] },
];

export default async function TextsPage() {
  const existing = await prisma.siteText.findMany();
  const textsMap: Record<string, { id?: string; en?: string }> = {};
  existing.forEach((t) => {
    textsMap[t.key] = { id: t.valueId ?? undefined, en: t.valueEn ?? undefined };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teks Website</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Edit semua teks yang tampil di halaman publik</p>
      </div>
      <TextsForm sections={TEXT_KEYS} initialValues={textsMap} />
    </div>
  );
}
