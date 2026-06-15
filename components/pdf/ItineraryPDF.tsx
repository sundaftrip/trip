/* Itinerary PDF document - rendered server-side via @react-pdf/renderer. */
import {
  Document, Page, View, Text, Link, StyleSheet, Font,
} from "@react-pdf/renderer";
import { buildItineraryDisplay, type ItineraryInsight } from "@/lib/itinerary-insights";

const CHARCOAL = "#222831";
const INK = "#393E46";
const TEAL = "#00ADB5";
const GOLD = "#00ADB5";
const SUB = "#393E46";
const HAIR = "#393E46";
const DASH = "#393E46";
const PAPER = "#EEEEEE";
const WHITE = "#EEEEEE";
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
  coverImageWrap: {
    flex: 1,
    height: 248,
    borderWidth: 0.8,
    borderColor: TEAL,
    padding: 5,
    backgroundColor: PAPER,
  },
  hero: { width: "100%", height: "100%", objectFit: "cover" },
  coverFallback: {
    flex: 1,
    height: 248,
    borderWidth: 0.8,
    borderColor: TEAL,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PAPER,
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
  priceCoret: { fontSize: 7.5, color: SUB, marginTop: 2, textDecoration: "line-through" },
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
    borderTopColor: HAIR,
  },
  dayNumCol: { width: 54, paddingRight: 10 },
  dayBadge: {
    width: 38,
    height: 38,
    backgroundColor: PAPER,
    borderWidth: 1,
    borderColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumLabel: { fontFamily: "Helvetica-Bold", fontSize: 5.8, color: TEAL, letterSpacing: 0.6 },
  dayNum: { fontFamily: "Helvetica-Bold", fontSize: 15, color: CHARCOAL, marginTop: 1 },
  dayBody: { flex: 1 },
  dayTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.4, color: CHARCOAL, lineHeight: 1.3 },
  dayDesc: { fontSize: 8.6, color: INK, lineHeight: 1.48, marginTop: 4 },
  itineraryTable: {
    backgroundColor: PAPER,
  },
  itineraryHeadRow: {
    flexDirection: "row",
    backgroundColor: PAPER,
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
    backgroundColor: PAPER,
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
    backgroundColor: PAPER,
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
    backgroundColor: PAPER,
    color: CHARCOAL,
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
    backgroundColor: PAPER,
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
  contactGrid: { marginTop: 8, borderTopWidth: 1, borderTopColor: HAIR, paddingTop: 7 },
  contactRow: { flexDirection: "row", marginTop: 3 },
  contactLabel: { width: 70, fontFamily: "Helvetica-Bold", fontSize: 7.8, color: SUB },
  contactValue: { flex: 1, fontSize: 8.2, color: INK, lineHeight: 1.35 },

  disclaimer: { fontSize: 7.2, color: SUB, lineHeight: 1.4, marginTop: 10 },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 34,
    right: 34,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: HAIR,
    paddingTop: 7,
  },
  footerText: { fontSize: 7, color: SUB },

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
    paddingTop: 12,
    paddingBottom: 22,
    paddingHorizontal: 18,
  },
  denseSheet: {
    backgroundColor: WHITE,
    padding: 12,
    minHeight: 516,
  },
  proposalHeader: {
    marginBottom: 8,
    alignItems: "center",
  },
  proposalBrand: { flexDirection: "row", alignItems: "flex-start", marginBottom: 2 },
  proposalBrandName: { fontFamily: "Helvetica-Bold", fontSize: 17, color: CHARCOAL, lineHeight: 1 },
  proposalBrandTrip: { fontFamily: "Helvetica-Bold", fontSize: 5.6, color: TEAL, marginLeft: 2, marginTop: 1 },
  proposalTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: TEAL,
    letterSpacing: 0.4,
    textAlign: "center",
    textTransform: "uppercase",
  },
  proposalSubtitle: { fontSize: 6.8, color: CHARCOAL, textAlign: "center", marginTop: 2 },
  proposalGrid: { flexDirection: "row", gap: 16 },
  proposalLeft: { width: "58%" },
  proposalRight: { flex: 1 },
  proposalSectionGap: { marginTop: 8 },
  proposalTable: {
    borderTopWidth: 0.7,
    borderTopColor: TEAL,
    borderBottomWidth: 0.7,
    borderBottomColor: TEAL,
  },
  proposalHeadRow: { flexDirection: "row", backgroundColor: TEAL },
  proposalHeadCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.2,
    color: WHITE,
    paddingVertical: 4,
    paddingHorizontal: 5,
  },
  proposalRow: {
    flexDirection: "row",
    borderBottomWidth: 0.45,
    borderBottomColor: INK,
    minHeight: 34,
  },
  proposalCell: { paddingVertical: 3.6, paddingHorizontal: 5, justifyContent: "center" },
  proposalDayCell: { width: 31, alignItems: "center" },
  proposalDateCell: { width: 66 },
  proposalEventCell: { flex: 1 },
  proposalPlaceCell: { width: 58 },
  proposalDayText: { fontFamily: "Helvetica-Bold", fontSize: 8.6, color: CHARCOAL },
  proposalDateText: { fontSize: 5.65, color: CHARCOAL, lineHeight: 1.15 },
  proposalEventTitle: { fontFamily: "Helvetica-Bold", fontSize: 6.3, color: CHARCOAL, lineHeight: 1.14 },
  proposalEventDesc: { fontSize: 5.25, color: INK, lineHeight: 1.15, marginTop: 1 },
  proposalInsightLine: { fontSize: 5.05, color: TEAL, lineHeight: 1.18, marginTop: 2 },
  proposalPlaceText: { fontFamily: "Helvetica-Bold", fontSize: 5.9, color: CHARCOAL, lineHeight: 1.15 },
  proposalMiniTable: {
    borderTopWidth: 0.7,
    borderTopColor: TEAL,
    borderBottomWidth: 0.7,
    borderBottomColor: TEAL,
  },
  proposalMiniRow: {
    flexDirection: "row",
    borderBottomWidth: 0.45,
    borderBottomColor: INK,
  },
  proposalMiniCell: { flex: 1, paddingVertical: 3.4, paddingHorizontal: 5 },
  proposalMiniLabel: { fontFamily: "Helvetica-Bold", fontSize: 5.3, color: TEAL, letterSpacing: 0.3 },
  proposalMiniValue: { fontFamily: "Helvetica-Bold", fontSize: 6.4, color: CHARCOAL, lineHeight: 1.12, marginTop: 1.5 },
  proposalPrice: { fontFamily: "Helvetica-Bold", fontSize: 7.4, color: CHARCOAL, lineHeight: 1.1, marginTop: 1.5 },
  proposalSectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: WHITE,
    backgroundColor: TEAL,
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    width: "100%",
    marginBottom: 4,
  },
  proposalListGrid: { flexDirection: "row", gap: 10 },
  proposalListCol: { flex: 1 },
  proposalListHead: { fontFamily: "Helvetica-Bold", fontSize: 6.7, marginBottom: 3 },
  proposalListItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 2.5 },
  proposalBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4.5,
    marginTop: 0.9,
  },
  proposalListText: { flex: 1, fontSize: 5.65, color: CHARCOAL, lineHeight: 1.16 },
  proposalAddOnRow: { flexDirection: "row", borderBottomWidth: 0.45, borderBottomColor: INK },
  proposalAddOnName: { flex: 1.35, fontSize: 5.65, color: CHARCOAL, paddingVertical: 2.6, paddingHorizontal: 5 },
  proposalAddOnPrice: {
    flex: 0.8,
    fontFamily: "Helvetica-Bold",
    fontSize: 5.6,
    color: GOLD,
    paddingVertical: 2.6,
    paddingHorizontal: 5,
  },
  proposalFooterGrid: { flexDirection: "row", gap: 12, marginTop: 7 },
  proposalFooterCol: { flex: 1 },
  proposalLeftNoteGrid: { flexDirection: "row", gap: 10, marginTop: 7 },
  proposalLeftNoteCol: { flex: 1 },
  proposalSmallText: { fontSize: 5.4, color: INK, lineHeight: 1.18 },
  portraitPage: {
    backgroundColor: PAPER,
    color: CHARCOAL,
    fontFamily: "Helvetica",
    paddingVertical: 20,
    paddingHorizontal: 22,
  },
  portraitSheet: { backgroundColor: PAPER },
  portraitHeader: { marginBottom: 10, alignItems: "center" },
  portraitPageTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: TEAL,
    textAlign: "center",
    textTransform: "uppercase",
  },
  portraitTableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.45,
    borderBottomColor: INK,
    minHeight: 41,
  },
  portraitSectionGap: { marginTop: 10 },
  portraitFooterGrid: { flexDirection: "row", gap: 12, marginTop: 9 },
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
  denseTitle: { fontFamily: "Helvetica-Bold", fontSize: 33, color: CHARCOAL, lineHeight: 0.98, marginTop: 7 },
  denseRoute: { fontFamily: "Helvetica-Bold", fontSize: 10, color: SUB, lineHeight: 1.2, marginTop: 6 },
  denseHero: { width: 198, height: 150, objectFit: "cover", borderWidth: 0.7, borderColor: TEAL, padding: 2 },
  denseMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  denseMetaItem: {
    width: "50%",
    paddingVertical: 3.2,
    paddingRight: 8,
  },
  denseMetaLabel: { fontFamily: "Helvetica-Bold", fontSize: 5.3, color: TEAL, letterSpacing: 0.35 },
  denseMetaValue: { fontFamily: "Helvetica-Bold", fontSize: 6.6, color: CHARCOAL, lineHeight: 1.16, marginTop: 1.6 },
  densePrice: { fontFamily: "Helvetica-Bold", fontSize: 7.8, color: CHARCOAL, lineHeight: 1.1, marginTop: 1.6 },
  denseSmallText: { fontSize: 4.9, color: SUB, lineHeight: 1.16, marginTop: 1.4 },
  denseSecHead: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.4,
    color: WHITE,
    backgroundColor: TEAL,
    paddingVertical: 3.2,
    paddingHorizontal: 7,
    marginBottom: 5.2,
    width: "100%",
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
  denseDayDesc: { fontSize: 5.65, color: INK, lineHeight: 1.22, marginTop: 1.3 },
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
    paddingVertical: 2.5,
  },
  denseAddonName: { flex: 1, fontSize: 5.7, color: INK, lineHeight: 1.16 },
  denseAddonPrice: { fontFamily: "Helvetica-Bold", fontSize: 5.6, color: GOLD },
  denseBottomGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 7,
    paddingTop: 6,
  },
  denseBottomCol: { flex: 1 },
  denseNote: { fontSize: 5.65, color: INK, lineHeight: 1.22 },
  denseLink: { color: TEAL, fontFamily: "Helvetica-Bold", textDecoration: "none" },
  denseFooter: {
    position: "absolute",
    bottom: 8,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.7,
    borderTopColor: HAIR,
    paddingTop: 5,
  },
  denseFooterText: { fontSize: 6.2, color: SUB },
});

function waLink(raw: string) {
  return `https://wa.me/${raw.replace(/\D/g, "")}`;
}

function compactText(value?: string | null, max = 150) {
  if (!value) return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max - 3).trim()}...` : normalized;
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

function ProposalLinkedText({ text }: { text: string }) {
  const parts = linkedTextParts(text);
  if (!parts) return <Text style={s.proposalListText}>{text}</Text>;

  return (
    <Text style={s.proposalListText}>
      {parts.before}
      <Link src={VISA_URL} style={s.denseLink}>{parts.linked}</Link>
      {parts.after}
    </Text>
  );
}

function BrandMark() {
  return (
    <View style={s.proposalBrand}>
      <Text style={s.proposalBrandName}>Sundaf</Text>
      <Text style={s.proposalBrandTrip}>Trip</Text>
    </View>
  );
}

function placeForDay(day: ItineraryDay) {
  const text = `${day.title} ${day.description}`.toLowerCase();
  if (/ninh binh|hoa lu|tam coc|trang an/.test(text)) return "Ninh Binh";
  if (/halong|ha long|teluk halong|tuan chau|bo hon|sung sot|titop|luon/.test(text)) return "Teluk Halong";
  if (/sapa|sa pa|fansipan|cat cat|lao cai/.test(text)) return "Sapa";
  if (/da nang|danang|ba na|golden bridge/.test(text)) return "Da Nang";
  if (/hue|imperial city|perfume river/.test(text)) return "Hue";
  if (/hoi an|hoian|ancient town/.test(text)) return "Hoi An";
  if (/ho chi minh|saigon|cu chi/.test(text)) return "Ho Chi Minh";
  if (/mekong|my tho|can tho|ben tre/.test(text)) return "Mekong";
  if (/phu quoc/.test(text)) return "Phu Quoc";
  if (/hanoi|hoan kiem|old quarter|train street|noi bai/.test(text)) return "Hanoi";
  if (/ismailovo|izmailovo|moscow|moskow|red square|arbat|metro/.test(text)) return "Moscow";
  if (/murmansk|aurora|sami|husky|reindeer|snow/.test(text)) return "Murmansk";
  if (/petersburg|nevski|nevsky|kazan|isaac|hermitage|spilled|mosque/.test(text)) return "St Petersburg";
  if (/jakarta|indonesia/.test(text)) return "Indonesia";
  return "Sesuai rute";
}

function compactInsightSummary(insights: ItineraryInsight[]) {
  return insights
    .map((insight) => `${insight.label}: ${insight.value}`)
    .join(" | ");
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
  const addOns = tour.addOns ?? [];
  const dateLabel = tour.tripDateLabel || "Tanggal mengikuti jadwal";
  const displayItinerary = tour.itinerary.map(buildItineraryDisplay);
  const subtitleParts = [
    `Disiapkan oleh ${company.name || "Sundaf Trip"}`,
    tour.duration,
    dateLabel,
  ].filter(Boolean);

  return (
    <Document title={`Rencana Perjalanan ${tour.title}`} author={company.name || "Sundaf Trip"}>
      <Page size="A4" style={s.portraitPage}>
        <View style={s.portraitSheet}>
          <View style={s.portraitHeader}>
            <BrandMark />
            <Text style={s.proposalTitle}>{`Rencana Perjalanan ${tour.title}`}</Text>
            <Text style={s.proposalSubtitle}>{subtitleParts.join(" • ")}</Text>
          </View>

          <View style={s.proposalMiniTable}>
            <View style={s.proposalHeadRow}>
              <Text style={[s.proposalHeadCell, { flex: 1 }]}>Info</Text>
              <Text style={[s.proposalHeadCell, { flex: 1 }]}>Detail</Text>
            </View>
            {meta.map(([label, value]) => (
              <View key={label} style={s.proposalMiniRow}>
                <View style={s.proposalMiniCell}>
                  <Text style={s.proposalMiniLabel}>{label}</Text>
                </View>
                <View style={s.proposalMiniCell}>
                  <Text style={s.proposalMiniValue}>{value}</Text>
                </View>
              </View>
            ))}
            <View style={s.proposalMiniRow}>
              <View style={s.proposalMiniCell}>
                <Text style={s.proposalMiniLabel}>HARGA PER ORANG</Text>
              </View>
              <View style={s.proposalMiniCell}>
                <Text style={s.proposalPrice}>{priceLabel}</Text>
                {!!priceCoretLabel && <Text style={s.denseSmallText}>{priceCoretLabel}</Text>}
                {!!landTourLabel && <Text style={s.denseSmallText}>Land tour: {landTourLabel}</Text>}
              </View>
            </View>
          </View>

          <View style={s.portraitSectionGap}>
            <Text style={s.proposalSectionTitle}>Rencana Perjalanan</Text>
          </View>

          <View style={s.proposalTable}>
            <View style={s.proposalHeadRow}>
              <Text style={[s.proposalHeadCell, s.proposalDayCell]}>Hari</Text>
              <Text style={[s.proposalHeadCell, s.proposalDateCell]}>Tanggal</Text>
              <Text style={[s.proposalHeadCell, s.proposalEventCell]}>Agenda</Text>
              <Text style={[s.proposalHeadCell, s.proposalPlaceCell]}>Lokasi</Text>
            </View>
            {displayItinerary.map((day, idx) => {
              const insightSummary = compactInsightSummary(day.insights);

              return (
                <View key={`${day.day}-${idx}`} style={s.portraitTableRow}>
                  <View style={[s.proposalCell, s.proposalDayCell]}>
                    <Text style={s.proposalDayText}>{day.day}</Text>
                  </View>
                  <View style={[s.proposalCell, s.proposalDateCell]}>
                    <Text style={s.proposalDateText}>{dateLabel}</Text>
                  </View>
                  <View style={[s.proposalCell, s.proposalEventCell]}>
                    <Text style={s.proposalEventTitle}>{day.title}</Text>
                    {!!day.description && (
                      <Text style={s.proposalEventDesc}>{compactText(day.description, 150)}</Text>
                    )}
                    {!!insightSummary && (
                      <Text style={s.proposalInsightLine}>{compactText(insightSummary, 135)}</Text>
                    )}
                  </View>
                  <View style={[s.proposalCell, s.proposalPlaceCell]}>
                    <Text style={s.proposalPlaceText}>{placeForDay(day)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
          <Text style={[s.proposalSmallText, { marginTop: 4 }]}>
            *Rencana perjalanan dapat berubah mengikuti kondisi cuaca dan operasional di lapangan.
          </Text>

          <View style={s.proposalLeftNoteGrid}>
            <View style={s.proposalLeftNoteCol}>
              <Text style={s.proposalSectionTitle}>Catatan</Text>
              <Text style={s.proposalSmallText}>
                {compactText(tour.notes, 210) || "Harga dan jadwal dapat berubah mengikuti kondisi operasional di lapangan."}
              </Text>
            </View>
            <View style={s.proposalLeftNoteCol}>
              <Text style={s.proposalSectionTitle}>Visa & Pendaftaran</Text>
              <Text style={s.proposalSmallText}>
                Visa dapat dibantu melalui{" "}
                <Link src={VISA_URL} style={s.denseLink}>sundaftrip.com/visa</Link>
                . Hubungi WhatsApp untuk ketersediaan kursi dan proses pendaftaran.
              </Text>
            </View>
          </View>
        </View>
      </Page>

      <Page size="A4" style={s.portraitPage}>
        <View style={s.portraitSheet}>
          <View style={s.portraitHeader}>
            <BrandMark />
            <Text style={s.portraitPageTitle}>Rincian Paket {tour.title}</Text>
          </View>

          {(tour.inclusions.length > 0 || tour.exclusions.length > 0) && (
            <View style={s.portraitSectionGap}>
              <Text style={s.proposalSectionTitle}>Harga Sudah / Belum Termasuk</Text>
              <View style={s.proposalListGrid}>
                <View style={s.proposalListCol}>
                  <Text style={[s.proposalListHead, { color: CHARCOAL }]}>Sudah Termasuk</Text>
                  {tour.inclusions.map((item, i) => (
                    <View key={i} style={s.proposalListItem}>
                      <View style={[s.proposalBullet, { backgroundColor: TEAL }]} />
                      <ProposalLinkedText text={item} />
                    </View>
                  ))}
                </View>
                <View style={s.proposalListCol}>
                  <Text style={[s.proposalListHead, { color: CHARCOAL }]}>Belum Termasuk</Text>
                  {tour.exclusions.map((item, i) => (
                    <View key={i} style={s.proposalListItem}>
                      <View style={[s.proposalBullet, { backgroundColor: CHARCOAL }]} />
                      <ProposalLinkedText text={item} />
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {!!addOns.length && (
            <View style={s.portraitSectionGap}>
              <Text style={s.proposalSectionTitle}>Add-on Opsional</Text>
              <View style={s.proposalMiniTable}>
                <View style={s.proposalHeadRow}>
                  <Text style={[s.proposalHeadCell, { flex: 1.35 }]}>Layanan</Text>
                  <Text style={[s.proposalHeadCell, { flex: 0.8 }]}>Harga/orang</Text>
                </View>
                {addOns.map((item, i) => (
                  <View key={i} style={s.proposalAddOnRow}>
                    <Text style={s.proposalAddOnName}>
                      {item.name}{item.tag === "recommended" ? " (rekomendasi)" : ""}
                    </Text>
                    <Text style={s.proposalAddOnPrice}>{item.priceLabel}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={s.portraitFooterGrid}>
            <View style={s.proposalFooterCol}>
              <Text style={s.proposalSectionTitle}>Kontak</Text>
              {company.whatsapp && (
                <Text style={s.proposalSmallText}>
                  WhatsApp: <Link src={waLink(company.whatsapp)} style={s.denseLink}>{company.whatsapp}</Link>
                </Text>
              )}
              {company.phone && <Text style={s.proposalSmallText}>Telepon: {company.phone}</Text>}
              {company.email && <Text style={s.proposalSmallText}>Email: {company.email}</Text>}
              {company.website && <Text style={s.proposalSmallText}>Website: {company.website}</Text>}
              {!!faqUrl && (
                <Text style={s.proposalSmallText}>
                  FAQ: <Link src={faqUrl} style={s.denseLink}>{faqDisplay}</Link>
                </Text>
              )}
            </View>
            <View style={s.proposalFooterCol}>
              <Text style={s.proposalSectionTitle}>Ketentuan</Text>
              <Text style={s.proposalSmallText}>
                Harga dan jadwal dapat berubah mengikuti ketersediaan maskapai, kurs, cuaca, dan operasional.
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
/* Legacy compact portrait styles are intentionally kept above for reuse in older generated variants. */
