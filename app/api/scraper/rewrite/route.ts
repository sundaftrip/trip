import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import slugify from "slugify";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

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

  const prompt = `Kamu adalah travel blogger Indonesia gaul yang nulis buat sundaftrip.com. Gaya nulis lo santai, jujur, kadang lebay dikit — tapi tetap informatif dan bikin orang pengen langsung booking.

Tugas: Tulis artikel blog Bahasa Indonesia yang PANJANG dan ASIK DIBACA (1200–1800 kata).

Gaya bahasa:
- Pakai "gue/gw" bukan "saya", "lo" bukan "kamu" — tapi jangan berlebihan, selang-seling aja
- Boleh sesekali pakai: wkwk, weleh, aslik, anjir (versi halus: anjay), literally, vibes, worth it, next level
- Cerita kayak lagi ngobrol sama temen, bukan presentasi
- Gunakan detail sensoris: bau, suara, rasa makanan, suhu udara, tekstur jalanan
- Sisipkan reaksi jujur: "gue sempet culture shock pas...", "yang bikin gue speechless tuh..."
- Sesekali bercanda atau lebay — tapi tetap ada info berguna di baliknya
- Hindari kalimat kaku seperti "destinasi yang menakjubkan" atau "pemandangan yang indah"

Struktur WAJIB (gunakan heading HTML):
1. <p> Opening hook — buka dengan situasi atau reaksi yang relatable, jangan langsung sebut nama destinasi
2. <h2> Kenapa [Destinasi] Beda dari yang Lo Bayangin — fakta unik yang bikin penasaran (2-3 paragraf)
3. <h2> Momen-Momen yang Bakal Lo Ceritain ke Semua Orang — 3 sub-bagian dengan <h3>, tiap sub 2 paragraf
4. <h2> Tips Biar Perjalanan Lo Nggak Berantakan — min. 6 tips spesifik dalam <ul><li>, gaya casual
5. <h2> Makanan & Budaya Lokal yang Wajib Lo Coba — jujur soal rasa, kebiasaan warga, hal aneh tapi seru
6. <h2> Info Penting buat Traveler dari Indonesia — flight dari Jakarta/Surabaya, perlu visa atau bebas visa, waktu terbaik berangkat, durasi ideal, estimasi budget kasar dalam Rupiah
7. <p> Penutup — tutup dengan kalimat yang bikin pembaca langsung pengen cek harga tiket

SEO: Sebut nama destinasi minimal 8× secara natural.

Topik:
JUDUL: ${originalTitle}
ISI ARTIKEL ASLI (rewrite ini, jangan copy-paste):
${sourceContent || originalTitle}

PENTING: Kembalikan HANYA JSON dengan format PERSIS seperti ini, gunakan single quote untuk atribut HTML:
{"title":"judul artikel menarik","excerpt":"ringkasan 1-2 kalimat","category":"Eropa","imageKeywords":"travel,russia,city,culture","body":"<p>...</p><h2>...</h2><h3>...</h3><ul><li>...</li></ul>..."}

imageKeywords: 3-5 kata bahasa Inggris dipisah koma, cocok untuk mencari foto artikel ini.`;

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

  // ── Resolve cover image ──────────────────────────────────────────────────
  let cover = (coverImage as string | undefined) ?? "";

  if (!cover && sourceUrl) {
    cover = await fetchOgImage(sourceUrl);
  }

  if (!cover && parsed.imageKeywords) {
    // Picsum with a seed derived from title so same article always gets same photo
    const seed = parsed.title.length + parsed.title.charCodeAt(0);
    cover = `https://picsum.photos/seed/${seed}/1200/630`;
  }

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
