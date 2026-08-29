"use client";

import type { TourRoomPrice } from "@/lib/tour-room-pricing";
import { formatCurrency } from "@/lib/utils";
import type { BookingDeparture, BookingMode } from "./TourBookingSheet";
import TourBookingExperience from "./TourBookingExperience";
import TourRecommendedAddOnToggle from "./TourRecommendedAddOnToggle";
import { useTourRoomSelection } from "./TourRoomSelectionContext";
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
    selectableAddOn,
    selectableAddOnTotal,
    selectableAddOnPreference,
  } = useTourRoomSelection();
  const selectedHeadlinePrice = selectedRoom?.headlinePrice ?? basePrice;
  const selectedMandatoryTotalPrice = selectedRoom?.mandatoryTotalPrice ?? startingTotal;
  const selectedTotalPrice = selectedMandatoryTotalPrice + selectableAddOnTotal;
  const selectedCaption = selectableAddOn ? "Total per orang" : priceCaption;
  const selectedPriceLabel = hasPrice ? formatCurrency(selectedTotalPrice) : priceLabel;
  const roomOptions = roomPrices.map((room) => ({
    value: room.code,
    label: room.label,
    priceLabel: formatCurrency(room.mandatoryTotalPrice + selectableAddOnTotal),
    priceCaption: selectedCaption,
  }));

  return (
    <>
      {roomPrices.length > 0 && (
        <fieldset className={styles.detailRoomPriceGrid}>
          <legend className={styles.detailRoomPriceLegend}>Pilih jumlah orang per kamar</legend>
          {roomPrices.map((room) => {
            const selected = room.code === selectedRoom?.code;
            const displayedTotal = room.mandatoryTotalPrice + selectableAddOnTotal;
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
                <h3>{formatCurrency(room.headlinePrice)}</h3>
                <p>Harga posting per orang</p>
                <dl>
                  <div>
                    <dt>Biaya wajib</dt>
                    <dd>+{formatCurrency(room.mandatoryTotalPrice - room.headlinePrice)}</dd>
                  </div>
                  <div>
                    <dt>{selectableAddOn ? "Total per orang" : "Total wajib per orang"}</dt>
                    <dd>{formatCurrency(displayedTotal)}</dd>
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
          <TourRecommendedAddOnToggle />
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
              <dt>{selectableAddOn ? "Total per orang" : "Total wajib per orang"}</dt>
              <dd>{hasPrice ? formatCurrency(selectedTotalPrice) : "Dikonfirmasi tim"}</dd>
            </div>
            {paymentInitialAmountLabel && (
              <div><dt>Minimum pembayaran awal</dt><dd>{paymentInitialAmountLabel}</dd></div>
            )}
          </dl>
          <TourBookingExperience
            phone={bookingPhone}
            tourId={tourId}
            tourName={tourName}
            priceLabel={selectedPriceLabel}
            priceCaption={selectedCaption}
            roomOptions={roomOptions}
            selectedRoomValue={selectedRoom?.code}
            onRoomChange={setSelectedRoomCode}
            addOnPreference={selectableAddOnPreference}
            availabilityLabel={availabilityLabel}
            mode={bookingMode}
            departures={bookingDepartures}
            completedTourHref={completedTourHref}
          />
        </article>
      </div>
    </>
  );
}
