import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const TA_WORLD_FORUMS = "https://www.tripadvisor.com/ListForums-g1-World.html";

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
};

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} dari ${url}`);
  return res.text();
}

function cleanText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

// Parse destination forum links from the world forum listing page
function parseForumLinks(html: string, keyword: string): { title: string; url: string }[] {
  const forums: { title: string; url: string }[] = [];
  const kw = keyword.toLowerCase();

  // Match forum links — TripAdvisor uses /Tourism-g{id}-{slug} or /ListForums-g{id}
  const re = /href="(\/(?:ListForums|Tourism)-g\d+[^"]*)"[^>]*>([^<]{3,60})<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const title = cleanText(m[2]).trim();
    if (!title || title.length < 3) continue;
    if (kw && !title.toLowerCase().includes(kw)) continue;
    const url = `https://www.tripadvisor.com${m[1]}`;
    if (!forums.some((f) => f.url === url)) {
      forums.push({ title, url });
    }
    if (forums.length >= 5) break;
  }
  return forums;
}

// Parse thread list from a forum page
function parseThreads(html: string): { title: string; url: string; preview: string }[] {
  const threads: { title: string; url: string; preview: string }[] = [];

  // TripAdvisor thread links: /ShowTopic-g...-k...-{slug}.html
  const re = /href="(\/ShowTopic-[^"]+\.html)"[^>]*>([^<]{10,})<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const title = cleanText(m[2]).trim();
    if (!title || title.length < 10) continue;
    const url = `https://www.tripadvisor.com${m[1].split("?")[0]}`;
    if (!threads.some((t) => t.url === url)) {
      threads.push({ title, url, preview: "" });
    }
    if (threads.length >= 30) break;
  }
  return threads;
}

// Fetch first post body from a thread page
async function fetchThreadPreview(url: string): Promise<string> {
  try {
    const html = await fetchHtml(url);
    // Try to extract first post content from various possible containers
    const containers = [
      /<div[^>]+class="[^"]*postBody[^"]*"[^>]*>([\s\S]{100,3000}?)<\/div>/i,
      /<div[^>]+class="[^"]*review-container[^"]*"[^>]*>([\s\S]{100,3000}?)<\/div>/i,
      /<div[^>]+data-automation="[^"]*body[^"]*"[^>]*>([\s\S]{100,3000}?)<\/div>/i,
      /<p[^>]*class="[^"]*partial_entry[^"]*"[^>]*>([\s\S]{50,2000}?)<\/p>/i,
    ];
    for (const re of containers) {
      const mm = html.match(re);
      if (mm && mm[1].length > 80) return cleanText(mm[1]).slice(0, 600);
    }
    return "";
  } catch {
    return "";
  }
}

export async function fetchTripAdvisorThreads(keyword: string): Promise<string> {
  const worldHtml = await fetchHtml(TA_WORLD_FORUMS);
  const forums = parseForumLinks(worldHtml, keyword);
  if (forums.length === 0) throw new Error("Forum tidak ditemukan untuk keyword tersebut");

  // Fetch threads from first matching forum
  const forumHtml = await fetchHtml(forums[0].url);
  return forumHtml;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "scraper_run"))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const body = await req.json();
  const { keyword = "" } = body;

  let threads: { title: string; url: string; preview: string }[] = [];

  try {
    // 1. Fetch world forum listing
    const worldHtml = await fetchHtml(TA_WORLD_FORUMS);

    // 2. Find matching destination forum
    const forums = parseForumLinks(worldHtml, keyword);

    if (forums.length === 0) {
      // Fallback: search threads directly from world forum page
      threads = parseThreads(worldHtml);
    } else {
      // 3. Fetch threads from matching forum
      const forumHtml = await fetchHtml(forums[0].url);
      threads = parseThreads(forumHtml);

      // If not enough, also try second forum
      if (threads.length < 5 && forums.length > 1) {
        const html2 = await fetchHtml(forums[1].url);
        threads.push(...parseThreads(html2));
      }
    }

    if (threads.length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
        warning: keyword
          ? `Tidak ada thread ditemukan untuk "${keyword}". Coba keyword lain.`
          : "Tidak ada thread ditemukan dari TripAdvisor.",
      });
    }

    // Filter by keyword if provided
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      threads = threads.filter(
        (t) => t.title.toLowerCase().includes(kw) || t.preview.toLowerCase().includes(kw)
      );
    }

    // Check which URLs already imported
    const existingUrls = await prisma.scrapedContent.findMany({
      where: { sourceUrl: { in: threads.map((t) => t.url) } },
      select: { sourceUrl: true, status: true, blogId: true },
    });
    const existingMap = new Map(existingUrls.map((e) => [e.sourceUrl, e]));

    const results = threads.map((t) => ({
      sourceUrl: t.url,
      sourcePlatform: "tripadvisor",
      subreddit: "TripAdvisor Forums",
      originalTitle: t.title,
      originalBody: t.preview || t.title,
      coverImage: "",
      author: "TripAdvisor Traveler",
      score: null,
      numComments: null,
      alreadyImported: existingMap.has(t.url),
      importStatus: existingMap.get(t.url)?.status ?? null,
      blogId: existingMap.get(t.url)?.blogId ?? null,
    }));

    return NextResponse.json({ results, total: results.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Gagal mengakses TripAdvisor: ${msg}` }, { status: 502 });
  }
}
