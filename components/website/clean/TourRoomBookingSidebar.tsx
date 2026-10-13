"use client";

import TourBookingCTA from "@/components/website/TourBookingCTA";
import { buildWhatsAppBookingHref } from "@/lib/tour-commerce";
import { tourSubtotalLabel } from "@/lib/tour-cost-disclosure";
import type { TourRoomPrice } from "@/lib/tour-room-pricing";
import { formatCurrency } from "@/lib/utils";
import type { BookingMode } from "./TourBookingSheet";
import { useTourRoomSelection } from "./TourRoomSelectionContext";
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
    optionalServicesTotal,
    optionalServicesPreference,
  } = useTourRoomSelection();
  const selectedHeadlinePrice = selectedRoom?.headlinePrice ?? basePrice;
  const selectedMandatoryTotalPrice = selectedRoom?.mandatoryTotalPrice ?? startingTotal;
  const selectedTotalPrice = selectedMandatoryTotalPrice + optionalServicesTotal;
  const selectedPriceCaption = tourSubtotalLabel(mandatoryAddOns.length > 0, optionalServicesTotal > 0);
  const selectedBookingWaHref = selectedRoom || hasOptionalServices
    ? buildWhatsAppBookingHref(bookingPhone, {
        tourName,
        departureDate: departureLabel,
        formattedPrice: formatCurrency(selectedTotalPrice),
        priceCaption: selectedPriceCaption,
        roomPreference: selectedRoom?.label,
        addOnPreference: optionalServicesPreference,
        intent: bookingMode === "flexible" ? "private" : "booking",
      })
    : bookingWaHref;
  const selectedBookingSummary = selectedRoom || hasOptionalServices
    ? (selectedRoom ? `Kamar: ${selectedRoom.label} · ` : "")
      + `Paket: ${formatCurrency(selectedHeadlinePrice)}`
      + mandatoryAddOns.map((item) => ` · ${item.name} (wajib): ${formatCurrency(item.price)}`).join("")
      + (optionalServicesPreference ? ` · ${optionalServicesPreference}` : "")
      + ` · ${selectedPriceCaption}: ${formatCurrency(selectedTotalPrice)}/orang`
    : bookingSummary;

  return (
    <>
      {/* The amount people actually pay leads; the package price sits in the breakdown. */}
      <p className={styles.detailBookingLabel}>{hasPrice ? selectedPriceCaption : "Harga paket"}</p>
      <p className={styles.detailBookingPrice}>
        {hasPrice ? formatCurrency(selectedTotalPrice) : "Sesuai permintaan"} {hasPrice && <small>/orang</small>}
      </p>
      {promoPrice && roomPrices.length === 0 && (
        <p className={styles.detailOriginalPrice}>Harga paket normal <s>{formatCurrency(originalPrice)}</s></p>
      )}
      {priceLandTour && (
        <p className={styles.detailLandPrice}>Pilihan land tour mulai {formatCurrency(priceLandTour)}</p>
      )}

      {(mandatoryAddOns.length > 0 || hasOptionalServices) && (
        <div className={styles.detailPriceBreakdown}>
          <div><span>Harga paket</span><strong>{formatCurrency(selectedHeadlinePrice)}</strong></div>
          {mandatoryAddOns.map((item) => (
            <div key={item.name}>
              <span>{item.name} <small>WAJIB</small></span>
              <strong>+{formatCurrency(item.price)}</strong>
            </div>
          ))}
          <div className={styles.detailPriceTotal}>
            <span>{selectedPriceCaption}</span><strong>{formatCurrency(selectedTotalPrice)}</strong>
          </div>
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
                <b>{formatCurrency(room.mandatoryTotalPrice + optionalServicesTotal)}</b>
                {room.mandatoryTotalPrice + optionalServicesTotal !== room.headlinePrice && (
                  <small>Harga paket {formatCurrency(room.headlinePrice)}</small>
                )}
              </span>
            </button>
          ))}
        </div>
      )}

      {unavailable ? (
        <div className={styles.detailUnavailableCta}>
          {bookingMode === "departed" ? "Keberangkatan ini sudah dimulai" : isExpired ? "Trip ini sudah selesai" : "Kapasitas saat ini penuh"}
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
