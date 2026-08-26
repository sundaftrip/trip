import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import {
  privateNoStoreHeaders,
  readBoundedJson,
  validateSameOriginMutation,
} from "@/lib/public-mutation-security";
import { prisma } from "@/lib/prisma";

const REPORT_STATUSES = ["RESOLVED", "DISMISSED"] as const;

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);
  if (!(await checkPermission(session, "visa_discussion_moderate"))) {
    return jsonError("Forbidden", 403);
  }

  const requestCheck = validateSameOriginMutation(req);
  if (!requestCheck.ok) return jsonError(requestCheck.error, requestCheck.status);
  const parsed = await readBoundedJson(req);
  if (!parsed.ok) return jsonError(parsed.error, parsed.status);

  const status = parsed.value.status;
  if (typeof status !== "string" || !REPORT_STATUSES.includes(
    status as (typeof REPORT_STATUSES)[number],
  )) {
    return jsonError("Status laporan tidak valid.", 422);
  }

  const { id } = await ctx.params;
  try {
    const report = await prisma.visaDiscussionReport.update({
      where: { id },
      data: {
        status: status as (typeof REPORT_STATUSES)[number],
        reviewedById: session.user.id,
        reviewedAt: new Date(),
      },
      select: { id: true, discussionId: true, status: true, reviewedAt: true },
    });
    return NextResponse.json(report, { headers: privateNoStoreHeaders });
  } catch {
    return jsonError("Laporan tidak ditemukan.", 404);
  }
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: privateNoStoreHeaders });
}
