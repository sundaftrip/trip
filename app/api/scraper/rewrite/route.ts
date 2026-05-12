import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
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

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY belum diset di environment variables" }, { status: 500 });
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

  const prompt = `Kamu adalah traveler Indonesia yang pernah mengunjungi tempat ini dan sekarang nulis cerita di blog pribadi sundaftrip.com.

PERAN KAMU: Kamu SUDAH pergi ke tempat ini. Ceritakan pengalamanmu sendiri. Kalau ada detail yang perlu dikarang (nama hotel, nama restoran, percakapan, harga), karang yang masuk akal dan spesifik. JANGAN tulis hal-hal generik.

LARANGAN KERAS: Jangan gunakan tanda "—" (em dash) sama sekali. Manusia Indonesia tidak nulis pakai tanda itu. Ganti dengan koma, titik, atau kalimat baru.

═══ PERBEDAAN TULISAN BAGUS VS JELEK ═══

JELEK ❌ — generik, tidak ada scene, bisa ditulis siapa saja tanpa pernah ke sana:
"Saya mengunjungi tempat ini dan sangat terpesona oleh keindahannya. Ada banyak hal menarik yang bisa dilihat. Tips: bawa kamera dan uang yang cukup."

BAGUS ✅ — ada scene konkret, detail yang hanya muncul kalau kamu benar-benar di sana:
"Saya hampir melewatkan penginapan saya malam itu. Google Maps kasih alamat yang beda sama yang tertera di booking.com, dan driver GoJek saya — namanya Pak Hendra — ikut bingung. Kami muter-muter 20 menit di gang sempit sebelum akhirnya ketemu papan nama 'Losmen Bu Yati' yang nyempil di balik warung. Kamarnya Rp 180.000 semalam. Kipas angin, tidak ada AC, tapi bersih dan Bu Yati masakin nasi goreng tiap pagi."

JELEK ❌ — tips klise:
"Pastikan membawa paspor. Lakukan riset sebelum berangkat. Bawa uang yang cukup."

BAGUS ✅ — tips dari kejadian nyata:
"Jangan percaya Google Maps untuk kawasan medina di Fez — alamatnya tidak akurat dan gang-gangnya tidak ada di peta. Screenshot titik koordinat losmen kamu dan kasih ke driver sebelum berangkat. Saya buang 45 menit dan Rp 50.000 lebih karena tidak tahu ini."

═══ CONTOH ARTIKEL YANG GAYA DAN PANJANGNYA HARUS KAMU TIRU ═══
Ini contoh artikel tentang kehilangan paspor di Barcelona — perhatikan level detail, waktu spesifik, karakter pendukung, dan emosi yang natural:

Pickpocket di Barcelona nyolong pasporku 6 jam sebelum jadwal keberangkatan.
Hari terakhir di Barcelona, aku simpen paspor di kantong depan celana — bodoh memang, tapi aku nggak mau ninggalin di loker hostel. Tangan aku pegang terus, sampai ada 5 menit naik metro, kaki pegal, pikiran melayang. Waktu nyadar, sudah terlambat.
Kami sprint balik ke hostel — siapa tahu ketinggalan di sana. Jam 12 siang, 6 jam sebelum bus ke Madrid. Telepon konsulat: nggak ada yang angkat. Mungkin tidur siang. Baru nyambung jam 2, dan petugas pertama malah marahin aku. Sialan. Untungnya petugas kedua lebih berguna: "Ke sini 30 menit lagi, kami bisa buatkan paspor darurat."
Kami setop taksi, kasih alamat, langsung terjebak macet. Sampai di gerbang — konsulat sudah tutup, penjaga suruh kami pergi. Aku punya satu kartu: nama dan nomor HP petugas yang tadi telepon. "Tolong hubungi dia." Penjaga telepon, berdebat dalam Spanyol, lalu: "Masuk."
Jam 3.30. Di ruang tunggu ada pasangan tua yang semua bagasinya dicuri keluar bandara. Si kakek kejar pencopet, jatuh, patah tangan. Lalu kakek itu tiba-tiba berhenti merespons — matanya kebalik, istrinya menangis. Aku minta staf panggil ambulans. Lima menit kemudian kakek sadar, ambulans datang. Mereka pergi ke rumah sakit.
Jam 4 lewat, namaku dipanggil. Bayar $100 (Rp 1,6 juta), paspor darurat di tangan. Kami bebas.

Perhatikan: hook langsung di kalimat pertama, waktu spesifik (jam 12, jam 2, jam 3.30), kesalahan diakui ("bodoh memang"), karakter nyata dengan nama (Pak Hendra, penjaga, petugas), momen tak terduga (kakek pingsan), harga disebutkan natural.

═══ SEKARANG TUGASMU ═══
Tulis artikel blog tentang: ${originalTitle}

Gunakan fakta dari bahan referensi ini sebagai dasar, lalu KEMBANGKAN dengan detail cerita personal yang konkret:
${sourceContent || originalTitle}

Target: 1500-2000 kata. Minimal 5 paragraf panjang. Setiap klaim harus spesifik — bukan "beberapa hari" tapi "3 hari"; bukan "cukup mahal" tapi "sekitar Rp 450.000 per malam"; bukan "naik transportasi umum" tapi "naik metro lini 4, turun di Stasiun Bastille".

STRUKTUR:
<p>[Hook — 1 kalimat langsung ke inti atau momen paling menarik]</p>
<p>[Konteks: kenapa pergi, dari mana, dengan siapa, kapan]</p>
<h2>[Judul bagian yang kontekstual]</h2>
<p>[isi panjang dengan scene konkret]</p>
<p>[lanjutan]</p>
<h2>[Judul bagian berikutnya]</h2>
<p>[isi panjang]</p>
<h2>[Judul bagian lagi]</h2>
<p>[isi panjang]</p>
<h2>Tips Dari Pengalaman Langsung (Bukan dari Internet)</h2>
<ul>
<li>[tip spesifik dari kejadian nyata — minimal 6 tips]</li>
</ul>
<h2>[Kesimpulan jujur]</h2>
<p>[worth it atau tidak, siapa yang cocok ke sini, kapan waktu terbaik]</p>

FORMAT OUTPUT (ikuti persis, jangan tambah teks lain di luar ini):
{"title":"judul artikel menarik dan natural","excerpt":"2-3 kalimat santai yang bikin orang penasaran untuk baca","category":"Eropa","imageKeywords":"travel,city,adventure,local"}
---BODY---
<p>isi artikel HTML di sini</p>`;

  let aiText: string;
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });
    aiText = message.content[0].type === "text" ? message.content[0].text : "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Claude AI error: ${msg}` }, { status: 500 });
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
