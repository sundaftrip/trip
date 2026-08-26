import { NextRequest, NextResponse } from "next/server";

import { normalizeVisaDiscussionInput } from "@/lib/visa-discussion-input";
import {
  privateNoStoreHeaders,
  readBoundedJson,
  validateSameOriginMutation,
} from "@/lib/public-mutation-security";
import { clientIp } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import {
  asPrismaTopic,
  discussionFingerprint,
  discussionRateLimit,
  isDuplicateDiscussion,
  publicWritesConfigured,
  verifyTurnstileToken,
  visaDiscussionTableAvailable,
} from "@/lib/visa-discussions";

export async function POST(req: NextRequest) {
  const requestCheck = validateSameOriginMutation(req);
  if (!requestCheck.ok) return jsonError(requestCheck.error, requestCheck.status);

  const parsed = await readBoundedJson(req);
  if (!parsed.ok) return jsonError(parsed.error, parsed.status);
  if (typeof parsed.value.website === "string" && parsed.value.website.trim()) {
    return NextResponse.json(
      { ok: true, status: "PENDING" },
      { status: 202, headers: privateNoStoreHeaders },
    );
  }

  if (!publicWritesConfigured() || !(await visaDiscussionTableAvailable())) {
    return jsonError("Ruang diskusi masih dalam mode preview.", 503);
  }

  const normalized = normalizeVisaDiscussionInput(parsed.value);
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

  const kind = normalized.value.parentId ? "reply" : "question";
  if (!(await discussionRateLimit(fingerprint, kind))) {
    return jsonError("Batas kiriman tercapai. Coba lagi nanti.", 429, { "Retry-After": "3600" });
  }
  if (await isDuplicateDiscussion(normalized.value.contentHash)) {
    return jsonError("Kiriman yang sama sudah diterima dalam 24 jam terakhir.", 409);
  }

  let inheritedCountry: { countryName: string | null; countrySlug: string | null } | null = null;
  if (normalized.value.parentId) {
    inheritedCountry = await prisma.visaDiscussion.findFirst({
      where: {
        id: normalized.value.parentId,
        parentId: null,
        status: "PUBLISHED",
        isLocked: false,
      },
      select: { countryName: true, countrySlug: true },
    });
    if (!inheritedCountry) return jsonError("Diskusi tidak ditemukan atau sudah ditutup.", 404);
  }

  try {
    await prisma.visaDiscussion.create({
      data: {
        parentId: normalized.value.parentId,
        authorName: normalized.value.authorName,
        countryName: inheritedCountry?.countryName ?? normalized.value.countryName,
        countrySlug: inheritedCountry?.countrySlug ?? normalized.value.countrySlug,
        topic: asPrismaTopic(normalized.value.topic),
        caseContext: normalized.value.caseContext,
        title: normalized.value.title,
        message: normalized.value.message,
        sourceUrl: normalized.value.sourceUrl,
        authorFingerprint: fingerprint,
        contentHash: normalized.value.contentHash,
        status: "PENDING",
        isAdminReply: false,
      },
    });
  } catch {
    return jsonError("Kiriman belum dapat disimpan. Coba lagi nanti.", 503);
  }

  return NextResponse.json(
    { ok: true, status: "PENDING" },
    { status: 202, headers: privateNoStoreHeaders },
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
