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
                <a href={latinAmericaEnquiryHref(programme.title)} className={styles.primary} target="_blank" rel="noreferrer"><MessageCircle size={18} aria-hidden="true" /> Minta rancangan & penawaran</a>
                <a href={LATIN_AMERICA_BROCHURE} className={styles.secondary} download><Download size={17} aria-hidden="true" /> Brosur ID / EN</a>
              </div>
              <p className={styles.caption}>Konsultasi melalui WhatsApp. Tanggal dan harga final mengikuti penawaran.</p>
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
          <p className={styles.eyebrow}>RANCANGAN PERJALANAN</p>
          <h2 id="route-heading">Kenali rutenya. Sesuaikan perjalananmu.</h2>
          <p>{programme.introduction}</p>
        </div>
        <ol className={styles.route} aria-label="Urutan rute indikatif">{programme.route.map((city, index) => <li key={`${city}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{city}</li>)}</ol>
        <div className={styles.stages}>{programme.stages.map((stage, index) => <article key={stage.title}><span className={styles.stageNumber}>{String(index + 1).padStart(2, "0")}</span><h3>{stage.title}</h3><p>{stage.description}</p></article>)}</div>
        <p className={styles.note}>{programme.planningNote}</p>
      </section>

      <section className={styles.planning} aria-labelledby="planning-heading">
        <div className={`${styles.shell} ${styles.twoColumns}`}>
          <div><p className={styles.eyebrow}>SESUAI KEBUTUHAN GRUP</p><h2 id="planning-heading">Apa yang bisa dimintakan?</h2><p>Pilih kebutuhan perjalanan sejak awal agar cakupan dan biaya dapat dijelaskan dalam satu penawaran.</p></div>
          <div className={styles.planningList}>
            <article><h3>Hotel & layanan darat</h3><p>Pilihan hotel 3 atau 4 bintang, transportasi privat, pemandu lokal berbahasa Inggris, kunjungan dan kereta sesuai rancangan yang disepakati.</p></article>
            <article><h3>Penerbangan & durasi</h3><p>Penerbangan dari Indonesia dan antarnegara atau kota dihitung sesuai jadwal yang dipilih. Durasi total dan jumlah malam ditetapkan setelah rute penerbangan diperiksa.</p></article>
            <article><h3>Cakupan biaya yang jelas</h3><p>Penawaran akhir merinci layanan yang termasuk, penerbangan, bagasi, makan, tiket kunjungan, serta biaya terpisah seperti visa, asuransi dan pengeluaran pribadi.</p></article>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.shell}`} aria-labelledby="faq-heading">
        <h2 id="faq-heading">Sebelum meminta penawaran</h2>
        <div className={styles.faq}>
          <StableDetails><summary>Apakah sudah ada jadwal keberangkatan pasti?</summary><p>Program 2027 sedang dikembangkan dan menerima permintaan penawaran. Tanggal, jumlah peserta, harga, serta ketersediaan dikonfirmasi sebelum pemesanan.</p></StableDetails>
          <StableDetails><summary>Apakah itinerary dan harga bisa langsung dikunci?</summary><p>Rute di halaman ini bersifat indikatif. Susunan harian, hotel, tiket kunjungan, penerbangan, dan ketentuan pembayaran mengikuti penawaran tertulis serta konfirmasi supplier.</p></StableDetails>
          <StableDetails><summary>Informasi apa yang perlu saya kirim?</summary><p>Sampaikan perkiraan bulan, jumlah peserta, kota keberangkatan, anggaran dan kebutuhan khusus grup. Kamu juga dapat menanyakan opsi rute sebelum menentukan tanggal.</p></StableDetails>
        </div>
      </section>

      <section className={styles.trade} id="trade-summary" lang="en" aria-labelledby="trade-heading">
        <div className={`${styles.shell} ${styles.twoColumns}`}>
          <div><p className={styles.eyebrow}>FOR TRAVEL TRADE PARTNERS</p><h2 id="trade-heading">Opening a new route from Indonesia.</h2></div>
          <div><p>{programme.englishSummary}</p><p>Sundaf Trip operates under CV Sundaf Holiday Group. We welcome discussions with local operators, hotels and destination partners to refine these programmes.</p><div className={styles.actions}><a href={`mailto:info@sundaftrip.com?subject=${encodeURIComponent(`Trade enquiry: ${programme.title} 2027`)}`} className={styles.secondary}><Mail size={17} aria-hidden="true" /> Contact our team</a><a href={LATIN_AMERICA_BROCHURE} className={styles.textLink} download>Download ID / EN brochure <Download size={16} aria-hidden="true" /></a></div></div>
        </div>
      </section>
      <div className={`${styles.shell} ${styles.finalCta}`}><div><h2>Mulai dengan rencana grupmu.</h2><p>Tim Sundaf akan membantu menyusun kebutuhan dan meminta penawaran yang sesuai.</p></div><a href={latinAmericaEnquiryHref(programme.title)} className={styles.primary} target="_blank" rel="noreferrer">Diskusikan perjalanan <ArrowRight size={18} aria-hidden="true" /></a></div>
    </div>
  );
}
