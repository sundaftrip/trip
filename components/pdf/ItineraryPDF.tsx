/* eslint-disable jsx-a11y/alt-text */
/* Itinerary PDF document - rendered server-side via @react-pdf/renderer. */
import {
  Document, Page, View, Text, Image, Link, StyleSheet, Font,
} from "@react-pdf/renderer";

const CHARCOAL = "#20252B";
const INK = "#2B2B2B";
const TEAL = "#00ADB5";
const GOLD = "#C79B45";
const GREEN = "#2E7D4F";
const RED = "#B23B2A";
const SUB = "#60666D";
const HAIR = "#DADDE1";
const PAPER = "#F5F2EC";
const WHITE = "#FFFFFF";

Font.registerHyphenationCallback((word) => [word]);

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
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
    nib?: string;
  };
  faqUrl?: string;
}

const s = StyleSheet.create({
  page: {
    backgroundColor: PAPER,
    color: INK,
    fontFamily: "Helvetica",
    paddingTop: 30,
    paddingBottom: 44,
    paddingHorizontal: 34,
  },

  cover: {
    backgroundColor: CHARCOAL,
    color: WHITE,
    padding: 18,
    minHeight: 300,
  },
  coverTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  logoBadge: {
    width: 100,
    height: 34,
    backgroundColor: WHITE,
    padding: 6,
    justifyContent: "center",
  },
  logo: { height: 21, width: 88, objectFit: "contain" },
  logoFallback: { fontFamily: "Helvetica-Bold", fontSize: 11, color: WHITE, letterSpacing: 1 },
  docTag: { fontFamily: "Helvetica-Bold", fontSize: 7.5, color: "#BCEFF2", letterSpacing: 1.2 },
  coverMain: { flexDirection: "row", gap: 16 },
  coverCopy: { width: "49%", paddingRight: 4 },
  kicker: { fontFamily: "Helvetica-Bold", fontSize: 8, color: GOLD, letterSpacing: 1.1 },
  title: { fontFamily: "Helvetica-Bold", fontSize: 22, color: WHITE, marginTop: 8, lineHeight: 1.1 },
  routeLine: { fontSize: 9.5, color: "#E7EAED", lineHeight: 1.4, marginTop: 10 },
  coverImageWrap: { flex: 1, height: 218, borderWidth: 1, borderColor: "#4B535C", padding: 4 },
  hero: { width: "100%", height: "100%", objectFit: "cover" },
  coverFallback: {
    flex: 1,
    height: 218,
    borderWidth: 1,
    borderColor: "#4B535C",
    justifyContent: "center",
    alignItems: "center",
  },
  coverFallbackText: { fontFamily: "Helvetica-Bold", fontSize: 15, color: "#E7EAED" },
  summaryBand: {
    backgroundColor: WHITE,
    flexDirection: "row",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: HAIR,
  },
  summaryCell: { flex: 1, paddingRight: 10 },
  summaryLabel: { fontFamily: "Helvetica-Bold", fontSize: 6.5, color: SUB, letterSpacing: 0.6 },
  summaryValue: { fontFamily: "Helvetica-Bold", fontSize: 10, color: CHARCOAL, marginTop: 4, lineHeight: 1.25 },
  priceValue: { fontFamily: "Helvetica-Bold", fontSize: 15, color: CHARCOAL, marginTop: 2 },
  priceCoret: { fontSize: 7.5, color: "#8B929A", marginTop: 2, textDecoration: "line-through" },
  priceLand: { fontSize: 7.5, color: SUB, marginTop: 2 },

  photoStrip: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: WHITE,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: HAIR,
  },
  stripImage: { flex: 1, height: 74, objectFit: "cover" },

  section: {
    backgroundColor: WHITE,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: HAIR,
  },
  sectionTight: {
    backgroundColor: WHITE,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: HAIR,
  },
  secHeadRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  secAccent: { width: 4, height: 17, backgroundColor: TEAL, marginRight: 8 },
  secHead: { fontFamily: "Helvetica-Bold", fontSize: 13, color: CHARCOAL },

  dayRow: {
    flexDirection: "row",
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: "#ECEEF0",
  },
  dayNumCol: { width: 54, paddingRight: 10 },
  dayBadge: {
    width: 38,
    height: 38,
    backgroundColor: "#E9FBFC",
    borderWidth: 1,
    borderColor: "#BFEFF2",
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumLabel: { fontFamily: "Helvetica-Bold", fontSize: 5.8, color: TEAL, letterSpacing: 0.6 },
  dayNum: { fontFamily: "Helvetica-Bold", fontSize: 15, color: CHARCOAL, marginTop: 1 },
  dayBody: { flex: 1 },
  dayTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.4, color: CHARCOAL, lineHeight: 1.3 },
  dayDesc: { fontSize: 8.6, color: INK, lineHeight: 1.48, marginTop: 4 },

  twoCol: { flexDirection: "row", gap: 22 },
  col: { flex: 1 },
  colHead: { fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 8 },
  liRow: { flexDirection: "row", marginBottom: 4.5 },
  liMark: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    marginRight: 6,
    width: 11,
    textAlign: "center",
  },
  liText: { flex: 1, fontSize: 8.5, lineHeight: 1.42, color: INK },

  para: { fontSize: 8.8, lineHeight: 1.55, color: INK, marginTop: 4 },
  ctaRow: { flexDirection: "row", gap: 14 },
  ctaBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: CHARCOAL,
    padding: 12,
  },
  ctaTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, color: CHARCOAL },
  ctaBody: { fontSize: 8.8, color: INK, lineHeight: 1.5, marginTop: 5 },
  faqBox: {
    width: 190,
    backgroundColor: "#F7F9FA",
    borderLeftWidth: 3,
    borderLeftColor: TEAL,
    padding: 11,
  },
  faqLine: { fontSize: 8.5, color: SUB, lineHeight: 1.45 },
  faqLink: { color: TEAL, fontFamily: "Helvetica-Bold", textDecoration: "none" },
  waLink: { color: TEAL, fontFamily: "Helvetica-Bold", textDecoration: "none" },

  profileName: { fontFamily: "Helvetica-Bold", fontSize: 11, color: CHARCOAL, marginTop: 8 },
  profileTag: { fontSize: 8.8, color: TEAL, fontFamily: "Helvetica-Bold", marginTop: 2 },
  contactGrid: { marginTop: 8, borderTopWidth: 1, borderTopColor: "#ECEEF0", paddingTop: 7 },
  contactRow: { flexDirection: "row", marginTop: 3 },
  contactLabel: { width: 70, fontFamily: "Helvetica-Bold", fontSize: 7.8, color: SUB },
  contactValue: { flex: 1, fontSize: 8.2, color: INK, lineHeight: 1.35 },

  disclaimer: { fontSize: 7.2, color: "#858B92", lineHeight: 1.4, marginTop: 10 },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 34,
    right: 34,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#D1D5DA",
    paddingTop: 7,
  },
  footerText: { fontSize: 7, color: "#7D838A" },
});

function isPdfImage(u?: string | null): u is string {
  return !!u && (/^https?:\/\//.test(u) || /^data:image\/(?:png|jpe?g);base64,/i.test(u));
}

function waLink(raw: string) {
  return `https://wa.me/${raw.replace(/\D/g, "")}`;
}

function uniqueImages(images: Array<string | null | undefined>) {
  return [...new Set(images.filter(isPdfImage))];
}

function SectionHeader({ children }: { children: string }) {
  return (
    <View style={s.secHeadRow}>
      <View style={s.secAccent} />
      <Text style={s.secHead}>{children}</Text>
    </View>
  );
}

export function ItineraryPDF({
  tour, priceLabel, priceCoretLabel, landTourLabel, company, faqUrl,
}: ItineraryPDFProps) {
  const faqDisplay = faqUrl ? faqUrl.replace(/^https?:\/\//, "") : "";
  const heroImage = isPdfImage(tour.heroImg) ? tour.heroImg : null;
  const galleryImages = uniqueImages([tour.heroImg, ...(tour.gallery ?? [])]).slice(0, 3);
  const meta = [
    tour.duration ? ["DURASI", tour.duration] : null,
    tour.tripDateLabel ? ["KEBERANGKATAN", tour.tripDateLabel] : null,
    ["DESTINASI", tour.cityHighlight || tour.country],
  ].filter(Boolean) as [string, string][];

  return (
    <Document title={`Itinerary ${tour.title}`} author={company.name || "Sundaf Trip"}>
      <Page size="A4" style={s.page}>
        <View style={s.cover} wrap={false}>
          <View style={s.coverTop}>
            {isPdfImage(company.logo) ? (
              <View style={s.logoBadge}>
                <Image src={company.logo} style={s.logo} />
              </View>
            ) : (
              <Text style={s.logoFallback}>{(company.name || "SUNDAF TRIP").toUpperCase()}</Text>
            )}
            <Text style={s.docTag}>ITINERARY PERJALANAN</Text>
          </View>

          <View style={s.coverMain}>
            <View style={s.coverCopy}>
              <Text style={s.kicker}>PAKET WISATA {tour.country.toUpperCase()}</Text>
              <Text style={s.title}>{tour.title}</Text>
              <Text style={s.routeLine}>{tour.cityHighlight || tour.country}</Text>
            </View>
            {heroImage ? (
              <View style={s.coverImageWrap}>
                <Image src={heroImage} style={s.hero} />
              </View>
            ) : (
              <View style={s.coverFallback}>
                <Text style={s.coverFallbackText}>{tour.country}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.summaryBand} wrap={false}>
          {meta.map(([label, value], i) => (
            <View key={i} style={s.summaryCell}>
              <Text style={s.summaryLabel}>{label}</Text>
              <Text style={s.summaryValue}>{value}</Text>
            </View>
          ))}
          <View style={s.summaryCell}>
            <Text style={s.summaryLabel}>HARGA PER ORANG</Text>
            <Text style={s.priceValue}>{priceLabel}</Text>
            {!!priceCoretLabel && <Text style={s.priceCoret}>{priceCoretLabel}</Text>}
            {!!landTourLabel && <Text style={s.priceLand}>Land tour: {landTourLabel}</Text>}
          </View>
        </View>

        {galleryImages.length > 1 && (
          <View style={s.photoStrip} wrap={false}>
            {galleryImages.map((img, i) => (
              <Image key={i} src={img} style={s.stripImage} />
            ))}
          </View>
        )}

        {tour.itinerary.length > 0 && (
          <View style={s.section}>
            <SectionHeader>Rencana Perjalanan</SectionHeader>
            {tour.itinerary.map((d, i) => (
              <View key={i} style={s.dayRow} wrap={false}>
                <View style={s.dayNumCol}>
                  <View style={s.dayBadge}>
                    <Text style={s.dayNumLabel}>HARI</Text>
                    <Text style={s.dayNum}>{d.day}</Text>
                  </View>
                </View>
                <View style={s.dayBody}>
                  <Text style={s.dayTitle}>{d.title}</Text>
                  {!!d.description && <Text style={s.dayDesc}>{d.description}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {(tour.inclusions.length > 0 || tour.exclusions.length > 0) && (
          <View style={s.section} break>
            <SectionHeader>Termasuk dan Tidak Termasuk</SectionHeader>
            <View style={s.twoCol}>
              <View style={s.col}>
                <Text style={[s.colHead, { color: GREEN }]}>Sudah Termasuk</Text>
                {tour.inclusions.map((it, i) => (
                  <View key={i} style={s.liRow}>
                    <Text style={[s.liMark, { color: GREEN }]}>+</Text>
                    <Text style={s.liText}>{it}</Text>
                  </View>
                ))}
              </View>
              <View style={s.col}>
                <Text style={[s.colHead, { color: RED }]}>Belum Termasuk</Text>
                {tour.exclusions.map((it, i) => (
                  <View key={i} style={s.liRow}>
                    <Text style={[s.liMark, { color: RED }]}>x</Text>
                    <Text style={s.liText}>{it}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {!!tour.visaInfo && (
          <View style={s.sectionTight} wrap={false}>
            <SectionHeader>Informasi Visa</SectionHeader>
            <Text style={s.para}>{tour.visaInfo}</Text>
          </View>
        )}

        {!!tour.notes && (
          <View style={s.sectionTight} wrap={false}>
            <SectionHeader>Catatan Penting</SectionHeader>
            <Text style={s.para}>{tour.notes}</Text>
          </View>
        )}

        <View style={s.sectionTight} wrap={false}>
          <View style={s.ctaRow}>
            <View style={s.ctaBox}>
              <Text style={s.ctaTitle}>Tertarik bergabung?</Text>
              <Text style={s.ctaBody}>
                {company.whatsapp ? (
                  <>
                    Hubungi kami via WhatsApp{" "}
                    <Link src={waLink(company.whatsapp)} style={s.waLink}>{company.whatsapp}</Link>
                    {" "}untuk ketersediaan kursi dan proses pendaftaran.
                  </>
                ) : "Hubungi kami untuk ketersediaan kursi dan proses pendaftaran."}
                {tour.seatsLeft > 0 ? ` Sisa ${tour.seatsLeft} kursi.` : ""}
              </Text>
            </View>

            {!!faqUrl && (
              <View style={s.faqBox}>
                <Text style={s.faqLine}>
                  Punya pertanyaan lain? Lihat FAQ lengkap di{" "}
                  <Link src={faqUrl} style={s.faqLink}>{faqDisplay}</Link>
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.sectionTight} wrap={false}>
          <SectionHeader>{`Tentang ${company.name || "Sundaf Trip"}`}</SectionHeader>
          {!!company.tagline && <Text style={s.profileTag}>{company.tagline}</Text>}
          {(company.story || []).slice(0, 2).map((p, i) => (
            <Text key={i} style={s.para}>{p}</Text>
          ))}
          <Text style={s.profileName}>{company.name || "Sundaf Trip"}</Text>
          <View style={s.contactGrid}>
            {!!company.address && (
              <View style={s.contactRow}>
                <Text style={s.contactLabel}>Alamat</Text>
                <Text style={s.contactValue}>{company.address}</Text>
              </View>
            )}
            {!!company.phone && (
              <View style={s.contactRow}>
                <Text style={s.contactLabel}>Telepon</Text>
                <Text style={s.contactValue}>{company.phone}</Text>
              </View>
            )}
            {!!company.whatsapp && (
              <View style={s.contactRow}>
                <Text style={s.contactLabel}>WhatsApp</Text>
                <Link style={[s.contactValue, s.waLink]} src={waLink(company.whatsapp)}>{company.whatsapp}</Link>
              </View>
            )}
            {!!company.email && (
              <View style={s.contactRow}>
                <Text style={s.contactLabel}>Email</Text>
                <Text style={s.contactValue}>{company.email}</Text>
              </View>
            )}
            {!!company.website && (
              <View style={s.contactRow}>
                <Text style={s.contactLabel}>Website</Text>
                <Text style={s.contactValue}>{company.website}</Text>
              </View>
            )}
            {!!company.nib && (
              <View style={s.contactRow}>
                <Text style={s.contactLabel}>NIB</Text>
                <Text style={s.contactValue}>{company.nib}</Text>
              </View>
            )}
          </View>
          <Text style={s.disclaimer}>
            Harga dan jadwal dapat berubah sewaktu-waktu mengikuti ketersediaan maskapai dan kurs.
            Itinerary bersifat indikatif dan dapat menyesuaikan kondisi cuaca serta operasional di lapangan.
          </Text>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>{company.website || company.name || "Sundaf Trip"}</Text>
          <Text style={s.footerText} render={({ pageNumber }) => `Halaman ${pageNumber}`} />
        </View>
      </Page>
    </Document>
  );
}
