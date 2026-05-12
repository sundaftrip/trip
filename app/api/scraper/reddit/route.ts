import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const SUBREDDITS = ["travel", "solotravel", "backpacking", "TravelHacks", "digitalnomad"];

const REDDIT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; sundaftrip-bot/1.0; +https://sundaftrip.com)",
  "Accept": "application/json",
};

type RedditPost = {
  data: {
    title: string;
    selftext: string;
    url: string;
    permalink: string;
    score: number;
    num_comments: number;
    is_self: boolean;
  };
};

async function fetchSubredditTop(
  subreddit: string,
  period: "month" | "year" = "month"
): Promise<RedditPost[]> {
  const apiUrl = `https://www.reddit.com/r/${subreddit}/top.json?t=${period}&limit=50`;
  const res = await fetch(apiUrl, { headers: REDDIT_HEADERS, signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`Reddit HTTP ${res.status}`);
  const json = await res.json();
  return (json?.data?.children ?? []) as RedditPost[];
}

async function searchReddit(
  keyword: string,
  subreddit: string
): Promise<{ title: string; url: string; preview: string; score: number; numComments: number }[]> {
  let posts: RedditPost[] = [];

  // Try keyword search first
  if (keyword.trim()) {
    try {
      const q = encodeURIComponent(keyword);
      const apiUrl = `https://www.reddit.com/r/${subreddit}/search.json?q=${q}&sort=top&t=year&limit=50&restrict_sr=1`;
      const res = await fetch(apiUrl, { headers: REDDIT_HEADERS, signal: AbortSignal.timeout(12000) });
      if (res.ok) {
        const json = await res.json();
        posts = (json?.data?.children ?? []) as RedditPost[];
      }
    } catch {
      // fall through to top posts
    }
  }

  // Fall back to top posts if search returned nothing
  if (posts.length === 0) {
    posts = await fetchSubredditTop(subreddit, "month");
    if (posts.length === 0) {
      posts = await fetchSubredditTop(subreddit, "year");
    }
  }

  const kw = keyword.toLowerCase();
  return posts
    .filter((p) => {
      if (!p.data.is_self || !p.data.selftext || p.data.selftext.length < 100) return false;
      if (!kw) return true;
      return (
        p.data.title.toLowerCase().includes(kw) ||
        p.data.selftext.toLowerCase().includes(kw)
      );
    })
    .map((p) => ({
      title: p.data.title,
      url: `https://www.reddit.com${p.data.permalink}`,
      preview: p.data.selftext.slice(0, 600),
      score: p.data.score,
      numComments: p.data.num_comments,
    }));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "scraper_run"))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const body = await req.json();
  const { keyword = "" } = body;

  const allThreads: {
    title: string;
    url: string;
    preview: string;
    score: number;
    numComments: number;
    subreddit: string;
  }[] = [];

  const errors: string[] = [];

  // Search across multiple subreddits in parallel
  const targets = keyword.trim() ? SUBREDDITS.slice(0, 3) : SUBREDDITS.slice(0, 2);
  await Promise.all(
    targets.map(async (sub) => {
      try {
        const posts = await searchReddit(keyword, sub);
        for (const p of posts) {
          if (!allThreads.some((t) => t.url === p.url)) {
            allThreads.push({ ...p, subreddit: sub });
          }
        }
      } catch (err) {
        errors.push(`r/${sub}: ${err instanceof Error ? err.message : String(err)}`);
      }
    })
  );

  if (allThreads.length === 0) {
    return NextResponse.json({
      results: [],
      total: 0,
      warning: keyword
        ? `Tidak ada postingan ditemukan untuk "${keyword}". Coba keyword lebih spesifik, contoh: "france", "tokyo", "bali budget".`
        : "Tidak ada postingan ditemukan dari Reddit.",
      errors,
    });
  }

  // Sort by score desc
  allThreads.sort((a, b) => b.score - a.score);

  // Check which URLs already imported
  const existingUrls = await prisma.scrapedContent.findMany({
    where: { sourceUrl: { in: allThreads.map((t) => t.url) } },
    select: { sourceUrl: true, status: true, blogId: true },
  });
  const existingMap = new Map(existingUrls.map((e) => [e.sourceUrl, e]));

  const results = allThreads.map((t) => ({
    sourceUrl: t.url,
    sourcePlatform: "reddit",
    subreddit: t.subreddit,
    originalTitle: t.title,
    originalBody: t.preview,
    coverImage: "",
    author: "Reddit Traveler",
    score: t.score,
    numComments: t.numComments,
    alreadyImported: existingMap.has(t.url),
    importStatus: existingMap.get(t.url)?.status ?? null,
    blogId: existingMap.get(t.url)?.blogId ?? null,
  }));

  return NextResponse.json({ results, total: results.length, errors: errors.length ? errors : undefined });
}
