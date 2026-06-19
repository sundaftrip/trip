"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronRight } from "lucide-react";
import { visaSlug } from "@/lib/visa-slug";
import { FlagIcon } from "@/lib/flag-icon";

type Visa = "bebas" | "voa" | "evisa" | "wajib";

export interface VisaCountry {
  id: string;
  flag: string;
  name: string;
  en: string;
  region: string;
  visa: string;
  stay: string;
  cost: string;
  notes: string;
}

const VISA_LABEL: Record<Visa, string> = {
  bebas: "Bebas Visa",
  voa: "Visa on Arrival",
  evisa: "E-Visa",
  wajib: "Visa Wajib",
};

const VISA_BADGE: Record<Visa, string> = {
  bebas: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  voa: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  evisa: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  wajib: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

const VISA_KEYS = Object.keys(VISA_LABEL) as Visa[];

const FIELD =
  "px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 " +
  "bg-white dark:bg-gray-900 text-base sm:text-sm text-gray-700 dark:text-gray-200 " +
  "outline-none focus:border-gray-400 dark:focus:border-gray-600";

function isVisa(v: string): v is Visa {
  return v === "bebas" || v === "voa" || v === "evisa" || v === "wajib";
}

function costInfo(raw: string) {
  const text = raw.trim() || "Gratis";
  return { text, isFree: text === "Gratis" };
}

export default function VisaDatabase({ entries }: { entries: VisaCountry[] }) {
  const router = useRouter();
  const COUNTRIES = entries;
  const REGIONS = useMemo(
    () => Array.from(new Set(COUNTRIES.map((c) => c.region))),
    [COUNTRIES],
  );

  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [visa, setVisa] = useState("");

  const filtered = useMemo(() => {
    const query = q.toLowerCase().trim();
    return COUNTRIES.filter((c) => {
      const matchQ =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.en.toLowerCase().includes(query) ||
        c.region.toLowerCase().includes(query);
      return matchQ && (!region || c.region === region) && (!visa || c.visa === visa);
    });
  }, [q, region, visa, COUNTRIES]);

  const hasFilter = Boolean(q || region || visa);

  return (
    <section className="mb-14">
      {/* Filter, stack vertikal di mobile, sejajar di sm+ */}
      <div className="sticky top-16 sm:top-20 z-40 -mx-4 sm:mx-0 mb-4 border-y border-gray-200/80 bg-gray-50/95 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-gray-50/85 dark:border-gray-800/80 dark:bg-gray-950/95 dark:supports-[backdrop-filter]:bg-gray-950/85">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <div className="relative sm:flex-1 sm:min-w-[180px] sm:max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari negara..."
              className={`w-full pl-9 ${FIELD}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:contents">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={`${FIELD} cursor-pointer w-full sm:w-auto`}
            >
              <option value="">Semua Wilayah</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              value={visa}
              onChange={(e) => setVisa(e.target.value)}
              className={`${FIELD} cursor-pointer w-full sm:w-auto`}
            >
              <option value="">Semua Jenis Visa</option>
              {VISA_KEYS.map((v) => (
                <option key={v} value={v}>
                  {VISA_LABEL[v]}
                </option>
              ))}
            </select>
          </div>
          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setRegion("");
                setVisa("");
              }}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Reset filter
            </button>
          )}
        </div>
      </div>

      {/* MOBILE: card stack, sampai md */}
      <div className="md:hidden space-y-3">
        {filtered.map((c) => {
          const cost = costInfo(c.cost);
          return (
            <Link
              key={c.id}
              href={`/visa/${visaSlug(c.en)}`}
              className="block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-colors hover:border-gray-300 dark:hover:border-gray-700 active:bg-gray-50 dark:active:bg-gray-800/50"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FlagIcon flag={c.flag} rounded label={c.name} width={32} />
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white truncate">
                      {c.name}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{c.en}</div>
                  </div>
                </div>
                {isVisa(c.visa) ? (
                  <span
                    className={`shrink-0 inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${VISA_BADGE[c.visa]}`}
                  >
                    {VISA_LABEL[c.visa]}
                  </span>
                ) : (
                  <span className="shrink-0 text-[11px] text-gray-400">{c.visa}</span>
                )}
              </div>

              <dl className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <dt className="text-gray-400 uppercase tracking-wide">Wilayah</dt>
                  <dd className="mt-0.5 text-gray-700 dark:text-gray-300 font-medium">
                    {c.region}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-400 uppercase tracking-wide">Maks. Tinggal</dt>
                  <dd className="mt-0.5 text-gray-700 dark:text-gray-300 font-medium">
                    {c.stay}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-400 uppercase tracking-wide">Biaya</dt>
                  <dd
                    className={`mt-0.5 font-semibold ${
                      cost.isFree
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {cost.text}
                  </dd>
                </div>
              </dl>

              {c.notes && (
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 line-clamp-3">
                  {c.notes}
                </p>
              )}
              <div className="flex items-center justify-end gap-1 mt-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                Lihat detail <ChevronRight size={12} aria-hidden />
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-12 text-center text-sm text-gray-400">
            Tidak ada negara yang cocok dengan pencarian.
          </div>
        )}
      </div>

      {/* DESKTOP: tabel, mulai md */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 text-left">
              {["Negara", "Wilayah", "Jenis Visa", "Maks. Tinggal", "Biaya", "Catatan"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wide text-gray-500 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const cost = costInfo(c.cost);
              const href = `/visa/${visaSlug(c.en)}`;
              return (
                <tr
                  key={c.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`Detail visa ${c.name}`}
                  onClick={() => router.push(href)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(href);
                    }
                  }}
                  className="group cursor-pointer align-top transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gray-400 dark:hover:bg-gray-900/40 dark:focus-visible:bg-gray-900/40 dark:focus-visible:outline-gray-600"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <FlagIcon flag={c.flag} rounded label={c.name} width={28} />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                          <span className="relative inline-block">
                            {/* Stabilo: sapuan highlighter tak beraturan, muncul saat baris di-hover */}
                            <span
                              aria-hidden
                              className="pointer-events-none absolute -inset-x-2 -inset-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              style={{
                                backgroundImage:
                                  "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20120%2040'%20preserveAspectRatio='none'%3E%3Cpath%20d='M4%2011%20C26%204%2056%207%2085%205%20C106%203%20118%208%20115%2016%20C118%2027%20113%2036%20103%2035%20C71%2039%2039%2036%2019%2038%20C6%2039%201%2032%205%2024%20C1%2018%201%2014%204%2011%20Z'%20fill='%2300ADB5'%20fill-opacity='0.42'/%3E%3C/svg%3E\")",
                                backgroundRepeat: "no-repeat",
                                backgroundSize: "100% 100%",
                                transform: "rotate(-1.3deg)",
                              }}
                            />
                            <span className="relative">{c.name}</span>
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">{c.en}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {c.region}
                  </td>
                  <td className="px-4 py-3">
                    {isVisa(c.visa) ? (
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${VISA_BADGE[c.visa]}`}
                      >
                        {VISA_LABEL[c.visa]}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">{c.visa}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {c.stay}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap ${
                      cost.isFree
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {cost.text}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[260px]">
                    {c.notes}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  Tidak ada negara yang cocok dengan pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3 leading-relaxed">
        {filtered.length} negara ditampilkan · Data per Mei 2026, dikompilasi dari
        sumber resmi. Persyaratan visa dapat berubah sewaktu-waktu.
      </p>
    </section>
  );
}
