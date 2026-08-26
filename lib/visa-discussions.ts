import "server-only";

import crypto from "node:crypto";
import type {
  Prisma,
  VisaDiscussionReportReason,
  VisaDiscussionStatus,
  VisaDiscussionTopic,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { isVisaDiscussionTurnstileResult } from "@/lib/turnstile-verification";
import type {
  VisaDiscussionPublicState,
  VisaDiscussionReportReasonInput,
  VisaDiscussionThread,
  VisaDiscussionTopicInput,
} from "@/lib/visa-discussion-public";

export const VISA_DISCUSSION_STATUSES = ["PENDING", "PUBLISHED", "REJECTED"] as const;
export type VisaDiscussionStatusInput = (typeof VISA_DISCUSSION_STATUSES)[number];

export function isVisaDiscussionStatus(value: unknown): value is VisaDiscussionStatusInput {
  return typeof value === "string"
    && VISA_DISCUSSION_STATUSES.includes(value as VisaDiscussionStatusInput);
}

export function discussionFingerprint(ip: string) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  return crypto
    .createHmac("sha256", secret)
    .update(`visa-discussion:${ip || "unknown"}`)
    .digest("hex");
}

export function publicWritesConfigured() {
  return process.env.VISA_DISCUSSION_WRITES_ENABLED === "true"
    && Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
    && Boolean(process.env.TURNSTILE_SECRET_KEY)
    && Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
}

export async function visaDiscussionTableAvailable() {
  try {
    const rows = await prisma.$queryRaw<Array<{ available: string | null }>>`
      SELECT to_regclass('"VisaDiscussion"')::text AS available
    `;
    return Boolean(rows[0]?.available);
  } catch {
    return false;
  }
}

export async function loadVisaDiscussionPublicState(
  limit = 40,
): Promise<VisaDiscussionPublicState> {
  const tableAvailable = await visaDiscussionTableAvailable();
  const configured = publicWritesConfigured();

  if (!tableAvailable) {
    return {
      threads: [],
      writesEnabled: false,
      siteKey: "",
      availability: "database_required",
    };
  }

  try {
    const rows = await prisma.visaDiscussion.findMany({
      where: { status: "PUBLISHED", parentId: null },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        parentId: true,
        authorName: true,
        countryName: true,
        topic: true,
        caseContext: true,
        title: true,
        message: true,
        sourceUrl: true,
        isAdminReply: true,
        isLocked: true,
        createdAt: true,
        replies: {
          where: { status: "PUBLISHED" },
          orderBy: [{ publishedAt: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            parentId: true,
            authorName: true,
            countryName: true,
            topic: true,
            caseContext: true,
            title: true,
            message: true,
            sourceUrl: true,
            isAdminReply: true,
            isLocked: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      threads: rows.map((row) => ({
        ...serializeDiscussion(row),
        replies: row.replies.map((reply) => ({
          ...serializeDiscussion(reply),
          replies: [],
        })),
      })),
      writesEnabled: configured,
      siteKey: configured ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY! : "",
      availability: configured ? "ready" : "configuration_required",
    };
  } catch {
    return {
      threads: [],
      writesEnabled: false,
      siteKey: "",
      availability: "database_required",
    };
  }
}

export async function verifyTurnstileToken(token: string, ip: string, expectedHostname: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) return false;

  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: ip,
    idempotency_key: crypto.randomUUID(),
  });

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) return false;
    return isVisaDiscussionTurnstileResult(await response.json(), expectedHostname);
  } catch {
    return false;
  }
}

export async function discussionRateLimit(
  fingerprint: string,
  kind: "question" | "reply",
) {
  const now = Date.now();
  const hourAgo = new Date(now - 60 * 60 * 1000);
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const parentFilter = kind === "question" ? null : { not: null };
  const [hour, day] = await Promise.all([
    prisma.visaDiscussion.count({
      where: { authorFingerprint: fingerprint, parentId: parentFilter, createdAt: { gte: hourAgo } },
    }),
    prisma.visaDiscussion.count({
      where: { authorFingerprint: fingerprint, parentId: parentFilter, createdAt: { gte: dayAgo } },
    }),
  ]);
  const limits = kind === "question"
    ? { hour: 2, day: 5 }
    : { hour: 5, day: 15 };
  return hour < limits.hour && day < limits.day;
}

export async function reportRateLimit(fingerprint: string) {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.visaDiscussionReport.count({
    where: { reporterFingerprint: fingerprint, createdAt: { gte: hourAgo } },
  });
  return count < 3;
}

export async function isDuplicateDiscussion(contentHash: string) {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return Boolean(await prisma.visaDiscussion.findFirst({
    where: { contentHash, createdAt: { gte: dayAgo } },
    select: { id: true },
  }));
}

export function discussionUpdateForStatus(
  status: VisaDiscussionStatus,
  userId: string,
): Prisma.VisaDiscussionUpdateInput {
  if (status === "PUBLISHED") {
    return {
      status,
      reviewedById: userId,
      reviewedAt: new Date(),
      publishedAt: new Date(),
    };
  }
  return {
    status,
    reviewedById: userId,
    reviewedAt: new Date(),
    publishedAt: null,
  };
}

export function asPrismaTopic(topic: VisaDiscussionTopicInput | null) {
  return topic as VisaDiscussionTopic | null;
}

export function asPrismaReportReason(reason: VisaDiscussionReportReasonInput) {
  return reason as VisaDiscussionReportReason;
}

function serializeDiscussion(row: {
  id: string;
  parentId: string | null;
  authorName: string;
  countryName: string | null;
  topic: VisaDiscussionTopic | null;
  caseContext: string | null;
  title: string | null;
  message: string;
  sourceUrl: string | null;
  isAdminReply: boolean;
  isLocked: boolean;
  createdAt: Date;
}): Omit<VisaDiscussionThread, "replies"> {
  return {
    ...row,
    topic: row.topic as VisaDiscussionTopicInput | null,
    createdAt: row.createdAt.toISOString(),
  };
}
