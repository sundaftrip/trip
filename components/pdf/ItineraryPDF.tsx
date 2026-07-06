/* Itinerary PDF document - rendered server-side via @react-pdf/renderer. */
import {
  Document,
  Image,
  Link,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ReactNode } from "react";
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
    display: "Instagram @sundaf.trip",
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

function cleanText(value?: string | null) {
  return value ? stripItineraryMarkup(value).replace(/\s+/g, " ").trim() : "";
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

function destinationChips(tour: ItineraryPDFProps["tour"]) {
  const source = tour.cityHighlight || tour.country;
  return cleanText(source)
    .split(/\s*,\s*|\s+-\s+|\s+\|\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
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
  const name = company.name || "Sundaf Trip";
  const story = company.story?.map(cleanText).find(Boolean);
  const nib = company.nib ? ` NIB ${company.nib}.` : "";

  return story || `${name} adalah brand perjalanan Indonesia untuk paket tour, private/open trip, aurora borealis, Asia Tengah, dan bantuan visa bagi traveler Indonesia.${nib}`;
}

function companyTagline(company: ItineraryPDFProps["company"]) {
  return cleanText(company.tagline) || "Rencana perjalanan rapi, jelas, dan siap dibagikan kepada traveler.";
}

function insightDisplay(insight: ItineraryInsight) {
  if (insight.kind === "meals") return { label: "Makan", value: normalizeListText(insight.value) };
  if (insight.kind === "transport") return { label: "Transportasi", value: normalizeListText(insight.value) };
  if (insight.kind === "stay") return { label: "Bermalam", value: normalizeListText(insight.value) };
  if (insight.kind === "time") return { label: "Waktu", value: insight.value };
  if (insight.kind === "distance") return { label: "Jarak", value: insight.value };
  if (insight.kind === "ascent") return { label: "Pendakian", value: insight.value };
  return { label: insight.label, value: insight.value };
}

function explicitDayMeta(day: ItineraryDay) {
  const items: Array<{ label: string; value: string }> = [];
  const transport = cleanText(day.transport);
  const accommodation = cleanText(day.accommodation || day.overnight);
  const notes = cleanText(day.notes);

  if (transport) items.push({ label: "Transportasi", value: transport });
  if (accommodation) items.push({ label: "Bermalam", value: accommodation });
  if (notes) items.push({ label: "Catatan", value: notes });

  return items;
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

export function PdfFooter() {
  return (
    <>
      <View fixed style={s.footer}>
        <View style={s.footerLinks}>
          <Link src={PDF_LINKS.website.href} style={s.footerLink}>{PDF_LINKS.website.display}</Link>
          <Link src={PDF_LINKS.instagram.href} style={s.footerLink}>{PDF_LINKS.instagram.display}</Link>
        </View>
      </View>
      <Text
        fixed
        style={s.pageNumber}
        render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => (
          `${pageNumber}/${totalPages}`
        )}
      />
    </>
  );
}

function PdfPage({
  company,
  runningTitle,
  children,
  cover = false,
  wrap = true,
}: {
  company: ItineraryPDFProps["company"];
  runningTitle: string;
  children: ReactNode;
  cover?: boolean;
  wrap?: boolean;
}) {
  return (
    <Page size={A4_PORTRAIT} style={cover ? s.coverPage : s.page} wrap={wrap}>
      <PdfHeader company={company} runningTitle={runningTitle} />
      {children}
      <PdfFooter />
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
    { label: "Harga per orang", value: priceLabel, price: true },
    { label: "Land tour", value: landTourLabel || "Hubungi tim Sundaf" },
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

function MetaBadge({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.metaBadge} wrap={false}>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={s.metaValue}>{value}</Text>
    </View>
  );
}

export function ItineraryTimeline({ itinerary }: { itinerary: ItineraryDay[] }) {
  const displayDays = itinerary.map(buildItineraryDisplay);

  return (
    <View style={s.timeline}>
      {displayDays.map((displayDay, index) => {
        const sourceDay = itinerary[index];
        const description = normalizeBodyText(displayDay.description || sourceDay.description);
        const inferredMeta = displayDay.insights.map(insightDisplay);
        const explicitMeta = explicitDayMeta(sourceDay);
        const seen = new Set<string>();
        const meta = [...explicitMeta, ...inferredMeta].filter((item) => {
          const key = `${item.label}:${item.value}`.toLowerCase();
          if (!item.value || seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        return (
          <View key={`${displayDay.day}-${index}`} style={s.timelineItem} wrap={false}>
            <View style={s.timelineRail}>
              {index < displayDays.length - 1 ? <View style={s.timelineLine} /> : null}
              <View style={s.dayBadge}>
                <Text style={s.dayBadgeLabel}>Hari</Text>
                <Text style={s.dayBadgeNumber}>{displayDay.day}</Text>
              </View>
            </View>
            <View style={s.dayCard}>
              <Text style={s.dayTitle}>{cleanText(displayDay.title || sourceDay.title)}</Text>
              {description ? <Text style={s.dayDescription}>{description}</Text> : null}
              {meta.length > 0 ? (
                <View style={s.metaRow}>
                  {meta.slice(0, 5).map((item) => (
                    <MetaBadge key={`${item.label}-${item.value}`} label={item.label} value={item.value} />
                  ))}
                </View>
              ) : null}
              {sourceDay.notes ? <Text style={s.noteText}>Catatan: {cleanText(sourceDay.notes)}</Text> : null}
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

export function PaymentSection({ paymentPlan }: { paymentPlan?: TourPaymentPlan | null }) {
  return (
    <SectionShell title="Settlement & Pembayaran">
      {paymentPlan && paymentPlan.steps.length > 0 ? (
        <>
          <Text style={s.paymentIntro}>{paymentPlan.intro}</Text>
          <Text style={s.paymentIntro}>{paymentPlan.paymentMethodsLabel}</Text>
          <Text style={s.overviewValue}>Total skema: {paymentPlan.totalLabel} / orang</Text>
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
          {paymentPlan.finePrint ? <Text style={[s.galleryNote, { marginTop: 8 }]}>{paymentPlan.finePrint}</Text> : null}
        </>
      ) : (
        <Text style={s.paymentIntro}>
          Jadwal pembayaran mengikuti invoice resmi Sundaf Trip dan konfirmasi administrasi terbaru.
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

export function VisaContactSection({ company }: { company: ItineraryPDFProps["company"] }) {
  const phoneDisplay = cleanText(company.phone) || PDF_LINKS.whatsapp.display;
  const whatsappDisplay = cleanText(company.whatsapp) || PDF_LINKS.whatsapp.display;

  return (
    <SectionShell title="Visa & Kontak" card={false}>
      <View style={s.twoColumn}>
        <View style={[s.sectionCard, s.columnLeft]}>
          <Text style={s.listTitle}>Visa & Registrasi</Text>
          <Text style={[s.dayDescription, { textAlign: "left" }]}>
            SUNDAF dapat membantu proses arahan dan persiapan dokumen visa sesuai kebutuhan destinasi. Keputusan akhir tetap mengikuti ketentuan kedutaan/imigrasi negara tujuan.
          </Text>
          <Text style={[s.dayDescription, { marginTop: 8 }]}>
            Informasi visa: <Link src={PDF_LINKS.visa.href} style={s.link}>{PDF_LINKS.visa.display}</Link>
          </Text>
          <Text style={[s.dayDescription, { marginTop: 5 }]}>
            FAQ perjalanan: <Link src={PDF_LINKS.faq.href} style={s.link}>{PDF_LINKS.faq.display}</Link>
          </Text>
        </View>
        <View style={[s.sectionCard, s.columnRight]}>
          <Text style={s.listTitle}>Kontak Sundaf Trip</Text>
          <View style={s.contactRow}>
            <Text style={s.contactLabel}>WhatsApp</Text>
            <Link src={PDF_LINKS.whatsapp.href} style={[s.contactValue, s.link]}>{whatsappDisplay}</Link>
          </View>
          <View style={s.contactRow}>
            <Text style={s.contactLabel}>Telepon</Text>
            <Text style={s.contactValue}>{phoneDisplay}</Text>
          </View>
          <View style={s.contactRow}>
            <Text style={s.contactLabel}>Email</Text>
            <Link src={PDF_LINKS.email.href} style={[s.contactValue, s.link]}>{PDF_LINKS.email.display}</Link>
          </View>
          <View style={s.contactRow}>
            <Text style={s.contactLabel}>Website</Text>
            <Link src={PDF_LINKS.website.href} style={[s.contactValue, s.link]}>{PDF_LINKS.website.display}</Link>
          </View>
          <View style={s.contactRow}>
            <Text style={s.contactLabel}>Instagram</Text>
            <Link src={PDF_LINKS.instagram.href} style={[s.contactValue, s.link]}>@sundaf.trip</Link>
          </View>
        </View>
      </View>
    </SectionShell>
  );
}

function ImportantNotesSection({ notes }: { notes?: string | null }) {
  const notesCopy = cleanText(notes) || "Harga dan jadwal dapat berubah mengikuti kondisi operasional, cuaca, ketersediaan layanan, dan konfirmasi akhir dari pihak terkait.";

  return (
    <SectionShell title="Catatan Penting">
      <Text style={s.dayDescription}>{notesCopy}</Text>
    </SectionShell>
  );
}

function ProfileSection({ company }: { company: ItineraryPDFProps["company"] }) {
  return (
    <SectionShell title="Profil Sundaf Trip">
      <Text style={s.profileText}>{profileText(company)}</Text>
    </SectionShell>
  );
}

export function GallerySection({ images }: { images: string[] }) {
  const galleryImages = uniquePdfGalleryImages(images).slice(0, 7);
  const leadGalleryImage = galleryImages[0];
  const sideGalleryImages = galleryImages.slice(1, 3);
  const gridGalleryImages = galleryImages.slice(3, 7);

  if (!leadGalleryImage) return null;

  return (
    <>
      <View style={s.galleryLeadRow}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt support; the page title identifies the gallery. */}
        <Image src={leadGalleryImage} style={s.galleryLeadImage} />
        <View style={s.gallerySideStack}>
          {sideGalleryImages.map((image, index) => (
            // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt support.
            <Image key={`side-${index}`} src={image} style={s.gallerySideImage} />
          ))}
        </View>
      </View>

      {gridGalleryImages.length > 0 ? (
        <View style={s.galleryGrid}>
          {gridGalleryImages.map((image, index) => (
            // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt support.
            <Image
              key={`grid-${index}`}
              src={image}
              style={index % 2 === 1 ? [s.galleryGridImage, s.galleryGridImageRight] : s.galleryGridImage}
            />
          ))}
        </View>
      ) : null}

      <Text style={s.galleryNote}>
        Foto bersifat dokumentasi perjalanan. Susunan aktivitas, cuaca, dan kondisi lapangan mengikuti jadwal final serta arahan operasional setempat.
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
}: {
  tour: ItineraryPDFProps["tour"];
  priceLabel: string;
  priceCoretLabel?: string | null;
  landTourLabel?: string | null;
  company: ItineraryPDFProps["company"];
  runningTitle: string;
}) {
  const subtitle = [
    `Disiapkan oleh ${company.name || "Sundaf Trip"}`,
    tour.duration,
    tour.tripDateLabel || "Tanggal mengikuti jadwal",
  ].filter(Boolean).join(" - ");

  return (
    <PdfPage company={company} runningTitle={runningTitle} cover>
      <View style={s.coverIntro}>
        <View style={s.coverCopy}>
          <Text style={s.label}>Rencana Perjalanan</Text>
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
  const runningTitle = `Rencana Perjalanan ${tour.title}`;
  const addOns = tour.addOns ?? [];
  const galleryImages = uniquePdfGalleryImages([tour.heroImg ?? "", ...(tour.gallery ?? [])]);

  return (
    <Document title={runningTitle} author="Sundaf Trip">
      <CoverPage
        tour={tour}
        priceLabel={priceLabel}
        priceCoretLabel={priceCoretLabel}
        landTourLabel={landTourLabel}
        company={company}
        runningTitle={runningTitle}
      />

      <PdfPage company={company} runningTitle={runningTitle}>
        <SectionShell title="Rencana Perjalanan" card={false}>
          <ItineraryTimeline itinerary={tour.itinerary} />
        </SectionShell>
      </PdfPage>

      <PdfPage company={company} runningTitle={runningTitle}>
        <InclusionExclusionSection inclusions={tour.inclusions} exclusions={tour.exclusions} />
        <AddOnList addOns={addOns} />
      </PdfPage>

      <PdfPage company={company} runningTitle={runningTitle}>
        <PaymentSection paymentPlan={paymentPlan} />
        <ImportantNotesSection notes={tour.notes} />
      </PdfPage>

      <PdfPage company={company} runningTitle={runningTitle}>
        <VisaContactSection company={company} />
        <ProfileSection company={company} />
      </PdfPage>

      {galleryImages.length > 0 ? (
        <PdfPage company={company} runningTitle={runningTitle}>
          <SectionShell title="Dokumentasi Perjalanan" card>
            <Text style={[s.subtitle, { marginBottom: 10 }]}>
              Foto dipilih dari galeri paket ini dan dokumentasi perjalanan Sundaf Trip.
            </Text>
            <GallerySection images={galleryImages} />
          </SectionShell>
        </PdfPage>
      ) : null}
    </Document>
  );
}
