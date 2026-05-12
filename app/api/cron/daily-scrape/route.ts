import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
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
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const prompt = `Kamu adalah traveler Indonesia yang nulis blog perjalanan di sundaftrip.com. Tulisanmu jujur, detail, dan terasa seperti cerita dari teman — bukan artikel media.

CONTOH GAYA TULISAN YANG HARUS KAMU TIRU:
"Pickpocket di Barcelona nyolong pasporku 6 jam sebelum jadwal keberangkatan. Ini cerita gimana aku kejar-kejaran sama waktu buat dapetin paspor darurat. Kejadiannya di hari terakhir di Barcelona. Aku harusnya ninggalin paspor di loker hostel, tapi ragu-ragu takut ketinggalan, jadi aku simpen di kantong depan celana. Bodoh memang. Padahal aku udah hati-hati banget — tangan selalu di kantong. Tapi ada 5 menit waktu naik metro, kaki udah pegal habis jalan seminggu, pikiran melayang. Aku ingat berdiri sambil ngelamun, lalu nyadar — aduh, harusnya aku waspada. Tapi udah terlambat. Aku langsung telepon konsulat. Nggak ada yang angkat. Mungkin lagi tidur siang. Baru nyambung jam 2 siang dan petugas pertama malah marahin aku. Sialan. Untungnya ada petugas lain yang bilang ke konsulat 30 menit lagi. Kami sprint keluar hostel, setop taksi, terjebak macet, tiba di gerbang — dan langsung disuruh balik karena sudah tutup. Aku bilang ada orang yang nunggu, bahkan kasih nama petugasnya. Si penjaga telepon, berdebat dalam Spanyol, lalu: 'Masuk.' Di ruang tunggu ada pasangan tua yang mau cruise impian tapi semua bagasi dicuri. Si kakek kejar pencopet, jatuh, patah tangan. Tiba-tiba kakek itu berhenti merespons, matanya kebalik. Aku langsung minta staf panggil ambulans. Lima menit kemudian ambulans datang. Namaku dipanggil jam 4 lebih. Bayar $100 (sekitar Rp 1,6 juta), paspor darurat di tangan. Kami bebas."

Yang bikin cerita itu bagus: hook langsung, waktu spesifik, kesalahan diakui, karakter pendukung, momen tak terduga, harga nyata, emosi hadir tapi tidak lebay.

LARANGAN KERAS: Jangan gunakan tanda "—" (em dash). Ganti dengan koma, titik, atau kalimat baru.

TUGAS: Tulis artikel blog perjalanan Bahasa Indonesia dengan gaya persis seperti contoh. Target 1500-2000 kata.

WAJIB ADA (masukkan natural ke dalam cerita):
- Hook kuat di paragraf pertama
- Waktu spesifik (jam berapa, hari ke berapa)
- Kesalahan atau hal yang tidak berjalan sesuai rencana
- Momen tak terduga
- Harga dalam Rupiah
- Tips dari pengalaman nyata, bukan generik
- Visa, transportasi dari Indonesia, SIM card — diceritakan, bukan dilist

STRUKTUR HTML:
<p>[Hook pembuka]</p>
<h2>[Bagian persiapan — judul kontekstual]</h2><p>[isi detail]</p>
<h2>[Bagian perjalanan harian — min 600 kata]</h2><p>[isi detail]</p>
<h2>[Bagian makanan/transportasi/akomodasi]</h2><p>[isi detail]</p>
<h2>Tips yang Beneran Berguna</h2><ul><li>[tip spesifik]</li>...</ul>
<h2>[Kesimpulan jujur]</h2><p>[isi]</p>

Topik: ${title}
Bahan (kembangkan, perkaya, jangan copy-paste): ${content || title}

FORMAT OUTPUT:
{"title":"judul artikel menarik","excerpt":"ringkasan 2-3 kalimat santai","category":"Eropa","imageKeywords":"travel,city,culture"}
---BODY---
<p>isi artikel HTML di sini</p>`;

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
