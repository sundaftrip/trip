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

  const prompt = `Kamu adalah traveler Indonesia yang suka jalan-jalan dan nulis pengalaman di blog pribadi. Bukan jurnalis, bukan copywriter — cuma orang biasa yang cerita perjalanan.

Tugas: Tulis artikel blog perjalanan dalam Bahasa Indonesia, gaya cerita personal, 800–1500 kata.

Gaya penulisan:
- Sudut pandang orang pertama: "saya" atau "aku" (boleh campur, konsisten per paragraf)
- Nada santai, personal, sedikit spontan — seperti cerita di forum travel atau blog pribadi
- Jangan terlalu rapi atau terlalu formal
- Boleh ada kalimat agak panjang, pengulangan kata kecil, atau frasa sehari-hari
- Hindari gaya puitis, marketing, atau terlalu sempurna
- Jangan terdengar seperti brosur wisata atau artikel media
- Masukkan opini pribadi sederhana: "orang-orangnya ramah", "cukup aman", "lumayan capek tapi worth it", "hotel ini sederhana tapi nyaman"
- Ceritakan perjalanan secara kronologis dari datang sampai pulang
- Sertakan detail praktis secara natural: transportasi, hotel, SIM card, harga, aplikasi, kondisi jalan, keamanan, guide lokal
- Jangan terlalu banyak kata sifat berlebihan

Contoh kalimat yang tepat:
- "Saya cuma 2 malam di kota ini"
- "ternyata lebih aman dari yang saya bayangkan"
- "saya pakai SIM card lokal dan cukup lancar"
- "jalanannya kadang bagus kadang rusak"
- "lebih enak bawa cash dibanding kartu"
- "overall saya cukup suka dengan negara ini"

Struktur (gunakan heading HTML):
1. <p> Pembukaan singkat — konteks perjalanan, kenapa ke sini
2. <h2> Kedatangan dan First Impression
3. <h2> Perjalanan Harian — cerita kronologis tempat dan aktivitas
4. <h2> Transportasi dan Akomodasi — pengalaman nyata, nama hotel/aplikasi boleh disebut
5. <h2> Tips Praktis — minimal 5 tips dalam <ul><li>, gaya personal bukan formal
6. <h2> Kesimpulan — jujur, singkat, apakah worth it atau tidak

Info praktis yang WAJIB ada secara natural di dalam cerita:
- Transportasi dari Indonesia (flight, transit)
- Visa atau bebas visa
- SIM card / internet
- Budget kasar dalam Rupiah
- Waktu terbaik kunjungan
- Keamanan dan tips lokal

Topik:
JUDUL / PENGALAMAN: ${originalTitle}
DETAIL PERJALANAN (gunakan sebagai bahan, jangan copy-paste):
${sourceContent || originalTitle}

PENTING: Kembalikan HANYA JSON dengan format PERSIS seperti ini:
{"title":"judul artikel natural seperti judul blog pribadi","excerpt":"ringkasan 1-2 kalimat gaya santai","category":"Eropa","imageKeywords":"travel,destination,journey,local","body":"<p>...</p><h2>...</h2><ul><li>...</li></ul>..."}

imageKeywords: 3-5 kata bahasa Inggris dipisah koma.`;

  let aiText: string;
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.75,
      max_tokens: 4096,
    });
    aiText = completion.choices[0]?.message?.content ?? "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Groq AI error: ${msg}` }, { status: 500 });
  }

  let parsed: { title: string; excerpt: string; category: string; body: string; imageKeywords?: string };
  try {
    const cleaned = aiText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    let jsonStr = jsonMatch[0];
    const bodyMatch = jsonStr.match(/"body"\s*:\s*"([\s\S]*?)"\s*\}/);
    let bodyContent = "";
    if (bodyMatch) {
      bodyContent = bodyMatch[1];
      jsonStr = jsonStr.replace(/"body"\s*:\s*"[\s\S]*?"\s*\}/, '"body":"__BODY__"}');
    }

    parsed = JSON.parse(jsonStr);
    if (bodyContent) parsed.body = bodyContent.replace(/\\n/g, "\n").replace(/\\"/g, '"');
    if (!parsed.body) parsed.body = `<p>${cleanBody || originalTitle}</p>`;
  } catch {
    try {
      const title = aiText.match(/"title"\s*:\s*"([^"]+)"/)?.[1] ?? originalTitle;
      const excerpt = aiText.match(/"excerpt"\s*:\s*"([^"]+)"/)?.[1] ?? "";
      const category = aiText.match(/"category"\s*:\s*"([^"]+)"/)?.[1] ?? "Tips Travel";
      parsed = { title, excerpt, category, body: `<p>${cleanBody || originalTitle}</p>` };
    } catch {
      return NextResponse.json(
        { error: "AI mengembalikan format tidak valid", raw: aiText.slice(0, 500) },
        { status: 500 }
      );
    }
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
