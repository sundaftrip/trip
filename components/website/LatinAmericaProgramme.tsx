import Image from "next/image";
import Link from "@/components/website/clean/PreserveScrollLink";
import { ArrowLeft, ArrowRight, Download, Mail, MessageCircle } from "lucide-react";
import StableDetails from "@/components/website/clean/StableDetails";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import { LATIN_AMERICA_BROCHURE, LATIN_AMERICA_STATUS, latinAmericaEnquiryHref, type LatinAmericaProgramme as Programme } from "@/lib/latin-america";
import { serializeJsonLd } from "@/lib/safe-json-ld";
import styles from "./LatinAmerica.module.css";

export default function LatinAmericaProgramme({ programme }: { programme: Programme }) {
  const schema = {
    "@context": "https://schema.org", "@type": "WebPage",
    "@id": `https://sundaftrip.com${programme.href}#webpage`,
    url: `https://sundaftrip.com${programme.href}`, name: programme.title,
    description: `${programme.summary} ${LATIN_AMERICA_STATUS}. Tanggal dan harga sesuai penawaran.`,
    inLanguage: "id-ID", isPartOf: { "@id": "https://sundaftrip.com#website" },
  };
  return (
    <div className={styles.page}>
      <BreadcrumbSchema crumbs={[{ name: "Beranda", url: "/" }, { name: "Amerika Latin", url: "/amerika-latin" }, { name: programme.title, url: programme.href }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <section className={styles.detailHero}>
        <div className={styles.shell}>
          <Link scroll data-scroll-reset-after-navigation className={styles.back} href="/amerika-latin"><ArrowLeft size={16} aria-hidden="true" /> Katalog Amerika Latin</Link>
          <div className={styles.heroGrid}>
            <div>
              <p className={styles.eyebrow}>{programme.eyebrow} · 2027</p>
              <h1>{programme.title}</h1>
              <p className={styles.lead}>{programme.summary}</p>
              <p className={styles.status}>{LATIN_AMERICA_STATUS}</p>
              <div className={styles.actions}>
                <a href={latinAmericaEnquiryHref(programme.title)} className={styles.primary} target="_blank" rel="noreferrer"><MessageCircle size={18} aria-hidden="true" /> Tanya itinerary & harga</a>
                <a href={LATIN_AMERICA_BROCHURE} className={styles.secondary} download><Download size={17} aria-hidden="true" /> Brosur ID / EN</a>
              </div>
              <p className={styles.caption}>Untuk grup sendiri. Hubungi kami dengan rencana tanggal dan jumlah peserta.</p>
              <a href="#trade-summary" className={styles.textLink} lang="en">English trade summary <ArrowRight size={15} aria-hidden="true" /></a>
            </div>
            <figure className={styles.heroPhoto}>
              <Image src={programme.image} alt={programme.imageAlt} fill priority sizes="(max-width: 760px) 100vw, 50vw" />
              <figcaption>Inspirasi destinasi · <Link scroll data-scroll-reset-after-navigation href="/amerika-latin#kredit-foto">Kredit foto</Link></figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.shell}`} aria-labelledby="route-heading">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>CONTOH RUTE</p>
          <h2 id="route-heading">Rute perjalanan</h2>
          <p>{programme.introduction}</p>
        </div>
        <ol className={styles.route} aria-label="Urutan perjalanan">{programme.route.map((city, index) => <li key={`${city}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{city}</li>)}</ol>
        <div className={styles.stages}>{programme.stages.map((stage, index) => <article key={stage.title}><span className={styles.stageNumber}>{String(index + 1).padStart(2, "0")}</span><h3>{stage.title}</h3><p>{stage.description}</p></article>)}</div>
        <p className={styles.note}>{programme.planningNote}</p>
      </section>

      <section className={styles.planning} aria-labelledby="planning-heading">
        <div className={`${styles.shell} ${styles.twoColumns}`}>
          <div><p className={styles.eyebrow}>HOTEL, TRANSPORTASI & TIKET</p><h2 id="planning-heading">Layanan perjalanan</h2><p>Hotel 3 atau 4 bintang, transportasi privat, dan pemandu lokal berbahasa Inggris bisa dimasukkan dalam penawaran.</p></div>
          <div className={styles.planningList}>
            <article><h3>Hotel & layanan darat</h3><p>Pilihan hotel dan tipe kamar disesuaikan dengan jumlah peserta. Penawaran juga merinci transfer bandara, kendaraan untuk kunjungan, dan pemandu lokal.</p></article>
            <article><h3>Penerbangan & durasi</h3><p>Tiket dari Indonesia dan penerbangan antarnegara atau kota dihitung sesuai tanggal pilihanmu. Jadwal terbang menentukan jumlah malam dan urutan perjalanan.</p></article>
            <article><h3>Kereta & tiket kunjungan</h3><p>Kereta ke Aguas Calientes dan tiket Machu Picchu diperiksa sesuai tanggal kunjungan. Penawaran merinci layanan yang termasuk dan biaya yang dibayar terpisah.</p></article>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.shell}`} aria-labelledby="faq-heading">
        <h2 id="faq-heading">Pertanyaan tentang perjalanan</h2>
        <div className={styles.faq}>
          <StableDetails><summary>Apakah ini open trip dengan tanggal tetap?</summary><p>Saat ini kami menerima permintaan perjalanan untuk grup sendiri. Program 2027 sedang kami susun dan belum memiliki jadwal open trip tetap.</p></StableDetails>
          <StableDetails><summary>Apakah harga sudah termasuk tiket pesawat?</summary><p>Belum ada harga paket yang dipublikasikan. Penawaran akan merinci biaya layanan darat, tiket dari Indonesia, penerbangan regional, serta layanan lain yang kamu pilih.</p></StableDetails>
          <StableDetails><summary>Bisa mengubah rute atau jumlah malam?</summary><p>Bisa didiskusikan. Sampaikan kota yang ingin dikunjungi, perkiraan tanggal, dan jumlah peserta agar kami bisa memeriksa pilihan rute serta biayanya.</p></StableDetails>
        </div>
      </section>

      <section className={styles.trade} id="trade-summary" lang="en" aria-labelledby="trade-heading">
        <div className={`${styles.shell} ${styles.twoColumns}`}>
          <div><p className={styles.eyebrow}>TRAVEL TRADE ENQUIRIES</p><h2 id="trade-heading">Sundaf Trip, Indonesia</h2></div>
          <div><p>{programme.englishSummary}</p><p>Sundaf Trip operates under CV Sundaf Holiday Group. We are interested in working with local operators and hotels on ground services and group arrangements.</p><div className={styles.actions}><a href={`mailto:info@sundaftrip.com?subject=${encodeURIComponent(`Trade enquiry: ${programme.title} 2027`)}`} className={styles.secondary}><Mail size={17} aria-hidden="true" /> Contact our team</a><a href={LATIN_AMERICA_BROCHURE} className={styles.textLink} download>Download ID / EN brochure <Download size={16} aria-hidden="true" /></a></div></div>
        </div>
      </section>
      <div className={`${styles.shell} ${styles.finalCta}`}><div><h2>Mau itinerary untuk grupmu?</h2><p>Kirim bulan perjalanan, jumlah peserta, dan kota keberangkatan melalui WhatsApp.</p></div><a href={latinAmericaEnquiryHref(programme.title)} className={styles.primary} target="_blank" rel="noreferrer">Tanya perjalanan ini <ArrowRight size={18} aria-hidden="true" /></a></div>
    </div>
  );
}
