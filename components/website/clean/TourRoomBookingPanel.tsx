"use client";

import type { TourRoomPrice } from "@/lib/tour-room-pricing";
import { applyOptionalServicesToDepartures } from "@/lib/tour-optional-pricing";
import { formatCurrency } from "@/lib/utils";
import type { BookingDeparture, BookingMode } from "./TourBookingSheet";
import TourBookingExperience from "./TourBookingExperience";
import TourRecommendedAddOnToggle from "./TourRecommendedAddOnToggle";
import { useTourRoomSelection } from "./TourRoomSelectionContext";
import TourVisaServiceToggle, { TourVisaGroupPrice } from "./TourVisaServiceToggle";
import styles from "./CleanSite.module.css";
import interactiveStyles from "./TourDetailInteractive.module.css";

type MandatoryAddOn = {
  name: string;
  price: number;
};

type TourRoomBookingPanelProps = {
  roomPrices: TourRoomPrice[];
  mandatoryAddOns: MandatoryAddOn[];
  paymentInitialAmountLabel?: string | null;
  status: string;
  departureLabel: string | null;
  unavailable: boolean;
  hasPrice: boolean;
  basePrice: number;
  startingTotal: number;
  bookingPhone: string;
  tourId: string;
  tourName: string;
  priceLabel: string;
  priceCaption: string;
  availabilityLabel: string;
  bookingMode: BookingMode;
  bookingDepartures: BookingDeparture[];
  completedTourHref: string;
};

export default function TourRoomBookingPanel({
  roomPrices,
  mandatoryAddOns,
  paymentInitialAmountLabel,
  status,
  departureLabel,
  unavailable,
  hasPrice,
  basePrice,
  startingTotal,
  bookingPhone,
  tourId,
  tourName,
  priceLabel,
  priceCaption,
  availabilityLabel,
  bookingMode,
  bookingDepartures,
  completedTourHref,
}: TourRoomBookingPanelProps) {
  const {
    selectedRoom,
    setSelectedRoomCode,
    hasOptionalServices,
    hasVisaInformation,
    optionalServicesTotal,
    optionalServicesPreference,
    visaOffers,
  } = useTourRoomSelection();
  const selectedHeadlinePrice = selectedRoom?.headlinePrice ?? basePrice;
  const selectedMandatoryTotalPrice = selectedRoom?.mandatoryTotalPrice ?? startingTotal;
  const selectedTotalPrice = selectedMandatoryTotalPrice + optionalServicesTotal;
  const selectedCaption = visaOffers.length > 0 ? "Per orang, di luar bantuan visa" : hasOptionalServices ? "Total per orang" : priceCaption;
  const selectedPriceLabel = hasPrice ? formatCurrency(selectedTotalPrice) : priceLabel;
  const roomOptions = roomPrices.map((room) => ({
    value: room.code,
    label: room.label,
    priceLabel: hasPrice ? formatCurrency(room.mandatoryTotalPrice + optionalServicesTotal) : priceLabel,
    priceCaption: selectedCaption,
  }));
  const pricedBookingDepartures = applyOptionalServicesToDepartures(
    bookingDepartures,
    optionalServicesTotal,
  );

  return (
    <>
      {roomPrices.length > 0 && (
        <fieldset className={styles.detailRoomPriceGrid}>
          <legend className={styles.detailRoomPriceLegend}>Pilih jumlah orang per kamar</legend>
          {roomPrices.map((room) => {
            const selected = room.code === selectedRoom?.code;
            const displayedTotal = room.mandatoryTotalPrice + optionalServicesTotal;
            const inputId = `room-price-${room.code}`;
            return (
              <label
                key={room.code}
                htmlFor={inputId}
                data-selected={selected}
                aria-label={`Pilih ${room.label}`}
              >
                <input
                  id={inputId}
                  className={styles.detailRoomPriceInput}
                  type="radio"
                  name="tour-room-price"
                  value={room.code}
                  checked={selected}
                  onChange={() => setSelectedRoomCode(room.code)}
                />
                <span>{room.label}</span>
                <h3>{hasPrice ? formatCurrency(room.headlinePrice) : "Sesuai permintaan"}</h3>
                <p>Harga posting per orang</p>
                <dl>
                  <div>
                    <dt>Biaya wajib</dt>
                    <dd>+{formatCurrency(room.mandatoryTotalPrice - room.headlinePrice)}</dd>
                  </div>
                  <div>
                    <dt>{selectedCaption}</dt>
                    <dd>{hasPrice ? formatCurrency(displayedTotal) : "Dikonfirmasi tim"}</dd>
                  </div>
                </dl>
              </label>
            );
          })}
        </fieldset>
      )}

      <div className={interactiveStyles.dateGrid}>
        <article className={interactiveStyles.dateCard} data-unavailable={unavailable}>
          <div className={interactiveStyles.dateCardTop}>
            <span>{status}</span>
            <strong>{departureLabel || "Tanggal fleksibel"}</strong>
          </div>
          {(hasOptionalServices || hasVisaInformation) && (
            <div
              className={interactiveStyles.dateCardOptionControls}
              role="group"
              aria-label="Tambahan opsional"
            >
              <TourRecommendedAddOnToggle compact grouped />
              <TourVisaServiceToggle compact grouped />
            </div>
          )}
          <dl aria-live="polite">
            <div>
              <dt>{selectedRoom ? `Harga paket (${selectedRoom.label})` : "Harga paket"}</dt>
              <dd>{hasPrice ? formatCurrency(selectedHeadlinePrice) : "Sesuai permintaan"}/orang</dd>
            </div>
            {mandatoryAddOns.map((item) => (
              <div key={item.name}>
                <dt>{item.name} <small>WAJIB</small></dt>
                <dd>+{formatCurrency(item.price)}</dd>
              </div>
            ))}
            <div className={interactiveStyles.dateTotal}>
              <dt>{selectedCaption}</dt>
              <dd>{hasPrice ? formatCurrency(selectedTotalPrice) : "Dikonfirmasi tim"}</dd>
            </div>
            {paymentInitialAmountLabel && (
              <div><dt>Minimum pembayaran awal</dt><dd>{paymentInitialAmountLabel}</dd></div>
            )}
          </dl>
          <TourVisaGroupPrice />
          <TourBookingExperience
            phone={bookingPhone}
            tourId={tourId}
            tourName={tourName}
            priceLabel={selectedPriceLabel}
            priceCaption={selectedCaption}
            roomOptions={roomOptions}
            selectedRoomValue={selectedRoom?.code}
            onRoomChange={setSelectedRoomCode}
            addOnPreference={optionalServicesPreference}
            availabilityLabel={availabilityLabel}
            mode={bookingMode}
            departures={pricedBookingDepartures}
            completedTourHref={completedTourHref}
          />
        </article>
      </div>
    </>
  );
}
