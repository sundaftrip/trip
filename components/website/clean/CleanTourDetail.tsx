import Image from "next/image";
import Link from "./PreserveScrollLink";
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Download,
  FileText,
  Hotel,
  MapPin,
  Package,
  Star,
  Users,
  X,
} from "lucide-react";
import TourShareButtons from "@/components/website/TourShareButtons";
import { cldThumb, formatCurrency } from "@/lib/utils";
import { stripLooseItineraryMarkup } from "@/lib/itinerary-markup";
import { normalizeItineraryDisplayTitle } from "@/lib/tour-display";
import { getCommerceTourStatus, getDestinationSlug } from "@/lib/tour-commerce";
import type { TourRoomPrice } from "@/lib/tour-room-pricing";
import {
  resolveItineraryDayImage,
  type ItineraryDisplayDay,
} from "@/lib/itinerary-insights";
import type { TourPaymentPlan } from "@/lib/tour-payment-plan";
import type { TourVisaOffer } from "@/lib/tour-visa-offers";
import CleanTourCard, { type CleanTour } from "./CleanTourCard";
import StableDetails from "./StableDetails";
import TourDetailTabs from "./TourDetailTabs";
import TourHeroGallery from "./TourHeroGallery";
import TourRoomBookingPanel from "./TourRoomBookingPanel";
import TourRoomBookingSidebar from "./TourRoomBookingSidebar";
import TourRoomRecoveryLink from "./TourRoomRecoveryLink";
import { TourRoomSelectionProvider } from "./TourRoomSelectionContext";
import styles from "./CleanSite.module.css";
import interactiveStyles from "./TourDetailInteractive.module.css";

type TourAddOn = {
  name: string;
  price: number;
  tag?: "" | "wajib" | "recommended";
  desc?: string;
  visaHref?: string | null;
};

type TourReview = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
};

type DetailTour = {
  id: string;
  slug: string | null;
  title: string;
  country: string;
  cityHighlight: string | null;
  duration: string | null;
  description: string | null;
  visaInfo: string | null;
  notes: string | null;
  heroImg: string | null;
  badge: string | null;
  gallery: string[];
  inclusions: string[];
  exclusions: string[];
  hotel: Record<string, string> | null;
  price: number;
  promoPrice: number | null;
  priceLandTour: number | null;
  seatsLeft: number;
  status: string;
  tripDate: Date | null;
};

type CleanTourDetailProps = {
  tour: DetailTour;
  itinerary: ItineraryDisplayDay[];
  mandatoryAddOns: TourAddOn[];
  roomPrices: TourRoomPrice[];
  optionalAddOns: TourAddOn[];
  visaOffers: TourVisaOffer[];
  paymentPlan: TourPaymentPlan | null;
  relatedTours: CleanTour[];
  reviews: TourReview[];
  ratingValue: number;
  bookingPhone: string;
  bookingWaHref: string;
  bookingSummary: string;
  basePrice: number;
  startingTotal: number;
  departureLabel: string | null;
  capacityLabel: string;
  isExpired: boolean;
  isFlexibleDate: boolean;
};

function detailCopy(tour: DetailTour, isFlexibleDate: boolean) {
  const haystack = `${tour.slug || ""} ${tour.title} ${tour.country}`.toLocaleLowerCase("id-ID");
  const tripType = isFlexibleDate ? "Land tour privat" : "Open trip";

  if (/4[- ]tan/.test(haystack)) {
    return {
      eyebrow: "Open trip · Asia Tengah",
      heroLead: "Empat negara dalam satu perjalanan.",
      heroSupport: "Rute antarnegara, perpindahan kota, dan kebutuhan perjalanan dikoordinasikan sejak awal.",
      summaryTitle: "Dari danau alpine sampai kota-kota Jalur Sutra.",
    };
  }

  if (/central-asia|asia tengah|kazakhstan|kyrgyzstan|uzbekistan|tajikistan/.test(haystack)) {
    return {
      eyebrow: `${tripType} · Asia Tengah`,
      heroLead: "Bentang alam dan kota bersejarah dalam satu rute.",
      heroSupport: "Perpindahan kota, kebutuhan perjalanan, dan koordinasi di destinasi dirangkum sejak awal.",
      summaryTitle: "Menjelajahi Asia Tengah melalui rute yang tersusun jelas.",
    };
  }

  if (/aurora|murmansk/.test(haystack)) {
    return {
      eyebrow: `${tripType} · Rusia & Aurora`,
      heroLead: "Kota ikonik Rusia dan langit Arktik dalam satu rute.",
      heroSupport: "Jadwal antarkota, aktivitas musim dingin, dan koordinasi di destinasi disiapkan sebagai satu perjalanan utuh.",
      summaryTitle: "Dari arsitektur Rusia sampai perburuan Aurora.",
    };
  }

  if (/russia|rusia/.test(haystack)) {
    return {
      eyebrow: `${tripType} · Rusia`,
      heroLead: "Kota-kota ikonik Rusia dalam satu perjalanan.",
      heroSupport: "Rute antarkota, akomodasi, dan kebutuhan perjalanan dirangkum agar mudah dipahami sebelum memesan.",
      summaryTitle: "Menjelajahi Rusia melalui rute yang tersusun jelas.",
    };
  }

  if (/hokkaido/.test(haystack)) {
    return {
      eyebrow: `${tripType} · Jepang`,
      heroLead: "Tokyo dan Hokkaido dalam satu perjalanan musim dingin.",
      heroSupport: "Rute, akomodasi, dan perpindahan antarkota dirangkum agar perjalanan lebih mudah dipahami.",
      summaryTitle: "Musim dingin Jepang dari Tokyo sampai Hokkaido.",
    };
  }

  if (/japan|jepang|tokyo/.test(haystack)) {
    return {
      eyebrow: `${tripType} · Jepang`,
      heroLead: "Perjalanan Jepang yang dirangkum dengan jelas.",
      heroSupport: "Rute, akomodasi, dan perpindahan antarkota ditampilkan dalam satu alur yang mudah dibandingkan.",
      summaryTitle: "Menjelajahi Jepang dengan rute yang tersusun dari awal.",
    };
  }

  if (/vietnam|sapa|hanoi|danang|phu quoc|ho chi minh/.test(haystack)) {
    return {
      eyebrow: `${tripType} · Vietnam`,
      heroLead: isFlexibleDate ? "Rute privat dengan waktu yang lebih fleksibel." : "Rute Vietnam yang dirangkum dari awal.",
      heroSupport: isFlexibleDate
        ? "Akomodasi, transportasi darat, dan aktivitas dapat dikonfirmasi sesuai tanggal serta kebutuhan grup."
        : "Akomodasi, transportasi darat, dan aktivitas utama ditampilkan dalam satu alur yang mudah dibaca.",
      summaryTitle: tour.cityHighlight
        ? `Menjelajahi ${tour.cityHighlight} dengan ritme yang lebih leluasa.`
        : "Land tour Vietnam yang disusun untuk perjalanan privat.",
    };
  }

  return {
    eyebrow: `${tripType} · ${tour.country}`,
    heroLead: "Detail penting ditampilkan sejak awal.",
    heroSupport: "Rute, durasi, fasilitas, dan cara pemesanan dirangkum dalam satu halaman yang mudah dibandingkan.",
    summaryTitle: `Perjalanan ${tour.country} yang disusun lebih jelas dari awal.`,
  };
}

function cleanParagraphs(value: string | null) {
  if (!value) return [];
  return value
    .replace(/\r\n?/g, "\n")
    .split(/\n+/)
    .map((paragraph) => stripLooseItineraryMarkup(paragraph).replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function naturalizeVisaParagraph(paragraph: string) {
  return paragraph
    .replace(
      /Kelayakan eTA, bila relevan, harus dikonfirmasi/gi,
      "Persyaratan eTA, jika berlaku, perlu dikonfirmasi",
    )
    .replace(/\bKelayakan\b/gi, "Persyaratan");
}

function itineraryDate(tripDate: Date | null, day: number) {
  if (!tripDate) return null;
  const date = new Date(tripDate);
  date.setUTCDate(date.getUTCDate() + Math.max(0, day - 1));
  return {
    iso: date.toISOString(),
    label: new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(date),
  };
}

function bookingStatus(
  tour: DetailTour,
  commerceStatus: ReturnType<typeof getCommerceTourStatus>,
) {
  if (commerceStatus === "completed") return "Trip selesai";
  if (commerceStatus === "sold_out") return "Penuh";
  if (commerceStatus === "waitlist") return "Daftar tunggu";
  if (commerceStatus === "confirmed") return "Pasti berangkat";
  if (commerceStatus === "last_seats") return `${tour.seatsLeft} kursi terakhir`;
  if (commerceStatus === "flexible") return "Jadwal disesuaikan";
  if (tour.seatsLeft > 0) return `${tour.seatsLeft} kursi tersedia`;
  return "Tanya ketersediaan";
}

export default function CleanTourDetail({
  tour,
  itinerary,
  mandatoryAddOns,
  roomPrices,
  optionalAddOns,
  visaOffers,
  paymentPlan,
  relatedTours,
  reviews,
  ratingValue,
  bookingPhone,
  bookingWaHref,
  bookingSummary,
  basePrice,
  startingTotal,
  departureLabel,
  capacityLabel,
  isExpired,
  isFlexibleDate,
}: CleanTourDetailProps) {
  const copy = detailCopy(tour, isFlexibleDate);
  const summaryParagraphs = cleanParagraphs(tour.description);
  const visaParagraphs = cleanParagraphs(tour.visaInfo).map(naturalizeVisaParagraph);
  const noteParagraphs = cleanParagraphs(tour.notes);
  const heroImage = tour.heroImg || tour.gallery[0] || "/about-gallery-md/01-aurora.webp";
  const heroImages = [heroImage, ...tour.gallery];
  const route = tour.cityHighlight || tour.country;
  const commerceStatus = isExpired ? "completed" : getCommerceTourStatus(tour);
  const status = bookingStatus(tour, commerceStatus);
  const unavailable = ["completed", "sold_out", "waitlist"].includes(commerceStatus);
  const hasPrice = basePrice > 0;
  const priceCaption = mandatoryAddOns.length > 0 ? "Total wajib" : "Harga paket";
  const selectableAddOn = optionalAddOns.find((item) => (
    item.tag === "recommended"
    && /asuransi perjalanan usia sampai 69 tahun/i.test(item.name)
    && Number(item.price) > 0
  ));
  const disclosureOptionalAddOns = optionalAddOns.filter((item) => (
    item !== selectableAddOn
    && !(visaOffers.length > 0 && /visa/i.test(item.name))
  ));
  const hasFacilities = tour.inclusions.length > 0 || tour.exclusions.length > 0;
  const hasNotes = visaParagraphs.length > 0 || noteParagraphs.length > 0;
  const sectionTabs = [
    { id: "itinerary", label: "Itinerary", show: itinerary.length > 0 },
    { id: "harga-tanggal", label: "Harga & Tanggal", show: true },
    { id: "ulasan", label: "Ulasan", show: true },
  ].filter((item) => item.show).map(({ id, label }) => ({ id, label }));
  const bookingMode = commerceStatus === "completed"
    ? "completed"
    : commerceStatus === "sold_out" || commerceStatus === "waitlist"
      ? "sold_out"
      : commerceStatus === "flexible"
        ? "flexible"
        : "available";
  const priceLabel = hasPrice ? formatCurrency(startingTotal || basePrice) : "Sesuai permintaan";
  const bookingDepartures = tour.tripDate && !isExpired
    ? [{
        id: `${tour.id}-${tour.tripDate.toISOString().slice(0, 10)}`,
        label: departureLabel || "Tanggal akan dikonfirmasi",
        priceLabel,
        priceValue: hasPrice ? (startingTotal || basePrice) : undefined,
        status: commerceStatus === "sold_out"
          ? "sold_out" as const
          : commerceStatus === "waitlist"
            ? "waitlist" as const
            : commerceStatus === "confirmed"
              ? "confirmed" as const
              : commerceStatus === "last_seats"
                ? "last_seats" as const
                : "available" as const,
        availabilityLabel: status,
      }]
    : [];
  const experienceItems = itinerary.map((item, index) => ({
    title: normalizeItineraryDisplayTitle(item.title) || `Hari ke-${item.day}`,
    description:
      cleanParagraphs(item.description)[0]
      || `Lihat aktivitas dan perpindahan untuk hari ke-${item.day}.`,
    image: resolveItineraryDayImage(item, index, heroImages),
  }));
  const destinationSlug = getDestinationSlug(tour);
  const destinationHref =
    destinationSlug === "lainnya" ? "/destinations" : `/destinations/${destinationSlug}`;
  const destinationLabel =
    destinationSlug === "rusia-aurora"
      ? "Rusia & Aurora"
      : destinationSlug === "asia-tengah"
        ? "Asia Tengah"
        : destinationSlug === "vietnam"
          ? "Vietnam"
          : destinationSlug === "jepang"
            ? "Jepang"
            : "destinasi Sundaf";
  const tourFaqs = [
    {
      question: "Apakah harga sudah memasukkan seluruh biaya wajib?",
      answer: mandatoryAddOns.length
        ? `${roomPrices.length > 0 ? "Total wajib mulai" : "Total wajib saat ini"} ${formatCurrency(startingTotal)} per orang sudah menggabungkan harga paket dan ${mandatoryAddOns.length} komponen wajib yang ditampilkan di bagian Harga & Tanggal.`
        : "Tidak ada biaya tambahan berlabel wajib pada data tour ini. Tim tetap mengonfirmasi rincian final sebelum pembayaran.",
    },
    {
      question: "Apakah kursi langsung terpesan setelah mengirim WhatsApp?",
      answer: "Belum. Pesan WhatsApp adalah permintaan ketersediaan. Kursi baru mengikuti konfirmasi tertulis dan instruksi pembayaran dari tim Sundaf.",
    },
    {
      question: isFlexibleDate ? "Apakah tanggal dapat disesuaikan?" : "Bagaimana status keberangkatan dikonfirmasi?",
      answer: isFlexibleDate
        ? "Tanggal diajukan lebih dulu dan dikonfirmasi berdasarkan ketersediaan layanan, akomodasi, serta kebutuhan grup."
        : `Status saat ini: ${status}. Tim memeriksa kembali ketersediaan sebelum peserta melakukan pembayaran.`,
    },
  ];

  return (
    <div className={styles.tourDetail}>
      <a className={styles.skipLink} href="#tour-content">Langsung ke detail perjalanan</a>

      <section className={styles.detailHero} aria-labelledby="tour-title">
        <div className={styles.shell}>
          <nav className={styles.detailBreadcrumb} aria-label="Breadcrumb">
            <Link href="/" scroll={false}>Beranda</Link><span aria-hidden="true">/</span>
            <Link href="/tours" scroll={false}>Jadwal tour</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{tour.title}</span>
          </nav>

          <div className={styles.detailHeroStage}>
            <div className={interactiveStyles.heroGallery}>
              <TourHeroGallery images={heroImages} title={tour.title} variant="immersive" />
            </div>
            <div className={styles.detailHeroShade} aria-hidden="true" />

            <div className={styles.detailHeroOverlay}>
              <div className={styles.detailHeroHeading}>
                <div>
                  <p className={styles.detailEyebrow}>{copy.eyebrow}</p>
                  <h1 id="tour-title">{tour.title}</h1>
                </div>
                <p className={styles.detailHeroIntro}><strong>{copy.heroLead}</strong> {copy.heroSupport}</p>
              </div>

              <div className={styles.detailHeroCommerce}>
                <div className={styles.detailHeroPriceBlock}>
                  <span>{status}</span>
                  <small>{hasPrice ? "Mulai dari" : "Harga"}</small>
                  <strong>{priceLabel}</strong>
                  {hasPrice && <small>per orang</small>}
                </div>
                <a className={styles.detailHeroCta} href="#harga-tanggal">
                  {unavailable ? "Lihat detail perjalanan" : "Lihat harga & tanggal"}
                  <ArrowRight aria-hidden="true" />
                </a>
              </div>

              <div className={styles.detailHeroFacts} role="group" aria-label="Ringkasan perjalanan">
                <span><MapPin aria-hidden="true" />{route}</span>
                {tour.duration && <span><Clock aria-hidden="true" />{tour.duration}</span>}
                {departureLabel && <span><Calendar aria-hidden="true" />{departureLabel}</span>}
                <span><Users aria-hidden="true" />{capacityLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TourDetailTabs tabs={sectionTabs} tourId={tour.id} />

      <TourRoomSelectionProvider
        roomPrices={roomPrices}
        selectableAddOn={selectableAddOn}
        visaOffers={visaOffers}
      >
        <div className={`${styles.shell} ${styles.detailContentLayout}`} id="tour-content" tabIndex={-1}>
        <div className={styles.detailContentMain}>
          <section className={styles.detailContentSection} id="ringkasan" aria-labelledby="ringkasan-title">
            <div className={styles.detailSummary}>
              <span className={styles.detailSummaryIndex}>01 / RINGKASAN</span>
              <div>
                <h2 id="ringkasan-title">{copy.summaryTitle}</h2>
                {summaryParagraphs.length > 0 ? summaryParagraphs.map((paragraph, index) => <p key={`${paragraph.slice(0, 32)}-${index}`}>{paragraph}</p>) : (
                  <p>{copy.heroSupport}</p>
                )}
                <div className={styles.detailRouteLine}><strong>Rute utama</strong><span>{route}</span></div>
                <Link
                  className={styles.detailDestinationLink}
                  href={destinationHref}
                  scroll={true}
                  data-scroll-reset-after-navigation
                >
                  Baca panduan {destinationLabel} →
                </Link>
              </div>
            </div>
          </section>

          {experienceItems.length > 1 && (
            <section className={styles.detailContentSection} aria-labelledby="highlights-title">
              <p className={styles.detailSectionKicker}>Sorotan pengalaman</p>
              <h2 className={styles.detailSectionTitle} id="highlights-title">Yang akan ditemui di perjalanan</h2>
              <div
                className={styles.detailHighlightRail}
                role="region"
                aria-label="Sorotan pengalaman, geser untuk melihat lainnya"
                tabIndex={0}
              >
                {experienceItems.map((item, index) => (
                  <article key={`${item.title}-${index}`}>
                    <div>
                      <Image
                        src={cldThumb(item.image, 640, 480)}
                        alt={`Gambaran destinasi untuk ${item.title}`}
                        fill
                        quality={60}
                        sizes="(max-width: 700px) 78vw, 320px"
                      />
                    </div>
                    <span>Hari {itinerary[index]?.day || index + 1}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {itinerary.length > 0 && (
            <section className={styles.detailContentSection} id="itinerary" aria-labelledby="itinerary-title">
              <p className={styles.detailSectionKicker}>Rencana perjalanan</p>
              <h2 className={styles.detailSectionTitle} id="itinerary-title">Itinerary {tour.title}</h2>
              <p className={styles.detailSectionLede}>Buka hari yang ingin dilihat. Aktivitas utama dan informasi praktis ditampilkan tanpa memenuhi seluruh halaman.</p>
              <div className={styles.detailItinerary}>
                {itinerary.map((item, index) => {
                  const date = itineraryDate(tour.tripDate, item.day);
                  const paragraphs = cleanParagraphs(item.description);
                  const dayTitle = normalizeItineraryDisplayTitle(item.title) || `Aktivitas hari ke-${item.day}`;
                  const dayImage = resolveItineraryDayImage(item, index, heroImages);
                  return (
                    <StableDetails className={styles.detailDay} key={`${item.day}-${item.title}`} open={index === 0}>
                      <summary>
                        <span className={styles.detailDayNumber}>{String(item.day).padStart(2, "0")}</span>
                        <span className={styles.detailDayHeading}>
                          {date ? <time dateTime={date.iso}>{date.label}</time> : <span>Hari ke-{item.day}</span>}
                          <strong>{dayTitle}</strong>
                        </span>
                        <span className={styles.detailDayToggle} aria-hidden="true" />
                      </summary>
                      <div className={styles.detailDayBody}>
                        <div className={styles.detailDayImage}>
                          <Image
                            src={cldThumb(dayImage, 960, 640)}
                            alt={`Gambaran perjalanan Hari ${item.day}: ${dayTitle}`}
                            fill
                            quality={70}
                            sizes="(max-width: 700px) calc(100vw - 76px), 760px"
                          />
                        </div>
                        {paragraphs.map((paragraph, paragraphIndex) => <p key={`${paragraph.slice(0, 32)}-${paragraphIndex}`}>{paragraph}</p>)}
                        {item.insights.length > 0 && (
                          <div className={styles.detailDayTags}>
                            {item.insights.map((insight) => <span key={`${insight.kind}-${insight.value}`}>{insight.value}</span>)}
                          </div>
                        )}
                      </div>
                    </StableDetails>
                  );
                })}
              </div>
            </section>
          )}

          <section className={styles.detailContentSection} id="harga-tanggal" aria-labelledby="harga-tanggal-title">
            <p className={styles.detailSectionKicker}>Harga &amp; tanggal</p>
            <h2 className={styles.detailSectionTitle} id="harga-tanggal-title">
              {isFlexibleDate ? "Rancang tanggal perjalanan" : "Pilih tanggal keberangkatan"}
            </h2>
            <p className={styles.detailSectionLede}>
              Harga paket, biaya wajib di luar paket, dan status ditampilkan sebelum kamu mengirim permintaan ketersediaan.
            </p>
            <TourRoomBookingPanel
              roomPrices={roomPrices}
              mandatoryAddOns={mandatoryAddOns}
              paymentInitialAmountLabel={paymentPlan?.steps[0]?.amountLabel}
              status={status}
              departureLabel={departureLabel}
              unavailable={unavailable}
              hasPrice={hasPrice}
              basePrice={basePrice}
              startingTotal={startingTotal}
              bookingPhone={bookingPhone}
              tourId={tour.id}
              tourName={tour.title}
              priceLabel={priceLabel}
              priceCaption={priceCaption}
              availabilityLabel={status}
              bookingMode={bookingMode}
              bookingDepartures={bookingDepartures}
              completedTourHref={itinerary.length > 0 ? "#itinerary" : "#ringkasan"}
            />
          </section>

          {hasFacilities && (
            <section className={styles.detailContentSection} id="fasilitas" aria-labelledby="fasilitas-title">
              <h2 className={styles.detailSectionTitle} id="fasilitas-title">Yang termasuk dalam paket</h2>
              <div className={styles.detailIncludedGrid}>
                {tour.inclusions.length > 0 && (
                  <div>
                    <h3>Sudah termasuk</h3>
                    <ul className={styles.detailIncludedList}>{tour.inclusions.map((item, index) => <li key={`${item}-${index}`}><Check aria-hidden="true" />{item}</li>)}</ul>
                  </div>
                )}
                {tour.exclusions.length > 0 && (
                  <div>
                    <h3>Belum termasuk</h3>
                    <ul className={`${styles.detailIncludedList} ${styles.detailExcludedList}`}>{tour.exclusions.map((item, index) => <li key={`${item}-${index}`}><X aria-hidden="true" />{item}</li>)}</ul>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className={styles.detailContentSection} aria-labelledby="suitability-title">
            <p className={styles.detailSectionKicker}>Sebelum mengambil keputusan</p>
            <h2 className={styles.detailSectionTitle} id="suitability-title">Apakah perjalanan ini sesuai?</h2>
            <div className={styles.detailSuitabilityGrid}>
              <article>
                <span>TANGGAL</span>
                <h3>{isFlexibleDate ? "Diajukan sesuai kebutuhan grup" : departureLabel || "Dikonfirmasi tim"}</h3>
                <p>{isFlexibleDate ? "Tanggal final mengikuti ketersediaan layanan dan akomodasi." : "Gunakan tanggal yang tertera sebagai dasar permintaan ketersediaan."}</p>
              </article>
              <article>
                <span>RITME</span>
                <h3>{itinerary.length ? `${itinerary.length} hari itinerary ditampilkan` : tour.duration || "Durasi dikonfirmasi"}</h3>
                <p>Baca aktivitas harian dan sampaikan kebutuhan mobilitas atau ritme perjalanan saat konsultasi.</p>
              </article>
              <article>
                <span>TRANSPARANSI HARGA</span>
                <h3>{mandatoryAddOns.length ? `${mandatoryAddOns.length} biaya wajib ditampilkan` : "Tidak ada add-on wajib tercatat"}</h3>
                <p>Periksa bagian termasuk, belum termasuk, dan total wajib sebelum melanjutkan ke pembayaran.</p>
              </article>
            </div>
          </section>

          {tour.hotel && Object.keys(tour.hotel).length > 0 && (
            <section className={styles.detailContentSection} id="hotel" aria-labelledby="hotel-title">
              <p className={styles.detailSectionKicker}>Akomodasi</p>
              <h2 className={styles.detailSectionTitle} id="hotel-title">Pilihan hotel</h2>
              <div className={styles.detailHotelGrid}>
                {Object.entries(tour.hotel).map(([label, value]) => (
                  <div key={label}><Hotel aria-hidden="true" /><span><strong>{label}</strong><small>{value}</small></span></div>
                ))}
              </div>
            </section>
          )}

          {hasNotes && (
            <section className={styles.detailContentSection} id="catatan" aria-labelledby="catatan-title">
              <p className={styles.detailSectionKicker}>Sebelum memesan</p>
              <h2 className={styles.detailSectionTitle} id="catatan-title">Catatan penting perjalanan</h2>
              <div className={styles.detailInfoGrid}>
                {visaParagraphs.length > 0 && (
                  <article><FileText aria-hidden="true" /><div><h3>Informasi visa</h3>{visaParagraphs.map((paragraph, index) => <p key={`${paragraph.slice(0, 32)}-${index}`}>{paragraph}</p>)}</div></article>
                )}
                {noteParagraphs.length > 0 && (
                  <article><Package aria-hidden="true" /><div><h3>Ketentuan paket</h3>{noteParagraphs.map((paragraph, index) => <p key={`${paragraph.slice(0, 32)}-${index}`}>{paragraph}</p>)}</div></article>
                )}
              </div>
            </section>
          )}

          {paymentPlan && (
            <section className={styles.detailContentSection} id="pembayaran" aria-labelledby="pembayaran-title">
              <p className={styles.detailSectionKicker}>Skema pembayaran</p>
              <h2 className={styles.detailSectionTitle} id="pembayaran-title">Pembayaran dan booking kursi</h2>
              <div className={styles.detailPaymentIntro}>
                <div><span>Total per orang</span><strong>{paymentPlan.totalLabel}</strong></div>
                <p>{paymentPlan.intro}</p>
              </div>
              <div
                className={styles.detailPaymentTableWrap}
                role="region"
                aria-label="Rincian tahap pembayaran, geser untuk melihat semua kolom"
                tabIndex={0}
              >
                <table className={styles.detailPaymentTable}>
                  <thead><tr><th>Tahap</th><th>Jatuh tempo</th><th>Nominal</th></tr></thead>
                  <tbody>{paymentPlan.steps.map((step, index) => <tr key={`${step.label}-${index}`}><td>{step.label}</td><td>{step.dueDateLabel}</td><td>{step.amountLabel}</td></tr>)}</tbody>
                </table>
              </div>
              {paymentPlan.finePrint && <p className={styles.detailFinePrint}>{paymentPlan.finePrint}</p>}
            </section>
          )}

          <section className={styles.detailContentSection} aria-labelledby="tour-faq-title">
            <p className={styles.detailSectionKicker}>Pertanyaan sebelum booking</p>
            <h2 className={styles.detailSectionTitle} id="tour-faq-title">Hal yang perlu dipastikan</h2>
            <div className={styles.detailFaqs}>
              {tourFaqs.map((item, index) => (
                <StableDetails key={item.question} open={index === 0}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </StableDetails>
              ))}
            </div>
          </section>

          <section className={styles.detailContentSection} id="ulasan" aria-labelledby="ulasan-title">
              <p className={styles.detailSectionKicker}>Pengalaman peserta</p>
              <div className={styles.detailReviewHeading}>
                <h2 className={styles.detailSectionTitle} id="ulasan-title">Ulasan peserta</h2>
                {reviews.length > 0 && <span><strong>{ratingValue.toFixed(1)}</strong><Star aria-hidden="true" />{reviews.length} ulasan</span>}
              </div>
              {reviews.length > 0 ? (
                <div className={styles.detailReviewGrid}>
                  {reviews.map((review) => (
                    <article key={review.id}>
                      <div role="img" aria-label={`Rating ${review.rating} dari 5`}>{Array.from({ length: 5 }).map((_, index) => <Star key={index} aria-hidden="true" className={index < review.rating ? styles.detailStarActive : ""} />)}</div>
                      <blockquote>“{review.content}”</blockquote>
                      <p><strong>{review.name}</strong>{review.role && <span> · {review.role}</span>}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className={styles.detailSectionLede}>Ulasan khusus untuk perjalanan ini belum dipublikasikan. Lihat halaman testimoni untuk cerita peserta Sundaf lainnya.</p>
              )}
            </section>

          <section className={styles.detailMobileUtilities} aria-labelledby="mobile-trip-tools-title">
            <h2 id="mobile-trip-tools-title">Simpan dan bandingkan detail</h2>
            <a
              href={`/tours/${tour.id}/pdf`}
              download
              target="_blank"
              rel="noopener"
              data-analytics-event="itinerary_pdf_download"
              data-tour-id={tour.id}
              aria-describedby="mobile-pdf-recovery"
            >
              <Download aria-hidden="true" />Unduh itinerary PDF
            </a>
            <p className={styles.detailPdfRecovery} id="mobile-pdf-recovery">
              Jika PDF tidak terbuka,{" "}
              <TourRoomRecoveryLink
                fallbackHref={bookingWaHref}
                phone={bookingPhone}
                startingTotal={startingTotal}
                tourName={tour.title}
                departureLabel={departureLabel}
                bookingMode={bookingMode}
                analyticsPlacement="detail-mobile-pdf-recovery"
              />.
            </p>
            {disclosureOptionalAddOns.length > 0 && (
              <StableDetails>
                <summary>Tambahan opsional <span>{disclosureOptionalAddOns.length}</span></summary>
                <div>
                  {disclosureOptionalAddOns.map((item) => (
                    <article key={item.name}>
                      <p><strong>{item.name}</strong><span>+{formatCurrency(item.price)}</span></p>
                      {item.desc && <small>{item.desc}</small>}
                      {item.visaHref && <Link href={item.visaHref} scroll={false}>Lihat bantuan visa →</Link>}
                    </article>
                  ))}
                </div>
              </StableDetails>
            )}
            <TourShareButtons
              tourTitle={tour.title}
              isOutlined
              isAtlas
              pfx="at"
              tText="#202934"
              tCard="#f3f6f6"
              tBdr="#e2e7e8"
              tSub="#606b72"
            />
          </section>
        </div>

        <aside className={styles.detailBookingSidebar} aria-label="Informasi pemesanan">
          <div className={styles.detailBookingCard}>
            <span className={`${styles.detailStock} ${unavailable ? styles.detailStockUnavailable : ""}`}>{status}</span>
            <TourRoomBookingSidebar
              roomPrices={roomPrices}
              mandatoryAddOns={mandatoryAddOns}
              hasPrice={hasPrice}
              basePrice={basePrice}
              startingTotal={startingTotal}
              promoPrice={tour.promoPrice}
              originalPrice={tour.price}
              priceLandTour={tour.priceLandTour}
              unavailable={unavailable}
              isExpired={isExpired}
              bookingWaHref={bookingWaHref}
              bookingSummary={bookingSummary}
              bookingPhone={bookingPhone}
              bookingMode={bookingMode}
              tourName={tour.title}
              departureLabel={departureLabel}
            />

            <a
              className={styles.detailBookingPdf}
              href={`/tours/${tour.id}/pdf`}
              download
              target="_blank"
              rel="noopener"
              data-analytics-event="itinerary_pdf_download"
              data-tour-id={tour.id}
              aria-describedby="detail-pdf-recovery"
            >
              <Download aria-hidden="true" />Unduh itinerary PDF
            </a>
            <p className={styles.detailPdfRecovery} id="detail-pdf-recovery">
              Jika unduhan gagal,{" "}
              <TourRoomRecoveryLink
                fallbackHref={bookingWaHref}
                phone={bookingPhone}
                startingTotal={startingTotal}
                tourName={tour.title}
                departureLabel={departureLabel}
                bookingMode={bookingMode}
                analyticsPlacement="detail-pdf-recovery"
              />.
            </p>
            <p className={styles.detailBookingNote}>Konsultasi awal gratis. Tim akan mengonfirmasi harga, jadwal, dan ketersediaan terbaru.</p>

            <dl className={styles.detailBookingFacts}>
              {departureLabel && <div><dt>Keberangkatan</dt><dd>{departureLabel}</dd></div>}
              {tour.duration && <div><dt>Durasi</dt><dd>{tour.duration}</dd></div>}
              <div><dt>{isFlexibleDate ? "Kapasitas" : "Ketersediaan"}</dt><dd>{capacityLabel}</dd></div>
            </dl>

            {disclosureOptionalAddOns.length > 0 && (
              <StableDetails className={styles.detailBookingDisclosure}>
                <summary>Tambahan opsional <span>{disclosureOptionalAddOns.length}</span></summary>
                <div>
                  {disclosureOptionalAddOns.map((item) => (
                    <article key={item.name}>
                      <p><strong>{item.name}</strong><span>+{formatCurrency(item.price)}</span></p>
                      {item.desc && <small>{item.desc}</small>}
                      {item.visaHref && <Link href={item.visaHref} scroll={false}>Lihat bantuan visa →</Link>}
                    </article>
                  ))}
                </div>
              </StableDetails>
            )}

            <div className={styles.detailShare}>
              <TourShareButtons
                tourTitle={tour.title}
                isOutlined
                isAtlas
                pfx="at"
                tText="#202934"
                tCard="#f3f6f6"
                tBdr="#e2e7e8"
                tSub="#606b72"
              />
            </div>
          </div>
        </aside>
        </div>
      </TourRoomSelectionProvider>

      {relatedTours.length > 0 && (
        <section className={styles.detailRelated} aria-labelledby="related-title">
          <div className={styles.shell}>
            <div className={styles.detailRelatedHeading}>
              <div>
                <p className={styles.detailSectionKicker}>Pilihan untuk dibandingkan</p>
                <h2 className={styles.detailSectionTitle} id="related-title">Masih ingin membandingkan?</h2>
                <p>Bandingkan destinasi, durasi, tanggal, dan harga sebelum menentukan perjalanan yang paling sesuai.</p>
              </div>
              <Link href="/tours" scroll={false}>Lihat semua jadwal →</Link>
            </div>
            <div className={styles.detailRelatedGrid}>{relatedTours.map((item) => <CleanTourCard key={item.id} tour={item} compact />)}</div>
          </div>
        </section>
      )}

    </div>
  );
}
