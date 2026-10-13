import CountryVisaForm from "@/components/admin/CountryVisaForm";
import { requireAdminModule } from "@/lib/admin-access";

export default async function NewCountryVisaPage() {
  await requireAdminModule("visa");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Negara</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tambah entri visa baru ke database 88 negara.
        </p>
      </div>
      <CountryVisaForm />
    </div>
  );
}
