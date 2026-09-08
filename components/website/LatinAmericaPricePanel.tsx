"use client";

import { useId, useState } from "react";
import { ArrowUpRight, Check, MapPin, Plane } from "lucide-react";
import { packageGroup, packageTotal, rupiah, rupiahMillions, type PackagePrice, type PackageMode, type LandTourDetails } from "@/lib/latin-america-package-types";
import { latinAmericaEnquiryHref } from "@/lib/latin-america";
import styles from "./LatinAmerica.module.css";

export default function LatinAmericaPricePanel({ title, price, landTour, flightInclusions }: { title: string; price: PackagePrice; landTour: LandTourDetails; flightInclusions: string }) {
  const groupInputName = useId();
  const modeInputName = useId();
  const [mode, setMode] = useState<PackageMode>("with-flights");
  const [groupSize, setGroupSize] = useState(price.groupSize);
  const [selected, setSelected] = useState<string[]>([]);
  const group = packageGroup(price, groupSize);
  const landOnly = mode === "land-only";
  const total = packageTotal(price, selected, groupSize, mode);
  const modeLabel = landOnly ? "Land tour only" : "Paket dengan tiket pesawat";
  const options = price.options.filter((option) => selected.includes(option.id));
  const enquiry = `${title}; ${modeLabel}; grup ${groupSize} peserta${options.length ? `; tambahan: ${options.map((option) => option.name).join(", ")}` : ""}; estimasi ${rupiah(total)} per orang; ${group.roomNote}${landOnly ? `; mulai ${landTour.meetingPoint}, selesai ${landTour.finishPoint}; seluruh tiket pesawat peserta terpisah` : ""}`;

  return (
    <aside className={styles.pricePanel} aria-labelledby="package-price-heading" id="harga">
      <fieldset className={styles.modeList}>
        <legend>Pilihan paket</legend>
        <div className={styles.modeChoices}>{([
          { id: "with-flights", label: "Dengan tiket pesawat", note: "Berangkat dari Jakarta" },
          { id: "land-only", label: "Land tour only", note: "Bertemu di negara tujuan" },
        ] as const).map((choice) => <label className={styles.groupChoice} key={choice.id}>
          <input type="radio" name={modeInputName} value={choice.id} checked={mode === choice.id} onChange={() => setMode(choice.id)} aria-label={choice.label} />
          <span><strong>{choice.label}</strong><small>{choice.note}</small></span>
        </label>)}</div>
      </fieldset>
      <div className={styles.priceHeading}>
        <div><p className={styles.eyebrow}>{landOnly ? "LAND TOUR ONLY" : "PAKET DARI JAKARTA"}</p><h2 id="package-price-heading">Mulai {rupiahMillions(landOnly ? group.landOnlyFrom : group.from)}</h2><p>per orang · {price.hotel} · {groupSize} peserta</p></div>
        <span className={styles.airBadge}>{landOnly ? <MapPin size={16} aria-hidden="true" /> : <Plane size={16} aria-hidden="true" />}{landOnly ? "Tanpa tiket pesawat peserta" : "Termasuk tiket pesawat PP"}</span>
      </div>
      <div className={styles.modeCoverage} data-package-coverage>
        {landOnly ? <><p><strong>{landTour.duration}</strong> · Mulai: {landTour.meetingPoint}. Selesai: {landTour.finishPoint}.</p><p>Tidak termasuk seluruh tiket pesawat peserta, baik dari/ke Indonesia maupun penerbangan antar kota atau negara dalam itinerary.</p><p>Penerbangan selama tur yang perlu dipesan terpisah: <strong>{landTour.flightSectors.join("; ")}</strong>. Sesuaikan jadwal dengan tim Sundaf sebelum membeli tiket.</p></> : <p>{flightInclusions}</p>}
      </div>

      <fieldset className={styles.groupList}>
        <legend>Jumlah peserta</legend>
        <div className={styles.groupChoices}>{price.groups.map((tier) => <label className={styles.groupChoice} key={tier.groupSize}>
          <input type="radio" name={groupInputName} value={tier.groupSize} checked={groupSize === tier.groupSize} onChange={() => setGroupSize(tier.groupSize)} aria-label={`${tier.groupSize} peserta`} />
          <span><strong>{tier.groupSize} peserta</strong><small>{rupiahMillions(landOnly ? tier.landOnlyFrom : tier.from)} / orang</small></span>
        </label>)}</div>
      </fieldset>
      <p className={styles.roomNote} data-room-note>{group.roomNote}</p>
      <p className={styles.priceBasis}>Didampingi 1 tour leader dari Indonesia. {price.basisNote}</p>

      <fieldset className={styles.optionList}>
        <legend>Pilihan tambahan <span>per orang</span></legend>
        {price.options.map((option) => <label className={styles.option} key={option.id}>
          <input type="checkbox" checked={selected.includes(option.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, option.id] : current.filter((id) => id !== option.id))} />
          <span><strong>{option.name}</strong><small>{option.description}</small></span><b>+{rupiah(group.optionPrices[option.id])}</b>
        </label>)}
      </fieldset>
      <div className={styles.priceTotal}>
        <div><span>Estimasi pilihanmu / orang</span><strong aria-live="polite" aria-atomic="true" data-package-total={total} data-group-size={groupSize} data-package-mode={mode}>{rupiah(total)}</strong></div>
        <a className={styles.primary} href={latinAmericaEnquiryHref(enquiry)} target="_blank" rel="noreferrer">Cek tanggal & ketersediaan <ArrowUpRight size={18} aria-hidden="true" /></a>
      </div>
      <p className={styles.priceFootnote}><Check size={15} aria-hidden="true" /> Harga akhir mengikuti tanggal, pilihan kamar dan ketersediaan. Pemesanan dilakukan setelah penawaran disepakati.</p>
    </aside>
  );
}
