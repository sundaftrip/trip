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

async function fetchOgImage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    const m = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
    return m ? m[1] : "";
  } catch {
    return "";
  }
}

async function rewriteArticle(title: string, body: string) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  const prompt = `Kamu adalah penulis blog perjalanan profesional untuk sundaftrip.com — travel agency Indonesia yang fokus pada destinasi wisata internasional.

Tugas: Tulis artikel blog Bahasa Indonesia yang PANJANG, MENDALAM, dan MENARIK (1200–1800 kata).

Panduan gaya:
- Personal dan hangat — seperti cerita teman yang baru pulang traveling
- Gunakan detail sensoris: aroma, suara, pemandangan, rasa makanan, suhu udara
- Sisipkan fakta menarik yang tidak umum diketahui
- Ajak pembaca membayangkan diri mereka di sana
- Hindari kalimat klise seperti "destinasi yang menakjubkan" atau "pemandangan yang indah"

Struktur WAJIB (gunakan heading HTML):
1. <p> Opening hook — 1 paragraf pembuka yang langsung menarik
2. <h2> Mengapa [Destinasi] Berbeda dari yang Kamu Bayangkan — 2-3 paragraf
3. <h2> Pengalaman yang Akan Kamu Ceritakan Seumur Hidup — 3 sub-bagian dengan <h3>
4. <h2> Tips Praktis Agar Perjalananmu Lancar — min. 6 tips dalam <ul><li>
5. <h2> Kuliner & Budaya yang Wajib Kamu Cicipi — 2 paragraf
6. <h2> Rencanakan Perjalananmu Sekarang — waktu terbaik, durasi ideal, estimasi budget
7. <p> Penutup inspiratif

SEO: Sebut nama destinasi minimal 8× secara natural.

Artikel asli:
JUDUL: ${title}
ISI: ${body}

Kembalikan HANYA JSON valid:
{"title":"...","excerpt":"...","category":"Eropa/Asia/Amerika/Timur Tengah/Afrika/Oseania/Tips Travel","imageKeywords":"travel,city,culture","body":"<p>...</p><h2>...</h2>..."}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.75,
    max_tokens: 4096,
  });
  const text = completion.choices[0]?.message?.content ?? "";
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response");

  let jsonStr = jsonMatch[0];
  const bodyMatch = jsonStr.match(/"body"\s*:\s*"([\s\S]*?)"\s*\}/);
  let bodyContent = "";
  if (bodyMatch) {
    bodyContent = bodyMatch[1];
    jsonStr = jsonStr.replace(/"body"\s*:\s*"[\s\S]*?"\s*\}/, '"body":"__BODY__"}');
  }
  const result = JSON.parse(jsonStr) as { title: string; excerpt: string; category: string; imageKeywords?: string; body: string };
  if (bodyContent) result.body = bodyContent.replace(/\\n/g, "\n").replace(/\\"/g, '"');
  return result;
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

      // Resolve cover image: og:image from article page → Picsum fallback
      let cover = await fetchOgImage(article.link);
      if (!cover) {
        const seed = rewritten.title.length + rewritten.title.charCodeAt(0);
        cover = `https://picsum.photos/seed/${seed}/1200/630`;
      }

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
          cover,
          readTime,
          published: true,
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
