import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isPoolTableMissing } from "./store";

/* Bagian bersama route publik pool: batas ukuran, rate limit, dan pesan error
   yang ramah. Detail error database tidak pernah dikirim ke pengunjung. */

export const POOL_MAX_BODY = 6000;
export const POOL_PUBLIC_CACHE = "public, s-maxage=30, stale-while-revalidate=300";
const NO_STORE = { "Cache-Control": "no-store" };

export function poolJson(body: unknown, status = 200, cache = "no-store") {
  return NextResponse.json(body, { status, headers: { "Cache-Control": cache } });
}

/** GET publik: data pool, atau pesan error tanpa cache. */
export async function poolRead(build: () => Promise<unknown | null>, cache: string) {
  try {
    const body = await build();
    if (!body) return poolJson({ ok: false, error: "Pool belum tersambung." }, 503);
    return poolJson(body, 200, cache);
  } catch (err) {
    if (isPoolTableMissing(err)) return poolJson({ ok: false, error: "Pool belum tersambung." }, 503);
    console.error("[pool] read", err);
    return poolJson({ ok: false, error: "Data pool belum bisa dimuat. Coba lagi sebentar." }, 502);
  }
}

type Parsed = { ok: true; value: Record<string, unknown> } | { ok: false; response: NextResponse };

/** Baca isi formulir publik: rate limit per IP, ukuran wajar, harus objek JSON. */
export async function readPoolForm(req: NextRequest, bucket: string): Promise<Parsed> {
  if (!rateLimit(`${bucket}:${clientIp(req)}`, 8, 60_000)) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Terlalu banyak percobaan. Coba lagi sebentar." },
        { status: 429, headers: { "Retry-After": "60", ...NO_STORE } },
      ),
    };
  }
  const text = await req.text();
  if (text.length > POOL_MAX_BODY) return { ok: false, response: poolJson({ ok: false, error: "Isi formulir terlalu panjang." }, 413) };
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    value = null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, response: poolJson({ ok: false, error: "Format formulir tidak dikenali." }, 400) };
  }
  return { ok: true, value: value as Record<string, unknown> };
}

/** Kolom jebakan bot: formulir asli selalu mengirimnya kosong. */
export function isBotSubmission(form: Record<string, unknown>): boolean {
  return typeof form.hp === "string" && form.hp.trim() !== "";
}

/** POST publik: simpan pendaftaran, atau pesan error yang bisa ditampilkan formulir. */
export async function poolWrite(save: () => Promise<Record<string, unknown>>) {
  try {
    return poolJson(await save());
  } catch (err) {
    if (isPoolTableMissing(err)) return poolJson({ ok: false, error: "Pendaftaran belum tersambung. Coba lagi nanti, ya." }, 503);
    console.error("[pool] write", err);
    return poolJson({ ok: false, error: "Koneksi lagi bermasalah. Coba tekan kirim sekali lagi." }, 502);
  }
}
