"use client";

import { useState, useCallback, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ToursSection from "./ToursSection";
import { REGIONS, regionOf, type RegionKey } from "./TourFilter";

const PER_PAGE = 12;

/* Type harus identik dengan yang dipakai ToursSection */
interface Tour {
  id: string; title: string; country: string; cityHighlight: string | null;
  price: number; promoPrice: number | null; seatsLeft: number;
  tripDate: Date | null; duration: string | null; heroImg: string | null;
  badge: string | null; status: string; pinned?: boolean | null;
}

/* Wrapper client component: state filter + paginasi dilakukan di browser.
   Server hanya kirim seluruh tour, HTML jadi static & edge-cacheable. */
export default function ToursCatalog({
  tours,
  theme,
  showFilter = false,
  showAllLink = false,
  split = false,
}: {
  tours: Tour[];
  theme: string;
  showFilter?: boolean;
  /* Tampilkan CTA "Lihat semua tour" di dalam section (homepage saja). */
  showAllLink?: boolean;
  /* Pisahkan jadi dua section berlabel: "Bisa Dipesan" vs "Dokumentasi
     Perjalanan" (halaman /tours saja). Homepage tetap satu grid. */
  split?: boolean;
}) {
  const [region, setRegion] = useState<RegionKey>("all");
  const [page, setPage] = useState(1);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setNow(Date.now()), 0);
    return () => window.clearTimeout(id);
  }, []);

  const filtered = region === "all"
    ? tours
    : tours.filter((t) => regionOf(t.country) === region);

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

  /* ── Mode split (P2.1): bookable di atas, dokumentasi di bawah ── */
  if (split) {
    const isDone = (t: Tour) =>
      t.status === "FULL" || (!!now && !!t.tripDate && new Date(t.tripDate).getTime() < now);
    const bookable = filtered.filter((t) => !isDone(t));
    const done = filtered.filter(isDone);

    // Paginasi hanya bagian dokumentasi (daftar panjang). Bookable tampil semua.
    const totalPages = Math.max(1, Math.ceil(done.length / PER_PAGE));
    const current = Math.min(totalPages, Math.max(1, page));
    const pagedDone = done.slice((current - 1) * PER_PAGE, current * PER_PAGE);

    return (
      <>
        {showFilter && <FilterChips active={region} onChange={changeRegion} theme={theme} />}

        {bookable.length > 0 && <ToursSection tours={bookable} theme={theme} />}

        {done.length > 0 && (
          <>
            <SectionHead
              big
              highlight
              theme={theme}
              eyebrow="Dokumentasi Perjalanan"
              sub={`${done.length} trip selesai disimpan sebagai bukti operasional, bukan daftar utama untuk dibeli.`}
            />
            <ToursSection tours={pagedDone} theme={theme}>
              <PaginationBar current={current} total={totalPages} onChange={changePage} />
            </ToursSection>
          </>
        )}
      </>
    );
  }

  /* ── Mode default (homepage): satu grid, paginasi seluruh hasil ── */
  const pinnedTours = showAllLink ? filtered.filter((t) => t.pinned) : [];
  const regularTours = showAllLink ? filtered.filter((t) => !t.pinned) : filtered;
  const totalPages = Math.max(1, Math.ceil(regularTours.length / PER_PAGE));
  const current = Math.min(totalPages, Math.max(1, page));
  const paged = regularTours.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <ToursSection tours={paged} pinnedTours={pinnedTours} theme={theme}>
      {showFilter && <FilterChips active={region} onChange={changeRegion} theme={theme} />}
      <PaginationBar current={current} total={totalPages} onChange={changePage} />
      {showAllLink && (
        <div className="flex justify-center pt-5 pb-6">
          <Link
            href="/tours"
            prefetch
            className="tours-cta group inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold tracking-wide"
            style={{ color: "var(--site-accent,#2d6a4f)" }}
          >
            <span>Lihat semua jadwal &amp; dokumentasi</span>
            <ArrowRight size={16} aria-hidden="true" className="tours-cta-arrow" />
          </Link>
        </div>
      )}
    </ToursSection>
  );
}

/* Heading section katalog (P2.1). Gaya theme-neutral (gray + site-accent),
   selaras dengan <header> halaman /tours di semua tema. */
/* Background grid sesuai tema aktif → konten duduk di atas grid, bukan papan polos. */
function gridBg(theme?: string): { className: string; style: CSSProperties } {
  if (theme === "atlas") return { className: "at-grid-bg", style: { backgroundColor: "var(--at-bg)" } };
  if (theme === "map") return { className: "", style: { background: "var(--mp-bg)", backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" } };
  if (theme === "pixel") return { className: "", style: { background: "var(--px-bg)", backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)", backgroundSize: "24px 24px" } };
  if (theme === "globe") return { className: "", style: { background: "var(--gl-bg)" } };
  if (theme === "kawaii") return { className: "", style: { background: "var(--kw-bg)" } };
  if (theme === "tropical") return { className: "", style: { background: "var(--tr-bg)" } };
  if (theme === "fumayo") return { className: "fb-page", style: {} };
  return { className: "", style: {} };
}

function SectionHead({ eyebrow, sub, big = false, highlight = false, theme }: { eyebrow: string; sub?: string | null; big?: boolean; highlight?: boolean; theme?: string }) {
  const gb = gridBg(theme);
  return (
    <div className={gb.className} style={gb.style}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
        {big ? (
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight uppercase leading-none text-gray-900 dark:text-white">
            {highlight ? <span className="stabilo">{eyebrow}</span> : eyebrow}
          </h2>
        ) : (
          <div className="mb-1.5">
            <span className="stabilo text-sm font-bold uppercase tracking-widest">{eyebrow}</span>
          </div>
        )}
        {sub && <p className={`text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed ${big ? "mt-4" : ""}`}>{sub}</p>}
      </div>
    </div>
  );
}

/* Filter chips, versi client (button, bukan Link). */
function FilterChips({
  active,
  onChange,
  theme,
}: {
  active: RegionKey;
  onChange: (r: RegionKey) => void;
  theme?: string;
}) {
  const gb = gridBg(theme);
  return (
    <div className={gb.className} style={gb.style}>
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-5 sm:pt-6 sm:pb-6"
      style={{ fontFamily: "var(--font-anonymous-pro), ui-monospace, monospace" }}
    >
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] sm:justify-center">
        <span className="sticky left-0 z-10 shrink-0 bg-inherit pr-1 text-[9px] tracking-[0.22em] uppercase opacity-60 sm:static sm:mr-2">
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
              className={`inline-flex h-11 shrink-0 items-center rounded-sm border px-3.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all sm:px-4 ${
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
              className="group inline-flex h-11 w-11 items-center justify-center rounded-full transition-all"
            >
              <span
                aria-hidden="true"
                className={`h-1.5 rounded-full transition-all ${
                  isActive ? "w-8 bg-current opacity-90" : "w-1.5 bg-current opacity-25 group-hover:opacity-50"
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
