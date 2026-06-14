import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { logReferralEvent, REFERRAL_EVENT_TYPES } from "@/lib/referrals";

const EVENT_SET = new Set<string>(REFERRAL_EVENT_TYPES);

const str = (value: unknown, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function safeMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "string") out[key.slice(0, 80)] = raw.slice(0, 500);
    else if (typeof raw === "number" || typeof raw === "boolean" || raw === null) out[key.slice(0, 80)] = raw;
  }
  return out;
}

export async function POST(req: NextRequest) {
  if (!rateLimit(`referral-event:${clientIp(req)}`, 40, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak event." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const eventType = str(body.eventType, 80);
  if (!EVENT_SET.has(eventType)) {
    return NextResponse.json({ error: "Event tidak valid." }, { status: 422 });
  }

  let partnerId = str(body.partnerId, 120) || null;
  let campaignId = str(body.campaignId, 120) || null;
  const leadId = str(body.leadId, 120) || null;
  const referralCode = str(body.referralCode, 80).toUpperCase();

  if ((!partnerId || !campaignId) && referralCode) {
    const partner = await prisma.referralPartner.findUnique({
      where: { referralCode },
      include: {
        campaigns: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    partnerId = partnerId ?? partner?.id ?? null;
    campaignId = campaignId ?? partner?.campaigns[0]?.id ?? null;
  }

  await logReferralEvent({
    eventType,
    eventLabel: str(body.eventLabel, 160) || undefined,
    partnerId,
    campaignId,
    leadId,
    metadata: {
      ...safeMetadata(body.metadata),
      path: req.nextUrl.pathname,
      referrer: req.headers.get("referer") ?? "",
      userAgent: req.headers.get("user-agent")?.slice(0, 240) ?? "",
    },
  });

  return NextResponse.json({ ok: true });
}
