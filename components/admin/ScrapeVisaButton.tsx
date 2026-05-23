"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ArrowRight, CheckCircle2, AlertCircle, X } from "lucide-react";
import { FlagIcon } from "@/lib/flag-icon";

interface DiffChange {
  field: "visa" | "stay";
  current: string;
  wiki: string;
  raw?: string;
}

interface Diff {
  id: string;
  flag: string;
  name: string;
  en: string;
  changes: DiffChange[];
}

interface ScrapeResult {
  scrapedAt: string;
  source: string;
  totalEntries: number;
  wikiRowCount: number;
  diffs: Diff[];
  unmatched: string[];
}

const VISA_LABEL: Record<string, string> = {
  bebas: "Bebas Visa",
  voa: "Visa on Arrival",
  evisa: "E-Visa",
  wajib: "Visa Wajib",
};

const FIELD_LABEL: Record<DiffChange["field"], string> = {
  visa: "Jenis visa",
  stay: "Maks. tinggal",
};

function pretty(field: DiffChange["field"], value: string): string {
  if (field === "visa") return VISA_LABEL[value] ?? value;
  return value;
}

export default function ScrapeVisaButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  async function runScrape() {
    setError(null);
    setLoading(true);
    setApplied(new Set());
    try {
      const res = await fetch("/api/visa-database/scrape", { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as ScrapeResult;
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function applyDiff(diff: Diff, change: DiffChange) {
    setApplying(`${diff.id}-${change.field}`);
    try {
      const entryRes = await fetch(`/api/visa-database/${diff.id}`);
      if (!entryRes.ok) throw new Error("Gagal baca data terkini");
      const entry = await entryRes.json();
      const payload = {
        ...entry,
        [change.field]: change.wiki,
      };
      const res = await fetch(`/api/visa-database/${diff.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal menerapkan perubahan");
      setApplied((s) => new Set(s).add(`${diff.id}-${change.field}`));
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setApplying(null);
    }
  }

  function dismiss() {
    setResult(null);
    setError(null);
    setApplied(new Set());
  }

  return (
    <>
      <button
        type="button"
        onClick={runScrape}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Memindai Wikipedia...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Scraping Visa
          </>
        )}
      </button>

      {(result || error) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Hasil Scraping Visa
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Sumber: Wikipedia &mdash; <i>Visa requirements for Indonesian citizens</i>
                  </p>
                </div>
              </div>
              <button
                onClick={dismiss}
                className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Scraping gagal</p>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              )}

              {result && (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <Stat label="Negara di DB" value={result.totalEntries} />
                    <Stat label="Baris di Wikipedia" value={result.wikiRowCount} />
                    <Stat
                      label="Perubahan terdeteksi"
                      value={result.diffs.length}
                      accent={result.diffs.length > 0}
                    />
                  </div>

                  {result.unmatched.length > 0 && (
                    <div className="flex items-start gap-2 p-3 mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>
                        <b>{result.unmatched.length} negara</b> tidak ketemu di Wikipedia
                        (kemungkinan beda nama): {result.unmatched.join(", ")}.
                      </span>
                    </div>
                  )}

                  {result.diffs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <CheckCircle2 size={36} className="text-emerald-500 mb-3" />
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Tidak ada perubahan
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                        Database sudah sesuai dengan Wikipedia. Jalankan lagi nanti.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Tinjau tiap perubahan. <b>Biaya tidak pernah disentuh</b> — scraper
                        hanya mengusulkan perubahan untuk jenis visa &amp; masa tinggal.
                      </p>
                      {result.diffs.map((d) => (
                        <div
                          key={d.id}
                          className="border border-gray-200 dark:border-gray-800 rounded-xl p-4"
                        >
                          <div className="flex items-center gap-2.5 mb-3">
                            <FlagIcon flag={d.flag} rounded label={d.name} width={32} />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {d.name}
                              </p>
                              <p className="text-xs text-gray-400">{d.en}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {d.changes.map((ch) => {
                              const key = `${d.id}-${ch.field}`;
                              const isApplied = applied.has(key);
                              const isApplying = applying === key;
                              return (
                                <div
                                  key={ch.field}
                                  className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm"
                                >
                                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 min-w-[110px]">
                                    {FIELD_LABEL[ch.field]}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400 line-through">
                                    {pretty(ch.field, ch.current) || "(kosong)"}
                                  </span>
                                  <ArrowRight size={14} className="text-gray-400" />
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {pretty(ch.field, ch.wiki)}
                                  </span>
                                  {isApplied ? (
                                    <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle2 size={14} /> Diterapkan
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => applyDiff(d, ch)}
                                      disabled={isApplying}
                                      className="ml-auto px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition"
                                    >
                                      {isApplying ? "Menerapkan..." : "Terapkan"}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={dismiss}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-xl border ${
        accent
          ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800"
          : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800"
      }`}
    >
      <p
        className={`text-2xl font-bold ${
          accent
            ? "text-violet-700 dark:text-violet-300"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
