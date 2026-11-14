import "server-only";

import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity, type LogAction } from "@/lib/activityLog";
import { apiError } from "@/lib/api-error";
import type { SaveResult } from "./store";

/* Penjaga route CMS pool (/api/pool-admin/*). Nama dan nomor WhatsApp pendaftar
   hanya keluar dari route yang sudah lolos pemeriksaan izin di sini. */

type Guard = { ok: true; session: Session } | { ok: false; response: NextResponse };

export async function requirePoolPermission(key: "pool_view" | "pool_edit"): Promise<Guard> {
  const session = await auth();
  if (!session) return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!(await checkPermission(session, key))) {
    return { ok: false, response: NextResponse.json({ error: "Akun Anda tidak punya izin untuk data pool." }, { status: 403 }) };
  }
  return { ok: true, session };
}

export async function readJsonObject(req: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await req.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const badRequest = () => NextResponse.json({ error: "Bad request" }, { status: 400 });

export async function logPool(session: Session, action: LogAction, resourceName: string, detail?: string, resourceId?: string) {
  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role, action, resource: "POOL", resourceId, resourceName, detail,
  });
}

/** Jalankan mutasi CMS pool: izin pool_edit, pesan error ramah, catat di log aktivitas. */
export async function poolMutation<T>(
  action: LogAction,
  run: () => Promise<SaveResult<T>>,
  describe: (value: T) => { name: string; detail?: string; id?: string },
): Promise<NextResponse> {
  const guard = await requirePoolPermission("pool_edit");
  if (!guard.ok) return guard.response;
  try {
    const result = await run();
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    const info = describe(result.value);
    await logPool(guard.session, action, info.name, info.detail, info.id);
    return NextResponse.json({ ok: true, value: result.value });
  } catch (err) {
    return apiError(err);
  }
}
