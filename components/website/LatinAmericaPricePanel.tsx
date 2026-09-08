"use client";

import { useId, useState } from "react";
import { ArrowUpRight, Check, Plane } from "lucide-react";
import { packageGroup, packageTotal, rupiah, rupiahMillions, type PackagePrice } from "@/lib/latin-america-package-types";
import { latinAmericaEnquiryHref } from "@/lib/latin-america";
import styles from "./LatinAmerica.module.css";

export default function LatinAmericaPricePanel({ title, price }: { title: string; price: PackagePrice }) {
  const groupInputName = useId();
  const [groupSize, setGroupSize] = useState(price.groupSize);
  const [selected, setSelected] = useState<string[]>([]);
  const group = packageGroup(price, groupSize);
  const total = packageTotal(price, selected, groupSize);
  const options = price.options.filter((option) => selected.includes(option.id));
  const enquiry = `${title}; grup ${groupSize} peserta${options.length ? `; tambahan: ${options.map((option) => option.name).join(", ")}` : ""}; estimasi ${rupiah(total)} per orang; ${group.roomNote}`;

  return (
    <aside className={styles.pricePanel} aria-labelledby="package-price-heading" id="harga">
      <div className={styles.priceHeading}>
        <div><p className={styles.eyebrow}>PAKET DARI JAKARTA</p><h2 id="package-price-heading">Mulai {rupiahMillions(group.from)}</h2><p>per orang · {price.hotel} · {groupSize} peserta</p></div>
        <span className={styles.airBadge}><Plane size={16} aria-hidden="true" /> Termasuk tiket pesawat PP</span>
      </div>

      <fieldset className={styles.groupList}>
        <legend>Jumlah peserta</legend>
        <div className={styles.groupChoices}>{price.groups.map((tier) => <label className={styles.groupChoice} key={tier.groupSize}>
          <input type="radio" name={groupInputName} value={tier.groupSize} checked={groupSize === tier.groupSize} onChange={() => setGroupSize(tier.groupSize)} aria-label={`${tier.groupSize} peserta`} />
          <span><strong>{tier.groupSize} peserta</strong><small>{rupiahMillions(tier.from)} / orang</small></span>
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
        <div><span>Estimasi pilihanmu / orang</span><strong aria-live="polite" aria-atomic="true" data-package-total={total} data-group-size={groupSize}>{rupiah(total)}</strong></div>
        <a className={styles.primary} href={latinAmericaEnquiryHref(enquiry)} target="_blank" rel="noreferrer">Cek tanggal & ketersediaan <ArrowUpRight size={18} aria-hidden="true" /></a>
      </div>
      <p className={styles.priceFootnote}><Check size={15} aria-hidden="true" /> Harga akhir mengikuti tanggal, pilihan kamar dan ketersediaan. Pemesanan dilakukan setelah penawaran disepakati.</p>
    </aside>
  );
}
