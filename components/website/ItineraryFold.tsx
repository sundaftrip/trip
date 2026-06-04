"use client";

import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const foldable = count > threshold;
  const collapsed = foldable && !open;

  if (!foldable) return <>{children}</>;

  return (
    <div>
      <div
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
        onClick={() => setOpen((v) => !v)}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80"
        style={accent ? { color: accent } : undefined}
      >
        <span className={accent ? "" : "text-blue-600 dark:text-blue-400"}>
          {open ? "Tutup itinerary" : `Lihat itinerary lengkap (${count} hari)`}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""} ${accent ? "" : "text-blue-600 dark:text-blue-400"}`}
          style={accent ? { color: accent } : undefined}
        />
      </button>
    </div>
  );
}
