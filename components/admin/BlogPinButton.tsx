"use client";

import { useState } from "react";
import { Pin, PinOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { readApiError } from "@/lib/admin-fetch";
import { MAX_PINNED_POSTS } from "@/lib/blog-pins";

interface Props {
  id: string;
  pinnedIds: string[];
  published: boolean;
}

/** Sematkan / lepas artikel di atas halaman Jurnal (maks 3). */
export default function BlogPinButton({ id, pinnedIds, published }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isPinned = pinnedIds.includes(id);
  const full = !isPinned && pinnedIds.length >= MAX_PINNED_POSTS;
  const disabled = loading || (!isPinned && (!published || full));
  const title = isPinned
    ? "Lepas sematan"
    : !published
      ? "Publish artikel dulu sebelum disematkan"
      : full
        ? `Maksimal ${MAX_PINNED_POSTS} artikel disematkan. Lepas salah satu dulu.`
        : "Sematkan di atas halaman Jurnal";

  async function toggle() {
    setLoading(true);
    setError("");
    const ids = isPinned ? pinnedIds.filter((pid) => pid !== id) : [...pinnedIds, id];
    try {
      const res = await fetch("/api/blog/pins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        setError(await readApiError(res, "Gagal menyimpan sematan."));
        return;
      }
      router.refresh();
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        disabled={disabled}
        title={title}
        aria-label={title}
        aria-pressed={isPinned}
        className={`rounded p-1.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${
          isPinned
            ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
            : "text-gray-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20"
        }`}
      >
        {isPinned ? <PinOff size={15} /> : <Pin size={15} />}
      </button>
      {error && (
        <p role="alert" className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 shadow-lg dark:border-red-800 dark:bg-gray-900 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
