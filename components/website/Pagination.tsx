import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

/* Navigasi halaman katalog tour, aesthetic boarding pass / flight info bar.
   Monospace + bordered pills supaya konsisten dengan theme Globe. */
export default function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const prev = Math.max(1, currentPage - 1);
  const next = Math.min(totalPages, currentPage + 1);
  const atFirst = currentPage <= 1;
  const atLast = currentPage >= totalPages;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <nav aria-label="Navigasi halaman tour"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <Link
          href={`/?page=${prev}#tours`}
          aria-disabled={atFirst}
          aria-label="Halaman sebelumnya"
          className={`group inline-flex items-center gap-2 px-4 sm:px-5 h-11 border rounded-md transition-all border-gray-300 dark:border-gray-600 ${atFirst ? "opacity-30 pointer-events-none" : "hover:bg-gray-900 hover:text-white hover:border-gray-900 dark:hover:bg-white dark:hover:text-gray-900"}`}
        >
          <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase hidden sm:inline" style={{ fontFamily: "var(--font-anonymous-pro), ui-monospace, monospace" }}>
            Prev
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 h-11 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent" style={{ fontFamily: "var(--font-anonymous-pro), ui-monospace, monospace" }}>
          <span className="text-[9px] tracking-[0.2em] uppercase opacity-60 hidden sm:inline">
            Page
          </span>
          <span className="text-[15px] sm:text-[17px] font-bold tracking-wider tabular-nums">
            {pad(currentPage)}
          </span>
          <span className="opacity-40">/</span>
          <span className="text-[15px] sm:text-[17px] font-bold tracking-wider tabular-nums opacity-60">
            {pad(totalPages)}
          </span>
        </div>

        <Link
          href={`/?page=${next}#tours`}
          aria-disabled={atLast}
          aria-label="Halaman selanjutnya"
          className={`group inline-flex items-center gap-2 px-4 sm:px-5 h-11 border rounded-md transition-all border-gray-300 dark:border-gray-600 ${atLast ? "opacity-30 pointer-events-none" : "hover:bg-gray-900 hover:text-white hover:border-gray-900 dark:hover:bg-white dark:hover:text-gray-900"}`}
        >
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase hidden sm:inline" style={{ fontFamily: "var(--font-anonymous-pro), ui-monospace, monospace" }}>
            Next
          </span>
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="hidden md:flex items-center justify-center gap-1.5 mt-4">
        {Array.from({ length: totalPages }).map((_, i) => {
          const p = i + 1;
          const active = p === currentPage;
          return (
            <Link
              key={p}
              href={`/?page=${p}#tours`}
              aria-label={`Halaman ${p}`}
              aria-current={active ? "page" : undefined}
              className={`h-1.5 rounded-full transition-all ${active ? "w-8 bg-current opacity-90" : "w-1.5 bg-current opacity-25 hover:opacity-50"}`}
            />
          );
        })}
      </div>
    </nav>
  );
}
