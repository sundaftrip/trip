import Link from "./PreserveScrollLink";
import { Check, Download, Star, X } from "lucide-react";
import TourShareButtons from "@/components/website/TourShareButtons";
import { formatCurrency } from "@/lib/utils";
import { itineraryPdfHref } from "@/lib/itinerary-pdf-download";
import { stripLooseItineraryMarkup } from "@/lib/itinerary-markup";
import { normalizeItineraryDisplayTitle } from "@/lib/tour-display";
import { getCommerceTourStatus, getDestinationSlug } from "@/lib/tour-commerce";
import { tourSubtotalLabel } from "@/lib/tour-cost-disclosure";
import type { TourRoomPrice } from "@/lib/tour-room-pricing";
import type { ItineraryDisplayDay } from "@/lib/itinerary-insights";
import type { TourPaymentPlan } from "@/lib/tour-payment-plan";
import type { TourVisaOffer } from "@/lib/tour-visa-offers";
import CleanTourCard, { type CleanTour } from "./CleanTourCard";
import ScrollReveal from "./ScrollReveal";
import StableDetails from "./StableDetails";
import TourDetailTabs from "./TourDetailTabs";
import TourHeroGallery from "./TourHeroGallery";
import TourRoomBookingPanel from "./TourRoomBookingPanel";
import TourRoomBookingSidebar from "./TourRoomBookingSidebar";
import TourRoomRecoveryLink from "./TourRoomRecoveryLink";
import { TourRoomSelectionProvider } from "./TourRoomSelectionContext";
import styles from "./CleanSite.module.css";

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
      heroSupport: "Rute antarnegara, perpindahan kota, dan kebutuhan perjalanan dikoordinasikan sejak awal.",
    };
  }

  if (/central-asia|asia tengah|kazakhstan|kyrgyzstan|uzbekistan|tajikistan/.test(haystack)) {
    return {
      eyebrow: `${tripType} · Asia Tengah`,
      heroSupport: "Perpindahan kota, kebutuhan perjalanan, dan koordinasi di destinasi dirangkum sejak awal.",
    };
  }

  if (/aurora|murmansk/.test(haystack)) {
    return {
      eyebrow: `${tripType} · Rusia & Aurora`,
      heroSupport: "Jadwal antarkota, aktivitas musim dingin, dan koordinasi di destinasi disiapkan sebagai satu perjalanan utuh.",
    };
  }

  if (/russia|rusia/.test(haystack)) {
    return {
      eyebrow: `${tripType} · Rusia`,
      heroSupport: "Rute antarkota, akomodasi, dan kebutuhan perjalanan dirangkum agar mudah dipahami sebelum memesan.",
    };
  }

  if (/hokkaido/.test(haystack)) {
    return {
      eyebrow: `${tripType} · Jepang`,
      heroSupport: "Rute, akomodasi, dan perpindahan antarkota dirangkum agar perjalanan lebih mudah dipahami.",
    };
  }

  if (/japan|jepang|tokyo/.test(haystack)) {
    return {
      eyebrow: `${tripType} · Jepang`,
      heroSupport: "Rute, akomodasi, dan perpindahan antarkota ditampilkan dalam satu alur yang mudah dibandingkan.",
    };
  }

  if (/vietnam|sapa|hanoi|danang|phu quoc|ho chi minh/.test(haystack)) {
    return {
      eyebrow: `${tripType} · Vietnam`,
      heroSupport: isFlexibleDate
        ? "Akomodasi, transportasi darat, dan aktivitas dapat dikonfirmasi sesuai tanggal serta kebutuhan grup."
        : "Akomodasi, transportasi darat, dan aktivitas utama ditampilkan dalam satu alur yang mudah dibaca.",
    };
  }

  return {
    eyebrow: `${tripType} · ${tour.country}`,
    heroSupport: "Rute, durasi, fasilitas, dan cara pemesanan dirangkum dalam satu halaman yang mudah dibandingkan.",
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
      weekday: "long",
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
  if (commerceStatus === "departed") return "Sudah berangkat";
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
  const heroImages = [tour.heroImg, ...tour.gallery]
    .filter((image): image is string => Boolean(image?.trim()));
  const route = tour.cityHighlight || tour.country;
  const commerceStatus = getCommerceTourStatus(tour);
  const status = bookingStatus(tour, commerceStatus);
  const unavailable = ["completed", "departed", "sold_out", "waitlist"].includes(commerceStatus);
  const hasPrice = basePrice > 0;
  const priceCaption = tourSubtotalLabel(mandatoryAddOns.length > 0);
  const selectableAddOn = optionalAddOns.find((item) => (
    item.tag === "recommended"
    && /asuransi perjalanan usia sampai 69 tahun/i.test(item.name)
    && Number(item.price) > 0
  ));
  const disclosureOptionalAddOns = optionalAddOns.filter((item) => (
    item !== selectableAddOn
    && !(visaOffers.length > 0 && /visa/i.test(item.name))
  ));
  const hotelEntries = tour.hotel ? Object.entries(tour.hotel) : [];
  const hasInclusionLists = tour.inclusions.length > 0 || tour.exclusions.length > 0;
  const hasFacilities = hasInclusionLists || hotelEntries.length > 0;
  const hasPaymentTerms = Boolean(paymentPlan) || noteParagraphs.length > 0;
  const hasTerms = hasPaymentTerms || visaParagraphs.length > 0;
  // Four parts, in the order a traveller decides: programme, price & date,
  // what is (not) included, and how to pay.
  const sectionTabs = [
    { id: "itinerary", label: "Itinerary", show: itinerary.length > 0 },
    { id: "harga-tanggal", label: "Harga & Tanggal", shortLabel: "Harga", show: true },
    { id: "fasilitas", label: "Include & Exclude", shortLabel: "Include/Exclude", show: hasFacilities },
    {
      id: "pembayaran",
      label: hasPaymentTerms ? "Term Pembayaran" : "Ketentuan",
      shortLabel: hasPaymentTerms ? "Pembayaran" : "Ketentuan",
      show: hasTerms,
    },
  ].filter((item) => item.show).map(({ id, label, shortLabel }) => ({ id, label, shortLabel }));
  const bookingMode = commerceStatus === "completed" || commerceStatus === "departed"
    ? commerceStatus
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
  const optionalAddOnList = (
    <div>
      {disclosureOptionalAddOns.map((item) => (
        <article key={item.name}>
          <p><strong>{item.name}</strong><span>+{formatCurrency(item.price)}</span></p>
          {item.desc && <small>{item.desc}</small>}
          {item.visaHref && <Link href={item.visaHref} scroll={false}>Lihat bantuan visa →</Link>}
        </article>
      ))}
    </div>
  );

  return (
    <div className={styles.tourDetail} id="tour-detail">
      <ScrollReveal rootId="tour-detail" key={tour.id} />
      <a className={styles.skipLink} href="#tour-content">Langsung ke detail perjalanan</a>

      {/* Photos first, then the information as plain, readable text. */}
      {heroImages.length > 0 && (
        <div className={`${styles.shell} ${styles.detailTopGallery}`}>
          <TourHeroGallery images={heroImages} title={tour.title} variant="top" />
        </div>
      )}

      <section className={styles.detailHero} aria-labelledby="tour-title">
        <div className={styles.shell}>
          <nav className={styles.detailBreadcrumb} aria-label="Breadcrumb">
            <Link href="/" scroll={false}>Beranda</Link><span aria-hidden="true">/</span>
            <Link href="/tours" scroll={false}>Jadwal tour</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{tour.title}</span>
          </nav>

          <div className={styles.detailHeroHeading}>
            <div>
              <p className={styles.detailEyebrow}>{copy.eyebrow}</p>
              <h1 id="tour-title">{tour.title}</h1>
            </div>
            <p className={styles.detailHeroPrice}>
              <small>{hasPrice ? "Mulai dari" : "Harga"}</small>
              <strong>{priceLabel}</strong>
              {hasPrice && <small>per orang</small>}
              <span className={unavailable ? styles.detailHeroStatusUnavailable : undefined}>{status}</span>
            </p>
          </div>

          <dl className={styles.detailHeroFacts}>
            <div><dt>Rute</dt><dd>{route}</dd></div>
            {tour.duration && <div><dt>Durasi</dt><dd>{tour.duration}</dd></div>}
            {departureLabel && <div><dt>Keberangkatan</dt><dd>{departureLabel}</dd></div>}
          </dl>
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
          <div className={styles.detailIntro} id="ringkasan">
            {summaryParagraphs.length > 0 ? summaryParagraphs.map((paragraph, index) => <p key={`${paragraph.slice(0, 32)}-${index}`}>{paragraph}</p>) : (
              <p>{copy.heroSupport}</p>
            )}
            <Link
              className={styles.detailDestinationLink}
              href={destinationHref}
              scroll={true}
              data-scroll-reset-after-navigation
            >
              Baca panduan {destinationLabel} →
            </Link>
          </div>

          {itinerary.length > 0 && (
            <section className={styles.detailContentSection} id="itinerary" aria-labelledby="itinerary-title">
              <h2 className={styles.detailSectionTitle} id="itinerary-title">Itinerary</h2>
              <ol className={styles.detailItinerary}>
                {itinerary.map((item, index) => {
                  const date = itineraryDate(tour.tripDate, item.day);
                  const paragraphs = cleanParagraphs(item.description);
                  const dayTitle = normalizeItineraryDisplayTitle(item.title) || `Aktivitas hari ke-${item.day}`;
                  return (
                    <li className={styles.detailDay} key={`${item.day}-${item.title}-${index}`} data-reveal>
                      <p className={styles.detailDayLabel}>
                        <span>Hari {item.day}</span>
                        {date ? <time dateTime={date.iso}>{date.label}</time> : null}
                      </p>
                      <h3>{dayTitle}</h3>
                      {paragraphs.map((paragraph, paragraphIndex) => <p key={`${paragraph.slice(0, 32)}-${paragraphIndex}`}>{paragraph}</p>)}
                      {item.insights.length > 0 && (
                        <dl className={styles.detailDayFacts}>
                          {item.insights.map((insight) => (
                            <div key={`${insight.kind}-${insight.value}`}>
                              <dt>{insight.label}</dt>
                              <dd>{insight.value}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {/* Phones: the PDF sits right after the programme (desktop has it in the sidebar). */}
          <div className={styles.detailMobilePdf}>
            <a
              href={itineraryPdfHref(tour.id)}
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
                hasMandatoryAddOns={mandatoryAddOns.length > 0}
              />.
            </p>
          </div>

          {/* No reveal motion here: the fixed mobile booking bar lives inside this section. */}
          <section className={styles.detailContentSection} id="harga-tanggal" aria-labelledby="harga-tanggal-title">
            <h2 className={styles.detailSectionTitle} id="harga-tanggal-title">
              {isFlexibleDate ? "Rancang tanggal perjalanan" : "Harga & tanggal"}
            </h2>
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
            {disclosureOptionalAddOns.length > 0 && (
              <StableDetails className={styles.detailMobileAddOns}>
                <summary>Tambahan opsional <span>{disclosureOptionalAddOns.length}</span></summary>
                {optionalAddOnList}
              </StableDetails>
            )}
          </section>

          {hasFacilities && (
            <section className={styles.detailContentSection} id="fasilitas" aria-labelledby="fasilitas-title" data-reveal>
              <h2 className={styles.detailSectionTitle} id="fasilitas-title">Include &amp; exclude</h2>
              {hasInclusionLists && (
                <div className={styles.detailIncludedGrid}>
                  {tour.inclusions.length > 0 && (
                    <div className={styles.detailIncludedBox}>
                      <h3>Termasuk</h3>
                      <ul className={styles.detailIncludedList}>{tour.inclusions.map((item, index) => <li key={`${item}-${index}`}><Check aria-hidden="true" />{item}</li>)}</ul>
                    </div>
                  )}
                  {tour.exclusions.length > 0 && (
                    <div className={styles.detailExcludedBox}>
                      <h3>Tidak termasuk</h3>
                      <ul className={`${styles.detailIncludedList} ${styles.detailExcludedList}`}>{tour.exclusions.map((item, index) => <li key={`${item}-${index}`}><X aria-hidden="true" />{item}</li>)}</ul>
                    </div>
                  )}
                </div>
              )}
              {hotelEntries.length > 0 && (
                <div className={styles.detailSubsection} id="hotel">
                  <h3>Akomodasi</h3>
                  <dl className={styles.detailHotelList}>
                    {hotelEntries.map(([label, value]) => (
                      <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                    ))}
                  </dl>
                </div>
              )}
            </section>
          )}

          {hasTerms && (
            <section className={styles.detailContentSection} id="pembayaran" aria-labelledby="pembayaran-title" data-reveal>
              <h2 className={styles.detailSectionTitle} id="pembayaran-title">{hasPaymentTerms ? "Term pembayaran" : "Ketentuan"}</h2>
              {paymentPlan && (
                <div className={styles.detailPayment}>
                  <p className={styles.detailPaymentTotal}>
                    <span>Jumlah dalam skema pembayaran per orang</span>
                    <strong>{paymentPlan.totalLabel}</strong>
                  </p>
                  {paymentPlan.intro && <p>{paymentPlan.intro}</p>}
                  <ol className={styles.detailPaymentSteps}>
                    {paymentPlan.steps.map((step, index) => (
                      <li key={`${step.label}-${index}`}>
                        <span>{step.label}</span>
                        <strong>{step.amountLabel}</strong>
                        <small>Jatuh tempo {step.dueDateLabel}</small>
                      </li>
                    ))}
                  </ol>
                  {(paymentPlan.paymentMethodsLabel || paymentPlan.finePrint) && (
                    <p className={styles.detailFinePrint}>
                      {[paymentPlan.paymentMethodsLabel, paymentPlan.finePrint].filter(Boolean).join(" ")}
                    </p>
                  )}
                </div>
              )}
              {noteParagraphs.length > 0 && (
                <div className={styles.detailSubsection} id="catatan">
                  <h3>Ketentuan paket</h3>
                  {noteParagraphs.map((paragraph, index) => <p key={`${paragraph.slice(0, 32)}-${index}`}>{paragraph}</p>)}
                </div>
              )}
              {visaParagraphs.length > 0 && (
                <div className={styles.detailSubsection}>
                  <h3>Visa</h3>
                  {visaParagraphs.map((paragraph, index) => <p key={`${paragraph.slice(0, 32)}-${index}`}>{paragraph}</p>)}
                </div>
              )}
            </section>
          )}

          {reviews.length > 0 && (
            <section className={styles.detailContentSection} id="ulasan" aria-labelledby="ulasan-title" data-reveal>
              <div className={styles.detailReviewHeading}>
                <h2 className={styles.detailSectionTitle} id="ulasan-title">Ulasan peserta</h2>
                <span><strong>{ratingValue.toFixed(1)}</strong><Star aria-hidden="true" />{reviews.length} ulasan</span>
              </div>
              <div className={styles.detailReviewGrid}>
                {reviews.map((review) => (
                  <article key={review.id}>
                    <div role="img" aria-label={`Rating ${review.rating} dari 5`}>{Array.from({ length: 5 }).map((_, index) => <Star key={index} aria-hidden="true" className={index < review.rating ? styles.detailStarActive : ""} />)}</div>
                    <blockquote>“{review.content}”</blockquote>
                    <p><strong>{review.name}</strong>{review.role && <span> · {review.role}</span>}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          <div className={styles.detailMobileShare}>
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
              href={itineraryPdfHref(tour.id)}
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
                hasMandatoryAddOns={mandatoryAddOns.length > 0}
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
                {optionalAddOnList}
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
            <div className={styles.detailRelatedHeading} data-reveal>
              <h2 className={styles.detailSectionTitle} id="related-title">Jadwal lainnya</h2>
              <Link href="/tours" scroll={false}>Lihat semua jadwal →</Link>
            </div>
            <div className={styles.detailRelatedGrid} data-reveal="group">{relatedTours.map((item) => <CleanTourCard key={item.id} tour={item} compact catalog />)}</div>
          </div>
        </section>
      )}

    </div>
  );
}
