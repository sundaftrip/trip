import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const SUBREDDITS = ["travel", "solotravel", "backpacking"];

const REDDIT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; sundaftrip-bot/1.0; +https://sundaftrip.com)",
  "Accept": "application/json",
};

type RedditPost = {
  data: {
    title: string;
    selftext: string;
    permalink: string;
    score: number;
    num_comments: number;
    is_self: boolean;
  };
};

async function tryReddit(
  keyword: string,
  subreddit: string
): Promise<{ title: string; url: string; preview: string; score: number; numComments: number }[]> {
  // Try top posts (more reliable than search from server)
  const periods: ("month" | "year")[] = ["month", "year"];
  let rawPosts: RedditPost[] = [];

  for (const period of periods) {
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${subreddit}/top.json?t=${period}&limit=50`,
        { headers: REDDIT_HEADERS, signal: AbortSignal.timeout(10000) }
      );
      if (!res.ok) continue;
      const json = await res.json();
      rawPosts = (json?.data?.children ?? []) as RedditPost[];
      if (rawPosts.length > 0) break;
    } catch {
      continue;
    }
  }

  if (rawPosts.length === 0) return [];

  const kw = keyword.toLowerCase();
  return rawPosts
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

async function generateAiTopics(keyword: string): Promise<
  { title: string; url: string; preview: string; score: number; numComments: number }[]
> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  const destination = keyword || "destinasi wisata populer";

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Kamu adalah traveler Indonesia yang sering nulis blog perjalanan.
Buat 10 ide artikel blog perjalanan tentang "${destination}" yang menarik dan informatif.
Setiap artikel harus punya sudut pandang unik — pengalaman nyata, tips praktis, atau cerita seru.

Kembalikan HANYA array JSON valid:
[
  {"title": "judul artikel santai dan natural", "preview": "2-3 kalimat ringkasan isi artikel, gaya cerita personal"},
  ...
]`,
      },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });

  const text = completion.choices[0]?.message?.content ?? "";
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("AI tidak mengembalikan JSON array yang valid");

  const items = JSON.parse(match[0]) as { title: string; preview: string }[];
  return items.slice(0, 10).map((item, i) => ({
    title: item.title,
    url: `ai://generated/${Date.now()}-${i}`,
    preview: item.preview,
    score: 0,
    numComments: 0,
  }));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "scraper_run"))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY belum diset di environment variables Vercel" }, { status: 500 });
  }

  const body = await req.json();
  const { keyword = "" } = body;

  // Try Reddit across multiple subreddits
  const allPosts: {
    title: string;
    url: string;
    preview: string;
    score: number;
    numComments: number;
    subreddit: string;
    source: "reddit" | "ai";
  }[] = [];

  await Promise.all(
    SUBREDDITS.map(async (sub) => {
      const posts = await tryReddit(keyword, sub);
      for (const p of posts) {
        if (!allPosts.some((x) => x.url === p.url)) {
          allPosts.push({ ...p, subreddit: sub, source: "reddit" });
        }
      }
    })
  );

  allPosts.sort((a, b) => b.score - a.score);

  let warning: string | undefined;
  let source: "reddit" | "ai" = "reddit";

  // Fall back to AI-generated topics if Reddit returned nothing
  if (allPosts.length === 0) {
    try {
      const aiTopics = await generateAiTopics(keyword);
      for (const t of aiTopics) {
        allPosts.push({ ...t, subreddit: "AI Generated", source: "ai" });
      }
      source = "ai";
      warning = `Reddit tidak tersedia saat ini. Menampilkan ${allPosts.length} ide artikel yang dibuat AI — klik Rewrite untuk menghasilkan artikel lengkap.`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `Gagal generate topik AI: ${msg}` }, { status: 500 });
    }
  }

  // Check which URLs already imported (skip ai:// URLs)
  const realUrls = allPosts.filter((p) => !p.url.startsWith("ai://")).map((p) => p.url);
  const existingUrls =
    realUrls.length > 0
      ? await prisma.scrapedContent.findMany({
          where: { sourceUrl: { in: realUrls } },
          select: { sourceUrl: true, status: true, blogId: true },
        })
      : [];
  const existingMap = new Map(existingUrls.map((e) => [e.sourceUrl, e]));

  const results = allPosts.map((t) => ({
    sourceUrl: t.url,
    sourcePlatform: t.source === "ai" ? "ai-generated" : "reddit",
    subreddit: t.subreddit,
    originalTitle: t.title,
    originalBody: t.preview,
    coverImage: "",
    author: t.source === "ai" ? "AI Generated" : "Reddit Traveler",
    score: t.score || null,
    numComments: t.numComments || null,
    alreadyImported: existingMap.has(t.url),
    importStatus: existingMap.get(t.url)?.status ?? null,
    blogId: existingMap.get(t.url)?.blogId ?? null,
    isAiGenerated: t.source === "ai",
  }));

  return NextResponse.json({ results, total: results.length, source, warning });
}
