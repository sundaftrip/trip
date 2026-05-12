"use client";
import { useState } from "react";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";

interface BlogShareButtonsProps {
  postTitle: string;
  isOutlined: boolean;
  isAtlas: boolean;
  pfx: string;
  headClr?: string;
  cardBg?: string;
  bdrClr?: string;
  subClr?: string;
}

export default function BlogShareButtons({
  postTitle, isOutlined, isAtlas, pfx, headClr, cardBg, bdrClr, subClr,
}: BlogShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => (typeof window !== "undefined" ? window.location.href : "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* browser may block */ }
  };

  const handleShare = async () => {
    const url = getUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: postTitle, url }); return; } catch { /* cancelled */ }
    }
    await handleCopy();
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Baca artikel perjalanan ini!\n*${postTitle}*\n${getUrl()}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  /* ── Atlas ─────────────────────────────── */
  if (isAtlas) {
    return (
      <div className="mt-10 pt-6 border-t-2 border-dashed" style={{ borderColor: bdrClr }}>
        <p className="text-xs uppercase tracking-widest mb-3 font-black" style={{ color: subClr }}>
          Bagikan Artikel Ini
        </p>
        <div className="flex gap-2">
          <button onClick={handleShare} title="Bagikan"
            className="at-pill flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black transition"
            style={{ background: cardBg, color: headClr, borderColor: bdrClr }}>
            <Share2 size={14} /> Bagikan
          </button>
          <button onClick={handleCopy} title="Salin link"
            className="at-pill flex items-center justify-center px-4 py-2.5 font-black transition"
            style={{ background: cardBg, color: headClr, borderColor: bdrClr }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button onClick={handleWhatsApp} title="Kirim ke WhatsApp"
            className="at-pill flex items-center justify-center px-4 py-2.5 font-black transition"
            style={{ background: "#dcfce7", color: "#166534", borderColor: "#bbf7d0" }}>
            <MessageCircle size={14} />
          </button>
        </div>
        {copied && <p className="text-xs text-center mt-2 font-black" style={{ color: subClr }}>Link tersalin!</p>}
      </div>
    );
  }

  /* ── Other outlined themes ─────────────── */
  if (isOutlined) {
    return (
      <div className="mt-10 pt-6 border-t-2 border-dashed" style={{ borderColor: bdrClr }}>
        <p className="text-xs uppercase tracking-wider mb-3 font-black" style={{ color: subClr }}>
          Bagikan Artikel Ini
        </p>
        <div className="flex gap-2">
          <button onClick={handleShare} title="Bagikan"
            className={`${pfx}-pill flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black transition`}
            style={{ background: cardBg, color: headClr }}>
            <Share2 size={14} /> Bagikan
          </button>
          <button onClick={handleCopy} title="Salin link"
            className={`${pfx}-pill flex items-center justify-center px-4 py-2.5 font-black transition`}
            style={{ background: cardBg, color: headClr }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button onClick={handleWhatsApp} title="Kirim ke WhatsApp"
            className={`${pfx}-pill flex items-center justify-center px-4 py-2.5 font-black transition`}
            style={{ background: "#dcfce7", color: "#166534" }}>
            <MessageCircle size={14} />
          </button>
        </div>
        {copied && <p className="text-xs text-center mt-2 font-black" style={{ color: subClr }}>Link tersalin!</p>}
      </div>
    );
  }

  /* ── Classic ───────────────────────────── */
  return (
    <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Bagikan Artikel Ini
      </p>
      <div className="flex gap-2">
        <button onClick={handleShare} title="Bagikan"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <Share2 size={14} /> Bagikan
        </button>
        <button onClick={handleCopy} title="Salin link"
          className="flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
        <button onClick={handleWhatsApp} title="Kirim ke WhatsApp"
          className="flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 transition">
          <MessageCircle size={14} />
        </button>
      </div>
      {copied && (
        <p className="text-xs text-center mt-2 text-green-600 dark:text-green-400 font-medium">Link tersalin!</p>
      )}
    </div>
  );
}
