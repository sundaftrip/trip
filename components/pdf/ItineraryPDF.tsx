/* Itinerary PDF document - rendered server-side via @react-pdf/renderer. */
import type { ComponentProps } from "react";
import {
  Document, Page, View, Text, Link, Image, StyleSheet, Font, Svg, Circle, Path, Rect, Line,
} from "@react-pdf/renderer";
import { buildItineraryDisplay, type ItineraryInsight } from "@/lib/itinerary-insights";
import { stripItineraryMarkup } from "@/lib/itinerary-markup";
import type { CommerceTourStatus } from "@/lib/tour-commerce";
import type { TourPaymentPlan } from "@/lib/tour-payment-plan";

const PAPER = "#FFFFFF";
const TEAL = "#FBD324";
const CHARCOAL = "#050505";
const INK = CHARCOAL;
const GOLD = CHARCOAL;
const SUB = CHARCOAL;
const HAIR = "#D9D9D9";
const DASH = "#EEEEEE";
const DASH_STRONG = "#C5C5C5";
const WHITE = "#FFFFFF";
const VISA_URL = "https://sundaftrip.com/visa";
const FONT = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
} as const;
const TYPOGRAPHY = {
  documentTitle: { fontFamily: FONT.bold, fontSize: 29, lineHeight: 1.12 },
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
  "DP mengunci kursi dan nominalnya mengikuti invoice awal.",
  "Pelunasan mengikuti jadwal pembayaran atau invoice terbaru.",
  "Add-on opsional dan layanan yang tidak ditandai wajib dibayar terpisah setelah dikonfirmasi.",
  "Kirim bukti transfer agar pembayaran dapat dicek.",
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
  mandatoryAddOns?: PdfAddOn[];
  inclusivePriceLabel: string;
  inclusivePriceCoretLabel?: string | null;
  landTourLabel?: string | null;
  company: {
    name?: string;
    logo?: string | null;
    logoOnDark?: string | null;
    tagline?: string;
    story?: string[];
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    instagram?: string;
    nib?: string;
  };
  faqUrl?: string;
  paymentPlan?: TourPaymentPlan | null;
  commerceStatus?: CommerceTourStatus;
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
  flowTitleBlock: { marginBottom: 18 },
  flowTitle: {
    ...TYPOGRAPHY.documentTitle,
    color: CHARCOAL,
    backgroundColor: TEAL,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  flowSubtitle: {
    ...TYPOGRAPHY.subtitle,
    color: CHARCOAL,
    marginTop: 9,
  },
  flowSection: { marginTop: 16 },
  flowSectionTitle: {
    ...TYPOGRAPHY.sectionHeading,
    color: CHARCOAL,
    backgroundColor: TEAL,
    paddingVertical: 3.5,
    paddingHorizontal: 7,
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
  },
  flowItineraryRow: {
    borderBottomWidth: 0.85,
    borderBottomColor: DASH_STRONG,
    borderBottomStyle: "dashed",
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
    marginTop: 7,
    paddingTop: 1,
  },
  flowInsightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 4,
  },
  flowInsightIcon: {
    width: 13,
    height: 13,
    marginTop: 0.5,
  },
  flowInsightCopy: {
    flex: 1,
  },
  flowInsightLabel: {
    ...TYPOGRAPHY.itineraryMeta,
    fontFamily: FONT.bold,
    color: CHARCOAL,
    textAlign: "left",
  },
  flowInsightValue: {
    ...TYPOGRAPHY.itineraryMeta,
    color: CHARCOAL,
    marginTop: 0.5,
    textAlign: "left",
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
  galleryLeadRow: {
    flexDirection: "row",
    gap: 10,
    height: 286,
    marginTop: 6,
  },
  galleryLeadImage: {
    width: 333,
    height: 286,
    objectFit: "cover",
    borderWidth: 0.7,
    borderColor: HAIR,
  },
  gallerySideStack: {
    flex: 1,
    gap: 10,
  },
  gallerySideImage: {
    width: "100%",
    height: 138,
    objectFit: "cover",
    borderWidth: 0.7,
    borderColor: HAIR,
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  galleryGridImage: {
    width: 249,
    height: 122,
    objectFit: "cover",
    borderWidth: 0.7,
    borderColor: HAIR,
  },
  galleryNote: {
    ...TYPOGRAPHY.footnote,
    color: SUB,
    marginTop: 12,
    lineHeight: 1.35,
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

const PREMIUM_NAVY = "#132B3A";
const PREMIUM_TEAL = "#075D63";
const PREMIUM_INK = "#13252B";
const PREMIUM_MUTED = "#68767A";
const PREMIUM_GOLD = "#C99A4B";
const PREMIUM_GOLD_LIGHT = "#E9D5AC";
const PREMIUM_PAPER = "#FCFAF6";
const PREMIUM_MIST = "#DFF1F2";
const PREMIUM_LINE = "#D6DAD7";
const PREMIUM_WHITE = "#FFFFFF";

const p = StyleSheet.create({
  coverPage: {
    backgroundColor: PREMIUM_TEAL,
    color: PREMIUM_WHITE,
    fontFamily: FONT.regular,
  },
  coverSizer: {
    height: 842,
  },
  coverHero: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 505,
    objectFit: "cover",
  },
  coverFallback: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 505,
    backgroundColor: "#244952",
  },
  coverFallbackAccentOne: {
    position: "absolute",
    top: 52,
    right: -48,
    width: 310,
    height: 310,
    borderRadius: 155,
    borderWidth: 1,
    borderColor: "#4D7177",
  },
  coverFallbackAccentTwo: {
    position: "absolute",
    top: 122,
    right: 22,
    width: 178,
    height: 178,
    borderRadius: 89,
    backgroundColor: "#315B62",
  },
  coverTint: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 505,
    backgroundColor: PREMIUM_TEAL,
    opacity: 0.33,
  },
  coverBrandBar: {
    position: "absolute",
    top: 31,
    left: 36,
    right: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  coverLogoPlate: {
    width: 110,
    height: 32,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  coverLogo: { width: 108, height: 30, objectFit: "contain" },
  coverBrandFallback: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: PREMIUM_WHITE,
  },
  coverEdition: {
    fontFamily: FONT.bold,
    fontSize: 7.4,
    color: PREMIUM_WHITE,
    letterSpacing: 1.55,
  },
  coverTitlePanel: {
    position: "absolute",
    left: 36,
    right: 36,
    top: 335,
    paddingTop: 18,
    paddingBottom: 21,
    paddingHorizontal: 22,
    backgroundColor: PREMIUM_NAVY,
    borderTopWidth: 3,
    borderTopColor: PREMIUM_GOLD,
  },
  coverKicker: {
    fontFamily: FONT.bold,
    fontSize: 8,
    color: PREMIUM_GOLD_LIGHT,
    letterSpacing: 1.45,
    marginBottom: 9,
  },
  coverTitle: {
    fontFamily: "Times-Bold",
    fontSize: 34,
    lineHeight: 0.98,
    color: PREMIUM_WHITE,
    maxWidth: 470,
  },
  coverRoute: {
    fontFamily: FONT.bold,
    fontSize: 10.5,
    lineHeight: 1.25,
    color: PREMIUM_GOLD_LIGHT,
    marginTop: 12,
  },
  coverBottom: {
    position: "absolute",
    left: 36,
    right: 36,
    top: 584,
  },
  coverMetaRow: {
    flexDirection: "row",
    borderTopWidth: 0.7,
    borderTopColor: "#4B6167",
    borderBottomWidth: 0.7,
    borderBottomColor: "#4B6167",
  },
  coverMetaItem: {
    flex: 1,
    paddingTop: 13,
    paddingBottom: 12,
    paddingRight: 14,
  },
  coverMetaDivider: {
    borderLeftWidth: 0.7,
    borderLeftColor: "#4B6167",
    paddingLeft: 14,
  },
  coverMetaLabel: {
    fontFamily: FONT.bold,
    fontSize: 6.8,
    color: PREMIUM_GOLD_LIGHT,
    letterSpacing: 0.85,
    marginBottom: 4,
  },
  coverMetaValue: {
    fontFamily: FONT.bold,
    fontSize: 9.4,
    color: PREMIUM_WHITE,
    lineHeight: 1.2,
  },
  coverPriceRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  coverPriceLabel: {
    fontFamily: FONT.bold,
    fontSize: 7.3,
    color: PREMIUM_GOLD_LIGHT,
    letterSpacing: 1.1,
  },
  coverPrice: {
    fontFamily: "Times-Bold",
    fontSize: 25,
    color: PREMIUM_WHITE,
    marginTop: 4,
  },
  coverPrepared: {
    fontSize: 8.3,
    color: "#C9D2D3",
    textAlign: "right",
    lineHeight: 1.3,
  },

  contentPage: {
    backgroundColor: PREMIUM_PAPER,
    color: PREMIUM_INK,
    fontFamily: FONT.regular,
    paddingTop: 92,
    paddingBottom: 72,
    paddingHorizontal: 42,
  },
  header: {
    position: "absolute",
    top: 27,
    left: 42,
    right: 42,
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0.65,
    borderBottomColor: PREMIUM_LINE,
    paddingBottom: 9,
  },
  headerLogo: { width: 82, height: 25, objectFit: "contain" },
  headerBrandFallback: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: PREMIUM_NAVY,
  },
  headerSection: {
    fontFamily: FONT.bold,
    fontSize: 6.8,
    color: PREMIUM_MUTED,
    letterSpacing: 1.15,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 42,
    right: 42,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 0.65,
    borderTopColor: PREMIUM_LINE,
    paddingTop: 8,
  },
  footerLinks: { flex: 1, flexDirection: "row", gap: 18 },
  footerLink: {
    fontFamily: FONT.bold,
    fontSize: 6.6,
    color: PREMIUM_NAVY,
    textDecoration: "none",
  },
  pageNumber: {
    position: "absolute",
    bottom: 25,
    right: 42,
    width: 44,
    fontFamily: FONT.bold,
    fontSize: 6.8,
    color: PREMIUM_MUTED,
    textAlign: "right",
  },
  heading: { marginBottom: 16 },
  headingEyebrow: {
    fontFamily: FONT.bold,
    fontSize: 7.2,
    color: PREMIUM_GOLD,
    letterSpacing: 1.4,
    marginBottom: 7,
  },
  headingTitle: {
    fontFamily: "Times-Bold",
    fontSize: 28,
    lineHeight: 1.03,
    color: PREMIUM_NAVY,
  },
  headingIntro: {
    maxWidth: 430,
    fontSize: 9.4,
    lineHeight: 1.45,
    color: PREMIUM_MUTED,
    marginTop: 8,
  },
  goldRule: {
    width: 38,
    height: 2.5,
    backgroundColor: PREMIUM_GOLD,
    marginTop: 12,
  },
  sectionBlock: { marginTop: 20 },
  sectionLabel: {
    fontFamily: FONT.bold,
    fontSize: 7.2,
    color: PREMIUM_GOLD,
    letterSpacing: 1.15,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 18,
    lineHeight: 1.08,
    color: PREMIUM_NAVY,
    marginBottom: 10,
  },
  overviewHeroRow: { flexDirection: "row", gap: 14, alignItems: "stretch" },
  overviewImageWrap: {
    width: "56%",
    height: 184,
    overflow: "hidden",
    backgroundColor: PREMIUM_MIST,
  },
  overviewImage: { width: "100%", height: "100%", objectFit: "cover" },
  overviewImageFallback: {
    flex: 1,
    backgroundColor: "#DDE6E2",
    padding: 24,
    justifyContent: "flex-end",
  },
  overviewFallbackCountry: {
    fontFamily: "Times-Bold",
    fontSize: 26,
    color: PREMIUM_NAVY,
  },
  overviewSide: {
    flex: 1,
    height: 184,
    gap: 8,
  },
  priceCard: {
    padding: 15,
    backgroundColor: PREMIUM_NAVY,
    justifyContent: "center",
  },
  priceCardCompact: { height: 88 },
  priceCardPromo: { height: 118 },
  priceCardSolo: { flex: 1 },
  priceCardLabel: {
    fontFamily: FONT.bold,
    fontSize: 6.9,
    color: PREMIUM_GOLD_LIGHT,
    letterSpacing: 1.15,
  },
  priceCardValue: {
    fontFamily: "Times-Bold",
    fontSize: 22,
    lineHeight: 1.05,
    color: PREMIUM_WHITE,
    marginTop: 7,
  },
  priceCardNormalLabel: { fontSize: 7.4, color: "#BAC5C6", marginTop: 7 },
  priceCardNormal: {
    fontFamily: FONT.bold,
    fontSize: 8.6,
    color: "#D8E0E0",
    textDecoration: "line-through",
  },
  priceCardSaving: {
    fontFamily: FONT.bold,
    fontSize: 7.4,
    color: PREMIUM_GOLD_LIGHT,
    marginTop: 4,
  },
  priceCardRule: { width: 28, height: 1.5, backgroundColor: PREMIUM_GOLD, marginTop: 12 },
  overviewAccentImage: { flex: 1, width: "100%", objectFit: "cover" },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    borderTopWidth: 0.7,
    borderTopColor: PREMIUM_LINE,
    borderLeftWidth: 0.7,
    borderLeftColor: PREMIUM_LINE,
  },
  metaCard: {
    width: "50%",
    minHeight: 52,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRightWidth: 0.7,
    borderRightColor: PREMIUM_LINE,
    borderBottomWidth: 0.7,
    borderBottomColor: PREMIUM_LINE,
  },
  metaCardLabel: {
    fontFamily: FONT.bold,
    fontSize: 6.4,
    color: PREMIUM_GOLD,
    letterSpacing: 0.9,
    marginBottom: 4,
  },
  metaCardValue: {
    fontFamily: FONT.bold,
    fontSize: 9,
    lineHeight: 1.25,
    color: PREMIUM_NAVY,
  },
  breakdown: {
    borderTopWidth: 1,
    borderTopColor: PREMIUM_NAVY,
    borderBottomWidth: 1,
    borderBottomColor: PREMIUM_NAVY,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 0.55,
    borderBottomColor: PREMIUM_LINE,
  },
  breakdownName: { flex: 1, fontSize: 8.5, lineHeight: 1.25, color: PREMIUM_INK },
  breakdownTag: {
    fontFamily: FONT.bold,
    fontSize: 5.8,
    color: PREMIUM_GOLD,
    letterSpacing: 0.65,
    marginLeft: 4,
  },
  breakdownPrice: {
    width: 126,
    fontFamily: FONT.bold,
    fontSize: 8.7,
    textAlign: "right",
    color: PREMIUM_NAVY,
  },
  breakdownTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  breakdownTotalName: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 8.3,
    color: PREMIUM_NAVY,
    letterSpacing: 0.45,
  },
  breakdownTotalPrice: {
    width: 160,
    fontFamily: "Times-Bold",
    fontSize: 15,
    textAlign: "right",
    color: PREMIUM_NAVY,
  },
  quietNote: { fontSize: 7.3, color: PREMIUM_MUTED, lineHeight: 1.42, marginTop: 8 },
  photoStrip: { flexDirection: "row", gap: 6, marginTop: 18 },
  photoStripImage: { flex: 1, height: 82, objectFit: "cover" },

  itineraryList: { borderTopWidth: 0.8, borderTopColor: PREMIUM_NAVY },
  itineraryCard: {
    flexDirection: "row",
    paddingVertical: 13,
    borderBottomWidth: 0.6,
    borderBottomColor: PREMIUM_LINE,
  },
  itineraryDayCol: { width: 58, paddingRight: 11 },
  itineraryDayLabel: {
    fontFamily: FONT.bold,
    fontSize: 6.3,
    color: PREMIUM_GOLD,
    letterSpacing: 0.8,
  },
  itineraryDayNumber: {
    fontFamily: "Times-Bold",
    fontSize: 23,
    color: PREMIUM_NAVY,
    marginTop: 1,
  },
  itineraryBody: {
    flex: 1,
    paddingLeft: 13,
    borderLeftWidth: 2,
    borderLeftColor: PREMIUM_GOLD_LIGHT,
  },
  itineraryTitle: {
    fontFamily: FONT.bold,
    fontSize: 10.3,
    lineHeight: 1.25,
    color: PREMIUM_NAVY,
  },
  itineraryBrief: {
    fontSize: 8.2,
    lineHeight: 1.42,
    color: PREMIUM_MUTED,
    marginTop: 4,
  },
  highlightLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 7,
  },
  highlightLabel: {
    fontFamily: FONT.bold,
    fontSize: 6.2,
    color: PREMIUM_GOLD,
    letterSpacing: 0.65,
    marginRight: 7,
  },
  highlightText: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 7.1,
    lineHeight: 1.25,
    color: PREMIUM_INK,
  },
  insightRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 5, gap: 10 },
  insightItem: { flexDirection: "row", alignItems: "center" },
  insightDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PREMIUM_GOLD,
    marginRight: 4,
  },
  insightText: { fontSize: 6.7, color: PREMIUM_MUTED },

  twoColumn: { flexDirection: "row", gap: 15, alignItems: "flex-start" },
  column: { flex: 1 },
  listCard: {
    backgroundColor: PREMIUM_WHITE,
    borderTopWidth: 2,
    borderTopColor: PREMIUM_GOLD,
    padding: 14,
  },
  listCardMuted: {
    backgroundColor: "#EEF1EF",
    borderTopWidth: 2,
    borderTopColor: PREMIUM_MUTED,
    padding: 14,
  },
  listCardTitle: {
    fontFamily: "Times-Bold",
    fontSize: 14,
    color: PREMIUM_NAVY,
    marginBottom: 10,
  },
  listItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  listMark: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: PREMIUM_NAVY,
    color: PREMIUM_WHITE,
    fontFamily: FONT.bold,
    fontSize: 7,
    textAlign: "center",
    paddingTop: 2,
    marginRight: 7,
  },
  listMarkMuted: { backgroundColor: PREMIUM_MUTED },
  listText: { flex: 1, fontSize: 7.7, color: PREMIUM_INK, lineHeight: 1.35 },
  addOnTable: { borderTopWidth: 0.8, borderTopColor: PREMIUM_NAVY },
  addOnRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.55,
    borderBottomColor: PREMIUM_LINE,
    paddingVertical: 8,
  },
  addOnName: { flex: 1, fontSize: 8.1, lineHeight: 1.25, color: PREMIUM_INK },
  addOnPrice: {
    width: 120,
    fontFamily: FONT.bold,
    fontSize: 8.2,
    textAlign: "right",
    color: PREMIUM_NAVY,
  },
  servicePriceBand: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: PREMIUM_TEAL,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  servicePriceCopy: { flex: 1, paddingRight: 20 },
  servicePriceLabel: {
    fontFamily: FONT.bold,
    fontSize: 6.6,
    color: PREMIUM_GOLD_LIGHT,
    letterSpacing: 0.9,
  },
  servicePriceNote: { fontSize: 7.2, color: "#CFE0E0", marginTop: 4 },
  servicePriceValue: {
    fontFamily: "Times-Bold",
    fontSize: 18,
    color: PREMIUM_WHITE,
    textAlign: "right",
  },
  paymentIntro: { fontSize: 8.2, lineHeight: 1.42, color: PREMIUM_MUTED },
  paymentTotal: {
    fontFamily: "Times-Bold",
    fontSize: 18,
    color: PREMIUM_NAVY,
    marginTop: 7,
  },
  paymentSteps: { flexDirection: "row", gap: 8, marginTop: 12 },
  paymentStep: {
    flex: 1,
    minHeight: 84,
    padding: 11,
    backgroundColor: PREMIUM_WHITE,
    borderTopWidth: 2,
    borderTopColor: PREMIUM_GOLD,
  },
  paymentStepNumber: {
    fontFamily: FONT.bold,
    fontSize: 6.2,
    color: PREMIUM_GOLD,
    letterSpacing: 0.7,
  },
  paymentStepLabel: {
    fontFamily: FONT.bold,
    fontSize: 8.2,
    color: PREMIUM_NAVY,
    marginTop: 5,
    lineHeight: 1.2,
  },
  paymentStepDue: { fontSize: 6.8, color: PREMIUM_MUTED, lineHeight: 1.25, marginTop: 4 },
  paymentStepAmount: {
    fontFamily: "Times-Bold",
    fontSize: 10.4,
    color: PREMIUM_NAVY,
    marginTop: 7,
  },
  termsGrid: { flexDirection: "row", gap: 14, marginTop: 8 },
  termColumn: { flex: 1 },
  termItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  termNumber: {
    width: 16,
    fontFamily: "Times-Bold",
    fontSize: 9,
    color: PREMIUM_GOLD,
  },
  termText: { flex: 1, fontSize: 7.5, lineHeight: 1.34, color: PREMIUM_INK },
  noteCard: {
    backgroundColor: "#E9EFEC",
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: PREMIUM_NAVY,
  },
  noteCardStack: { marginTop: 12 },
  noteCardTitle: {
    fontFamily: FONT.bold,
    fontSize: 7,
    color: PREMIUM_NAVY,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  noteCardText: { fontSize: 7.8, lineHeight: 1.42, color: PREMIUM_INK },
  textLink: { color: PREMIUM_NAVY, fontFamily: FONT.bold, textDecoration: "underline" },

  closingPage: {
    height: 842,
    minHeight: 842,
    backgroundColor: PREMIUM_NAVY,
    color: PREMIUM_WHITE,
    fontFamily: FONT.regular,
    padding: 38,
  },
  closingBrandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  closingLogoPlate: {
    width: 110,
    height: 32,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  closingEdition: {
    fontFamily: FONT.bold,
    fontSize: 6.8,
    color: PREMIUM_GOLD_LIGHT,
    letterSpacing: 1.1,
  },
  closingGallery: { flexDirection: "row", gap: 7, height: 282, marginTop: 30 },
  closingLeadImage: { width: "62%", height: "100%", objectFit: "cover" },
  closingSide: { flex: 1, gap: 7 },
  closingSideImage: { flex: 1, width: "100%", objectFit: "cover" },
  closingGalleryFallback: {
    flex: 1,
    backgroundColor: "#254A52",
    justifyContent: "center",
    alignItems: "center",
  },
  closingFallbackText: {
    fontFamily: "Times-Bold",
    fontSize: 25,
    color: PREMIUM_GOLD_LIGHT,
  },
  closingCopy: { marginTop: 31, width: 440 },
  closingKicker: {
    fontFamily: FONT.bold,
    fontSize: 7.3,
    color: PREMIUM_GOLD_LIGHT,
    letterSpacing: 1.2,
  },
  closingTitle: {
    fontFamily: "Times-Bold",
    fontSize: 31,
    lineHeight: 1.02,
    color: PREMIUM_WHITE,
    marginTop: 8,
  },
  closingText: { fontSize: 9, lineHeight: 1.45, color: "#CAD4D5", marginTop: 10 },
  contactRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 0.7,
    borderTopColor: "#4F666A",
  },
  contactCard: { flex: 1 },
  contactLabel: {
    fontFamily: FONT.bold,
    fontSize: 6.2,
    color: PREMIUM_GOLD_LIGHT,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  contactValue: {
    fontFamily: FONT.bold,
    fontSize: 8,
    lineHeight: 1.25,
    color: PREMIUM_WHITE,
    textDecoration: "none",
  },
  closingProfile: {
    marginTop: 112,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  closingProfileText: { width: 390, fontSize: 6.9, lineHeight: 1.38, color: "#AFC0C2" },
  closingNib: { fontFamily: FONT.bold, fontSize: 6.4, color: PREMIUM_GOLD_LIGHT },
});

function waLink(raw: string) {
  return `https://wa.me/${raw.replace(/\D/g, "")}`;
}

function cleanText(value?: string | null) {
  return value
    ? stripItineraryMarkup(value)
      .replace(/[\u2010-\u2015\u2212]/g, "-")
      .replace(/\s*[\u2192\u2794]\s*/g, " - ")
      .replace(/\bpemandu wisata dan pengemudi\b/gi, "tour leader & driver")
      .replace(/\bpemimpin tur dan pengemudi\b/gi, "tour leader & driver")
      .replace(/\bpemimpin tur\b/gi, "tour leader")
      .replace(/\bpemandu wisata\b/gi, "tour leader")
      .replace(/\bpengemudi\b/gi, "driver")
      .replace(/\bKelayakan\b/g, "Syarat")
      .replace(/\bkelayakan\b/g, "syarat")
      .replace(/\bpre-registration\b/gi, "pendaftaran awal")
      .replace(/\bjadwal settlement\b/gi, "jadwal pelunasan")
      .replace(/\bsettlement\b/gi, "pelunasan")
      .replace(/\bkeadaan kahar\b/gi, "situasi di luar kendali")
      .replace(/\bdriver hotel\b/gi, "akomodasi driver")
      .replace(/\bdeposit supplier non-refundable\b/gi, "deposit vendor yang tidak dapat dikembalikan")
      .replace(/\botoritas taman\b/gi, "pengelola taman")
      .replace(/\bkeadaan aktual\b/gi, "kondisi di lapangan")
      .replace(/\bdikonfirmasi tertulis supplier\b/gi, "dikonfirmasi secara tertulis oleh vendor")
      .replace(/\bquotation final\b/gi, "penawaran final")
      .replace(/\bgroup fare\b/gi, "tarif grup")
      .replace(/\bpark fee\b/gi, "biaya parkir")
      .replace(/\bbatas overtime\b/gi, "batas waktu kerja")
      .replace(/\bHarga final hanya dilepas\b/g, "Harga final ditetapkan")
      .replace(/\bdikonfirmasi tertulis\b/gi, "dikonfirmasi secara tertulis")
      .replace(/\bkonfirmasi tertulis supplier\b/gi, "konfirmasi tertulis dari vendor")
      .replace(
        /Setelah itu berlaku syarat pembatalan final yang diberikan tertulis\./gi,
        "Setelah itu, berlaku syarat pembatalan tertulis.",
      )
      .replace(
        /Tier berdua masih on request sampai biaya hotel dan coach final memenuhi pengaman arus biaya\./gi,
        "Harga kamar untuk dua orang masih menunggu konfirmasi biaya hotel dan coach.",
      )
      .replace(
        /Syarat eTA, bila relevan, harus dikonfirmasi berdasarkan dokumen dan riwayat perjalanan masing-masing peserta\./gi,
        "Syarat eTA bergantung pada dokumen dan riwayat perjalanan setiap peserta.",
      )
      .replace(/([.!?]\s+)syarat\b/g, "$1Syarat")
      .replace(/\s+/g, " ")
      .trim()
    : "";
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

function publicFaqUrl(raw: string | undefined, websiteHref: string) {
  if (!raw) return null;
  if (/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(raw)) {
    return `${websiteHref.replace(/\/+$/, "")}/faq`;
  }
  return raw;
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

  return story || `${name} menyediakan paket tour, private trip, open trip, dan bantuan visa untuk traveler Indonesia.${nib}`;
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

type PdfImageStyle = ComponentProps<typeof Image>["style"];

function PdfImage({
  src,
  style,
}: {
  src: string;
  style: PdfImageStyle;
}) {
  return (
    // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt support; nearby text identifies the PDF gallery context.
    <Image src={src} style={style} />
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
  if (label === "TOTAL WAJIB PER ORANG") {
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

type PremiumInsightKind = Extract<ItineraryInsight["kind"], "meals" | "transport" | "stay">;

function isPremiumInsightKind(kind: ItineraryInsight["kind"]): kind is PremiumInsightKind {
  return kind === "meals" || kind === "transport" || kind === "stay";
}

function FlowInsightIcon({ kind }: { kind: PremiumInsightKind }) {
  return (
    <Svg viewBox="0 0 24 24" style={s.flowInsightIcon}>
      <Circle cx={12} cy={12} r={10.5} fill={TEAL} stroke={CHARCOAL} strokeWidth={0.9} />
      {kind === "meals" && (
        <>
          <Circle cx={10} cy={12} r={3.5} fill="none" stroke={CHARCOAL} strokeWidth={1.3} />
          <Path d="M15 7.5v9" stroke={CHARCOAL} strokeWidth={1.3} strokeLinecap="round" />
          <Path d="M17.2 7.5v9" stroke={CHARCOAL} strokeWidth={1.3} strokeLinecap="round" />
        </>
      )}
      {kind === "transport" && (
        <Path
          d="M6 13.5l12-6-3.2 10-3-3-3.8 2 1.5-3.2L6 13.5z"
          fill="none"
          stroke={CHARCOAL}
          strokeWidth={1.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {kind === "stay" && (
        <>
          <Rect x={6.2} y={10.4} width={11.6} height={5.4} rx={1.1} fill="none" stroke={CHARCOAL} strokeWidth={1.3} />
          <Line x1={6.2} y1={13.2} x2={17.8} y2={13.2} stroke={CHARCOAL} strokeWidth={1.15} />
          <Line x1={7.2} y1={15.8} x2={7.2} y2={17.2} stroke={CHARCOAL} strokeWidth={1.15} strokeLinecap="round" />
          <Line x1={16.8} y1={15.8} x2={16.8} y2={17.2} stroke={CHARCOAL} strokeWidth={1.15} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

function FlowInsightGrid({ insights }: { insights: ItineraryInsight[] }) {
  if (insights.length === 0) return null;

  return (
    <View style={s.flowInsightGrid}>
      {insights.map((insight) => {
        const display = pdfInsightDisplay(insight);

        return (
          <View key={`${insight.kind}-${insight.value}`} style={s.flowInsightItem}>
            {isPremiumInsightKind(insight.kind) && <FlowInsightIcon kind={insight.kind} />}
            <View style={s.flowInsightCopy}>
              <Text style={s.flowInsightLabel}>{display.label}</Text>
              <Text style={s.flowInsightValue}>
                {display.value}
              </Text>
            </View>
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
    .replace(/\bPrivate coach\b/gi, "Bus privat")
    .replace(/\bfare grup\b/gi, "tarif grup")
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
    .replace(/\bPrivate coach\b/gi, "Bus privat")
    .replace(/\bfare grup\b/gi, "tarif grup")
    .replace(/\bFlights?\b/gi, "Penerbangan")
    .replace(/\bIncluding baggage\b/gi, "Termasuk bagasi")
    .replace(/\bBreakfast at (?:the )?hotel\b/gi, "Sarapan di hotel")
    .replace(/\bBreakfasts?\b/gi, "Sarapan")
    .replace(/\bLunches?\b/gi, "Makan siang")
    .replace(/\bDinners?\b/gi, "Makan malam")
    .replace(/\bMeals outside the program\b/gi, "Makan di luar program")
    .replace(/\bMeals?\b/gi, "Makan")
    .replace(/\bTransportasi\b\s*:?\s*/gi, "")
    .replace(/^tour leader\b/i, "Tour leader")
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

 export function ItineraryPDFLegacy({
  tour,
  priceLabel,
  priceCoretLabel,
  mandatoryAddOns = [],
  inclusivePriceLabel,
  inclusivePriceCoretLabel,
  landTourLabel,
  company,
  faqUrl,
  paymentPlan,
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
    ["TOTAL WAJIB PER ORANG", inclusivePriceLabel],
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
  const galleryImages = uniquePdfGalleryImages(tour.gallery).slice(0, 7);
  const leadGalleryImage = galleryImages[0];
  const sideGalleryImages = galleryImages.slice(1, 3);
  const gridGalleryImages = galleryImages.slice(3, 7);

  return (
    <Document title={`Rencana Perjalanan ${tour.title}`} author={company.name || "Sundaf Trip"}>
      <Page size="A4" style={s.flowPage} wrap>
        <FixedChrome company={company} runningTitle={runningTitle} />

        <View style={s.flowTitleBlock}>
          <Text style={s.flowTitle}>{runningTitle}</Text>
          <Text style={s.flowSubtitle}>{subtitleParts.join(" - ")}</Text>
        </View>

        <View style={s.flowSection}>
          <SectionTitle>Ringkasan Perjalanan</SectionTitle>
          <View style={s.flowTable}>
            {infoRows.map(([label, value]) => (
              <View key={label} style={s.flowTableRow}>
                <Text style={[s.flowCellBold, s.flowSummaryLabel, s.flowInfoLabel]}>{label}</Text>
                <FlowSummaryValue
                  label={label}
                  value={value}
                  priceCoretLabel={inclusivePriceCoretLabel}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={s.flowSection}>
          <SectionTitle>Rincian Harga Wajib</SectionTitle>
          <View style={s.flowTable}>
            <View style={s.flowTableRow}>
              <Text style={[s.flowCellBold, s.flowSummaryLabel, s.flowInfoLabel]}>PAKET DASAR</Text>
              <FlowPriceSummary priceLabel={priceLabel} priceCoretLabel={priceCoretLabel} />
            </View>
            {mandatoryAddOns.map((item, index) => (
              <View key={`${item.name}-${index}`} style={s.flowTableRow}>
                <Text style={[s.flowCell, s.flowAddOnName]}>
                  {item.name} (wajib)
                </Text>
                <Text style={[s.flowCellBold, s.flowAddOnPrice]}>{item.priceLabel}</Text>
              </View>
            ))}
            <View style={s.flowTableRow}>
              <Text style={[s.flowCellBold, s.flowSummaryLabel, s.flowInfoLabel]}>
                TOTAL WAJIB PER ORANG
              </Text>
              <FlowPriceSummary
                priceLabel={inclusivePriceLabel}
                priceCoretLabel={inclusivePriceCoretLabel}
              />
            </View>
          </View>
          <Text style={[s.flowFootnote, { marginTop: 7 }]}>
            Total wajib mencakup paket dasar dan seluruh add-on wajib. Add-on opsional ditampilkan terpisah.
          </Text>
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
                <View key={`${day.day}-${idx}`} style={[s.flowTableRow, s.flowItineraryRow]} wrap={false}>
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
              Jadwal pembayaran mengikuti invoice resmi dari Sundaf Trip.
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

      {!!leadGalleryImage && (
        <Page size="A4" style={s.flowPage} wrap={false}>
          <FixedChrome company={company} runningTitle={runningTitle} />

          <View style={s.flowTitleBlock}>
            <Text style={s.flowTitle}>Dokumentasi Perjalanan Sundaf</Text>
            <Text style={s.flowSubtitle}>
              Foto dipilih dari galeri paket ini dan dokumentasi perjalanan Sundaf Trip.
            </Text>
          </View>

          <View style={s.galleryLeadRow}>
            <PdfImage src={leadGalleryImage} style={s.galleryLeadImage} />
            <View style={s.gallerySideStack}>
              {sideGalleryImages.map((image, index) => (
                <PdfImage key={`side-${index}`} src={image} style={s.gallerySideImage} />
              ))}
            </View>
          </View>

          {gridGalleryImages.length > 0 && (
            <View style={s.galleryGrid}>
              {gridGalleryImages.map((image, index) => (
                <PdfImage key={`grid-${index}`} src={image} style={s.galleryGridImage} />
              ))}
            </View>
          )}

          <Text style={s.galleryNote}>
            Foto bersifat dokumentasi perjalanan. Susunan aktivitas, cuaca, dan kondisi lapangan mengikuti jadwal final serta arahan operasional setempat.
          </Text>
        </Page>
      )}
    </Document>
  );
}
/* Legacy compact portrait styles are intentionally kept above for reuse in older generated variants. */

function PremiumBrand({
  company,
  cover = false,
}: {
  company: ItineraryPDFProps["company"];
  cover?: boolean;
}) {
  const logo = cover ? company.logoOnDark || company.logo : company.logo;

  if (logo) {
    return (
      // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop; nearby text and document metadata identify the brand.
      <Image src={logo} style={cover ? p.coverLogo : p.headerLogo} />
    );
  }

  return (
    <Text style={cover ? p.coverBrandFallback : p.headerBrandFallback}>
      {company.name || "Sundaf Trip"}
    </Text>
  );
}

function PremiumChrome({
  company,
  section,
}: {
  company: ItineraryPDFProps["company"];
  section: string;
}) {
  const websiteLink = websiteFooterLink(company.website);
  const instagramLink = instagramFooterLink(company.instagram);

  return (
    <>
      <View fixed style={p.header}>
        <PremiumBrand company={company} />
        <Text style={p.headerSection}>{section.toUpperCase()}</Text>
      </View>
      <View fixed style={p.footer}>
        <View style={p.footerLinks}>
          <Link src={websiteLink.href} style={p.footerLink}>{websiteLink.display}</Link>
          <Link src={instagramLink.href} style={p.footerLink}>{instagramLink.display}</Link>
        </View>
      </View>
      <Text
        fixed
        style={p.pageNumber}
        render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => (
          `${pageNumber} / ${totalPages}`
        )}
      />
    </>
  );
}

function PremiumHeading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <View style={p.heading} minPresenceAhead={72}>
      <Text style={p.headingEyebrow}>{eyebrow.toUpperCase()}</Text>
      <Text style={p.headingTitle}>{title}</Text>
      {!!intro && <Text style={p.headingIntro}>{intro}</Text>}
      <View style={p.goldRule} />
    </View>
  );
}

function PremiumSectionHeading({
  label,
  title,
}: {
  label: string;
  title: string;
}) {
  return (
    <View minPresenceAhead={64}>
      <Text style={p.sectionLabel}>{label.toUpperCase()}</Text>
      <Text style={p.sectionTitle}>{title}</Text>
    </View>
  );
}

function PremiumLinkedListText({ text }: { text: string }) {
  const displayText = formatPdfListText(text);
  const parts = linkedTextParts(displayText);
  if (!parts) return <Text style={p.listText}>{displayText}</Text>;

  return (
    <Text style={p.listText}>
      {parts.before}
      <Link src={VISA_URL} style={p.textLink}>{parts.linked}</Link>
      {parts.after}
    </Text>
  );
}

function PremiumListItem({
  text,
  excluded = false,
}: {
  text: string;
  excluded?: boolean;
}) {
  return (
    <View style={p.listItem} wrap={false}>
      <Text style={[p.listMark, excluded ? p.listMarkMuted : {}]}>{excluded ? "-" : "+"}</Text>
      <PremiumLinkedListText text={text} />
    </View>
  );
}

function PremiumPriceBlock({
  priceLabel,
  priceCoretLabel,
}: {
  priceLabel: string;
  priceCoretLabel?: string | null;
}) {
  const normalPrice = splitNormalPriceLabel(priceCoretLabel);

  return (
    <View>
      <Text style={p.priceCardLabel}>TOTAL WAJIB PER ORANG</Text>
      <Text style={p.priceCardValue}>{cleanText(priceLabel)}</Text>
      {!!normalPrice && (
        <>
          <Text style={p.priceCardNormalLabel}>Harga normal</Text>
          <Text style={p.priceCardNormal}>{normalPrice.normalLabel}</Text>
          {!!normalPrice.savingsLabel && (
            <Text style={p.priceCardSaving}>{normalPrice.savingsLabel}</Text>
          )}
        </>
      )}
    </View>
  );
}

function PremiumInsightRow({ insights }: { insights: ItineraryInsight[] }) {
  if (insights.length === 0) return null;

  return (
    <View style={p.insightRow}>
      {insights.slice(0, 4).map((insight) => {
        const display = pdfInsightDisplay(insight);
        return (
          <View key={`${insight.kind}-${insight.value}`} style={p.insightItem}>
            <View style={p.insightDot} />
            <Text style={p.insightText}>{display.label}: {display.value}</Text>
          </View>
        );
      })}
    </View>
  );
}

function chunkItems<T>(items: T[], size: number) {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
}

type PdfItineraryDay = ReturnType<typeof buildItineraryDisplay>;

interface PdfItineraryEntry {
  day: PdfItineraryDay;
  description: string;
  continuation: boolean;
  partIndex: number;
  partCount: number;
}

const ITINERARY_DESCRIPTION_CHUNK_LENGTH = 900;
const ITINERARY_PAGE_HEIGHT_BUDGET = 600;
const LONG_FORM_SEGMENT_LENGTH = 1800;

function fullItineraryDescription(day: PdfItineraryDay) {
  return formatPdfBriefText(day.description);
}

function splitTextAtWords(value: string, maxLength: number) {
  const text = cleanText(value);
  if (!text) return [""];
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let current = "";

  for (const word of text.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLength || !current) {
      current = candidate;
      continue;
    }

    chunks.push(current);
    current = word;
  }

  if (current) chunks.push(current);
  return chunks;
}

function splitBalancedTextAtWords(value: string, maxLength: number) {
  const text = cleanText(value);
  if (!text || text.length <= maxLength) return [text];

  const segmentCount = Math.ceil(text.length / maxLength);
  return splitTextAtWords(text, Math.ceil(text.length / segmentCount));
}

function itineraryEntries(days: PdfItineraryDay[]) {
  return days.flatMap((day) => {
    const descriptions = splitTextAtWords(
      fullItineraryDescription(day),
      ITINERARY_DESCRIPTION_CHUNK_LENGTH,
    );

    return descriptions.map((description, partIndex) => ({
      day,
      description,
      continuation: partIndex > 0,
      partIndex,
      partCount: descriptions.length,
    }));
  });
}

function estimatedLineCount(value: string, averageCharsPerLine: number) {
  const text = cleanText(value);
  return text ? Math.max(1, Math.ceil(text.length / averageCharsPerLine)) : 0;
}

function estimatedItineraryEntryHeight(entry: PdfItineraryEntry) {
  const highlights = destinationHighlightsForDay(entry.day);
  const insightText = entry.day.insights
    .slice(0, 4)
    .map((insight) => {
      const display = pdfInsightDisplay(insight);
      return `${display.label}: ${display.value}`;
    })
    .join("  ");
  const showDetails = entry.partIndex === entry.partCount - 1;
  const title = `${cleanText(entry.day.title)}${entry.continuation ? " (lanjutan)" : ""}`;
  const titleHeight = estimatedLineCount(title, 58) * 13;
  const descriptionHeight = estimatedLineCount(entry.description, 82) * 11.7;
  const highlightHeight = showDetails && highlights.length > 0
    ? 7 + estimatedLineCount(highlights.join(" / "), 76) * 9
    : 0;
  const insightHeight = showDetails && insightText
    ? 5 + estimatedLineCount(insightText, 76) * 9
    : 0;

  return 26 + Math.max(31, titleHeight + (entry.description ? 4 + descriptionHeight : 0)
    + highlightHeight + insightHeight);
}

function paginateItinerary(days: PdfItineraryDay[]) {
  const entries = itineraryEntries(days);
  if (entries.length === 0) return [] as PdfItineraryEntry[][];

  const pages: PdfItineraryEntry[][] = [];
  let page: PdfItineraryEntry[] = [];
  let pageHeight = 0;

  for (const entry of entries) {
    const entryHeight = estimatedItineraryEntryHeight(entry);
    if (page.length > 0 && pageHeight + entryHeight > ITINERARY_PAGE_HEIGHT_BUDGET) {
      pages.push(page);
      page = [];
      pageHeight = 0;
    }

    page.push(entry);
    pageHeight += entryHeight;
  }

  if (page.length > 0) pages.push(page);
  return pages;
}

function itineraryPageRange(entries: PdfItineraryEntry[]) {
  const firstDay = entries[0]?.day.day;
  const lastDay = entries[entries.length - 1]?.day.day;
  if (firstDay === undefined || lastDay === undefined) return "";
  return firstDay === lastDay ? `Hari ${firstDay}, lanjutan.` : `Hari ${firstDay} sampai ${lastDay}.`;
}

function closingCallToAction(status: CommerceTourStatus) {
  if (status === "sold_out" || status === "waitlist") {
    return {
      title: "Daftar tunggu untuk keberangkatan ini.",
      body: "Hubungi tim Sundaf Trip untuk mencatat nama dan jumlah peserta. Tim kami akan mengabari bila kursi tersedia kembali.",
    };
  }

  if (status === "completed") {
    return {
      title: "Rencanakan perjalanan berikutnya.",
      body: "Perjalanan ini telah selesai. Hubungi tim Sundaf Trip untuk konsultasi rute dan jadwal keberangkatan berikutnya.",
    };
  }

  return {
    title: "Konfirmasi kursi. Minta invoice resmi.",
    body: "Hubungi tim Sundaf Trip untuk memeriksa ketersediaan dan menerima detail pembayaran sesuai paket ini.",
  };
}

export function ItineraryPDF({
  tour,
  priceLabel,
  priceCoretLabel,
  mandatoryAddOns = [],
  inclusivePriceLabel,
  inclusivePriceCoretLabel,
  landTourLabel,
  company,
  faqUrl,
  paymentPlan,
  commerceStatus = "available",
}: ItineraryPDFProps) {
  const companyName = cleanText(company.name) || "Sundaf Trip";
  const dateLabel = cleanText(tour.tripDateLabel) || "Tanggal mengikuti jadwal";
  const durationLabel = cleanText(tour.duration) || `${tour.itinerary.length} hari`;
  const destinationLabel = cleanText(tour.cityHighlight) || cleanText(tour.country);
  const routeLabel = destinationLabel || cleanText(tour.title);
  const displayItinerary = tour.itinerary.map(buildItineraryDisplay);
  const itineraryPages = paginateItinerary(displayItinerary);
  const hasItinerary = itineraryPages.length > 0;
  const serviceSectionNumber = hasItinerary ? "03" : "02";
  const reservationSectionNumber = hasItinerary ? "04" : "03";
  const notesCopy = cleanText(tour.notes)
    || "Harga dan jadwal dapat berubah mengikuti kondisi operasional di lapangan.";
  const visaCopy = cleanText(tour.visaInfo)
    || "Bantuan visa tersedia melalui Sundaf Trip. Hubungi tim kami untuk memeriksa dokumen yang diperlukan.";
  const noteSegments = splitBalancedTextAtWords(notesCopy, LONG_FORM_SEGMENT_LENGTH);
  const visaSegments = splitBalancedTextAtWords(visaCopy, LONG_FORM_SEGMENT_LENGTH);
  const galleryImages = uniquePdfGalleryImages(tour.gallery).slice(0, 7);
  const coverImage = cleanText(tour.heroImg) || galleryImages[0] || null;
  const overviewImage = galleryImages.find((image) => image !== coverImage) || coverImage;
  const overviewAccentImage = galleryImages.find(
    (image) => image !== coverImage && image !== overviewImage,
  ) || null;
  const closingLead = galleryImages[1] || galleryImages[0] || coverImage;
  const closingSide = [galleryImages[3], galleryImages[4]].filter(Boolean) as string[];
  const normalPrice = splitNormalPriceLabel(inclusivePriceCoretLabel);
  const paymentTermColumns = chunkItems(PAYMENT_TERMS, Math.ceil(PAYMENT_TERMS.length / 2));
  const paymentStepRows = chunkItems(paymentPlan?.steps ?? [], 3);
  const websiteLink = websiteFooterLink(company.website);
  const faqLink = publicFaqUrl(faqUrl, websiteLink.href);
  const contacts = [
    company.whatsapp ? {
      label: "WHATSAPP",
      value: cleanText(company.whatsapp),
      href: waLink(company.whatsapp),
    } : null,
    company.phone ? {
      label: "TELEPON",
      value: cleanText(company.phone),
      href: `tel:${company.phone.replace(/\s+/g, "")}`,
    } : null,
    company.email ? {
      label: "EMAIL",
      value: cleanText(company.email),
      href: `mailto:${company.email}`,
    } : null,
    {
      label: "WEBSITE",
      value: websiteLink.display,
      href: websiteLink.href,
    },
  ].filter(Boolean) as Array<{ label: string; value: string; href: string }>;
  const summaryMeta = [
    ["DURASI", durationLabel],
    ["KEBERANGKATAN", dateLabel],
    ["DESTINASI", routeLabel],
    tour.seatsLeft > 0 ? ["KETERSEDIAAN", `${tour.seatsLeft} kursi tersisa`] : null,
    landTourLabel ? ["LAND TOUR", cleanText(landTourLabel)] : null,
  ].filter(Boolean) as [string, string][];
  const overviewIntro = `${durationLabel} untuk rute ${routeLabel}. Keberangkatan ${dateLabel}.`;
  const closingProfile = shortenAtWord(profileText(company), 260);
  const closingCta = closingCallToAction(commerceStatus);
  return (
    <Document
      title={`Katalog Perjalanan ${cleanText(tour.title)}`}
      author={companyName}
      subject={`${routeLabel} - ${dateLabel}`}
    >
      <Page size="A4" style={p.coverPage} wrap={false}>
        <View style={p.coverSizer} />
        {coverImage ? (
          <PdfImage src={coverImage} style={p.coverHero} />
        ) : (
          <View style={p.coverFallback}>
            <View style={p.coverFallbackAccentOne} />
            <View style={p.coverFallbackAccentTwo} />
          </View>
        )}
        <View style={p.coverTint} />

        <View style={p.coverBrandBar}>
          <View style={p.coverLogoPlate}>
            <PremiumBrand company={company} cover />
          </View>
          <Text style={p.coverEdition}>KATALOG PERJALANAN</Text>
        </View>

        <View style={p.coverTitlePanel}>
          <Text style={p.coverKicker}>{cleanText(tour.country).toUpperCase()}</Text>
          <Text style={p.coverTitle}>{cleanText(tour.title)}</Text>
          <Text style={p.coverRoute}>{routeLabel}</Text>
        </View>

        <View style={p.coverBottom}>
          <View style={p.coverMetaRow}>
            {[
              ["DURASI", durationLabel],
              ["KEBERANGKATAN", dateLabel],
              ["DESTINASI", routeLabel],
            ].map(([label, value], index) => (
              <View key={label} style={[p.coverMetaItem, index > 0 ? p.coverMetaDivider : {}]}>
                <Text style={p.coverMetaLabel}>{label}</Text>
                <Text style={p.coverMetaValue}>{value}</Text>
              </View>
            ))}
          </View>
          <View style={p.coverPriceRow}>
            <View>
              <Text style={p.coverPriceLabel}>TOTAL WAJIB PER ORANG</Text>
              <Text style={p.coverPrice}>{cleanText(inclusivePriceLabel)}</Text>
            </View>
            <Text style={p.coverPrepared}>Disiapkan oleh{`\n`}{companyName}</Text>
          </View>
        </View>
      </Page>

      <Page size="A4" style={p.contentPage} wrap>
        <PremiumChrome company={company} section="Ringkasan Paket" />
        <PremiumHeading
          eyebrow="01 / Paket"
          title="Ringkasan Paket"
          intro={overviewIntro}
        />

        <View style={p.overviewHeroRow} wrap={false}>
          <View style={p.overviewImageWrap}>
            {overviewImage ? (
              <PdfImage src={overviewImage} style={p.overviewImage} />
            ) : (
              <View style={p.overviewImageFallback}>
                <Text style={p.overviewFallbackCountry}>{routeLabel}</Text>
              </View>
            )}
          </View>
          <View style={p.overviewSide}>
            <View
              style={overviewAccentImage
                ? [p.priceCard, normalPrice ? p.priceCardPromo : p.priceCardCompact]
                : [p.priceCard, p.priceCardSolo]}
            >
              <PremiumPriceBlock
                priceLabel={inclusivePriceLabel}
                priceCoretLabel={inclusivePriceCoretLabel}
              />
              <View style={p.priceCardRule} />
            </View>
            {!!overviewAccentImage && (
              <PdfImage src={overviewAccentImage} style={p.overviewAccentImage} />
            )}
          </View>
        </View>

        <View style={p.metaGrid}>
          {summaryMeta.map(([label, value]) => (
            <View key={label} style={p.metaCard} wrap={false}>
              <Text style={p.metaCardLabel}>{label}</Text>
              <Text style={p.metaCardValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={p.sectionBlock}>
          <PremiumSectionHeading label="Harga" title="Rincian Harga Wajib" />
          <View style={p.breakdown}>
            <View style={p.breakdownRow} wrap={false}>
              <Text style={p.breakdownName}>Paket dasar</Text>
              <Text style={p.breakdownPrice}>{cleanText(priceLabel)}</Text>
            </View>
            {mandatoryAddOns.map((item, index) => (
              <View key={`${item.name}-${index}`} style={p.breakdownRow} wrap={false}>
                <Text style={p.breakdownName}>
                  {cleanText(item.name)} <Text style={p.breakdownTag}>WAJIB</Text>
                </Text>
                <Text style={p.breakdownPrice}>{cleanText(item.priceLabel)}</Text>
              </View>
            ))}
          </View>
          {!!priceCoretLabel && (
            <Text style={p.quietNote}>Harga paket dasar: {cleanText(priceLabel)}. {cleanText(priceCoretLabel)}.</Text>
          )}
          {!!normalPrice && (
            <Text style={p.quietNote}>
              Harga normal total: {normalPrice.normalLabel}{normalPrice.savingsLabel ? `. ${normalPrice.savingsLabel}.` : "."}
            </Text>
          )}
        </View>
      </Page>

      {itineraryPages.map((pageEntries, pageIndex) => (
        <Page key={`itinerary-page-${pageIndex}`} size="A4" style={p.contentPage} wrap>
          <PremiumChrome company={company} section="Rencana Perjalanan" />
          <PremiumHeading
            eyebrow="02 / Itinerary"
            title={pageIndex === 0 ? "Rencana Perjalanan" : "Lanjutan Rencana Perjalanan"}
            intro={pageIndex === 0
              ? `Rute untuk ${displayItinerary.length} hari perjalanan.`
              : itineraryPageRange(pageEntries)}
          />

          <View style={p.itineraryList}>
            {pageEntries.map((entry) => {
              const highlights = destinationHighlightsForDay(entry.day);
              const showDetails = entry.partIndex === entry.partCount - 1;
              const title = `${cleanText(entry.day.title)}${entry.continuation ? " (lanjutan)" : ""}`;

              return (
                <View
                  key={`${entry.day.day}-${entry.partIndex}`}
                  style={p.itineraryCard}
                  wrap={false}
                >
                  <View style={p.itineraryDayCol}>
                    <Text style={p.itineraryDayLabel}>{entry.continuation ? "LANJUTAN" : "HARI"}</Text>
                    <Text style={p.itineraryDayNumber}>{entry.day.day}</Text>
                  </View>
                  <View style={p.itineraryBody}>
                    <Text style={p.itineraryTitle}>{title}</Text>
                    {!!entry.description && <Text style={p.itineraryBrief}>{entry.description}</Text>}
                    {showDetails && highlights.length > 0 && (
                      <View style={p.highlightLine}>
                        <Text style={p.highlightLabel}>SOROTAN</Text>
                        <Text style={p.highlightText}>{highlights.join("  /  ")}</Text>
                      </View>
                    )}
                    {showDetails && <PremiumInsightRow insights={entry.day.insights} />}
                  </View>
                </View>
              );
            })}
          </View>
          {pageIndex === itineraryPages.length - 1 && (
            <Text style={p.quietNote}>
              Detail aktivitas dapat berubah mengikuti cuaca dan kebutuhan operasional di lapangan.
            </Text>
          )}
        </Page>
      ))}

      <Page size="A4" style={p.contentPage} wrap>
        <PremiumChrome company={company} section="Layanan Paket" />
        <PremiumHeading
          eyebrow={`${serviceSectionNumber} / Detail`}
          title="Layanan Paket"
          intro="Periksa apa yang sudah termasuk, biaya di luar paket, dan add-on opsional sebelum meminta invoice."
        />

        {(tour.inclusions.length > 0 || tour.exclusions.length > 0) && (
          <View style={p.twoColumn}>
            <View style={[p.column, p.listCard]}>
              <Text style={p.listCardTitle}>Sudah Termasuk</Text>
              {tour.inclusions.map((item, index) => (
                <PremiumListItem key={`${item}-${index}`} text={item} />
              ))}
            </View>
            <View style={[p.column, p.listCardMuted]}>
              <Text style={p.listCardTitle}>Belum Termasuk</Text>
              {tour.exclusions.map((item, index) => (
                <PremiumListItem key={`${item}-${index}`} text={item} excluded />
              ))}
            </View>
          </View>
        )}

        {(tour.addOns ?? []).length > 0 && (
          <View style={p.sectionBlock}>
            <PremiumSectionHeading label="Pilihan" title="Add-on Opsional" />
            <View style={p.addOnTable}>
              {(tour.addOns ?? []).map((item, index) => (
                <View key={`${item.name}-${index}`} style={p.addOnRow} wrap={false}>
                  <Text style={p.addOnName}>
                    {cleanText(item.name)}{item.tag === "recommended" ? "  /  rekomendasi" : ""}
                  </Text>
                  <Text style={p.addOnPrice}>{cleanText(item.priceLabel)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={p.servicePriceBand} wrap={false}>
          <View style={p.servicePriceCopy}>
            <Text style={p.servicePriceLabel}>TOTAL WAJIB PER ORANG</Text>
            <Text style={p.servicePriceNote}>Paket dasar dan seluruh add-on wajib yang tercantum.</Text>
          </View>
          <Text style={p.servicePriceValue}>{cleanText(inclusivePriceLabel)}</Text>
        </View>
      </Page>

      <Page size="A4" style={p.contentPage} wrap>
        <PremiumChrome company={company} section="Pembayaran dan Catatan" />
        <PremiumHeading
          eyebrow={`${reservationSectionNumber} / Reservasi`}
          title="Pembayaran dan Catatan"
          intro="Jadwal pembayaran mengikuti invoice resmi. Baca catatan paket sebelum konfirmasi kursi."
        />

        <View style={p.sectionBlock}>
          <PremiumSectionHeading label="Pembayaran" title="Jadwal Pembayaran" />
          {!!paymentPlan && paymentPlan.steps.length > 0 ? (
            <>
              <Text style={p.paymentIntro}>{cleanText(paymentPlan.intro)}</Text>
              <Text style={p.paymentIntro}>{cleanText(paymentPlan.paymentMethodsLabel)}</Text>
              <Text style={p.paymentTotal}>{cleanText(paymentPlan.totalLabel)} / orang</Text>
              {paymentStepRows.map((row, rowIndex) => (
                <View key={`payment-row-${rowIndex}`} style={p.paymentSteps} wrap={false}>
                  {row.map((step, stepIndex) => (
                    <View key={step.label} style={p.paymentStep}>
                      <Text style={p.paymentStepNumber}>TAHAP {rowIndex * 3 + stepIndex + 1}</Text>
                      <Text style={p.paymentStepLabel}>{cleanText(step.label)}</Text>
                      <Text style={p.paymentStepDue}>{cleanText(step.dueDateLabel)}</Text>
                      <Text style={p.paymentStepAmount}>{cleanText(step.amountLabel)}</Text>
                    </View>
                  ))}
                </View>
              ))}
              {!!paymentPlan.finePrint && (
                <Text style={p.quietNote}>{cleanText(paymentPlan.finePrint)}</Text>
              )}
            </>
          ) : (
            <Text style={p.paymentIntro}>
              Jadwal pembayaran mengikuti invoice resmi dari Sundaf Trip.
            </Text>
          )}
        </View>

        <View style={p.sectionBlock}>
          <PremiumSectionHeading label="Ketentuan" title="Ketentuan Pembayaran" />
          <View style={p.termsGrid}>
            {paymentTermColumns.map((column, columnIndex) => (
              <View key={`term-column-${columnIndex}`} style={p.termColumn}>
                {column.map((item, itemIndex) => (
                  <View key={item} style={p.termItem} wrap={false}>
                    <Text style={p.termNumber}>{columnIndex * column.length + itemIndex + 1}</Text>
                    <Text style={p.termText}>{cleanText(item)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        <View style={p.sectionBlock}>
          {noteSegments.map((segment, index) => (
            <View
              key={`note-segment-${index}`}
              style={index > 0 ? p.noteCardStack : {}}
              wrap={false}
            >
              {index === 0 ? (
                <PremiumSectionHeading label="Catatan" title="Catatan Penting" />
              ) : (
                <Text style={p.noteCardTitle}>CATATAN PENTING, LANJUTAN</Text>
              )}
              <View style={p.noteCard}>
                <Text style={p.noteCardText}>{segment}</Text>
              </View>
            </View>
          ))}

          {visaSegments.map((segment, index) => {
            const isFinalSegment = index === visaSegments.length - 1;
            return (
              <View
                key={`visa-segment-${index}`}
                style={p.noteCardStack}
                wrap={false}
              >
                {index === 0 ? (
                  <PremiumSectionHeading label="Dokumen" title="Visa dan Pendaftaran" />
                ) : (
                  <Text style={p.noteCardTitle}>VISA DAN PENDAFTARAN, LANJUTAN</Text>
                )}
                <View style={p.noteCard}>
                  <Text style={p.noteCardText}>
                    {segment}
                    {isFinalSegment && (
                      <>
                        {" "}
                        <Link src={VISA_URL} style={p.textLink}>sundaftrip.com/visa</Link>
                        {!!faqLink && (
                          <>
                            {"  FAQ: "}
                            <Link src={faqLink} style={p.textLink}>{faqLink.replace(/^https?:\/\//, "")}</Link>
                          </>
                        )}
                      </>
                    )}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Page>

      <Page size="A4" style={p.closingPage} wrap={false}>
        <View style={p.closingBrandRow}>
          <View style={p.closingLogoPlate}>
            <PremiumBrand company={company} cover />
          </View>
          <Text style={p.closingEdition}>{cleanText(tour.title).toUpperCase()}</Text>
        </View>

        <View style={p.closingGallery}>
          {closingLead ? (
            <PdfImage src={closingLead} style={p.closingLeadImage} />
          ) : (
            <View style={p.closingGalleryFallback}>
              <Text style={p.closingFallbackText}>{routeLabel}</Text>
            </View>
          )}
          {closingLead && (
            <View style={p.closingSide}>
              {closingSide.length > 0 ? closingSide.map((image, index) => (
                <PdfImage key={`${image}-${index}`} src={image} style={p.closingSideImage} />
              )) : (
                <View style={p.closingGalleryFallback}>
                  <Text style={p.closingFallbackText}>{cleanText(tour.country)}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={p.closingCopy}>
          <Text style={p.closingKicker}>LANGKAH BERIKUTNYA</Text>
          <Text style={p.closingTitle}>{closingCta.title}</Text>
          <Text style={p.closingText}>{closingCta.body}</Text>
        </View>

        <View style={p.contactRow}>
          {contacts.map((contact) => (
            <View key={contact.label} style={p.contactCard}>
              <Text style={p.contactLabel}>{contact.label}</Text>
              <Link src={contact.href} style={p.contactValue}>{contact.value}</Link>
            </View>
          ))}
        </View>

        <View style={p.closingProfile}>
          <Text style={p.closingProfileText}>{closingProfile}</Text>
          {!!company.nib && <Text style={p.closingNib}>NIB {cleanText(company.nib)}</Text>}
        </View>
      </Page>
    </Document>
  );
}
