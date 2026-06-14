import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Pencil, Search, Upload, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";
import TourPinButton from "@/components/admin/TourPinButton";
import { MAX_PINNED_TOURS } from "@/lib/tour-order";

type ToursSearchParams = {
  q?: string | string[];
  country?: string | string[];
  status?: string | string[];
  sort?: string | string[];
  dir?: string | string[];
};

type SortKey = "title" | "country" | "price" | "seats" | "status" | "date";
type SortDir = "asc" | "desc";

const SORT_KEYS = ["title", "country", "price", "seats", "status", "date"] as const;
const STATUS_FILTERS = ["ACTIVE", "DRAFT", "FULL", "CANCELLED", "SELESAI"] as const;

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parseSort(value?: string | string[]): SortKey | null {
  const sort = firstParam(value);
  return SORT_KEYS.includes(sort as SortKey) ? sort as SortKey : null;
}

function parseDir(value?: string | string[]): SortDir {
  return firstParam(value) === "desc" ? "desc" : "asc";
}

function parseStatus(value?: string | string[]) {
  const status = firstParam(value);
  return STATUS_FILTERS.includes(status as (typeof STATUS_FILTERS)[number]) ? status : "";
}

function dateMs(value?: Date | string | null) {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function normalize(value?: string | null) {
  return (value ?? "").toLowerCase();
}

function statusLabel(status: string) {
  return status === "ACTIVE" ? "BISA DIPESAN" : status;
}

function statusRank(status: string) {
  if (status === "ACTIVE") return 1;
  if (status === "DRAFT") return 2;
  if (status === "FULL") return 3;
  if (status === "CANCELLED") return 4;
  if (status === "SELESAI") return 5;
  return 6;
}

function sortLabel(sortKey: SortKey | null, sortDir: SortDir) {
  if (!sortKey) return "default operasional";
  if (sortKey === "title") return sortDir === "asc" ? "Judul A-Z" : "Judul Z-A";
  if (sortKey === "country") return sortDir === "asc" ? "Negara A-Z" : "Negara Z-A";
  if (sortKey === "price") return sortDir === "asc" ? "Harga termurah dulu" : "Harga termahal dulu";
  if (sortKey === "seats") return sortDir === "asc" ? "Seat paling sedikit dulu" : "Seat paling banyak dulu";
  if (sortKey === "status") return sortDir === "asc" ? "Status aktif dulu" : "Status selesai dulu";
  return sortDir === "asc" ? "Tanggal tertua dulu" : "Tanggal termuda dulu";
}

export default async function ToursPage({ searchParams }: { searchParams: Promise<ToursSearchParams> }) {
  const sp = await searchParams;
  const allTours = await prisma.tour.findMany({ orderBy: { createdAt: "desc" } });

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nowMs = now.getTime();

  const query = firstParam(sp.q).trim();
  const queryLower = query.toLowerCase();
  const countryFilter = firstParam(sp.country).trim();
  const statusFilter = parseStatus(sp.status);
  const sortKey = parseSort(sp.sort);
  const sortDir = parseDir(sp.dir);

  const countries = [...new Set(allTours.map((tour) => tour.country).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "id-ID"));

  const displayStatus = (tour: (typeof allTours)[number]) =>
    tour.tripDate && new Date(tour.tripDate).getTime() < nowMs && tour.status !== "CANCELLED"
      ? "SELESAI"
      : tour.status;

  const displayDate = (tour: (typeof allTours)[number]) =>
    tour.tripDate ? formatDate(tour.tripDate) : tour.status === "ACTIVE" ? "Tanggal fleksibel" : "-";
  const displaySeats = (tour: (typeof allTours)[number]) =>
    !tour.tripDate && tour.status === "ACTIVE"
      ? "Private / By Request"
      : tour.seatsLeft;
  const displayStatusLabel = statusLabel;

  function defaultCompare(a: (typeof allTours)[number], b: (typeof allTours)[number]) {
    const at = dateMs(a.tripDate);
    const bt = dateMs(b.tripDate);
    const aUpcoming = at !== null && at >= nowMs;
    const bUpcoming = bt !== null && bt >= nowMs;
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    if (aUpcoming && bUpcoming) return (at ?? 0) - (bt ?? 0);

    const aPast = at !== null && at < nowMs;
    const bPast = bt !== null && bt < nowMs;
    if (aPast !== bPast) return aPast ? -1 : 1;
    if (aPast && bPast) return (bt ?? 0) - (at ?? 0);

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }

  function compareByDate(a: (typeof allTours)[number], b: (typeof allTours)[number]) {
    if (sortDir === "asc") {
      const at = dateMs(a.tripDate) ?? Number.POSITIVE_INFINITY;
      const bt = dateMs(b.tripDate) ?? Number.POSITIVE_INFINITY;
      return at - bt;
    }

    const at = dateMs(a.tripDate) ?? Number.NEGATIVE_INFINITY;
    const bt = dateMs(b.tripDate) ?? Number.NEGATIVE_INFINITY;
    return bt - at;
  }

  function compareForSort(a: (typeof allTours)[number], b: (typeof allTours)[number]) {
    if (!sortKey) return defaultCompare(a, b);

    const direction = sortDir === "asc" ? 1 : -1;
    const priceA = a.promoPrice ?? a.price;
    const priceB = b.promoPrice ?? b.price;
    const base =
      sortKey === "title" ? a.title.localeCompare(b.title, "id-ID") :
      sortKey === "country" ? a.country.localeCompare(b.country, "id-ID") :
      sortKey === "price" ? priceA - priceB :
      sortKey === "seats" ? a.seatsLeft - b.seatsLeft :
      sortKey === "status" ? statusRank(displayStatus(a)) - statusRank(displayStatus(b)) :
      compareByDate(a, b);

    return base === 0 ? defaultCompare(a, b) : base * (sortKey === "date" ? 1 : direction);
  }

  const tours = allTours
    .filter((tour) => {
      const status = displayStatus(tour);
      if (countryFilter && tour.country !== countryFilter) return false;
      if (statusFilter && status !== statusFilter) return false;
      if (!queryLower) return true;

      const haystack = [
        tour.title,
        tour.country,
        tour.cityHighlight,
        tour.badge,
        tour.duration,
        displayStatusLabel(status),
      ].map((value) => normalize(value)).join(" ");

      return haystack.includes(queryLower);
    })
    .sort(compareForSort);
  const pinnedCount = allTours.filter((t) => t.pinned).length;
  const hasFilter = Boolean(query || countryFilter || statusFilter || sortKey);
  const activeSortLabel = sortLabel(sortKey, sortDir);

  function hrefWith(updates: Partial<Record<"q" | "country" | "status" | "sort" | "dir", string>>) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (countryFilter) params.set("country", countryFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (sortKey) params.set("sort", sortKey);
    if (sortKey) params.set("dir", sortDir);

    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    const qs = params.toString();
    return qs ? `/admin/tours?${qs}` : "/admin/tours";
  }

  function sortHref(key: SortKey) {
    const nextDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    return hrefWith({ sort: key, dir: nextDir });
  }

  function sortIcon(column: SortKey) {
    if (sortKey !== column) return <ArrowUpDown size={14} className="text-gray-400" />;
    return sortDir === "asc"
      ? <ArrowUp size={14} className="text-blue-600" />
      : <ArrowDown size={14} className="text-blue-600" />;
  }

  function renderSortHeader(column: SortKey, label: string, align: "left" | "right" = "left") {
    return (
      <th className={`${align === "right" ? "text-right" : "text-left"} px-4 py-3 font-medium text-gray-600 dark:text-gray-400`}>
        <Link
          href={sortHref(column)}
          className={`inline-flex items-center gap-1.5 hover:text-blue-600 ${align === "right" ? "justify-end" : ""}`}
        >
          {label}
          {sortIcon(column)}
        </Link>
      </th>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tour</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tours.length} dari {allTours.length} tour tampil · {pinnedCount}/5 tour dipin · Urutan: {activeSortLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/tours/import"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded-lg transition"
          >
            <Upload size={16} /> Import Massal
          </Link>
          <Link
            href="/admin/tours/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus size={16} /> Tambah Tour
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <form action="/admin/tours" className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-750 px-4 py-4">
          <input type="hidden" name="sort" value={sortKey ?? ""} />
          <input type="hidden" name="dir" value={sortKey ? sortDir : ""} />
          <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_180px_auto]">
            <label className="relative block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Cari judul, Vietnam, Rusia, badge..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />
            </label>

            <select
              name="country"
              defaultValue={countryFilter}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
            >
              <option value="">Semua negara</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              name="status"
              defaultValue={statusFilter}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
            >
              <option value="">Semua status</option>
              {STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>{displayStatusLabel(status)}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Filter
              </button>
              {hasFilter && (
                <Link
                  href="/admin/tours"
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-white dark:hover:bg-gray-700"
                >
                  <X size={15} /> Reset
                </Link>
              )}
            </div>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                {renderSortHeader("title", "Judul")}
                {renderSortHeader("country", "Negara")}
                {renderSortHeader("price", "Harga")}
                {renderSortHeader("seats", "Seat")}
                {renderSortHeader("status", "Status")}
                {renderSortHeader("date", "Tgl Keberangkatan")}
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tours.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    {hasFilter ? (
                      <>
                        Tidak ada tour yang cocok.{" "}
                        <Link href="/admin/tours" className="text-blue-600">Reset filter</Link>
                      </>
                    ) : (
                      <>
                        Belum ada tour.{" "}
                        <Link href="/admin/tours/new" className="text-blue-600">Tambah sekarang</Link>
                      </>
                    )}
                  </td>
                </tr>
              )}
              {tours.map((tour) => (
                <tr key={tour.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{tour.title}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {tour.pinned && <span className="text-xs text-teal-700 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-300 px-1.5 py-0.5 rounded">PIN</span>}
                      {tour.badge && <span className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">{tour.badge}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{tour.country}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                    {formatCurrency(tour.promoPrice ?? tour.price)}
                    {tour.promoPrice && (
                      <span className="text-xs text-gray-400 line-through ml-1">{formatCurrency(tour.price)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{displaySeats(tour)}</td>
                  <td className="px-4 py-3">
                    {(() => {
                      const status = displayStatus(tour);
                      return (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          status === "FULL" ? "bg-red-100 text-red-700" :
                          status === "CANCELLED" ? "bg-gray-100 text-gray-500" :
                          status === "SELESAI" ? "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300" :
                          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
                          {displayStatusLabel(status)}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {displayDate(tour)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/tours/${tour.id}`}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                      >
                        <Pencil size={15} />
                      </Link>
                      <TourPinButton
                        key={`${tour.id}-${tour.pinned ? "pinned" : "unpinned"}`}
                        id={tour.id}
                        pinned={tour.pinned}
                        disabled={!tour.pinned && pinnedCount >= MAX_PINNED_TOURS}
                      />
                      <DeleteButton id={tour.id} endpoint="/api/tours" label="tour" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
