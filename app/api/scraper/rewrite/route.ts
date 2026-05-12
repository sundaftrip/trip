import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 60;
import slugify from "slugify";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "scraper_rewrite"))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY belum diset di .env.local" }, { status: 500 });
  }

  const { sourceUrl, sourcePlatform, subreddit, originalTitle, originalBody } = await req.json();

  if (!originalTitle || !originalBody) {
    return NextResponse.json({ error: "originalTitle dan originalBody diperlukan" }, { status: 400 });
  }

  // Strip HTML from body before sending to AI
  const cleanBody = originalBody
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();

  const prompt = `Kamu adalah penulis blog perjalanan profesional untuk sundaftrip.com, sebuah travel agency Indonesia yang fokus pada destinasi wisata internasional.

Tugas: Berdasarkan topik/judul berikut, tulis artikel blog Bahasa Indonesia yang menarik:
- Gaya: personal, hangat, inspiratif — seperti cerita dari teman yang baru pulang traveling
- SEO: sebutkan nama destinasi secara natural di awal, tengah, dan akhir
- Struktur: pembuka menarik → informasi/tips utama → tips praktis → penutup inspiratif
- Panjang: 600–900 kata
- Kembangkan sendiri berdasarkan pengetahuanmu tentang topik ini

Topik:
JUDUL: ${originalTitle}
INFO TAMBAHAN: ${cleanBody || originalTitle}

PENTING: Kembalikan HANYA JSON dengan format PERSIS seperti ini, gunakan single quote dalam HTML:
{"title":"judul artikel","excerpt":"ringkasan singkat","category":"Eropa","body":"<p>paragraf...</p><h2>subjudul</h2><p>isi...</p>"}

Pastikan body menggunakan single quote untuk atribut HTML agar JSON tetap valid.`;

  let aiText: string;
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    });
    aiText = completion.choices[0]?.message?.content ?? "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Groq AI error: ${msg}` }, { status: 500 });
  }

  let parsed: { title: string; excerpt: string; category: string; body: string };
  try {
    const cleaned = aiText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    let jsonStr = jsonMatch[0];
    // Fix common AI JSON mistakes: unescaped double quotes inside string values
    // Extract body field separately since it may contain HTML with quotes
    const bodyMatch = jsonStr.match(/"body"\s*:\s*"([\s\S]*?)"\s*\}/);
    let bodyContent = "";
    if (bodyMatch) {
      bodyContent = bodyMatch[1];
      // Remove body from jsonStr, parse the rest, then add body back
      jsonStr = jsonStr.replace(/"body"\s*:\s*"[\s\S]*?"\s*\}/, '"body":"__BODY__"}');
    }

    parsed = JSON.parse(jsonStr);
    if (bodyContent) parsed.body = bodyContent.replace(/\\n/g, "\n").replace(/\\"/g, '"');
    if (!parsed.body) parsed.body = `<p>${cleanBody || originalTitle}</p>`;
  } catch {
    // Last resort: try to extract fields with regex
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

  const baseSlug = slugify(parsed.title, { lower: true, strict: true, locale: "id" });
  const slug = await generateUniqueSlug(baseSlug);

  const blog = await prisma.blog.create({
    data: {
      slug,
      title: parsed.title,
      excerpt: parsed.excerpt,
      category: parsed.category,
      body: parsed.body,
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
