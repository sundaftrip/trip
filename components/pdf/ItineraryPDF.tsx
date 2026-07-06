/* Itinerary PDF document - rendered server-side via @react-pdf/renderer. */
import {
  Document,
  Image,
  Link,
  Page,
  Path,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { Fragment, type ReactNode } from "react";
import { buildItineraryDisplay, type ItineraryInsight } from "@/lib/itinerary-insights";
import { stripItineraryMarkup } from "@/lib/itinerary-markup";
import type { TourPaymentPlan } from "@/lib/tour-payment-plan";
import { A4_PORTRAIT, PAYMENT_TERMS, s } from "./ItineraryPDF.styles";

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  transport?: string | null;
  accommodation?: string | null;
  overnight?: string | null;
  notes?: string | null;
}

export interface PdfAddOn {
  name: string;
  price?: number;
  priceLabel: string;
  tag?: "" | "wajib" | "recommended";
  desc?: string | null;
}

export interface ItineraryPDFProps {
  tour: {
    title: string;
    country: string;
    cityHighlight?: string | null;
    seatsLeft: number;
    tripDateLabel?: string | null;
    duration?: string | null;
    itinerary: ItineraryDay[];
    inclusions: string[];
    exclusions: string[];
    gallery?: string[];
    heroImg?: string | null;
    visaInfo?: string | null;
    notes?: string | null;
    addOns?: PdfAddOn[];
  };
  priceLabel: string;
  priceCoretLabel?: string | null;
  landTourLabel?: string | null;
  company: {
    name?: string;
    logo?: string | null;
    tagline?: string;
    story?: string[];
    address?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    instagram?: string;
    nib?: string;
  };
  faqUrl?: string;
  paymentPlan?: TourPaymentPlan | null;
}

export const PDF_LINKS = {
  website: {
    display: "www.sundaftrip.com",
    href: "https://www.sundaftrip.com",
  },
  instagram: {
    display: "@sundaf.trip",
    href: "https://www.instagram.com/sundaf.trip",
  },
  visa: {
    display: "sundaftrip.com/visa",
    href: "https://sundaftrip.com/visa",
  },
  faq: {
    display: "sundaftrip.com/faq",
    href: "https://sundaftrip.com/faq",
  },
  email: {
    display: "info@sundaftrip.com",
    href: "mailto:info@sundaftrip.com",
  },
  whatsapp: {
    display: "+62 817-7520-2759",
    href: "https://wa.me/6281775202759",
  },
} as const;

const BRAND_DISPLAY = "SUNDAF Trip";

const CRITICAL_OPERATIONAL_NOTES = [
  "Aurora adalah fenomena alam sehingga kemunculannya tidak dapat dijamin.",
  "Minimum keberangkatan 15 peserta.",
  "Jadwal final mengikuti cuaca, kondisi operasional, dan konfirmasi layanan.",
] as const;

type PdfIconName =
  | "bed"
  | "calendar"
  | "clock"
  | "creditCard"
  | "globe"
  | "instagram"
  | "mail"
  | "mapPin"
  | "meal"
  | "note"
  | "phone"
  | "plane"
  | "route"
  | "train"
  | "transfer";

export type DayMetaItem = {
  label: string;
  value: string;
  icon: PdfIconName;
};

function baseCleanText(value?: string | null) {
  return value
    ? stripItineraryMarkup(value)
        .replace(/^[\s"'“”]+|[\s"'“”]+$/g, "")
        .replace(/\s+/g, " ")
        .trim()
    : "";
}

export function polishPdfCopy(value?: string | null) {
  return baseCleanText(value)
    .replace(/\bIconic Rusia\b/g, "ikonik Rusia")
    .replace(/\bes cream\b/gi, "es krim")
    .replace(/\bambil melihat\b/gi, "sambil melihat")
    .replace(/\bjantung kota Piter\b/gi, "jantung kota Saint Petersburg")
    .replace(/\bSammi Village\b/g, "Sami Village")
    .replace(/\bCulinary Tour kepiting alaska\b/gi, "culinary tour kepiting Alaska")
    .replace(/\bBanana yang ditarik snowmobile\b/gi, "Banana Boat")
    .replace(/\bHusky riding\b/gi, "Husky Riding")
    .replace(/\bpemimpin tur berpengalaman start Jakarta\b/gi, "Tour Leader berpengalaman dari Jakarta")
    .replace(/\bAkomodasi\s+\*?3\s*&\s*\*?4\b/gi, "Akomodasi hotel bintang 3 & 4")
    .replace(/\bbagasi pesawat domestik\s*\(2\.5\)\s*PP\b/gi, "Bagasi pesawat domestik 25 kg PP")
    .replace(/\bbagasi pesawat domestik\s*2\.5\s*PP\b/gi, "Bagasi pesawat domestik 25 kg PP")
    .replace(/\bIsmailovo\b/g, "Izmailovo")
    .replace(/\bSt\.?\s+Petersburg\b/gi, "Saint Petersburg")
    .replace(/\bSundaftrip\b/g, BRAND_DISPLAY)
    .replace(/\bSundaf Trip\b/g, BRAND_DISPLAY)
    .replace(/\s+([,.])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanText(value?: string | null) {
  return polishPdfCopy(value);
}

function normalizeListText(value: string) {
  return cleanText(value)
    .replace(/\bFlights?\b/gi, "Penerbangan")
    .replace(/\bIncluding baggage\b/gi, "Termasuk bagasi")
    .replace(/\bBreakfast at (?:the )?hotel\b/gi, "Sarapan di hotel")
    .replace(/\bBreakfasts?\b/gi, "Sarapan")
    .replace(/\bLunches?\b/gi, "Makan siang")
    .replace(/\bDinners?\b/gi, "Makan malam")
    .replace(/\bMeals outside the program\b/gi, "Makan di luar program")
    .replace(/\bMeals?\b/gi, "Makan")
    .replace(/\bTransportasi\b\s*:?\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBodyText(value: string) {
  return normalizeListText(value)
    .replace(/\bPrivate transfer\b/gi, "Transfer privat")
    .replace(/\bReturn flight to\b/gi, "Penerbangan kembali menuju")
    .replace(/\bFlight to\b/gi, "Penerbangan menuju");
}

export function ensureSentencePunctuation(value?: string | null) {
  const text = cleanText(value);
  if (!text || /[.!?…]$/.test(text)) return text;
  return `${text}.`;
}

function splitNormalPriceLabel(value?: string | null) {
  const label = cleanText(value);
  if (!label) return null;

  const match = label.match(/^(.+?)\s*[-\u2013\u2014]\s*hemat\s+(.+)$/i);
  if (!match) return { normalLabel: label, savingsLabel: null };

  return {
    normalLabel: match[1].trim(),
    savingsLabel: `hemat ${match[2].trim()}`,
  };
}

function normalizePriceText(value?: string | null) {
  return cleanText(value).replace(/\s+/g, "").toLowerCase();
}

export function formatPaymentTotalHeading(totalLabel?: string | null, basePriceLabel?: string | null) {
  if (!totalLabel) return "Total Settlement";
  return normalizePriceText(totalLabel) && normalizePriceText(totalLabel) !== normalizePriceText(basePriceLabel)
    ? "Estimasi Total dengan Add-on Terpilih"
    : "Total Settlement";
}

function durationDayCount(duration?: string | null) {
  const match = cleanText(duration).match(/(\d+)\s*hari/i);
  return match ? Number(match[1]) : null;
}

export function getDurationArrivalNote(tour: Pick<ItineraryPDFProps["tour"], "duration" | "itinerary">) {
  const packageDays = durationDayCount(tour.duration);
  const maxItineraryDay = Math.max(0, ...tour.itinerary.map((day) => Number(day.day) || 0));
  if (!packageDays || maxItineraryDay <= packageDays) return null;

  const finalDay = tour.itinerary.find((day) => day.day === maxItineraryDay);
  const finalText = `${finalDay?.title ?? ""} ${finalDay?.description ?? ""}`.toLowerCase();
  if (finalText.includes("jakarta") || finalText.includes("indonesia")) {
    return `Estimasi tiba kembali di Jakarta: Hari ke-${maxItineraryDay}`;
  }

  const duration = cleanText(tour.duration);
  return duration
    ? `Program ${duration} + estimasi kedatangan di hari berikutnya`
    : `Estimasi kedatangan akhir: Hari ke-${maxItineraryDay}`;
}

export function polishItineraryTitle(value?: string | null) {
  const title = polishPdfCopy(value)
    .replace(/^Arrive Jakarta$/i, "Tiba di Jakarta")
    .replace(/^Metro tour/i, "Metro Tour")
    .replace(/^Kereta ke Saint Petersburg\s*•\s*check-in hotel Hermitage Museum \(opsional\), waktu bebas$/i, "Kereta ke Saint Petersburg • Check-in Hotel • Hermitage Museum Opsional")
    .replace(/^Kereta ke Saint Petersburg\s+check-in hotel Hermitage Museum \(opsional\), waktu bebas$/i, "Kereta ke Saint Petersburg • Check-in Hotel • Hermitage Museum Opsional")
    .replace(/^Penerbangan ke Moskow check-in, waktu bebas$/i, "Penerbangan ke Moskow • Check-in • Waktu Bebas")
    .replace(/^Izmailovo Market Transfer$/i, "Izmailovo Market • Transfer Bandara")
    .replace(/^Nevski Prospect/i, "Nevsky Prospect")
    .replace(/^Nevsky Prospect\s*•\s*Kazan Cathedral\s*•\s*Spilled Blood Cathedral\s*•\s*Photostop St\. Isaac\s*•\s*Blue mosque$/i, "Nevsky Prospect • Kazan Cathedral • Spilled Blood Cathedral • St. Isaac • Blue Mosque")
    .replace(/^Penerbangan ke Murmansk\s*•\s*Pemberhentian foto pemecah es Lenin\s*•\s*Perburuan Aurora$/i, "Penerbangan ke Murmansk • Lenin Icebreaker • Aurora Hunt")
    .trim();

  if (/sami village/i.test(title) && /husky farm/i.test(title) && /deer farm/i.test(title)) {
    return "Sami Village Opsional • Husky Farm • Deer Farm • Aurora Hunt";
  }

  return title;
}

function polishItineraryDescription(title: string, value?: string | null) {
  const cleanTitle = polishItineraryTitle(title);
  if (/^Sami Village Opsional/.test(cleanTitle)) {
    return "Agenda seperti Husky Farm, Deer Farm, Reindeer, Husky Riding, Banana Boat, dan culinary tour kepiting Alaska tersedia untuk peserta yang mengambil trip opsional. Peserta yang tidak mengambil trip opsional dapat menggunakan waktu bebas untuk beristirahat atau menikmati fasilitas hotel.";
  }

  return normalizeBodyText(value ?? "");
}

export function professionalizePaymentText(value?: string | null) {
  const text = polishPdfCopy(value);
  if (!text) return "";

  return text
    .replace(/^Pembayaran aman dan fleksibel\. Kamu cukup bayar DP dulu, sisanya dicicil santai sesuai skema pembayaran\.$/i, "Pembayaran dilakukan bertahap sesuai skema di bawah ini.")
    .replace(/^Pembayaran aman dan fleksibel\. Kamu cukup amankan seat dulu, sisanya dilunasi sesuai tempo sebelum berangkat\.$/i, "Peserta dapat mengamankan seat terlebih dahulu, lalu melunasi sesuai tempo sebelum keberangkatan.")
    .replace(/^Sisa\s+(\d+)\s+traveler lagi\s+-\s+gas sebelum habis\s*🙂?$/i, "Sisa $1 seat. Konfirmasi segera untuk mengamankan ketersediaan.")
    .replace(/^Booking sekarang\s+-\s+tim Sundaf bantu cek seat$/i, `Tim ${BRAND_DISPLAY} akan membantu konfirmasi ketersediaan seat.`)
    .replace(/\bKamu\b/g, "Peserta")
    .replace(/\bkamu\b/g, "peserta")
    .replace(/\bdicicil santai\b/gi, "dibayar bertahap")
    .trim();
}

export function buildImportantNotes(notes?: string | null) {
  const cleaned = polishPdfCopy(notes)
    .replace(/^Penawaran Harga paket ini memiliki syarat minimum keberangkatan 15 orang\. Jika peserta tidak memenuhi kuota minimum maka pendaftar akan diinfokan kembali$/i, "")
    .replace(/^Penawaran Harga paket ini memiliki syarat minimum keberangkatan 15 orang\.$/i, "")
    .trim();

  const items = [
    cleaned,
    ...CRITICAL_OPERATIONAL_NOTES,
  ].filter(Boolean);

  return [...new Set(items)];
}

export function splitGalleryPages(images: string[]) {
  const galleryImages = uniquePdfGalleryImages(images);
  return galleryImages.length > 0 ? [galleryImages.slice(0, 6)] : [];
}

export function splitItineraryPages(itinerary: ItineraryDay[], maxDaysPerPage = 10) {
  if (itinerary.length <= maxDaysPerPage) return itinerary.length > 0 ? [itinerary] : [];

  const pages: ItineraryDay[][] = [];
  for (let index = 0; index < itinerary.length; index += maxDaysPerPage) {
    pages.push(itinerary.slice(index, index + maxDaysPerPage));
  }

  return pages;
}

export function destinationChips(tour: ItineraryPDFProps["tour"]) {
  const source = tour.cityHighlight || tour.country;
  const normalizedSource = cleanText(source)
    .replace(/\bMoskow\s+Murmansk\s+Saint Petersburg\b/i, "Moskow, Murmansk, Saint Petersburg");
  const destinations = normalizedSource
    .split(/\s*,\s*|\s+-\s+|\s+\|\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);

  return destinations.length > 1 ? [destinations.join(" • ")] : destinations;
}

function uniquePdfGalleryImages(images?: string[] | null) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const image of images ?? []) {
    const cleaned = cleanText(image);
    if (!cleaned || seen.has(cleaned)) continue;
    seen.add(cleaned);
    items.push(cleaned);
  }

  return items;
}

function profileText(company: ItineraryPDFProps["company"]) {
  const name = cleanText(company.name) || BRAND_DISPLAY;
  const story = company.story?.map(cleanText).find(Boolean);
  const nib = company.nib ? ` NIB ${company.nib}.` : "";

  return story || `${name} adalah brand perjalanan Indonesia untuk paket tour, private/open trip, aurora borealis, Asia Tengah, dan bantuan visa bagi traveler Indonesia.${nib}`;
}

function companyTagline(company: ItineraryPDFProps["company"]) {
  return cleanText(company.tagline) || "Rencana perjalanan rapi, jelas, dan siap dibagikan kepada traveler.";
}

function metaIconFor(label: string, value: string): PdfIconName {
  const joined = `${label} ${value}`.toLowerCase();
  if (joined.includes("kereta") || joined.includes("train")) return "train";
  if (joined.includes("pesawat") || joined.includes("penerbangan") || joined.includes("flight")) return "plane";
  if (joined.includes("transfer") || joined.includes("bus") || joined.includes("car")) return "transfer";
  if (joined.includes("makan") || joined.includes("sarapan") || joined.includes("lunch") || joined.includes("dinner")) return "meal";
  if (joined.includes("bermalam") || joined.includes("hotel") || joined.includes("akomodasi")) return "bed";
  if (joined.includes("waktu") || joined.includes("jam")) return "clock";
  if (joined.includes("jarak") || joined.includes("pendakian")) return "route";
  if (joined.includes("catatan")) return "note";
  return "transfer";
}

function insightDisplay(insight: ItineraryInsight): DayMetaItem {
  if (insight.kind === "meals") return { label: "Makan", value: normalizeListText(insight.value), icon: "meal" };
  if (insight.kind === "transport") {
    const value = normalizeListText(insight.value);
    return { label: "Transportasi", value, icon: metaIconFor("Transportasi", value) };
  }
  if (insight.kind === "stay") return { label: "Bermalam", value: normalizeListText(insight.value), icon: "bed" };
  if (insight.kind === "time") return { label: "Waktu", value: insight.value, icon: "clock" };
  if (insight.kind === "distance") return { label: "Jarak", value: insight.value, icon: "route" };
  if (insight.kind === "ascent") return { label: "Pendakian", value: insight.value, icon: "route" };
  return { label: insight.label, value: insight.value, icon: metaIconFor(insight.label, insight.value) };
}

function isNegativeMetaValue(value?: string | null) {
  return /^(?:-|n\/a|none|no|tidak|tanpa)$/i.test(cleanText(value));
}

function explicitDayMeta(day: ItineraryDay) {
  const items: DayMetaItem[] = [];
  const transport = cleanText(day.transport);
  const accommodation = cleanText(day.accommodation || day.overnight);
  const notes = cleanText(day.notes);

  if (transport) items.push({ label: "Transportasi", value: transport, icon: metaIconFor("Transportasi", transport) });
  if (accommodation && !isNegativeMetaValue(accommodation)) items.push({ label: "Bermalam", value: accommodation, icon: "bed" });
  if (notes) items.push({ label: "Catatan", value: notes, icon: "note" });

  return items;
}

function tourIncludesAccommodation(tour: Pick<ItineraryPDFProps["tour"], "duration" | "inclusions">) {
  const source = [tour.duration, ...tour.inclusions].map(cleanText).join(" ").toLowerCase();
  return /\b(?:akomodasi|hotel|bermalam|penginapan|lodging|accommodation)\b/.test(source);
}

function isFinalArrivalDay(day: ItineraryDay, index: number, allDays: ItineraryDay[]) {
  if (index !== allDays.length - 1) return false;
  const text = `${day.title} ${day.description}`.toLowerCase();
  return /(?:tiba|arrive|arrival|jakarta|indonesia)/i.test(text);
}

function isOutboundDepartureDay(day: ItineraryDay, index: number) {
  if (index !== 0) return false;
  const text = `${day.title} ${day.description}`.toLowerCase();
  return /(?:jakarta|penerbangan|flight|berangkat|departure)/i.test(text);
}

function isHomeboundAirportDay(day: ItineraryDay) {
  const text = `${polishItineraryTitle(day.title)} ${cleanText(day.description)}`.toLowerCase();
  return /(?:transfer bandara|pulang ke indonesia|kembali ke indonesia|menuju indonesia|flight home|return flight)/i.test(text);
}

function shouldInferOvernight(
  day: ItineraryDay,
  index: number,
  allDays: ItineraryDay[],
  tour: Pick<ItineraryPDFProps["tour"], "duration" | "inclusions">,
) {
  const rawAccommodation = cleanText(day.accommodation || day.overnight);
  if (rawAccommodation) return false;
  if (!tourIncludesAccommodation(tour)) return false;
  if (isOutboundDepartureDay(day, index)) return false;
  if (isFinalArrivalDay(day, index, allDays)) return false;
  if (isHomeboundAirportDay(day)) return false;
  return index > 0 && index < allDays.length - 1;
}

export function deriveItineraryMeta(
  day: ItineraryDay,
  index: number,
  allDays: ItineraryDay[],
  tour: Pick<ItineraryPDFProps["tour"], "duration" | "inclusions">,
  inferredMeta: DayMetaItem[] = [],
) {
  const explicitMeta = explicitDayMeta(day);
  const displayInferredMeta = inferredMeta.length > 0
    ? inferredMeta
    : buildItineraryDisplay(day).insights.map(insightDisplay);
  const hasOvernight = [...explicitMeta, ...displayInferredMeta].some((item) => item.label.toLowerCase() === "bermalam");
  const meta = [
    ...explicitMeta,
    ...displayInferredMeta,
    ...(!hasOvernight && shouldInferOvernight(day, index, allDays, tour)
      ? [{ label: "Bermalam", value: "Hotel", icon: "bed" as const }]
      : []),
  ];

  const seen = new Set<string>();
  return meta.filter((item) => {
    const key = `${item.label}:${item.value}`.toLowerCase();
    if (!item.value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function BrandMark() {
  return (
    <View style={s.brandFallback}>
      <Text style={s.brandName}>Sundaf</Text>
      <Text style={s.brandTrip}>Trip</Text>
    </View>
  );
}

export function PdfHeader({
  company,
  runningTitle,
}: {
  company: ItineraryPDFProps["company"];
  runningTitle: string;
}) {
  return (
    <View fixed style={s.header}>
      {company.logo ? (
        // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt support; nearby text names the brand.
        <Image src={company.logo} style={s.logo} />
      ) : (
        <BrandMark />
      )}
      <Text style={s.headerTitle}>{runningTitle}</Text>
    </View>
  );
}

type PdfPageNumber = {
  pageNumber: number;
  totalPages: number;
};

export function PdfFooter({ pageNumber, totalPages }: PdfPageNumber) {
  return (
    <>
      <View fixed style={s.footer}>
        <View style={s.footerLinks}>
          <FooterLink href={PDF_LINKS.website.href} icon="globe">
            {PDF_LINKS.website.display}
          </FooterLink>
          <FooterLink href={PDF_LINKS.instagram.href} icon="instagram">
            {PDF_LINKS.instagram.display}
          </FooterLink>
        </View>
      </View>
      <Text fixed style={s.pageNumber}>{pageNumber}/{totalPages}</Text>
    </>
  );
}

function FooterLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: PdfIconName;
  children: string;
}) {
  return (
    <Link src={href} style={s.footerLinkGroup}>
      <PdfIcon icon={icon} />
      <Text style={s.footerLinkText}>{children}</Text>
    </Link>
  );
}

function PdfPage({
  company,
  runningTitle,
  children,
  cover = false,
  wrap = true,
  pageNumber,
  totalPages,
}: {
  company: ItineraryPDFProps["company"];
  runningTitle: string;
  children: ReactNode;
  cover?: boolean;
  wrap?: boolean;
} & PdfPageNumber) {
  return (
    <Page size={A4_PORTRAIT} style={cover ? s.coverPage : s.page} wrap={wrap}>
      <PdfHeader company={company} runningTitle={runningTitle} />
      {children}
      <PdfFooter pageNumber={pageNumber} totalPages={totalPages} />
    </Page>
  );
}

function SectionShell({
  title,
  children,
  card = true,
}: {
  title: string;
  children: ReactNode;
  card?: boolean;
}) {
  return (
    <View style={s.sectionBlock}>
      <View style={s.sectionTitleRow} wrap={false}>
        <View style={s.sectionAccent} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {card ? <View style={s.sectionCard}>{children}</View> : children}
    </View>
  );
}

function RouteChips({ tour }: { tour: ItineraryPDFProps["tour"] }) {
  const chips = destinationChips(tour);
  if (chips.length === 0) return null;

  return (
    <View style={s.chipRow}>
      {chips.map((chip) => (
        <View key={chip} style={s.chip} wrap={false}>
          <Text style={s.chipText}>{chip}</Text>
        </View>
      ))}
    </View>
  );
}

export function OverviewCards({
  tour,
  priceLabel,
  priceCoretLabel,
  landTourLabel,
}: {
  tour: ItineraryPDFProps["tour"];
  priceLabel: string;
  priceCoretLabel?: string | null;
  landTourLabel?: string | null;
}) {
  const normalPrice = splitNormalPriceLabel(priceCoretLabel);
  const cards = [
    { label: "Durasi", value: tour.duration || "Mengikuti program" },
    { label: "Keberangkatan", value: tour.tripDateLabel || "Tanggal mengikuti jadwal" },
    { label: "Harga Paket Utama", value: priceLabel, price: true },
    { label: "Land tour", value: landTourLabel || `Hubungi tim ${BRAND_DISPLAY}` },
  ];

  return (
    <View style={s.overviewGrid}>
      {cards.map((card, index) => {
        const cardStyle = index % 2 === 1
          ? [s.overviewCard, s.overviewCardRight]
          : s.overviewCard;

        return (
          <View key={card.label} style={cardStyle} wrap={false}>
            <Text style={s.overviewLabel}>{card.label}</Text>
            <Text style={card.price ? s.overviewPrice : s.overviewValue}>{card.value}</Text>
            {card.price && normalPrice ? (
              <Text style={s.priceSubline}>
                Normal {normalPrice.normalLabel}
                {normalPrice.savingsLabel ? ` - ${normalPrice.savingsLabel}` : ""}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function PdfIcon({ icon }: { icon: PdfIconName }) {
  const paths: Record<PdfIconName, string> = {
    bed: "M4 12V6 M4 12h16 M20 12v6 M4 18v-6 M7 12V9h8c1.7 0 3 1.3 3 3",
    calendar: "M7 3v4 M17 3v4 M4 9h16 M6 5h12c1.1 0 2 .9 2 2v12H4V7c0-1.1.9-2 2-2Z",
    clock: "M12 6v6l4 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    creditCard: "M3 6h18v12H3V6Z M3 10h18 M7 15h4",
    globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M3 12h18 M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3Z",
    instagram: "M7 3h10c2.2 0 4 1.8 4 4v10c0 2.2-1.8 4-4 4H7c-2.2 0-4-1.8-4-4V7c0-2.2 1.8-4 4-4Z M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z M17.5 6.5h.01",
    mail: "M4 6h16v12H4V6Z M4 7l8 6 8-6",
    mapPin: "M12 21s7-4.8 7-11a7 7 0 1 0-14 0c0 6.2 7 11 7 11Z M12 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    meal: "M7 3v8 M4 3v8 M10 3v8 M4 7h6 M7 11v10 M17 3c2 2 2 6 0 8v10",
    note: "M6 4h9l3 3v13H6V4Z M15 4v4h4 M9 12h6 M9 16h6",
    phone: "M5 4l4 3-2 3c1.5 3 4 5.5 7 7l3-2 3 4c-1 1.3-2.5 2-4 2C9.5 21 3 14.5 3 8c0-1.5.7-3 2-4Z",
    plane: "M3 11.5 21 4l-7.5 17-3-7-7.5-2.5Z M10.5 14 21 4",
    route: "M5 19c3-8 11-6 14-14 M5 19h4 M5 19v-4 M19 5h-4 M19 5v4",
    train: "M7 3h10c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2Z M8 7h8 M8 17l-2 3 M16 17l2 3 M8.5 13h.01 M15.5 13h.01",
    transfer: "M4 7h12l4 5v5h-2 M6 17H4V7 M8 17h8 M8 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z M20 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
  };

  return (
    <Svg style={s.metaIcon} viewBox="0 0 24 24">
      <Path d={paths[icon]} fill="none" stroke="#087A7D" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MetaInlineItem({ label, value, icon }: DayMetaItem) {
  return (
    <View style={s.metaItem} wrap={false}>
      <PdfIcon icon={icon} />
      <Text style={s.metaText}>
        <Text style={s.metaLabel}>{label}: </Text>
        {value}
      </Text>
    </View>
  );
}

function MetaSeparator() {
  return <Text style={s.metaSeparator}>•</Text>;
}

function ContactInlineItem({
  icon,
  label,
  children,
}: {
  icon: PdfIconName;
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={s.contactInlineItem} wrap={false}>
      <PdfIcon icon={icon} />
      <Text style={s.contactInlineLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function ItineraryTimeline({
  tour,
  itinerary,
  offset = 0,
}: {
  tour: Pick<ItineraryPDFProps["tour"], "duration" | "inclusions" | "itinerary">;
  itinerary: ItineraryDay[];
  offset?: number;
}) {
  const displayDays = itinerary.map(buildItineraryDisplay);

  return (
    <View style={s.timeline}>
      {displayDays.map((displayDay, index) => {
        const sourceDay = itinerary[index];
        const globalIndex = offset + index;
        const rawTitle = displayDay.title || sourceDay.title;
        const description = ensureSentencePunctuation(polishItineraryDescription(rawTitle, displayDay.description || sourceDay.description));
        const inferredMeta = displayDay.insights.map(insightDisplay);
        const meta = deriveItineraryMeta(sourceDay, globalIndex, tour.itinerary, tour, inferredMeta);
        const rowStyle = index === displayDays.length - 1
          ? [s.timelineItem, s.timelineItemLast]
          : s.timelineItem;

        return (
          <View key={`${displayDay.day}-${index}`} style={rowStyle} wrap={false}>
            <View style={s.timelineRail}>
              <View style={s.dayBadge}>
                <Text style={s.dayBadgeText}>H{displayDay.day}</Text>
              </View>
            </View>
            <View style={s.dayContent}>
              <Text style={s.dayTitle}>{polishItineraryTitle(rawTitle)}</Text>
              {description ? <Text style={s.dayDescription}>{description}</Text> : null}
              {meta.length > 0 ? (
                <View style={s.metaRow}>
                  {meta.slice(0, 5).map((item, metaIndex) => (
                    <Fragment key={`${item.label}-${item.value}`}>
                      {metaIndex > 0 ? <MetaSeparator /> : null}
                      <MetaInlineItem {...item} />
                    </Fragment>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function LinkedListText({ text }: { text: string }) {
  const normalized = normalizeListText(text);
  const match = /visa/i.exec(normalized);

  if (!match) return <Text style={s.listText}>{normalized}</Text>;

  return (
    <Text style={s.listText}>
      {normalized.slice(0, match.index)}
      <Link src={PDF_LINKS.visa.href} style={s.link}>{normalized.slice(match.index, match.index + match[0].length)}</Link>
      {normalized.slice(match.index + match[0].length)}
    </Text>
  );
}

function ListItem({
  text,
  icon,
  muted = false,
}: {
  text: string;
  icon: string;
  muted?: boolean;
}) {
  return (
    <View style={s.listItem} wrap={false}>
      <Text style={muted ? [s.listIcon, s.listIconMuted] : s.listIcon}>{icon}</Text>
      <LinkedListText text={text} />
    </View>
  );
}

export function InclusionExclusionSection({
  inclusions,
  exclusions,
}: {
  inclusions: string[];
  exclusions: string[];
}) {
  if (inclusions.length === 0 && exclusions.length === 0) return null;

  return (
    <SectionShell title="Sudah Termasuk / Belum Termasuk" card={false}>
      <View style={s.twoColumn}>
        <View style={[s.sectionCard, s.columnLeft]}>
          <Text style={s.listTitle}>Sudah Termasuk</Text>
          {inclusions.map((item, index) => <ListItem key={`${item}-${index}`} text={item} icon="+" />)}
        </View>
        <View style={[s.sectionCard, s.columnRight]}>
          <Text style={s.listTitle}>Belum Termasuk</Text>
          {exclusions.map((item, index) => <ListItem key={`${item}-${index}`} text={item} icon="-" muted />)}
        </View>
      </View>
    </SectionShell>
  );
}

export function AddOnList({ addOns }: { addOns: PdfAddOn[] }) {
  if (addOns.length === 0) return null;

  return (
    <SectionShell title="Add-on Opsional">
      {addOns.map((item, index) => (
        <View key={`${item.name}-${index}`} style={index === 0 ? undefined : s.addOnRow} wrap={false}>
          <View style={s.addOnTop}>
            <Text style={s.addOnName}>{normalizeListText(item.name)}</Text>
            <Text style={s.addOnPrice}>{item.priceLabel}</Text>
          </View>
          {item.desc ? <Text style={s.addOnDesc}>{normalizeListText(item.desc)}</Text> : null}
          {item.tag === "recommended" ? <Text style={s.recommendedBadge}>Rekomendasi</Text> : null}
        </View>
      ))}
    </SectionShell>
  );
}

export function PaymentSection({
  paymentPlan,
  basePriceLabel,
}: {
  paymentPlan?: TourPaymentPlan | null;
  basePriceLabel: string;
}) {
  const totalHeading = formatPaymentTotalHeading(paymentPlan?.totalLabel, basePriceLabel);
  const hasAddOnTotal = paymentPlan?.totalLabel && normalizePriceText(paymentPlan.totalLabel) !== normalizePriceText(basePriceLabel);

  return (
    <SectionShell title="Settlement & Pembayaran">
      {paymentPlan && paymentPlan.steps.length > 0 ? (
        <>
          <View style={s.paymentIntroRow}>
            <Text style={s.paymentIntro}>{professionalizePaymentText(paymentPlan.intro)}</Text>
            <Text style={s.paymentIntro}>{professionalizePaymentText(paymentPlan.paymentMethodsLabel)}</Text>
          </View>
          <View style={s.paymentTotalBox} wrap={false}>
            <Text style={s.paymentTotalLabel}>{totalHeading}</Text>
            <Text style={s.paymentTotalValue}>{paymentPlan.totalLabel} / orang</Text>
            {hasAddOnTotal ? (
              <Text style={s.paymentTotalNote}>
                Harga paket utama: {basePriceLabel} / orang. Total settlement mencakup komponen wajib atau add-on terpilih sesuai invoice.
              </Text>
            ) : null}
          </View>
          <View style={s.paymentTable}>
            <View style={[s.paymentRow, s.paymentHeader]} wrap={false}>
              <Text style={[s.paymentCell, s.paymentCellBold, s.paymentStage]}>Tahap</Text>
              <Text style={[s.paymentCell, s.paymentCellBold, s.paymentDue]}>Jatuh Tempo</Text>
              <Text style={[s.paymentCell, s.paymentCellBold, s.paymentAmount]}>Nominal</Text>
            </View>
            {paymentPlan.steps.map((step) => (
              <View key={step.label} style={s.paymentRow} wrap={false}>
                <Text style={[s.paymentCell, s.paymentCellBold, s.paymentStage]}>{step.label}</Text>
                <Text style={[s.paymentCell, s.paymentDue]}>{step.dueDateLabel}</Text>
                <Text style={[s.paymentCell, s.paymentCellBold, s.paymentAmount]}>{step.amountLabel}</Text>
              </View>
            ))}
          </View>
          {paymentPlan.finePrint ? <Text style={[s.galleryNote, { marginTop: 8 }]}>{professionalizePaymentText(paymentPlan.finePrint)}</Text> : null}
        </>
      ) : (
        <Text style={s.paymentIntro}>
          Jadwal pembayaran mengikuti invoice resmi {BRAND_DISPLAY} dan konfirmasi administrasi terbaru.
        </Text>
      )}

      <View style={s.termGrid}>
        {PAYMENT_TERMS.map((term, index) => (
          <View key={term} style={index % 2 === 1 ? [s.termCard, s.termCardRight] : s.termCard} wrap={false}>
            <Text style={s.termText}>{term}</Text>
          </View>
        ))}
      </View>
    </SectionShell>
  );
}

function OperationsContactSection({
  company,
  notes,
}: {
  company: ItineraryPDFProps["company"];
  notes?: string | null;
}) {
  const phoneDisplay = cleanText(company.phone) || PDF_LINKS.whatsapp.display;
  const whatsappDisplay = cleanText(company.whatsapp) || PDF_LINKS.whatsapp.display;
  const noteItems = buildImportantNotes(notes);

  return (
    <SectionShell title="Catatan, Visa & Kontak" card={false}>
      <View style={s.operationsGrid}>
        <View style={[s.operationsPanel, s.columnLeft]}>
          <Text style={s.compactTitle}>Catatan Penting</Text>
          {noteItems.map((note) => (
            <View key={note} style={s.compactNoteRow} wrap={false}>
              <PdfIcon icon="note" />
              <Text style={[s.compactBody, s.compactNoteText]}>{note}</Text>
            </View>
          ))}

          <Text style={[s.compactTitle, s.compactTitleSpacing]}>Profil {BRAND_DISPLAY}</Text>
          <Text style={s.compactBody}>{profileText(company)}</Text>
        </View>

        <View style={[s.operationsPanel, s.columnRight]}>
          <Text style={s.compactTitle}>Visa & Registrasi</Text>
          <Text style={s.compactBody}>
            {BRAND_DISPLAY} membantu arahan dan persiapan dokumen visa sesuai kebutuhan destinasi. Keputusan akhir mengikuti ketentuan kedutaan/imigrasi negara tujuan.
          </Text>
          <View style={s.compactLinkRow}>
            <ContactInlineItem icon="globe" label="Visa">
              <Link src={PDF_LINKS.visa.href} style={[s.contactInlineValue, s.link]}>{PDF_LINKS.visa.display}</Link>
            </ContactInlineItem>
            <ContactInlineItem icon="note" label="FAQ">
              <Link src={PDF_LINKS.faq.href} style={[s.contactInlineValue, s.link]}>{PDF_LINKS.faq.display}</Link>
            </ContactInlineItem>
          </View>

          <Text style={[s.compactTitle, s.compactTitleSpacing]}>Kontak {BRAND_DISPLAY}</Text>
          <ContactInlineItem icon="phone" label="WA">
            <Link src={PDF_LINKS.whatsapp.href} style={[s.contactInlineValue, s.link]}>{whatsappDisplay}</Link>
          </ContactInlineItem>
          <ContactInlineItem icon="phone" label="Tel">
            <Text style={s.contactInlineValue}>{phoneDisplay}</Text>
          </ContactInlineItem>
          <ContactInlineItem icon="mail" label="Email">
            <Link src={PDF_LINKS.email.href} style={[s.contactInlineValue, s.link]}>{PDF_LINKS.email.display}</Link>
          </ContactInlineItem>
          <ContactInlineItem icon="globe" label="Web">
            <Link src={PDF_LINKS.website.href} style={[s.contactInlineValue, s.link]}>{PDF_LINKS.website.display}</Link>
          </ContactInlineItem>
          <ContactInlineItem icon="instagram" label="IG">
            <Link src={PDF_LINKS.instagram.href} style={[s.contactInlineValue, s.link]}>@sundaf.trip</Link>
          </ContactInlineItem>
        </View>
      </View>
    </SectionShell>
  );
}

export function GallerySection({ images }: { images: string[] }) {
  const galleryImages = uniquePdfGalleryImages(images).slice(0, 6);
  const leadGalleryImage = galleryImages[0];
  const sideGalleryImages = galleryImages.slice(1, 3);
  const gridGalleryImages = galleryImages.slice(3, 6);

  if (!leadGalleryImage) return null;

  if (galleryImages.length === 1) {
    return (
      <>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt support; the page title identifies the gallery. */}
        <Image src={leadGalleryImage} style={s.gallerySingleImage} />
        <Text style={s.galleryNote}>
          Foto bersifat dokumentasi perjalanan; kondisi destinasi mengikuti cuaca, jadwal final, dan arahan operasional setempat.
        </Text>
      </>
    );
  }

  return (
    <>
      <View style={s.galleryLeadRow}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt support; the page title identifies the gallery. */}
        <Image src={leadGalleryImage} style={s.galleryLeadImage} />
        {sideGalleryImages.length > 0 ? (
          <View style={s.gallerySideStack}>
            {sideGalleryImages.map((image, index) => (
              // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt support.
              <Image key={`side-${index}`} src={image} style={s.gallerySideImage} />
            ))}
          </View>
        ) : null}
      </View>

      {gridGalleryImages.length > 0 ? (
        <View style={s.galleryGrid}>
          {gridGalleryImages.map((image, index) => (
            // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt support.
            <Image
              key={`grid-${index}`}
              src={image}
              style={index === 2 ? [s.galleryGridImage, s.galleryGridImageRight] : s.galleryGridImage}
            />
          ))}
        </View>
      ) : null}

      <Text style={s.galleryNote}>
        Foto bersifat dokumentasi perjalanan; kondisi destinasi mengikuti cuaca, jadwal final, dan arahan operasional setempat.
      </Text>
    </>
  );
}

function CoverPage({
  tour,
  priceLabel,
  priceCoretLabel,
  landTourLabel,
  company,
  runningTitle,
  pageNumber,
  totalPages,
}: {
  tour: ItineraryPDFProps["tour"];
  priceLabel: string;
  priceCoretLabel?: string | null;
  landTourLabel?: string | null;
  company: ItineraryPDFProps["company"];
  runningTitle: string;
} & PdfPageNumber) {
  const subtitle = [
    tour.duration,
    tour.tripDateLabel ? `Keberangkatan ${tour.tripDateLabel}` : "Tanggal mengikuti jadwal",
  ].filter(Boolean).join(" - ");

  return (
    <PdfPage company={company} runningTitle={runningTitle} pageNumber={pageNumber} totalPages={totalPages} cover>
      <View style={s.coverIntro}>
        <View style={s.coverCopy}>
          <Text style={s.label}>SUNDAF ITINERARY</Text>
          <Text style={s.title}>{runningTitle}</Text>
          <Text style={s.subtitle}>{subtitle}</Text>
          <RouteChips tour={tour} />
        </View>
        {tour.heroImg ? (
          <View style={s.heroWrap}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt support; adjacent title describes the tour. */}
            <Image src={tour.heroImg} style={s.heroImage} />
          </View>
        ) : (
          <View style={s.heroFallback}>
            <Text style={s.heroFallbackText}>{companyTagline(company)}</Text>
          </View>
        )}
      </View>

      <OverviewCards
        tour={tour}
        priceLabel={priceLabel}
        priceCoretLabel={priceCoretLabel}
        landTourLabel={landTourLabel}
      />

      <View style={s.trustNote}>
        <Text style={s.trustText}>
          Dokumen ini disusun berdasarkan informasi paket yang tersedia di sundaftrip.com. Detail akhir mengikuti kondisi operasional, cuaca, dan konfirmasi layanan.
        </Text>
      </View>
    </PdfPage>
  );
}

export function ItineraryPDF({
  tour,
  priceLabel,
  priceCoretLabel,
  landTourLabel,
  company,
  paymentPlan,
}: ItineraryPDFProps) {
  const runningTitle = cleanText(tour.title) || "Itinerary SUNDAF";
  const documentTitle = `Itinerary SUNDAF - ${runningTitle}`;
  const addOns = tour.addOns ?? [];
  const itineraryPages = splitItineraryPages(tour.itinerary);
  const itineraryPageEntries = itineraryPages.reduce<Array<{ days: ItineraryDay[]; offset: number }>>((entries, days) => {
    const offset = entries.reduce((sum, entry) => sum + entry.days.length, 0);
    return [...entries, { days, offset }];
  }, []);
  const galleryImages = uniquePdfGalleryImages([tour.heroImg ?? "", ...(tour.gallery ?? [])]);
  const galleryPages = splitGalleryPages(galleryImages);
  const totalPages = 1 + itineraryPageEntries.length + 2 + galleryPages.length;
  const inclusionsPageNumber = 2 + itineraryPageEntries.length;
  const operationsPageNumber = inclusionsPageNumber + 1;
  const galleryStartPageNumber = operationsPageNumber + 1;

  return (
    <Document title={documentTitle} author="Sundaf Trip">
      <CoverPage
        tour={tour}
        priceLabel={priceLabel}
        priceCoretLabel={priceCoretLabel}
        landTourLabel={landTourLabel}
        company={company}
        runningTitle={runningTitle}
        pageNumber={1}
        totalPages={totalPages}
      />

      {itineraryPageEntries.map(({ days, offset }, index) => (
        <PdfPage
          key={`itinerary-${index}`}
          company={company}
          runningTitle={runningTitle}
          pageNumber={2 + index}
          totalPages={totalPages}
        >
          <SectionShell title={index === 0 ? "Alur Perjalanan" : "Alur Perjalanan Lanjutan"} card={false}>
            <ItineraryTimeline tour={tour} itinerary={days} offset={offset} />
          </SectionShell>
        </PdfPage>
      ))}

      <PdfPage
        company={company}
        runningTitle={runningTitle}
        pageNumber={inclusionsPageNumber}
        totalPages={totalPages}
      >
        <InclusionExclusionSection inclusions={tour.inclusions} exclusions={tour.exclusions} />
        <AddOnList addOns={addOns} />
      </PdfPage>

      <PdfPage
        company={company}
        runningTitle={runningTitle}
        pageNumber={operationsPageNumber}
        totalPages={totalPages}
      >
        <PaymentSection paymentPlan={paymentPlan} basePriceLabel={priceLabel} />
        <OperationsContactSection company={company} notes={tour.notes} />
      </PdfPage>

      {galleryPages.map((pageImages, index) => (
        <PdfPage
          key={`gallery-${index}`}
          company={company}
          runningTitle={runningTitle}
          pageNumber={galleryStartPageNumber + index}
          totalPages={totalPages}
        >
          <SectionShell title="Dokumentasi Perjalanan" card>
            <Text style={[s.subtitle, { marginBottom: 10 }]}>
              Beberapa dokumentasi perjalanan SUNDAF Trip sebagai gambaran suasana destinasi.
            </Text>
            <GallerySection images={pageImages} />
          </SectionShell>
        </PdfPage>
      ))}
    </Document>
  );
}
