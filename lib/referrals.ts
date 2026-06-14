import { randomBytes } from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const REFERRAL_COOKIE = "sundaf_ref";

export const REFERRAL_EVENT_TYPES = [
  "referral_page_view",
  "referral_code_detected",
  "claim_discount_clicked",
  "continue_without_code_clicked",
  "whatsapp_redirect_clicked",
  "lead_created",
  "lead_status_updated",
  "booking_status_updated",
  "payment_status_updated",
  "commission_status_updated",
  "dispute_created",
] as const;

export type ReferralEventType = (typeof REFERRAL_EVENT_TYPES)[number];

export const PARTNER_TYPE_LABEL: Record<string, string> = {
  INFLUENCER: "Influencer",
  TRAVEL_AGENT: "Travel Agent",
  COMMUNITY: "Community",
  TOUR_LEADER: "Tour Leader",
  VENDOR: "Vendor",
  CAMPUS: "Campus",
  CORPORATE: "Corporate",
  OFFLINE_SALES: "Offline Sales",
};

export const LEAD_STATUS_LABEL: Record<string, string> = {
  NEW_LEAD: "New Lead",
  VALID_LEAD: "Valid Lead",
  FOLLOW_UP: "Follow Up",
  BOOKED: "Booked",
  DP_PAID: "DP Paid",
  FULLY_PAID: "Fully Paid",
  CANCELLED: "Cancelled",
};

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  NOT_BOOKED: "Not Booked",
  BOOKED: "Booked",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  UNPAID: "Unpaid",
  DP_PAID: "DP Paid",
  FULLY_PAID: "Fully Paid",
  REFUNDED: "Refunded",
};

export const COMMISSION_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  PAID: "Paid",
  REJECTED: "Rejected",
};

export const DISPUTE_STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  REVIEWING: "Reviewing",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export const COMMISSION_TYPE_LABEL: Record<string, string> = {
  FIXED: "Nominal tetap",
  PERCENTAGE: "Persentase",
  LEAD_FEE: "Lead fee",
};

const RESERVED_ROOT_SLUGS = new Set([
  "admin",
  "api",
  "about",
  "blog",
  "b2b",
  "company-profile",
  "destinations",
  "faq",
  "jasa-urus-visa-amerika-canada",
  "jasa-urus-visa-eropa",
  "jasa-urus-visa-terpercaya",
  "lapor",
  "llms.txt",
  "llms-full.txt",
  "open-trip-aurora-rusia",
  "open-trip-rusia-dari-jakarta",
  "open-trip-vietnam",
  "partner",
  "search",
  "sundaf-trip",
  "terms",
  "tour-rusia-dari-indonesia",
  "tours",
  "visa",
  "visa-rusia-wni",
  "vietnam",
]);

export function getPublicBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export function buildReferralLink(slug: string) {
  return `${getPublicBaseUrl()}/${slug}`;
}

export function buildDashboardLink(slug: string, token: string) {
  return `${getPublicBaseUrl()}/partner/${slug}?token=${encodeURIComponent(token)}`;
}

export function normalizeReferralCode(input: string) {
  return input
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9_-]/g, "");
}

export function normalizeReferralSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function assertSafeReferralSlug(slug: string) {
  if (!slug || slug.length < 2) return "Slug minimal 2 karakter.";
  if (RESERVED_ROOT_SLUGS.has(slug)) return "Slug ini bentrok dengan halaman website.";
  return "";
}

export function createDashboardToken() {
  return randomBytes(24).toString("hex");
}

export function normalizeWhatsAppNumber(raw?: string | null) {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function generateWhatsAppUrl(phone: string, message: string) {
  const wa = normalizeWhatsAppNumber(phone);
  return wa ? `https://wa.me/${wa}?text=${encodeURIComponent(message)}` : "";
}

export function claimDiscountMessage(input: {
  packageName: string;
  discountLabel: string;
  referralCode: string;
  partnerName: string;
}) {
  return [
    `Halo Sundaf Trip, saya tertarik dengan ${input.packageName}.`,
    `Saya ingin klaim ${input.discountLabel}.`,
    `Kode referral: ${input.referralCode}.`,
    `Partner: ${input.partnerName}.`,
  ].join("\n");
}

export function withoutCodeMessage(packageName: string) {
  return [
    `Halo Sundaf Trip, saya tertarik dengan ${packageName}.`,
    "Saya belum punya kode referral.",
  ].join("\n");
}

export function maskWhatsApp(raw?: string | null) {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length <= 5) return `${digits.slice(0, 2)}***`;
  return `${digits.slice(0, 4)}***${digits.slice(-2)}`;
}

export function customerAlias(name: string | null | undefined, fallback: string) {
  const cleaned = (name ?? "").trim();
  if (!cleaned) return `Customer #${fallback.slice(-4).toUpperCase()}`;
  const first = cleaned.split(/\s+/)[0] ?? "Customer";
  return `${first[0]?.toUpperCase() ?? "C"}***`;
}

export function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(value >= 10 ? 0 : 1)}%`;
}

export async function getConfiguredWhatsAppNumber() {
  if (process.env.SUNDAF_WHATSAPP_NUMBER) return process.env.SUNDAF_WHATSAPP_NUMBER;
  const row = await prisma.companyInfo.findUnique({ where: { key: "company_whatsapp" } }).catch(() => null);
  return row?.value ?? "";
}

export async function logReferralEvent(input: {
  eventType: ReferralEventType | string;
  eventLabel?: string;
  partnerId?: string | null;
  campaignId?: string | null;
  leadId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.referralActivityLog.create({
      data: {
        eventType: input.eventType,
        eventLabel: input.eventLabel,
        partnerId: input.partnerId || null,
        campaignId: input.campaignId || null,
        leadId: input.leadId || null,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch {
    // Referral logging should never block the visitor or admin workflow.
  }
}
