import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function extractTextBetween(html: string, start: string, end: string): string {
  const si = html.indexOf(start);
  if (si === -1) return "";
  const ei = html.indexOf(end, si + start.length);
  if (ei === -1) return "";
  return html.slice(si + start.length, ei);
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

interface FBPost {
  sourceUrl: string;
  sourcePlatform: string;
  originalTitle: string;
  originalBody: string;
  author: string;
  alreadyImported: boolean;
  importStatus: string | null;
  blogId: string | null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "scraper_run"))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const fbCookie = process.env.FACEBOOK_COOKIE;
  if (!fbCookie) {
    return NextResponse.json(
      {
        error: "FACEBOOK_COOKIE belum diset",
        setup: [
          "1. Login ke Facebook di browser",
          "2. Buka DevTools → Application → Cookies → facebook.com",
          "3. Copy nilai cookie 'c_user' dan 'xs'",
          "4. Tambahkan ke .env: FACEBOOK_COOKIE=c_user=XXX; xs=YYY",
        ],
      },
      { status: 400 }
    );
  }

  const { groupUrl } = await req.json();
  if (!groupUrl) return NextResponse.json({ error: "groupUrl diperlukan" }, { status: 400 });

  // Convert to mbasic (simpler HTML)
  const mbasicUrl = groupUrl
    .replace("https://www.facebook.com", "https://mbasic.facebook.com")
    .replace("https://facebook.com", "https://mbasic.facebook.com");

  let html: string;
  try {
    const res = await fetch(mbasicUrl, {
      headers: {
        Cookie: fbCookie,
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });

    if (res.url.includes("login") || res.status === 302) {
      return NextResponse.json(
        { error: "Cookie Facebook tidak valid atau sudah kadaluarsa. Perbarui FACEBOOK_COOKIE di .env" },
        { status: 401 }
      );
    }

    html = await res.text();
  } catch {
    return NextResponse.json({ error: "Gagal mengakses Facebook" }, { status: 502 });
  }

  // Parse posts from mbasic HTML
  const posts: FBPost[] = [];
  const sections = html.split('<div class="'); // mbasic uses simple div structure

  for (const section of sections) {
    // Look for story content blocks
    const bodyMatch = section.match(/<p[^>]*>([\s\S]{100,1000}?)<\/p>/);
    if (!bodyMatch) continue;

    const body = stripHtml(bodyMatch[1]);
    if (body.length < 100) continue;

    // Try to find author
    const authorRaw = extractTextBetween(section, 'data-sigil="feed_story_ring">', "</a>");
    const author = stripHtml(authorRaw) || "Facebook User";

    // Try to find post URL
    const urlMatch = section.match(/href="(\/[^"?]+\?story_fbid[^"]+)"/);
    const postPath = urlMatch ? urlMatch[1] : "";
    const sourceUrl = postPath
      ? `https://www.facebook.com${postPath.replace(/&amp;/g, "&")}`
      : groupUrl + "#" + Date.now() + Math.random();

    // Extract first line as title
    const firstLine = body.split("\n")[0].slice(0, 120);

    posts.push({
      sourceUrl,
      sourcePlatform: "facebook",
      originalTitle: firstLine || "Cerita dari Facebook",
      originalBody: body.slice(0, 5000),
      author,
      alreadyImported: false,
      importStatus: null,
      blogId: null,
    });

    if (posts.length >= 15) break;
  }

  if (posts.length === 0) {
    return NextResponse.json({
      results: [],
      total: 0,
      warning:
        "Tidak ada postingan yang ditemukan. Pastikan URL grup benar dan cookie masih valid.",
    });
  }

  // Check duplicates
  const existingUrls = await prisma.scrapedContent.findMany({
    where: { sourceUrl: { in: posts.map((p) => p.sourceUrl) } },
    select: { sourceUrl: true, status: true, blogId: true },
  });
  const existingMap = new Map(existingUrls.map((e) => [e.sourceUrl, e]));

  const results = posts.map((p) => ({
    ...p,
    alreadyImported: existingMap.has(p.sourceUrl),
    importStatus: existingMap.get(p.sourceUrl)?.status ?? null,
    blogId: existingMap.get(p.sourceUrl)?.blogId ?? null,
  }));

  return NextResponse.json({ results, total: results.length });
}
