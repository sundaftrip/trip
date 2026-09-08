import Image from "next/image";
import Link from "@/components/website/clean/PreserveScrollLink";
import { ArrowRight, ArrowUpRight, Download, MapPin } from "lucide-react";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import { LATIN_AMERICA_BROCHURE, LATIN_AMERICA_PROGRAMMES, LATIN_AMERICA_STATUS, latinAmericaEnquiryHref, latinAmericaMetadata } from "@/lib/latin-america";
import { serializeJsonLd } from "@/lib/safe-json-ld";
import styles from "@/components/website/LatinAmerica.module.css";

export const metadata = latinAmericaMetadata("Katalog Amerika Latin & Peru 2027", "Tour grup Peru dan Amerika Selatan untuk 2027: Lima, Cusco, Machu Picchu, Brasil, Kolombia dan Chile. Hubungi Sundaf Trip untuk itinerary dan harga.", "/amerika-latin");

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
          <p className={styles.eyebrow}>TOUR GRUP · 2027</p>
          <h1>Peru &<br /><span>Amerika Selatan</span></h1>
          <p className={styles.lead}>Machu Picchu, Rio de Janeiro, dan air terjun Iguazu. Pilih perjalanan khusus Peru atau gabungkan Brasil, Kolombia, Peru, dan Chile bersama grupmu.</p>
          <p className={styles.status}>{LATIN_AMERICA_STATUS}</p>
          <div className={styles.actions}><a href="#pilihan-program" className={styles.primary}>Lihat pilihan perjalanan <ArrowRight size={18} aria-hidden="true" /></a><a href={LATIN_AMERICA_BROCHURE} className={styles.secondary} download><Download size={17} aria-hidden="true" /> Unduh brosur ID / EN</a></div>
          <p className={styles.caption}>Program 2027 sedang kami susun. Kirim rencana tanggal dan jumlah peserta untuk meminta itinerary serta harga.</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.shell}`} id="pilihan-program" aria-labelledby="programmes-heading">
        <div className={styles.sectionIntro}><p className={styles.eyebrow}>PERU ATAU EMPAT NEGARA</p><h2 id="programmes-heading">Pilihan perjalanan</h2><p>Perjalanan Peru berfokus pada Lima, Cusco dan Machu Picchu. Pilihan empat negara menambahkan Brasil, Kolombia dan Chile.</p></div>
        <div className={styles.cards}>
          {LATIN_AMERICA_PROGRAMMES.map((programme) => <article className={styles.card} key={programme.id}>
            <Link scroll data-scroll-reset-after-navigation href={programme.href} className={styles.cardImage} aria-label={`Lihat ${programme.title}`}><Image src={programme.image} alt={programme.imageAlt} fill sizes="(max-width: 760px) 100vw, 50vw" /><span className={styles.cardArrow}><ArrowUpRight size={21} aria-hidden="true" /></span></Link>
            <div className={styles.cardBody}><p className={styles.eyebrow}>{programme.eyebrow}</p><h3><Link scroll data-scroll-reset-after-navigation href={programme.href}>{programme.title}</Link></h3><p>{programme.summary}</p><p className={styles.cardRoute}><MapPin size={16} aria-hidden="true" />{programme.route.join(" · ")}</p><div className={styles.cardBottom}><div><strong>Harga sesuai permintaan</strong><span>Untuk grup sendiri</span></div><Link scroll data-scroll-reset-after-navigation href={programme.href} className={styles.textLink}>Lihat rincian <ArrowRight size={16} aria-hidden="true" /></Link></div></div>
          </article>)}
        </div>
      </section>

      <section className={styles.planning} aria-labelledby="process-heading">
        <div className={`${styles.shell} ${styles.twoColumns}`}>
          <div><p className={styles.eyebrow}>PERJALANAN SESUAI PERMINTAAN</p><h2 id="process-heading">Mau bawa grup sendiri?</h2></div>
          <div><p>Kirim perkiraan bulan, jumlah peserta, dan kota keberangkatan. Kami akan menyiapkan itinerary serta penawaran hotel, transportasi, dan penerbangan untuk grupmu.</p><div className={styles.actions}><a className={styles.primary} href={latinAmericaEnquiryHref()} target="_blank" rel="noreferrer">Tanya itinerary & harga <ArrowRight size={18} aria-hidden="true" /></a></div></div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.shell}`} lang="en" aria-labelledby="trade-catalog-heading"><div className={styles.sectionIntro}><p className={styles.eyebrow}>TRAVEL TRADE ENQUIRIES</p><h2 id="trade-catalog-heading">Sundaf Trip, Indonesia</h2><p>We are adding Peru and South America to our outbound portfolio for Indonesian groups. Since August 2026, we have requested group quotations and received detailed proposals for a Brazil, Colombia, Peru and Chile itinerary.</p><p>We accept enquiries for 2027 and are reviewing ground services, hotels, rail arrangements and flights. A standalone Peru quotation is still required. Final dates, duration, pricing and availability are confirmed in a written offer. Sundaf Trip operates under CV Sundaf Holiday Group.</p><div className={styles.actions}><Link scroll data-scroll-reset-after-navigation href="/company-profile" className={styles.textLink}>Company profile <ArrowUpRight size={17} aria-hidden="true" /></Link><a href="mailto:info@sundaftrip.com?subject=Peru%20and%20South%20America%202027%20trade%20enquiry" className={styles.textLink}>info@sundaftrip.com <ArrowUpRight size={17} aria-hidden="true" /></a></div></div></section>
      <div className={`${styles.shell} ${styles.credits}`} id="kredit-foto"><p>Fotografi destinasi: <a href="https://commons.wikimedia.org/wiki/File:Machu_Picchu_2019-10-13-5.jpg">Machu Picchu oleh Alexey Komarov</a>; <a href="https://commons.wikimedia.org/wiki/File:Sugarloaf_Sunrise_2.jpg">Rio de Janeiro oleh Donatas Dabravolskas</a>. <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Ukuran dan format disesuaikan; tampilan foto dapat terpotong mengikuti layar. Foto destinasi sebagai inspirasi perjalanan.</p></div>
    </div>
  );
}
