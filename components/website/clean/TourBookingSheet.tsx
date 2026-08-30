"use client";

import { useEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Check, ChevronDown, X } from "lucide-react";
import TourRecommendedAddOnToggle from "./TourRecommendedAddOnToggle";
import TourVisaServiceToggle, { TourVisaGroupPrice } from "./TourVisaServiceToggle";
import styles from "./TourDetailInteractive.module.css";

export type BookingDeparture = {
  id: string;
  label: string;
  priceLabel: string;
  priceValue?: number;
  status: "available" | "last_seats" | "confirmed" | "sold_out" | "waitlist";
  availabilityLabel: string;
};

export type BookingMode = "available" | "sold_out" | "completed" | "flexible";

export type BookingRoomOption = {
  value: string;
  label: string;
  priceLabel?: string;
  priceCaption?: string;
};

type BookingErrors = {
  name?: string;
  phone?: string;
};

export type TourBookingSheetProps = {
  adults: number;
  childCount: number;
  customerPhone: string;
  departures: BookingDeparture[];
  errors: BookingErrors;
  mode: BookingMode;
  name: string;
  nameInputRef: RefObject<HTMLInputElement | null>;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  onClearNameError: () => void;
  onClearPhoneError: () => void;
  onClose: () => void;
  onCustomerPhoneChange: (value: string) => void;
  onDepartureChange: (departureId: string) => void;
  onNameChange: (value: string) => void;
  onRoomChange: (value: string) => void;
  onSubmit: () => boolean;
  opener: HTMLElement | null;
  phoneInputRef: RefObject<HTMLInputElement | null>;
  priceLabel: string;
  priceCaption: string;
  addOnPreference?: string;
  room: string;
  roomOptions: BookingRoomOption[];
  selectedDeparture?: BookingDeparture;
  selectedId: string;
  tourId: string;
  tourName: string;
  validationAttempt: number;
  whatsappHref: string | null;
};

const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function TourBookingSheet({
  adults,
  childCount,
  customerPhone,
  departures,
  errors,
  mode,
  name,
  nameInputRef,
  onAdultsChange,
  onChildrenChange,
  onClearNameError,
  onClearPhoneError,
  onClose,
  onCustomerPhoneChange,
  onDepartureChange,
  onNameChange,
  onRoomChange,
  onSubmit,
  opener,
  phoneInputRef,
  priceLabel,
  priceCaption,
  addOnPreference,
  room,
  roomOptions,
  selectedDeparture,
  selectedId,
  tourId,
  tourName,
  validationAttempt,
  whatsappHref,
}: TourBookingSheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const selectedRoom = roomOptions.find((option) => option.value === room);
  const selectedPriceLabel = selectedRoom?.priceLabel
    || selectedDeparture?.priceLabel
    || priceLabel;
  const selectedPriceCaption = selectedRoom?.priceCaption || priceCaption;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const layer = dialogRef.current?.parentElement;
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
    backgroundTargets.forEach((target) => {
      target.inert = true;
      target.setAttribute("aria-hidden", "true");
    });
    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const controls = [...dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)]
        .filter((element) => !element.hasAttribute("disabled") && element.offsetParent !== null);
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      backgroundState.forEach(({ target, inert, ariaHidden }) => {
        target.inert = inert;
        if (ariaHidden === null) target.removeAttribute("aria-hidden");
        else target.setAttribute("aria-hidden", ariaHidden);
      });
      window.requestAnimationFrame(() => opener?.focus({ preventScroll: true }));
    };
  }, [onClose, opener]);

  return createPortal((
    <div
      className={styles.bookingBackdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.bookingSheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-sheet-title"
        aria-describedby="booking-sheet-description"
      >
        <div className={styles.sheetHandle} aria-hidden="true" />
        <header className={styles.bookingSheetHeader}>
          <div>
            <p>{mode === "sold_out" ? "DAFTAR TUNGGU" : mode === "flexible" ? "RANCANG PERJALANAN" : "CEK KETERSEDIAAN"}</p>
            <h2 id="booking-sheet-title">{tourName}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Tutup pilihan booking"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <div className={styles.bookingSheetBody}>
          <p id="booking-sheet-description" className={styles.bookingIntro}>
            Isi konteks singkat ini. Kursi baru dikonfirmasi setelah tim Sundaf membalas di WhatsApp.
          </p>

          {Object.keys(errors).length > 0 && (
            <div
              key={validationAttempt}
              className={styles.fieldError}
              role="alert"
              aria-atomic="true"
            >
              Periksa {Object.keys(errors).length} isian:{" "}
              {[errors.name && "nama", errors.phone && "nomor WhatsApp"]
                .filter(Boolean)
                .join(" dan ")}.
            </div>
          )}

          {departures.length > 0 && (
            <fieldset className={styles.departureOptions}>
              <legend>Pilih tanggal keberangkatan</legend>
              {departures.map((departure) => (
                <label key={departure.id} data-selected={selectedId === departure.id}>
                  <input
                    type="radio"
                    name="departure"
                    value={departure.id}
                    checked={selectedId === departure.id}
                    onChange={() => onDepartureChange(departure.id)}
                  />
                  <CalendarDays aria-hidden="true" />
                  <span>
                    <strong>{departure.label}</strong>
                    <small>
                      {departure.availabilityLabel} · {selectedPriceCaption}{" "}
                      {selectedRoom?.priceLabel || departure.priceLabel}/orang
                    </small>
                  </span>
                  <Check className={styles.optionCheck} aria-hidden="true" />
                </label>
              ))}
            </fieldset>
          )}

          <div className={styles.travelerGrid}>
            <label>
              <span>Dewasa</span>
              <select value={adults} onChange={(event) => onAdultsChange(Number(event.target.value))}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => <option key={value}>{value}</option>)}
              </select>
              <ChevronDown aria-hidden="true" />
            </label>
            <label>
              <span>Anak</span>
              <select value={childCount} onChange={(event) => onChildrenChange(Number(event.target.value))}>
                {[0, 1, 2, 3, 4].map((value) => <option key={value}>{value}</option>)}
              </select>
              <ChevronDown aria-hidden="true" />
            </label>
          </div>

          <label className={styles.bookingField}>
            <span>Preferensi kamar</span>
            <select value={room} onChange={(event) => onRoomChange(event.target.value)}>
              {roomOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <TourRecommendedAddOnToggle flat />
          <TourVisaServiceToggle flat />

          <label className={styles.bookingField}>
            <span>Nama</span>
            <input
              ref={nameInputRef}
              value={name}
              onChange={(event) => {
                onNameChange(event.target.value);
                onClearNameError();
              }}
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "booking-name-error" : undefined}
            />
            {errors.name && <small className={styles.fieldError} id="booking-name-error">{errors.name}</small>}
          </label>

          <label className={styles.bookingField}>
            <span>Nomor WhatsApp</span>
            <input
              ref={phoneInputRef}
              value={customerPhone}
              onChange={(event) => {
                onCustomerPhoneChange(event.target.value);
                onClearPhoneError();
              }}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="08xx xxxx xxxx"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "booking-phone-error" : undefined}
            />
            {errors.phone && <small className={styles.fieldError} id="booking-phone-error">{errors.phone}</small>}
          </label>

          <dl className={styles.bookingSummary} aria-live="polite" aria-atomic="true">
            <div><dt>Perjalanan</dt><dd>{tourName}</dd></div>
            <div><dt>Tanggal</dt><dd>{selectedDeparture?.label || "Fleksibel"}</dd></div>
            <div><dt>Peserta</dt><dd>{adults} dewasa{childCount ? `, ${childCount} anak` : ""}</dd></div>
            <div><dt>Isi kamar</dt><dd>{selectedRoom?.label || room}</dd></div>
            {addOnPreference && <div><dt>Add-on</dt><dd>{addOnPreference}</dd></div>}
            <div><dt>{selectedPriceCaption}</dt><dd>{selectedPriceLabel}/orang</dd></div>
          </dl>
          <TourVisaGroupPrice />
        </div>

        <footer className={styles.bookingSheetFooter}>
          <p>WhatsApp adalah permintaan ketersediaan, bukan konfirmasi kursi atau pembayaran.</p>
          <a
            href={whatsappHref || "#"}
            target="_blank"
            rel="noopener"
            data-analytics-validated="true"
            data-tour-id={tourId}
            data-departure-id={selectedDeparture?.id}
            onClick={(event) => {
              if (!whatsappHref || !onSubmit()) event.preventDefault();
            }}
          >
            Lanjut ke WhatsApp <span className={styles.newTabHint}>(membuka tab baru)</span>
          </a>
        </footer>
      </div>
    </div>
  ), document.body);
}
