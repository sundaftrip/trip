import { prisma } from "@/lib/prisma";
import VisaEditor from "@/components/admin/VisaEditor";

export const dynamic = "force-dynamic";

export default async function AdminVisaPage() {
  const row = await prisma.companyInfo.findFirst({ where: { key: "visa_catalog" } });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Katalog Visa</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Kelola daftar layanan pengurusan visa yang tampil di halaman /visa.
        </p>
      </div>
      <VisaEditor initial={row?.value ?? ""} />
    </div>
  );
}
