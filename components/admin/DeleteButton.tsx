"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminActionError, requestAdminAction } from "@/lib/admin-action";

interface Props {
  id: string;
  endpoint: string;
  label: string;
}

export default function DeleteButton({ id, endpoint, label }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await requestAdminAction(`${endpoint}/${id}`, { method: "DELETE" }, `Gagal menghapus ${label}. Coba lagi.`);
      setConfirming(false);
      router.refresh();
    } catch (error) {
      setError(adminActionError(error, `Gagal menghapus ${label}. Coba lagi.`));
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "..." : "Ya"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => { setConfirming(false); setError(""); }}
          className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300"
        >
          Batal
        </button>
        {error && <p role="alert" className="w-full text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => { setError(""); setConfirming(true); }}
      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
      title={`Hapus ${label}`}
      aria-label={`Hapus ${label}`}
    >
      <Trash2 size={15} />
    </button>
  );
}
