"use client";

import { formatCurrency } from "@/lib/utils";
import { useTourRoomSelection } from "./TourRoomSelectionContext";
import StableDetails from "./StableDetails";
import Link from "./PreserveScrollLink";
import styles from "./CleanSite.module.css";

const STATUS_LABELS = {
  visa_free: "Bebas visa",
  visa_on_arrival: "Visa saat kedatangan",
  required: "Perlu visa",
  evisa: "Visa elektronik",
  conditional: "Sesuai kondisi traveler",
  unknown: "Perlu konfirmasi",
};

export function TourVisaGroupPrice() {
  const { visaSelection } = useTourRoomSelection();
  if (!visaSelection.items.length) return null;
  return (
    <div className={styles.detailVisaGroupPrice} aria-live="polite" aria-atomic="true">
      <p><span>Bantuan visa untuk grup</span><strong>+{formatCurrency(visaSelection.total)}</strong></p>
      {visaSelection.items.map((item) => (
        <p key={item.id}><span>{item.name}: {formatCurrency(item.price)} × {item.count} orang</span><span>{formatCurrency(item.total)}</span></p>
      ))}
      <small>Biaya ini terpisah dari harga paket per orang.</small>
    </div>
  );
}

export default function TourVisaServiceToggle({
  compact = false,
  grouped = false,
  flat = false,
}: {
  compact?: boolean;
  grouped?: boolean;
  flat?: boolean;
}) {
  const {
    visaOffers,
    visaAssessment,
    visaSelection,
    travelerCount,
    includedVisaOfferIds,
    setVisaOfferIncluded,
    setVisaTravelerCount,
  } = useTourRoomSelection();

  if (visaOffers.length === 0 && !visaAssessment) return null;

  return (
    <section
      className={styles.detailVisaServices}
      data-compact={compact || undefined}
      data-grouped={grouped || undefined}
      data-flat={(flat && !compact && !grouped) || undefined}
      aria-label="Informasi dan bantuan visa"
    >
      <p className={styles.detailVisaServicesIntro}>
        <strong>Paspor biasa Indonesia · perjalanan wisata</strong>{" "}
        Ketentuan mengikuti negara tujuan, lama tinggal, dan dokumen Anda.
      </p>
      {visaAssessment && (
        <div className={styles.detailVisaRequirements}>
          {visaAssessment.countries.map((country) => (
            <div key={`${country.id}-${country.kind}`}>
              <p><strong>{country.name}{country.kind === "transit" ? " (transit)" : ""}</strong><span>{STATUS_LABELS[country.status]}</span></p>
              <p>{country.explanation}</p>
              {country.serviceState === "included" && <p>Bantuan visa sudah termasuk paket. Tidak perlu ditambahkan lagi.</p>}
              {country.serviceState === "separate" && <p>Biaya visa tercantum pada rincian paket. Jangan ditambahkan dua kali.</p>}
              {country.serviceState === "consultation" && (
                <Link href={country.href || "/visa"}>Konsultasikan kebutuhan visa</Link>
              )}
              {(country.conditions.length > 0 || country.sourceUrl || country.checkedAt) && (
                <StableDetails className={styles.detailVisaRequirementDetails}>
                  <summary>Ketentuan dan sumber</summary>
                  {country.conditions.length > 0 && <ul>{country.conditions.map((condition, index) => <li key={index}>{condition}</li>)}</ul>}
                  {country.checkedAt && <p>Terakhir diperiksa: {country.checkedAt.slice(0, 10)}</p>}
                  {country.sourceUrl && /^https?:\/\//i.test(country.sourceUrl) && (
                    <a href={country.sourceUrl} target="_blank" rel="noopener noreferrer">Sumber ketentuan resmi</a>
                  )}
                </StableDetails>
              )}
            </div>
          ))}
          {visaAssessment.countries.length === 0 && <p>Rute dan kebutuhan visa perlu dikonfirmasi bersama tim Sundaf.</p>}
          {(visaAssessment.issues.length > 0 || visaAssessment.warnings.length > 0) && (
            <StableDetails className={styles.detailVisaRequirementDetails}>
              <summary>Hal yang perlu dikonfirmasi</summary>
              <ul>{[...new Set([...visaAssessment.issues, ...visaAssessment.warnings])].map((item) => <li key={item}>{item}</li>)}</ul>
            </StableDetails>
          )}
        </div>
      )}
      {visaOffers.length > 0 && <p className={styles.detailVisaServicesIntro}>
        Perlu bantuan pengurusan visa? Pilih Ya untuk peserta yang memerlukan bantuan. Pilih Tidak jika visa yang dimiliki sudah sesuai negara tujuan, masa berlaku, dan jumlah masuk yang diperlukan.
      </p>}
      <div className={styles.detailVisaServiceList}>
        {visaOffers.map((offer) => {
          const included = includedVisaOfferIds.includes(offer.id);
          const selectedCount = visaSelection.items.find((item) => item.id === offer.id)?.count ?? 0;

          return (
            <div key={offer.id} className={styles.detailVisaServiceOption} data-included={included}>
            <label>
              <span className={styles.detailVisaServiceCopy}>
                <strong>{offer.name}</strong>
                <small>{formatCurrency(offer.price)}/pemohon</small>
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
            {included && (
              <label className={styles.detailVisaApplicantCount}>
                <span>Peserta yang perlu bantuan</span>
                <select
                  value={selectedCount}
                  onChange={(event) => setVisaTravelerCount(offer.id, Number(event.target.value))}
                  aria-label={`Jumlah pemohon ${offer.name}`}
                >
                  {Array.from({ length: travelerCount }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} dari {travelerCount} orang</option>)}
                </select>
              </label>
            )}
            <Link className={styles.detailVisaServiceLink} href={offer.href}>Lihat layanan visa</Link>
            </div>
          );
        })}
      </div>
      {visaOffers.length > 0 && <p className={styles.detailVisaServicesIntro}>
        Bantuan visa terpisah dari harga paket per orang. Atur jumlah peserta saat cek ketersediaan.
      </p>}
    </section>
  );
}
