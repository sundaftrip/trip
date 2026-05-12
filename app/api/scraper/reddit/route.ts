import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

interface RedditChild {
  data: {
    id: string;
    title: string;
    selftext: string;
    score: number;
    permalink: string;
    subreddit: string;
    author: string;
    num_comments: number;
    created_utc: number;
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "scraper_run"))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const body = await req.json();
  const { subreddit = "travel", keyword, sort = "top", time = "month", limit = 25 } = body;

  const apiUrl = keyword
    ? `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(keyword)}&sort=${sort}&t=${time}&limit=${limit}&restrict_sr=true`
    : `https://www.reddit.com/r/${subreddit}/${sort}.json?t=${time}&limit=${limit}`;

  let redditRes: Response;
  try {
    redditRes = await fetch(apiUrl, {
      headers: {
        "User-Agent": process.env.REDDIT_USER_AGENT || "sundaftrip-scraper/1.0 by sundaftrip",
        "Accept": "application/json",
      },
      next: { revalidate: 0 },
    });
  } catch {
    return NextResponse.json({ error: "Gagal terhubung ke Reddit" }, { status: 502 });
  }

  if (!redditRes.ok) {
    return NextResponse.json(
      { error: `Reddit mengembalikan error ${redditRes.status}` },
      { status: 502 }
    );
  }

  const json = await redditRes.json();
  const posts: RedditChild[] = json.data?.children ?? [];

  const filtered = posts
    .filter(
      (p) =>
        p.data.selftext &&
        p.data.selftext !== "[removed]" &&
        p.data.selftext !== "[deleted]" &&
        p.data.selftext.length > 200 &&
        p.data.score > 50
    )
    .map((p) => ({
      sourceUrl: `https://www.reddit.com${p.data.permalink}`,
      sourcePlatform: "reddit",
      subreddit: p.data.subreddit,
      originalTitle: p.data.title,
      originalBody: p.data.selftext.slice(0, 5000),
      score: p.data.score,
      author: p.data.author,
      numComments: p.data.num_comments,
      createdUtc: p.data.created_utc,
    }));

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
