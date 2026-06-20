"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Membungkus daftar itinerary agar bisa dilipat & di-extend.
 * Folding deterministik berdasarkan jumlah hari (count), bukan pengukuran DOM:
 * - count <= threshold  -> tampil penuh, tanpa tombol
 * - count >  threshold   -> default terlipat (clamp + fade), ada tombol toggle
 */
export default function ItineraryFold({
  children,
  count,
  threshold = 4,
  collapsedHeight = 380,
  accent,
}: {
  children: React.ReactNode;
  count: number;
  threshold?: number;
  collapsedHeight?: number;
  accent?: string;
}) {
  const contentId = useId();
  const [open, setOpen] = useState(false);
  const foldable = count > threshold;
  const collapsed = foldable && !open;
  const buttonStyle = accent
    ? {
        color: accent,
        borderColor: accent,
        backgroundColor: `color-mix(in srgb, ${accent} 7%, transparent)`,
      }
    : undefined;

  if (!foldable) return <>{children}</>;

  return (
    <div>
      <div
        id={contentId}
        className="relative overflow-hidden transition-[max-height] duration-500 ease-in-out"
        style={{ maxHeight: collapsed ? collapsedHeight : 6000 }}
      >
        {children}
        {collapsed && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
        )}
      </div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded border border-blue-600 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50 sm:w-auto"
        style={buttonStyle}
      >
        <span>
          {open ? "Sembunyikan itinerary" : `Buka itinerary lengkap (${count} hari)`}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          style={accent ? { color: accent } : undefined}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
