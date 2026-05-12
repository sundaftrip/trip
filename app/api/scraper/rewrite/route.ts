import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import slugify from "slugify";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function estimateReadTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, "").split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} menit`;
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

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY belum diset di .env" }, { status: 500 });
  }

  const {
    sourceUrl,
    sourcePlatform,
    subreddit,
    originalTitle,
    originalBody,
    scrapedContentId,
  } = await req.json();

  if (!originalTitle || !originalBody) {
    return NextResponse.json({ error: "originalTitle dan originalBody diperlukan" }, { status: 400 });
  }

  const prompt = `Kamu adalah penulis blog perjalanan profesional untuk sundaftrip.com, sebuah website travel agency yang mengutamakan destinasi wisata internasional.

Tugas kamu: Rewrite cerita perjalanan berikut menjadi artikel blog dalam Bahasa Indonesia yang:
- Gaya: personal, hangat, inspiratif — seperti berbagi pengalaman dengan teman
- Bahasa: Indonesia yang mengalir natural, bukan terjemahan kaku
- SEO: sebutkan nama destinasi secara natural di awal, tengah, dan akhir artikel
- Struktur: paragraf pembuka yang menarik perhatian → isi cerita dengan detail → tips praktis → penutup yang menginspirasi
- Panjang: 600–900 kata
- Jangan menyebut sumber aslinya (Reddit, Facebook, dll)
- Tambahkan sentuhan lokal jika relevan (bandingkan dengan pengalaman wisatawan Indonesia)

Konten asli:
JUDUL: ${originalTitle}
ISI: ${originalBody}

Kembalikan HANYA JSON valid dengan format berikut (tidak ada teks lain di luar JSON):
{
  "title": "Judul artikel yang menarik dalam bahasa Indonesia (max 80 karakter)",
  "excerpt": "Ringkasan 1-2 kalimat yang menarik untuk preview (max 160 karakter)",
  "category": "Salah satu dari: Eropa, Asia, Amerika, Timur Tengah, Afrika, Oseania, Tips Travel",
  "body": "Konten artikel lengkap dalam format HTML sederhana (gunakan <p>, <h2>, <h3>, <strong>, <em>, <ul>, <li>)"
}`;

  let aiResponse: string;
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
    aiResponse = (message.content[0] as { type: string; text: string }).text;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `AI error: ${message}` }, { status: 500 });
  }

  let parsed: { title: string; excerpt: string; category: string; body: string };
  try {
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json(
      { error: "AI mengembalikan format yang tidak valid", raw: aiResponse },
      { status: 500 }
    );
  }

  const baseSlug = slugify(parsed.title, { lower: true, strict: true, locale: "id" });
  const slug = await generateUniqueSlug(baseSlug);
  const readTime = estimateReadTime(parsed.body);

  const blog = await prisma.blog.create({
    data: {
      slug,
      title: parsed.title,
      excerpt: parsed.excerpt,
      category: parsed.category,
      body: parsed.body,
      readTime,
      published: false,
      author: "Tim Sundaftrip",
    },
  });

  // Save or update ScrapedContent record
  if (scrapedContentId) {
    await prisma.scrapedContent.update({
      where: { id: scrapedContentId },
      data: { status: "rewritten", blogId: blog.id },
    });
  } else {
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
  }

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
