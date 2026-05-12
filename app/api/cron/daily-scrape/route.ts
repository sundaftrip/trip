import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

const DESTINATIONS = ["russia", "europe", "japan", "turkey", "thailand", "bali", "middle east", "vietnam"];
const SUBREDDITS = ["travel", "solotravel", "backpacking"];

const REDDIT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; sundaftrip-bot/1.0; +https://sundaftrip.com)",
  "Accept": "application/json",
};

async function fetchRedditPosts(keyword: string, subreddit: string): Promise<{ title: string; url: string; body: string }[]> {
  const q = encodeURIComponent(keyword);
  const res = await fetch(
    `https://www.reddit.com/r/${subreddit}/search.json?q=${q}&sort=top&t=month&limit=25&restrict_sr=1`,
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

  const prompt = `Kamu adalah traveler Indonesia berpengalaman yang sudah keliling 30+ negara dan nulis blog perjalanan detail di sundaftrip.com.

TUGAS: Tulis artikel blog perjalanan PANJANG dan DETAIL dalam Bahasa Indonesia. Target minimal 1500 kata, idealnya 2000+ kata.

GAYA: Orang pertama ("saya"/"aku"), santai tapi informatif, penuh detail nyata — nama tempat, harga IDR, nama transportasi, nama makanan. Bukan brosur wisata, bukan Wikipedia. Boleh curhat, salah langkah, momen tak terduga.

WAJIB ADA (tulis secara natural):
- Booking tiket: maskapai, harga IDR, transit
- Visa: proses, biaya, durasi
- Bandara → kota: transportasi, harga
- Akomodasi: nama area, harga per malam IDR
- SIM card: provider, harga, sinyal
- Transportasi lokal: aplikasi, biaya harian
- Makanan: nama makanan, tempat, harga, pendapat jujur
- Momen spesifik tak terduga
- Budget total kasar dalam IDR
- Tips keamanan spesifik (scam, area berbahaya, dll)
- Waktu terbaik vs waktu yang dihindari

STRUKTUR HTML:
<p>[Pembukaan — hook menarik]</p>
<h2>Persiapan dan Keberangkatan dari Indonesia</h2>
<p>[Detail booking, visa, keberangkatan — min 300 kata]</p>
<h2>Pertama Kali Sampai: Kesan Awal</h2>
<p>[Bandara, transportasi ke kota, first impression jujur]</p>
<h2>Jalan-Jalan Harian: Dari Pagi Sampai Malam</h2>
<p>[Kronologis hari per hari — bagian TERPANJANG, min 600 kata, cerita spesifik bukan generik]</p>
<h2>Soal Makan: Wajib Coba Ini</h2>
<p>[Rekomendasi dengan nama, tempat, harga]</p>
<h2>Transportasi, Akomodasi, dan Internet</h2>
<p>[Detail praktis dengan angka nyata]</p>
<h2>Tips Penting Sebelum Pergi</h2>
<ul><li>[min 6 tips spesifik dan actionable]</li></ul>
<h2>Worth It Nggak? Penilaian Jujur Saya</h2>
<p>[Kesimpulan jujur dengan kelebihan dan kekurangan]</p>

Topik: ${title}
Bahan (kembangkan, jangan copy-paste): ${content || title}

Kembalikan HANYA JSON valid:
{"title":"judul artikel menarik","excerpt":"ringkasan 2-3 kalimat santai","category":"Eropa","imageKeywords":"travel,city,culture","body":"<p>...</p>"}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.75,
    max_tokens: 8192,
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

  const keyword = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
  const subreddit = SUBREDDITS[Math.floor(Math.random() * SUBREDDITS.length)];

  let posts: { title: string; url: string; body: string }[] = [];
  try {
    posts = await fetchRedditPosts(keyword, subreddit);
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
      const rewritten = await rewriteArticle(post.title, post.body);

      const seed = rewritten.title.length + rewritten.title.charCodeAt(0);
      const cover = `https://picsum.photos/seed/${seed}/1200/630`;

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
          sourceUrl: post.url,
          sourcePlatform: "reddit",
          subreddit,
          originalTitle: post.title,
          originalBody: post.body.slice(0, 5000),
          status: "published",
          blogId: blog.id,
        },
      });

      published.push(blog.title);
    } catch (err) {
      errors.push(`${post.title}: ${err}`);
    }
  }

  return NextResponse.json({
    success: true,
    source: "reddit",
    keyword,
    subreddit,
    published,
    errors,
    message: `${published.length} artikel berhasil dipublish`,
  });
}
