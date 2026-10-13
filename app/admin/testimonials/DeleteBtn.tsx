"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { sendJson } from "@/lib/admin-fetch";

export default function TestimonialDeleteBtn({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Hapus testimoni dari "${name}"?`)) return;
    setLoading(true);
    const error = await sendJson(`/api/testimonials/${id}`, "DELETE", undefined, "Gagal menghapus testimoni.");
    setLoading(false);
    if (error) {
      alert(error);
      return;
    }
    router.refresh();
  }

  return (
    <button onClick={handleDelete} disabled={loading} aria-label={`Hapus testimoni ${name}`}
      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50">
      <Trash2 size={14} />
    </button>
  );
}
