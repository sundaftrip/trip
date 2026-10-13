"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { readApiError } from "@/lib/admin-fetch";

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
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError(await readApiError(res, `Gagal menghapus ${label}.`));
        return;
      }
      setConfirming(false);
      router.refresh();
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="relative flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "..." : "Hapus"}
        </button>
        <button
          onClick={() => { setConfirming(false); setError(""); }}
          className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200"
        >
          Batal
        </button>
        {error && (
          <p role="alert" className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 shadow-lg dark:border-red-800 dark:bg-gray-900 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded p-1.5 text-gray-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
      title={`Hapus ${label}`}
      aria-label={`Hapus ${label}`}
    >
      <Trash2 size={15} />
    </button>
  );
}
