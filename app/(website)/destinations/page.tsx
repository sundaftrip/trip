import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/website/clean/PreserveScrollLink";
import { ArrowRight, ArrowUpRight, Compass, MapPin } from "lucide-react";

import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import { defaultOpenGraphImages, defaultTwitterImages } from "@/lib/site-metadata";
import { serializeJsonLd } from "@/lib/safe-json-ld";
import { PEXELS_TOUR_IMAGES } from "@/lib/tour-product-images";
import styles from "@/components/website/clean/DestinationIndex.module.css";

export const revalidate = 3600;

const PAGE_TITLE = "Destinasi Pilihan · Sundaf Trip";
const PAGE_DESC =
  "Jelajahi hub perjalanan Rusia dan Aurora, Asia Tengah, Vietnam, dan Jepang, serta panduan destinasi Sundaf Trip untuk traveler Indonesia.";

export const metadata: Metadata = {
  title: "Destinasi Pilihan",
  description: PAGE_DESC,
  alternates: { canonical: "https://sundaftrip.com/destinations" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    url: "https://sundaftrip.com/destinations",
    siteName: "Sundaf Trip",
    locale: "id_ID",
    type: "website",
    images: defaultOpenGraphImages("Destinasi Pilihan Sundaf Trip"),
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESC,
    images: defaultTwitterImages(),
  },
};

const REGIONAL_HUBS = [
  {
    href: "/destinations/rusia-aurora",
    name: "Rusia & Aurora",
    region: "Rusia, Murmansk & Lingkar Arktik",
    description:
      "Bandingkan jadwal aktif, rute kota, dokumentasi peserta, dan kebutuhan visa sebelum memilih perjalanan.",
    image: PEXELS_TOUR_IMAGES.russiaAuroraSea,
    imageAlt: "Aurora di atas lanskap bersalju Rusia",
  },
  {
    href: "/destinations/asia-tengah",
    name: "Asia Tengah",
    region: "Kazakhstan, Kyrgyzstan, Uzbekistan & Tajikistan",
    description:
      "Lihat pilihan perjalanan, alur antarnegara, musim, dan biaya wajib yang tersedia di data tour Sundaf.",
    image: PEXELS_TOUR_IMAGES.centralAsiaKazakhstanLake,
    imageAlt: "Danau pegunungan di Asia Tengah",
  },
  {
    href: "/destinations/vietnam",
    name: "Vietnam",
    region: "Vietnam Utara, Tengah & Selatan",
    description:
      "Pilih wilayah, durasi, dan gaya perjalanan dari katalog land tour yang sudah dimiliki Sundaf.",
    image: PEXELS_TOUR_IMAGES.vietnamNinhBinh,
    imageAlt: "Lanskap karst hijau di Ninh Binh, Vietnam",
  },
  {
    href: "/destinations/jepang",
    name: "Jepang",
    region: "Tokyo, Hokkaido & musim dingin",
    description:
      "Temukan jadwal, dokumentasi, dan panduan persiapan dari data tour Jepang Sundaf.",
    image: PEXELS_TOUR_IMAGES.japanHokkaido,
    imageAlt: "Lanskap musim dingin Hokkaido, Jepang",
  },
] as const;

const EXISTING_GUIDES = [
  {
    href: "/destinations/murmansk",
    name: "Murmansk",
    context: "Panduan tujuan Rusia",
  },
  {
    href: "/destinations/teriberka",
    name: "Teriberka",
    context: "Panduan tujuan Rusia",
  },
  {
    href: "/destinations/kazakhstan",
    name: "Kazakhstan",
    context: "Panduan tujuan Asia Tengah",
  },
] as const;

const destinationSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://sundaftrip.com/destinations#webpage",
  url: "https://sundaftrip.com/destinations",
  name: PAGE_TITLE,
  description: PAGE_DESC,
  inLanguage: "id-ID",
  isPartOf: { "@id": "https://sundaftrip.com#website" },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: REGIONAL_HUBS.map((destination, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: destination.name,
      url: `https://sundaftrip.com${destination.href}`,
    })),
  },
};

export default function DestinationsPage() {
  return (
    <div className={styles.page} id="main-content">
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Destinasi", url: "/destinations" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(destinationSchema) }}
      />

      <section className={styles.hero} aria-labelledby="destinations-title">
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>DESTINASI SUNDAF</p>
            <h1 id="destinations-title">Pilih kawasan. Mulai dari informasi yang tepat.</h1>
            <p className={styles.heroLead}>
              Masuk lewat hub regional untuk membandingkan jadwal aktif, gambaran
              rute, dokumentasi, panduan, dan informasi visa yang tersedia.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#hub-regional">
                Jelajahi kawasan
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              <Link className={styles.secondaryAction} href="/tours">
                Lihat semua tour
              </Link>
            </div>
          </div>

          <div className={styles.heroMosaic} aria-hidden="true">
            {REGIONAL_HUBS.map((destination, index) => (
              <div className={styles.heroTile} key={destination.href}>
                <Image
                  src={destination.image}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="(max-width: 700px) 45vw, 260px"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className={styles.regionalSection}
        id="hub-regional"
        aria-labelledby="regional-title"
      >
        <div className={styles.shell}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>EMPAT HUB REGIONAL</p>
              <h2 id="regional-title">Satu tempat untuk memahami tiap kawasan.</h2>
            </div>
            <p>
              Setiap hub menghubungkan informasi perjalanan yang relevan tanpa
              mengubah jadwal, harga, atau data tour yang sudah dipublikasikan.
            </p>
          </div>

          <div className={styles.regionGrid}>
            {REGIONAL_HUBS.map((destination) => (
              <article className={styles.regionCard} key={destination.href}>
                <Link
                  className={styles.regionLink}
                  href={destination.href}
                  aria-label={`Jelajahi hub ${destination.name}`}
                >
                  <div className={styles.regionImage}>
                    <Image
                      src={destination.image}
                      alt={destination.imageAlt}
                      fill
                      sizes="(max-width: 700px) calc(100vw - 32px), (max-width: 1100px) 50vw, 560px"
                    />
                    <span className={styles.regionArrow} aria-hidden="true">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                  <div className={styles.regionBody}>
                    <p className={styles.regionMeta}>
                      <MapPin size={13} aria-hidden="true" />
                      {destination.region}
                    </p>
                    <h3>{destination.name}</h3>
                    <p>{destination.description}</p>
                    <span className={styles.textLink}>
                      Buka hub regional
                      <ArrowRight size={15} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.guideSection} aria-labelledby="guide-title">
        <div className={`${styles.shell} ${styles.guideLayout}`}>
          <div className={styles.guideIntro}>
            <p className={styles.eyebrow}>PANDUAN YANG SUDAH TERSEDIA</p>
            <h2 id="guide-title">Perlu melihat tujuan yang lebih spesifik?</h2>
            <p>
              Tiga panduan ini tetap tersedia di alamat sebelumnya, lengkap
              dengan konten dan tautan yang sudah dimiliki Sundaf.
            </p>
          </div>
          <div className={styles.guideLinks}>
            {EXISTING_GUIDES.map((guide) => (
              <Link href={guide.href} key={guide.href}>
                <span>
                  <small>{guide.context}</small>
                  <strong>{guide.name}</strong>
                </span>
                <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="destination-cta-title">
        <div className={styles.shell}>
          <div>
            <p className={styles.eyebrow}>BELUM MENENTUKAN RUTE?</p>
            <h2 id="destination-cta-title">Mulai dari kebutuhan perjalananmu.</h2>
            <p>
              Sampaikan kawasan, waktu, dan jumlah peserta. Tim Sundaf akan
              membantu meninjau opsi perjalanan yang tersedia.
            </p>
          </div>
          <Link href="/custom-trip">
            <Compass size={17} aria-hidden="true" />
            Rancang private trip
          </Link>
        </div>
      </section>
    </div>
  );
}
