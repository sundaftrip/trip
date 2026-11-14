export const dynamic = "force-dynamic";

import { UsersRound } from "lucide-react";
import PoolAdmin from "@/components/admin/pool/PoolAdmin";
import { can, requireAdminModule } from "@/lib/admin-access";
import { isPoolTableMissing, loadAdminData, type AdminPoolData } from "@/lib/pool/store";

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
      <p className="font-bold">{title}</p>
      <div className="mt-1.5 space-y-1.5">{children}</div>
    </div>
  );
}

export default async function PoolAdminPage() {
  const viewer = await requireAdminModule("pool");
  const header = (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-sm">
        <UsersRound size={20} className="text-white" />
      </div>
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">Pool Trip</h1>
        <p className="text-sm text-gray-500">Orang dengan tanggal tiba yang sama dikumpulkan jadi satu rombongan.</p>
      </div>
    </div>
  );

  // Nama dan nomor WhatsApp pendaftar hanya dimuat untuk akun dengan izin pool_view.
  if (!can(viewer, "pool_view")) {
    return (
      <div className="max-w-6xl">
        {header}
        <Notice title="Akun ini belum boleh melihat pendaftar pool">
          <p>Minta Super Admin menyalakan izin &quot;Lihat pendaftar pool&quot; di menu Izin Akses.</p>
        </Notice>
      </div>
    );
  }

  let data: AdminPoolData;
  try {
    data = await loadAdminData();
  } catch (err) {
    if (!isPoolTableMissing(err)) throw err;
    return (
      <div className="max-w-6xl">
        {header}
        <Notice title="Tabel pool belum ada di database">
          <p>Kode halaman ini sudah terpasang, tetapi tabelnya belum dibuat. Jalankan deploy production sekali dengan <code>ALLOW_PRODUCTION_DB_MIGRATION=true</code> (lihat <code>docs/pool.md</code>), lalu muat ulang halaman ini.</p>
        </Notice>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {header}
      <PoolAdmin data={data} canEdit={can(viewer, "pool_edit")} />
    </div>
  );
}
