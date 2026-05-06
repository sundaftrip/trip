import TourForm from "@/components/admin/TourForm";

export default function NewTourPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Tour</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Buat paket tour baru</p>
      </div>
      <TourForm />
    </div>
  );
}
