/* Itinerary PDF document — rendered server-side via @react-pdf/renderer.
   Clean white layout: company logo, one hero image, the rest is text,
   plus a Sundaf company profile. All content comes from the Tour record
   so the PDF always matches what is published on the website. */
import {
  Document, Page, View, Text, Image, Link, StyleSheet,
} from "@react-pdf/renderer";

const CHARCOAL = "#222831"; // rebrand 2026 — gantikan navy lama
const INK = "#2B2B2B";
const TEAL = "#00ADB5"; // rebrand 2026 — aksen gantikan oranye lama
const GREEN = "#2E7D4F";
const RED = "#B23B2A";
const SUB = "#6B6B6B";
const HAIR = "#E4E4E4";

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
    heroImg?: string | null;
    visaInfo?: string | null;
    notes?: string | null;
  };
  priceLabel: string;
  priceCoretLabel?: string | null;
  landTourLabel?: string | null;
  company: {
    name?: string;
    logo?: string;
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
    backgroundColor: "#FFFFFF", color: INK, fontFamily: "Helvetica",
    paddingTop: 38, paddingBottom: 46, paddingHorizontal: 44,
  },

  logo: { height: 22, width: 79, objectFit: "contain" },
  logoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logoFallback: { fontFamily: "Helvetica-Bold", fontSize: 12, color: CHARCOAL, letterSpacing: 1 },
  docTag: { fontFamily: "Helvetica-Bold", fontSize: 7, color: TEAL, letterSpacing: 1 },

  kicker: { fontFamily: "Helvetica-Bold", fontSize: 8, color: TEAL, letterSpacing: 1, marginTop: 22 },
  title: { fontFamily: "Helvetica-Bold", fontSize: 23, color: CHARCOAL, marginTop: 5, lineHeight: 1.15 },

  hero: { width: "100%", height: 188, objectFit: "cover", marginTop: 12 },

  metaRow: { flexDirection: "row", marginTop: 12, borderTopWidth: 1, borderTopColor: HAIR, paddingTop: 9 },
  metaCell: { flex: 1 },
  metaLabel: { fontFamily: "Helvetica-Bold", fontSize: 6.5, color: SUB, letterSpacing: 0.5 },
  metaValue: { fontFamily: "Helvetica-Bold", fontSize: 9.5, color: CHARCOAL, marginTop: 3 },

  priceWrap: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: HAIR },
  priceCap: { fontFamily: "Helvetica-Bold", fontSize: 7, color: TEAL, letterSpacing: 0.5 },
  priceBig: { fontFamily: "Helvetica-Bold", fontSize: 22, color: CHARCOAL, marginTop: 3 },
  priceCoret: { fontSize: 9, color: "#9A9A9A", marginTop: 3, textDecoration: "line-through" },
  priceLand: { fontSize: 8.5, color: SUB, marginTop: 3 },

  secHead: { fontFamily: "Helvetica-Bold", fontSize: 12, color: CHARCOAL, marginTop: 22 },
  secAccent: { width: 30, height: 2, backgroundColor: TEAL, marginTop: 4, marginBottom: 10 },

  /* itinerary */
  dayRow: {
    flexDirection: "row", paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: HAIR,
  },
  dayNumCol: { width: 46 },
  dayNumLabel: { fontFamily: "Helvetica-Bold", fontSize: 6.5, color: TEAL, letterSpacing: 0.5 },
  dayNum: { fontFamily: "Helvetica-Bold", fontSize: 17, color: CHARCOAL, marginTop: 1 },
  dayBody: { flex: 1 },
  dayTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: CHARCOAL },
  dayDesc: { fontSize: 9, color: INK, lineHeight: 1.5, marginTop: 3 },

  /* lists */
  twoCol: { flexDirection: "row", gap: 26 },
  col: { flex: 1 },
  colHead: { fontFamily: "Helvetica-Bold", fontSize: 9.5, marginBottom: 6 },
  liRow: { flexDirection: "row", marginBottom: 4 },
  liMark: { fontFamily: "Helvetica-Bold", fontSize: 9, marginRight: 6, width: 7 },
  liText: { flex: 1, fontSize: 9, lineHeight: 1.45, color: INK },

  para: { fontSize: 9, lineHeight: 1.55, color: INK, marginTop: 4 },

  ctaBox: { borderWidth: 1, borderColor: CHARCOAL, padding: 12, marginTop: 22 },
  ctaTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, color: CHARCOAL },
  ctaBody: { fontSize: 9, color: INK, lineHeight: 1.5, marginTop: 4 },

  faqLine: { fontSize: 9, color: SUB, lineHeight: 1.5, marginTop: 10 },
  faqLink: { color: TEAL, fontFamily: "Helvetica-Bold", textDecoration: "none" },
  waLink: { color: TEAL, fontFamily: "Helvetica-Bold", textDecoration: "none" },

  /* profile */
  profileWrap: { marginTop: 22, borderTopWidth: 1, borderTopColor: HAIR, paddingTop: 14 },
  profileName: { fontFamily: "Helvetica-Bold", fontSize: 11, color: CHARCOAL },
  profileTag: { fontSize: 9, color: TEAL, fontFamily: "Helvetica-Bold", marginTop: 2 },
  contactRow: { flexDirection: "row", marginTop: 3 },
  contactLabel: { width: 70, fontFamily: "Helvetica-Bold", fontSize: 8, color: SUB },
  contactValue: { flex: 1, fontSize: 8.5, color: INK },

  disclaimer: { fontSize: 7.5, color: "#9A9A9A", lineHeight: 1.4, marginTop: 14 },

  footer: {
    position: "absolute", bottom: 22, left: 44, right: 44,
    flexDirection: "row", justifyContent: "space-between",
    borderTopWidth: 1, borderTopColor: HAIR, paddingTop: 7,
  },
  footerText: { fontSize: 7, color: "#9A9A9A" },
});

function isImg(u?: string | null): u is string {
  return !!u && /^https?:\/\//.test(u);
}

function waLink(raw: string) {
  return `https://wa.me/${raw.replace(/\D/g, "")}`;
}

export function ItineraryPDF({
  tour, priceLabel, priceCoretLabel, landTourLabel, company, faqUrl,
}: ItineraryPDFProps) {
  const faqDisplay = faqUrl ? faqUrl.replace(/^https?:\/\//, "") : "";
  const meta = [
    tour.duration ? ["DURASI", tour.duration] : null,
    tour.tripDateLabel ? ["KEBERANGKATAN", tour.tripDateLabel] : null,
    ["DESTINASI", tour.cityHighlight || tour.country],
  ].filter(Boolean) as [string, string][];

  return (
    <Document title={`Itinerary ${tour.title}`} author={company.name || "Sundaf Trip"}>
      <Page size="A4" style={s.page}>
        {/* logo */}
        <View style={s.logoRow}>
          {isImg(company.logo)
            ? <Image src={company.logo} style={s.logo} />
            : <Text style={s.logoFallback}>{(company.name || "SUNDAF TRIP").toUpperCase()}</Text>}
          <Text style={s.docTag}>ITINERARY PERJALANAN</Text>
        </View>

        {/* title */}
        <Text style={s.kicker}>
          PAKET WISATA {tour.country.toUpperCase()}
        </Text>
        <Text style={s.title}>{tour.title}</Text>

        {/* single hero image */}
        {isImg(tour.heroImg) && <Image src={tour.heroImg} style={s.hero} />}

        {/* meta row */}
        <View style={s.metaRow}>
          {meta.map(([label, value], i) => (
            <View key={i} style={s.metaCell}>
              <Text style={s.metaLabel}>{label}</Text>
              <Text style={s.metaValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* price */}
        <View style={s.priceWrap}>
          <Text style={s.priceCap}>HARGA PER ORANG</Text>
          <Text style={s.priceBig}>{priceLabel}</Text>
          {!!priceCoretLabel && <Text style={s.priceCoret}>{priceCoretLabel}</Text>}
          {!!landTourLabel && <Text style={s.priceLand}>Land Tour: {landTourLabel}</Text>}
        </View>

        {/* itinerary */}
        {tour.itinerary.length > 0 && (
          <View>
            <Text style={s.secHead}>Rencana Perjalanan</Text>
            <View style={s.secAccent} />
            {tour.itinerary.map((d, i) => (
              <View key={i} style={s.dayRow} wrap={false}>
                <View style={s.dayNumCol}>
                  <Text style={s.dayNumLabel}>HARI</Text>
                  <Text style={s.dayNum}>{d.day}</Text>
                </View>
                <View style={s.dayBody}>
                  <Text style={s.dayTitle}>{d.title}</Text>
                  {!!d.description && <Text style={s.dayDesc}>{d.description}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* inclusions / exclusions */}
        {(tour.inclusions.length > 0 || tour.exclusions.length > 0) && (
          <View wrap={false}>
            <Text style={s.secHead}>Termasuk &amp; Tidak Termasuk</Text>
            <View style={s.secAccent} />
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

        {/* visa */}
        {!!tour.visaInfo && (
          <View wrap={false}>
            <Text style={s.secHead}>Informasi Visa</Text>
            <View style={s.secAccent} />
            <Text style={s.para}>{tour.visaInfo}</Text>
          </View>
        )}

        {/* catatan */}
        {!!tour.notes && (
          <View wrap={false}>
            <Text style={s.secHead}>Catatan Penting</Text>
            <View style={s.secAccent} />
            <Text style={s.para}>{tour.notes}</Text>
          </View>
        )}

        {/* cta */}
        <View style={s.ctaBox} wrap={false}>
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

        {/* faq link */}
        {!!faqUrl && (
          <Text style={s.faqLine}>
            Punya pertanyaan lain? Lihat daftar pertanyaan umum (FAQ) selengkapnya di{" "}
            <Link src={faqUrl} style={s.faqLink}>{faqDisplay}</Link>
          </Text>
        )}

        {/* profil sundaf */}
        <View style={s.profileWrap} wrap={false}>
          <Text style={s.secHead}>Tentang {company.name || "Sundaf Trip"}</Text>
          <View style={s.secAccent} />
          {!!company.tagline && <Text style={s.profileTag}>{company.tagline}</Text>}
          {(company.story || []).slice(0, 2).map((p, i) => (
            <Text key={i} style={s.para}>{p}</Text>
          ))}
          <View style={{ marginTop: 8 }}>
            <Text style={s.profileName}>{company.name || "Sundaf Trip"}</Text>
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
        </View>

        <Text style={s.disclaimer}>
          Harga dan jadwal dapat berubah sewaktu-waktu mengikuti ketersediaan maskapai dan kurs.
          Itinerary bersifat indikatif dan dapat menyesuaikan kondisi cuaca serta operasional di lapangan.
        </Text>

        {/* footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{company.website || company.name || "Sundaf Trip"}</Text>
          <Text style={s.footerText} render={({ pageNumber }) => `Halaman ${pageNumber}`} />
        </View>
      </Page>
    </Document>
  );
}
