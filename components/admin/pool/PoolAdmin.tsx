"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Lock, Sprout } from "lucide-react";
import { sendJson } from "@/lib/admin-fetch";
import type { AdminPoolData } from "@/lib/pool/store";
import SignupsPanel from "./SignupsPanel";
import DestinationsPanel from "./DestinationsPanel";
import ImportPanel from "./ImportPanel";

type Tab = "signups" | "destinations" | "import";

const TABS: { key: Tab; label: string }[] = [
  { key: "signups", label: "Pendaftar" },
  { key: "destinations", label: "Negara & harga" },
  { key: "import", label: "Impor dari Sheet" },
];

export default function PoolAdmin({ data, canEdit }: { data: AdminPoolData; canEdit: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signups");
  const [busy, setBusy] = useState(false);
  const hasKz = data.destinations.some((d) => d.engine === "kazakhstan");
  const tabs = TABS.filter((t) => (t.key === "import" ? canEdit && hasKz : true));

  async function run(url: string, method: "POST" | "PUT", body?: unknown) {
    setBusy(true);
    const error = await sendJson(url, method, body);
    setBusy(false);
    if (error) return alert(error);
    router.refresh();
  }

  if (!data.destinations.length) {
    return (
      <div className="rounded-xl border border-gray-200 p-8 text-center dark:border-gray-800">
        <Sprout size={36} className="mx-auto mb-3 text-teal-600" />
        <p className="font-bold text-gray-900 dark:text-white">Belum ada negara pool</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
          Mulai dengan tiga negara: Kazakhstan (harga dan pengaturan dari Sheet lama, langsung Buka), Kirgistan dan Rusia (daftar minat sampai harganya diisi).
        </p>
        {canEdit && (
          <button
            type="button" disabled={busy} onClick={() => run("/api/pool-admin/settings", "POST")}
            className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {busy ? "Membuat…" : "Buat negara awal"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-900" role="tablist" aria-label="Bagian pool">
          {tabs.map((t) => (
            <button
              key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
              className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition ${tab === t.key ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white" : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <a href="/pool" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-teal-700 hover:underline dark:text-teal-400">
            Lihat halaman publik <ExternalLink size={13} />
          </a>
          <button
            type="button" disabled={!canEdit || busy}
            onClick={() => {
              if (data.open && !confirm("Tutup semua pendaftaran pool? Halaman tetap tampil, tetapi formulir tidak bisa dikirim.")) return;
              run("/api/pool-admin/settings", "PUT", { open: !data.open });
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${data.open ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"} disabled:cursor-default`}
            title={canEdit ? "Klik untuk membuka atau menutup semua pendaftaran" : undefined}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${data.open ? "bg-green-600" : "bg-red-600"}`} />
            {data.open ? "Pendaftaran dibuka" : "Pendaftaran ditutup"}
          </button>
        </div>
      </div>

      <p className="mb-4 flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-400">
        <Lock size={13} className="mt-0.5 shrink-0" />
        <span>Pengunjung website hanya melihat jumlah orang per tanggal. Nama dan nomor WhatsApp hanya tampil di halaman ini, untuk akun dengan izin &quot;Lihat pendaftar pool&quot;.</span>
      </p>

      {tab === "signups" && <SignupsPanel data={data} canEdit={canEdit} />}
      {tab === "destinations" && <DestinationsPanel data={data} canEdit={canEdit} />}
      {tab === "import" && <ImportPanel data={data} />}
    </div>
  );
}
