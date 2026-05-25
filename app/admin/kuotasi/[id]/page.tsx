import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { getQuotation } from "@/lib/kuotasi/data";
import KuotasiEditor from "./KuotasiEditor";

export const dynamic = "force-dynamic";

export default async function KuotasiEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = await getQuotation(id);
  if (!q) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/kuotasi" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-1">
            <ArrowLeft size={14} /> Kembali ke daftar
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{q.title}</h1>
          <p className="text-xs text-gray-500">
            {q.country} · {q.durationDays} hari · {q.currency} @ {q.kursForeign.toLocaleString("id-ID")} · margin {q.marginPct}%
          </p>
        </div>
        <Link
          href={`/api/kuotasi/${q.id}/pdf`}
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <FileText size={15} /> Preview PDF
        </Link>
      </div>

      <KuotasiEditor initial={q} />
    </div>
  );
}
