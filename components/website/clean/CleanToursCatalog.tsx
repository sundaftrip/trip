"use client";

import {
  type FormEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, SlidersHorizontal, X } from "lucide-react";
import { trackSundafEvent } from "@/lib/analytics-events";
import { campaignParamsFromSearch } from "@/lib/campaign-attribution";
import {
  DEFAULT_CATALOG_FILTERS,
  filterCatalogTours,
  getCatalogDestination,
  getCatalogTripType,
  getUpcomingDepartureMonths,
  parseCatalogFilters,
  serializeCatalogFilters,
  type CatalogAvailability,
  type CatalogDuration,
  type CatalogFilterState,
  type CatalogPrice,
  type CatalogSort,
  type CatalogTripType,
} from "@/lib/tour-filters";
import CleanTourCard, { type CleanTour } from "./CleanTourCard";
import base from "./CleanSite.module.css";
import styles from "./ToursCatalog.module.css";

const PAGE_SIZE = 12;
const CleanTourFilterSheet = dynamic(() => import("./CleanTourFilterSheet"), {
  ssr: false,
});

const categoryTabs: Array<{ value: CatalogTripType; label: string }> = [
  { value: "open", label: "Open trip" },
  { value: "private", label: "Land tour privat" },
  { value: "archive", label: "Trip terdahulu" },
];

const durationOptions: Array<{ value: CatalogDuration; label: string }> = [
  { value: "all", label: "Semua durasi" },
  { value: "short", label: "Hingga 6 hari" },
  { value: "medium", label: "7–10 hari" },
  { value: "long", label: "11 hari atau lebih" },
];

const priceOptions: Array<{ value: CatalogPrice; label: string }> = [
  { value: "all", label: "Semua harga" },
  { value: "under-10", label: "Di bawah Rp10 juta" },
  { value: "10-20", label: "Rp10–20 juta" },
  { value: "20-plus", label: "Di atas Rp20 juta" },
];

const availabilityOptions: Array<{ value: CatalogAvailability; label: string }> = [
  { value: "all", label: "Semua status" },
  { value: "available", label: "Tersedia" },
  { value: "last_seats", label: "Kursi terakhir" },
  { value: "confirmed", label: "Pasti berangkat" },
  { value: "sold_out", label: "Penuh / daftar tunggu" },
  { value: "waitlist", label: "Daftar tunggu" },
];

const sortOptions: Array<{ value: CatalogSort; label: string }> = [
  { value: "relevant", label: "Paling relevan" },
  { value: "departure", label: "Keberangkatan terdekat" },
  { value: "price", label: "Harga terendah" },
  { value: "newest", label: "Terbaru" },
];

const destinationLabels: Record<string, string> = {
  rusia: "Rusia & Aurora",
  "asia-tengah": "Asia Tengah",
  vietnam: "Vietnam",
  jepang: "Jepang",
  lainnya: "Destinasi lainnya",
};

function queryHref(pathname: string, state: CatalogFilterState, campaignQuery = "") {
  const params = new URLSearchParams(serializeCatalogFilters(state));
  new URLSearchParams(campaignQuery).forEach((value, key) => params.set(key, value));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function monthLabel(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${value}-02T00:00:00+07:00`));
}

export default function CleanToursCatalog({
  tours,
  generatedAt,
  initialSearch,
  consultationHref,
}: {
  tours: CleanTour[];
  generatedAt: string;
  initialSearch: string;
  consultationHref: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const filters = useMemo(
    () => parseCatalogFilters(new URLSearchParams(initialSearch)),
    [initialSearch],
  );
  const campaignQuery = useMemo(
    () => campaignParamsFromSearch(initialSearch).toString(),
    [initialSearch],
  );
  const now = useMemo(() => new Date(generatedAt), [generatedAt]);
  const filterKey = serializeCatalogFilters(filters);
  const [pagination, setPagination] = useState({ key: filterKey, count: PAGE_SIZE });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<CatalogFilterState>(filters);

  const destinations = useMemo(() => {
    const values = Array.from(new Set(tours.map(getCatalogDestination)));
    return values
      .map((value) => ({
        value,
        label:
          destinationLabels[value] ||
          tours.find((tour) => getCatalogDestination(tour) === value)?.country ||
          value,
      }))
      .sort((a, b) => {
        const preferred = ["rusia", "asia-tengah", "vietnam", "jepang"];
        const aIndex = preferred.indexOf(a.value);
        const bIndex = preferred.indexOf(b.value);
        if (aIndex !== -1 || bIndex !== -1) {
          return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
        }
        return a.label.localeCompare(b.label, "id");
      });
  }, [tours]);

  const months = useMemo(
    () => getUpcomingDepartureMonths(tours, now),
    [now, tours],
  );

  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        categoryTabs.map(({ value }) => [
          value,
          tours.filter((tour) => getCatalogTripType(tour, now) === value).length,
        ]),
      ) as Record<CatalogTripType, number>,
    [now, tours],
  );

  const results = useMemo(
    () => filterCatalogTours(tours, filters, now),
    [filters, now, tours],
  );
  const draftCount = useMemo(
    () => filterCatalogTours(tours, draft, now).length,
    [draft, now, tours],
  );
  const visibleCount = pagination.key === filterKey ? pagination.count : PAGE_SIZE;
  const displayedTours = results.slice(0, visibleCount);

  const activeFilters = useMemo(() => {
    const chips: Array<{ key: keyof CatalogFilterState; label: string }> = [];
    if (filters.destination !== "all") {
      chips.push({
        key: "destination",
        label:
          destinations.find((destination) => destination.value === filters.destination)?.label ||
          filters.destination,
      });
    }
    if (filters.month !== "all") chips.push({ key: "month", label: monthLabel(filters.month) });
    if (filters.duration !== "all") {
      chips.push({
        key: "duration",
        label: durationOptions.find((option) => option.value === filters.duration)!.label,
      });
    }
    if (filters.price !== "all") {
      chips.push({
        key: "price",
        label: priceOptions.find((option) => option.value === filters.price)!.label,
      });
    }
    if (filters.availability !== "all") {
      chips.push({
        key: "availability",
        label: availabilityOptions.find((option) => option.value === filters.availability)!.label,
      });
    }
    if (filters.sort !== "relevant") {
      chips.push({
        key: "sort",
        label: sortOptions.find((option) => option.value === filters.sort)!.label,
      });
    }
    return chips;
  }, [destinations, filters]);

  function navigate(next: CatalogFilterState) {
    router.push(queryHref(pathname, next, campaignQuery), { scroll: false });
  }

  function openSheet() {
    setDraft(filters);
    setSheetOpen(true);
    trackSundafEvent("tour_filter_open", { trip_type: filters.type });
  }

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = parseCatalogFilters({
      type: String(form.get("type") || ""),
      destination: String(form.get("destination") || ""),
      month: String(form.get("month") || ""),
      duration: String(form.get("duration") || ""),
      price: String(form.get("price") || ""),
      availability: String(form.get("availability") || ""),
      sort: String(form.get("sort") || ""),
    });
    const nextHref = queryHref(pathname, next, campaignQuery);
    trackSundafEvent("tour_filter_apply", {
      trip_type: next.type,
      destination: next.destination,
      result_count: draftCount,
    });
    window.location.assign(nextHref);
  }

  function removeFilter(key: keyof CatalogFilterState) {
    navigate({ ...filters, [key]: DEFAULT_CATALOG_FILTERS[key] });
  }

  return (
    <div className={`${base.catalogPage} ${styles.page}`} id="main-content">
      <section className={styles.hero} aria-labelledby="catalog-page-title">
        <div className={styles.shell}>
          <div className={styles.heroLayout}>
            <div>
              <h1 id="catalog-page-title">Pilih cara perjalananmu.</h1>
            </div>
            <nav className={styles.trustCounts} aria-label="Pilih jenis perjalanan">
              {categoryTabs.map((tab) => (
                <Link
                  key={tab.value}
                  href={queryHref(pathname, { ...filters, type: tab.value }, campaignQuery)}
                  aria-current={filters.type === tab.value ? "page" : undefined}
                  scroll={false}
                >
                  <span>{tab.label}</span>
                  <strong>{categoryCounts[tab.value]}</strong>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <section className={styles.resultsSection} aria-labelledby="catalog-results-title">
        <div className={styles.shell}>
          <div className={styles.resultsToolbar}>
            <div aria-live="polite" aria-atomic="true">
              <strong>{results.length}</strong> perjalanan ditemukan
            </div>
            <button
              type="button"
              onClick={openSheet}
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
            >
              <SlidersHorizontal aria-hidden="true" />
              Filter
              {activeFilters.length ? <span>{activeFilters.length}</span> : null}
            </button>
          </div>

          {activeFilters.length ? (
            <div className={styles.activeFilters} role="group" aria-label="Filter aktif">
              {activeFilters.map((filter) => (
                <button
                  type="button"
                  key={filter.key}
                  onClick={() => removeFilter(filter.key)}
                  aria-label={`Hapus filter ${filter.label}`}
                >
                  {filter.label}
                  <X aria-hidden="true" />
                </button>
              ))}
              <button
                className={styles.clearFilters}
                type="button"
                onClick={() => navigate({ ...DEFAULT_CATALOG_FILTERS, type: filters.type })}
              >
                Hapus semua
              </button>
            </div>
          ) : null}

          <div className={styles.headingRow}>
            <div>
              <h2 id="catalog-results-title">
                {filters.type === "open"
                  ? "Open trip yang dapat dipilih"
                  : filters.type === "private"
                    ? "Land tour privat"
                  : "Trip yang telah selesai"}
              </h2>
            </div>
          </div>

          {displayedTours.length ? (
            <>
              <div className={styles.grid}>
                {displayedTours.map((tour) => (
                  <CleanTourCard
                    key={tour.id}
                    tour={tour}
                    compact
                    campaignQuery={campaignQuery}
                  />
                ))}
              </div>
              {visibleCount < results.length ? (
                <div className={styles.loadMore}>
                  <button
                    type="button"
                    onClick={() =>
                      setPagination({ key: filterKey, count: visibleCount + PAGE_SIZE })
                    }
                  >
                    Muat lebih banyak
                  </button>
                  <span>
                    Menampilkan {displayedTours.length} dari {results.length}
                  </span>
                </div>
              ) : null}
            </>
          ) : (
            <div className={styles.empty}>
              <h3>Belum ada perjalanan yang cocok.</h3>
              <p>
                Ubah filter, lihat kategori lain, atau kirim tanggal dan tujuanmu untuk
                dirancang sebagai private trip.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => navigate({ ...DEFAULT_CATALOG_FILTERS, type: filters.type })}
                >
                  Reset filter
                </button>
                <Link href="/custom-trip">Rancang private trip</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.faqSection} aria-labelledby="catalog-faq-title">
        <div className={`${styles.shell} ${styles.faqLayout}`}>
          <div>
            <p className={styles.eyebrow}>SEBELUM MEMILIH</p>
            <h2 id="catalog-faq-title">Pertanyaan tentang jadwal</h2>
          </div>
          <div className={styles.faqs}>
            <details>
              <summary>Bagaimana jika tanggal open trip belum cocok?</summary>
              <p>
                Pilih land tour privat untuk membicarakan tanggal, jumlah peserta, dan rute
                yang lebih fleksibel.
              </p>
            </details>
            <details>
              <summary>Apakah status kursi dapat berubah?</summary>
              <p>
                Ya. Ketersediaan dikonfirmasi kembali oleh tim sebelum pembayaran dan kursi
                dinyatakan terpesan.
              </p>
            </details>
            <details>
              <summary>Mengapa trip terdahulu tetap ditampilkan?</summary>
              <p>
                Halaman tersebut menjadi dokumentasi rute dan perjalanan yang telah
                dijalankan, bukan penawaran keberangkatan aktif.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className={styles.consultation}>
        <div className={`${styles.shell} ${styles.consultationRow}`}>
          <div>
            <h2>Belum menemukan jadwal yang cocok?</h2>
            <p>Kirim tujuan dan waktumu. Tim Sundaf membantu menyaring pilihan yang relevan.</p>
          </div>
          <a
            href={consultationHref}
            data-analytics-placement="catalog-final"
            aria-label="Konsultasi jadwal melalui WhatsApp"
          >
            <MessageCircle aria-hidden="true" />
            Konsultasi via WhatsApp
          </a>
        </div>
      </section>

      {sheetOpen ? (
        <CleanTourFilterSheet
          draft={draft}
          draftCount={draftCount}
          destinations={destinations}
          months={months}
          categoryOptions={categoryTabs}
          durationOptions={durationOptions}
          priceOptions={priceOptions}
          availabilityOptions={availabilityOptions}
          sortOptions={sortOptions}
          onDraftChange={setDraft}
          onClose={closeSheet}
          onSubmit={applyFilters}
        />
      ) : null}
    </div>
  );
}
