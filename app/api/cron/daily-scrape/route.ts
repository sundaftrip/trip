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

function injectImagesIntoBody(body: string, images: { url: string; photographer: string; photographerUrl: string }[]): string {
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

LARANGAN KERAS (langgar ini = artikel gagal total):
1. Jangan gunakan tanda "—" (em dash). Ganti dengan koma, titik, atau kalimat baru.
2. JANGAN PERNAH mengarang fakta yang bisa dicek di Google atau Maps: alamat gedung, nama jalan, nomor jalan, syarat visa resmi (dokumen apa saja), biaya resmi kedutaan/pemerintah, jam operasional resmi. Kalau tidak tahu persis, tulis "cek situs resmi" atau "konfirmasi langsung ke kedutaan". LEBIH BAIK tidak sebut daripada salah.
3. Yang BOLEH dikarang: nama karakter pendukung kecil, percakapan personal, perasaan, estimasi harga makanan/warung lokal, nama penginapan kecil, urutan kejadian personal.

TUGAS: Tulis artikel blog perjalanan Bahasa Indonesia dengan gaya persis seperti contoh. Target 1500-2000 kata.

WAJIB ADA (masukkan natural ke dalam cerita):
- Hook kuat di paragraf pertama
- Waktu spesifik (jam berapa, hari ke berapa)
- Tahun 2024 atau 2025 — JANGAN gunakan tahun sebelum 2023
- Kesalahan atau hal yang tidak berjalan sesuai rencana
- Momen tak terduga
- Harga dalam Rupiah
- Nama aplikasi spesifik jika relevan (Klook, Airalo, Wise, Booking.com, dll)
- Visa, transportasi dari Indonesia, SIM card — diceritakan, bukan dilist

HIGHLIGHT: Gunakan tag <mark> untuk menandai 4-6 kalimat atau frasa yang paling penting atau wajib diingat. Contoh: <mark>Visa on arrival untuk Indonesia berlaku 30 hari dan bisa diperpanjang sekali.</mark> Jangan lebihkan — hanya kalimat yang benar-benar krusial.

JUDUL BAGIAN — WAJIB KREATIF DAN KONTEKSTUAL:
DILARANG pakai judul generik yang muncul di setiap artikel. Setiap h2 harus spesifik untuk topik ini.

Untuk bagian tips, pilih salah satu atau buat sendiri yang lebih baik:
- "Yang Tidak Akan Saya Ulangi"
- "Hal-Hal yang Baru Saya Tahu Setelah Pulang"
- "Kalau Saya Pergi Lagi, Ini yang Akan Saya Lakukan Beda"
- "Kesalahan yang Bisa Kamu Hindari"
- "Yang Tidak Ada di Blog Mana Pun"

Untuk bagian kesimpulan, pilih salah satu atau buat sendiri:
- "Jadi, Worth It Nggak?"
- "Saya Akan Balik Lagi?"
- "Untuk Siapa Perjalanan Ini Cocok"
- "Jujur Saja: [nama tempat] Itu..."
- "Ekspektasi vs Realita"

STRUKTUR HTML:
<p>[Hook pembuka]</p>
<h2>[Judul kontekstual spesifik untuk topik ini]</h2><p>[isi detail]</p>
<h2>[Judul kontekstual spesifik]</h2><p>[isi detail]</p>
<h2>[Judul kontekstual spesifik]</h2><p>[isi detail]</p>
<h2>[Judul tips kreatif — BUKAN "Tips yang Beneran Berguna"]</h2><ul><li>[tip spesifik]</li>...</ul>
<h2>[Judul kesimpulan kreatif — BUKAN "Kesimpulan jujur"]</h2><p>[isi]</p>

Topik: ${title}
Bahan (kembangkan, perkaya, jangan copy-paste): ${content || title}

FORMAT OUTPUT:
{"title":"judul artikel menarik","excerpt":"ringkasan 2-3 kalimat santai","category":"Eropa","imageKeywords":"moscow kremlin red square russia winter"}
---BODY---
<p>isi artikel HTML di sini</p>

PENTING untuk imageKeywords: isi dengan NAMA TEMPAT dan OBJEK SPESIFIK — supaya foto yang dicari di Pexels relevan. Contoh: "tokyo shibuya japan night", "bali rice terrace ubud", "istanbul grand bazaar turkey". JANGAN tulis kata generik seperti travel, passport, visa, city, culture.`;

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

      const keywords = (rewritten as { imageKeywords?: string }).imageKeywords || rewritten.title;
      const pexelsImages = await fetchPexelsImages(keywords, 5);

      let cover = "";
      if (pexelsImages.length > 0) {
        cover = await mirrorToCloudinary(pexelsImages[0].url);
      }
      if (!cover) {
        const seed = rewritten.title.length + rewritten.title.charCodeAt(0);
        cover = `https://picsum.photos/seed/${seed}/1200/630`;
      }

      const body = injectImagesIntoBody(rewritten.body, pexelsImages.slice(1));

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
