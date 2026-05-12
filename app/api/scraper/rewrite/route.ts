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

  const prompt = `Kamu adalah penulis blog perjalanan profesional untuk sundaftrip.com, travel agency Indonesia yang fokus pada destinasi wisata internasional.

Tugas: Tulis artikel blog Bahasa Indonesia yang PANJANG, MENDALAM, dan MENARIK (1200–1800 kata).

Panduan gaya:
- Personal dan hangat — seperti cerita teman yang baru pulang traveling
- Gunakan detail sensoris: aroma, suara, pemandangan, rasa makanan, suhu udara
- Sisipkan fakta menarik yang tidak umum diketahui
- Ajak pembaca membayangkan diri mereka di sana
- Hindari kalimat klise seperti "destinasi yang menakjubkan" atau "pemandangan yang indah"
- Gunakan humor ringan dan anekdot kecil untuk menghidupkan cerita

Struktur WAJIB (gunakan heading HTML):
1. <p> Opening hook — 1 paragraf pembuka yang langsung menarik, jangan mulai dengan nama destinasi
2. <h2> Mengapa [Destinasi] Berbeda dari yang Kamu Bayangkan — latar belakang & daya tarik unik (2-3 paragraf)
3. <h2> Pengalaman yang Akan Kamu Ceritakan Seumur Hidup — 3 sub-bagian masing-masing dengan <h3> (tiap sub-bagian 2 paragraf)
4. <h2> Tips Praktis Agar Perjalananmu Lancar — min. 6 tips spesifik dalam <ul><li>
5. <h2> Kuliner & Budaya yang Wajib Kamu Cicipi — makanan lokal, tradisi unik, kebiasaan penduduk (2 paragraf)
6. <h2> Rencanakan Perjalananmu Sekarang — waktu terbaik berkunjung, durasi ideal, estimasi budget kasar
7. <p> Penutup — 1 paragraf inspiratif yang mengajak pembaca untuk segera mewujudkan impian

SEO: Sebut nama destinasi minimal 8 kali secara natural di seluruh artikel.

Topik:
JUDUL: ${originalTitle}
INFO TAMBAHAN: ${cleanBody || originalTitle}

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
