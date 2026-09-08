"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Plane } from "lucide-react";
import StableDetails from "./clean/StableDetails";
import { packageTotal, rupiah, rupiahMillions, type PackagePrice } from "@/lib/latin-america-package-types";
import { latinAmericaEnquiryHref } from "@/lib/latin-america";
import styles from "./LatinAmerica.module.css";

export default function LatinAmericaPricePanel({ title, price }: { title: string; price: PackagePrice }) {
  const [selected, setSelected] = useState<string[]>([]);
  const total = packageTotal(price, selected);
  const options = price.options.filter((option) => selected.includes(option.id));
  const enquiry = `${title}${options.length ? `; tambahan: ${options.map((option) => option.name).join(", ")}` : ""}; estimasi ${rupiah(total)} per orang untuk ${price.groupSize} peserta`;

  return (
    <aside className={styles.pricePanel} aria-labelledby="package-price-heading" id="harga">
      <div className={styles.priceHeading}>
        <div><p className={styles.eyebrow}>ESTIMASI PAKET DARI JAKARTA</p><h2 id="package-price-heading">Mulai {rupiahMillions(price.from)}</h2><p>per orang · {price.hotel} · kamar berdua</p></div>
        <span className={styles.airBadge}><Plane size={16} aria-hidden="true" /> Termasuk anggaran tiket PP</span>
      </div>
      <p className={styles.priceBasis}>Acuan {price.groupSize} peserta berbayar + 1 tour leader dari Indonesia. {price.basisNote}</p>

      <StableDetails className={styles.priceBreakdown}>
        <summary>Lihat komponen harga</summary>
        <dl>{price.components.map((component) => <div key={component.label}><dt>{component.label}<small>{component.description}</small></dt><dd>{rupiah(component.amount)}</dd></div>)}</dl>
        <p>{price.airfareNote}</p>
      </StableDetails>

      <fieldset className={styles.optionList}>
        <legend>Pilihan tambahan <span>per orang</span></legend>
        {price.options.map((option) => <label className={styles.option} key={option.id}>
          <input type="checkbox" checked={selected.includes(option.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, option.id] : current.filter((id) => id !== option.id))} />
          <span><strong>{option.name}</strong><small>{option.description}</small></span><b>+{rupiah(option.amount)}</b>
        </label>)}
      </fieldset>
      <div className={styles.priceTotal}>
        <div><span>Estimasi pilihanmu / orang</span><strong aria-live="polite" aria-atomic="true" data-package-total={total}>{rupiah(total)}</strong></div>
        <a className={styles.primary} href={latinAmericaEnquiryHref(enquiry)} target="_blank" rel="noreferrer">Cek tanggal & ketersediaan <ArrowUpRight size={18} aria-hidden="true" /></a>
      </div>
      <p className={styles.priceFootnote}><Check size={15} aria-hidden="true" /> Acuan biaya {price.updated}. Harga akhir mengikuti tanggal, kurs, layanan dan ketersediaan dalam penawaran tertulis. Pilihan di sini belum membuat pemesanan.</p>
    </aside>
  );
}
