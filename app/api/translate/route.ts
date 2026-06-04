import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/* Auto-translate (ID -> EN) via endpoint Google Translate gratis (gtx),
   dengan cache di DB: sekali sebuah string diterjemahkan, dipakai ulang.
   Client kirim daftar teks unik; route balikin peta { source: translated }. */

export const runtime = "nodejs";

const hashOf = (s: string, target: string) =>
  crypto.createHash("sha1").update(`${target}:${s}`).digest("hex");

async function googleTranslate(text: string, target: string): Promise<string> {
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}` +
    `&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    // jangan cache di fetch layer; kita cache sendiri di DB
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`gtx ${res.status}`);
  const data = (await res.json()) as unknown;
  // data[0] = array segmen [ [translated, original, ...], ... ]
  const segs = Array.isArray(data) && Array.isArray((data as unknown[])[0])
    ? ((data as unknown[])[0] as unknown[])
    : [];
  return segs.map((s) => (Array.isArray(s) ? (s[0] as string) : "")).join("");
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return out;
}

export async function POST(req: NextRequest) {
  let body: { texts?: unknown; target?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  const target = typeof body.target === "string" && /^[a-z]{2}$/.test(body.target) ? body.target : "en";
  const raw = Array.isArray(body.texts) ? body.texts : [];
  // bersihkan & batasi
  const texts = Array.from(new Set(
    raw.filter((t): t is string => typeof t === "string").map((t) => t.trim()).filter((t) => t.length > 0)
  )).slice(0, 300);

  if (texts.length === 0) return NextResponse.json({ translations: {} });

  const result: Record<string, string> = {};

  // 1) cache lookup
  const hashes = texts.map((t) => hashOf(t, target));
  const cached = await prisma.translation.findMany({ where: { hash: { in: hashes } }, select: { hash: true, text: true } });
  const cachedByHash = new Map(cached.map((c) => [c.hash, c.text]));

  const misses: string[] = [];
  texts.forEach((t, idx) => {
    const hit = cachedByHash.get(hashes[idx]);
    if (hit != null) result[t] = hit;
    else misses.push(t);
  });

  // 2) translate misses via Google (concurrency terbatas), simpan ke cache
  if (misses.length > 0) {
    await mapLimit(misses, 6, async (t) => {
      try {
        const translated = await googleTranslate(t, target);
        result[t] = translated || t;
        if (translated && translated !== t) {
          await prisma.translation.upsert({
            where: { hash: hashOf(t, target) },
            update: { text: translated },
            create: { hash: hashOf(t, target), source: t, target, text: translated },
          }).catch(() => {});
        }
      } catch {
        result[t] = t; // fallback: biarkan teks asli supaya UI tidak rusak
      }
    });
  }

  return NextResponse.json({ translations: result });
}
