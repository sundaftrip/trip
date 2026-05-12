import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

const TA_WORLD_FORUMS = "https://www.tripadvisor.com/ListForums-g1-World.html";
const DESTINATIONS = ["russia", "europe", "japan", "turkey", "middle east", "asia"];

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function cleanText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

function parseForumLinks(html: string, keyword: string): { title: string; url: string }[] {
  const forums: { title: string; url: string }[] = [];
  const kw = keyword.toLowerCase();
  const re = /href="(\/(?:ListForums|Tourism)-g\d+[^"]*)"[^>]*>([^<]{3,60})<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const title = cleanText(m[2]).trim();
    if (!title || !title.toLowerCase().includes(kw)) continue;
    const url = `https://www.tripadvisor.com${m[1]}`;
    if (!forums.some((f) => f.url === url)) forums.push({ title, url });
    if (forums.length >= 3) break;
  }
  return forums;
}

function parseThreads(html: string): { title: string; url: string }[] {
  const threads: { title: string; url: string }[] = [];
  const re = /href="(\/ShowTopic-[^"]+\.html)"[^>]*>([^<]{10,})<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const title = cleanText(m[2]).trim();
    if (!title || title.length < 10) continue;
    const url = `https://www.tripadvisor.com${m[1].split("?")[0]}`;
    if (!threads.some((t) => t.url === url)) threads.push({ title, url });
    if (threads.length >= 20) break;
  }
  return threads;
}

async function fetchThreadContent(url: string): Promise<string> {
  try {
    const html = await fetchHtml(url);
    const containers = [
      /<div[^>]+class="[^"]*postBody[^"]*"[^>]*>([\s\S]{100,4000}?)<\/div>/i,
      /<div[^>]+class="[^"]*review-container[^"]*"[^>]*>([\s\S]{100,4000}?)<\/div>/i,
      /<p[^>]*class="[^"]*partial_entry[^"]*"[^>]*>([\s\S]{50,3000}?)<\/p>/i,
    ];
    for (const re of containers) {
      const mm = html.match(re);
      if (mm && mm[1].length > 80) return cleanText(mm[1]).slice(0, 4000);
    }
    return "";
  } catch {
    return "";
  }
}

async function fetchOgImage(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return "";
    const html = await res.text();
    const m = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
    return m ? m[1] : "";
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

async function rewriteArticle(title: string, content: string) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

  const prompt = `Kamu adalah traveler Indonesia yang suka jalan-jalan dan nulis pengalaman di blog pribadi. Bukan jurnalis, bukan copywriter — cuma orang biasa yang cerita perjalanan.

Tugas: Tulis artikel blog perjalanan dalam Bahasa Indonesia, gaya cerita personal, 800–1500 kata.

Gaya penulisan:
- Sudut pandang orang pertama: "saya" atau "aku" (boleh campur)
- Nada santai, personal, sedikit spontan — seperti cerita di forum travel atau blog pribadi
- Jangan terlalu rapi atau terlalu formal
- Boleh ada kalimat agak panjang, pengulangan kata kecil, atau frasa sehari-hari
- Hindari gaya puitis, marketing, atau terlalu sempurna — jangan terdengar seperti brosur wisata
- Masukkan opini pribadi: "orang-orangnya ramah", "cukup aman", "lumayan capek tapi worth it"
- Ceritakan secara kronologis dari datang sampai pulang
- Detail praktis secara natural: transportasi, hotel, SIM card, harga, kondisi jalan, keamanan

Struktur (gunakan heading HTML):
1. <p> Pembukaan singkat — konteks perjalanan
2. <h2> Kedatangan dan First Impression
3. <h2> Perjalanan Harian — cerita kronologis
4. <h2> Transportasi dan Akomodasi
5. <h2> Tips Praktis — min 5 tips dalam <ul><li>
6. <h2> Kesimpulan — jujur, singkat

Info WAJIB ada secara natural: flight dari Indonesia, visa, SIM card, budget IDR, waktu terbaik.

Topik:
JUDUL: ${title}
DETAIL (gunakan sebagai bahan, jangan copy-paste):
${content || title}

Kembalikan HANYA JSON valid:
{"title":"judul blog pribadi natural","excerpt":"ringkasan santai 1-2 kalimat","category":"Eropa","imageKeywords":"travel,city,culture","body":"<p>...</p><h2>...</h2>..."}`;

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
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY tidak diset" }, { status: 500 });
  }

  const TARGET_COUNT = 2;
  const published: string[] = [];
  const errors: string[] = [];

  // Pick a random destination keyword
  const keyword = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];

  let threads: { title: string; url: string }[] = [];
  try {
    const worldHtml = await fetchHtml(TA_WORLD_FORUMS);
    const forums = parseForumLinks(worldHtml, keyword);
    if (forums.length > 0) {
      const forumHtml = await fetchHtml(forums[0].url);
      threads = parseThreads(forumHtml);
    }
  } catch (err) {
    return NextResponse.json({ error: `Gagal fetch TripAdvisor: ${err}` }, { status: 502 });
  }

  if (threads.length === 0) {
    return NextResponse.json({ error: "Tidak ada thread ditemukan", keyword }, { status: 200 });
  }

  // Filter yang belum diimport
  const existingUrls = await prisma.scrapedContent.findMany({
    where: { sourceUrl: { in: threads.map((t) => t.url) } },
    select: { sourceUrl: true },
  });
  const existingSet = new Set(existingUrls.map((e) => e.sourceUrl));
  const fresh = threads.filter((t) => !existingSet.has(t.url));
  const toProcess = fresh.sort(() => Math.random() - 0.5).slice(0, TARGET_COUNT);

  for (const thread of toProcess) {
    try {
      const content = await fetchThreadContent(thread.url);
      const rewritten = await rewriteArticle(thread.title, content);

      // Cover image
      let cover = await fetchOgImage(thread.url);
      if (cover) cover = await mirrorToCloudinary(cover);
      if (!cover) {
        const seed = rewritten.title.length + rewritten.title.charCodeAt(0);
        cover = `https://picsum.photos/seed/${seed}/1200/630`;
      }

      const baseSlug = slugify(rewritten.title, { lower: true, strict: true, locale: "id" });
      const slug = await generateUniqueSlug(baseSlug);

      const blog = await prisma.blog.create({
        data: {
          slug,
          title: rewritten.title,
          excerpt: rewritten.excerpt,
          category: rewritten.category,
          body: rewritten.body,
          cover,
          readTime: estimateReadTime(rewritten.body),
          published: true,
          author: "Tim Sundaftrip",
        },
      });

      await prisma.scrapedContent.create({
        data: {
          sourceUrl: thread.url,
          sourcePlatform: "tripadvisor",
          subreddit: "TripAdvisor Forums",
          originalTitle: thread.title,
          originalBody: content.slice(0, 5000),
          status: "published",
          blogId: blog.id,
        },
      });

      published.push(blog.title);
    } catch (err) {
      errors.push(`${thread.title}: ${err}`);
    }
  }

  return NextResponse.json({
    success: true,
    source: "tripadvisor",
    keyword,
    published,
    errors,
    message: `${published.length} artikel berhasil dipublish`,
  });
}
