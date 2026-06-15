/* eslint-disable jsx-a11y/alt-text */
/* Itinerary PDF document - rendered server-side via @react-pdf/renderer. */
import {
  Document, Page, View, Text, Image, Link, StyleSheet, Font, Svg, Path,
} from "@react-pdf/renderer";

const CHARCOAL = "#20252B";
const INK = "#2B2B2B";
const TEAL = "#00ADB5";
const GOLD = "#C79B45";
const GREEN = "#2E7D4F";
const RED = "#B23B2A";
const SUB = "#60666D";
const HAIR = "#DADDE1";
const DASH = "#C9D1D8";
const PAPER = "#F5F2EC";
const WHITE = "#FFFFFF";
const VISA_URL = "https://sundaftrip.com/visa";

Font.registerHyphenationCallback((word) => [word]);

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface PdfAddOn {
  name: string;
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
    backgroundColor: WHITE,
    color: INK,
    padding: 18,
    minHeight: 342,
    borderBottomWidth: 1,
    borderBottomColor: HAIR,
  },
  coverTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  logoBadge: {
    width: 132,
    height: 42,
    justifyContent: "center",
  },
  logo: { height: 34, width: 126, objectFit: "contain" },
  logoFallback: { fontFamily: "Helvetica-Bold", fontSize: 13, color: CHARCOAL, letterSpacing: 1 },
  docTag: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: TEAL, letterSpacing: 1.4 },
  coverMain: { flexDirection: "row", gap: 18, alignItems: "center" },
  coverCopy: { width: 270, paddingRight: 8 },
  title: { fontFamily: "Helvetica-Bold", fontSize: 39, color: CHARCOAL, lineHeight: 1.02 },
  routeLine: { fontFamily: "Helvetica-Bold", fontSize: 14, color: SUB, lineHeight: 1.35, marginTop: 15 },
  titleAccentRow: { flexDirection: "row", marginTop: 18 },
  titleAccentTeal: { width: 82, height: 5, backgroundColor: TEAL },
  titleAccentGold: { width: 34, height: 5, backgroundColor: GOLD, marginLeft: 5 },
  coverImageWrap: {
    flex: 1,
    height: 248,
    borderWidth: 0.8,
    borderColor: TEAL,
    padding: 5,
    backgroundColor: "#F7FBFB",
  },
  hero: { width: "100%", height: "100%", objectFit: "cover" },
  coverFallback: {
    flex: 1,
    height: 248,
    borderWidth: 0.8,
    borderColor: TEAL,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFA",
  },
  coverFallbackText: { fontFamily: "Helvetica-Bold", fontSize: 15, color: SUB },
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
  itineraryTable: {
    backgroundColor: "#FBFCFD",
  },
  itineraryHeadRow: {
    flexDirection: "row",
    backgroundColor: "#E9FBFC",
    borderWidth: 0.7,
    borderColor: DASH,
    borderStyle: "dashed",
  },
  itineraryHeadDay: {
    width: 62,
    borderRightWidth: 0.7,
    borderRightColor: DASH,
    borderRightStyle: "dashed",
    paddingVertical: 6,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    color: TEAL,
  },
  itineraryHeadAgenda: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    color: CHARCOAL,
  },
  itineraryRow: {
    flexDirection: "row",
    borderLeftWidth: 0.6,
    borderRightWidth: 0.6,
    borderTopWidth: 0.6,
    borderBottomWidth: 0.6,
    borderTopColor: DASH,
    borderBottomColor: DASH,
    borderLeftColor: DASH,
    borderRightColor: DASH,
    borderStyle: "dashed",
  },
  itineraryFirstRow: { borderTopWidth: 0 },
  itineraryDayCell: {
    width: 62,
    borderRightWidth: 0.6,
    borderRightColor: DASH,
    borderRightStyle: "dashed",
    paddingVertical: 8,
    paddingHorizontal: 5,
    alignItems: "center",
  },
  itineraryDayText: { fontFamily: "Helvetica-Bold", fontSize: 6.3, color: TEAL, letterSpacing: 0.4 },
  itineraryDayNum: { fontFamily: "Helvetica-Bold", fontSize: 15, color: CHARCOAL, marginTop: 1 },
  itineraryAgendaCell: { flex: 1, paddingVertical: 8, paddingHorizontal: 10 },

  twoCol: { flexDirection: "row", gap: 16 },
  col: {
    flex: 1,
    borderWidth: 0.7,
    borderColor: DASH,
    borderStyle: "dashed",
    backgroundColor: "#FBFCFD",
    padding: 10,
  },
  colHeadRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  colHead: { fontFamily: "Helvetica-Bold", fontSize: 10, marginLeft: 6 },
  liRow: { flexDirection: "row", marginBottom: 6, alignItems: "flex-start" },
  liIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
    marginTop: 1,
  },
  liText: { flex: 1, fontSize: 8.5, lineHeight: 1.42, color: INK },
  inlineLink: { color: TEAL, fontFamily: "Helvetica-Bold", textDecoration: "none" },
  optionalList: {
    borderWidth: 0.7,
    borderColor: DASH,
    borderStyle: "dashed",
    backgroundColor: "#FBFCFD",
    padding: 10,
  },
  addonRow: {
    flexDirection: "row",
    paddingVertical: 7,
    borderTopWidth: 0.6,
    borderTopColor: DASH,
    borderTopStyle: "dashed",
  },
  addonFirstRow: { borderTopWidth: 0, paddingTop: 0 },
  addonBody: { flex: 1 },
  addonTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  addonName: { flex: 1, fontFamily: "Helvetica-Bold", fontSize: 8.8, color: CHARCOAL, lineHeight: 1.35 },
  addonPrice: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: GOLD },
  addonDesc: { fontSize: 7.8, lineHeight: 1.4, color: SUB, marginTop: 2 },
  addonTag: {
    alignSelf: "flex-start",
    marginTop: 3,
    backgroundColor: "#FFF3D6",
    color: "#8A6119",
    fontFamily: "Helvetica-Bold",
    fontSize: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },

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
  visaHelp: { fontSize: 8.2, color: SUB, lineHeight: 1.45, marginTop: 6 },

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

  compactPage: {
    backgroundColor: PAPER,
    color: INK,
    fontFamily: "Helvetica",
    paddingTop: 26,
    paddingBottom: 42,
    paddingHorizontal: 28,
  },
  compactSpread: { flexDirection: "row", gap: 14, minHeight: 764 },
  compactPanel: {
    flex: 1,
    backgroundColor: WHITE,
    padding: 14,
    borderWidth: 0.7,
    borderColor: DASH,
    borderStyle: "dashed",
  },
  compactLogo: { width: 100, height: 28, objectFit: "contain" },
  compactDocTag: { fontFamily: "Helvetica-Bold", fontSize: 7, color: TEAL, letterSpacing: 1 },
  compactTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  compactTitle: { fontFamily: "Helvetica-Bold", fontSize: 28, color: CHARCOAL, lineHeight: 1, marginTop: 42 },
  compactRoute: { fontFamily: "Helvetica-Bold", fontSize: 10, color: SUB, lineHeight: 1.3, marginTop: 9 },
  compactAccent: { flexDirection: "row", marginTop: 12, marginBottom: 16 },
  compactAccentTeal: { width: 62, height: 4, backgroundColor: TEAL },
  compactAccentGold: { width: 26, height: 4, backgroundColor: GOLD, marginLeft: 5 },
  compactHero: { width: "100%", height: 148, objectFit: "cover", borderWidth: 0.7, borderColor: TEAL, padding: 3 },
  compactMetaGrid: { marginTop: 12, borderTopWidth: 0.7, borderTopColor: DASH, borderTopStyle: "dashed" },
  compactMetaRow: {
    flexDirection: "row",
    borderBottomWidth: 0.7,
    borderBottomColor: DASH,
    borderBottomStyle: "dashed",
    paddingVertical: 5,
  },
  compactMetaPriceRow: { minHeight: 40, alignItems: "flex-start" },
  compactMetaLabel: { width: 76, fontFamily: "Helvetica-Bold", fontSize: 6.2, color: TEAL, letterSpacing: 0.4 },
  compactMetaValue: { flex: 1, fontFamily: "Helvetica-Bold", fontSize: 7.4, color: CHARCOAL, lineHeight: 1.25 },
  compactPriceStack: { flex: 1 },
  compactPrice: { fontFamily: "Helvetica-Bold", fontSize: 8.8, color: CHARCOAL, lineHeight: 1.15 },
  compactSmallText: { fontSize: 5.8, color: SUB, lineHeight: 1.25, marginTop: 2 },
  compactSecHead: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: CHARCOAL,
    borderLeftWidth: 4,
    borderLeftColor: TEAL,
    paddingLeft: 7,
    marginBottom: 8,
  },
  compactDayRow: {
    flexDirection: "row",
    borderTopWidth: 0.6,
    borderTopColor: DASH,
    borderTopStyle: "dashed",
    paddingVertical: 5.5,
  },
  compactDayBox: { width: 34, alignItems: "center", paddingRight: 6 },
  compactDayLabel: { fontFamily: "Helvetica-Bold", fontSize: 5.2, color: TEAL, letterSpacing: 0.3 },
  compactDayNum: { fontFamily: "Helvetica-Bold", fontSize: 12, color: CHARCOAL, marginTop: 1 },
  compactDayBody: { flex: 1 },
  compactDayTitle: { fontFamily: "Helvetica-Bold", fontSize: 7.6, color: CHARCOAL, lineHeight: 1.22 },
  compactDayDesc: { fontSize: 6.3, color: INK, lineHeight: 1.28, marginTop: 2 },
  compactTwoCol: { flexDirection: "row", gap: 8 },
  compactCol: { flex: 1 },
  compactColHead: { fontFamily: "Helvetica-Bold", fontSize: 7.5, marginBottom: 4 },
  compactListRow: { flexDirection: "row", marginBottom: 3.4, alignItems: "flex-start" },
  compactListText: { flex: 1, fontSize: 6.4, color: INK, lineHeight: 1.3 },
  compactLink: { color: TEAL, fontFamily: "Helvetica-Bold", textDecoration: "none" },
  compactBlock: { marginTop: 10 },
  compactAddonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    borderTopWidth: 0.6,
    borderTopColor: DASH,
    borderTopStyle: "dashed",
    paddingVertical: 3.6,
  },
  compactAddonName: { flex: 1, fontSize: 6.4, color: INK, lineHeight: 1.25 },
  compactAddonPrice: { fontFamily: "Helvetica-Bold", fontSize: 6.4, color: GOLD },
  compactNote: { fontSize: 6.5, color: INK, lineHeight: 1.35 },
  compactContact: {
    marginTop: 10,
    borderTopWidth: 0.7,
    borderTopColor: DASH,
    borderTopStyle: "dashed",
    paddingTop: 8,
  },

  densePage: {
    backgroundColor: PAPER,
    color: INK,
    fontFamily: "Helvetica",
    paddingTop: 16,
    paddingBottom: 30,
    paddingHorizontal: 18,
  },
  denseSheet: {
    backgroundColor: WHITE,
    padding: 14,
    minHeight: 532,
  },
  denseSpread: { flexDirection: "row", gap: 14 },
  densePanel: { flex: 1 },
  denseLeftPanel: {
    borderRightWidth: 0.7,
    borderRightColor: DASH,
    borderRightStyle: "dashed",
    paddingRight: 14,
  },
  denseTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  denseLogo: { width: 96, height: 27, objectFit: "contain" },
  denseDocTag: { fontFamily: "Helvetica-Bold", fontSize: 6.8, color: TEAL, letterSpacing: 0.9 },
  denseCoverRow: { flexDirection: "row", gap: 12, marginTop: 10, marginBottom: 8 },
  denseCoverCopy: { flex: 1 },
  denseTitle: { fontFamily: "Helvetica-Bold", fontSize: 31, color: CHARCOAL, lineHeight: 0.98, marginTop: 7 },
  denseRoute: { fontFamily: "Helvetica-Bold", fontSize: 10, color: SUB, lineHeight: 1.2, marginTop: 6 },
  denseAccent: { flexDirection: "row", marginTop: 8 },
  denseAccentTeal: { width: 58, height: 3.5, backgroundColor: TEAL },
  denseAccentGold: { width: 24, height: 3.5, backgroundColor: GOLD, marginLeft: 5 },
  denseHero: { width: 186, height: 142, objectFit: "cover", borderWidth: 0.7, borderColor: TEAL, padding: 2 },
  denseMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 0.6,
    borderTopColor: DASH,
    borderTopStyle: "dashed",
    marginBottom: 8,
  },
  denseMetaItem: {
    width: "50%",
    borderBottomWidth: 0.6,
    borderBottomColor: DASH,
    borderBottomStyle: "dashed",
    paddingVertical: 3.6,
    paddingRight: 8,
  },
  denseMetaLabel: { fontFamily: "Helvetica-Bold", fontSize: 5.3, color: TEAL, letterSpacing: 0.35 },
  denseMetaValue: { fontFamily: "Helvetica-Bold", fontSize: 6.6, color: CHARCOAL, lineHeight: 1.16, marginTop: 1.6 },
  densePrice: { fontFamily: "Helvetica-Bold", fontSize: 7.8, color: CHARCOAL, lineHeight: 1.1, marginTop: 1.6 },
  denseSmallText: { fontSize: 4.9, color: SUB, lineHeight: 1.16, marginTop: 1.4 },
  denseSecHead: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.8,
    color: CHARCOAL,
    borderLeftWidth: 3.5,
    borderLeftColor: TEAL,
    paddingLeft: 6,
    marginBottom: 5,
  },
  denseDayRow: {
    flexDirection: "row",
    borderTopWidth: 0.55,
    borderTopColor: DASH,
    borderTopStyle: "dashed",
    paddingVertical: 4.1,
  },
  denseDayBox: { width: 29, alignItems: "center", paddingRight: 5 },
  denseDayLabel: { fontFamily: "Helvetica-Bold", fontSize: 4.5, color: TEAL, letterSpacing: 0.25 },
  denseDayNum: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: CHARCOAL, marginTop: 0.5 },
  denseDayBody: { flex: 1 },
  denseDayTitle: { fontFamily: "Helvetica-Bold", fontSize: 6.8, color: CHARCOAL, lineHeight: 1.16 },
  denseDayDesc: { fontSize: 5.45, color: INK, lineHeight: 1.18, marginTop: 1.3 },
  denseTwoCol: { flexDirection: "row", gap: 8 },
  denseCol: { flex: 1 },
  denseColHead: { fontFamily: "Helvetica-Bold", fontSize: 6.7, marginBottom: 3 },
  denseListRow: { flexDirection: "row", marginBottom: 2.7, alignItems: "flex-start" },
  denseListIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
    marginTop: 0.4,
  },
  denseListText: { flex: 1, fontSize: 5.7, color: INK, lineHeight: 1.18 },
  denseBlock: { marginTop: 7 },
  denseAddonGrid: { flexDirection: "row", gap: 8 },
  denseAddonCol: { flex: 1 },
  denseAddonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
    borderTopWidth: 0.55,
    borderTopColor: DASH,
    borderTopStyle: "dashed",
    paddingVertical: 2.5,
  },
  denseAddonName: { flex: 1, fontSize: 5.7, color: INK, lineHeight: 1.16 },
  denseAddonPrice: { fontFamily: "Helvetica-Bold", fontSize: 5.6, color: GOLD },
  denseBottomGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 7,
    borderTopWidth: 0.6,
    borderTopColor: DASH,
    borderTopStyle: "dashed",
    paddingTop: 6,
  },
  denseBottomCol: { flex: 1 },
  denseNote: { fontSize: 5.65, color: INK, lineHeight: 1.22 },
  denseLink: { color: TEAL, fontFamily: "Helvetica-Bold", textDecoration: "none" },
  denseFooter: {
    position: "absolute",
    bottom: 12,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.7,
    borderTopColor: "#D1D5DA",
    paddingTop: 5,
  },
  denseFooterText: { fontSize: 6.2, color: "#7D838A" },
});

function isPdfImage(u?: string | null): u is string {
  return !!u && (/^https?:\/\//.test(u) || /^data:image\/(?:png|jpe?g);base64,/i.test(u));
}

function waLink(raw: string) {
  return `https://wa.me/${raw.replace(/\D/g, "")}`;
}

function compactText(value?: string | null, max = 150) {
  if (!value) return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max - 3).trim()}...` : normalized;
}

function PdfIcon({ kind, small = false }: { kind: "include" | "exclude" | "optional"; small?: boolean }) {
  const color = kind === "include" ? GREEN : kind === "exclude" ? RED : GOLD;
  const backgroundColor = kind === "include" ? "#E8F5EE" : kind === "exclude" ? "#FBEDEA" : "#FFF5DD";
  const path = kind === "include" ? "M20 6 9 17l-5-5" : kind === "exclude" ? "M18 6 6 18M6 6l12 12" : "M12 5v14M5 12h14";

  return (
    <View style={[small ? s.denseListIcon : s.liIcon, { backgroundColor }]}>
      <Svg width={small ? 6 : 8} height={small ? 6 : 8} viewBox="0 0 24 24">
        <Path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

function linkedTextParts(text: string) {
  const match = /visa/i.exec(text);
  if (!match) return null;

  return {
    before: text.slice(0, match.index),
    linked: text.slice(match.index, match.index + match[0].length),
    after: text.slice(match.index + match[0].length),
  };
}

function CompactLinkedText({ text }: { text: string }) {
  const parts = linkedTextParts(text);
  if (!parts) return <Text style={s.compactListText}>{text}</Text>;

  return (
    <Text style={s.compactListText}>
      {parts.before}
      <Link src={VISA_URL} style={s.compactLink}>{parts.linked}</Link>
      {parts.after}
    </Text>
  );
}

function DenseLinkedText({ text }: { text: string }) {
  const parts = linkedTextParts(text);
  if (!parts) return <Text style={s.denseListText}>{text}</Text>;

  return (
    <Text style={s.denseListText}>
      {parts.before}
      <Link src={VISA_URL} style={s.denseLink}>{parts.linked}</Link>
      {parts.after}
    </Text>
  );
}

function CompactSectionHeader({ children }: { children: string }) {
  return <Text style={s.compactSecHead}>{children}</Text>;
}

function DenseSectionHeader({ children }: { children: string }) {
  return <Text style={s.denseSecHead}>{children}</Text>;
}

export function ItineraryPDF({
  tour, priceLabel, priceCoretLabel, landTourLabel, company, faqUrl,
}: ItineraryPDFProps) {
  const faqDisplay = faqUrl ? faqUrl.replace(/^https?:\/\//, "") : "";
  const heroImage = isPdfImage(tour.heroImg) ? tour.heroImg : null;
  const meta = [
    tour.duration ? ["DURASI", tour.duration] : null,
    tour.tripDateLabel ? ["KEBERANGKATAN", tour.tripDateLabel] : null,
    ["DESTINASI", tour.cityHighlight || tour.country],
  ].filter(Boolean) as [string, string][];
  const splitAt = Math.ceil(tour.itinerary.length / 2);
  const firstDays = tour.itinerary.slice(0, splitAt);
  const secondDays = tour.itinerary.slice(splitAt);
  const websiteLabel = company.website || company.name || "Sundaf Trip";
  const addOns = tour.addOns ?? [];
  const addOnSplitAt = Math.ceil(addOns.length / 2);
  const addOnColumns = [addOns.slice(0, addOnSplitAt), addOns.slice(addOnSplitAt)].filter((items) => items.length > 0);

  const denseFooter = (
    <View style={s.denseFooter} fixed>
      <Text style={s.denseFooterText}>{websiteLabel}</Text>
      <Text style={s.denseFooterText}>Halaman 1</Text>
    </View>
  );

  return (
    <Document title={`Itinerary ${tour.title}`} author={company.name || "Sundaf Trip"}>
      <Page size="A4" orientation="landscape" style={s.densePage}>
        <View style={s.denseSheet}>
          <View style={s.denseSpread}>
            <View style={[s.densePanel, s.denseLeftPanel]}>
              <View style={s.denseTop}>
                {isPdfImage(company.logo) ? (
                  <Image src={company.logo} style={s.denseLogo} />
                ) : (
                  <Text style={s.logoFallback}>{(company.name || "SUNDAF TRIP").toUpperCase()}</Text>
                )}
                <Text style={s.denseDocTag}>ITINERARY</Text>
              </View>

              <View style={s.denseCoverRow}>
                <View style={s.denseCoverCopy}>
                  <Text style={s.denseTitle}>{tour.title}</Text>
                  <Text style={s.denseRoute}>{tour.cityHighlight || tour.country}</Text>
                  <View style={s.denseAccent}>
                    <View style={s.denseAccentTeal} />
                    <View style={s.denseAccentGold} />
                  </View>
                </View>
                {heroImage && <Image src={heroImage} style={s.denseHero} />}
              </View>

              <View style={s.denseMetaGrid}>
                {meta.map(([label, value]) => (
                  <View key={label} style={s.denseMetaItem}>
                    <Text style={s.denseMetaLabel}>{label}</Text>
                    <Text style={s.denseMetaValue}>{value}</Text>
                  </View>
                ))}
                <View style={s.denseMetaItem}>
                  <Text style={s.denseMetaLabel}>HARGA</Text>
                  <Text style={s.densePrice}>{priceLabel}</Text>
                  {!!priceCoretLabel && <Text style={s.denseSmallText}>{priceCoretLabel}</Text>}
                  {!!landTourLabel && <Text style={s.denseSmallText}>Land tour: {landTourLabel}</Text>}
                </View>
              </View>

              <DenseSectionHeader>Rencana Perjalanan</DenseSectionHeader>
              {firstDays.map((day) => (
                <View key={day.day} style={s.denseDayRow}>
                  <View style={s.denseDayBox}>
                    <Text style={s.denseDayLabel}>HARI</Text>
                    <Text style={s.denseDayNum}>{day.day}</Text>
                  </View>
                  <View style={s.denseDayBody}>
                    <Text style={s.denseDayTitle}>{day.title}</Text>
                    {!!day.description && <Text style={s.denseDayDesc}>{compactText(day.description, 130)}</Text>}
                  </View>
                </View>
              ))}
            </View>

            <View style={s.densePanel}>
              <DenseSectionHeader>Rencana Perjalanan</DenseSectionHeader>
              {secondDays.map((day) => (
                <View key={day.day} style={s.denseDayRow}>
                  <View style={s.denseDayBox}>
                    <Text style={s.denseDayLabel}>HARI</Text>
                    <Text style={s.denseDayNum}>{day.day}</Text>
                  </View>
                  <View style={s.denseDayBody}>
                    <Text style={s.denseDayTitle}>{day.title}</Text>
                    {!!day.description && <Text style={s.denseDayDesc}>{compactText(day.description, 120)}</Text>}
                  </View>
                </View>
              ))}

              {(tour.inclusions.length > 0 || tour.exclusions.length > 0) && (
                <View style={s.denseBlock}>
                  <DenseSectionHeader>Termasuk dan Tidak Termasuk</DenseSectionHeader>
                  <View style={s.denseTwoCol}>
                    <View style={s.denseCol}>
                      <Text style={[s.denseColHead, { color: GREEN }]}>Sudah Termasuk</Text>
                      {tour.inclusions.map((item, i) => (
                        <View key={i} style={s.denseListRow}>
                          <PdfIcon kind="include" small />
                          <DenseLinkedText text={item} />
                        </View>
                      ))}
                    </View>
                    <View style={s.denseCol}>
                      <Text style={[s.denseColHead, { color: RED }]}>Tidak Termasuk</Text>
                      {tour.exclusions.map((item, i) => (
                        <View key={i} style={s.denseListRow}>
                          <PdfIcon kind="exclude" small />
                          <DenseLinkedText text={item} />
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {!!addOnColumns.length && (
                <View style={s.denseBlock}>
                  <DenseSectionHeader>Add Ons Opsional</DenseSectionHeader>
                  <View style={s.denseAddonGrid}>
                    {addOnColumns.map((items, colIndex) => (
                      <View key={colIndex} style={s.denseAddonCol}>
                        {items.map((item, i) => (
                          <View key={i} style={s.denseAddonRow}>
                            <Text style={s.denseAddonName}>
                              {item.name}{item.tag === "recommended" ? " (rekomendasi)" : ""}
                            </Text>
                            <Text style={s.denseAddonPrice}>+{item.priceLabel}</Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={s.denseBottomGrid}>
                <View style={s.denseBottomCol}>
                  {!!tour.notes && (
                    <>
                      <DenseSectionHeader>Catatan</DenseSectionHeader>
                      <Text style={s.denseNote}>{compactText(tour.notes, 150)}</Text>
                    </>
                  )}
                  {!!tour.visaInfo && (
                    <Text style={s.denseNote}>
                      Visa: <Link src={VISA_URL} style={s.denseLink}>sundaftrip.com/visa</Link>
                    </Text>
                  )}
                </View>
                <View style={s.denseBottomCol}>
                  <DenseSectionHeader>Kontak</DenseSectionHeader>
                  {company.whatsapp && (
                    <Text style={s.denseNote}>
                      WhatsApp: <Link src={waLink(company.whatsapp)} style={s.denseLink}>{company.whatsapp}</Link>
                    </Text>
                  )}
                  {company.phone && <Text style={s.denseNote}>Telepon: {company.phone}</Text>}
                  {company.email && <Text style={s.denseNote}>Email: {company.email}</Text>}
                  {company.website && <Text style={s.denseNote}>Website: {company.website}</Text>}
                  {!!faqUrl && (
                    <Text style={s.denseNote}>
                      FAQ: <Link src={faqUrl} style={s.denseLink}>{faqDisplay}</Link>
                    </Text>
                  )}
                  <Text style={s.denseSmallText}>
                    Harga dan jadwal dapat berubah mengikuti ketersediaan maskapai, kurs, cuaca, dan operasional.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        {denseFooter}
      </Page>
    </Document>
  );
}
/* Legacy compact portrait styles are intentionally kept above for reuse in older generated variants. */
