"use client";

import { formatCurrency } from "@/lib/utils";
import { useTourRoomSelection } from "./TourRoomSelectionContext";
import styles from "./CleanSite.module.css";

export default function TourVisaServiceToggle({ compact = false }: { compact?: boolean }) {
  const {
    visaOffers,
    includedVisaOfferIds,
    setVisaOfferIncluded,
  } = useTourRoomSelection();

  if (visaOffers.length === 0) return null;

  return (
    <section
      className={styles.detailVisaServices}
      data-compact={compact || undefined}
      aria-label="Pilihan bantuan visa"
    >
      {!compact && (
        <p className={styles.detailVisaServicesIntro}>
          <strong>Perjalanan ini membutuhkan visa.</strong>{" "}
          Apakah Anda memerlukan pengurusan visa? Jika visa Anda masih berlaku, pilih Tidak.
        </p>
      )}
      <div className={styles.detailVisaServiceList}>
        {visaOffers.map((offer) => {
          const included = includedVisaOfferIds.includes(offer.id);

          return (
            <label key={offer.id} data-included={included}>
              <span className={styles.detailVisaServiceCopy}>
                <strong>{offer.name}</strong>
                <small>+{formatCurrency(offer.price)}</small>
              </span>
              <span className={styles.detailRecommendedAddOnAction}>
                <span aria-hidden="true">{included ? "Ya" : "Tidak"}</span>
                <span className={styles.detailRecommendedAddOnSwitch}>
                  <input
                    type="checkbox"
                    checked={included}
                    onChange={(event) => setVisaOfferIncluded(offer.id, event.target.checked)}
                    aria-label={`${included ? "Hapus" : "Tambahkan"} bantuan ${offer.name}`}
                  />
                  <span aria-hidden="true" />
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
