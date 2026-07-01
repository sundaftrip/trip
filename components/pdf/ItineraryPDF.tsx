/* Itinerary PDF document - rendered server-side via @react-pdf/renderer. */
import {
  Document, Page, View, Text, Link, Image, StyleSheet, Font,
} from "@react-pdf/renderer";
import { buildItineraryDisplay, type ItineraryInsight } from "@/lib/itinerary-insights";
import { stripItineraryMarkup } from "@/lib/itinerary-markup";
import type { TourPaymentPlan } from "@/lib/tour-payment-plan";

const PAPER = "#FFFFFF";
const TEAL = "#FBD324";
const CHARCOAL = "#050505";
const INK = CHARCOAL;
const GOLD = CHARCOAL;
const SUB = CHARCOAL;
const HAIR = "#D9D9D9";
const DASH = "#EEEEEE";
const WHITE = "#FFFFFF";
const VISA_URL = "https://sundaftrip.com/visa";
const FONT = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
} as const;
const TYPOGRAPHY = {
  documentTitle: { fontFamily: FONT.bold, fontSize: 24, lineHeight: 1.12 },
  subtitle: { fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 1.35 },
  sectionHeading: { fontFamily: FONT.bold, fontSize: 14.5, lineHeight: 1.15 },
  tableHeader: { fontFamily: FONT.bold, fontSize: 10, lineHeight: 1.25 },
  summaryLabel: { fontFamily: FONT.bold, fontSize: 10, lineHeight: 1.25, letterSpacing: 0.2 },
  summaryValue: { fontFamily: FONT.regular, fontSize: 10.25, lineHeight: 1.3 },
  itineraryDay: { fontFamily: FONT.bold, fontSize: 10, lineHeight: 1.25 },
  itineraryTitle: { fontFamily: FONT.bold, fontSize: 10.75, lineHeight: 1.25 },
  itineraryDescription: { fontFamily: FONT.regular, fontSize: 9.75, lineHeight: 1.35 },
  itineraryMeta: { fontFamily: FONT.regular, fontSize: 8.75, lineHeight: 1.2 },
  body: { fontFamily: FONT.regular, fontSize: 9.75, lineHeight: 1.35 },
  bullet: { fontFamily: FONT.regular, fontSize: 9.75, lineHeight: 1.35 },
  priceValue: { fontFamily: FONT.bold, fontSize: 10.25, lineHeight: 1.3 },
  footnote: { fontFamily: FONT.regular, fontSize: 8.25, lineHeight: 1.3 },
  headerSmall: { fontFamily: FONT.regular, fontSize: 8, lineHeight: 1.2 },
  footer: { fontFamily: FONT.bold, fontSize: 7.75, lineHeight: 1.2 },
  subsectionHeading: { fontFamily: FONT.bold, fontSize: 10.75, lineHeight: 1.25 },
} as const;
const MAX_ITINERARY_BRIEF_LENGTH = 260;
const PAYMENT_TERMS = [
  "Pembayaran hanya mengikuti invoice resmi Sundaf Trip.",
  "DP mengunci seat dan nominalnya mengikuti invoice awal.",
  "Pelunasan wajib mengikuti jadwal settlement atau invoice terbaru.",
  "Add-on opsional, visa, dan layanan tambahan dibayar terpisah setelah dikonfirmasi.",
  "Bukti transfer wajib dikirim untuk verifikasi administrasi.",
  "Keterlambatan pembayaran dapat memengaruhi ketersediaan tiket, hotel, dan layanan.",
];

Font.registerHyphenationCallback((word) => [word]);

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
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

const s = StyleSheet.create({
  page: {
    backgroundColor: PAPER,
    color: INK,
    fontFamily: FONT.regular,
    paddingTop: 30,
    paddingBottom: 44,
    paddingHorizontal: 34,
  },
  flowPage: {
    backgroundColor: PAPER,
    color: INK,
    fontFamily: FONT.regular,
    paddingTop: 84,
    paddingBottom: 72,
    paddingHorizontal: 38,
  },
  flowHeader: {
    position: "absolute",
    top: 26,
    left: 38,
    right: 38,
    height: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0.7,
    borderBottomColor: HAIR,
    paddingBottom: 9,
  },
  flowLogo: { width: 92, height: 28, objectFit: "contain" },
  flowHeaderTitle: { ...TYPOGRAPHY.headerSmall, color: SUB, textAlign: "right" },
  flowFooter: {
    position: "absolute",
    left: 38,
    right: 38,
    top: 806,
    height: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.7,
    borderTopColor: HAIR,
    paddingTop: 7,
  },
  flowFooterText: { ...TYPOGRAPHY.footnote, color: SUB },
  flowFooterLinks: {
    flex: 1,
    flexDirection: "row",
    gap: 18,
    paddingRight: 48,
  },
  flowFooterLink: {
    ...TYPOGRAPHY.footer,
    color: CHARCOAL,
    textDecoration: "underline",
  },
  flowPageNumber: {
    position: "absolute",
    top: 813,
    right: 38,
    width: 38,
    ...TYPOGRAPHY.headerSmall,
    color: SUB,
    textAlign: "right",
  },
  flowTitleBlock: {
    marginBottom: 18,
    padding: 13,
    borderWidth: 0.8,
    borderColor: HAIR,
    backgroundColor: "#FFFBE8",
  },
  flowHeroBand: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 18,
    padding: 12,
    borderWidth: 0.8,
    borderColor: HAIR,
    backgroundColor: "#FFFBE8",
  },
  flowHeroCopy: {
    flex: 1,
    paddingRight: 4,
  },
  flowDocLabel: {
    fontFamily: FONT.bold,
    fontSize: 7.6,
    lineHeight: 1.2,
    letterSpacing: 1.1,
    color: SUB,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  flowHeroImageWrap: {
    width: 154,
    height: 108,
    borderWidth: 0.8,
    borderColor: HAIR,
    padding: 3,
    backgroundColor: WHITE,
  },
  flowHeroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  flowTitle: {
    ...TYPOGRAPHY.documentTitle,
    color: CHARCOAL,
    borderLeftWidth: 7,
    borderLeftColor: TEAL,
    paddingLeft: 9,
  },
  flowSubtitle: {
    ...TYPOGRAPHY.subtitle,
    color: CHARCOAL,
    marginTop: 9,
  },
  flowSection: { marginTop: 16 },
  flowSectionTitle: {
    ...TYPOGRAPHY.sectionHeading,
    fontSize: 12.5,
    color: CHARCOAL,
    backgroundColor: TEAL,
    paddingVertical: 3,
    paddingHorizontal: 6,
    alignSelf: "flex-start",
    marginBottom: 9,
  },
  flowBodyText: {
    ...TYPOGRAPHY.body,
    color: INK,
    textAlign: "justify",
  },
  flowTable: {
    borderTopWidth: 0.7,
    borderTopColor: HAIR,
    borderBottomWidth: 0.7,
    borderBottomColor: HAIR,
  },
  flowTableHead: {
    flexDirection: "row",
    borderBottomWidth: 0.7,
    borderBottomColor: HAIR,
  },
  flowTableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.45,
    borderBottomColor: DASH,
    minHeight: 31,
  },
  flowCell: {
    ...TYPOGRAPHY.body,
    color: INK,
    paddingVertical: 7,
    paddingHorizontal: 6,
  },
  flowCellBold: {
    ...TYPOGRAPHY.tableHeader,
    color: CHARCOAL,
    paddingVertical: 7,
    paddingHorizontal: 6,
  },
  flowSummaryLabel: { ...TYPOGRAPHY.summaryLabel, color: CHARCOAL },
  flowSummaryValue: { ...TYPOGRAPHY.summaryValue, color: INK },
  flowInfoLabel: { width: 150 },
  flowDayCell: { width: 46, textAlign: "center" },
  flowItineraryDay: { ...TYPOGRAPHY.itineraryDay, color: CHARCOAL },
  flowAgendaCell: { flex: 1 },
  flowItineraryTitle: {
    ...TYPOGRAPHY.itineraryTitle,
    color: CHARCOAL,
  },
  flowBriefText: {
    ...TYPOGRAPHY.itineraryDescription,
    color: INK,
    marginTop: 2,
    textAlign: "justify",
  },
  flowInsightGrid: {
    marginTop: 5,
    paddingTop: 1,
  },
  flowInsightItem: {
    marginTop: 2,
  },
  flowInsightLabel: {
    ...TYPOGRAPHY.itineraryMeta,
    fontFamily: FONT.bold,
    color: CHARCOAL,
  },
  flowInsightValue: {
    ...TYPOGRAPHY.itineraryMeta,
    color: CHARCOAL,
    marginTop: 0.5,
  },
  flowTwoCol: { flexDirection: "row", gap: 18 },
  flowCol: { flex: 1 },
  flowListHead: {
    ...TYPOGRAPHY.subsectionHeading,
    color: CHARCOAL,
    marginBottom: 7,
  },
  flowListItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  flowBullet: {
    ...TYPOGRAPHY.bullet,
    fontFamily: FONT.bold,
    color: CHARCOAL,
    width: 13,
  },
  flowListText: {
    flex: 1,
    ...TYPOGRAPHY.bullet,
    color: INK,
    textAlign: "justify",
  },
  flowLink: {
    color: CHARCOAL,
    fontFamily: FONT.bold,
    textDecoration: "underline",
  },
  flowPriceValue: { ...TYPOGRAPHY.priceValue, color: CHARCOAL },
  flowPriceNormal: {
    ...TYPOGRAPHY.summaryValue,
    fontSize: 8.6,
    color: SUB,
    textDecoration: "line-through",
  },
  flowPriceSavings: {
    ...TYPOGRAPHY.summaryLabel,
    fontSize: 8.6,
    color: CHARCOAL,
  },
  flowFootnote: { ...TYPOGRAPHY.footnote, color: SUB },
  flowAddOnName: { flex: 1.35 },
  flowAddOnPrice: { width: 130, textAlign: "right" },
  flowPaymentStage: { width: 92 },
  flowPaymentDue: { flex: 1 },
  flowPaymentAmount: { width: 112, textAlign: "right" },

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
  inlineLink: { color: CHARCOAL, fontFamily: "Helvetica-Bold", textDecoration: "underline" },
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
  faqLink: { color: CHARCOAL, fontFamily: "Helvetica-Bold", textDecoration: "underline" },
  waLink: { color: CHARCOAL, fontFamily: "Helvetica-Bold", textDecoration: "underline" },
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
  proposalBrandTrip: { fontFamily: "Helvetica-Bold", fontSize: 5.6, color: CHARCOAL, marginLeft: 2, marginTop: 1 },
  proposalTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: CHARCOAL,
    backgroundColor: TEAL,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: "center",
    lineHeight: 1.12,
    textAlign: "center",
  },
  proposalSubtitle: { fontSize: 7.4, color: CHARCOAL, textAlign: "center", marginTop: 6 },
  proposalGrid: { flexDirection: "row", gap: 16 },
  proposalLeft: { width: "58%" },
  proposalRight: { flex: 1 },
  proposalSectionGap: { marginTop: 8 },
  proposalTable: {
    borderTopWidth: 0.7,
    borderTopColor: HAIR,
    borderBottomWidth: 0.7,
    borderBottomColor: HAIR,
  },
  proposalHeadRow: { flexDirection: "row", backgroundColor: WHITE },
  proposalHeadCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.8,
    color: CHARCOAL,
    paddingVertical: 4,
    paddingHorizontal: 5,
  },
  proposalRow: {
    flexDirection: "row",
    borderBottomWidth: 0.45,
    borderBottomColor: HAIR,
    minHeight: 34,
  },
  proposalCell: { paddingVertical: 3.6, paddingHorizontal: 5, justifyContent: "center" },
  proposalDayCell: { width: 31, alignItems: "center" },
  proposalDateCell: { width: 66 },
  proposalEventCell: { flex: 1 },
  proposalPlaceCell: { width: 58 },
  proposalDayText: { fontFamily: "Helvetica-Bold", fontSize: 12, color: CHARCOAL },
  proposalDateText: { fontSize: 6.2, color: CHARCOAL, lineHeight: 1.18 },
  proposalEventTitle: { fontFamily: "Helvetica-Bold", fontSize: 7.1, color: CHARCOAL, lineHeight: 1.18 },
  proposalEventDesc: { fontSize: 5.9, color: INK, lineHeight: 1.22, marginTop: 1.2, textAlign: "justify" },
  proposalInsightLine: { fontFamily: "Helvetica-Bold", fontSize: 5.6, color: CHARCOAL, lineHeight: 1.2, marginTop: 2 },
  proposalPlaceText: { fontFamily: "Helvetica-Bold", fontSize: 6.4, color: CHARCOAL, lineHeight: 1.16 },
  proposalMiniTable: {
    borderTopWidth: 0.7,
    borderTopColor: HAIR,
    borderBottomWidth: 0.7,
    borderBottomColor: HAIR,
  },
  proposalMiniRow: {
    flexDirection: "row",
    borderBottomWidth: 0.45,
    borderBottomColor: HAIR,
  },
  proposalMiniCell: { flex: 1, paddingVertical: 3.4, paddingHorizontal: 5 },
  proposalMiniLabel: { fontFamily: "Helvetica-Bold", fontSize: 5.8, color: CHARCOAL, letterSpacing: 0.3 },
  proposalMiniValue: { fontFamily: "Helvetica-Bold", fontSize: 7.1, color: CHARCOAL, lineHeight: 1.14, marginTop: 1.5 },
  proposalPrice: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: CHARCOAL, lineHeight: 1.1, marginTop: 1.5 },
  proposalSectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: CHARCOAL,
    backgroundColor: TEAL,
    paddingVertical: 3,
    paddingHorizontal: 6,
    alignSelf: "flex-start",
    marginBottom: 7,
  },
  proposalListGrid: { flexDirection: "row", gap: 10 },
  proposalListCol: { flex: 1 },
  proposalListHead: { fontFamily: "Helvetica-Bold", fontSize: 8.5, marginBottom: 5, color: CHARCOAL },
  proposalListItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 2.5 },
  proposalBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4.5,
    marginTop: 2.6,
  },
  proposalListText: { flex: 1, fontSize: 6.3, color: CHARCOAL, lineHeight: 1.25, textAlign: "justify" },
  proposalAddOnRow: { flexDirection: "row", borderBottomWidth: 0.45, borderBottomColor: HAIR },
  proposalAddOnName: { flex: 1.35, fontSize: 6.4, color: CHARCOAL, paddingVertical: 3.2, paddingHorizontal: 5 },
  proposalAddOnPrice: {
    flex: 0.8,
    fontFamily: "Helvetica-Bold",
    fontSize: 6.4,
    color: GOLD,
    paddingVertical: 3.2,
    paddingHorizontal: 5,
    textAlign: "right",
  },
  proposalFooterGrid: { flexDirection: "row", gap: 12, marginTop: 7 },
  proposalFooterCol: { flex: 1 },
  proposalLeftNoteGrid: { flexDirection: "row", gap: 10, marginTop: 7 },
  proposalLeftNoteCol: { flex: 1 },
  proposalSmallText: { fontSize: 6.25, color: INK, lineHeight: 1.24, textAlign: "justify" },
  paymentIntro: { fontSize: 6.4, color: INK, lineHeight: 1.24, textAlign: "justify" },
  paymentMethods: { fontFamily: "Helvetica-Bold", fontSize: 5.65, color: CHARCOAL, lineHeight: 1.2, marginTop: 2 },
  paymentBadge: {
    alignSelf: "flex-start",
    fontFamily: "Helvetica-Bold",
    fontSize: 5.65,
    color: GOLD,
    marginTop: 4,
  },
  paymentTotal: { fontFamily: "Helvetica-Bold", fontSize: 5.8, color: CHARCOAL, marginTop: 4 },
  paymentTable: {
    marginTop: 5,
    borderTopWidth: 0.7,
    borderTopColor: HAIR,
    borderBottomWidth: 0.7,
    borderBottomColor: HAIR,
  },
  paymentRow: { flexDirection: "row", borderBottomWidth: 0.45, borderBottomColor: HAIR },
  paymentHeadRow: { flexDirection: "row", backgroundColor: WHITE },
  paymentHeadCell: { fontFamily: "Helvetica-Bold", fontSize: 6.1, color: CHARCOAL, paddingVertical: 3.3, paddingHorizontal: 4 },
  paymentCell: { fontSize: 6.2, color: CHARCOAL, paddingVertical: 3.2, paddingHorizontal: 4 },
  paymentStageCell: { width: 62, fontFamily: "Helvetica-Bold" },
  paymentDueCell: { flex: 1 },
  paymentAmountCell: { width: 76, textAlign: "right", fontFamily: "Helvetica-Bold" },
  paymentFinePrint: { fontSize: 5.25, color: SUB, lineHeight: 1.18, marginTop: 3 },
  portraitPage: {
    backgroundColor: PAPER,
    color: CHARCOAL,
    fontFamily: "Helvetica",
    paddingTop: 25,
    paddingBottom: 36,
    paddingHorizontal: 38,
  },
  portraitSheet: { backgroundColor: PAPER },
  portraitHeader: {
    marginBottom: 16,
    alignItems: "center",
    borderBottomWidth: 0.7,
    borderBottomColor: HAIR,
    paddingBottom: 10,
  },
  portraitPageTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 17,
    color: CHARCOAL,
    backgroundColor: TEAL,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: "center",
    textAlign: "center",
  },
  portraitTableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.45,
    borderBottomColor: HAIR,
    minHeight: 45,
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
  denseLink: { color: CHARCOAL, fontFamily: "Helvetica-Bold", textDecoration: "underline" },
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

function cleanText(value?: string | null) {
  return value ? stripItineraryMarkup(value).replace(/\s+/g, " ").trim() : "";
}

function websiteFooterLink(raw?: string | null) {
  const cleaned = cleanText(raw) || "www.sundaftrip.com";
  const withoutProtocol = cleaned.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const display = withoutProtocol.startsWith("www.") ? withoutProtocol : `www.${withoutProtocol}`;
  return {
    display,
    href: `https://${display.replace(/^www\./i, "")}`,
  };
}

function instagramFooterLink(raw?: string | null) {
  const cleaned = (cleanText(raw) || "sundaf.trip")
    .replace(/^@/, "")
    .replace(/^https?:\/\/(?:www\.)?instagram\.com\//i, "")
    .replace(/\/+$/, "");
  const username = cleaned || "sundaf.trip";

  return {
    display: `Instagram @${username}`,
    href: `https://www.instagram.com/${username}`,
  };
}

function profileText(company: ItineraryPDFProps["company"]) {
  const name = company.name || "Sundaf Trip";
  const story = company.story?.map(cleanText).find(Boolean);
  const nib = company.nib ? ` NIB ${company.nib}.` : "";

  return story || `${name} adalah brand perjalanan Indonesia untuk paket tour, private/open trip, aurora borealis, Asia Tengah, dan bantuan visa bagi traveler Indonesia.${nib}`;
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

function FixedChrome({
  company,
  runningTitle,
}: {
  company: ItineraryPDFProps["company"];
  runningTitle: string;
}) {
  const websiteLink = websiteFooterLink(company.website);
  const instagramLink = instagramFooterLink(company.instagram);

  return (
    <>
      <View fixed style={s.flowHeader}>
        {company.logo ? (
          // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image does not support alt; the surrounding PDF header carries the brand text.
          <Image src={company.logo} style={s.flowLogo} />
        ) : (
          <BrandMark />
        )}
        <Text style={s.flowHeaderTitle}>{runningTitle}</Text>
      </View>
      <View fixed style={s.flowFooter}>
        <View style={s.flowFooterLinks}>
          <Link src={websiteLink.href} style={s.flowFooterLink}>{websiteLink.display}</Link>
          <Link src={instagramLink.href} style={s.flowFooterLink}>{instagramLink.display}</Link>
        </View>
      </View>
      <Text
        fixed
        style={s.flowPageNumber}
        render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => (
          `${pageNumber}/${totalPages}`
        )}
      />
    </>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <View wrap={false}>
      <Text style={s.flowSectionTitle}>{children}</Text>
    </View>
  );
}

function FlowLinkedText({ text }: { text: string }) {
  const displayText = formatPdfListText(text);
  const parts = linkedTextParts(displayText);
  if (!parts) return <Text style={s.flowListText}>{displayText}</Text>;

  return (
    <Text style={s.flowListText}>
      {parts.before}
      <Link src={VISA_URL} style={s.flowLink}>{parts.linked}</Link>
      {parts.after}
    </Text>
  );
}

function FlowBullet({ text }: { text: string }) {
  return (
    <View style={s.flowListItem}>
      <Text style={s.flowBullet}>-</Text>
      <FlowLinkedText text={text} />
    </View>
  );
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

function FlowPriceSummary({
  priceLabel,
  priceCoretLabel,
}: {
  priceLabel: string;
  priceCoretLabel?: string | null;
}) {
  const normalPrice = splitNormalPriceLabel(priceCoretLabel);

  return (
    <Text style={[s.flowCell, s.flowPriceValue, { flex: 1 }]}>
      <Text style={s.flowPriceValue}>{priceLabel}</Text>
      {normalPrice ? (
        <>
          <Text style={s.flowSummaryValue}>  normal </Text>
          <Text style={s.flowPriceNormal}>{normalPrice.normalLabel}</Text>
          {normalPrice.savingsLabel ? <Text style={s.flowPriceSavings}>  {normalPrice.savingsLabel}</Text> : null}
        </>
      ) : null}
    </Text>
  );
}

function FlowSummaryValue({
  label,
  value,
  priceCoretLabel,
}: {
  label: string;
  value: string;
  priceCoretLabel?: string | null;
}) {
  if (label === "HARGA PER ORANG") {
    return <FlowPriceSummary priceLabel={value} priceCoretLabel={priceCoretLabel} />;
  }

  return (
    <Text style={[
      s.flowCell,
      /HARGA|LAND TOUR/.test(label) ? s.flowPriceValue : s.flowSummaryValue,
      { flex: 1 },
    ]}>
      {value}
    </Text>
  );
}

function uniqueCommaList(value: string) {
  const items: string[] = [];

  cleanText(value)
    .split(/\s*,\s*/)
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => {
      if (!items.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
        items.push(item);
      }
    });

  return items.join(", ");
}

function translateMealInsight(value: string) {
  return uniqueCommaList(value
    .replace(/\bBreakfast\b/gi, "Sarapan")
    .replace(/\bLunch\b/gi, "Makan siang")
    .replace(/\bDinner\b/gi, "Makan malam")
    .replace(/\bNo meals? included\b/gi, "Belum termasuk")
    .replace(/\s+dan\s+/gi, ", ")
    .replace(/\s*,\s*/g, ", ")
    .trim());
}

function translateTransportInsight(value: string) {
  return uniqueCommaList(value
    .replace(/\bKapal\/Boat\/Cruise\b/gi, "Kapal/cruise")
    .replace(/\bKapal\/Boat\b/gi, "Kapal")
    .replace(/\bKapal\/Kapal\/cruise\b/gi, "Kapal/cruise")
    .replace(/\bFlights?\b/gi, "Penerbangan")
    .replace(/\bTrains?\b/gi, "Kereta api")
    .replace(/\bBoat\/Cruise\b/gi, "Kapal/cruise")
    .replace(/\bBoat\b/gi, "Kapal")
    .replace(/\bCruise\b/gi, "Kapal/cruise")
    .replace(/\bKapal\/Kapal\/cruise\b/gi, "Kapal/cruise")
    .replace(/\s*,\s*/g, ", ")
    .trim());
}

function translateStayInsight(value: string) {
  const cleaned = cleanText(value);
  if (/^(?:overnight stay|meng?inap)$/i.test(cleaned)) return "Menginap";
  return cleaned
    .replace(/\bOvernight\b/gi, "Bermalam")
    .replace(/\bYurt Camp\b/gi, "Yurt Camp")
    .trim();
}

function pdfInsightDisplay(insight: ItineraryInsight) {
  if (insight.kind === "meals") return { label: "Makan", value: translateMealInsight(insight.value) };
  if (insight.kind === "transport") return { label: "Transportasi", value: translateTransportInsight(insight.value) };
  if (insight.kind === "stay") return { label: "Bermalam", value: translateStayInsight(insight.value) };
  if (insight.kind === "time") return { label: "Waktu", value: insight.value };
  if (insight.kind === "distance") return { label: "Jarak", value: insight.value };
  if (insight.kind === "ascent") return { label: "Pendakian", value: insight.value };
  return { label: insight.label, value: insight.value };
}

function FlowInsightGrid({ insights }: { insights: ItineraryInsight[] }) {
  if (insights.length === 0) return null;

  return (
    <View style={s.flowInsightGrid}>
      {insights.map((insight) => {
        const display = pdfInsightDisplay(insight);

        return (
          <View key={`${insight.kind}-${insight.value}`} style={s.flowInsightItem}>
            <Text style={s.flowInsightLabel}>{display.label}</Text>
            <Text style={s.flowInsightValue}>
              {display.value}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const DESTINATION_HIGHLIGHT_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "Jakarta", pattern: /\b(?:jakarta|soekarno|indonesia)\b/i },
  { label: "Metro Moscow", pattern: /\b(?:metro\s+moscow|metro\s+moskow)\b/i },
  { label: "Red Square", pattern: /\b(?:red square|lapangan merah)\b/i },
  { label: "Arbat", pattern: /\barbat\b/i },
  { label: "Izmailovo", pattern: /\b(?:izmailovo|ismailovo)\b/i },
  { label: "Moscow", pattern: /\b(?:moscow|moskow)\b/i },
  { label: "Murmansk", pattern: /\bmurmansk\b/i },
  { label: "Teriberka", pattern: /\bteriberka\b/i },
  { label: "Icebreaker Lenin", pattern: /\b(?:icebreaker lenin|pemecah es lenin)\b/i },
  { label: "Aurora Hunting", pattern: /\b(?:aurora hunting|aurora hunt|perburuan aurora|berburu aurora)\b/i },
  { label: "Sami Village", pattern: /\b(?:sami village|desa sami)\b/i },
  { label: "Husky & Reindeer", pattern: /\b(?:husky|reindeer|rusa kutub)\b/i },
  { label: "Hermitage", pattern: /\bhermitage\b/i },
  { label: "Nevsky Prospect", pattern: /\b(?:nevsky|nevski)\b/i },
  { label: "Kazan Cathedral", pattern: /\bkazan\b/i },
  { label: "St Isaac", pattern: /\b(?:st\.?\s*isaac|isaac)\b/i },
  { label: "Church of Savior", pattern: /\b(?:savior|saviour|spilled blood)\b/i },
  { label: "Masjid St Petersburg", pattern: /\b(?:mosque|masjid)\b/i },
  { label: "Sapsan", pattern: /\bsapsan\b/i },
  { label: "St Petersburg", pattern: /\b(?:st\.?\s*petersburg|saint petersburg|petersburg)\b/i },
  { label: "Mausoleum Ho Chi Minh", pattern: /\b(?:mausoleum ho chi minh|ho chi minh mausoleum)\b/i },
  { label: "Pagoda Satu Pilar", pattern: /\b(?:pagoda satu pilar|one pillar pagoda)\b/i },
  { label: "Pagoda Tran Quoc", pattern: /\btran quoc\b/i },
  { label: "Train Street", pattern: /\b(?:train street|jalan kereta)\b/i },
  { label: "Old Quarter", pattern: /\b(?:old quarter|kawasan tua|36 jalan)\b/i },
  { label: "Danau Hoan Kiem", pattern: /\bhoan kiem\b/i },
  { label: "Pasar Dong Xuan", pattern: /\bdong xuan\b/i },
  { label: "Hanoi", pattern: /\b(?:hanoi|ha noi)\b/i },
  { label: "Sung Sot Cave", pattern: /\bsung sot\b/i },
  { label: "Titop Island", pattern: /\b(?:titop|ti top)\b/i },
  { label: "Luon Cave", pattern: /\bluon\b/i },
  { label: "Teluk Halong", pattern: /\b(?:halong|ha long|teluk halong)\b/i },
  { label: "Ninh Binh", pattern: /\bninh binh\b/i },
  { label: "Hoa Lu", pattern: /\bhoa lu\b/i },
  { label: "Tam Coc", pattern: /\btam coc\b/i },
  { label: "Trang An", pattern: /\btrang an\b/i },
  { label: "Sapa", pattern: /\b(?:sapa|sa pa)\b/i },
  { label: "Fansipan", pattern: /\bfansipan\b/i },
  { label: "Cat Cat Village", pattern: /\bcat cat\b/i },
  { label: "Da Nang", pattern: /\b(?:da nang|danang)\b/i },
  { label: "Ba Na Hills", pattern: /\bba na\b/i },
  { label: "Golden Bridge", pattern: /\bgolden bridge\b/i },
  { label: "Hoi An", pattern: /\b(?:hoi an|hoian)\b/i },
  { label: "Cam Thanh Coconut Jungle", pattern: /\bcam thanh\b/i },
  { label: "Hue", pattern: /\bhue\b/i },
  { label: "Ho Chi Minh City", pattern: /\b(?:ho chi minh city|hcmc|saigon|sai gon|kota ho chi minh)\b/i },
  { label: "Cu Chi Tunnels", pattern: /\bcu chi\b/i },
  { label: "Mekong", pattern: /\bmekong\b/i },
  { label: "Phu Quoc", pattern: /\bphu quoc\b/i },
  { label: "Grand World", pattern: /\bgrand world\b/i },
];

const BROAD_DESTINATION_GROUPS: Array<{ city: string; details: string[] }> = [
  { city: "Moscow", details: ["Metro Moscow", "Red Square", "Arbat", "Izmailovo"] },
  { city: "St Petersburg", details: ["Hermitage", "Nevsky Prospect", "Kazan Cathedral", "St Isaac", "Church of Savior", "Masjid St Petersburg"] },
  { city: "Hanoi", details: ["Mausoleum Ho Chi Minh", "Pagoda Satu Pilar", "Pagoda Tran Quoc", "Train Street", "Old Quarter", "Danau Hoan Kiem", "Pasar Dong Xuan"] },
  { city: "Teluk Halong", details: ["Sung Sot Cave", "Titop Island", "Luon Cave"] },
  { city: "Da Nang", details: ["Ba Na Hills", "Golden Bridge"] },
  { city: "Hoi An", details: ["Cam Thanh Coconut Jungle"] },
];

function pushUniqueHighlight(items: string[], value: string) {
  const cleaned = cleanText(value)
    .replace(/\([^)]*(?:sarapan|makan|breakfast|lunch|dinner|brunch|b|l|d)[^)]*\)/gi, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/^(?:tur kota|city tour|tur privat|private tour|tur sore|tur pagi|full day|sehari penuh)\s+/i, "")
    .replace(/^(?:bus shuttle|shuttle|transfer(?: privat)?|penerbangan|flight|kereta cepat|train|tiba|arrive)\s+(?:ke|to|di|in)?\s*/i, "")
    .replace(/^(?:bermalam|overnight)\s+(?:di|in)?\s*/i, "")
    .replace(/\s+(?:transfer|check-?in|check\s*out|hotel|bandara|airport|tanpa|with|dengan)\b.*$/i, "")
    .replace(/^(?:ke|to|di|in)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^moskow$/i, "Moscow")
    .replace(/^ha noi$/i, "Hanoi")
    .replace(/^danang$/i, "Da Nang")
    .replace(/^hoian$/i, "Hoi An");

  if (!cleaned || cleaned.length < 3 || cleaned.length > 42) return;
  if (/^(?:makan|sarapan|breakfast|lunch|dinner|brunch|check|hotel|waktu bebas|free time)$/i.test(cleaned)) return;
  if (!items.some((item) => item.toLowerCase() === cleaned.toLowerCase())) items.push(cleaned);
}

function destinationHighlightsForDay(day: Pick<ItineraryDay, "title" | "description">) {
  const source = cleanText(`${day.title} ${day.description}`);
  const highlights: string[] = [];

  DESTINATION_HIGHLIGHT_PATTERNS
    .map(({ label, pattern }) => {
      const match = source.match(pattern);
      return match?.index === undefined ? null : { label, index: match.index };
    })
    .filter((item): item is { label: string; index: number } => Boolean(item))
    .sort((a, b) => a.index - b.index)
    .forEach(({ label }) => pushUniqueHighlight(highlights, label));

  if (highlights.length === 0) {
    cleanText(day.title)
      .replace(/\([^)]*\)/g, "")
      .split(/\s+(?:-|\u2013|\u2014)\s+|\/|\||,|\u2022/g)
      .forEach((part) => pushUniqueHighlight(highlights, part));
  }

  if (highlights.length === 0) pushUniqueHighlight(highlights, cleanText(day.title));
  if (highlights.length === 0) pushUniqueHighlight(highlights, placeForDay(day));

  const compacted = highlights.filter((item) => {
    const group = BROAD_DESTINATION_GROUPS.find((entry) => entry.city === item);
    return !group || !group.details.some((detail) => highlights.includes(detail));
  });

  return (compacted.length > 0 ? compacted : highlights).slice(0, 6);
}

function cleanBriefSegment(value: string) {
  return cleanText(value)
    .replace(/^["']+|["']+$/g, "")
    .replace(/\s*[•|]\s*/g, ", ")
    .replace(/\s+(?:-|--|\u2013|\u2014)\s+/g, " - ")
    .replace(/\((opsional|optional)\)/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function finishSentence(value: string) {
  if (!value) return "";
  return /[.!?]$/.test(value) ? value : `${value}.`;
}

const DANGLING_BRIEF_END_WORDS = new Set([
  "dan",
  "atau",
  "lalu",
  "kemudian",
  "serta",
  "dengan",
  "untuk",
  "ke",
  "di",
  "dari",
  "menuju",
  "yang",
  "sebagai",
  "agar",
  "karena",
  "jika",
  "bila",
  "sambil",
  "sebelum",
  "sesudah",
  "setelah",
  "termasuk",
  "melalui",
  "hingga",
  "sampai",
  "pada",
  "dalam",
  "tanpa",
]);

function stripDanglingBriefEnding(value: string) {
  let text = value.replace(/[\s,;:()/-]+$/g, "").trim();
  let words = text.split(/\s+/).filter(Boolean);

  while (words.length > 1) {
    const lastWord = words[words.length - 1].toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (!DANGLING_BRIEF_END_WORDS.has(lastWord)) break;
    words = words.slice(0, -1);
  }

  text = words.join(" ").replace(/[\s,;:()/-]+$/g, "").trim();
  return text;
}

function lastBoundaryIndex(value: string, pattern: RegExp, minLength: number) {
  let index = -1;
  let match: RegExpExecArray | null;
  pattern.lastIndex = 0;

  while ((match = pattern.exec(value))) {
    const boundary = match.index + match[0].length;
    if (boundary >= minLength) index = boundary;
  }

  return index;
}

function shortenAtWord(value: string, maxLength: number) {
  const text = cleanBriefSegment(value);
  if (text.length <= maxLength) return text;

  const minLength = Math.max(90, Math.floor(maxLength * 0.58));
  const minSentenceLength = 70;
  const window = text.slice(0, maxLength);
  const sentenceBoundary = lastBoundaryIndex(window, /[.!?](?=\s|$)/g, minSentenceLength);
  if (sentenceBoundary > -1) return stripDanglingBriefEnding(window.slice(0, sentenceBoundary));

  const clauseBoundary = lastBoundaryIndex(window, /[,;:](?=\s|$)/g, minLength);
  const clipped = clauseBoundary > -1
    ? window.slice(0, clauseBoundary)
    : window.replace(/\s+\S*$/, "");
  const cleanClip = stripDanglingBriefEnding(clipped);
  return cleanClip ? `${cleanClip}...` : `${stripDanglingBriefEnding(window)}...`;
}

function formatPdfBriefText(value: string) {
  return cleanBriefSegment(value)
    .replace(/\bBreakfast at (?:the )?hotel\b/gi, "Sarapan di hotel")
    .replace(/\bBreakfast\b/gi, "Sarapan")
    .replace(/\bLunch\b/gi, "Makan siang")
    .replace(/\bDinner\b/gi, "Makan malam")
    .replace(/\bReturn flight to\b/gi, "Penerbangan kembali menuju")
    .replace(/\bFlight to\b/gi, "Penerbangan menuju")
    .replace(/\bFlights?\b/gi, "Penerbangan")
    .replace(/\bPrivate transfer\b/gi, "Transfer privat")
    .replace(/\bSarapan dan\b/gi, "Sarapan,")
    .replace(/\bTransportasi private\b/gi, "Transfer privat")
    .replace(/\bTransportasi\b\s*:?\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPdfListText(value: string) {
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

function isBriefMetadataLine(value: string) {
  return /^(?:makan|bermalam|overnight|meal|meals)\s*:/i.test(value)
    || /^(?:makan|meals)\s+(?:belum|di luar|diluar|dengan|with)\b/i.test(value)
    || /^termasuk\s+(?:sarapan|makan|breakfast|lunch|dinner)\b/i.test(value);
}

function firstBriefSentence(value: string) {
  const lines = stripItineraryMarkup(value)
    .split(/\n+/)
    .map(cleanBriefSegment)
    .filter(Boolean);
  const firstNarrativeLine = lines.find((line) => (
    line.length >= 18 && !isBriefMetadataLine(line)
  ));

  if (firstNarrativeLine) return firstNarrativeLine;

  const cleaned = cleanBriefSegment(value);
  const sentences = cleaned.match(/[^.!?]+[.!?]?/g) ?? [];

  return cleanBriefSegment(
    sentences
      .map((sentence) => sentence.trim())
      .find((sentence) => sentence.length >= 18 && !/^makan\b|^bermalam\b/i.test(sentence))
      ?? "",
  );
}

function itineraryBriefForDay(
  day: Pick<ItineraryDay, "title" | "description">,
  highlights: string[],
) {
  const title = cleanBriefSegment(day.title);
  const sentence = firstBriefSentence(day.description);
  const compactSentence = sentence && !title.toLowerCase().includes(sentence.slice(0, 24).toLowerCase())
    ? shortenAtWord(sentence, MAX_ITINERARY_BRIEF_LENGTH)
    : "";

  if (compactSentence) return finishSentence(formatPdfBriefText(compactSentence));
  if (title) return finishSentence(shortenAtWord(`Rute utama: ${title}`, MAX_ITINERARY_BRIEF_LENGTH));
  if (highlights.length > 0) return finishSentence(shortenAtWord(`Rute utama: ${highlights.join(", ")}`, MAX_ITINERARY_BRIEF_LENGTH));
  return "";
}

function BrandMark() {
  return (
    <View style={s.proposalBrand}>
      <Text style={s.proposalBrandName}>Sundaf</Text>
      <Text style={s.proposalBrandTrip}>Trip</Text>
    </View>
  );
}

function placeForDay(day: Pick<ItineraryDay, "title" | "description">) {
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
  return "";
}

export function ItineraryPDF({
  tour, priceLabel, priceCoretLabel, landTourLabel, company, faqUrl, paymentPlan,
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
  const runningTitle = `Rencana Perjalanan ${tour.title}`;
  const infoRows = [
    ...meta,
    ["HARGA PER ORANG", priceLabel],
    landTourLabel ? ["LAND TOUR", landTourLabel] : null,
  ].filter(Boolean) as [string, string][];
  const subtitleParts = [
    `Disiapkan oleh ${company.name || "Sundaf Trip"}`,
    tour.duration,
    dateLabel,
  ].filter(Boolean);
  const notesCopy = cleanText(tour.notes) || "Harga dan jadwal dapat berubah mengikuti kondisi operasional di lapangan.";
  const visaCopy = cleanText(tour.visaInfo)
    || "Visa dapat dibantu melalui sundaftrip.com/visa. Hubungi WhatsApp untuk ketersediaan kursi dan proses pendaftaran.";
  const paymentTermColumns = [
    PAYMENT_TERMS.filter((_, index) => index % 2 === 0),
    PAYMENT_TERMS.filter((_, index) => index % 2 === 1),
  ];

  return (
    <Document title={`Rencana Perjalanan ${tour.title}`} author={company.name || "Sundaf Trip"}>
      <Page size="A4" style={s.flowPage} wrap>
        <FixedChrome company={company} runningTitle={runningTitle} />

        <View style={tour.heroImg ? s.flowHeroBand : s.flowTitleBlock} wrap={false}>
          <View style={s.flowHeroCopy}>
            <Text style={s.flowDocLabel}>Customer itinerary</Text>
            <Text style={s.flowTitle}>{runningTitle}</Text>
            <Text style={s.flowSubtitle}>{subtitleParts.join(" - ")}</Text>
          </View>
          {tour.heroImg && (
            <View style={s.flowHeroImageWrap}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop; title and running header provide context. */}
              <Image src={tour.heroImg} style={s.flowHeroImage} />
            </View>
          )}
        </View>

        <View style={s.flowSection}>
          <SectionTitle>Ringkasan Perjalanan</SectionTitle>
          <View style={s.flowTable}>
            {infoRows.map(([label, value]) => (
              <View key={label} style={s.flowTableRow}>
                <Text style={[s.flowCellBold, s.flowSummaryLabel, s.flowInfoLabel]}>{label}</Text>
                <FlowSummaryValue label={label} value={value} priceCoretLabel={priceCoretLabel} />
              </View>
            ))}
          </View>
        </View>

        <View style={s.flowSection}>
          <SectionTitle>Rencana Perjalanan</SectionTitle>
          <View style={s.flowTable}>
            <View style={s.flowTableHead}>
              <Text style={[s.flowCellBold, s.flowDayCell]}>Hari</Text>
              <Text style={[s.flowCellBold, s.flowAgendaCell]}>Agenda</Text>
            </View>
            {displayItinerary.map((day, idx) => {
              const highlights = destinationHighlightsForDay(day);
              const brief = itineraryBriefForDay(day, highlights);

              return (
                <View key={`${day.day}-${idx}`} style={s.flowTableRow} wrap={false}>
                  <Text style={[s.flowCellBold, s.flowDayCell, s.flowItineraryDay]}>{day.day}</Text>
                  <View style={[s.flowCell, s.flowAgendaCell]}>
                    <Text style={s.flowItineraryTitle}>{cleanText(day.title)}</Text>
                    {!!brief && <Text style={s.flowBriefText}>{brief}</Text>}
                    <FlowInsightGrid insights={day.insights} />
                  </View>
                </View>
              );
            })}
          </View>
          <Text style={[s.flowFootnote, { marginTop: 7 }]}>
            *Detail aktivitas mengikuti itinerary website dan dapat berubah sesuai kondisi cuaca serta operasional di lapangan.
          </Text>
        </View>

        {(tour.inclusions.length > 0 || tour.exclusions.length > 0) && (
          <View style={s.flowSection}>
            <SectionTitle>Harga Sudah / Belum Termasuk</SectionTitle>
            <View style={s.flowTwoCol}>
              <View style={s.flowCol}>
                <Text style={s.flowListHead}>Sudah Termasuk</Text>
                {tour.inclusions.map((item, i) => <FlowBullet key={i} text={item} />)}
              </View>
              <View style={s.flowCol}>
                <Text style={s.flowListHead}>Belum Termasuk</Text>
                {tour.exclusions.map((item, i) => <FlowBullet key={i} text={item} />)}
              </View>
            </View>
          </View>
        )}

        {!!addOns.length && (
          <View style={s.flowSection}>
            <SectionTitle>Add-on Opsional</SectionTitle>
            <View style={s.flowTable}>
              <View style={s.flowTableHead}>
                <Text style={[s.flowCellBold, s.flowAddOnName]}>Layanan</Text>
                <Text style={[s.flowCellBold, s.flowAddOnPrice]}>Harga/orang</Text>
              </View>
              {addOns.map((item, i) => (
                <View key={i} style={s.flowTableRow}>
                  <Text style={[s.flowCell, s.flowAddOnName]}>
                    {item.name}{item.tag === "recommended" ? " (rekomendasi)" : ""}
                  </Text>
                  <Text style={[s.flowCellBold, s.flowAddOnPrice]}>{item.priceLabel}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={s.flowSection}>
          <SectionTitle>Settlement & Pembayaran</SectionTitle>
          {!!paymentPlan && paymentPlan.steps.length > 0 ? (
            <>
              <Text style={s.flowBodyText}>{paymentPlan.intro}</Text>
              <Text style={[s.flowBodyText, { marginTop: 4 }]}>({paymentPlan.paymentMethodsLabel})</Text>
              <Text style={[s.flowPriceValue, { marginTop: 4 }]}>Total skema: {paymentPlan.totalLabel} / orang</Text>
              <View style={[s.flowTable, { marginTop: 8 }]}>
                <View style={s.flowTableHead}>
                  <Text style={[s.flowCellBold, s.flowPaymentStage]}>Tahap</Text>
                  <Text style={[s.flowCellBold, s.flowPaymentDue]}>Jatuh Tempo</Text>
                  <Text style={[s.flowCellBold, s.flowPaymentAmount]}>Nominal</Text>
                </View>
                {paymentPlan.steps.map((step) => (
                  <View key={step.label} style={s.flowTableRow}>
                    <Text style={[s.flowCellBold, s.flowPaymentStage]}>{step.label}</Text>
                    <Text style={[s.flowCell, s.flowPaymentDue]}>{step.dueDateLabel}</Text>
                    <Text style={[s.flowCellBold, s.flowPaymentAmount, s.flowPriceValue]}>{step.amountLabel}</Text>
                  </View>
                ))}
              </View>
              {paymentPlan.finePrint ? <Text style={[s.flowBodyText, { marginTop: 6 }]}>{paymentPlan.finePrint}</Text> : null}
            </>
          ) : (
            <Text style={s.flowBodyText}>
              Jadwal pembayaran mengikuti invoice resmi Sundaf Trip dan konfirmasi administrasi terbaru.
            </Text>
          )}

          <Text style={[s.flowListHead, { marginTop: 12 }]}>Term Pembayaran</Text>
          <View style={s.flowTwoCol}>
            {paymentTermColumns.map((column, colIndex) => (
              <View key={colIndex} style={s.flowCol}>
                {column.map((item, i) => <FlowBullet key={i} text={item} />)}
              </View>
            ))}
          </View>
        </View>

        <View style={s.flowSection}>
          <SectionTitle>Catatan Penting</SectionTitle>
          <Text style={s.flowBodyText}>{notesCopy}</Text>
        </View>

        <View style={s.flowSection}>
          <SectionTitle>Visa & Pendaftaran</SectionTitle>
          <Text style={s.flowBodyText}>
            {visaCopy} <Link src={VISA_URL} style={s.flowLink}>sundaftrip.com/visa</Link>
          </Text>
        </View>

        <View style={s.flowSection}>
          <SectionTitle>Kontak</SectionTitle>
          {company.whatsapp && (
            <Text style={s.flowBodyText}>
              WhatsApp: <Link src={waLink(company.whatsapp)} style={s.flowLink}>{company.whatsapp}</Link>
            </Text>
          )}
          {company.phone && <Text style={s.flowBodyText}>Telepon: {company.phone}</Text>}
          {company.email && <Text style={s.flowBodyText}>Email: {company.email}</Text>}
          {company.website && <Text style={s.flowBodyText}>Website: {company.website}</Text>}
          {!!faqUrl && (
            <Text style={s.flowBodyText}>
              FAQ: <Link src={faqUrl} style={s.flowLink}>{faqDisplay}</Link>
            </Text>
          )}
        </View>

        <View style={s.flowSection}>
          <SectionTitle>Profil Sundaf Trip</SectionTitle>
          <Text style={s.flowBodyText}>{profileText(company)}</Text>
        </View>
      </Page>
    </Document>
  );
}
/* Legacy compact portrait styles are intentionally kept above for reuse in older generated variants. */
