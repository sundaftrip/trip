import Image from "next/image";
import Link from "./PreserveScrollLink";
import {
  ArrowRight,
  Clock,
  Compass,
  FileCheck,
  MessageCircle,
} from "lucide-react";
import {
  HOME_COPY,
  LEGACY_HOME_COPY,
  replaceLegacyHomepageCopy,
} from "@/lib/home-copy";
import { getHomeFaqs, type HomeFaqItem } from "@/lib/home-faqs";
import { getTourProductImage, PEXELS_TOUR_IMAGES } from "@/lib/tour-product-images";
import { buildWhatsAppHref, cldOptimize } from "@/lib/utils";
import { TextWithAuroraAccent } from "@/components/website/AuroraText";
import type { CleanTour } from "./CleanTourCard";
import HomeFaqs from "./home/HomeFaqs";
import HomeReviews from "./home/HomeReviews";
import HomeSearchForm, { type HomeSearchOption } from "./home/HomeSearchForm";
import HomeTourRail from "./home/HomeTourRail";
import styles from "./home/CleanHome.module.css";

export type CleanHomeTestimonial = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  date?: Date | string | null;
};

export type CleanHomePost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover: string | null;
  category: string | null;
  date: Date | string;
  author: string | null;
  readTime: string | null;
};

export type CleanHomeFaq = HomeFaqItem;

export type CleanHomeTextValue =
  | string
  | {
      id?: string;
      valueId?: string;
      en?: string;
    };

export type CleanHomeProps = {
  tours: CleanTour[];
  testimonials: CleanHomeTestimonial[];
  posts: CleanHomePost[];
  company: Record<string, string>;
  texts?: Record<string, CleanHomeTextValue | undefined>;
  heroImage?: string;
};

type DestinationOption = HomeSearchOption & {
  image?: string;
};

const MONTH_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

function readText(
  texts: CleanHomeProps["texts"],
  keys: string[],
  fallback: string,
) {
  for (const key of keys) {
    const value = texts?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (value && typeof value === "object") {
      const localizedValue = value.id ?? value.valueId;
      if (localizedValue?.trim()) return localizedValue.trim();
    }
  }
  return fallback;
}

function destinationForTour(tour: CleanTour): DestinationOption {
  const haystack = `${tour.country} ${tour.cityHighlight ?? ""} ${tour.title}`.toLocaleLowerCase("id-ID");

  if (/russia|rusia|aurora|murmansk|moscow|moskow|petersburg/.test(haystack)) {
    return { value: "rusia", label: "Rusia & Aurora", image: getTourProductImage(tour) };
  }
  if (/asia tengah|central asia|4[- ]?tan|kazakh|kyrgyz|uzbek|tajik|turkmen/.test(haystack)) {
    return { value: "asia-tengah", label: "Asia Tengah", image: getTourProductImage(tour) };
  }
  if (/vietnam|hanoi|sapa|halong|ha long|ninh binh|hoi an|da nang|phu quoc/.test(haystack)) {
    return { value: "vietnam", label: "Vietnam", image: getTourProductImage(tour) };
  }
  if (/japan|jepang|hokkaido|tokyo|sapporo|otaru/.test(haystack)) {
    return { value: "jepang", label: "Jepang", image: getTourProductImage(tour) };
  }

  const label = tour.country.trim() || "Destinasi lainnya";
  const value = label
    .toLocaleLowerCase("id-ID")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return {
    value: value || "lainnya",
    label,
    image: getTourProductImage(tour),
  };
}

function getDestinationOptions(tours: CleanTour[]) {
  const options = new Map<string, DestinationOption>();

  tours
    .filter((tour) => tour.state === "bookable")
    .forEach((tour) => {
      const option = destinationForTour(tour);
      if (!options.has(option.value)) options.set(option.value, option);
    });

  return Array.from(options.values());
}

function destinationImage(
  destinations: DestinationOption[],
  value: string,
  fallback: string,
) {
  return destinations.find((destination) => destination.value === value)?.image || fallback;
}

function getMonthOptions(tours: CleanTour[]): HomeSearchOption[] {
  return Array.from(
    new Set(
      tours
        .filter((tour) => tour.state === "bookable" && tour.tripDate)
        .map((tour) => tour.tripDate!.slice(0, 7)),
    ),
  )
    .sort()
    .map((month) => ({
      value: month,
      label: MONTH_FORMATTER.format(new Date(`${month}-02T00:00:00+07:00`)),
    }));
}

function formatPostDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : DATE_FORMATTER.format(date);
}

export default function CleanHome({
  tours,
  testimonials,
  posts,
  company,
  texts,
  heroImage = "/images/home/murmansk-aurora-group.png",
}: CleanHomeProps) {
  const scheduledTours = tours
    .filter((tour) => tour.state === "bookable" || tour.state === "sold")
    .slice(0, 6);
  const destinationOptions = getDestinationOptions(tours);
  const monthOptions = getMonthOptions(tours);
  const nib = company.company_nib || "1601260060842";
  const legalName = company.company_legal_name || "CV Sundaf Holiday Group";
  const whatsappNumber = company.company_whatsapp || "+62 817-7520-2759";
  const waHref =
    buildWhatsAppHref(
      whatsappNumber,
      "Halo Sundaf Trip, saya ingin konsultasi untuk memilih perjalanan yang sesuai.",
    ) || "/contact";
  const resolvedFaqs = getHomeFaqs(nib, legalName);
  const journalPosts = posts.slice(0, 3);

  const heroEyebrow = replaceLegacyHomepageCopy(
    readText(texts, ["home_hero_eyebrow"], HOME_COPY.heroEyebrow),
    LEGACY_HOME_COPY.heroEyebrow,
    HOME_COPY.heroEyebrow,
  );
  const heroTitle = replaceLegacyHomepageCopy(
    readText(texts, ["home_hero_title"], HOME_COPY.heroTitle),
    LEGACY_HOME_COPY.heroTitle,
    HOME_COPY.heroTitle,
  );
  const heroBody = replaceLegacyHomepageCopy(
    readText(texts, ["home_hero_body", "home_hero_subtitle"], HOME_COPY.heroBody),
    LEGACY_HOME_COPY.heroBody,
    HOME_COPY.heroBody,
  );
  const resolvedHeroImage = getTourProductImage({
    title: "Sundaf Trip Aurora",
    country: "Rusia",
    heroImg: readText(texts, ["home_hero_image", "home_hero_img"], heroImage),
  });
  const resolvedHeroAlt = readText(
    texts,
    ["home_hero_image_alt"],
    "Rombongan Sundaf Trip menyaksikan Aurora di Murmansk",
  );

  const russiaImage = destinationImage(
    destinationOptions,
    "rusia",
    PEXELS_TOUR_IMAGES.russiaAuroraSea,
  );
  const centralAsiaImage = destinationImage(
    destinationOptions,
    "asia-tengah",
    PEXELS_TOUR_IMAGES.centralAsiaKazakhstanLake,
  );
  const vietnamImage = destinationImage(
    destinationOptions,
    "vietnam",
    PEXELS_TOUR_IMAGES.vietnamNinhBinh,
  );

  return (
    <div className={styles.home}>
      <div id="main-content" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="home-hero-title">
          <Image
            src={resolvedHeroImage}
            alt={resolvedHeroAlt}
            fill
            priority
            fetchPriority="high"
            quality={90}
            sizes="100vw"
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay} aria-hidden="true" />
          <div className={`${styles.shell} ${styles.heroShell}`}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrowLight}>{heroEyebrow}</p>
              <h1 id="home-hero-title">
                <TextWithAuroraAccent
                  text={heroTitle}
                  phrase="cerita yang berbeda."
                />
              </h1>
              <p>{heroBody}</p>
            </div>
          </div>
        </section>

        <div className={styles.finderZone}>
          <div className={styles.shell}>
            <HomeSearchForm
              destinations={destinationOptions}
              months={monthOptions}
            />
          </div>
        </div>

        <section className={`${styles.section} ${styles.tourSection}`} aria-labelledby="active-tours-title">
          <div className={styles.shell}>
            <div className={styles.headingRow}>
              <div className={styles.sectionHeading}>
                <p className={styles.eyebrow}>JADWAL TERDEKAT</p>
                <h2 id="active-tours-title">Rute yang siap kamu ceritakan sepulangnya.</h2>
                <p>Pilih perjalanan yang sudah memiliki tanggal, itinerary, dan gambaran biaya yang jelas.</p>
              </div>
              <Link className={styles.desktopSectionLink} href="/tours">
                Lihat semua jadwal <ArrowRight aria-hidden="true" />
              </Link>
            </div>

            {scheduledTours.length ? (
              <HomeTourRail tours={scheduledTours} />
            ) : (
              <div className={styles.emptyState}>
                <p>Jadwal open trip baru sedang disiapkan.</p>
                <Link href="/custom-trip">Lihat pilihan private trip</Link>
              </div>
            )}

            <Link className={styles.mobileSectionLink} href="/tours">
              Lihat semua jadwal <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.destinationSection}`}
          aria-labelledby="destinations-title"
        >
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <h2 id="destinations-title">Pilih rute yang tidak biasa.</h2>
              <p>Dari langit malam Murmansk sampai kota-kota Jalur Sutra, setiap rute kami siapkan untuk traveler Indonesia.</p>
            </div>

            <div className={styles.destinationMosaic}>
              <Link className={styles.destinationLead} href="/tours?destination=rusia">
                <Image
                  src={russiaImage}
                  alt="Aurora di langit malam Rusia"
                  fill
                  sizes="(max-width: 759px) calc(100vw - 40px), 58vw"
                />
                <span className={styles.destinationShade} aria-hidden="true" />
                <span className={styles.destinationLabel}>
                  <strong>Rusia &amp; Aurora</strong>
                  <small>Lihat rute Rusia</small>
                </span>
              </Link>

              <Link href="/tours?destination=asia-tengah">
                <Image
                  src={centralAsiaImage}
                  alt="Pegunungan dan danau di Asia Tengah"
                  fill
                  sizes="(max-width: 759px) calc(50vw - 25px), 27vw"
                />
                <span className={styles.destinationShade} aria-hidden="true" />
                <span className={styles.destinationLabel}>
                  <strong>Asia Tengah</strong>
                  <small>Jelajahi Asia Tengah</small>
                </span>
              </Link>

              <Link href="/tours?destination=vietnam">
                <Image
                  src={vietnamImage}
                  alt="Lanskap hijau Ninh Binh, Vietnam"
                  fill
                  sizes="(max-width: 759px) calc(50vw - 25px), 27vw"
                />
                <span className={styles.destinationShade} aria-hidden="true" />
                <span className={styles.destinationLabel}>
                  <strong>Vietnam</strong>
                  <small>Lihat rute Vietnam</small>
                </span>
              </Link>

              <Link className={styles.destinationPrivate} href="/custom-trip">
                <Image
                  src={PEXELS_TOUR_IMAGES.vietnamGoldenBridge}
                  alt="Pemandangan pegunungan untuk inspirasi private trip"
                  fill
                  sizes="(max-width: 759px) calc(100vw - 40px), 58vw"
                />
                <span className={styles.destinationShade} aria-hidden="true" />
                <span className={styles.destinationLabel}>
                  <strong>Private &amp; Custom Trip</strong>
                  <small>Rancang perjalanan privat</small>
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.benefitSection}`} aria-labelledby="benefits-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>CARA KERJA SUNDAF</p>
              <h2 id="benefits-title">Kami urus yang rumit. Kamu nikmati yang penting.</h2>
            </div>

            <div className={styles.benefitGrid}>
              <article>
                <div className={styles.benefitTitle}>
                  <FileCheck aria-hidden="true" />
                  <h3>Visa &amp; dokumen dibantu</h3>
                </div>
                <p>Kami cek kebutuhan dokumen dan menjelaskan alurnya sebelum pengajuan dimulai.</p>
              </article>
              <article>
                <div className={styles.benefitTitle}>
                  <Clock aria-hidden="true" />
                  <h3>Itinerary punya ruang bernapas</h3>
                </div>
                <p>Rute disusun agar kamu tidak hanya datang, foto, lalu bergegas pindah kota.</p>
              </article>
              <article>
                <div className={styles.benefitTitle}>
                  <MessageCircle aria-hidden="true" />
                  <h3>Persiapan dari awal</h3>
                </div>
                <p>Info keberangkatan, kebutuhan cuaca, dan detail pertemuan dibagikan sebelum hari H.</p>
              </article>
              <article>
                <div className={styles.benefitTitle}>
                  <Compass aria-hidden="true" />
                  <h3>Didampingi selama perjalanan</h3>
                </div>
                <p>Tour leader membantu koordinasi grup, supaya kamu bisa fokus pada pengalaman di perjalanan.</p>
              </article>
            </div>
          </div>
        </section>

        <HomeReviews items={testimonials} />

        <section
          className={`${styles.section} ${styles.faqSection}`}
          aria-labelledby="faq-title"
        >
          <div className={`${styles.shell} ${styles.faqLayout}`}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>BIAR MAKIN YAKIN</p>
              <h2 id="faq-title">Yang perlu kamu tahu sebelum bilang, “gas”.</h2>
              <p>Soal legalitas, harga, visa, sampai perubahan rencana, kami jawab terus terang di sini.</p>
            </div>
            <HomeFaqs items={resolvedFaqs} />
          </div>
        </section>

        <section className={styles.privateSection} aria-labelledby="private-trip-title">
          <div className={styles.shell}>
            <div className={styles.privatePanel}>
              <div>
                <p className={styles.eyebrowLight}>PRIVATE &amp; CUSTOM TRIP</p>
                <h2 id="private-trip-title">Punya tanggal sendiri? Kita rancang rutenya bersama.</h2>
                <p>
                  Kirim tujuan, jumlah peserta, durasi, dan kisaran budget. Kami akan
                  menyiapkan pilihan rute yang masuk akal untuk cara kamu bepergian.
                </p>
              </div>
              <Link
                href="/custom-trip"
                data-analytics-event="custom_trip_start"
              >
                Rancang perjalanan privat <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {journalPosts.length ? (
          <section className={`${styles.section} ${styles.journalSection}`} aria-labelledby="journal-title">
            <div className={styles.shell}>
              <div className={styles.headingRow}>
                <div className={styles.sectionHeading}>
                  <p className={styles.eyebrow}>BEKAL SEBELUM PERGI</p>
                  <h2 id="journal-title">Baca dulu. Berangkat lebih siap.</h2>
                  <p>Panduan destinasi, visa, cuaca, dan persiapan praktis untuk traveler Indonesia.</p>
                </div>
                <Link className={styles.desktopSectionLink} href="/blog">
                  Baca semua panduan <ArrowRight aria-hidden="true" />
                </Link>
              </div>

              <div className={styles.journalGrid}>
                {journalPosts.map((post) => {
                  const formattedDate = formatPostDate(post.date);
                  return (
                    <article className={styles.journalCard} key={post.id}>
                      <Link href={`/blog/${post.slug}`} className={styles.journalMedia} tabIndex={-1}>
                        {post.cover ? (
                          <Image
                            src={cldOptimize(post.cover, 760)}
                            alt={`Sampul artikel ${post.title}`}
                            fill
                            sizes="(max-width: 759px) calc(100vw - 40px), (max-width: 1100px) 46vw, 31vw"
                          />
                        ) : (
                          <span className={styles.journalPlaceholder} aria-hidden="true">
                            <Compass />
                          </span>
                        )}
                      </Link>
                      <div className={styles.journalBody}>
                        <div className={styles.journalMeta}>
                          <span>{post.category || "Jurnal"}</span>
                          {post.readTime ? <span>{post.readTime}</span> : null}
                        </div>
                        <h3>
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h3>
                        {post.excerpt ? <p>{post.excerpt}</p> : null}
                        <div className={styles.journalFooter}>
                          {formattedDate ? <time dateTime={new Date(post.date).toISOString()}>{formattedDate}</time> : <span />}
                          <Link href={`/blog/${post.slug}`}>
                            Baca panduan <ArrowRight aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <Link className={styles.mobileSectionLink} href="/blog">
                Baca semua panduan <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </section>
        ) : null}

        <section className={styles.finalSection} aria-labelledby="final-cta-title">
          <div className={`${styles.shell} ${styles.finalLayout}`}>
            <div>
              <p className={styles.eyebrow}>MASIH MENENTUKAN RUTE?</p>
              <h2 id="final-cta-title">Ceritakan rencanamu. Kami bantu melihat jalan yang paling masuk akal.</h2>
              <p>
                Sampaikan destinasi, waktu berangkat, jumlah peserta, dan kisaran budget. Kamu
                akan mendapat arahan awal sebelum memutuskan.
              </p>
            </div>
            <div className={styles.finalActions}>
              <a
                className={styles.primaryAction}
                href={waHref}
                data-analytics-placement="home-final"
              >
                <MessageCircle aria-hidden="true" />
                Konsultasi rute via WhatsApp
              </a>
              <Link className={styles.secondaryAction} href="/tours">
                Lihat jadwal &amp; biaya <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
