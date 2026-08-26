import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { normalizeVisaDiscussionInput } from "@/lib/visa-discussion-input";
import {
  privateNoStoreHeaders,
  readBoundedJson,
  validateSameOriginMutation,
} from "@/lib/public-mutation-security";
import { prisma } from "@/lib/prisma";
import { revalidatePublicContent } from "@/lib/revalidate";
import {
  discussionFingerprint,
  discussionUpdateForStatus,
  isVisaDiscussionStatus,
} from "@/lib/visa-discussions";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const access = await moderatorAccess();
  if (!access.ok) return jsonError(access.error, access.status);
  const requestCheck = validateSameOriginMutation(req);
  if (!requestCheck.ok) return jsonError(requestCheck.error, requestCheck.status);
  const parsed = await readBoundedJson(req);
  if (!parsed.ok) return jsonError(parsed.error, parsed.status);

  const requestedStatus = parsed.value.status;
  const requestedLock = parsed.value.isLocked;
  if (requestedStatus !== undefined && !isVisaDiscussionStatus(requestedStatus)) {
    return jsonError("Status tidak valid.", 422);
  }
  if (requestedLock !== undefined && typeof requestedLock !== "boolean") {
    return jsonError("Status kunci tidak valid.", 422);
  }
  if (requestedStatus === undefined && requestedLock === undefined) {
    return jsonError("Tidak ada perubahan yang diminta.", 422);
  }

  const { id } = await ctx.params;
  try {
    const current = await prisma.visaDiscussion.findUnique({
      where: { id },
      select: { parentId: true },
    });
    if (!current) return jsonError("Diskusi tidak ditemukan.", 404);
    if (requestedLock !== undefined && current.parentId) {
      return jsonError("Hanya pertanyaan utama yang dapat ditutup.", 422);
    }
    if (requestedStatus === "PUBLISHED" && current.parentId) {
      const visibleParent = await prisma.visaDiscussion.findFirst({
        where: { id: current.parentId, parentId: null, status: "PUBLISHED" },
        select: { id: true },
      });
      if (!visibleParent) {
        return jsonError("Terbitkan pertanyaan utama sebelum balasannya.", 422);
      }
    }
    const item = await prisma.visaDiscussion.update({
      where: { id },
      data: {
        ...(requestedStatus
          ? discussionUpdateForStatus(requestedStatus, access.userId)
          : {}),
        ...(requestedLock !== undefined ? { isLocked: requestedLock } : {}),
      },
      select: { id: true, status: true, publishedAt: true, isLocked: true },
    });
    revalidatePublicContent();
    return NextResponse.json(item, { headers: privateNoStoreHeaders });
  } catch {
    return jsonError("Diskusi tidak ditemukan.", 404);
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const access = await moderatorAccess();
  if (!access.ok) return jsonError(access.error, access.status);
  const requestCheck = validateSameOriginMutation(req);
  if (!requestCheck.ok) return jsonError(requestCheck.error, requestCheck.status);
  const parsed = await readBoundedJson(req);
  if (!parsed.ok) return jsonError(parsed.error, parsed.status);

  const { id } = await ctx.params;
  const parent = await prisma.visaDiscussion.findFirst({
    where: { id, parentId: null, status: "PUBLISHED", isLocked: false },
    select: { id: true, countryName: true, countrySlug: true, isLocked: true },
  });
  if (!parent) return jsonError("Thread tidak ditemukan atau sudah ditutup.", 404);

  const normalized = normalizeVisaDiscussionInput({
    parentId: id,
    authorName: "Tim Sundaf",
    message: parsed.value.message,
    sourceUrl: parsed.value.sourceUrl,
  });
  if (!normalized.ok) return jsonError(normalized.error, 422);

  const fingerprint = discussionFingerprint(`staff:${access.userId}`);
  if (!fingerprint) return jsonError("Konfigurasi keamanan belum siap.", 503);
  const now = new Date();
  const item = await prisma.visaDiscussion.create({
    data: {
      parentId: id,
      authorName: "Tim Sundaf",
      countryName: parent.countryName,
      countrySlug: parent.countrySlug,
      message: normalized.value.message,
      sourceUrl: normalized.value.sourceUrl,
      status: "PUBLISHED",
      isAdminReply: true,
      authorFingerprint: fingerprint,
      contentHash: normalized.value.contentHash,
      reviewedById: access.userId,
      reviewedAt: now,
      publishedAt: now,
    },
    select: { id: true, status: true, publishedAt: true },
  });

  revalidatePublicContent();
  return NextResponse.json(item, { status: 201, headers: privateNoStoreHeaders });
}

async function moderatorAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }
  if (!(await checkPermission(session, "visa_discussion_moderate"))) {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }
  return {
    ok: true as const,
    userId: session.user.id,
  };
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: privateNoStoreHeaders });
}
