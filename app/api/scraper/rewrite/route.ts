import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import slugify from "slugify";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";
import cloudinary from "@/lib/cloudinary";

export const maxDuration = 60;

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

async function mirrorToCloudinary(imageUrl: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "blog-scraper",
      resource_type: "image",
      timeout: 15000,
    });
    return result.secure_url;
  } catch {
    return imageUrl; // fallback ke URL asli jika upload gagal
  }
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

async function fetchArticleImages(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const html = await res.text();

    const imgs: string[] = [];

    // og:image first
    const og = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
    if (og) imgs.push(og[1]);

    // All <img> tags with reasonable src
    const imgRe = /<img[^>]+src="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/gi;
    let m;
    while ((m = imgRe.exec(html)) !== null) {
      const src = m[1];
      if (!imgs.includes(src) && !src.includes("logo") && !src.includes("icon") && !src.includes("avatar")) {
        imgs.push(src);
      }
      if (imgs.length >= 6) break;
    }

    return imgs;
  } catch {
    return [];
  }
}

function injectImagesIntoBody(body: string, images: string[]): string {
  if (images.length <= 1) return body; // cover already handles first image

  // Split at </h2> boundaries to insert images between sections
  const sections = body.split(/(<\/h2>)/i);
  const extraImgs = images.slice(1); // skip first (used as cover)
  let imgIdx = 0;
  let result = "";

  for (let i = 0; i < sections.length; i++) {
    result += sections[i];
    // After every </h2>, inject an image if available
    if (/^<\/h2>$/i.test(sections[i]) && imgIdx < extraImgs.length) {
      result += `\n<figure style="margin:1.5rem 0;border-radius:12px;overflow:hidden;"><img src="${extraImgs[imgIdx]}" alt="" style="width:100%;height:auto;display:block;" loading="lazy" /></figure>\n`;
      imgIdx++;
    }
  }

  return result;
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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "scraper_rewrite"))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY belum diset di .env.local" }, { status: 500 });
  }

  const { sourceUrl, sourcePlatform, subreddit, originalTitle, originalBody, coverImage } = await req.json();

  if (!originalTitle || !originalBody) {
    return NextResponse.json({ error: "originalTitle dan originalBody diperlukan" }, { status: 400 });
  }

  const cleanBody = originalBody
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();

  // Fetch full article text from source URL so AI has real content to rewrite
  const fullArticleText = sourceUrl ? await fetchFullArticle(sourceUrl) : "";
  const sourceContent = fullArticleText.length > 200 ? fullArticleText : cleanBody;

  const prompt = `Kamu adalah traveler Indonesia berpengalaman yang sudah keliling 30+ negara dan nulis blog perjalanan detail di sundaftrip.com. Tulisanmu dikenal karena jujur, informatif, dan penuh detail praktis yang susah dicari di tempat lain.

TUGAS: Tulis artikel blog perjalanan PANJANG dan DETAIL dalam Bahasa Indonesia. Target minimal 1500 kata, idealnya 2000+ kata. Ini artikel unggulan, bukan artikel biasa.

═══ GAYA PENULISAN ═══
- Sudut pandang orang pertama konsisten ("saya" atau "aku")
- Nada santai tapi informatif — seperti teman yang baru pulang traveling dan cerita panjang lebar
- BUKAN brosur wisata, BUKAN artikel media, BUKAN Wikipedia
- Boleh curhat, boleh kaget, boleh salah langkah — justru itu yang bikin menarik
- Sertakan MOMEN SPESIFIK: "waktu saya nyasar di stasiun X", "penjual di pasar itu ternyata bisa bahasa Inggris", "kamar hotelnya kecil tapi viewnya luar biasa"
- Gunakan angka nyata: harga dalam Rupiah, durasi, jarak, nomor bus/metro, nama jalan
- Bandingkan dengan Indonesia kalau relevan: "lebih mahal dari Jakarta tapi lebih murah dari Bali"

═══ YANG WAJIB ADA (tulis secara natural, bukan poin-poin kering) ═══
✓ Cerita persiapan: booking tiket berapa bulan sebelum, dapat harga berapa, maskapai apa
✓ Proses visa: apply online/VoA/bebas visa, berapa lama, biaya berapa
✓ Bandara kedatangan: imigrasi gimana, mau ke kota naik apa dan berapa harganya
✓ Akomodasi: nama area/distrik tempat menginap, kenapa pilih di sana, harga per malam IDR
✓ SIM card / internet: beli di mana, provider apa, harga berapa, sinyal gimana
✓ Transportasi lokal: MRT/bus/taksi/ojek, aplikasi yang dipake, biaya per hari kira-kira
✓ Makanan: nama makanan lokal yang dicoba, di mana belinya, harga berapa, enak atau tidak
✓ Tempat-tempat yang dikunjungi: cerita pengalaman di sana, bukan sekadar nama tempat
✓ Momen tak terduga: hal yang tidak ada di itinerary, kejutan positif atau negatif
✓ Budget total perjalanan: breakdown kasar (tiket+hotel+makan+transportasi+oleh-oleh) dalam IDR
✓ Waktu terbaik ke sana dan waktu yang sebaiknya dihindari (dengan alasan)
✓ Tips keamanan spesifik: area yang perlu dihindari, scam yang umum, dll

═══ STRUKTUR HTML ═══
<p>[Pembukaan cerita — hook menarik, bisa langsung ke momen seru atau alasan pergi]</p>

<h2>Persiapan dan Keberangkatan dari Indonesia</h2>
<p>[Booking tiket, visa, persiapan, bandara, transit jika ada — detail dan spesifik]</p>

<h2>Pertama Kali Sampai: Kesan Awal yang Tidak Terlupakan</h2>
<p>[Bandara, perjalanan ke kota, first impression — jujur apa adanya]</p>

<h2>Jalan-Jalan Harian: Dari Pagi Sampai Malam</h2>
<p>[Cerita kronologis hari per hari atau area per area — ini bagian terpanjang, minimal 600 kata]</p>

<h2>Soal Makan: Wajib Coba Ini</h2>
<p>[Rekomendasi makanan dengan nama, tempat, harga — jujur mana yang enak dan tidak]</p>

<h2>Transportasi, Akomodasi, dan Internet</h2>
<p>[Detail praktis dengan harga nyata dalam Rupiah]</p>

<h2>Tips Penting Sebelum Pergi</h2>
<ul>
<li>[Tip 1 — spesifik dan actionable, bukan klise]</li>
<li>[Tip 2]</li>
<li>[Tip 3]</li>
<li>[Tip 4]</li>
<li>[Tip 5]</li>
<li>[Tip 6 — tambah sebanyak yang relevan]</li>
</ul>

<h2>Worth It Nggak? Ini Penilaian Jujur Saya</h2>
<p>[Kesimpulan jujur: kelebihan, kekurangan, siapa yang cocok ke sini, kapan sebaiknya pergi]</p>

═══ SUMBER INFORMASI ═══
Topik: ${originalTitle}
Bahan referensi (kembangkan dan perkaya, jangan copy-paste):
${sourceContent || originalTitle}

FORMAT OUTPUT — ikuti persis:
Baris 1: JSON metadata (tanpa field body)
{"title":"judul artikel","excerpt":"ringkasan 2-3 kalimat santai","category":"Eropa","imageKeywords":"travel,destination,journey,local"}
Baris 2: garis pemisah persis seperti ini:
---BODY---
Baris 3 dst: isi artikel HTML lengkap (boleh multiline, tidak perlu di-escape)

imageKeywords: 3-5 kata bahasa Inggris dipisah koma. Category: nama benua/kawasan (Eropa, Asia, Timur Tengah, dll).`;

  let aiText: string;
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.75,
      max_tokens: 8192,
    });
    aiText = completion.choices[0]?.message?.content ?? "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Groq AI error: ${msg}` }, { status: 500 });
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

  // ── Resolve & mirror images ke Cloudinary ────────────────────────────────
  const rawImages = sourceUrl ? await fetchArticleImages(sourceUrl) : [];

  // Upload semua ke Cloudinary secara paralel (max 5)
  const cloudinaryImages = await Promise.all(
    rawImages.slice(0, 5).map((img) => mirrorToCloudinary(img))
  );

  let cover = (coverImage as string | undefined) ?? "";
  if (!cover && cloudinaryImages.length > 0) cover = cloudinaryImages[0];
  if (!cover && sourceUrl) {
    const og = await fetchOgImage(sourceUrl);
    cover = og ? await mirrorToCloudinary(og) : "";
  }
  if (!cover && parsed.imageKeywords) {
    const seed = parsed.title.length + parsed.title.charCodeAt(0);
    cover = `https://picsum.photos/seed/${seed}/1200/630`;
  }

  // Inject gambar (sudah Cloudinary) ke dalam body artikel
  parsed.body = injectImagesIntoBody(parsed.body, cloudinaryImages);

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
      status: "rewritten",
      blogId: blog.id,
    },
    update: { status: "rewritten", blogId: blog.id },
  });

  await logActivity({
    userId: session.user.id!,
    userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role,
    action: "CREATE",
    resource: "SCRAPER",
    resourceId: blog.id,
    resourceName: blog.title,
    detail: `Rewrite dari ${sourcePlatform}: ${originalTitle}`,
  });

  return NextResponse.json({ blog });
}
