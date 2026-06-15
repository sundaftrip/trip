"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  name: string;
  canDelete: boolean;
  blockedReason?: string;
};

export default function PartnerDeleteButton({ id, name, canDelete, blockedReason }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!canDelete) {
      const message = blockedReason ?? "Partner ini tidak bisa dihapus karena masih punya histori.";
      setError(message);
      window.alert(message);
      return;
    }

    if (!window.confirm(`Hapus partner "${name}"? Hanya partner tanpa lead, komisi, atau dispute yang bisa dihapus.`)) {
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch(`/api/referrals/partners/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));

    setLoading(false);

    if (!response.ok) {
      const message = data.error ?? "Gagal menghapus partner.";
      setError(message);
      window.alert(message);
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
        className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
          canDelete
            ? "text-gray-500 hover:bg-red-50 hover:text-red-600"
            : "text-gray-300 hover:bg-amber-50 hover:text-amber-600 dark:text-gray-600"
        }`}
        title={canDelete ? `Hapus ${name}` : (blockedReason ?? "Partner ini tidak bisa dihapus")}
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
