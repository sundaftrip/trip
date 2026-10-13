import { existsSync } from "node:fs";
import path from "node:path";
import { Document, Page, View, Text as PdfText, Link, Image, StyleSheet, Font, Svg, Polygon } from "@react-pdf/renderer";
import { Fragment, type ComponentProps } from "react";
import type { ItineraryPDFProps } from "./ItineraryPDF";
import { stripItineraryMarkup } from "@/lib/itinerary-markup";
import { normalizeTourServiceTerms } from "@/lib/tour-service-terms";
import { tourSubtotalLabel } from "@/lib/tour-cost-disclosure";

// Plain text is kept in full. In particular, do not use buildItineraryDisplay:
// it removes meal/stay metadata that this layout intentionally does not repeat.
export function pdfText(value?: string | null): string {
  return normalizeTourServiceTerms(stripItineraryMarkup(value || "")
    .replace(/[‐-―−]/g, "-")
    .replace(/\s*[→➔]\s*/g, " - ")
    .replace(/\bpemandu wisata dan pengemudi\b/gi, "Tour Leader & Driver")
    .replace(/\bpemandu wisata\b/gi, "Tour Leader")
    .replace(/\bKelayakan\b/g, "Syarat")
    .replace(/\bkelayakan\b/g, "syarat")
    .replace(/\bpre-registration\b/gi, "pendaftaran awal")
    .replace(/\bgroup fare\b/gi, "tarif grup")
    .replace(/\bfare grup\b/gi, "tarif grup")
    .replace(/\bPrivate coach\b/gi, "Bus privat")
    .replace(/\botoritas taman\b/gi, "pengelola taman")
    .replace(/\bkeadaan kahar\b/gi, "situasi di luar kendali")
    .replace(/\bquotation final\b/gi, "penawaran final")
    .replace(/\bColumbia Icefield petualangan\b/gi, "Columbia Icefield Adventure")
    .replace(/\s+/g, " ").trim());
}

/* Sundaf DMC document format, as on the website (DocFormat.module.css and the
   tour detail page): green slash eyebrow, bold navy title, amber highlighter
   tags for section titles, tables with a dark green header row and
   alternating sage/sand rows, and flat tinted boxes. */
const amber = "#EAB067";
const green = "#2E6751";
const sage = "#EAF3F0";
const sand = "#F5F5EF";
const sageStrong = "#DCEBE5";
const navy = "#1E3645";
const ink = "#2F4352";
const slate = "#51616A";
const rule = "#DCE3E1";

// DM Sans, the website typeface (SIL OFL, assets/fonts/dm-sans). The files are
// traced into the PDF function (next.config.ts); Helvetica remains as a safety
// net so a missing file can never break the download.
const DM_SANS_FILES = {
  regular: path.join(process.cwd(), "assets", "fonts", "dm-sans", "DMSans-Regular.ttf"),
  bold: path.join(process.cwd(), "assets", "fonts", "dm-sans", "DMSans-Bold.ttf"),
};
const hasDmSans = existsSync(DM_SANS_FILES.regular) && existsSync(DM_SANS_FILES.bold);
if (hasDmSans) {
  Font.register({
    family: "DM Sans",
    fonts: [
      { src: DM_SANS_FILES.regular, fontWeight: 400 },
      { src: DM_SANS_FILES.bold, fontWeight: 700 },
    ],
  });
}
const regular = hasDmSans ? { fontFamily: "DM Sans", fontWeight: 400 as const } : { fontFamily: "Helvetica" };
const bold = hasDmSans ? { fontFamily: "DM Sans", fontWeight: 700 as const } : { fontFamily: "Helvetica-Bold" };

// Ordinary words remain intact. Very long supplier references and URLs need
// emergency break points; returning every character preserves the source text.
export function wrapPdfWord(word: string): string[] {
  return word.length > 20 ? word.match(/.{1,10}/gu) || [word] : [word];
}

function Text(props: ComponentProps<typeof PdfText>) {
  return <PdfText {...props} hyphenationCallback={wrapPdfWord} />;
}

const TAG_HEIGHT = 19;

const styles = StyleSheet.create({
  // Do not inherit lineHeight from Page: react-pdf's dynamic page-number pass
  // multiplies inherited values on relayout and can corrupt wrapping/footers.
  page: { backgroundColor: "#FFFFFF", ...regular, color: ink, fontSize: 9.5, paddingTop: 66, paddingBottom: 44, paddingHorizontal: 40 },
  logo: { position: "absolute", top: 24, left: 40, width: 91, height: 28, objectFit: "contain" },
  brand: { position: "absolute", top: 26, left: 40, ...bold, fontSize: 15, color: navy },
  headerLabel: { position: "absolute", top: 33, right: 40, ...bold, fontSize: 7.5, color: green, letterSpacing: 0.4, textTransform: "uppercase", maxWidth: 300, textAlign: "right" },
  footer: { position: "absolute", top: 810, left: 40, fontSize: 8, color: slate },
  pageNumber: { position: "absolute", top: 810, right: 40, fontSize: 8, color: slate },
  link: { color: green, textDecoration: "none" },

  eyebrow: { ...bold, fontSize: 8.5, color: green, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 },
  title: { ...bold, fontSize: 25, lineHeight: 1.12, color: navy, letterSpacing: -0.3, marginBottom: 12, paddingRight: 8 },
  facts: { flexDirection: "row", borderTopWidth: 0.8, borderTopColor: rule, paddingTop: 8, marginBottom: 12, gap: 14 },
  fact: { flex: 1 },
  factWide: { flex: 1.6 },
  factLabel: { fontSize: 7.5, color: slate, marginBottom: 2 },
  factValue: { ...bold, fontSize: 9.5, lineHeight: 1.3, color: navy },
  hero: { width: "100%", height: 196, objectFit: "cover", borderRadius: 6 },
  caption: { fontSize: 7.5, color: slate, marginTop: 4 },

  // Section title: amber highlighter tag, rounded on the left and cut at an
  // angle on the right ("YOUR DAILY ITINERARY" in the planning portfolio).
  tagRow: { flexDirection: "row", marginTop: 14, marginBottom: 8 },
  tagBody: { height: TAG_HEIGHT, justifyContent: "center", paddingLeft: 10, paddingRight: 4, backgroundColor: amber, borderTopLeftRadius: TAG_HEIGHT / 2, borderBottomLeftRadius: TAG_HEIGHT / 2 },
  tagText: { ...bold, fontSize: 9, color: navy, letterSpacing: 0.4, textTransform: "uppercase" },
  subhead: { ...bold, fontSize: 8.5, color: green, letterSpacing: 0.5, textTransform: "uppercase", marginTop: 10, marginBottom: 4 },
  paragraph: { fontSize: 9.5, marginBottom: 4, lineHeight: 1.38 },
  quiet: { color: slate, fontSize: 8.25, lineHeight: 1.35, marginTop: 4, marginBottom: 3 },
  lead: { color: slate, fontSize: 8.25, lineHeight: 1.35, marginTop: -2, marginBottom: 7 },

  // Tables: dark green header row, then alternating sage/sand rows.
  tableHead: { flexDirection: "row", backgroundColor: green, paddingVertical: 4.5, paddingHorizontal: 9 },
  tableHeadText: { ...bold, fontSize: 8.25, color: "#FFFFFF" },
  tableRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 4.5, paddingHorizontal: 9, backgroundColor: sage },
  tableRowAlt: { backgroundColor: sand },
  cellLabel: { flex: 1, paddingRight: 14 },
  cellValue: { width: 128, textAlign: "right", ...bold, color: navy },
  rowName: { ...bold, color: navy },
  rowDescription: { color: slate, fontSize: 8.25, lineHeight: 1.3, marginTop: 1.5 },
  total: { flexDirection: "row", alignItems: "center", paddingVertical: 7, paddingHorizontal: 9, backgroundColor: sageStrong },
  totalLabel: { flex: 1, ...bold, fontSize: 9.5, color: green },
  totalValue: { ...bold, fontSize: 15, color: navy },
  paymentLabel: { flex: 1, ...bold, color: navy },
  paymentDate: { width: 128, color: ink },
  paymentAmount: { width: 112, textAlign: "right", ...bold, color: navy },

  day: { flexShrink: 0 },
  dayTitle: { ...bold, fontSize: 10, lineHeight: 1.3, color: navy, marginBottom: 2 },
  dayNumber: { color: green, textTransform: "uppercase", letterSpacing: 0.3 },
  dayRule: { height: 0.7, backgroundColor: rule, marginTop: 2, marginBottom: 5 },
  photoRow: { flexDirection: "row", gap: 8, marginTop: 2, marginBottom: 8 },
  photo: { flex: 1, height: 116, objectFit: "cover", borderRadius: 5 },

  // Included / not included: flat sage and sand boxes, side by side when short.
  columns: { flexDirection: "row", gap: 8 },
  column: { flex: 1 },
  boxSage: { backgroundColor: sage, paddingVertical: 8, paddingHorizontal: 10 },
  boxSand: { backgroundColor: sand, paddingVertical: 8, paddingHorizontal: 10 },
  boxGap: { marginTop: 8 },
  boxTitle: { ...bold, fontSize: 8.5, color: green, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 },
  listItem: { flexDirection: "row", marginBottom: 3 },
  bullet: { width: 9, color: green, ...bold },
  listText: { flex: 1, fontSize: 9, lineHeight: 1.35 },

  closing: { marginTop: 12, backgroundColor: sage, paddingVertical: 10, paddingHorizontal: 13 },
  closingTitle: { ...bold, fontSize: 12, color: navy, marginBottom: 4 },
  contact: { fontSize: 9, marginBottom: 3 },
});

/** Amber section tag; the angled right edge is drawn as a small triangle. */
function Tag({ children }: { children: string }) {
  return (
    <View style={styles.tagRow} wrap={false} minPresenceAhead={64}>
      <View style={styles.tagBody}>
        <Text style={styles.tagText}>{children}</Text>
      </View>
      <Svg width={11} height={TAG_HEIGHT}>
        <Polygon points={`0,0 11,0 0,${TAG_HEIGHT}`} fill={amber} />
      </Svg>
    </View>
  );
}

function Subhead({ children }: { children: string }) {
  return <Text style={styles.subhead} minPresenceAhead={36}>{children}</Text>;
}

function Paragraphs({ text }: { text?: string | null }) {
  return <>{(text || "").split(/\n+/).filter((line) => line.trim()).map((line, index) => (
    <Text key={index} style={styles.paragraph} orphans={2} widows={2}>{pdfText(line)}</Text>
  ))}</>;
}

const WEATHER_NOTE = "Aktivitas mengikuti kondisi cuaca dan operasional di lapangan.";

function Day({ day, last }: { day: ItineraryPDFProps["tour"]["itinerary"][number]; last: boolean }) {
  const [first = "", ...rest] = day.description.split(/\n+/).filter((line) => line.trim());
  // Keep the heading with a bounded opening paragraph, even if a supplier sends
  // a single multi-page paragraph. The remainder flows; no words are discarded.
  const space = first.lastIndexOf(" ", 420);
  const boundary = first.length > 420
    ? space > 0 ? space : Array.from(first).slice(0, 420).join("").length
    : -1;
  const opening = boundary > 0 ? first.slice(0, boundary) : first;
  const continuation = boundary > 0 ? [first.slice(boundary).trim(), ...rest] : rest;
  return <>
    <View wrap={false} style={styles.day}>
      <Text style={styles.dayTitle}><Text style={styles.dayNumber}>Hari {day.day}</Text> / {pdfText(day.title)}</Text>
      {!!opening && <Text style={styles.paragraph}>{pdfText(opening)}</Text>}
    </View>
    <Paragraphs text={continuation.join("\n")} />
    {!last && <View style={styles.dayRule} />}
  </>;
}

function List({ items }: { items: string[] }) {
  return <>{items.map((item, index) => (
    item.length > 600 ? <Text key={index} style={styles.paragraph} orphans={2} widows={2}>• {pdfText(item)}</Text> : <View style={styles.listItem} key={index} wrap={false}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.listText} orphans={2} widows={2}>{pdfText(item)}</Text>
    </View>
  ))}</>;
}

function contactWebsite(raw?: string) {
  return `https://${(raw || "sundaftrip.com").replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
}

/** "Open trip / Rusia & Aurora", grouped like the eyebrow on the tour page. */
function tripEyebrow(tour: ItineraryPDFProps["tour"], commerceStatus: ItineraryPDFProps["commerceStatus"]) {
  const haystack = `${tour.title} ${tour.country} ${tour.cityHighlight ?? ""}`.toLocaleLowerCase("id-ID");
  const tripType = !tour.tripDateLabel || commerceStatus === "flexible" ? "Land tour privat" : "Open trip";
  const destination = /4[- ]tan|central asia|asia tengah|kazakhstan|kyrgyzstan|uzbekistan|tajikistan/.test(haystack)
    ? "Asia Tengah"
    : /aurora|murmansk/.test(haystack)
      ? "Rusia & Aurora"
      : /russia|rusia/.test(haystack)
        ? "Rusia"
        : /hokkaido|japan|jepang|tokyo/.test(haystack)
          ? "Jepang"
          : /vietnam|sapa|hanoi|danang|phu quoc|ho chi minh/.test(haystack)
            ? "Vietnam"
            : pdfText(tour.country);
  return destination ? `${tripType} / ${destination}` : tripType;
}

export function CleanItineraryPDF({ tour, company, priceLabel, priceCoretLabel, mandatoryAddOns = [], inclusivePriceLabel, inclusivePriceCoretLabel, landTourLabel, paymentPlan, commerceStatus = "available", faqUrl }: ItineraryPDFProps) {
  const companyName = pdfText(company.name) || "Sundaf Trip";
  const website = contactWebsite(company.website);
  const instagram = (company.instagram || "sundaf.trip").replace(/^https?:\/\/(?:www\.)?instagram\.com\//, "").replace(/^@/, "").replace(/\/+$/, "");
  const gallery = [...new Set([tour.heroImg, ...(tour.gallery || [])].filter((src): src is string => Boolean(src?.trim())))];
  const hero = gallery[0];
  const photos = gallery.slice(1, 3);
  const optional = (tour.addOns || []).filter((item) => item.tag !== "wajib");
  const stackLists = tour.inclusions.length + tour.exclusions.length > 16
    || tour.inclusions.length > 8 || tour.exclusions.length > 8
    || [...tour.inclusions, ...tour.exclusions].some((item) => item.length > 220);
  const photoDay = Math.ceil(tour.itinerary.length / 2) - 1;
  const safeFaq = faqUrl && /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(faqUrl) ? `${website}/faq` : faqUrl;
  const route = pdfText(tour.cityHighlight || tour.country);
  const closingTitle = commerceStatus === "completed" || commerceStatus === "departed"
    ? "Rencanakan perjalanan berikutnya."
    : commerceStatus === "sold_out" || commerceStatus === "waitlist"
      ? "Daftar tunggu untuk keberangkatan ini."
      : "Semoga perjalanan ini menjadi kenangan indah.";
  const closingBody = commerceStatus === "departed"
    ? "Keberangkatan ini sudah dimulai. Hubungi tim Sundaf Trip untuk jadwal berikutnya."
    : commerceStatus === "completed"
    ? "Perjalanan ini telah selesai. Hubungi tim Sundaf Trip untuk rute dan jadwal berikutnya."
    : commerceStatus === "sold_out" || commerceStatus === "waitlist"
      ? "Hubungi tim Sundaf Trip untuk mencatat nama dan jumlah peserta. Kami akan mengabari bila kursi tersedia kembali."
      : `Sampai jumpa${tour.country ? ` di ${pdfText(tour.country)}` : " di perjalanan berikutnya"} bersama Sundaf Trip.`;

  return (
    <Document title={`Katalog Perjalanan ${pdfText(tour.title)}`} author={companyName} subject={`${pdfText(tour.country)} - ${pdfText(tour.tripDateLabel)}`}>
      {/* One flowing document, not one forced page per section. The renderer
          determines page breaks from actual glyph measurements, not estimates. */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.eyebrow}>{tripEyebrow(tour, commerceStatus)}</Text>
        <Text style={styles.title}>{pdfText(tour.title)}</Text>
        <View style={styles.facts} wrap={false}>
          {!!route && (
            <View style={styles.factWide}>
              <Text style={styles.factLabel}>Rute</Text>
              <Text style={styles.factValue}>{route}</Text>
            </View>
          )}
          <View style={styles.fact}>
            <Text style={styles.factLabel}>Durasi</Text>
            <Text style={styles.factValue}>{pdfText(tour.duration) || `${tour.itinerary.length} hari`}</Text>
          </View>
          <View style={styles.fact}>
            <Text style={styles.factLabel}>Keberangkatan</Text>
            <Text style={styles.factValue}>{pdfText(tour.tripDateLabel) || "Tanggal mengikuti jadwal"}</Text>
          </View>
        </View>
        {!!hero && (
          <View wrap={false}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop. */}
            <Image src={hero} style={styles.hero} />
            <Text style={styles.caption}>Foto destinasi sebagai ilustrasi perjalanan.</Text>
          </View>
        )}

        <Tag>Harga perjalanan</Tag>
        <View wrap={false}>
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadText, styles.cellLabel]}>Rincian harga</Text>
            <Text style={[styles.tableHeadText, styles.cellValue, { color: "#FFFFFF" }]}>Per orang</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Paket dasar per orang</Text>
            <Text style={styles.cellValue}>{pdfText(priceLabel)}</Text>
          </View>
          {mandatoryAddOns.map((item, index) => (
            <View style={index % 2 === 0 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow} key={index}>
              <View style={styles.cellLabel}>
                <Text>{pdfText(item.name)} (wajib)</Text>
                {!!item.desc && <Text style={styles.rowDescription}>{pdfText(item.desc)}</Text>}
              </View>
              <Text style={styles.cellValue}>{pdfText(item.priceLabel)}</Text>
            </View>
          ))}
          <View style={styles.total}>
            <Text style={styles.totalLabel}>{tourSubtotalLabel(mandatoryAddOns.length > 0)}</Text>
            <Text style={styles.totalValue}>{pdfText(inclusivePriceLabel)}</Text>
          </View>
        </View>
        {!!priceCoretLabel && <Text style={styles.quiet}>Harga normal paket: {pdfText(priceCoretLabel)}</Text>}
        {!!inclusivePriceCoretLabel && <Text style={styles.quiet}>Subtotal harga normal: {pdfText(inclusivePriceCoretLabel)}</Text>}
        <Text style={styles.quiet}>{mandatoryAddOns.length > 0 ? "Tambahan wajib yang dirinci di atas sudah dihitung dalam subtotal. " : ""}Periksa biaya di luar harga paket pada bagian detail paket; pilihan tambahan dibayar terpisah.</Text>
        {!!landTourLabel && <Text style={styles.quiet}>Land tour: {pdfText(landTourLabel)}</Text>}
        {tour.seatsLeft > 0 && ["available", "last_seats", "confirmed"].includes(commerceStatus) && <Text style={styles.quiet}>{tour.seatsLeft} kursi tersedia saat katalog diterbitkan.</Text>}
        {optional.length > 0 && (
          <>
            <Subhead>Pilihan tambahan</Subhead>
            <Text style={[styles.quiet, { marginTop: 0, marginBottom: 5 }]}>Opsional, belum masuk subtotal di atas.</Text>
            {optional.map((item, index) => (
              <View key={index} style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}>
                <View style={styles.cellLabel}>
                  <Text style={styles.rowName} minPresenceAhead={14}>{pdfText(item.name)}{item.tag === "recommended" ? " (direkomendasikan)" : ""}</Text>
                  {!!item.desc && <Text style={styles.rowDescription}>{pdfText(item.desc)}</Text>}
                </View>
                <Text style={styles.cellValue}>{pdfText(item.priceLabel)}</Text>
              </View>
            ))}
          </>
        )}

        {tour.itinerary.length > 0 && (
          <>
            <Tag>Rencana perjalanan</Tag>
            {/* Under the tag, like the short line under each tag on the website,
                so it never sits alone at the top of a page. */}
            <Text style={styles.lead}>{WEATHER_NOTE}</Text>
            {tour.itinerary.map((day, index) => (
              <Fragment key={`${day.day}-${index}`}>
                <Day day={day} last={index === tour.itinerary.length - 1} />
                {index === photoDay && photos.length > 0 && (
                  <View style={styles.photoRow} wrap={false}>
                    {photos.map((src) => (
                      // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop.
                      <Image key={src} src={src} style={styles.photo} />
                    ))}
                  </View>
                )}
              </Fragment>
            ))}
          </>
        )}

        {(tour.inclusions.length > 0 || tour.exclusions.length > 0) && (
          stackLists ? <>
            <Tag>Detail paket</Tag>
            {tour.inclusions.length > 0 && <View style={styles.boxSage}>
              <Text style={styles.boxTitle} minPresenceAhead={32}>Sudah termasuk</Text>
              <List items={tour.inclusions} />
            </View>}
            {tour.exclusions.length > 0 && <View style={tour.inclusions.length > 0 ? [styles.boxSand, styles.boxGap] : styles.boxSand}>
              <Text style={styles.boxTitle} minPresenceAhead={32}>Belum termasuk harga paket</Text>
              <List items={tour.exclusions} />
            </View>}
          </> : <View wrap={false}>
            <Tag>Detail paket</Tag>
            <View style={styles.columns}>
              {tour.inclusions.length > 0 && <View style={[styles.column, styles.boxSage]}>
                <Text style={styles.boxTitle} minPresenceAhead={32}>Sudah termasuk</Text>
                <List items={tour.inclusions} />
              </View>}
              {tour.exclusions.length > 0 && <View style={[styles.column, styles.boxSand]}>
                <Text style={styles.boxTitle} minPresenceAhead={32}>Belum termasuk harga paket</Text>
                <List items={tour.exclusions} />
              </View>}
            </View>
          </View>
        )}

        <Tag>Catatan dan pemesanan</Tag>
        <Paragraphs text={tour.notes || "Harga dan jadwal dapat berubah mengikuti kondisi operasional di lapangan."} />
        <Subhead>Visa</Subhead>
        <Paragraphs text={tour.visaInfo || "Bantuan visa tersedia melalui Sundaf Trip. Hubungi tim kami untuk dokumen yang diperlukan."} />
        <Text style={styles.quiet}>Informasi pengurusan: <Link src="https://sundaftrip.com/visa" style={styles.link}>sundaftrip.com/visa</Link></Text>

        <Subhead>Pembayaran</Subhead>
        {paymentPlan && paymentPlan.steps.length > 0 ? <>
          <Paragraphs text={paymentPlan.intro} />
          <Paragraphs text={paymentPlan.paymentMethodsLabel} />
          <View style={{ marginTop: 3 }} wrap={false}>
            <View style={styles.tableHead}>
              <Text style={[styles.tableHeadText, styles.paymentLabel, { color: "#FFFFFF" }]}>Tahap</Text>
              <Text style={[styles.tableHeadText, styles.paymentDate, { color: "#FFFFFF" }]}>Jatuh tempo</Text>
              <Text style={[styles.tableHeadText, styles.paymentAmount, { color: "#FFFFFF" }]}>Nominal</Text>
            </View>
            {paymentPlan.steps.map((step, index) => (
              <View key={index} style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}>
                <Text style={styles.paymentLabel}>{pdfText(step.label)}</Text>
                <Text style={styles.paymentDate}>{pdfText(step.dueDateLabel)}</Text>
                <Text style={styles.paymentAmount}>{pdfText(step.amountLabel)}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.quiet}>Jumlah dalam skema pembayaran per orang: {pdfText(paymentPlan.totalLabel)}</Text>
          <Paragraphs text={paymentPlan.finePrint} />
        </> : <Text style={styles.paragraph}>Jadwal dan nominal pembayaran mengikuti invoice resmi Sundaf Trip.</Text>}
        <Text style={styles.quiet}>DP dan pelunasan mengikuti invoice resmi. Layanan opsional dibayar terpisah setelah dikonfirmasi. Kirim bukti transfer agar pembayaran dapat dicek. Keterlambatan pembayaran dapat memengaruhi ketersediaan tiket, hotel, dan layanan.</Text>
        {!!safeFaq && <Text style={styles.quiet}>Pertanyaan lainnya: <Link src={safeFaq} style={styles.link}>{safeFaq.replace(/^https?:\/\//, "")}</Link></Text>}

        <View style={styles.closing} wrap={false}>
          <Text style={styles.closingTitle}>{closingTitle}</Text>
          <Text style={styles.paragraph}>{closingBody}</Text>
          {/* One contact line, so the closing box stays compact. */}
          <Text style={styles.contact}>
            {!!company.whatsapp && <>WhatsApp: <Link style={styles.link} src={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`}>{company.whatsapp}</Link>{"   "}</>}
            {!!company.phone && <>Telepon: <Link style={styles.link} src={`tel:${company.phone.replace(/\s+/g, "")}`}>{company.phone}</Link>{"   "}</>}
            {!!company.email && <><Link style={styles.link} src={`mailto:${company.email}`}>{company.email}</Link>{"   "}</>}
            <Link style={styles.link} src={`https://www.instagram.com/${instagram}`}>Instagram @{instagram}</Link>
          </Text>
          {!!company.nib && <Text style={[styles.quiet, { marginBottom: 0 }]}>NIB {pdfText(company.nib)}</Text>}
        </View>

        {company.logo ? (
          // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop; document metadata names the brand.
          <Image fixed src={company.logo} style={styles.logo} />
        ) : <Text fixed style={styles.brand}>{companyName}</Text>}
        <Text fixed style={styles.headerLabel}>{pdfText(tour.country)} / Katalog perjalanan</Text>
        <Text fixed style={styles.footer}><Link src={website} style={styles.link}>{website.replace(/^https?:\/\//, "")}</Link></Text>
        <Text fixed style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );
}
