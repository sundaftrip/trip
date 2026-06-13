"use client";
import { useState } from "react";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";

interface TourShareButtonsProps {
  tourTitle: string;
  isOutlined: boolean;
  isAtlas: boolean;
  pfx: string;
  tText?: string;
  tCard?: string;
  tBdr?: string;
  tSub?: string;
}

export default function TourShareButtons({
  tourTitle,
  isOutlined,
  isAtlas,
  pfx,
  tText,
  tCard,
  tBdr,
  tSub,
}: TourShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () =>
    typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* ignore, browser may block */ }
  };

  const handleShare = async () => {
    const url = getUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: tourTitle, url });
        return;
      } catch { /* user cancelled */ }
    }
    await handleCopy();
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hei, cek paket tour ini di sundaftrip.com!\n*${tourTitle}*\n${getUrl()}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  /* ─── Atlas theme: minimal, B&W ─── */
  if (isAtlas) {
    return (
      <div
        className="mt-4 pt-4 border-t-2 border-dashed"
        style={{ borderColor: tBdr }}
      >
        <p
          className="text-xs uppercase tracking-widest mb-2.5 font-black"
          style={{ color: tSub }}
        >
          Bagikan
        </p>
        <div className="flex gap-2">
          {/* Share / native */}
          <button
            onClick={handleShare}
            className="at-pill flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-black transition"
            style={{ background: tCard, color: tText, borderColor: tBdr }}
            title="Bagikan"
          >
            <Share2 size={13} /> Bagikan
          </button>

          {/* Copy link */}
          <button
            onClick={handleCopy}
            className="at-pill flex items-center justify-center px-3 py-2 text-xs font-black transition"
            style={{ background: tCard, color: tText, borderColor: tBdr }}
            title="Salin link"
          >
            {copied
              ? <Check size={13} style={{ color: tText }} />
              : <Copy size={13} />}
          </button>

          {/* WhatsApp share */}
          <button
            onClick={handleWhatsApp}
            className="at-pill flex items-center justify-center px-3 py-2 text-xs font-black transition"
            style={{ background: "#dcfce7", color: "#166534", borderColor: "#bbf7d0" }}
            title="Kirim ke WhatsApp"
          >
            <MessageCircle size={13} />
          </button>
        </div>
        {copied && (
          <p className="text-xs text-center mt-1.5 font-black" style={{ color: tSub }}>
            Link tersalin!
          </p>
        )}
      </div>
    );
  }

  /* ─── Other outlined themes (tropical, kawaii, pixel) ─── */
  if (isOutlined) {
    return (
      <div
        className="mt-4 pt-4 border-t-2 border-dashed"
        style={{ borderColor: tBdr }}
      >
        <p
          className="text-xs uppercase tracking-wider mb-2.5 font-black"
          style={{ color: tSub }}
        >
          Bagikan
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className={`${pfx}-pill flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-black transition`}
            style={{ background: tCard, color: tText }}
            title="Bagikan"
          >
            <Share2 size={13} /> Bagikan
          </button>
          <button
            onClick={handleCopy}
            className={`${pfx}-pill flex items-center justify-center px-3 py-2 text-xs font-black transition`}
            style={{ background: tCard, color: tText }}
            title="Salin link"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
          <button
            onClick={handleWhatsApp}
            className={`${pfx}-pill flex items-center justify-center px-3 py-2 text-xs font-black transition`}
            style={{ background: "#dcfce7", color: "#166534" }}
            title="Kirim ke WhatsApp"
          >
            <MessageCircle size={13} />
          </button>
        </div>
        {copied && (
          <p className="text-xs text-center mt-1.5 font-black" style={{ color: tSub }}>
            Link tersalin!
          </p>
        )}
      </div>
    );
  }

  /* ─── Classic / Globe theme ─── */
  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
        Bagikan
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Bagikan"
        >
          <Share2 size={13} /> Bagikan
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Salin link"
        >
          {copied
            ? <Check size={13} className="text-green-500" />
            : <Copy size={13} />}
        </button>
        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 transition"
          title="Kirim ke WhatsApp"
        >
          <MessageCircle size={13} />
        </button>
      </div>
      {copied && (
        <p className="text-xs text-center mt-1.5 text-green-600 dark:text-green-400 font-medium">
          Link tersalin!
        </p>
      )}
    </div>
  );
}
