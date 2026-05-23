"use client";

import { useState } from "react";

/* Quote testimonial yang bisa di-expand/collapse.
   Default: line-clamp-3 supaya halaman tidak jadi wall-of-text di mobile.
   Tombol "Selengkapnya" cuma muncul kalau teks memang lebih panjang dari clamp. */
export default function ExpandableQuote({
  text,
  color,
}: {
  text: string;
  color?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  // Heuristik: anggap perlu tombol kalau teks > ~180 karakter (kira-kira 3 baris).
  // Lebih murah dari mengukur DOM, cukup akurat untuk testimoni.
  const needsToggle = text.length > 180;

  return (
    <div className="flex-1 flex flex-col">
      <p
        className={`text-sm leading-relaxed mt-4 ${expanded ? "" : "line-clamp-3"}`}
        style={color ? { color } : undefined}
      >
        &ldquo;{text}&rdquo;
      </p>
      {needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] tracking-[0.16em] uppercase font-semibold mt-3 opacity-60 hover:opacity-100 transition-opacity self-start"
          style={color ? { color } : undefined}
        >
          {expanded ? "Tutup ↑" : "Selengkapnya ↓"}
        </button>
      )}
    </div>
  );
}
