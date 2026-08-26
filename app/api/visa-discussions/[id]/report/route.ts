import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { normalizeVisaDiscussionReport } from "@/lib/visa-discussion-input";
import {
  privateNoStoreHeaders,
  readBoundedJson,
  validateSameOriginMutation,
} from "@/lib/public-mutation-security";
import { prisma } from "@/lib/prisma";
import { clientIp } from "@/lib/rate-limit";
import {
  asPrismaReportReason,
  discussionFingerprint,
  publicWritesConfigured,
  reportRateLimit,
  verifyTurnstileToken,
  visaDiscussionTableAvailable,
} from "@/lib/visa-discussions";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const requestCheck = validateSameOriginMutation(req);
  if (!requestCheck.ok) return jsonError(requestCheck.error, requestCheck.status);

  const parsed = await readBoundedJson(req);
  if (!parsed.ok) return jsonError(parsed.error, parsed.status);
  if (!publicWritesConfigured() || !(await visaDiscussionTableAvailable())) {
    return jsonError("Pelaporan masih dalam mode preview.", 503);
  }

  const normalized = normalizeVisaDiscussionReport(parsed.value);
  if (!normalized.ok) return jsonError(normalized.error, 422);

  const ip = clientIp(req);
  const fingerprint = discussionFingerprint(ip);
  if (!fingerprint) return jsonError("Konfigurasi keamanan belum siap.", 503);
  const token = typeof parsed.value.turnstileToken === "string"
    ? parsed.value.turnstileToken
    : "";
  if (!(await verifyTurnstileToken(token, ip, req.nextUrl.hostname))) {
    return jsonError("Pemeriksaan anti-spam gagal. Muat ulang lalu coba lagi.", 422);
  }
  if (!(await reportRateLimit(fingerprint))) {
    return jsonError("Batas laporan tercapai. Coba lagi nanti.", 429, { "Retry-After": "3600" });
  }

  const { id } = await ctx.params;
  const discussion = await prisma.visaDiscussion.findFirst({
    where: {
      id,
      status: "PUBLISHED",
      OR: [
        { parentId: null },
        { parent: { parentId: null, status: "PUBLISHED" } },
      ],
    },
    select: { id: true },
  });
  if (!discussion) return jsonError("Konten tidak ditemukan.", 404);

  try {
    await prisma.visaDiscussionReport.create({
      data: {
        discussionId: id,
        reason: asPrismaReportReason(normalized.value.reason),
        details: normalized.value.details,
        reporterFingerprint: fingerprint,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { ok: true, status: "ALREADY_REPORTED" },
        { status: 200, headers: privateNoStoreHeaders },
      );
    }
    return jsonError("Laporan belum dapat disimpan. Coba lagi nanti.", 503);
  }

  return NextResponse.json(
    { ok: true, status: "REPORTED" },
    { status: 201, headers: privateNoStoreHeaders },
  );
}

function jsonError(
  error: string,
  status: number,
  extraHeaders: Record<string, string> = {},
) {
  return NextResponse.json(
    { error },
    { status, headers: { ...privateNoStoreHeaders, ...extraHeaders } },
  );
}
