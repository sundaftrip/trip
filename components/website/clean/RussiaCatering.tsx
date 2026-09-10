"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import Link from "./PreserveScrollLink";
import { buildWhatsAppHref } from "@/lib/utils";
import { buildCateringRequest, cateringGallery, cateringImage, cateringPackages, formatCateringPrice, type CateringRequest } from "@/lib/russia-catering";
import styles from "./RussiaCatering.module.css";

const cx = (names: string) => names.split(" ").map((name) => styles[name]).join(" ");
const initialRequest: CateringRequest = { city: "", date: "", portions: "", menu: "", notes: "" };

export default function RussiaCatering({ whatsapp }: { whatsapp: string }) {
  const [request, setRequest] = useState<CateringRequest>(initialRequest);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const cityRef = useRef<HTMLSelectElement>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);

  function update(field: keyof CateringRequest, value: string) {
    setRequest((current) => ({ ...current, [field]: value }));
    if (draft) {
      setDraft("");
      setStatus("Kebutuhan berubah. Buat kembali draf agar sesuai dengan isian terbaru.");
    }
  }

  function selectMenu(menu: string, name: string) {
    setRequest((current) => ({ ...current, menu }));
    setDraft("");
    setStatus(`${name} dipilih. Lengkapi kota, tanggal, dan jumlah porsi.`);
    document.getElementById("permintaan-katering")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    cityRef.current?.focus({ preventScroll: true });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setDraft(buildCateringRequest(request));
    setStatus("Draf siap. Salin teks atau buka WhatsApp untuk mengirimnya sendiri.");
    window.requestAnimationFrame(() => {
      draftRef.current?.focus({ preventScroll: true });
      draftRef.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft);
      setStatus("Draf disalin ke clipboard. Pesan belum dikirim.");
    } catch {
      draftRef.current?.focus();
      draftRef.current?.select();
      setStatus("Penyalinan otomatis tidak tersedia. Teks telah dipilih; gunakan Salin pada perangkat Anda.");
    }
  }

  return (
    <div className={styles.page}>
      <nav className={cx("breadcrumb wrap")} aria-label="Breadcrumb"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><Link href="/russia">Layanan Rusia</Link><span aria-hidden="true">/</span><span>Katering halal</span></nav>
      <section className={cx("hero wrap")} aria-labelledby="catering-title">
        <div className={styles["hero-copy"]}>
          <p className={styles.eyebrow}><span className={styles.line} aria-hidden="true" />KATERING HALAL DI RUSIA</p>
          <h1 id="catering-title">Rasa Indonesia,<br />di perjalanan <em>Rusia.</em></h1>
          <p className={styles.intro}>Nasi kuning, ayam berbumbu, hingga lauk rumahan. Pilih hidangan Indonesia untuk menemani perjalanan rombongan Anda.</p>
          <p className={styles.cities}><span aria-hidden="true">✧</span> MOSCOW <span aria-hidden="true">·</span> SAINT PETERSBURG</p>
          <div className={styles["price-block"]}><span className={styles["price-label"]}>MULAI</span><p className={styles.price}>700 <span>RUB / porsi</span></p><p className={styles["price-note"]}>Harga per porsi. Biaya pengantaran<br /> dikonfirmasi dalam penawaran.</p></div>
          <a className={cx("button primary")} href="#permintaan-katering">Susun kebutuhan katering <span aria-hidden="true">↗</span></a>
        </div>
        <div className={styles["hero-visual"]}>
          <Image className={styles["hero-image"]} src={cateringImage("02-nasi-kuning.png")} width={1024} height={1365} sizes="(max-width: 760px) 100vw, 50vw" priority alt="Nasi kuning dengan ayam berbumbu, telur bumbu merah, bihun, timun, dan tomat." />
          <div className={styles["image-caption"]}><span>NASI KUNING NUSANTARA</span><span>RASA YANG DIRINDUKAN</span></div>
        </div>
      </section>

      <div className={cx("service-strip wrap")} aria-label="Layanan katering"><span>Rasa Indonesia yang akrab</span><span>Nasi box per orang</span><span>Diantar ke titik temu Anda</span></div>

      <section className={cx("menu-section wrap section-space")} id="menu-katering" aria-labelledby="menu-title">
        <div className={styles["section-heading"]}><div><p className={styles.eyebrow}>DARI DAPUR KE PERJALANAN ANDA</p><h2 id="menu-title">Pilihan <em>menu.</em></h2></div><p>Contoh menu; komposisi akhir<br /> dikonfirmasi saat pemesanan.</p></div>
        <div className={styles["menu-grid"]}>
          {cateringPackages.map((item, index) => <article className={styles["menu-item"]} key={item.id}>
            <div className={styles["menu-photo"]}><Image src={cateringImage(item.image)} alt={`${item.name}: ${item.composition}`} width={1024} height={1365} sizes="(max-width: 760px) 100vw, 33vw" /><span className={styles["menu-number"]}>0{index + 1}</span></div>
            <div className={styles["tier-line"]}><p className={styles["menu-type"]}>PAKET {item.tier.toUpperCase()}</p><p className={styles["menu-price"]}>{formatCateringPrice(item.price)} <span>RUB / porsi</span></p></div>
            <div className={styles["menu-info"]}><h3>{item.name}</h3><button className={styles["menu-select"]} type="button" onClick={() => selectMenu(item.id, item.name)} aria-label={`Pilih paket ${item.tier}, ${formatCateringPrice(item.price)} RUB per porsi`}>↗</button></div>
            <p className={styles["menu-description"]}>{item.composition}</p><p className={styles["menu-benefit"]}>{item.benefit}</p>
          </article>)}
          <article className={cx("menu-item sides-item")}>
            <div className={styles["menu-photo"]}><Image src={cateringImage("03-lauk-rumahan.png")} alt="Pilihan ayam suwir berbumbu, telur bumbu merah, serta tumis tahu dan sayuran." width={1024} height={1365} sizes="(max-width: 760px) 100vw, 33vw" /></div>
            <div className={styles["sides-copy"]}><p className={styles["menu-type"]}>LENGKAPI PILIHAN ANDA</p><h3>Lauk Rumahan Nusantara</h3><p className={styles["menu-description"]}>Ayam suwir berbumbu, telur bumbu merah, tumis tahu dan sayuran.</p><button className={styles["sides-cta"]} type="button" onClick={() => selectMenu("Lauk Rumahan Nusantara", "Lauk Rumahan Nusantara")}>Tanyakan pilihan lauk <span aria-hidden="true">↗</span></button></div>
          </article>
        </div>
        <div className={styles["menu-bottom-note"]}><span aria-hidden="true">✧</span><p>Punya kebutuhan menu tertentu? Sampaikan pilihan lauk, tingkat kepedasan, dan alergi saat berkonsultasi.</p></div>
      </section>

      <section className={cx("gallery-section section-space")} aria-labelledby="gallery-title"><div className={styles.wrap}>
        <div className={styles["section-heading"]}><div><p className={styles.eyebrow}>UNTUK SATU ROMBONGAN</p><h2 id="gallery-title">Siap menemani<br /><em>agenda Anda.</em></h2></div><p>Rencanakan kebutuhan makan rombongan<br /> bersama SUNDAF.</p></div>
        <div className={styles["delivery-note"]}><span aria-hidden="true">↗</span><div><h3>Diantar saat Anda berkeliling.</h3><p>Menu disesuaikan dengan agenda perjalanan. Pengantaran menggunakan taksi ke titik temu yang disepakati di Moscow atau Saint Petersburg, dalam kota masing-masing.</p><p className={styles["delivery-cost"]}>Harga per porsi. Biaya pengantaran dikonfirmasi dalam penawaran.</p></div></div>
        <div className={styles["gallery-grid"]}>{cateringGallery.map((item, index) => <figure key={item.image}><Image src={cateringImage(item.image)} alt={item.alt} width={1024} height={1365} sizes="(max-width: 760px) 33vw, 30vw" /><figcaption><span>0{index + 1}</span>{item.label}</figcaption></figure>)}</div>
      </div></section>

      <section className={cx("inquiry-section wrap section-space")} id="permintaan-katering" aria-labelledby="inquiry-title">
        <div className={styles["inquiry-intro"]}><p className={styles.eyebrow}>CERITAKAN RENCANA ANDA</p><h2 id="inquiry-title">Makan bersama,<br /><em>diatur bersama.</em></h2><p>Pilih kota, tanggal, dan kebutuhan porsi. Susun draf permintaan untuk dibicarakan dengan tim SUNDAF.</p><div className={styles["inquiry-detail"]}><span aria-hidden="true">↗</span><p>Untuk wisatawan, penyelenggara rombongan, dan mitra agen perjalanan.</p></div><p className={styles["small-note"]}>Ketersediaan menu, harga akhir, dan pengantaran dikonfirmasi oleh tim.</p></div>
        <div className={styles["inquiry-panel"]}>
          <form onSubmit={submit}>
            <div className={styles["form-row"]}>
              <div className={styles.field}><label htmlFor="catering-city">Kota tujuan</label><select id="catering-city" ref={cityRef} value={request.city} onChange={(event) => update("city", event.target.value)} required><option value="">Pilih kota</option><option>Moscow</option><option>Saint Petersburg</option><option>Moscow &amp; Saint Petersburg</option></select></div>
              <div className={styles.field}><label htmlFor="catering-date">Tanggal kebutuhan</label><input type="date" id="catering-date" value={request.date} onChange={(event) => update("date", event.target.value)} required /></div>
            </div>
            <div className={styles["form-row"]}>
              <div className={styles.field}><label htmlFor="catering-portions">Jumlah porsi</label><input type="number" id="catering-portions" min="1" step="1" inputMode="numeric" placeholder="Contoh: 30" value={request.portions} onChange={(event) => update("portions", event.target.value)} required /></div>
              <div className={styles.field}><label htmlFor="catering-menu">Pilihan menu</label><select id="catering-menu" value={request.menu} onChange={(event) => update("menu", event.target.value)} required><option value="">Pilih menu</option>{cateringPackages.map((item) => <option key={item.id} value={item.id}>{item.tier} — {formatCateringPrice(item.price)} RUB/porsi</option>)}<option>Lauk Rumahan Nusantara</option><option>Beberapa menu / konsultasi</option></select></div>
            </div>
            <div className={styles.field}><label htmlFor="catering-notes">Catatan <span>(opsional)</span></label><textarea id="catering-notes" rows={3} placeholder="Titik temu, jam makan, alergi, atau kebutuhan khusus…" value={request.notes} onChange={(event) => update("notes", event.target.value)} /></div>
            <button className={cx("button primary form-submit")} type="submit">Buat draf permintaan <span aria-hidden="true">↗</span></button><p className={styles["form-privacy"]}>Draf dibuat di perangkat Anda. Anda memilih kapan mengirimnya ke SUNDAF.</p>
          </form>
          {draft && <div className={styles["draft-result"]}><label htmlFor="catering-draft">Draf untuk tim SUNDAF</label><textarea id="catering-draft" ref={draftRef} value={draft} rows={10} readOnly /><div className={styles["draft-actions"]}><button className={cx("button secondary")} type="button" onClick={copyDraft}>Salin draf</button><a className={cx("button primary")} href={buildWhatsAppHref(whatsapp, draft)} target="_blank" rel="noopener noreferrer">Buka WhatsApp <span aria-hidden="true">↗</span></a></div></div>}
          <p className={styles["form-status"]} role="status" aria-live="polite">{status}</p>
        </div>
      </section>

      <aside className={cx("ruble-tease wrap")} aria-label="Layanan mendatang"><p>KEBUTUHAN LAIN DI RUSIA</p><div><span>Rubel</span><span className={styles["coming-soon"]}>Coming soon</span></div><span className={styles["ruble-mark"]} aria-hidden="true">₽</span></aside>
      <div className={cx("back-to-services wrap")}><Link href="/russia">Lihat layanan Rusia lainnya <span aria-hidden="true">↗</span></Link></div>
    </div>
  );
}
