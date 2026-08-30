import { Document, Page, View, Text as PdfText, Link, Image, StyleSheet } from "@react-pdf/renderer";
import { Fragment, type ComponentProps } from "react";
import type { ItineraryPDFProps } from "./ItineraryPDF";
import { stripItineraryMarkup } from "@/lib/itinerary-markup";
import { normalizeTourServiceTerms } from "@/lib/tour-service-terms";

// Plain text is kept in full. In particular, do not use buildItineraryDisplay:
// it removes meal/stay metadata that this layout intentionally does not repeat.
export function pdfText(value?: string | null): string {
  return normalizeTourServiceTerms(stripItineraryMarkup(value || "")
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/\s*[\u2192\u2794]\s*/g, " - ")
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

const ink = "#17313D";
const teal = "#075E62";
const muted = "#52636A";

// Ordinary words remain intact. Very long supplier references and URLs need
// emergency break points; returning every character preserves the source text.
export function wrapPdfWord(word: string): string[] {
  return word.length > 20 ? word.match(/.{1,10}/gu) || [word] : [word];
}

function Text(props: ComponentProps<typeof PdfText>) {
  return <PdfText {...props} hyphenationCallback={wrapPdfWord} />;
}
const styles = StyleSheet.create({
  // Do not inherit lineHeight from Page: react-pdf's dynamic page-number pass
  // multiplies inherited values on relayout and can corrupt wrapping/footers.
  page: { backgroundColor: "#FFFFFF", fontFamily: "Helvetica", color: ink, fontSize: 10, paddingTop: 66, paddingBottom: 42, paddingHorizontal: 38 },
  logo: { position: "absolute", top: 24, left: 38, width: 91, height: 28, objectFit: "contain" },
  brand: { position: "absolute", top: 24, left: 38, fontFamily: "Helvetica-Bold", fontSize: 16 },
  headerLabel: { position: "absolute", top: 31, right: 38, fontSize: 7.5, color: muted, maxWidth: 310, textAlign: "right" },
  footer: { position: "absolute", top: 811, left: 38, fontSize: 8, color: muted },
  pageNumber: { position: "absolute", top: 811, right: 38, fontSize: 8, color: muted },
  link: { color: teal, textDecoration: "none" },
  title: { fontFamily: "Helvetica-Bold", fontSize: 26, lineHeight: 1.14, marginBottom: 9, paddingRight: 8 },
  meta: { fontSize: 10, color: teal, marginBottom: 5 },
  route: { fontSize: 10, color: muted, marginBottom: 14 },
  hero: { width: "100%", height: 204, objectFit: "cover" },
  caption: { fontSize: 8, color: muted, marginTop: 4, marginBottom: 3 },
  heading: { fontFamily: "Helvetica-Bold", fontSize: 16, lineHeight: 1.2, marginTop: 15, marginBottom: 9 },
  subheading: { fontFamily: "Helvetica-Bold", fontSize: 11, marginTop: 11, marginBottom: 5 },
  paragraph: { fontSize: 10, marginBottom: 5, lineHeight: 1.35 },
  quiet: { color: muted, fontSize: 9, lineHeight: 1.35, marginTop: 4, marginBottom: 5 },
  row: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 4 },
  rowLabel: { flex: 1, paddingRight: 18 },
  rowValue: { width: 132, textAlign: "right", fontFamily: "Helvetica-Bold" },
  total: { flexDirection: "row", alignItems: "center", marginTop: 5, marginBottom: 5, paddingVertical: 9, paddingHorizontal: 11, backgroundColor: "#EFF6F5", color: teal },
  totalLabel: { flex: 1, fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  totalValue: { fontFamily: "Helvetica-Bold", fontSize: 16 },
  optionName: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  optionDescription: { color: muted, fontSize: 9, marginTop: 2 },
  day: { marginBottom: 5, flexShrink: 0 },
  dayTitle: { fontFamily: "Helvetica-Bold", color: teal, fontSize: 11, lineHeight: 1.3, marginBottom: 4 },
  photoRow: { flexDirection: "row", gap: 8, marginTop: 2, marginBottom: 13 },
  photo: { flex: 1, height: 126, objectFit: "cover" },
  columns: { flexDirection: "row", gap: 22 },
  column: { flex: 1 },
  columnTitle: { fontFamily: "Helvetica-Bold", fontSize: 12, marginBottom: 8 },
  listItem: { flexDirection: "row", marginBottom: 4 },
  bullet: { width: 10, color: teal },
  listText: { flex: 1, fontSize: 9.5, lineHeight: 1.35 },
  paymentLabel: { flex: 1, fontFamily: "Helvetica-Bold" },
  paymentDate: { width: 133, color: muted },
  paymentAmount: { width: 125, textAlign: "right", fontFamily: "Helvetica-Bold" },
  closing: { marginTop: 12 },
  closingTitle: { fontFamily: "Helvetica-Bold", fontSize: 13, marginBottom: 6 },
  contact: { fontSize: 9, marginBottom: 3 },
});

function Heading({ children }: { children: string }) {
  return <Text style={styles.heading} minPresenceAhead={54}>{children}</Text>;
}

function Paragraphs({ text }: { text?: string | null }) {
  return <>{(text || "").split(/\n+/).filter((line) => line.trim()).map((line, index) => (
    <Text key={index} style={styles.paragraph} orphans={2} widows={2}>{pdfText(line)}</Text>
  ))}</>;
}

function Day({ day }: { day: ItineraryPDFProps["tour"]["itinerary"][number] }) {
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
      <Text style={styles.dayTitle}>Hari {day.day} / {pdfText(day.title)}</Text>
      {!!opening && <Text style={styles.paragraph}>{pdfText(opening)}</Text>}
    </View>
    <Paragraphs text={continuation.join("\n")} />
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
  const closingTitle = commerceStatus === "completed"
    ? "Rencanakan perjalanan berikutnya."
    : commerceStatus === "sold_out" || commerceStatus === "waitlist"
      ? "Daftar tunggu untuk keberangkatan ini."
      : "Semoga perjalanan ini menjadi kenangan indah.";
  const closingBody = commerceStatus === "completed"
    ? "Perjalanan ini telah selesai. Hubungi tim Sundaf Trip untuk rute dan jadwal berikutnya."
    : commerceStatus === "sold_out" || commerceStatus === "waitlist"
      ? "Hubungi tim Sundaf Trip untuk mencatat nama dan jumlah peserta. Kami akan mengabari bila kursi tersedia kembali."
      : `Sampai jumpa${tour.country ? ` di ${pdfText(tour.country)}` : " di perjalanan berikutnya"} bersama Sundaf Trip.`;

  return (
    <Document title={`Katalog Perjalanan ${pdfText(tour.title)}`} author={companyName} subject={`${pdfText(tour.country)} - ${pdfText(tour.tripDateLabel)}`}>
      {/* One flowing document, not one forced page per section. The renderer
          determines page breaks from actual glyph measurements, not estimates. */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.title}>{pdfText(tour.title)}</Text>
        <Text style={styles.meta}>{[pdfText(tour.tripDateLabel) || "Tanggal mengikuti jadwal", pdfText(tour.duration) || `${tour.itinerary.length} hari`].join("   |   ")}</Text>
        {!!(tour.cityHighlight || tour.country) && <Text style={styles.route}>{pdfText(tour.cityHighlight || tour.country)}</Text>}
        {!!hero && (
          <View wrap={false}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop. */}
            <Image src={hero} style={styles.hero} />
            <Text style={styles.caption}>Foto destinasi sebagai ilustrasi perjalanan.</Text>
          </View>
        )}

        <Heading>Harga perjalanan</Heading>
        <View style={styles.row} wrap={false}>
          <Text style={styles.rowLabel}>Paket dasar per orang</Text>
          <Text style={styles.rowValue}>{pdfText(priceLabel)}</Text>
        </View>
        {mandatoryAddOns.map((item, index) => (
          <View style={styles.row} key={index} wrap={false}>
            <View style={styles.rowLabel}>
              <Text>{pdfText(item.name)} (wajib)</Text>
              {!!item.desc && <Text style={styles.optionDescription}>{pdfText(item.desc)}</Text>}
            </View>
            <Text style={styles.rowValue}>{pdfText(item.priceLabel)}</Text>
          </View>
        ))}
        <View style={styles.total} wrap={false}>
          <Text style={styles.totalLabel}>Total wajib per orang</Text>
          <Text style={styles.totalValue}>{pdfText(inclusivePriceLabel)}</Text>
        </View>
        {!!priceCoretLabel && <Text style={styles.quiet}>Harga normal paket: {pdfText(priceCoretLabel)}</Text>}
        {!!inclusivePriceCoretLabel && <Text style={styles.quiet}>Harga normal total: {pdfText(inclusivePriceCoretLabel)}</Text>}
        {!!landTourLabel && <Text style={styles.quiet}>Land tour: {pdfText(landTourLabel)}</Text>}
        {tour.seatsLeft > 0 && commerceStatus !== "completed" && commerceStatus !== "sold_out" && commerceStatus !== "waitlist" && <Text style={styles.quiet}>{tour.seatsLeft} kursi tersedia saat katalog diterbitkan.</Text>}
        {optional.length > 0 && (
          <>
            <Text style={styles.subheading} minPresenceAhead={40}>Pilihan tambahan</Text>
            <Text style={styles.quiet}>Opsional, belum masuk total di atas.</Text>
            {optional.map((item, index) => (
              <View key={index} style={styles.row}>
                <View style={styles.rowLabel}>
                  <Text style={styles.optionName} minPresenceAhead={14}>{pdfText(item.name)}{item.tag === "recommended" ? " (direkomendasikan)" : ""}</Text>
                  {!!item.desc && <Text style={styles.optionDescription}>{pdfText(item.desc)}</Text>}
                </View>
                <Text style={styles.rowValue}>{pdfText(item.priceLabel)}</Text>
              </View>
            ))}
          </>
        )}

        {tour.itinerary.length > 0 && (
          <>
            <Heading>Rencana perjalanan</Heading>
            {tour.itinerary.map((day, index) => (
              <Fragment key={`${day.day}-${index}`}>
                <Day day={day} />
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
            <Text style={styles.quiet}>Aktivitas mengikuti kondisi cuaca dan operasional di lapangan.</Text>
          </>
        )}

        {(tour.inclusions.length > 0 || tour.exclusions.length > 0) && (
          stackLists ? <>
            <Heading>Detail paket</Heading>
            {tour.inclusions.length > 0 && <>
              <Text style={styles.columnTitle} minPresenceAhead={32}>Sudah termasuk</Text>
              <List items={tour.inclusions} />
            </>}
            {tour.exclusions.length > 0 && <>
              <Text style={styles.columnTitle} minPresenceAhead={32}>Belum termasuk</Text>
              <List items={tour.exclusions} />
            </>}
          </> : <View wrap={false}>
            <Heading>Detail paket</Heading>
            <View style={styles.columns}>
              {tour.inclusions.length > 0 && <View style={styles.column}>
                <Text style={styles.columnTitle} minPresenceAhead={32}>Sudah termasuk</Text>
                <List items={tour.inclusions} />
              </View>}
              {tour.exclusions.length > 0 && <View style={styles.column}>
                <Text style={styles.columnTitle} minPresenceAhead={32}>Belum termasuk</Text>
                <List items={tour.exclusions} />
              </View>}
            </View>
          </View>
        )}

        <Heading>Catatan dan pemesanan</Heading>
        <Paragraphs text={tour.notes || "Harga dan jadwal dapat berubah mengikuti kondisi operasional di lapangan."} />
        <Text style={styles.subheading} minPresenceAhead={32}>Visa</Text>
        <Paragraphs text={tour.visaInfo || "Bantuan visa tersedia melalui Sundaf Trip. Hubungi tim kami untuk dokumen yang diperlukan."} />
        <Text style={styles.quiet}>Informasi pengurusan: <Link src="https://sundaftrip.com/visa" style={styles.link}>sundaftrip.com/visa</Link></Text>

        <Text style={styles.subheading} minPresenceAhead={36}>Pembayaran</Text>
        {paymentPlan && paymentPlan.steps.length > 0 ? <>
          <Paragraphs text={paymentPlan.intro} />
          <Paragraphs text={paymentPlan.paymentMethodsLabel} />
          {paymentPlan.steps.map((step, index) => (
            <View key={index} style={styles.row} wrap={false}>
              <Text style={styles.paymentLabel}>{pdfText(step.label)}</Text>
              <Text style={styles.paymentDate}>{pdfText(step.dueDateLabel)}</Text>
              <Text style={styles.paymentAmount}>{pdfText(step.amountLabel)}</Text>
            </View>
          ))}
          <Text style={styles.quiet}>Total pembayaran per orang: {pdfText(paymentPlan.totalLabel)}</Text>
          <Paragraphs text={paymentPlan.finePrint} />
        </> : <Text style={styles.paragraph}>Jadwal dan nominal pembayaran mengikuti invoice resmi Sundaf Trip.</Text>}
        <Text style={styles.quiet}>DP dan pelunasan mengikuti invoice resmi. Layanan opsional dibayar terpisah setelah dikonfirmasi. Kirim bukti transfer agar pembayaran dapat dicek. Keterlambatan pembayaran dapat memengaruhi ketersediaan tiket, hotel, dan layanan.</Text>
        {!!safeFaq && <Text style={styles.quiet}>Pertanyaan lainnya: <Link src={safeFaq} style={styles.link}>{safeFaq.replace(/^https?:\/\//, "")}</Link></Text>}

        <View style={styles.closing} wrap={false}>
          <Text style={styles.closingTitle}>{closingTitle}</Text>
          <Text style={styles.paragraph}>{closingBody}</Text>
          <Text style={styles.contact}>
            {!!company.whatsapp && <>WhatsApp: <Link style={styles.link} src={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`}>{company.whatsapp}</Link>{"   "}</>}
            {!!company.phone && <>Telepon: <Link style={styles.link} src={`tel:${company.phone.replace(/\s+/g, "")}`}>{company.phone}</Link></>}
          </Text>
          <Text style={styles.contact}>
            {!!company.email && <><Link style={styles.link} src={`mailto:${company.email}`}>{company.email}</Link>{"   "}</>}
            <Link style={styles.link} src={`https://www.instagram.com/${instagram}`}>Instagram @{instagram}</Link>
          </Text>
          {!!company.nib && <Text style={styles.quiet}>NIB {pdfText(company.nib)}</Text>}
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
