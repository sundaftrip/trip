import { prisma } from "@/lib/prisma";
import HeroSundafEditor, { type SundafConfig } from "@/components/admin/HeroSundafEditor";

export default async function HeroSundafEditorPage() {
  const row = await prisma.companyInfo.findUnique({ where: { key: "hero_sundaf_config" } });
  let initial: Partial<SundafConfig> | null = null;
  if (row?.value) {
    try {
      initial = JSON.parse(row.value) as Partial<SundafConfig>;
    } catch {
      initial = null;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editor Hero SUNDAF</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Geser, ubah ukuran, ganti font, dan kasih stabilo. Klik Simpan untuk apply ke homepage.
        </p>
      </div>
      <HeroSundafEditor initial={initial} />
    </div>
  );
}
