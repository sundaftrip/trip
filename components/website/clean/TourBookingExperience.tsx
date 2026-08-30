"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import { trackSundafEvent } from "@/lib/analytics-events";
import { readCampaignAttribution } from "@/lib/campaign-attribution";
import { buildWhatsAppBookingHref } from "@/lib/tour-commerce";
import { formatCurrency } from "@/lib/utils";
import { useTourRoomSelection } from "./TourRoomSelectionContext";
import type {
  BookingDeparture,
  BookingMode,
  BookingRoomOption,
  TourBookingSheetProps,
} from "./TourBookingSheet";
import styles from "./TourDetailInteractive.module.css";

const TourBookingSheet = dynamic<TourBookingSheetProps>(
  () => import("./TourBookingSheet"),
  { ssr: false },
);

type TourBookingExperienceProps = {
  phone: string;
  tourId: string;
  tourName: string;
  priceLabel: string;
  priceCaption: string;
  availabilityLabel: string;
  mode: BookingMode;
  departures: BookingDeparture[];
  roomOptions?: BookingRoomOption[];
  selectedRoomValue?: string;
  onRoomChange?: (value: string) => void;
  addOnPreference?: string;
  completedTourHref?: string;
  showSectionAction?: boolean;
};

const DEFAULT_ROOM_OPTIONS: BookingRoomOption[] = [
  { value: "Twin sharing", label: "Twin sharing" },
  { value: "Double bed", label: "Double bed" },
  { value: "Single room", label: "Single room" },
  { value: "Butuh teman sekamar", label: "Butuh teman sekamar" },
  { value: "Diskusikan dengan tim", label: "Diskusikan dengan tim" },
];

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export default function TourBookingExperience({
  phone,
  tourId,
  tourName,
  priceLabel,
  priceCaption,
  availabilityLabel,
  mode,
  departures,
  roomOptions = DEFAULT_ROOM_OPTIONS,
  selectedRoomValue,
  onRoomChange,
  addOnPreference = "",
  completedTourHref = "#itinerary",
  showSectionAction = true,
}: TourBookingExperienceProps) {
  const bookingRoomOptions = roomOptions.length > 0 ? roomOptions : DEFAULT_ROOM_OPTIONS;
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(departures[0]?.id || "");
  const { adults, childCount: children, setAdults, setChildCount: setChildren, visaOfferTotal } = useTourRoomSelection();
  const [internalRoom, setInternalRoom] = useState(bookingRoomOptions[0].value);
  const room = selectedRoomValue ?? internalRoom;
  const setRoom = onRoomChange ?? setInternalRoom;
  const [name, setName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [sourceUrl, setSourceUrl] = useState("https://sundaftrip.com");
  const [campaign, setCampaign] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [validationAttempt, setValidationAttempt] = useState(0);
  const [opener, setOpener] = useState<HTMLElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const selectedDeparture = departures.find((departure) => departure.id === selectedId) || departures[0];
  const selectedRoom = bookingRoomOptions.find((option) => option.value === room) || bookingRoomOptions[0];
  const selectedRoomLabel = selectedRoom.label;
  const selectedPriceLabel = selectedRoom.priceLabel
    || selectedDeparture?.priceLabel
    || priceLabel;
  const selectedPriceCaption = selectedRoom.priceCaption || priceCaption;
  const intent = mode === "sold_out" ? "waitlist" : mode === "flexible" ? "private" : "booking";

  const whatsappHref = useMemo(() => buildWhatsAppBookingHref(phone, {
    tourName,
    departureDate: selectedDeparture?.label || (mode === "flexible" ? "Fleksibel" : null),
    formattedPrice: selectedPriceLabel,
    priceCaption: selectedPriceCaption,
    travelerCount: adults,
    childCount: children,
    roomPreference: selectedRoomLabel,
    addOnPreference,
    customerName: name,
    customerPhone,
    sourceUrl,
    campaign,
    intent,
  }), [
    adults,
    campaign,
    children,
    customerPhone,
    intent,
    mode,
    name,
    phone,
    selectedDeparture,
    selectedPriceCaption,
    selectedPriceLabel,
    selectedRoomLabel,
    sourceUrl,
    tourName,
    addOnPreference,
  ]);

  const closeSheet = useCallback(() => {
    setOpen(false);
  }, []);

  function showSheet(opener: HTMLElement) {
    setOpener(opener);
    setSourceUrl(window.location.href);
    setCampaign(readCampaignAttribution());
    setOpen(true);
    trackSundafEvent("booking_sheet_open", { tour_id: tourId, mode });
  }

  function validate() {
    const nextErrors: { name?: string; phone?: string } = {};
    if (name.trim().length < 2) nextErrors.name = "Masukkan nama agar tim Sundaf bisa menyapa kamu.";
    if (digitsOnly(customerPhone).length < 9) nextErrors.phone = "Masukkan nomor WhatsApp yang aktif.";
    setErrors(nextErrors);
    const firstInvalidControl = nextErrors.name
      ? nameInputRef.current
      : nextErrors.phone
        ? phoneInputRef.current
        : null;
    if (firstInvalidControl) {
      setValidationAttempt((attempt) => attempt + 1);
      window.requestAnimationFrame(() => firstInvalidControl.focus());
      return false;
    }
    return true;
  }

  function logInquiry() {
    if (!validate()) return false;

    trackSundafEvent("whatsapp_booking_click", {
      tour_id: tourId,
      departure_id: selectedDeparture?.id,
      intent,
    });

    void fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        name: name.trim(),
        whatsapp: customerPhone.trim(),
        destination: tourName,
        travelDate: selectedDeparture?.label || "Fleksibel",
        message: `Booking inquiry: ${adults} dewasa, ${children} anak, ${selectedRoomLabel}, ${addOnPreference ? `${addOnPreference}, ` : ""}${selectedPriceCaption} ${selectedPriceLabel}/orang`,
        source: sourceUrl,
      }),
    }).catch(() => undefined);
    return true;
  }

  if (mode === "completed") {
    return (
      <>
        {showSectionAction && (
          <a className={styles.sectionBookingAction} href={completedTourHref}>
            Lihat itinerary perjalanan
          </a>
        )}
        <div className={styles.mobileBookingBar} role="region" aria-label="Itinerary perjalanan selesai">
          <div><span>Trip selesai</span><strong>Itinerary perjalanan</strong></div>
          <a href={completedTourHref}>Lihat itinerary</a>
        </div>
      </>
    );
  }

  const triggerLabel =
    mode === "sold_out"
      ? "Gabung daftar tunggu"
      : mode === "flexible"
        ? "Rancang tanggal"
        : selectedId
          ? "Cek ketersediaan"
          : "Lihat jadwal";

  return (
    <>
      {showSectionAction && (
        <button
          className={styles.sectionBookingAction}
          type="button"
          onClick={(event) => showSheet(event.currentTarget)}
        >
          {triggerLabel}
        </button>
      )}
      <div className={styles.mobileBookingBar} role="region" aria-label="Pemesanan cepat">
        <div>
          <span>{mode === "sold_out" ? "Kapasitas" : selectedPriceCaption}</span>
          <strong>{mode === "sold_out" ? availabilityLabel : selectedPriceLabel}</strong>
          {visaOfferTotal > 0 && <small>Visa grup: +{formatCurrency(visaOfferTotal)}</small>}
        </div>
        <button type="button" onClick={(event) => showSheet(event.currentTarget)}>
          {triggerLabel}
        </button>
      </div>

      {open && (
        <TourBookingSheet
          adults={adults}
          childCount={children}
          customerPhone={customerPhone}
          departures={departures}
          errors={errors}
          mode={mode}
          name={name}
          nameInputRef={nameInputRef}
          onAdultsChange={setAdults}
          onChildrenChange={setChildren}
          onClose={closeSheet}
          onCustomerPhoneChange={setCustomerPhone}
          onDepartureChange={(departureId) => {
            setSelectedId(departureId);
            trackSundafEvent("departure_select", {
              tour_id: tourId,
              departure_id: departureId,
            });
          }}
          onNameChange={setName}
          onRoomChange={setRoom}
          onSubmit={logInquiry}
          opener={opener}
          phoneInputRef={phoneInputRef}
          priceLabel={priceLabel}
          priceCaption={priceCaption}
          room={room}
          roomOptions={bookingRoomOptions}
          addOnPreference={addOnPreference}
          selectedDeparture={selectedDeparture}
          selectedId={selectedId}
          tourId={tourId}
          tourName={tourName}
          validationAttempt={validationAttempt}
          whatsappHref={whatsappHref}
          onClearNameError={() => {
            setErrors((current) => {
              if (!current.name) return current;
              const next = { ...current };
              delete next.name;
              return next;
            });
          }}
          onClearPhoneError={() => {
            setErrors((current) => {
              if (!current.phone) return current;
              const next = { ...current };
              delete next.phone;
              return next;
            });
          }}
        />
      )}
    </>
  );
}
