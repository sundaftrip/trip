import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { assessGeneratedContent, qualityErrorMessage } from "@/lib/content-quality";
import { getStyle } from "@/lib/scraper-styles";
import { chooseSourceGroundedImageKeywords, injectImagesIntoBody } from "@/lib/scraper-images";

const DESTINATIONS = ["russia", "kazakhstan", "kyrgyzstan", "uzbekistan", "tajikistan"];
const SUBREDDITS = ["travel", "solotravel", "backpacking"];

const REDDIT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; sundaftrip-bot/1.0; +https://sundaftrip.com)",
  "Accept": "application/json",
};

async function fetchRedditPosts(keyword: string, subreddit: string): Promise<{ title: string; url: string; body: string }[]> {
  const q = encodeURIComponent(keyword);
  const res = await fetch(
    `https://www.reddit.com/r/${subreddit}/search.json?q=${q}&sort=new&t=year&limit=25&restrict_sr=1`,
    { headers: REDDIT_HEADERS, signal: AbortSignal.timeout(12000) }
  );
  if (!res.ok) throw new Error(`Reddit HTTP ${res.status}`);
  const json = await res.json();
  const posts = (json?.data?.children ?? []) as { data: { title: string; selftext: string; url: string; permalink: string; score: number; is_self: boolean } }[];
  return posts
    .filter((p) => p.data.is_self && p.data.selftext && p.data.selftext.length > 200)
    .map((p) => ({
      title: p.data.title,
      url: `https://www.reddit.com${p.data.permalink}`,
      body: p.data.selftext.slice(0, 4000),
    }));
}

async function fetchDestinationFacts(destination: string): Promise<string> {
  const cityMap: Record<string, string> = {
    russia: "Moscow",
    kazakhstan: "Almaty",
    kyrgyzstan: "Bishkek",
    uzbekistan: "Tashkent",
    tajikistan: "Dushanbe",
  };
  const city = cityMap[destination.toLowerCase()] ?? destination;
  try {
    const apiUrl = `https://en.wikivoyage.org/w/api.php?action=query&prop=extracts&exlimit=1&titles=${encodeURIComponent(city)}&format=json&origin=*`;
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return "";
    const json = await res.json();
    const pages = json?.query?.pages ?? {};
    const page = Object.values(pages)[0] as { extract?: string } | undefined;
    if (!page?.extract) return "";
    return page.extract
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2500);
  } catch {
    return "";
  }
}

async function mirrorToCloudinary(imageUrl: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, { folder: "blog-scraper", resource_type: "image", timeout: 15000 });
    return result.secure_url;
  } catch {
    return imageUrl;
  }
}

async function fetchPexelsImages(keywords: string, count = 5): Promise<{ url: string; photographer: string; photographerUrl: string }[]> {
  if (!process.env.PEXELS_API_KEY) return [];
  try {
    const query = encodeURIComponent(keywords.replace(/,/g, " ").trim().slice(0, 60));
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=${count}&orientation=landscape`,
      { headers: { Authorization: process.env.PEXELS_API_KEY }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return [];
    const json = await res.json() as { photos: { src: { large2x: string }; photographer: string; photographer_url: string }[] };
    return (json.photos ?? []).map((p) => ({
      url: p.src.large2x,
      photographer: p.photographer,
      photographerUrl: p.photographer_url,
    }));
  } catch {
    return [];
  }
}

function estimateReadTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} menit`;
}

async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.blog.findUnique({ where: { slug } })) slug = `${baseSlug}-${counter++}`;
  return slug;
}

async function rewriteArticle(title: string, content: string, destinationFacts: string = "") {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const sourceContent = [
    destinationFacts ? `Fakta destinasi dari Wikivoyage:\n${destinationFacts}` : "",
    `Sumber Reddit yang harus diperlakukan sebagai pengalaman pihak ketiga, bukan pengalaman Sundaf:\n${content || title}`,
  ].filter(Boolean).join("\n\n");
  const prompt = getStyle("traveler").buildPrompt({ originalTitle: title, sourceContent });

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  const sepIdx = cleaned.indexOf("---BODY---");
  if (sepIdx !== -1) {
    const metaPart = cleaned.slice(0, sepIdx).trim();
    const bodyPart = cleaned.slice(sepIdx + 10).trim();
    const jsonMatch = metaPart.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON before ---BODY---");
    const result = JSON.parse(jsonMatch[0]) as { title: string; excerpt: string; category: string; imageKeywords?: string; body: string };
    result.body = bodyPart;
    return result;
  }

  // Fallback: body embedded in JSON
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response");
  let jsonStr = jsonMatch[0];
  const bodyMatch = jsonStr.match(/"body"\s*:\s*"([\s\S]*?)(?:"\s*[,}])/);
  let bodyContent = "";
  if (bodyMatch) {
    bodyContent = bodyMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    jsonStr = jsonStr.replace(/"body"\s*:\s*"[\s\S]*?"(\s*[,}])/, '"body":"__BODY__"$1');
  }
  const result = JSON.parse(jsonStr) as { title: string; excerpt: string; category: string; imageKeywords?: string; body: string };
  if (bodyContent) result.body = bodyContent;
  return result;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY tidak diset" }, { status: 500 });
  }

  const TARGET_COUNT = 1;
  const drafted: string[] = [];
  const errors: string[] = [];

  const keyword = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
  const subreddit = SUBREDDITS[Math.floor(Math.random() * SUBREDDITS.length)];

  let posts: { title: string; url: string; body: string }[] = [];
  let destinationFacts = "";
  try {
    [posts, destinationFacts] = await Promise.all([
      fetchRedditPosts(keyword, subreddit),
      fetchDestinationFacts(keyword),
    ]);
  } catch (err) {
    return NextResponse.json({ error: `Gagal fetch Reddit: ${err}` }, { status: 502 });
  }

  if (posts.length === 0) {
    return NextResponse.json({ error: "Tidak ada post ditemukan", keyword, subreddit }, { status: 200 });
  }

  // Filter yang belum diimport
  const existingUrls = await prisma.scrapedContent.findMany({
    where: { sourceUrl: { in: posts.map((p) => p.url) } },
    select: { sourceUrl: true },
  });
  const existingSet = new Set(existingUrls.map((e) => e.sourceUrl));
  const fresh = posts.filter((p) => !existingSet.has(p.url));
  const toProcess = fresh.sort(() => Math.random() - 0.5).slice(0, TARGET_COUNT);

  for (const post of toProcess) {
    try {
      const rewritten = await rewriteArticle(post.title, post.body, destinationFacts);

      const sourceContent = [destinationFacts, post.body].filter(Boolean).join("\n\n");
      const imageKeywords = chooseSourceGroundedImageKeywords({
        generatedKeywords: rewritten.imageKeywords,
        originalTitle: post.title,
        sourceContent,
      });
      const pexelsImages = imageKeywords ? await fetchPexelsImages(imageKeywords, 5) : [];

      let cover = "";
      if (pexelsImages.length > 0) {
        cover = await mirrorToCloudinary(pexelsImages[0].url);
      }

      const body = imageKeywords
        ? injectImagesIntoBody(rewritten.body, pexelsImages.slice(1), imageKeywords)
        : rewritten.body;
      const quality = assessGeneratedContent({
        title: rewritten.title,
        excerpt: rewritten.excerpt,
        body,
        sourceContent,
      });
      if (!quality.ok) {
        throw new Error(qualityErrorMessage(quality));
      }

      const baseSlug = slugify(rewritten.title, { lower: true, strict: true, locale: "id" });
      const slug = await generateUniqueSlug(baseSlug);

      const blog = await prisma.blog.create({
        data: {
          slug,
          title: rewritten.title,
          excerpt: rewritten.excerpt,
          category: rewritten.category,
          body,
          cover,
          readTime: estimateReadTime(rewritten.body),
          published: false,
          author: "Tim Sundaftrip",
        },
      });

      await prisma.scrapedContent.create({
        data: {
          sourceUrl: post.url,
          sourcePlatform: "reddit",
          subreddit,
          originalTitle: post.title,
          originalBody: post.body.slice(0, 5000),
          status: "draft",
          blogId: blog.id,
        },
      });

      drafted.push(blog.title);
    } catch (err) {
      errors.push(`${post.title}: ${err}`);
    }
  }

  return NextResponse.json({
    success: true,
    source: "reddit",
    keyword,
    subreddit,
    drafted,
    errors,
    message: `${drafted.length} draft berhasil dibuat. Tidak ada artikel scraper yang dipublish otomatis.`,
  });
}
