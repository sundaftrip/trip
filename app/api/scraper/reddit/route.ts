import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const WV = "https://en.wikivoyage.org/w/api.php";

async function wvFetch(params: Record<string, string>): Promise<unknown> {
  const url = new URL(WV);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("format", "json");
  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "sundaftrip-bot/1.0 (https://sundaftrip.com)" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`Wikivoyage HTTP ${res.status}`);
  return res.json();
}

type WVPage = { pageid: number; title: string; snippet?: string };

async function searchWikivoyage(q: string, limit: number): Promise<WVPage[]> {
  const json = await wvFetch({ action: "query", list: "search", srsearch: q, srnamespace: "0", srlimit: String(limit), srprop: "snippet" }) as { query?: { search?: WVPage[] } };
  return json?.query?.search ?? [];
}

async function allPages(limit: number, from = ""): Promise<WVPage[]> {
  const params: Record<string, string> = { action: "query", list: "allpages", apnamespace: "0", aplimit: String(limit), apfilterredir: "nonredirects" };
  if (from) params.apfrom = from;
  const json = await wvFetch(params) as { query?: { allpages?: WVPage[] } };
  return json?.query?.allpages ?? [];
}

async function fetchExtracts(pageids: number[]): Promise<Map<number, string>> {
  const json = await wvFetch({ action: "query", prop: "extracts", exintro: "1", exchars: "800", pageids: pageids.join("|") }) as { query?: { pages?: Record<string, { extract?: string }> } };
  const map = new Map<number, string>();
  for (const [id, page] of Object.entries(json?.query?.pages ?? {})) {
    const text = (page.extract ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 800);
    if (text.length > 30) map.set(Number(id), text);
  }
  return map;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "scraper_run"))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const body = await req.json();
  const { keyword = "" } = body;
  const kw = keyword.trim();

  const pages: WVPage[] = [];
  let wvError = "";

  // Try Wikivoyage
  try {
    if (kw) {
      // Search by keyword + broader search
      const [exact, broad] = await Promise.all([
        searchWikivoyage(kw, 100),
        searchWikivoyage(`${kw} travel guide`, 50),
      ]);
      const seen = new Set<number>();
      for (const p of [...exact, ...broad]) {
        if (!seen.has(p.pageid)) { seen.add(p.pageid); pages.push(p); }
      }
    } else {
      // No keyword — get all pages spread across alphabet
      const starts = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
      const batches = await Promise.all(starts.map((s) => allPages(25, s)));
      const seen = new Set<number>();
      for (const batch of batches) {
        for (const p of batch) {
          if (!seen.has(p.pageid)) { seen.add(p.pageid); pages.push(p); }
        }
      }
    }
  } catch (err) {
    wvError = err instanceof Error ? err.message : String(err);
  }

  if (pages.length === 0) {
    return NextResponse.json({
      results: [],
      total: 0,
      source: "wikivoyage",
      warning: `Wikivoyage tidak menemukan sumber untuk "${kw || "semua destinasi"}"${wvError ? ` (${wvError})` : ""}. Coba keyword destinasi yang lebih spesifik.`,
    });
  }

  const realPages = pages.filter((p) => p.pageid > 0);
  const extractMap = new Map<number, string>();
  if (realPages.length > 0) {
    // Batch 50 at a time
    await Promise.all(
      Array.from({ length: Math.ceil(realPages.length / 50) }, (_, i) =>
        fetchExtracts(realPages.slice(i * 50, i * 50 + 50).map((p) => p.pageid))
          .then((m) => { for (const [id, text] of m) extractMap.set(id, text); })
          .catch(() => {})
      )
    );
  }

  // Build source URLs
  const toUrl = (title: string) =>
    `https://en.wikivoyage.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;

  const realUrls = realPages.map((p) => toUrl(p.title));
  const existingUrls = realUrls.length > 0
    ? await prisma.scrapedContent.findMany({ where: { sourceUrl: { in: realUrls } }, select: { sourceUrl: true, status: true, blogId: true } })
    : [];
  const existingMap = new Map(existingUrls.map((e) => [e.sourceUrl, e]));

  const results = pages.map((p) => {
    const url = toUrl(p.title);
    const preview = extractMap.get(p.pageid) || p.snippet?.replace(/<[^>]+>/g, " ").trim() || p.title;
    return {
      sourceUrl: url,
      sourcePlatform: "wikivoyage",
      subreddit: "Wikivoyage",
      originalTitle: p.title,
      originalBody: preview,
      coverImage: "",
      author: "Wikivoyage",
      score: null,
      numComments: null,
      alreadyImported: existingMap.has(url),
      importStatus: existingMap.get(url)?.status ?? null,
      blogId: existingMap.get(url)?.blogId ?? null,
      isAiGenerated: false,
    };
  });

  return NextResponse.json({ results, total: results.length, source: "wikivoyage" });
}
