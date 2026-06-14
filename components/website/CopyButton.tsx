"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copyValue}
      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-800 transition hover:bg-gray-50"
    >
      {copied ? <Check size={14} className="text-teal-600" /> : <Copy size={14} />}
      {copied ? "Tersalin" : label}
    </button>
  );
}
