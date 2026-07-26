"use client";

import {
  type Dispatch,
  type FormEventHandler,
  type SetStateAction,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  DEFAULT_CATALOG_FILTERS,
  type CatalogAvailability,
  type CatalogDuration,
  type CatalogFilterState,
  type CatalogPrice,
  type CatalogSort,
  type CatalogTripType,
} from "@/lib/tour-filters";
import styles from "./ToursCatalog.module.css";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type FilterOption<T extends string> = {
  value: T;
  label: string;
};

function monthLabel(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${value}-02T00:00:00+07:00`));
}

function RadioGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: Array<FilterOption<T>>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className={styles.filterGroup}>
      <legend>{legend}</legend>
      <div className={styles.radioGrid}>
        {options.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function CleanTourFilterSheet({
  draft,
  draftCount,
  destinations,
  months,
  categoryOptions,
  durationOptions,
  priceOptions,
  availabilityOptions,
  sortOptions,
  onDraftChange,
  onClose,
  onSubmit,
}: {
  draft: CatalogFilterState;
  draftCount: number;
  destinations: Array<FilterOption<string>>;
  months: string[];
  categoryOptions: Array<FilterOption<CatalogTripType>>;
  durationOptions: Array<FilterOption<CatalogDuration>>;
  priceOptions: Array<FilterOption<CatalogPrice>>;
  availabilityOptions: Array<FilterOption<CatalogAvailability>>;
  sortOptions: Array<FilterOption<CatalogSort>>;
  onDraftChange: Dispatch<SetStateAction<CatalogFilterState>>;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const layer = dialog?.parentElement;
    const backgroundTargets = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement
        && element !== layer
        && element.tagName !== "SCRIPT"
        && element.tagName !== "STYLE",
    );
    const backgroundState = backgroundTargets.map((target) => ({
      target,
      inert: target.inert,
      ariaHidden: target.getAttribute("aria-hidden"),
    }));

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    backgroundTargets.forEach((target) => {
      target.inert = true;
      target.setAttribute("aria-hidden", "true");
    });
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) =>
          !element.hasAttribute("disabled")
          && element.getClientRects().length > 0
          && window.getComputedStyle(element).visibility !== "hidden",
      );
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!dialog.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      backgroundState.forEach(({ target, inert, ariaHidden }) => {
        target.inert = inert;
        if (ariaHidden === null) target.removeAttribute("aria-hidden");
        else target.setAttribute("aria-hidden", ariaHidden);
      });
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, [onClose]);

  return createPortal(
    <div
      className={styles.sheetLayer}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-filter-title"
        tabIndex={-1}
      >
        <div className={styles.sheetHandle} aria-hidden="true" />
        <header className={styles.sheetHeader}>
          <div>
            <p>SESUAIKAN PENCARIAN</p>
            <h2 id="tour-filter-title">Filter perjalanan</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose}>
            <span className="sr-only">Tutup filter</span>
            <X aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={onSubmit}>
          <div className={styles.sheetBody}>
            <label className={styles.selectGroup}>
              <span>Destinasi / wilayah</span>
              <select
                name="destination"
                value={draft.destination}
                onChange={(event) =>
                  onDraftChange((current) => ({
                    ...current,
                    destination: event.target.value,
                  }))
                }
              >
                <option value="all">Semua destinasi</option>
                {destinations.map((destination) => (
                  <option key={destination.value} value={destination.value}>
                    {destination.label}
                  </option>
                ))}
              </select>
            </label>

            <RadioGroup
              legend="Jenis perjalanan"
              name="type"
              options={categoryOptions}
              value={draft.type}
              onChange={(type) => onDraftChange((current) => ({ ...current, type }))}
            />

            <label className={styles.selectGroup}>
              <span>Bulan keberangkatan</span>
              <select
                name="month"
                value={draft.month}
                onChange={(event) =>
                  onDraftChange((current) => ({ ...current, month: event.target.value }))
                }
              >
                <option value="all">Semua bulan</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {monthLabel(month)}
                  </option>
                ))}
              </select>
            </label>

            <RadioGroup
              legend="Durasi"
              name="duration"
              options={durationOptions}
              value={draft.duration}
              onChange={(duration) => onDraftChange((current) => ({ ...current, duration }))}
            />
            <RadioGroup
              legend="Kisaran harga"
              name="price"
              options={priceOptions}
              value={draft.price}
              onChange={(price) => onDraftChange((current) => ({ ...current, price }))}
            />
            <RadioGroup
              legend="Ketersediaan"
              name="availability"
              options={availabilityOptions}
              value={draft.availability}
              onChange={(availability) =>
                onDraftChange((current) => ({ ...current, availability }))
              }
            />
            <RadioGroup
              legend="Urutkan"
              name="sort"
              options={sortOptions}
              value={draft.sort}
              onChange={(sort) => onDraftChange((current) => ({ ...current, sort }))}
            />
          </div>

          <footer className={styles.sheetFooter}>
            <button type="button" onClick={() => onDraftChange(DEFAULT_CATALOG_FILTERS)}>
              Reset
            </button>
            <button type="submit">Tampilkan {draftCount} perjalanan</button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
