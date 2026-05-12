import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { fetchRbthRss } from "@/app/api/scraper/reddit/route";

function between(str: string, open: string, close: string): string {
  const si = str.indexOf(open);
  if (si === -1) return "";
  const ei = str.indexOf(close, si + open.length);
  if (ei === -1) return "";
  return str.slice(si + open.length, ei).trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n").trim();
}

function parseRss(xml: string) {
  const items: { title: string; link: string; description: string; source: string }[] = [];
  const itemBlocks = xml.split(/<item[\s>]/);
  itemBlocks.shift();
  for (const block of itemBlocks) {
    const title = stripHtml(between(block, "<title>", "</title>").replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, ""));
    let link = between(block, "<link>", "</link>") || between(block, "<guid>", "</guid>");
    const rawDesc = between(block, "<description>", "</description>");
    const description = stripHtml(rawDesc.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, ""));
    const source = between(block, '<source url=', "</source>").split(">").pop() ?? "Google News";
    if (title && link?.startsWith("http") && description.length > 30) {
      items.push({ title, link, description, source });
    }
  }
  return items;
}

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

async function rewriteArticle(title: string, body: string) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  const prompt = `Kamu adalah penulis blog perjalanan profesional untuk sundaftrip.com — travel agency Indonesia yang fokus pada destinasi wisata internasional.

Tugas: Rewrite artikel berikut menjadi blog post Bahasa Indonesia yang:
- Gaya: personal, hangat, inspiratif — seperti cerita dari teman yang baru pulang traveling
- SEO: sebutkan nama destinasi secara natural
- Struktur: pembuka menarik → isi cerita/informasi → tips praktis → penutup inspiratif
- Panjang: 600–900 kata
- Jangan menyebut sumber aslinya

Artikel asli:
JUDUL: ${title}
ISI: ${body}

Kembalikan HANYA JSON valid:
{"title":"...","excerpt":"...","category":"Eropa/Asia/Amerika/Timur Tengah/Afrika/Oseania/Tips Travel","body":"<p>...HTML...</p>"}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2048,
  });
  const text = completion.choices[0]?.message?.content ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response");
  return JSON.parse(jsonMatch[0]) as { title: string; excerpt: string; category: string; body: string };
}

export async function GET(req: NextRequest) {
  // Vercel Cron auth check
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY tidak diset" }, { status: 500 });
  }

  const TARGET_COUNT = 2; // artikel per hari
  const published: string[] = [];
  const errors: string[] = [];

  let articles: { title: string; link: string; description: string; source: string }[] = [];
  try {
    const xml = await fetchRbthRss();
    articles = parseRss(xml);
  } catch (err) {
    return NextResponse.json({ error: `Gagal fetch RBTH: ${err}` }, { status: 502 });
  }

  // Filter artikel yang belum pernah diimport
  const existingUrls = await prisma.scrapedContent.findMany({
    where: { sourceUrl: { in: articles.map((a) => a.link) } },
    select: { sourceUrl: true },
  });
  const existingSet = new Set(existingUrls.map((e) => e.sourceUrl));
  const fresh = articles.filter((a) => !existingSet.has(a.link));

  // Shuffle dan ambil TARGET_COUNT
  const shuffled = fresh.sort(() => Math.random() - 0.5).slice(0, TARGET_COUNT);

  for (const article of shuffled) {
    try {
      const rewritten = await rewriteArticle(article.title, `${article.title}\n\n${article.description}`);

      const baseSlug = slugify(rewritten.title, { lower: true, strict: true, locale: "id" });
      const slug = await generateUniqueSlug(baseSlug);
      const readTime = estimateReadTime(rewritten.body);

      const blog = await prisma.blog.create({
        data: {
          slug,
          title: rewritten.title,
          excerpt: rewritten.excerpt,
          category: rewritten.category,
          body: rewritten.body,
          readTime,
          published: true, // auto-publish
          author: "Tim Sundaftrip",
        },
      });

      await prisma.scrapedContent.create({
        data: {
          sourceUrl: article.link,
          sourcePlatform: "rbth",
          subreddit: "RBTH Indonesia",
          originalTitle: article.title,
          originalBody: article.description.slice(0, 5000),
          status: "published",
          blogId: blog.id,
        },
      });

      published.push(blog.title);
    } catch (err) {
      errors.push(`${article.title}: ${err}`);
    }
  }

  return NextResponse.json({
    success: true,
    source: "rbth",
    published,
    errors,
    message: `${published.length} artikel berhasil dipublish`,
  });
}
