import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import slugify from "slugify";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";
import { getStyle } from "@/lib/scraper-styles";
import { assessGeneratedContent, hasUsableSource, qualityErrorMessage } from "@/lib/content-quality";

export const maxDuration = 120;

function estimateReadTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} menit`;
}

async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.blog.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
}

async function fetchFullArticle(url: string): Promise<string> {
  try {
    // Wikivoyage: use API for clean text extraction
    if (url.includes("wikivoyage.org/wiki/")) {
      const title = decodeURIComponent(url.split("/wiki/")[1] ?? "");
      if (title) {
        const apiUrl = `https://en.wikivoyage.org/w/api.php?action=query&prop=extracts&exlimit=1&titles=${encodeURIComponent(title)}&format=json&origin=*`;
        const apiRes = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
        if (apiRes.ok) {
          const json = await apiRes.json();
          const pages = json?.query?.pages ?? {};
          const page = Object.values(pages)[0] as { extract?: string } | undefined;
          if (page?.extract) {
            return page.extract
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 6000);
          }
        }
      }
    }

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return "";
    const html = await res.text();

    // Try to extract article body from common content containers
    const containers = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]+class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]+class="[^"]*text[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<main[^>]*>([\s\S]*?)<\/main>/i,
    ];

    let body = "";
    for (const re of containers) {
      const m = html.match(re);
      if (m && m[1].length > 300) { body = m[1]; break; }
    }
    if (!body) body = html;

    // Strip scripts, styles, nav, footer, aside
    body = body
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<aside[\s\S]*?<\/aside>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "");

    // Convert block tags to newlines then strip all tags
    const text = body
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Limit to ~4000 chars to keep within token budget
    return text.slice(0, 4000);
  } catch {
    return "";
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

function injectImagesIntoBody(
  body: string,
  images: { url: string; photographer: string; photographerUrl: string }[]
): string {
  if (images.length === 0) return body;

  const sections = body.split(/(<\/h2>)/i);
  let imgIdx = 0;
  let result = "";

  for (let i = 0; i < sections.length; i++) {
    result += sections[i];
    if (/^<\/h2>$/i.test(sections[i]) && imgIdx < images.length) {
      const img = images[imgIdx];
      result += `\n<figure style="margin:1.5rem 0;border-radius:12px;overflow:hidden;">` +
        `<img src="${img.url}" alt="" style="width:100%;height:auto;display:block;" loading="lazy" />` +
        `</figure>\n`;
      imgIdx++;
    }
  }

  return result;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "scraper_rewrite"))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY belum diset di environment variables" }, { status: 500 });
  }

  const { sourceUrl, sourcePlatform, subreddit, originalTitle, originalBody, coverImage, style } = await req.json();
  const styleDef = getStyle(style);

  if (!originalTitle || !originalBody) {
    return NextResponse.json({ error: "originalTitle dan originalBody diperlukan" }, { status: 400 });
  }

  if (typeof sourceUrl !== "string" || !/^https?:\/\//i.test(sourceUrl.trim())) {
    return NextResponse.json({ error: "sourceUrl publik wajib ada supaya draft bisa dilacak ke sumber nyata." }, { status: 422 });
  }

  if (sourcePlatform === "ai-generated" || String(sourceUrl ?? "").startsWith("ai://")) {
    return NextResponse.json({ error: "Topik tanpa sumber nyata ditolak. Ambil konten dari Wikivoyage atau sumber publik yang bisa dicek." }, { status: 422 });
  }

  const cleanBody = originalBody
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();

  // Fetch full article and pre-fetch Pexels images in parallel using title as initial keyword
  const [fullArticleText, preFetchedImages] = await Promise.all([
    sourceUrl ? fetchFullArticle(sourceUrl) : Promise.resolve(""),
    fetchPexelsImages(originalTitle, 5),
  ]);
  const sourceContent = fullArticleText.length > 200 ? fullArticleText : cleanBody;

  if (!hasUsableSource(sourceContent)) {
    return NextResponse.json({ error: "Sumber terlalu tipis untuk dibuat jadi artikel. Cari sumber yang lebih lengkap dulu." }, { status: 422 });
  }

  const prompt = styleDef.buildPrompt({ originalTitle, sourceContent });

  let aiText: string;
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });
    aiText = message.content[0].type === "text" ? message.content[0].text : "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Claude AI error: ${msg}` }, { status: 500 });
  }

  let parsed: { title: string; excerpt: string; category: string; body: string; imageKeywords?: string };
  try {
    const cleaned = aiText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    // Primary: separator format  {"meta"}\n---BODY---\n<html>
    const sepIdx = cleaned.indexOf("---BODY---");
    if (sepIdx !== -1) {
      const metaPart = cleaned.slice(0, sepIdx).trim();
      const bodyPart = cleaned.slice(sepIdx + 10).trim();
      const jsonMatch = metaPart.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON before ---BODY---");
      parsed = JSON.parse(jsonMatch[0]);
      parsed.body = bodyPart || `<p>${cleanBody || originalTitle}</p>`;
    } else {
      // Fallback: body embedded in JSON — extract before parsing
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      let jsonStr = jsonMatch[0];
      // Extract body field content before JSON.parse to avoid escape issues
      const bodyMatch = jsonStr.match(/"body"\s*:\s*"([\s\S]*?)(?:"\s*[,}])/);
      let bodyContent = "";
      if (bodyMatch) {
        bodyContent = bodyMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
        jsonStr = jsonStr.replace(/"body"\s*:\s*"[\s\S]*?"(\s*[,}])/, '"body":"__BODY__"$1');
      }
      parsed = JSON.parse(jsonStr);
      if (bodyContent) parsed.body = bodyContent;
      if (!parsed.body || parsed.body === "__BODY__") parsed.body = `<p>${cleanBody || originalTitle}</p>`;
    }
  } catch {
    // Last resort: regex-extract individual fields
    const title = aiText.match(/"title"\s*:\s*"([^"]+)"/)?.[1] ?? originalTitle;
    const excerpt = aiText.match(/"excerpt"\s*:\s*"([^"]+)"/)?.[1] ?? "";
    const category = aiText.match(/"category"\s*:\s*"([^"]+)"/)?.[1] ?? "Tips Travel";
    const sepIdx = aiText.indexOf("---BODY---");
    const body = sepIdx !== -1 ? aiText.slice(sepIdx + 10).trim() : `<p>${cleanBody || originalTitle}</p>`;
    parsed = { title, excerpt, category, body };
  }

  // Use Claude's imageKeywords for a better search; if different from title, re-fetch
  const keywords = parsed.imageKeywords || parsed.title;
  const pexelsImages = keywords.toLowerCase() !== originalTitle.toLowerCase()
    ? await fetchPexelsImages(keywords, 5)
    : preFetchedImages;

  const quality = assessGeneratedContent({
    title: parsed.title,
    excerpt: parsed.excerpt,
    body: parsed.body,
    sourceContent,
  });
  if (!quality.ok) {
    return NextResponse.json({ error: qualityErrorMessage(quality), issues: quality.issues }, { status: 422 });
  }

  // Use Pexels URL directly as cover (stable CDN, no need to mirror)
  let cover = (coverImage as string | undefined) ?? "";
  if (!cover && pexelsImages.length > 0) {
    cover = pexelsImages[0].url;
  }
  if (!cover) {
    const seed = parsed.title.length + parsed.title.charCodeAt(0);
    cover = `https://picsum.photos/seed/${seed}/1200/630`;
  }

  // Inject foto ke dalam body artikel (setelah setiap h2)
  parsed.body = injectImagesIntoBody(parsed.body, pexelsImages.slice(1));

  const baseSlug = slugify(parsed.title, { lower: true, strict: true, locale: "id" });
  const slug = await generateUniqueSlug(baseSlug);

  const blog = await prisma.blog.create({
    data: {
      slug,
      title: parsed.title,
      excerpt: parsed.excerpt,
      category: parsed.category,
      body: parsed.body,
      cover: cover || null,
      readTime: estimateReadTime(parsed.body),
      published: false,
      author: "Tim Sundaftrip",
    },
  });

  await prisma.scrapedContent.upsert({
    where: { sourceUrl },
    create: {
      sourceUrl,
      sourcePlatform,
      subreddit: subreddit ?? null,
      originalTitle,
      originalBody: originalBody.slice(0, 5000),
      status: "draft",
      blogId: blog.id,
    },
    update: { status: "draft", blogId: blog.id },
  });

  await logActivity({
    userId: session.user.id!,
    userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role,
    action: "CREATE",
    resource: "SCRAPER",
    resourceId: blog.id,
    resourceName: blog.title,
    detail: `Draft berbasis sumber dari ${sourcePlatform}: ${originalTitle}`,
  });

  return NextResponse.json({ blog });
}
