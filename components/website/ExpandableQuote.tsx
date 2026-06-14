"use client";

import { useState } from "react";

/* Quote testimonial yang bisa di-expand/collapse.
   Default: line-clamp-3 supaya halaman tidak jadi wall-of-text di mobile.
   Tombol "Selengkapnya" cuma muncul kalau teks memang lebih panjang dari clamp. */
export default function ExpandableQuote({
  text,
  color,
  clampClassName = "line-clamp-3",
  allowExpand = true,
  onExpand,
  toggleThreshold = 180,
  dialogControlId,
}: {
  text: string;
  color?: string;
  clampClassName?: string;
  allowExpand?: boolean;
  onExpand?: () => void;
  toggleThreshold?: number;
  dialogControlId?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  // Heuristik: anggap perlu tombol kalau teks > ~180 karakter (kira-kira 3 baris).
  // Lebih murah dari mengukur DOM, cukup akurat untuk testimoni.
  const needsToggle = allowExpand && text.length > toggleThreshold;
  const inlineExpanded = expanded && !onExpand;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <p
        className={`text-sm leading-relaxed mt-4 ${inlineExpanded ? "" : clampClassName}`}
        style={color ? { color } : undefined}
      >
        &ldquo;{text}&rdquo;
      </p>
      {needsToggle && dialogControlId ? (
        <label
          htmlFor={dialogControlId}
          className="text-[10px] tracking-[0.16em] uppercase font-semibold mt-3 opacity-60 hover:opacity-100 transition-opacity self-start cursor-pointer"
          style={color ? { color } : undefined}
        >
          Selengkapnya
        </label>
      ) : needsToggle ? (
        <button
          type="button"
          onClick={() => onExpand ? onExpand() : setExpanded(!expanded)}
          className="text-[10px] tracking-[0.16em] uppercase font-semibold mt-3 opacity-60 hover:opacity-100 transition-opacity self-start"
          style={color ? { color } : undefined}
        >
          {onExpand ? "Selengkapnya" : expanded ? "Tutup ↑" : "Selengkapnya ↓"}
        </button>
      ) : null}
    </div>
  );
}
