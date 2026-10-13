import { withPageSocialMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/website/clean/PreserveScrollLink";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { publicTourVisibilityWhere } from "@/lib/public-tours";
import { getPublicTourState } from "@/lib/tour-order";
import { normalizeTourDisplayTitle } from "@/lib/tour-display";
import { PEXELS_TOUR_IMAGES } from "@/lib/tour-product-images";
import { buildWhatsAppHref } from "@/lib/utils";
import { mandatoryAddOnsTotal } from "@/lib/tour-commerce";
import { resolveCanadaRockiesAddOns } from "@/lib/canada-catalog-preview";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import CleanTourCard from "@/components/website/clean/CleanTourCard";
import StableDetails from "@/components/website/clean/StableDetails";
import RussiaGuideLinks from "@/components/website/clean/RussiaGuideLinks";
import styles from "@/components/website/clean/DestinationHub.module.css";
import doc from "@/components/website/clean/DocFormat.module.css";

export const revalidate = 300;

type DestinationConfig = {
  name: string;
  eyebrow: string;
  title: string;
  intro: string;
  hero: string;
  imageAlt: string;
  terms: string[];
  bestTime: string;
  route: string;
  practical: string[];
  visaHref: string;
  faqs: Array<{ question: string; answer: string }>;
};

const DESTINATIONS: Record<string, DestinationConfig> = {
  "rusia-aurora": {
    name: "Rusia & Aurora",
    eyebrow: "RUSIA, MURMANSK & LINGKAR ARKTIK",
    title: "Rusia dan Aurora, dengan detail praktis sejak awal.",
    intro: "Bandingkan jadwal aktif, rute kota, dokumentasi peserta, dan kebutuhan visa sebelum memilih perjalanan.",
    hero: PEXELS_TOUR_IMAGES.russiaAuroraSea,
    imageAlt: "Aurora di atas lanskap bersalju Rusia",
    terms: ["rusia", "russia", "aurora", "murmansk", "teriberka"],
    bestTime: "Musim aurora umumnya diburu saat malam lebih panjang. Kondisi langit tetap alami dan tidak dapat dijamin.",
    route: "Rute Sundaf dapat menggabungkan kota besar Rusia dengan Murmansk atau Teriberka, sesuai jadwal dan musim yang dipublikasikan.",
    practical: ["Visa dan dokumen perlu disiapkan lebih awal.", "Pakaian musim dingin harus disesuaikan dengan suhu aktual.", "Aktivitas aurora bergantung pada cuaca dan kondisi langit."],
    visaHref: "/visa/russia",
    faqs: [
      { question: "Apakah Aurora pasti terlihat?", answer: "Tidak. Aurora adalah fenomena alam. Tim menyusun kesempatan pengamatan berdasarkan rute dan kondisi, tanpa menjamin kemunculannya." },
      { question: "Apakah visa Rusia dibantu?", answer: "Layanan dan dokumen yang dapat dibantu mengikuti informasi visa terbaru yang dipublikasikan Sundaf." },
    ],
  },
  "asia-tengah": {
    name: "Asia Tengah",
    eyebrow: "KAZAKHSTAN, KYRGYZSTAN, UZBEKISTAN & TAJIKISTAN",
    title: "Kota Jalur Sutra dan bentang alam dalam satu rute.",
    intro: "Lihat tour aktif, alur antarnegara, musim, dan biaya wajib yang tersedia di data perjalanan Sundaf.",
    hero: PEXELS_TOUR_IMAGES.centralAsiaKazakhstanLake,
    imageAlt: "Danau pegunungan dan bentang alam Asia Tengah",
    terms: ["asia tengah", "central asia", "kazakh", "kyrgyz", "uzbek", "tajik"],
    bestTime: "Musim dan suhu berbeda antarkota. Pilih tanggal berdasarkan rute aktif dan intensitas perjalanan yang kamu inginkan.",
    route: "Rute dapat bergerak lintas negara dan kota. Detail transportasi, visa, serta perpindahan harus dibaca di halaman tour terkait.",
    practical: ["Perjalanan lintas negara membutuhkan pemeriksaan dokumen per negara.", "Durasi berkendara dapat berbeda antarrute.", "Biaya wajib harus dibaca bersama harga paket."],
    visaHref: "/visa",
    faqs: [
      { question: "Apakah semua negara Asia Tengah bebas visa?", answer: "Aturan berbeda per negara dan dapat berubah. Gunakan halaman visa Sundaf dan konfirmasi kembali sebelum booking." },
      { question: "Apakah rute ini cocok untuk peserta senior?", answer: "Kecocokan bergantung pada durasi berkendara, medan, dan ritme itinerary. Sampaikan kebutuhan mobilitas saat konsultasi." },
    ],
  },
  vietnam: {
    name: "Vietnam",
    eyebrow: "VIETNAM UTARA, TENGAH & SELATAN",
    title: "Private trip Vietnam dengan tanggal yang lebih fleksibel.",
    intro: "Pilih wilayah, durasi, dan gaya perjalanan dari katalog land tour yang sudah dimiliki Sundaf.",
    hero: PEXELS_TOUR_IMAGES.vietnamNinhBinh,
    imageAlt: "Lanskap karst hijau di Ninh Binh, Vietnam",
    terms: ["vietnam", "hanoi", "sapa", "danang", "hoi an", "phu quoc"],
    bestTime: "Cuaca Vietnam berbeda antara utara, tengah, dan selatan. Waktu terbaik harus dilihat berdasarkan wilayah yang dipilih.",
    route: "Land tour privat dapat difokuskan pada satu wilayah atau digabungkan ketika durasi dan koneksi perjalanan memungkinkan.",
    practical: ["Harga land tour dapat belum memasukkan tiket internasional.", "Hotel dan aktivitas dikonfirmasi sesuai tanggal.", "Rute privat dapat disesuaikan setelah brief peserta diterima."],
    visaHref: "/visa/vietnam",
    faqs: [
      { question: "Apakah tanggal bisa dipilih sendiri?", answer: "Untuk produk private atau land tour, tanggal dapat diajukan dan dikonfirmasi berdasarkan ketersediaan." },
      { question: "Apakah tiket pesawat termasuk?", answer: "Komponen paket berbeda per tour. Periksa bagian termasuk dan belum termasuk sebelum mengirim permintaan." },
    ],
  },
  jepang: {
    name: "Jepang",
    eyebrow: "TOKYO, HOKKAIDO & MUSIM DINGIN",
    title: "Jepang yang mudah dibandingkan sebelum booking.",
    intro: "Temukan jadwal, dokumentasi, dan panduan persiapan dari data tour Jepang Sundaf.",
    hero: PEXELS_TOUR_IMAGES.japanHokkaido,
    imageAlt: "Lanskap musim dingin Hokkaido, Jepang",
    terms: ["jepang", "japan", "tokyo", "hokkaido", "osaka", "kyoto"],
    bestTime: "Pilih musim berdasarkan pengalaman yang dicari. Jadwal aktif menampilkan tanggal dan status terbaru yang tersedia.",
    route: "Rute dapat menggabungkan kota besar dengan wilayah musim dingin, sesuai paket yang sedang dipublikasikan.",
    practical: ["Visa dan persyaratan perjalanan harus dikonfirmasi sebelum berangkat.", "Musim dingin membutuhkan perlengkapan yang sesuai.", "Tour penuh tetap ditampilkan sebagai status penuh, bukan trip terdahulu."],
    visaHref: "/visa/japan",
    faqs: [
      { question: "Bagaimana jika jadwal Jepang penuh?", answer: "Gunakan daftar tunggu atau konsultasikan opsi tanggal dan rute lain dengan tim Sundaf." },
      { question: "Apakah visa Jepang dibantu?", answer: "Bantuan mengikuti jenis visa, profil pemohon, dan layanan yang sedang tersedia. Persetujuan tetap merupakan kewenangan pihak penerbit visa." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DESTINATIONS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = DESTINATIONS[slug];
  if (!destination) notFound();
  const title = `${destination.name} · Destinasi Sundaf Trip`;
  return withPageSocialMetadata({
    title,
    description: destination.intro,
    alternates: { canonical: `https://sundaftrip.com/destinations/${slug}` },
    openGraph: {
      title,
      description: destination.intro,
      url: `https://sundaftrip.com/destinations/${slug}`,
      siteName: "Sundaf Trip",
      locale: "id_ID",
      type: "website",
      images: [{ url: destination.hero, alt: destination.imageAlt }],
    },
  });
}

export default async function DestinationHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = DESTINATIONS[slug];
  if (!destination) notFound();

  const containsFilters = destination.terms.flatMap((term) => [
    { title: { contains: term, mode: "insensitive" as const } },
    { country: { contains: term, mode: "insensitive" as const } },
    { cityHighlight: { contains: term, mode: "insensitive" as const } },
  ]);
  const now = new Date();
  const [tourRows, posts, companyRows] = await Promise.all([
    prisma.tour.findMany({
      where: {
        AND: [
          publicTourVisibilityWhere(),
          { OR: containsFilters },
          { OR: [{ tripDate: null }, { tripDate: { gte: now } }] },
        ],
      },
      orderBy: { tripDate: "asc" },
      take: 6,
      select: {
        id: true, slug: true, title: true, country: true, cityHighlight: true,
        price: true, promoPrice: true, seatsLeft: true, tripDate: true,
        duration: true, heroImg: true, badge: true, status: true, pinned: true,
        gallery: true, addOns: true,
      },
    }),
    prisma.blog.findMany({
      where: {
        published: true,
        OR: destination.terms.flatMap((term) => [
          { title: { contains: term, mode: "insensitive" as const } },
          { category: { contains: term, mode: "insensitive" as const } },
        ]),
      },
      orderBy: { date: "desc" },
      take: 3,
      select: { id: true, slug: true, title: true, excerpt: true, cover: true, readTime: true },
    }),
    prisma.companyInfo.findMany({ where: { key: { in: ["company_whatsapp"] } } }),
  ]);

  const tours = tourRows.map((tour) => {
    return {
      ...tour,
      title: normalizeTourDisplayTitle(tour.title),
      tripDate: tour.tripDate?.toISOString() ?? null,
      mandatoryTotal: mandatoryAddOnsTotal(resolveCanadaRockiesAddOns(tour.addOns, tour.slug)),
      state: getPublicTourState(tour, now),
    };
  });
  const whatsapp = companyRows.find((row) => row.key === "company_whatsapp")?.value;
  const waHref = buildWhatsAppHref(
    whatsapp || "6281775202759",
    `Halo Sundaf Trip, saya ingin konsultasi perjalanan ${destination.name}.`,
  );
  const documentation = tourRows.flatMap((tour) => tour.gallery).filter(Boolean).slice(0, 4);

  return (
    <div className={styles.page} id="main-content">
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Destinasi", url: "/destinations" },
          { name: destination.name, url: `/destinations/${slug}` },
        ]}
      />
      <section className={styles.hero}>
        <Image src={destination.hero} alt={destination.imageAlt} fill priority sizes="100vw" />
        <div aria-hidden="true" />
        <div className={styles.shell}>
          <p>{destination.eyebrow}</p>
          <h1 className={styles.heroTitle}>{destination.title}</h1>
          <span>{destination.intro}</span>
          <a href="#tour-aktif">Lihat perjalanan</a>
        </div>
      </section>

      <section className={styles.facts} aria-labelledby="destination-overview-title">
        <div className={`${styles.shell} ${styles.factGrid}`}>
          <article className={doc.boxSage}><span className={doc.subhead}>Waktu perjalanan</span><h2 id="destination-overview-title" className={styles.boxTitle}>Kapan waktu yang masuk akal?</h2><p>{destination.bestTime}</p></article>
          <article className={doc.boxSand}><span className={doc.subhead}>Gambaran rute</span><h2 className={styles.boxTitle}>Bagaimana alurnya?</h2><p>{destination.route}</p></article>
        </div>
      </section>

      <section className={styles.section} id="tour-aktif" aria-labelledby="destination-tours-title">
        <div className={styles.shell}>
          <h2 id="destination-tours-title" className={doc.tag}>Perjalanan {destination.name}</h2>
          {tours.length ? (
            <div className={styles.tourRail}>{tours.map((tour) => <CleanTourCard key={tour.id} tour={tour} />)}</div>
          ) : (
            <div className={`${doc.boxSand} ${styles.empty}`}><p>Belum ada jadwal tetap yang cocok untuk hub ini.</p><Link className={doc.button} href="/custom-trip">Rancang private trip</Link></div>
          )}
          {slug === "rusia-aurora" && <RussiaGuideLinks />}
        </div>
      </section>

      <section className={`${styles.section} ${styles.practical}`} aria-labelledby="practical-title">
        <div className={styles.shell}>
          <div className={`${doc.boxSage} ${styles.practicalGrid}`}>
            <div><p className={doc.subhead}>Sebelum memilih</p><h2 id="practical-title" className={styles.boxTitle}>Hal praktis yang perlu dibaca</h2></div>
            <ul>{destination.practical.map((item) => <li key={item}>{item}</li>)}</ul>
            <Link className={doc.textLink} href={destination.visaHref}>Lihat informasi visa</Link>
          </div>
        </div>
      </section>

      {documentation.length > 0 && (
        <section className={styles.section} aria-labelledby="documentation-title">
          <div className={styles.shell}>
            <h2 id="documentation-title" className={doc.tag}>Dokumentasi perjalanan</h2>
            <p className={styles.sectionCopy}>Foto ini berasal dari galeri tour Sundaf. Kredit dan sumber aset tetap mengikuti catatan media yang sudah dimiliki tim.</p>
            <div className={styles.mosaic}>{documentation.map((image, index) => <Image key={image} src={image} alt={`${destination.name}, dokumentasi perjalanan ${index + 1}`} width={900} height={700} sizes="(max-width: 700px) 100vw, 50vw" />)}</div>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className={styles.section} aria-labelledby="guides-title">
          <div className={styles.shell}>
            <h2 id="guides-title" className={doc.tag}>Baca sebelum berangkat</h2>
            <div className={styles.articleGrid}>{posts.map((post) => (
              <article key={post.id}>
                <p>{post.readTime || "Panduan perjalanan"}</p>
                <h3 className={styles.articleTitle}><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
                {post.excerpt && <span>{post.excerpt}</span>}
              </article>
            ))}</div>
          </div>
        </section>
      )}

      <section className={styles.section} aria-labelledby="destination-faq-title">
        <div className={styles.shell}>
          <h2 id="destination-faq-title" className={doc.tag}>Yang sering ditanyakan</h2>
          <div className={styles.faqs}>{destination.faqs.map((faq) => <StableDetails key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></StableDetails>)}</div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.shell}><div className={`${doc.boxSand} ${styles.ctaBox}`}><div><p className={doc.subhead}>Masih bingung pilih rute?</p><h2 className={styles.boxTitle}>Ceritakan tanggal dan jumlah peserta.</h2><span>Tim Sundaf akan membantu menyaring pilihan yang tersedia tanpa menjanjikan kursi sebelum dikonfirmasi.</span></div><a className={doc.button} href={waHref} data-analytics-event="whatsapp_consultation_click">Konsultasi via WhatsApp</a></div></div>
      </section>
    </div>
  );
}
