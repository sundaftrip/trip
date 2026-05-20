"use client";

import { useState } from "react";

/* Quote testimonial yang bisa di-expand/collapse.
   Default: line-clamp-5. Click → expand penuh + tombol "Tutup". */
export default function ExpandableQuote({
  text,
  color,
}: {
  text: string;
  color?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex-1 flex flex-col">
      <p
        className={`text-sm leading-relaxed mt-4 ${expanded ? "" : "line-clamp-5"}`}
        style={color ? { color } : undefined}
      >
        &ldquo;{text}&rdquo;
      </p>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-[10px] tracking-[0.16em] uppercase font-semibold mt-3 opacity-60 hover:opacity-100 transition-opacity self-start"
        style={color ? { color } : undefined}
      >
        {expanded ? "Tutup ↑" : "Selengkapnya ↓"}
      </button>
    </div>
  );
}
