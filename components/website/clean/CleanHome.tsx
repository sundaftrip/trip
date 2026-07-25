import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Compass,
  FileCheck,
  MessageCircle,
  Phone,
} from "lucide-react";
import { getTourProductImage, PEXELS_TOUR_IMAGES } from "@/lib/tour-product-images";
import { buildWhatsAppHref, cldOptimize } from "@/lib/utils";
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

export type CleanHomeFaq = {
  id?: string;
  question: string;
  answer: string;
};

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
  faqs?: CleanHomeFaq[];
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

function plainText(value: string) {
  return value
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/p\s*>/gi, "\n")
    .replace(/<\s*\/li\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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

function fallbackFaqs(nib: string, legalName: string): CleanHomeFaq[] {
  return [
    {
      question: "Apakah Sundaf Trip resmi dan aman?",
      answer: `Sundaf Trip dikelola oleh ${legalName} dengan NIB ${nib}. Sebelum membayar, pastikan kamu menerima rincian jadwal, fasilitas, biaya, dan ketentuan perjalanan secara tertulis.`,
    },
    {
      question: "Bagaimana cara booking?",
      answer:
        "Pilih perjalanan yang kamu minati, lalu hubungi tim melalui WhatsApp untuk mengecek ketersediaan dan langkah booking. Percakapan awal belum otomatis mengunci kursi; ikuti konfirmasi dan instruksi pembayaran tertulis dari tim.",
    },
    {
      question: "Apakah visa dan dokumen dibantu?",
      answer:
        "Bantuan visa dan dokumen mengikuti kebutuhan setiap perjalanan. Tim dapat membantu menjelaskan alur dan mengecek kelengkapan, tetapi keputusan visa tetap menjadi kewenangan kedutaan atau otoritas terkait.",
    },
    {
      question: "Berapa jumlah peserta dalam satu grup?",
      answer:
        "Jumlah peserta berbeda untuk setiap keberangkatan. Tim akan menyampaikan ukuran grup dan status keberangkatan yang tersedia sebelum kamu melanjutkan booking.",
    },
    {
      question: "Bagaimana jika jadwal belum cocok?",
      answer:
        "Kamu bisa menunggu jadwal open trip berikutnya atau mengajukan private trip dengan tanggal, jumlah peserta, durasi, dan kisaran budget sendiri.",
    },
  ];
}

const FAQ_MATCHERS = [
  /resmi|legal|aman/i,
  /booking|pesan|daftar/i,
  /visa|dokumen/i,
  /jumlah peserta|satu grup|rombongan/i,
  /jadwal|tanggal.*cocok/i,
];

function resolveFaqs(faqs: CleanHomeFaq[] | undefined, nib: string, legalName: string) {
  const defaults = fallbackFaqs(nib, legalName);
  if (!faqs?.length) return defaults;

  return defaults.map((fallback, index) => {
    const approved = faqs.find((faq) => FAQ_MATCHERS[index].test(faq.question));
    const answer = approved ? plainText(approved.answer) : fallback.answer;
    return { ...fallback, id: approved?.id, answer: answer || fallback.answer };
  });
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
  faqs,
  texts,
  heroImage = "/about-gallery/01-aurora.webp",
}: CleanHomeProps) {
  const scheduledTours = tours
    .filter((tour) => tour.state === "bookable" || tour.state === "sold")
    .slice(0, 6);
  const destinationOptions = getDestinationOptions(tours);
  const monthOptions = getMonthOptions(tours);
  const nib = company.company_nib || "1601260060842";
  const legalName = company.company_legal_name || "CV Sundaf Holiday Group";
  const whatsappNumber = company.company_whatsapp || "+62 817-7520-2759";
  const phone = company.company_phone || "021-22321146";
  const waHref =
    buildWhatsAppHref(
      whatsappNumber,
      "Halo Sundaf Trip, saya ingin konsultasi untuk memilih perjalanan yang sesuai.",
    ) || "/contact";
  const resolvedFaqs = resolveFaqs(faqs, nib, legalName);
  const journalPosts = posts.slice(0, 3);

  const heroEyebrow = readText(
    texts,
    ["home_hero_eyebrow"],
    "#SPESIALIS RUSIA, ASIA TENGAH & AURORA",
  );
  const heroTitle = readText(texts, ["home_hero_title"], "Pergi jauh, tanpa repot.");
  const heroBody = readText(
    texts,
    ["home_hero_body", "home_hero_subtitle"],
    "Rute, visa, dan koordinasi perjalanan kami siapkan sejak awal—kamu tinggal menikmati.",
  );
  const resolvedHeroImage = getTourProductImage({
    title: "Sundaf Trip Aurora",
    country: "Rusia",
    heroImg: readText(texts, ["home_hero_image", "home_hero_img"], heroImage),
  });
  const resolvedHeroAlt = readText(
    texts,
    ["home_hero_image_alt"],
    "Dokumentasi perjalanan Aurora Sundaf Trip",
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
            sizes="100vw"
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay} aria-hidden="true" />
          <div className={`${styles.shell} ${styles.heroShell}`}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrowLight}>{heroEyebrow}</p>
              <h1 id="home-hero-title">{heroTitle}</h1>
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
            <div className={styles.finderMeta}>
              <a
                href={waHref}
                data-analytics-placement="home-search"
              >
                <MessageCircle aria-hidden="true" />
                <span>Belum yakin? Konsultasi gratis via WhatsApp.</span>
              </a>
              <Link href="/legalitas-dan-keamanan" className={styles.legalProof}>
                <FileCheck aria-hidden="true" />
                <span>
                  Legalitas usaha <strong>NIB {nib}</strong>
                </span>
              </Link>
            </div>
          </div>
        </div>

        <section className={`${styles.section} ${styles.tourSection}`} aria-labelledby="active-tours-title">
          <div className={styles.shell}>
            <div className={styles.headingRow}>
              <div className={styles.sectionHeading}>
                <p className={styles.eyebrow}>JADWAL PILIHAN SUNDAF</p>
                <h2 id="active-tours-title">Perjalanan yang siap berangkat</h2>
                <p>Tanggal, rute, kursi, dan harga ditampilkan sejak awal.</p>
              </div>
              <Link className={styles.desktopSectionLink} href="/tours">
                Lihat semua perjalanan <ArrowRight aria-hidden="true" />
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
              Lihat semua perjalanan <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="destinations-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>MULAI DARI DESTINASI</p>
              <h2 id="destinations-title">Pilih perjalanan berikutnya</h2>
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
                  <small>Lihat perjalanan</small>
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
                  <small>Jelajahi rute</small>
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
                  <small>Lihat perjalanan</small>
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
                  <small>Rancang sesuai kebutuhanmu</small>
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.benefitSection}`} aria-labelledby="benefits-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>CARA KERJA SUNDAF</p>
              <h2 id="benefits-title">Yang rumit kami urus. Kamu tinggal berangkat.</h2>
            </div>

            <div className={styles.benefitGrid}>
              <article>
                <FileCheck aria-hidden="true" />
                <h3>Visa &amp; dokumen dibantu</h3>
                <p>Alur dan berkas dicek sebelum pengajuan.</p>
              </article>
              <article>
                <Clock aria-hidden="true" />
                <h3>Itinerary realistis</h3>
                <p>Rute memberi waktu untuk menikmati tiap kota.</p>
              </article>
              <article>
                <MessageCircle aria-hidden="true" />
                <h3>Koordinasi dari awal</h3>
                <p>Info keberangkatan disiapkan sejak awal.</p>
              </article>
              <article>
                <Compass aria-hidden="true" />
                <h3>Tour leader berpengalaman</h3>
                <p>Koordinasi grup dibantu selama perjalanan.</p>
              </article>
            </div>
          </div>
        </section>

        <HomeReviews items={testimonials} />

        <section className={styles.section} aria-labelledby="faq-title">
          <div className={`${styles.shell} ${styles.faqLayout}`}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>SEBELUM BERANGKAT</p>
              <h2 id="faq-title">Yang sering ditanyakan</h2>
              <p>Informasi ringkas sebelum kamu memilih jadwal dan menghubungi tim.</p>
            </div>
            <HomeFaqs items={resolvedFaqs} />
          </div>
        </section>

        <section className={styles.privateSection} aria-labelledby="private-trip-title">
          <div className={styles.shell}>
            <div className={styles.privatePanel}>
              <div>
                <p className={styles.eyebrowLight}>PRIVATE &amp; CUSTOM TRIP</p>
                <h2 id="private-trip-title">Punya tanggal sendiri? Kita rancang rutenya.</h2>
                <p>
                  Kirim tujuan, jumlah peserta, durasi, dan kisaran budget. Tim Sundaf akan
                  menyusun pilihan yang masuk akal.
                </p>
              </div>
              <Link
                href="/custom-trip"
                data-analytics-event="custom_trip_start"
              >
                Rancang private trip <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {journalPosts.length ? (
          <section className={`${styles.section} ${styles.journalSection}`} aria-labelledby="journal-title">
            <div className={styles.shell}>
              <div className={styles.headingRow}>
                <div className={styles.sectionHeading}>
                  <p className={styles.eyebrow}>JURNAL SUNDAF</p>
                  <h2 id="journal-title">Bekal sebelum pergi</h2>
                  <p>Panduan destinasi, visa, dan persiapan perjalanan dari tim Sundaf.</p>
                </div>
                <Link className={styles.desktopSectionLink} href="/blog">
                  Lihat semua artikel <ArrowRight aria-hidden="true" />
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
                            Baca artikel <ArrowRight aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <Link className={styles.mobileSectionLink} href="/blog">
                Lihat semua artikel <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </section>
        ) : null}

        <section className={styles.finalSection} aria-labelledby="final-cta-title">
          <div className={`${styles.shell} ${styles.finalLayout}`}>
            <div>
              <p className={styles.eyebrow}>MASIH BINGUNG PILIH TOUR?</p>
              <h2 id="final-cta-title">Ceritakan rencanamu. Kami bantu pilihkan.</h2>
              <p>
                Sampaikan destinasi, waktu, dan jumlah peserta. Konsultasi awal tidak
                dipungut biaya.
              </p>
            </div>
            <div className={styles.finalActions}>
              <a
                className={styles.primaryAction}
                href={waHref}
                data-analytics-placement="home-final"
              >
                <MessageCircle aria-hidden="true" />
                Konsultasi via WhatsApp
              </a>
              <a className={styles.secondaryAction} href={`tel:${phone.replace(/\D/g, "")}`}>
                <Phone aria-hidden="true" />
                {phone}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
