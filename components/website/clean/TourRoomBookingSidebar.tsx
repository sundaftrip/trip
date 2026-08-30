"use client";

import TourBookingCTA from "@/components/website/TourBookingCTA";
import { buildWhatsAppBookingHref } from "@/lib/tour-commerce";
import type { TourRoomPrice } from "@/lib/tour-room-pricing";
import { formatCurrency } from "@/lib/utils";
import type { BookingMode } from "./TourBookingSheet";
import TourRecommendedAddOnToggle from "./TourRecommendedAddOnToggle";
import { useTourRoomSelection } from "./TourRoomSelectionContext";
import TourVisaServiceToggle, { TourVisaGroupPrice } from "./TourVisaServiceToggle";
import styles from "./CleanSite.module.css";

type MandatoryAddOn = {
  name: string;
  price: number;
};

type TourRoomBookingSidebarProps = {
  roomPrices: TourRoomPrice[];
  mandatoryAddOns: MandatoryAddOn[];
  hasPrice: boolean;
  basePrice: number;
  startingTotal: number;
  promoPrice: number | null;
  originalPrice: number;
  priceLandTour: number | null;
  unavailable: boolean;
  isExpired: boolean;
  bookingWaHref: string;
  bookingSummary: string;
  bookingPhone: string;
  bookingMode: BookingMode;
  tourName: string;
  departureLabel: string | null;
};

export default function TourRoomBookingSidebar({
  roomPrices,
  mandatoryAddOns,
  hasPrice,
  basePrice,
  startingTotal,
  promoPrice,
  originalPrice,
  priceLandTour,
  unavailable,
  isExpired,
  bookingWaHref,
  bookingSummary,
  bookingPhone,
  bookingMode,
  tourName,
  departureLabel,
}: TourRoomBookingSidebarProps) {
  const {
    selectedRoom,
    setSelectedRoomCode,
    hasOptionalServices,
    hasVisaInformation,
    optionalServicesTotal,
    optionalServicesPreference,
    adults,
    childCount,
    visaOffers,
  } = useTourRoomSelection();
  const selectedHeadlinePrice = selectedRoom?.headlinePrice ?? basePrice;
  const selectedMandatoryTotalPrice = selectedRoom?.mandatoryTotalPrice ?? startingTotal;
  const selectedTotalPrice = selectedMandatoryTotalPrice + optionalServicesTotal;
  const selectedTotalLabel = hasPrice ? formatCurrency(selectedTotalPrice) : "Sesuai permintaan";
  const selectedHeadlineLabel = hasPrice ? formatCurrency(selectedHeadlinePrice) : "Sesuai permintaan";
  const selectedPriceCaption = visaOffers.length > 0 ? "Per orang, di luar bantuan visa" : hasOptionalServices ? "Total per orang" : "Total wajib";
  const selectedBookingWaHref = selectedRoom || hasOptionalServices
    ? buildWhatsAppBookingHref(bookingPhone, {
        tourName,
        departureDate: departureLabel,
        formattedPrice: selectedTotalLabel,
        priceCaption: selectedPriceCaption,
        roomPreference: selectedRoom?.label,
        travelerCount: adults,
        childCount,
        addOnPreference: optionalServicesPreference,
        intent: bookingMode === "flexible" ? "private" : "booking",
      })
    : bookingWaHref;
  const selectedBookingSummary = selectedRoom || hasOptionalServices
    ? (selectedRoom ? `Kamar: ${selectedRoom.label} · ` : "")
      + `Paket: ${selectedHeadlineLabel}`
      + mandatoryAddOns.map((item) => ` · ${item.name} (wajib): ${formatCurrency(item.price)}`).join("")
      + (optionalServicesPreference ? ` · ${optionalServicesPreference}` : "")
      + ` · ${selectedPriceCaption}: ${selectedTotalLabel}/orang`
    : bookingSummary;

  return (
    <>
      <p className={styles.detailBookingLabel}>Harga paket per orang</p>
      <p className={styles.detailBookingPrice}>
        {selectedHeadlineLabel} {hasPrice && <small>/orang</small>}
      </p>
      {promoPrice && roomPrices.length === 0 && (
        <p className={styles.detailOriginalPrice}>Harga normal <s>{formatCurrency(originalPrice)}</s></p>
      )}
      {priceLandTour && (
        <p className={styles.detailLandPrice}>Pilihan land tour mulai {formatCurrency(priceLandTour)}</p>
      )}

      {(mandatoryAddOns.length > 0 || hasOptionalServices || hasVisaInformation) && (
        <div className={styles.detailPriceBreakdown}>
          <div><span>Harga paket</span><strong>{selectedHeadlineLabel}</strong></div>
          {mandatoryAddOns.map((item) => (
            <div key={item.name}>
              <span>{item.name} <small>WAJIB</small></span>
              <strong>+{formatCurrency(item.price)}</strong>
            </div>
          ))}
          <TourRecommendedAddOnToggle compact />
          <TourVisaServiceToggle compact />
          <div className={styles.detailPriceTotal}>
            <span>{selectedPriceCaption}</span><strong>{selectedTotalLabel}</strong>
          </div>
          <TourVisaGroupPrice />
        </div>
      )}

      {roomPrices.length > 0 && (
        <div className={styles.detailSidebarRoomPrices}>
          <strong>Pilihan isi kamar</strong>
          {roomPrices.map((room) => (
            <button
              key={room.code}
              type="button"
              data-selected={room.code === selectedRoom?.code}
              aria-pressed={room.code === selectedRoom?.code}
              onClick={() => setSelectedRoomCode(room.code)}
            >
              <span>{room.label}</span>
              <span>
                <b>{hasPrice ? formatCurrency(room.headlinePrice) : "Sesuai permintaan"}</b>
                <small>
                  {selectedPriceCaption}{" "}
                  {hasPrice ? formatCurrency(room.mandatoryTotalPrice + optionalServicesTotal) : "Dikonfirmasi tim"}
                </small>
              </span>
            </button>
          ))}
        </div>
      )}

      {unavailable ? (
        <div className={styles.detailUnavailableCta}>
          {isExpired ? "Trip ini sudah selesai" : "Kapasitas saat ini penuh"}
        </div>
      ) : (
        <TourBookingCTA
          waHref={selectedBookingWaHref}
          destination={tourName}
          summary={selectedBookingSummary}
          buttonClassName={styles.detailBookingPrimary}
        />
      )}
    </>
  );
}
