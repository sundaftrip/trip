import Link from "next/link";

/* Navigasi halaman katalog tour. Link tetap di beranda dengan
   anchor #tours supaya halaman gulir ke bagian tour. */
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

  const btn = "inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-sm font-semibold transition";
  return (
    <nav aria-label="Navigasi halaman tour"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center gap-3 text-sm">
      <Link href={`/?page=${prev}#tours`} aria-disabled={atFirst}
        className={`${btn} ${atFirst ? "opacity-40 pointer-events-none" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
        ← Sebelumnya
      </Link>
      <span className="font-bold text-gray-700 dark:text-gray-300 px-3">
        {currentPage} / {totalPages}
      </span>
      <Link href={`/?page=${next}#tours`} aria-disabled={atLast}
        className={`${btn} ${atLast ? "opacity-40 pointer-events-none" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
        Selanjutnya →
      </Link>
    </nav>
  );
}
