"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Pin, PinOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  pinned: boolean;
  disabled?: boolean;
}

export default function TourPinButton({ id, pinned, disabled = false }: Props) {
  const router = useRouter();
  const [isPinned, setIsPinned] = useState(pinned);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const Icon = loading ? Loader2 : isPinned ? PinOff : Pin;

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  function showFeedback(message: string) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(message);
    feedbackTimer.current = setTimeout(() => setFeedback(""), 1800);
  }

  async function togglePin() {
    if (loading || disabled) return;

    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    setLoading(true);
    setFeedback(nextPinned ? "Pin..." : "Lepas...");
    setError("");
    const res = await fetch(`/api/tours/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: nextPinned }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setIsPinned(!nextPinned);
      setFeedback("");
      setError(data.error ?? "Gagal update pin.");
      return;
    }

    showFeedback(nextPinned ? "Dipin" : "Dilepas");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={togglePin}
        disabled={loading || disabled}
        title={disabled ? "Maksimal 5 tour dipin" : isPinned ? "Lepas pin dari Tour Pilihan" : "Pin ke Tour Pilihan"}
        className={`inline-flex w-16 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
          loading
            ? "border-teal-500 bg-teal-500 text-white shadow-teal-500/20 dark:border-teal-400 dark:bg-teal-500 dark:text-white"
            : isPinned
            ? "border-teal-500 bg-teal-500 text-white shadow-teal-500/20 hover:border-teal-600 hover:bg-teal-600"
            : "border-gray-300 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-teal-700 dark:hover:bg-teal-900/20"
        }`}
        aria-label={isPinned ? "Lepas pin tour" : "Pin tour"}
      >
        <Icon size={15} className={loading ? "animate-spin" : ""} />
        <span>{loading ? "..." : isPinned ? "On" : disabled ? "Max" : "Pin"}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {feedback || error}
      </span>
      {error && (
        <p className="absolute right-0 z-10 mt-1 w-52 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 shadow-lg dark:border-red-800 dark:bg-gray-900 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
