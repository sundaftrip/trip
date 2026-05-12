import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const RBTH_RSS = "https://id.rbth.com/rss";

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n").trim();
}

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  if (!m) return "";
  return stripHtml(m[1].replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "")).trim();
}

function parseRss(xml: string) {
  const items: { title: string; link: string; author: string; description: string }[] = [];
  const itemRe = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const description = extractTag(block, "description");
    const author = extractTag(block, "dc:creator") || extractTag(block, "author") || "RBTH Indonesia";

    let link = extractTag(block, "link");
    if (!link) {
      const guidM = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
      link = guidM ? guidM[1].trim() : "";
    }

    if (title && link.startsWith("http") && (description.length > 20 || title.length > 20)) {
      items.push({ title, link, author, description: description || title });
    }
  }
  return items;
}

export async function fetchRbthRss(): Promise<string> {
  const res = await fetch(RBTH_RSS, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      "Accept": "application/rss+xml, application/xml, text/xml, */*",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`RBTH RSS error ${res.status}`);
  return res.text();
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "scraper_run"))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const body = await req.json();
  const { keyword = "" } = body;

  let xml: string;
  try {
    xml = await fetchRbthRss();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Gagal mengakses RBTH: ${msg}` }, { status: 502 });
  }

  let parsed = parseRss(xml);

  // Filter by keyword if provided
  if (keyword.trim()) {
    const kw = keyword.toLowerCase();
    parsed = parsed.filter(
      (p) => p.title.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw)
    );
  }

  const filtered = parsed
    .filter((p) => p.description.length > 30 && p.link.startsWith("http"))
    .slice(0, 20)
    .map((p) => ({
      sourceUrl: p.link,
      sourcePlatform: "rbth",
      subreddit: "RBTH Indonesia",
      originalTitle: p.title,
      originalBody: `${p.title}\n\n${p.description}`,
      author: p.author,
      score: null,
      numComments: null,
    }));

  if (filtered.length === 0) {
    return NextResponse.json({
      results: [],
      total: 0,
      warning: keyword.trim()
        ? `Tidak ada artikel ditemukan untuk "${keyword}". Coba keyword lain atau kosongkan untuk semua artikel.`
        : "Tidak ada artikel ditemukan dari RBTH.",
    });
  }

  const existingUrls = await prisma.scrapedContent.findMany({
    where: { sourceUrl: { in: filtered.map((p) => p.sourceUrl) } },
    select: { sourceUrl: true, status: true, blogId: true },
  });
  const existingMap = new Map(existingUrls.map((e) => [e.sourceUrl, e]));

  const results = filtered.map((p) => ({
    ...p,
    alreadyImported: existingMap.has(p.sourceUrl),
    importStatus: existingMap.get(p.sourceUrl)?.status ?? null,
    blogId: existingMap.get(p.sourceUrl)?.blogId ?? null,
  }));

  return NextResponse.json({ results, total: results.length });
}
