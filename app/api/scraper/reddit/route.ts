import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const WV_API = "https://en.wikivoyage.org/w/api.php";

type WVPage = {
  pageid: number;
  title: string;
  snippet?: string;
  extract?: string;
};

async function searchWikivoyage(keyword: string, limit = 50): Promise<WVPage[]> {
  const url = new URL(WV_API);
  url.searchParams.set("action", "query");
  url.searchParams.set("list", "search");
  url.searchParams.set("srsearch", keyword || "travel destination");
  url.searchParams.set("srnamespace", "0");
  url.searchParams.set("srlimit", String(limit));
  url.searchParams.set("srprop", "snippet|titlesnippet");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Wikivoyage HTTP ${res.status}`);
  const json = await res.json();
  return (json?.query?.search ?? []) as WVPage[];
}

async function listWikivoyageCategory(category: string, limit = 200): Promise<WVPage[]> {
  const url = new URL(WV_API);
  url.searchParams.set("action", "query");
  url.searchParams.set("list", "categorymembers");
  url.searchParams.set("cmtitle", `Category:${category}`);
  url.searchParams.set("cmlimit", String(limit));
  url.searchParams.set("cmtype", "page");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Wikivoyage category HTTP ${res.status}`);
  const json = await res.json();
  return ((json?.query?.categorymembers ?? []) as { pageid: number; title: string }[]).map((p) => ({
    pageid: p.pageid,
    title: p.title,
    snippet: "",
  }));
}

async function fetchWikivoyageExtracts(pageids: number[]): Promise<Map<number, string>> {
  const url = new URL(WV_API);
  url.searchParams.set("action", "query");
  url.searchParams.set("prop", "extracts");
  url.searchParams.set("exintro", "1");
  url.searchParams.set("exchars", "600");
  url.searchParams.set("pageids", pageids.join("|"));
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return new Map();
  const json = await res.json();
  const pages = json?.query?.pages ?? {};
  const map = new Map<number, string>();
  for (const [id, page] of Object.entries(pages)) {
    const extract = ((page as { extract?: string }).extract ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 600);
    map.set(Number(id), extract);
  }
  return map;
}

// Category → Wikivoyage category name mapping
const CATEGORY_MAP: Record<string, string[]> = {
  europe: ["Europe", "Countries_in_Europe"],
  asia: ["Asia", "Countries_in_Asia"],
  japan: ["Japan"],
  russia: ["Russia"],
  turkey: ["Turkey"],
  thailand: ["Thailand"],
  bali: ["Bali"],
  vietnam: ["Vietnam"],
  france: ["France"],
  italy: ["Italy"],
  germany: ["Germany"],
  "middle east": ["Middle_East"],
  africa: ["Africa"],
  "south america": ["South_America"],
  australia: ["Australia"],
  "new zealand": ["New_Zealand"],
  usa: ["United_States_of_America"],
  canada: ["Canada"],
  india: ["India"],
  china: ["China"],
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "scraper_run"))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const body = await req.json();
  const { keyword = "" } = body;
  const kw = keyword.trim().toLowerCase();

  let pages: WVPage[] = [];
  const errors: string[] = [];

  // 1. Try category listing first (more results, no keyword restriction)
  const categories = kw ? (CATEGORY_MAP[kw] ?? []) : ["Europe", "Asia", "Countries_in_Asia", "Countries_in_Europe"];
  if (categories.length > 0) {
    await Promise.all(
      categories.map(async (cat) => {
        try {
          const catPages = await listWikivoyageCategory(cat, 200);
          pages.push(...catPages);
        } catch (err) {
          errors.push(`Category ${cat}: ${err}`);
        }
      })
    );
  }

  // 2. Also search by keyword to fill in gaps
  try {
    const searchLimit = kw ? 100 : 50;
    const searchResults = await searchWikivoyage(kw || "travel city destination", searchLimit);
    for (const p of searchResults) {
      if (!pages.some((x) => x.pageid === p.pageid)) pages.push(p);
    }
  } catch (err) {
    errors.push(`Search: ${err}`);
  }

  // Deduplicate
  const seen = new Set<number>();
  pages = pages.filter((p) => {
    if (seen.has(p.pageid)) return false;
    seen.add(p.pageid);
    return true;
  });

  if (pages.length === 0) {
    return NextResponse.json({
      results: [],
      total: 0,
      warning: kw
        ? `Tidak ada artikel ditemukan untuk "${keyword}". Coba keyword seperti "japan", "europe", "bali".`
        : "Tidak ada artikel ditemukan dari Wikivoyage.",
      errors,
    });
  }

  // Fetch extracts for up to 50 pages at a time (API limit)
  const extractMap = new Map<number, string>();
  const chunks = [];
  for (let i = 0; i < Math.min(pages.length, 200); i += 50) {
    chunks.push(pages.slice(i, i + 50).map((p) => p.pageid));
  }
  await Promise.all(
    chunks.map(async (ids) => {
      const map = await fetchWikivoyageExtracts(ids);
      for (const [id, extract] of map) extractMap.set(id, extract);
    })
  );

  // Check already imported
  const pageUrls = pages.map((p) => `https://en.wikivoyage.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}`);
  const existingUrls = await prisma.scrapedContent.findMany({
    where: { sourceUrl: { in: pageUrls } },
    select: { sourceUrl: true, status: true, blogId: true },
  });
  const existingMap = new Map(existingUrls.map((e) => [e.sourceUrl, e]));

  const results = pages.map((p) => {
    const wvUrl = `https://en.wikivoyage.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}`;
    const extract = extractMap.get(p.pageid) || p.snippet?.replace(/<[^>]+>/g, " ").trim() || p.title;
    return {
      sourceUrl: wvUrl,
      sourcePlatform: "wikivoyage",
      subreddit: "Wikivoyage",
      originalTitle: p.title,
      originalBody: extract,
      coverImage: "",
      author: "Wikivoyage Contributors",
      score: null,
      numComments: null,
      alreadyImported: existingMap.has(wvUrl),
      importStatus: existingMap.get(wvUrl)?.status ?? null,
      blogId: existingMap.get(wvUrl)?.blogId ?? null,
      isAiGenerated: false,
    };
  });

  return NextResponse.json({ results, total: results.length, source: "wikivoyage", errors: errors.length ? errors : undefined });
}
