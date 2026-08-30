import { prisma } from "@/lib/prisma";
import TextsForm from "@/components/admin/TextsForm";
import { ACTIVE_TEXT_SECTIONS, LEGACY_TEXT_SECTIONS, activeTextValues } from "@/lib/website-texts";

export default async function TextsPage() {
  const [existing, companyRows] = await Promise.all([
    prisma.siteText.findMany(),
    prisma.companyInfo.findMany({ where: { key: { in: ["company_nib", "company_legal_name"] } } }),
  ]);
  const company = Object.fromEntries(companyRows.map((row) => [row.key, row.value]));
  const textsMap: Record<string, { id?: string; en?: string }> = {};
  existing.forEach((t) => {
    textsMap[t.key] = { id: t.valueId ?? undefined, en: t.valueEn ?? undefined };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teks Website</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Teks pembuka beranda, cara kerja, footer, dan kontak. FAQ dikelola melalui menu FAQ; katalog melalui menu Tour.</p>
      </div>
      <TextsForm sections={[...ACTIVE_TEXT_SECTIONS, ...LEGACY_TEXT_SECTIONS]} initialValues={activeTextValues(textsMap, company)} />
    </div>
  );
}
