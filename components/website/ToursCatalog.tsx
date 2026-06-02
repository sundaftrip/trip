"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ToursSection from "./ToursSection";
import { REGIONS, regionOf, type RegionKey } from "./TourFilter";

const PER_PAGE = 12;

/* Type harus identik dengan yang dipakai ToursSection */
interface Tour {
  id: string; title: string; country: string; cityHighlight: string | null;
  price: number; promoPrice: number | null; seatsLeft: number;
  tripDate: Date | null; duration: string | null; heroImg: string | null;
  badge: string | null; status: string;
}

/* Wrapper client component: state filter + paginasi dilakukan di browser.
   Server hanya kirim seluruh tour, HTML jadi static & edge-cacheable. */
export default function ToursCatalog({
  tours,
  theme,
  showFilter = false,
}: {
  tours: Tour[];
  theme: string;
  showFilter?: boolean;
}) {
  const [region, setRegion] = useState<RegionKey>("all");
  const [page, setPage] = useState(1);

  const filtered = region === "all"
    ? tours
    : tours.filter((t) => regionOf(t.country) === region);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(totalPages, Math.max(1, page));
  const paged = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const changeRegion = useCallback((r: RegionKey) => {
    setRegion(r);
    setPage(1);
  }, []);

  const changePage = useCallback((p: number) => {
    setPage(p);
    if (typeof window !== "undefined") {
      const el = document.getElementById("tours");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <ToursSection tours={paged} theme={theme}>
      {showFilter && <FilterChips active={region} onChange={changeRegion} />}
      <PaginationBar current={current} total={totalPages} onChange={changePage} />
    </ToursSection>
  );
}

/* Filter chips, versi client (button, bukan Link). */
function FilterChips({
  active,
  onChange,
}: {
  active: RegionKey;
  onChange: (r: RegionKey) => void;
}) {
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6"
      style={{ fontFamily: "var(--font-anonymous-pro), ui-monospace, monospace" }}
    >
      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
        <span className="text-[9px] tracking-[0.22em] uppercase opacity-50 mr-1 sm:mr-2">
          Filter
        </span>
        {REGIONS.map((r) => {
          const isActive = r.key === active;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => onChange(r.key)}
              aria-current={isActive ? "true" : undefined}
              aria-label={`Filter region ${r.label}`}
              className={`px-3 sm:px-4 h-8 inline-flex items-center text-[11px] tracking-[0.14em] uppercase font-bold transition-all rounded-sm border ${
                isActive
                  ? "border-current opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80 hover:border-current"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Pagination, versi client (button, bukan Link).
   Tetap aesthetic boarding-pass flight info bar. */
function PaginationBar({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) {
  if (total <= 1) return null;
  const prev = Math.max(1, current - 1);
  const next = Math.min(total, current + 1);
  const atFirst = current <= 1;
  const atLast = current >= total;
  const pad = (n: number) => String(n).padStart(2, "0");

  const btnBase =
    "group inline-flex items-center gap-2 px-4 sm:px-5 h-11 border rounded-md transition-all border-gray-300 dark:border-gray-600";
  const btnInactive =
    "hover:bg-gray-900 hover:text-white hover:border-gray-900 dark:hover:bg-white dark:hover:text-gray-900";
  const btnDisabled = "opacity-30 cursor-not-allowed";

  return (
    <nav
      aria-label="Navigasi halaman tour"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => !atFirst && onChange(prev)}
          disabled={atFirst}
          aria-label="Halaman sebelumnya"
          className={`${btnBase} ${atFirst ? btnDisabled : btnInactive}`}
        >
          <ArrowLeft size={15} aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5" />
          <span
            className="text-[11px] font-bold tracking-[0.18em] uppercase hidden sm:inline"
            style={{ fontFamily: "var(--font-anonymous-pro), ui-monospace, monospace" }}
          >
            Prev
          </span>
        </button>

        <div
          className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 h-11 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent"
          style={{ fontFamily: "var(--font-anonymous-pro), ui-monospace, monospace" }}
        >
          <span className="text-[9px] tracking-[0.2em] uppercase opacity-60 hidden sm:inline">
            Page
          </span>
          <span className="text-[15px] sm:text-[17px] font-bold tracking-wider tabular-nums">
            {pad(current)}
          </span>
          <span className="opacity-40">/</span>
          <span className="text-[15px] sm:text-[17px] font-bold tracking-wider tabular-nums opacity-60">
            {pad(total)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => !atLast && onChange(next)}
          disabled={atLast}
          aria-label="Halaman selanjutnya"
          className={`${btnBase} ${atLast ? btnDisabled : btnInactive}`}
        >
          <span
            className="text-[11px] font-bold tracking-[0.18em] uppercase hidden sm:inline"
            style={{ fontFamily: "var(--font-anonymous-pro), ui-monospace, monospace" }}
          >
            Next
          </span>
          <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Dots row */}
      <div className="hidden md:flex items-center justify-center gap-1.5 mt-4">
        {Array.from({ length: total }).map((_, i) => {
          const p = i + 1;
          const isActive = p === current;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-label={`Halaman ${p}`}
              aria-current={isActive ? "page" : undefined}
              className={`h-1.5 rounded-full transition-all ${
                isActive ? "w-8 bg-current opacity-90" : "w-1.5 bg-current opacity-25 hover:opacity-50"
              }`}
            />
          );
        })}
      </div>
    </nav>
  );
}
