"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, MapPin, FileCheck, HelpCircle, ArrowRight } from "lucide-react";

type Results = {
  tours: { title: string; country: string; statusLabel: string; active: boolean; dateLabel?: string | null; href: string }[];
  visa: { name: string; en: string; href: string }[];
  faqs: { question: string; section: string; href: string }[];
};

const EMPTY: Results = { tours: [], visa: [], faqs: [] };

export default function GlobalSearch({
  lang = "id",
  triggerClassName = "",
  triggerStyle,
}: {
  lang?: "id" | "en";
  triggerClassName?: string;
  triggerStyle?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Results>(EMPTY);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const t = (id: string, en: string) => (lang === "en" ? en : id);

  // Shortcut: Cmd/Ctrl+K buka, Esc tutup
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Fokus input + kunci scroll saat modal terbuka
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      document.body.style.overflow = "";
      setQ("");
      setRes(EMPTY);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Debounced fetch
  useEffect(() => {
    if (!open) return;
    const query = q.trim();
    if (query.length < 2) { setRes(EMPTY); setLoading(false); return; }
    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const d = (await r.json()) as Results;
        setRes(d);
      } catch { /* abort/ignore */ }
      finally { setLoading(false); }
    }, 220);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [q, open]);

  const go = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  const total = res.tours.length + res.visa.length + res.faqs.length;
  const showEmpty = q.trim().length >= 2 && !loading && total === 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("Cari", "Search")}
        className={triggerClassName || "inline-flex items-center justify-center"}
        style={triggerStyle}
      >
        <Search size={15} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[12vh] bg-black/60 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 border-b border-gray-100 dark:border-gray-800">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("Cari destinasi, visa, atau pertanyaan… cth: Spanyol", "Search destination, visa, or FAQ… e.g. Spain")}
                className="flex-1 bg-transparent py-4 text-[15px] text-gray-900 dark:text-white outline-none placeholder:text-gray-400"
              />
              {loading && <Loader2 size={16} className="animate-spin text-gray-400 shrink-0" />}
              <button type="button" onClick={() => setOpen(false)} aria-label={t("Tutup", "Close")}
                className="shrink-0 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <X size={18} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto py-2">
              {q.trim().length < 2 && (
                <p className="px-4 py-8 text-center text-sm text-gray-400">
                  {t("Ketik minimal 2 huruf untuk mencari.", "Type at least 2 letters to search.")}
                </p>
              )}

              {showEmpty && (
                <p className="px-4 py-8 text-center text-sm text-gray-400">
                  {t(`Tidak ada hasil untuk "${q}".`, `No results for "${q}".`)}
                </p>
              )}

              {res.tours.length > 0 && (
                <Group label={t("Tour", "Tours")}>
                  {res.tours.map((it) => (
                    <Row key={it.href} icon={<MapPin size={15} />} onClick={() => go(it.href)}
                      title={it.title}
                      sub={
                        <span className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-px rounded text-[10px] font-bold ${
                            it.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : it.statusLabel === "Selesai" ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}>{it.statusLabel}</span>
                          <span className="text-gray-400">{[it.country, it.dateLabel].filter(Boolean).join(" · ")}</span>
                        </span>
                      } />
                  ))}
                </Group>
              )}

              {res.visa.length > 0 && (
                <Group label={t("Layanan Visa", "Visa Service")}>
                  {res.visa.map((it) => (
                    <Row key={it.href} icon={<FileCheck size={15} />} onClick={() => go(it.href)}
                      title={t(`Visa ${it.name}`, `${it.en} Visa`)} sub={t("Info & pengurusan visa", "Visa info & assistance")} />
                  ))}
                </Group>
              )}

              {res.faqs.length > 0 && (
                <Group label={t("Pertanyaan", "FAQ")}>
                  {res.faqs.map((it, i) => (
                    <Row key={i} icon={<HelpCircle size={15} />} onClick={() => go(it.href)}
                      title={it.question} sub={it.section} />
                  ))}
                </Group>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-2 pb-1">
      <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{label}</p>
      {children}
    </div>
  );
}

function Row({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub?: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <span className="shrink-0 text-gray-400 group-hover:text-emerald-500">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-gray-900 dark:text-white truncate">{title}</span>
        {sub && <span className="block text-xs text-gray-400 truncate">{sub}</span>}
      </span>
      <ArrowRight size={14} className="shrink-0 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
