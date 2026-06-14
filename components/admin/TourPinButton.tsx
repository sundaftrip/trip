"use client";

import { useState } from "react";
import { Pin, PinOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  pinned: boolean;
  disabled?: boolean;
}

export default function TourPinButton({ id, pinned, disabled = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const Icon = pinned ? PinOff : Pin;

  async function togglePin() {
    if (loading || disabled) return;

    setLoading(true);
    setError("");
    const res = await fetch(`/api/tours/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !pinned }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal update pin.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={togglePin}
        disabled={loading || disabled}
        title={disabled ? "Maksimal 5 tour dipin" : pinned ? "Lepas pin dari Tour Pilihan" : "Pin ke Tour Pilihan"}
        className={`inline-flex min-w-[5.75rem] items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          pinned
            ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            : "border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-900/20"
        }`}
        aria-label={pinned ? "Lepas pin tour" : "Pin tour"}
      >
        <Icon size={15} />
        <span>{loading ? "..." : pinned ? "Unpin" : disabled ? "Max 5" : "Pin"}</span>
      </button>
      {error && (
        <p className="absolute right-0 z-10 mt-1 w-52 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 shadow-lg dark:border-red-800 dark:bg-gray-900 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
