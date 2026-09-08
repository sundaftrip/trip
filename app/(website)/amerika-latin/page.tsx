import Image from "next/image";
import Link from "@/components/website/clean/PreserveScrollLink";
import { ArrowRight, ArrowUpRight, Download, MapPin } from "lucide-react";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import { LATIN_AMERICA_BROCHURE, LATIN_AMERICA_PROGRAMMES, LATIN_AMERICA_STATUS, latinAmericaEnquiryHref, latinAmericaMetadata } from "@/lib/latin-america";
import { serializeJsonLd } from "@/lib/safe-json-ld";
import styles from "@/components/website/LatinAmerica.module.css";

export const metadata = latinAmericaMetadata("Katalog Amerika Latin & Peru 2027", "Rancang perjalanan Peru atau Brasil, Kolombia, Peru dan Chile bersama Sundaf Trip. Pengembangan program grup 2027, dengan tanggal dan harga sesuai penawaran.", "/amerika-latin");

export default function LatinAmericaCatalogPage() {
  const schema = {
    "@context": "https://schema.org", "@type": "CollectionPage",
    url: "https://sundaftrip.com/amerika-latin", name: "Katalog Amerika Latin & Peru 2027",
    description: "Rancangan perjalanan grup 2027. Tanggal, harga dan ketersediaan sesuai penawaran.",
    inLanguage: "id-ID", isPartOf: { "@id": "https://sundaftrip.com#website" },
    mainEntity: { "@type": "ItemList", itemListElement: LATIN_AMERICA_PROGRAMMES.map((programme, index) => ({ "@type": "ListItem", position: index + 1, name: programme.title, url: `https://sundaftrip.com${programme.href}` })) },
  };
  return (
    <div className={styles.page}>
      <BreadcrumbSchema crumbs={[{ name: "Beranda", url: "/" }, { name: "Amerika Latin", url: "/amerika-latin" }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <section className={styles.catalogHero}>
        <div className={styles.heroBackdrop}><Image src={LATIN_AMERICA_PROGRAMMES[0].image} alt="" fill priority sizes="100vw" /></div>
        <div className={styles.shell}>
          <p className={styles.eyebrow}>KOLEKSI PERJALANAN · 2027</p>
          <h1>Amerika Latin.<br /><span>Mulai dari Peru.</span></h1>
          <p className={styles.lead}>Dari Lima dan Machu Picchu hingga Rio de Janeiro. Temukan rancangan perjalanan yang ingin kamu wujudkan bersama grupmu.</p>
          <p className={styles.status}>{LATIN_AMERICA_STATUS}</p>
          <div className={styles.actions}><a href="#pilihan-program" className={styles.primary}>Jelajahi katalog <ArrowRight size={18} aria-hidden="true" /></a><a href={LATIN_AMERICA_BROCHURE} className={styles.secondary} download><Download size={17} aria-hidden="true" /> Unduh brosur ID / EN</a></div>
          <p className={styles.caption}>Permintaan penawaran dibuka. Tanggal dan harga final dikonfirmasi sesuai kebutuhan grup.</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.shell}`} id="pilihan-program" aria-labelledby="programmes-heading">
        <div className={styles.sectionIntro}><p className={styles.eyebrow}>DUA PILIHAN RANCANGAN</p><h2 id="programmes-heading">Dua cara menjelajahi Amerika Selatan.</h2><p>Fokus pada Peru, atau gabungkan empat negara dalam perjalanan Amerika Selatan. Setiap rancangan menjadi awal percakapan untuk menyusun itinerary dan penawaran grup.</p></div>
        <div className={styles.cards}>
          {LATIN_AMERICA_PROGRAMMES.map((programme) => <article className={styles.card} key={programme.id}>
            <Link scroll data-scroll-reset-after-navigation href={programme.href} className={styles.cardImage} aria-label={`Lihat ${programme.title}`}><Image src={programme.image} alt={programme.imageAlt} fill sizes="(max-width: 760px) 100vw, 50vw" /><span className={styles.cardArrow}><ArrowUpRight size={21} aria-hidden="true" /></span></Link>
            <div className={styles.cardBody}><p className={styles.eyebrow}>{programme.eyebrow}</p><h3><Link scroll data-scroll-reset-after-navigation href={programme.href}>{programme.title}</Link></h3><p>{programme.summary}</p><p className={styles.cardRoute}><MapPin size={16} aria-hidden="true" />{programme.route.join(" · ")}</p><div className={styles.cardBottom}><div><strong>Penawaran sesuai permintaan</strong><span>Program 2027 sedang dikembangkan</span></div><Link scroll data-scroll-reset-after-navigation href={programme.href} className={styles.textLink}>Lihat rincian <ArrowRight size={16} aria-hidden="true" /></Link></div></div>
          </article>)}
        </div>
      </section>

      <section className={styles.planning} aria-labelledby="process-heading"><div className={styles.shell}><p className={styles.eyebrow}>DARI IDE KE RENCANA</p><h2 id="process-heading">Rancang bersama Sundaf.</h2><div className={styles.steps}><article><span>01</span><h3>Ceritakan kebutuhan grup</h3><p>Pilih rute, perkiraan bulan, jumlah peserta, kota keberangkatan, serta kebutuhan perjalananmu.</p></article><article><span>02</span><h3>Tinjau rancangan & biaya</h3><p>Tim menyesuaikan itinerary dan meminta konfirmasi layanan, penerbangan serta ketersediaan.</p></article><article><span>03</span><h3>Putuskan setelah jelas</h3><p>Pelajari tanggal, harga akhir, cakupan layanan dan ketentuan tertulis sebelum melanjutkan pemesanan.</p></article></div><a className={styles.primary} href={latinAmericaEnquiryHref()} target="_blank" rel="noreferrer">Minta rancangan & penawaran <ArrowRight size={18} aria-hidden="true" /></a></div></section>

      <section className={`${styles.section} ${styles.shell}`} lang="en" aria-labelledby="trade-catalog-heading"><div className={styles.sectionIntro}><p className={styles.eyebrow}>FOR OUR TRAVEL TRADE PARTNERS</p><h2 id="trade-catalog-heading">Peru & South America for Indonesian travellers.</h2><p>Sundaf Trip, operated by CV Sundaf Holiday Group, is developing group programmes for 2027. Detailed regional supplier proposals have been received. We welcome enquiries and discussions to refine routing, service scope and commercial terms ahead of launch.</p><p>Programmes are under development. Dates, final duration, prices and availability will be confirmed by quotation. The standalone Peru programme requires a separate quotation.</p><div className={styles.actions}><Link scroll data-scroll-reset-after-navigation href="/company-profile" className={styles.textLink}>Company profile <ArrowUpRight size={17} aria-hidden="true" /></Link><a href="mailto:info@sundaftrip.com?subject=Peru%20and%20South%20America%202027%20trade%20enquiry" className={styles.textLink}>info@sundaftrip.com <ArrowUpRight size={17} aria-hidden="true" /></a></div></div></section>
      <div className={`${styles.shell} ${styles.credits}`} id="kredit-foto"><p>Fotografi destinasi: <a href="https://commons.wikimedia.org/wiki/File:Machu_Picchu_2019-10-13-5.jpg">Machu Picchu oleh Alexey Komarov</a>; <a href="https://commons.wikimedia.org/wiki/File:Sugarloaf_Sunrise_2.jpg">Rio de Janeiro oleh Donatas Dabravolskas</a>. <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Ukuran dan format disesuaikan; tampilan foto dapat terpotong mengikuti layar. Foto destinasi sebagai inspirasi perjalanan.</p></div>
    </div>
  );
}
