"use client";

import Link from "next/link";
import { Save } from "lucide-react";

interface Props {
  loading?: boolean;
  disabled?: boolean;
  loadingLabel?: string;
  primaryLabel: string;
  cancelHref?: string;
  cancelLabel?: string;
  onSave?: () => void;
}

export default function StickyFormActions({
  loading = false,
  disabled = false,
  loadingLabel = "Menyimpan...",
  primaryLabel,
  cancelHref,
  cancelLabel = "Batal",
  onSave,
}: Props) {
  return (
    <div className="sticky top-0 z-30 -mx-1 rounded-xl border border-gray-200/80 bg-white/95 p-3 shadow-sm backdrop-blur dark:border-gray-700/80 dark:bg-gray-900/95">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {cancelHref && (
          <Link
            href={cancelHref}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {cancelLabel}
          </Link>
        )}
        <button
          type={onSave ? "button" : "submit"}
          onClick={onSave}
          disabled={loading || disabled}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={16} />
          {loading ? loadingLabel : primaryLabel}
        </button>
      </div>
    </div>
  );
}
