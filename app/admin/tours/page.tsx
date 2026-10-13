import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Copy, ExternalLink, Pencil, Plus, Search, Upload, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";
import TourPinButton from "@/components/admin/TourPinButton";
import { MAX_PINNED_TOURS } from "@/lib/tour-order";
import { can, requireAdminModule } from "@/lib/admin-access";
import { adminTourIssues, adminTourVisibility, TOUR_STATUS_LABELS } from "@/lib/admin-tour-checks";
import { parseTourHotelRoomPricing } from "@/lib/tour-room-pricing";
import { canonicalTourPath } from "@/lib/seo-routes";

type ToursSearchParams = {
  q?: string | string[];
  country?: string | string[];
  status?: string | string[];
  tampil?: string | string[];
  sort?: string | string[];
  dir?: string | string[];
};

type SortKey = "title" | "country" | "price" | "seats" | "status" | "date";
type SortDir = "asc" | "desc";

const SORT_KEYS = ["title", "country", "price", "seats", "status", "date"] as const;
const STATUS_FILTERS = ["ACTIVE", "DRAFT", "FULL", "CANCELLED", "SELESAI"] as const;
const STATUS_FILTER_LABELS: Record<string, string> = { ...TOUR_STATUS_LABELS, SELESAI: "Sudah berangkat" };

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

function parseVisibility(value?: string | string[]) {
  const visibility = firstParam(value);
  return visibility === "ya" || visibility === "tidak" ? visibility : "";
}

function dateMs(value?: Date | string | null) {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function normalize(value?: string | null) {
  return (value ?? "").toLowerCase();
}

function statusRank(status: string) {
  if (status === "ACTIVE") return 1;
  if (status === "DRAFT") return 2;
  if (status === "FULL") return 3;
  if (status === "CANCELLED") return 4;
  if (status === "SELESAI") return 5;
  return 6;
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  FULL: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  CANCELLED: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300",
  SELESAI: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  DRAFT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const VISIBILITY_TEXT: Record<string, string> = {
  live: "text-green-700 dark:text-green-400",
  sold: "text-red-600 dark:text-red-300",
  past: "text-gray-500 dark:text-gray-400",
  hidden: "text-gray-400",
};

function sortLabel(sortKey: SortKey | null, sortDir: SortDir) {
  if (!sortKey) return "keberangkatan terdekat";
  if (sortKey === "title") return sortDir === "asc" ? "judul A-Z" : "judul Z-A";
  if (sortKey === "country") return sortDir === "asc" ? "negara A-Z" : "negara Z-A";
  if (sortKey === "price") return sortDir === "asc" ? "harga termurah" : "harga termahal";
  if (sortKey === "seats") return sortDir === "asc" ? "kursi paling sedikit" : "kursi paling banyak";
  if (sortKey === "status") return sortDir === "asc" ? "status aktif dulu" : "status selesai dulu";
  return sortDir === "asc" ? "tanggal tertua" : "tanggal terbaru";
}

export default async function ToursPage({ searchParams }: { searchParams: Promise<ToursSearchParams> }) {
  const viewer = await requireAdminModule("tours");
  const canCreate = can(viewer, "tour_create");
  const canEdit = can(viewer, "tour_edit");
  const canDelete = can(viewer, "tour_delete");
  const sp = await searchParams;
  const allTours = await prisma.tour.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, slug: true, country: true, cityHighlight: true, badge: true, duration: true,
      price: true, promoPrice: true, seatsLeft: true, status: true, pinned: true, tripDate: true,
      heroImg: true, description: true, itinerary: true, hotel: true, createdAt: true,
    },
  });

  const nowDate = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nowMs = today.getTime();

  const query = firstParam(sp.q).trim();
  const queryLower = query.toLowerCase();
  const countryFilter = firstParam(sp.country).trim();
  const statusFilter = parseStatus(sp.status);
  const visibilityFilter = parseVisibility(sp.tampil);
  const sortKey = parseSort(sp.sort);
  const sortDir = parseDir(sp.dir);

  type Row = (typeof allTours)[number];

  const countries = [...new Set(allTours.map((tour) => tour.country).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "id-ID"));

  const displayStatus = (tour: Row) =>
    tour.tripDate && new Date(tour.tripDate).getTime() < nowMs && tour.status !== "CANCELLED"
      ? "SELESAI"
      : tour.status;
  const displayDate = (tour: Row) => (tour.tripDate ? formatDate(tour.tripDate) : "Tanggal fleksibel");
  const displaySeats = (tour: Row) => (!tour.tripDate ? "Private" : String(tour.seatsLeft));
  const displayPrice = (tour: Row) => parseTourHotelRoomPricing(tour.hotel).roomPrices[0]?.headlinePrice ?? tour.promoPrice ?? tour.price;

  function defaultCompare(a: Row, b: Row) {
    const at = dateMs(a.tripDate);
    const bt = dateMs(b.tripDate);
    const aUpcoming = at !== null && at >= nowMs;
    const bUpcoming = bt !== null && bt >= nowMs;
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    if (aUpcoming && bUpcoming) return (at ?? 0) - (bt ?? 0);

    const aPast = at !== null && at < nowMs;
    const bPast = bt !== null && bt < nowMs;
    if (aPast !== bPast) return aPast ? 1 : -1;
    if (aPast && bPast) return (bt ?? 0) - (at ?? 0);

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }

  function compareByDate(a: Row, b: Row) {
    if (sortDir === "asc") {
      const at = dateMs(a.tripDate) ?? Number.POSITIVE_INFINITY;
      const bt = dateMs(b.tripDate) ?? Number.POSITIVE_INFINITY;
      return at - bt;
    }

    const at = dateMs(a.tripDate) ?? Number.NEGATIVE_INFINITY;
    const bt = dateMs(b.tripDate) ?? Number.NEGATIVE_INFINITY;
    return bt - at;
  }

  function compareForSort(a: Row, b: Row) {
    if (!sortKey) return defaultCompare(a, b);

    const direction = sortDir === "asc" ? 1 : -1;
    const base =
      sortKey === "title" ? a.title.localeCompare(b.title, "id-ID") :
      sortKey === "country" ? a.country.localeCompare(b.country, "id-ID") :
      sortKey === "price" ? displayPrice(a) - displayPrice(b) :
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
      if (visibilityFilter) {
        const visible = adminTourVisibility(tour, nowDate).visible;
        if (visibilityFilter === "ya" && !visible) return false;
        if (visibilityFilter === "tidak" && visible) return false;
      }
      if (!queryLower) return true;

      const haystack = [
        tour.title,
        tour.country,
        tour.cityHighlight,
        tour.badge,
        tour.duration,
        STATUS_FILTER_LABELS[status] ?? status,
      ].map((value) => normalize(value)).join(" ");

      return haystack.includes(queryLower);
    })
    .sort(compareForSort);
  const pinnedCount = allTours.filter((t) => t.pinned).length;
  const hasFilter = Boolean(query || countryFilter || statusFilter || visibilityFilter || sortKey);

  function hrefWith(updates: Partial<Record<"q" | "country" | "status" | "tampil" | "sort" | "dir", string>>) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (countryFilter) params.set("country", countryFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (visibilityFilter) params.set("tampil", visibilityFilter);
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

  const currentListHref = hrefWith({});
  const editHref = (id: string) => `/admin/tours/${id}?returnTo=${encodeURIComponent(currentListHref)}`;

  function sortIcon(column: SortKey) {
    if (sortKey !== column) return <ArrowUpDown size={14} className="text-gray-400" />;
    return sortDir === "asc"
      ? <ArrowUp size={14} className="text-blue-600" />
      : <ArrowDown size={14} className="text-blue-600" />;
  }

  function renderSortHeader(column: SortKey, label: string) {
    return (
      <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">
        <Link href={sortHref(column)} className="inline-flex items-center gap-1.5 hover:text-blue-600">
          {label}
          {sortIcon(column)}
        </Link>
      </th>
    );
  }

  function rowActions(tour: Row) {
    const visibility = adminTourVisibility(tour, nowDate);
    return (
      <div className="flex items-center justify-end gap-1.5">
        <Link href={editHref(tour.id)} title="Edit tour" aria-label={`Edit ${tour.title}`}
          className="rounded p-1.5 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20">
          <Pencil size={15} />
        </Link>
        {visibility.visible && (
          <a href={canonicalTourPath(tour)} target="_blank" rel="noopener noreferrer" title="Lihat di website" aria-label={`Lihat ${tour.title} di website`}
            className="rounded p-1.5 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20">
            <ExternalLink size={15} />
          </a>
        )}
        {canCreate && (
          <Link href={`/admin/tours/new?from=${tour.id}`} title="Duplikat jadi draft baru" aria-label={`Duplikat ${tour.title}`}
            className="rounded p-1.5 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20">
            <Copy size={15} />
          </Link>
        )}
        {canEdit && (
          <TourPinButton
            key={`${tour.id}-${tour.pinned ? "pinned" : "unpinned"}`}
            id={tour.id}
            pinned={tour.pinned}
            disabled={!tour.pinned && pinnedCount >= MAX_PINNED_TOURS}
          />
        )}
        {canDelete && <DeleteButton id={tour.id} endpoint="/api/tours" label="tour" />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tour</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tours.length} dari {allTours.length} tour · {pinnedCount}/{MAX_PINNED_TOURS} dipin · urut: {sortLabel(sortKey, sortDir)}
          </p>
        </div>
        {canCreate && (
          <div className="flex items-center gap-2">
            <Link
              href="/admin/tours/import"
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Upload size={16} /> Import
            </Link>
            <Link
              href="/admin/tours/new"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Plus size={16} /> Tambah Tour
            </Link>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <form action="/admin/tours" className="border-b border-gray-200 bg-gray-50/80 px-4 py-4 dark:border-gray-700 dark:bg-gray-800">
          <input type="hidden" name="sort" value={sortKey ?? ""} />
          <input type="hidden" name="dir" value={sortKey ? sortDir : ""} />
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-[minmax(220px,1fr)_160px_160px_170px_auto]">
            <label className="relative col-span-2 block lg:col-span-1">
              <span className="sr-only">Cari tour</span>
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Cari judul, negara, badge..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </label>

            <select name="country" defaultValue={countryFilter} aria-label="Negara"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white">
              <option value="">Semua negara</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select name="status" defaultValue={statusFilter} aria-label="Status"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white">
              <option value="">Semua status</option>
              {STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>{STATUS_FILTER_LABELS[status]}</option>
              ))}
            </select>

            <select name="tampil" defaultValue={visibilityFilter} aria-label="Tampil di website"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white">
              <option value="">Tampil & tidak</option>
              <option value="ya">Tampil di website</option>
              <option value="tidak">Tidak tampil</option>
            </select>

            <div className="flex items-center gap-2">
              <button type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                Filter
              </button>
              {hasFilter && (
                <Link href="/admin/tours"
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  <X size={15} /> Reset
                </Link>
              )}
            </div>
          </div>
        </form>

        {tours.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-400">
            {hasFilter ? (
              <>Tidak ada tour yang cocok. <Link href="/admin/tours" className="text-blue-600">Reset filter</Link></>
            ) : canCreate ? (
              <>Belum ada tour. <Link href="/admin/tours/new" className="text-blue-600">Tambah sekarang</Link></>
            ) : (
              <>Belum ada tour.</>
            )}
          </p>
        )}

        {/* Phone: cards */}
        <ul className="divide-y divide-gray-100 dark:divide-gray-700 md:hidden">
          {tours.map((tour) => {
            const status = displayStatus(tour);
            const visibility = adminTourVisibility(tour, nowDate);
            const issues = visibility.visible && visibility.tone !== "past" ? adminTourIssues(tour) : [];
            return (
              <li key={tour.id} className="space-y-2 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <Link href={editHref(tour.id)} className="min-w-0 font-medium text-gray-900 dark:text-white">
                    {tour.title}
                  </Link>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[status] ?? STATUS_BADGE.DRAFT}`}>
                    {STATUS_FILTER_LABELS[status] ?? status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {tour.country} · {displayDate(tour)} · kursi {displaySeats(tour)} · {formatCurrency(displayPrice(tour))}
                </p>
                <p className={`text-xs font-medium ${VISIBILITY_TEXT[visibility.tone]}`}>{visibility.label}</p>
                {issues.length > 0 && <p className="text-xs text-amber-700 dark:text-amber-400">{issues.join(" · ")}</p>}
                {rowActions(tour)}
              </li>
            );
          })}
        </ul>

        {/* Tablet & desktop: table */}
        {tours.length > 0 && (
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  {renderSortHeader("title", "Judul")}
                  {renderSortHeader("country", "Negara")}
                  {renderSortHeader("price", "Harga tampil")}
                  {renderSortHeader("seats", "Kursi")}
                  {renderSortHeader("status", "Status")}
                  {renderSortHeader("date", "Berangkat")}
                  <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((tour) => {
                  const status = displayStatus(tour);
                  const visibility = adminTourVisibility(tour, nowDate);
                  const issues = visibility.visible && visibility.tone !== "past" ? adminTourIssues(tour) : [];
                  return (
                    <tr key={tour.id} className="border-b border-gray-100 align-top transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40">
                      <td className="max-w-[320px] px-4 py-3">
                        <Link href={editHref(tour.id)} className="font-medium text-gray-900 hover:text-blue-600 dark:text-white">
                          {tour.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          {tour.pinned && <span className="rounded bg-teal-50 px-1.5 py-0.5 text-xs text-teal-700 dark:bg-teal-900/20 dark:text-teal-300">PIN</span>}
                          {tour.badge && <span className="rounded bg-orange-50 px-1.5 py-0.5 text-xs text-orange-600 dark:bg-orange-900/20">{tour.badge}</span>}
                          <span className={`text-xs ${VISIBILITY_TEXT[visibility.tone]}`}>{visibility.label}</span>
                        </div>
                        {issues.length > 0 && <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{issues.join(" · ")}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{tour.country}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatCurrency(displayPrice(tour))}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{displaySeats(tour)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE[status] ?? STATUS_BADGE.DRAFT}`}>
                          {STATUS_FILTER_LABELS[status] ?? status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{displayDate(tour)}</td>
                      <td className="px-4 py-3">{rowActions(tour)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
