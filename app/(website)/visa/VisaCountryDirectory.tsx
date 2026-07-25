"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { trackSundafEvent } from "@/lib/analytics-events";
import { FlagIcon } from "@/lib/flag-icon";
import { visaSlug } from "@/lib/visa-slug";
import type { VisaCountry } from "./VisaDatabase";
import styles from "./VisaPages.module.css";

type VisaKey = "bebas" | "voa" | "evisa" | "wajib" | "conditional";

const VISA_LABEL: Record<VisaKey, string> = {
  bebas: "Bebas Visa",
  voa: "Visa on Arrival",
  evisa: "E-Visa",
  wajib: "Visa Wajib",
  conditional: "Bersyarat",
};

const INITIAL_RESULT_COUNT = 18;

function isVisaKey(value: string): value is VisaKey {
  return value === "bebas"
    || value === "voa"
    || value === "evisa"
    || value === "wajib"
    || value === "conditional";
}

function feeLabel(country: VisaCountry) {
  return country.servicePrice?.trim()
    || country.officialFee?.trim()
    || country.cost?.trim()
    || "Cek detail";
}

function formatVerified(value: VisaCountry["lastVerifiedAt"]) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function VisaCountryDirectory({ entries }: { entries: VisaCountry[] }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [visaType, setVisaType] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_RESULT_COUNT);

  const regions = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.region))).sort((a, b) => a.localeCompare(b, "id")),
    [entries],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");

    return entries.filter((entry) => {
      const matchesQuery = normalizedQuery.length === 0
        || `${entry.name} ${entry.en} ${entry.region}`
          .toLocaleLowerCase("id-ID")
          .includes(normalizedQuery);
      const matchesRegion = !region || entry.region === region;
      const matchesVisa = !visaType || entry.visa === visaType;
      return matchesQuery && matchesRegion && matchesVisa;
    });
  }, [entries, query, region, visaType]);

  const visibleEntries = filtered.slice(0, visibleCount);
  const hasFilters = Boolean(query.trim() || region || visaType);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const meaningfulQuery = query.trim();
    if (meaningfulQuery.length >= 2) {
      trackSundafEvent("visa_country_search", { query: meaningfulQuery });
    }
    setVisibleCount(INITIAL_RESULT_COUNT);
  }

  function resetFilters() {
    setQuery("");
    setRegion("");
    setVisaType("");
    setVisibleCount(INITIAL_RESULT_COUNT);
  }

  return (
    <>
      <div className={styles.directoryToolbar}>
        <form className={styles.searchForm} onSubmit={submitSearch} role="search">
          <div>
            <label className={styles.fieldLabel} htmlFor="visa-country-query">
              Cari negara
            </label>
            <div className={styles.searchRow}>
              <div className={styles.searchInputWrap}>
                <Search size={18} aria-hidden="true" />
                <input
                  id="visa-country-query"
                  className={styles.searchInput}
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setVisibleCount(INITIAL_RESULT_COUNT);
                  }}
                  placeholder="Contoh: Rusia, Jepang, atau Eropa"
                  autoComplete="off"
                />
              </div>
              <button className={styles.searchButton} type="submit">
                Cari negara
              </button>
            </div>
          </div>

          <div className={styles.filterGrid}>
            <div className={styles.filterField}>
              <label className={styles.fieldLabel} htmlFor="visa-region">
                Wilayah
              </label>
              <select
                id="visa-region"
                value={region}
                onChange={(event) => {
                  setRegion(event.target.value);
                  setVisibleCount(INITIAL_RESULT_COUNT);
                }}
              >
                <option value="">Semua wilayah</option>
                {regions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterField}>
              <label className={styles.fieldLabel} htmlFor="visa-type">
                Jenis visa
              </label>
              <select
                id="visa-type"
                value={visaType}
                onChange={(event) => {
                  setVisaType(event.target.value);
                  setVisibleCount(INITIAL_RESULT_COUNT);
                }}
              >
                <option value="">Semua jenis</option>
                {Object.entries(VISA_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      <div className={styles.directoryMeta}>
        <p className={styles.resultCount} aria-live="polite" aria-atomic="true">
          {filtered.length} negara ditemukan
        </p>
        {hasFilters && (
          <button className={styles.resetButton} type="button" onClick={resetFilters}>
            Reset filter
          </button>
        )}
      </div>

      {visibleEntries.length > 0 ? (
        <>
          <div className={styles.resultGrid}>
            {visibleEntries.map((country) => {
              const verified = formatVerified(country.lastVerifiedAt);
              const visaLabel = isVisaKey(country.visa) ? VISA_LABEL[country.visa] : country.visa;

              return (
                <Link
                  key={country.id}
                  className={styles.countryCard}
                  href={`/visa/${visaSlug(country.en)}`}
                  aria-label={`Lihat informasi visa ${country.name}`}
                >
                  <div className={styles.countryHeader}>
                    <div className={styles.countryIdentity}>
                      <span className={styles.flag}>
                        <FlagIcon
                          flag={country.flag}
                          rounded
                          label={`Bendera ${country.name}`}
                          width={34}
                        />
                      </span>
                      <div>
                        <h3 className={styles.countryName}>{country.name}</h3>
                        <p className={styles.countryEnglish}>{country.en}</p>
                      </div>
                    </div>
                    <span className={styles.statusBadge}>{visaLabel}</span>
                  </div>

                  <dl className={styles.countryFacts}>
                    <div>
                      <dt>Maks. tinggal</dt>
                      <dd>{country.stay}</dd>
                    </div>
                    <div>
                      <dt>Biaya tercatat</dt>
                      <dd>{feeLabel(country)}</dd>
                    </div>
                  </dl>

                  <p className={styles.verified}>
                    {verified ? `Terakhir diverifikasi ${verified}` : "Buka detail untuk persyaratan lengkap"}
                  </p>
                  <span className={styles.cardAction}>
                    Lihat detail <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>

          {visibleEntries.length < filtered.length && (
            <div className={styles.directoryAction}>
              <button
                className={styles.loadMore}
                type="button"
                onClick={() => setVisibleCount((count) => count + INITIAL_RESULT_COUNT)}
              >
                Tampilkan lebih banyak
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          Tidak ada negara yang cocok. Coba ejaan lain atau reset filternya.
        </div>
      )}
    </>
  );
}
