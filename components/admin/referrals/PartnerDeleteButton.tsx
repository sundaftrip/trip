"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  name: string;
}

export default function PartnerDeleteButton({ id, name }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!window.confirm(`Hapus partner "${name}"? Aksi ini hanya bisa untuk partner tanpa lead, komisi, atau dispute.`)) {
      return;
    }

    setLoading(true);
    setError("");
    const res = await fetch(`/api/referrals/partners/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Gagal menghapus partner.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        title={`Hapus ${name}`}
        aria-label={`Hapus ${name}`}
      >
        <Trash2 size={15} />
      </button>
      {error && (
        <p className="absolute right-0 z-10 mt-1 w-64 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 shadow-lg dark:border-red-800 dark:bg-gray-900 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
