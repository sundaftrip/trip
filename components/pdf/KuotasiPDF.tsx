/* Kuotasi PDF — quote + auto-generated itinerary, brand Sundaf.
   Navy #0C2647 + Oranye #FE8032. Layout: cover (judul, destinasi, durasi),
   pricing table per PAX, day-by-day itinerary, add-ons, T&C / contact. */

import {
  Document, Page, View, Text, StyleSheet, Image,
} from "@react-pdf/renderer";

const NAVY = "#0C2647";
const ORANGE = "#FE8032";
const INK = "#222222";
const SUB = "#666666";
const HAIR = "#E0E0E0";
const SOFT = "#F5F5F5";

export interface KuotasiPDFProps {
  q: {
    title: string;
    country: string;
    durationDays: number;
    currency: string;
    kursForeign: number;
    marginPct: number;
    validUntil?: Date | string | null;
    notes?: string | null;
    days: Array<{
      dayIndex: number;
      date?: Date | string | null;
      city?: string | null;
      title?: string | null;
      narrativeHtml: string;
      highlights: string[];
    }>;
    pricings: Array<{ paxCount: number; sellingIdr: number }>;
    addons: Array<{ label: string; priceIdr: number; notes?: string | null }>;
  };
  company: {
    name?: string;
    logo?: string;
    whatsapp?: string;
    phone?: string;
    email?: string;
    website?: string;
    nib?: string;
  };
}

const s = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF", color: INK, fontFamily: "Helvetica",
    paddingTop: 38, paddingBottom: 46, paddingHorizontal: 44, fontSize: 9.5, lineHeight: 1.45,
  },

  // Header
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo: { height: 22, objectFit: "contain" },
  logoFallback: { fontFamily: "Helvetica-Bold", fontSize: 13, color: NAVY, letterSpacing: 1.5 },
  docTag: { fontFamily: "Helvetica-Bold", fontSize: 7, color: ORANGE, letterSpacing: 1.2 },

  // Cover
  kicker: { fontFamily: "Helvetica-Bold", fontSize: 8, color: ORANGE, letterSpacing: 1.2, marginTop: 26 },
  title: { fontFamily: "Helvetica-Bold", fontSize: 24, color: NAVY, marginTop: 6, lineHeight: 1.15 },
  subtitle: { fontSize: 10.5, color: SUB, marginTop: 6 },

  metaRow: { flexDirection: "row", marginTop: 18, borderTopWidth: 1, borderTopColor: HAIR, paddingTop: 10 },
  metaCell: { flex: 1 },
  metaLabel: { fontFamily: "Helvetica-Bold", fontSize: 7, color: SUB, letterSpacing: 0.5 },
  metaValue: { fontFamily: "Helvetica-Bold", fontSize: 11, color: NAVY, marginTop: 3 },

  // Section heading
  h2Bar: { flexDirection: "row", alignItems: "center", marginTop: 24, marginBottom: 10 },
  h2BarLine: { width: 18, height: 2, backgroundColor: ORANGE, marginRight: 8 },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 12.5, color: NAVY, letterSpacing: 0.5 },

  // Pricing table
  priceTable: { borderWidth: 1, borderColor: HAIR, borderRadius: 4 },
  priceHead: { flexDirection: "row", backgroundColor: NAVY, paddingVertical: 7, paddingHorizontal: 10 },
  priceHeadText: { color: "#FFFFFF", fontFamily: "Helvetica-Bold", fontSize: 8, letterSpacing: 0.5 },
  priceRow: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: HAIR },
  priceRowAlt: { backgroundColor: SOFT },
  priceCellPax: { width: 60, fontFamily: "Helvetica-Bold", color: NAVY, fontSize: 10 },
  priceCellPaxHead: { width: 60 },
  priceCellPrice: { flex: 1, textAlign: "right", fontFamily: "Helvetica-Bold", fontSize: 11, color: INK },
  priceCellPriceHead: { flex: 1, textAlign: "right" },
  priceNote: { fontSize: 8, color: SUB, marginTop: 6, fontStyle: "italic" },

  // Day card
  dayCard: { marginBottom: 14, borderLeftWidth: 3, borderLeftColor: ORANGE, paddingLeft: 12 },
  dayBadge: {
    flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4,
  },
  dayNum: {
    backgroundColor: NAVY, color: "#FFF", fontFamily: "Helvetica-Bold", fontSize: 8,
    paddingVertical: 2, paddingHorizontal: 6, borderRadius: 3, letterSpacing: 0.5,
  },
  dayCity: { fontFamily: "Helvetica-Bold", fontSize: 9, color: ORANGE, letterSpacing: 0.5 },
  dayDate: { fontSize: 8, color: SUB },
  dayTitle: { fontFamily: "Helvetica-Bold", fontSize: 12, color: NAVY, marginTop: 3, marginBottom: 4 },
  dayHighlights: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 6 },
  chip: {
    backgroundColor: SOFT, color: NAVY, fontSize: 7.5, paddingVertical: 2, paddingHorizontal: 6,
    borderRadius: 2, fontFamily: "Helvetica-Bold",
  },
  dayNarrative: { fontSize: 9.5, color: INK, lineHeight: 1.5 },

  // Addons
  addonRow: { flexDirection: "row", paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: HAIR },
  addonLabel: { flex: 1, fontSize: 9.5, color: INK },
  addonPrice: { width: 110, textAlign: "right", fontFamily: "Helvetica-Bold", fontSize: 10, color: NAVY },

  // Footer
  footer: {
    position: "absolute", bottom: 24, left: 44, right: 44,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTopWidth: 1, borderTopColor: HAIR, paddingTop: 8,
  },
  footerText: { fontSize: 7.5, color: SUB },
  footerBrand: { fontFamily: "Helvetica-Bold", fontSize: 8, color: NAVY },

  pageNum: {
    position: "absolute", bottom: 8, right: 44, fontSize: 7, color: SUB,
  },

  // Contact block
  contactBox: {
    marginTop: 18, padding: 14, borderRadius: 4,
    backgroundColor: NAVY,
  },
  contactTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, color: ORANGE, letterSpacing: 0.5, marginBottom: 6 },
  contactRow: { flexDirection: "row", marginTop: 3 },
  contactLabel: { width: 60, fontSize: 8, color: "#A8B5C8" },
  contactValue: { flex: 1, fontSize: 9, color: "#FFFFFF" },
});

function rupiah(n: number): string {
  return `Rp ${Math.round(n).toLocaleString("id-ID")}`;
}

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

function stripHtml(html: string): string {
  return html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

export function KuotasiPDF({ q, company }: KuotasiPDFProps) {
  const today = new Date();
  const headerCmp = (
    <View style={s.headerRow} fixed>
      {company.logo ? (
        <Image src={company.logo} style={s.logo} />
      ) : (
        <Text style={s.logoFallback}>{company.name ?? "SUNDAF TRIP"}</Text>
      )}
      <Text style={s.docTag}>KUOTASI · {q.country.toUpperCase()}</Text>
    </View>
  );

  return (
    <Document>
      {/* === PAGE 1: COVER + PRICING === */}
      <Page size="A4" style={s.page}>
        {headerCmp}

        <Text style={s.kicker}>PENAWARAN PERJALANAN</Text>
        <Text style={s.title}>{q.title}</Text>
        <Text style={s.subtitle}>
          {q.country} · {q.durationDays} hari · disusun {fmtDate(today)}
          {q.validUntil ? ` · berlaku sampai ${fmtDate(q.validUntil)}` : ""}
        </Text>

        <View style={s.metaRow}>
          <View style={s.metaCell}>
            <Text style={s.metaLabel}>DESTINASI</Text>
            <Text style={s.metaValue}>{q.country}</Text>
          </View>
          <View style={s.metaCell}>
            <Text style={s.metaLabel}>DURASI</Text>
            <Text style={s.metaValue}>{q.durationDays} Hari</Text>
          </View>
          <View style={s.metaCell}>
            <Text style={s.metaLabel}>MATA UANG</Text>
            <Text style={s.metaValue}>{q.currency} @ {q.kursForeign.toLocaleString("id-ID")}</Text>
          </View>
        </View>

        {/* Pricing */}
        <View style={s.h2Bar}>
          <View style={s.h2BarLine} />
          <Text style={s.h2}>HARGA PER PAX</Text>
        </View>

        <View style={s.priceTable}>
          <View style={s.priceHead}>
            <Text style={[s.priceHeadText, s.priceCellPaxHead]}>PAX</Text>
            <Text style={[s.priceHeadText, s.priceCellPriceHead]}>HARGA / ORANG (IDR)</Text>
          </View>
          {q.pricings.map((p, i) => (
            <View key={p.paxCount} style={[s.priceRow, i % 2 === 1 ? s.priceRowAlt : {}]}>
              <Text style={s.priceCellPax}>{p.paxCount} pax</Text>
              <Text style={s.priceCellPrice}>{rupiah(p.sellingIdr)}</Text>
            </View>
          ))}
          {q.pricings.length === 0 && (
            <View style={s.priceRow}>
              <Text style={{ fontSize: 9, color: SUB, fontStyle: "italic" }}>
                Belum ada perhitungan harga. Tambahkan komponen biaya & klik Recalc.
              </Text>
            </View>
          )}
        </View>
        <Text style={s.priceNote}>
          *) Harga berdasarkan kurs {q.currency} {q.kursForeign.toLocaleString("id-ID")} per 1 unit ke IDR.
          Harga final akan dikonfirmasi pada saat deal & pembayaran DP.
        </Text>

        {/* Add-ons */}
        {q.addons.length > 0 && (
          <>
            <View style={s.h2Bar}>
              <View style={s.h2BarLine} />
              <Text style={s.h2}>ADD-ON OPSIONAL</Text>
            </View>
            {q.addons.map((a, i) => (
              <View key={i} style={s.addonRow}>
                <Text style={s.addonLabel}>
                  {a.label}
                  {a.notes ? <Text style={{ color: SUB, fontSize: 8 }}>  ({a.notes})</Text> : null}
                </Text>
                <Text style={s.addonPrice}>{rupiah(a.priceIdr)} / pax</Text>
              </View>
            ))}
          </>
        )}

        <View style={s.footer} fixed>
          <Text style={s.footerBrand}>{company.name ?? "Sundaf Trip"}</Text>
          <Text style={s.footerText}>
            {company.website ?? ""} {company.whatsapp ? `· WA ${company.whatsapp}` : ""}
          </Text>
        </View>
        <Text style={s.pageNum} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>

      {/* === PAGE 2+: ITINERARY === */}
      <Page size="A4" style={s.page}>
        {headerCmp}
        <View style={s.h2Bar}>
          <View style={s.h2BarLine} />
          <Text style={s.h2}>ITINERARY HARI DEMI HARI</Text>
        </View>

        {q.days.map((d) => (
          <View key={d.dayIndex} style={s.dayCard} wrap={false}>
            <View style={s.dayBadge}>
              <Text style={s.dayNum}>HARI {d.dayIndex}</Text>
              {d.city ? <Text style={s.dayCity}>{d.city.toUpperCase()}</Text> : null}
              {d.date ? <Text style={s.dayDate}>· {fmtDate(d.date)}</Text> : null}
            </View>
            {d.title ? <Text style={s.dayTitle}>{d.title}</Text> : null}
            {d.highlights.length > 0 && (
              <View style={s.dayHighlights}>
                {d.highlights.map((h, i) => (
                  <Text key={i} style={s.chip}>{h}</Text>
                ))}
              </View>
            )}
            {d.narrativeHtml ? (
              <Text style={s.dayNarrative}>{stripHtml(d.narrativeHtml)}</Text>
            ) : (
              <Text style={[s.dayNarrative, { color: SUB, fontStyle: "italic" }]}>
                (Narasi hari belum diisi)
              </Text>
            )}
          </View>
        ))}

        {/* Contact */}
        <View style={s.contactBox} wrap={false}>
          <Text style={s.contactTitle}>HUBUNGI KAMI</Text>
          {company.name && <View style={s.contactRow}><Text style={s.contactLabel}>Operator</Text><Text style={s.contactValue}>{company.name}</Text></View>}
          {company.whatsapp && <View style={s.contactRow}><Text style={s.contactLabel}>WhatsApp</Text><Text style={s.contactValue}>{company.whatsapp}</Text></View>}
          {company.email && <View style={s.contactRow}><Text style={s.contactLabel}>Email</Text><Text style={s.contactValue}>{company.email}</Text></View>}
          {company.website && <View style={s.contactRow}><Text style={s.contactLabel}>Website</Text><Text style={s.contactValue}>{company.website}</Text></View>}
          {company.nib && <View style={s.contactRow}><Text style={s.contactLabel}>NIB</Text><Text style={s.contactValue}>{company.nib}</Text></View>}
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerBrand}>{company.name ?? "Sundaf Trip"}</Text>
          <Text style={s.footerText}>
            {company.website ?? ""} {company.whatsapp ? `· WA ${company.whatsapp}` : ""}
          </Text>
        </View>
        <Text style={s.pageNum} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );
}
