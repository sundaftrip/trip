import { prisma } from "@/lib/prisma";
import TextsForm from "@/components/admin/TextsForm";
import { requireAdminModule } from "@/lib/admin-access";
import { HOME_TEXT_FIELDS } from "@/lib/home-text-fields";

export default async function TextsPage() {
  await requireAdminModule("texts");
  const rows = await prisma.siteText.findMany({
    where: { key: { in: HOME_TEXT_FIELDS.map((field) => field.key) } },
    select: { key: true, valueId: true },
  });
  const initialValues = Object.fromEntries(rows.map((row) => [row.key, row.valueId ?? ""]));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teks Beranda</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Judul, kalimat, dan foto di bagian paling atas beranda. Kolom kosong memakai teks bawaan (tampil samar sebagai contoh).
        </p>
      </div>
      <TextsForm initialValues={initialValues} />
    </div>
  );
}
