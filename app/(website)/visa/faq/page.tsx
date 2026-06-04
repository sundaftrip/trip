import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ChevronLeft, MessageCircle } from "lucide-react";
import { FaqList, type FaqItem } from "./FaqList";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import { prisma } from "@/lib/prisma";

export const revalidate = 300; // segarkan tiap 5 menit setelah edit di CMS

export const metadata: Metadata = {
  title: "FAQ Teknis Visa Schengen untuk Paspor Indonesia",
  description:
    "Kasus teknis Schengen yang sering bikin reject: cerai, anak di bawah 18, apostille Spanyol, sponsor pasangan, rekening kecil, apply dari negara lain.",
  alternates: { canonical: "https://sundaftrip.com/visa/faq" },
};

/* Konfigurasi tampilan per-seksi. `db` = nilai kolom Faq.section (group "visa").
   Konten Q&A dikelola di CMS (admin → FAQ, grup Visa). */
const SECTIONS: {
  db: string;
  title: string;
  sub: string;
  id?: string;
  inlinePreview?: boolean;
  schema?: boolean;
}[] = [
  { db: "Teknis Schengen", title: "Schengen: Kasus Teknis", sub: "Pertanyaan paling sering ditanya calon pemohon dengan profil non-standar.", schema: true },
  { db: "Profil Non-Standar", title: "Profil Pemohon Non-Standar", sub: "Bukan karyawan kantoran tetap dengan slip gaji bulanan, bagaimana memposisikan profil di mata officer.", schema: true },
  { db: "Paspor & Riwayat", title: "Paspor & Riwayat Visa", sub: "Hal teknis seputar dokumen perjalanan dan jejak aplikasi visa sebelumnya yang sering terlewat.", schema: true },
  { db: "Dokumen Sensitif", title: "Dokumen & Finansial Sensitif", sub: "Inkonsistensi kecil yang bisa memicu pertanyaan tambahan atau penolakan, dan cara meresponsnya dengan benar.", schema: true },
  { db: "Kasus Reject", title: "Visa Ditolak: Strategi Apply Ulang", sub: "Kasus nyata yang masuk ke kami, dibahas tanpa basa-basi. Reject pernah terjadi bukan akhir cerita, tapi cara menanganinya menentukan apply berikutnya.", schema: true },
  { db: "Pengurusan Visa via Sundaf", title: "Pengurusan Visa via Sundaf", sub: "Apa saja yang kami tangani dari hulu ke hilir, plus layanan pendukung (asuransi, apostille, terjemahan, notaris) yang kami koordinasikan untuk klien pengurusan visa kami.", id: "layanan-pendukung", inlinePreview: false, schema: false },
  { db: "Dokumen Pendukung Umum", title: "Dokumen Pendukung Umum", sub: "Berlaku untuk hampir semua aplikasi visa turis, Schengen, UK, Australia, NZ, Jepang, Korea.", schema: true },
];
// Catatan: seksi "Umum" disimpan di DB dengan section "Umum".
const DB_ALIAS: Record<string, string> = { "Dokumen Pendukung Umum": "Umum" };

type Row = { question: string; answer: string; service: string | null };

function toItem(row: Row): FaqItem {
  return {
    q: row.question,
    a: <div className="space-y-3" dangerouslySetInnerHTML={{ __html: row.answer }} />,
    layanan: row.service === null ? undefined : row.service === "__NONE__" ? null : row.service,
  };
}

function htmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

export default async function VisaFaqPage() {
  let rows: (Row & { section: string; order: number })[] = [];
  try {
    rows = await prisma.faq.findMany({
      where: { group: "visa", active: true },
      orderBy: [{ order: "asc" }],
      select: { section: true, question: true, answer: true, service: true, order: true },
    });
  } catch {
    rows = [];
  }

  const bySection = (db: string) => rows.filter((r) => r.section === (DB_ALIAS[db] ?? db));

  // FAQPage JSON-LD (kecuali seksi promosi) — bantu AI & Google AI Overviews.
  const schemaItems = SECTIONS.filter((s) => s.schema).flatMap((s) =>
    bySection(s.db).map((r) => ({
      "@type": "Question" as const,
      name: r.question,
      acceptedAnswer: { "@type": "Answer" as const, text: htmlToText(r.answer) },
    })),
  );
  const VISA_FAQ_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://sundaftrip.com/visa/faq#faqpage",
    inLanguage: "id-ID",
    mainEntity: schemaItems,
  };

  return (
    <div className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-950">
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Info Visa", url: "/visa" },
          { name: "FAQ Teknis Visa", url: "/visa/faq" },
        ]}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(VISA_FAQ_SCHEMA) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <Link
          href="/visa"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
        >
          <ChevronLeft size={14} />
          Kembali ke Database Visa
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <HelpCircle size={20} style={{ color: "var(--site-accent-ink,#2d6a4f)" }} />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            FAQ Teknis Visa
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Kasus Teknis yang Sering Bikin Reject
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
          Jawaban praktis untuk situasi yang tidak ada di checklist standar
          kedutaan, dari status cerai, anak di bawah 18, sampai strategi apply
          ulang setelah visa ditolak.
        </p>

        {SECTIONS.map((sec) => {
          const items = bySection(sec.db).map(toItem);
          if (items.length === 0) return null;
          return (
            <section key={sec.db} id={sec.id} className={`mb-12${sec.id ? " scroll-mt-24" : ""}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-1.5 h-5 rounded-full" style={{ background: "var(--site-accent-ink,#2d6a4f)" }} />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{sec.title}</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{sec.sub}</p>
              <FaqList items={items} showInlinePreview={sec.inlinePreview ?? true} />
            </section>
          );
        })}

        <div
          className="mb-12 p-6 sm:p-8 border"
          style={{
            background: "color-mix(in srgb, var(--site-accent-ink,#2d6a4f) 8%, transparent)",
            borderColor: "color-mix(in srgb, var(--site-accent-ink,#2d6a4f) 25%, transparent)",
          }}
        >
          <div className="flex items-start gap-3 mb-3">
            <MessageCircle size={20} className="shrink-0 mt-0.5" style={{ color: "var(--site-accent-ink,#2d6a4f)" }} />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                Punya kasus yang tidak ada di sini?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Profil borderline, pernah reject, atau dokumen tidak standar,
                setiap kasus punya konteks sendiri yang tidak bisa di-template.
                Konsultasi awal gratis lewat WhatsApp di pojok kanan bawah.
                Cerita kondisi kamu, kami bantu tentukan apakah kasusnya butuh
                pengurusan visa lengkap, atau cukup panduan mandiri yang sudah
                ada di FAQ ini.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Disclaimer
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Informasi di halaman ini bersifat panduan praktis berdasarkan
            pengalaman lapangan. Aturan kedutaan bisa berubah tanpa pemberitahuan.
            Selalu cek persyaratan resmi di situs VFS/BLS atau kedutaan negara
            tujuan sebelum submit.
          </p>
        </div>
      </div>

      {/* Buka details Layanan Pendukung saat di-anchor dari FAQ lain */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              function openLayanan(){
                var section = document.getElementById('layanan-pendukung');
                if(!section) return;
                var d = section.querySelector('details');
                if(d) d.open = true;
                section.scrollIntoView({behavior:'smooth', block:'start'});
              }
              document.addEventListener('click', function(e){
                var t = e.target;
                while(t && t !== document){
                  if(t.tagName === 'A' && t.getAttribute('href') === '#layanan-pendukung'){
                    e.preventDefault();
                    if(history.pushState) history.pushState(null, '', '#layanan-pendukung');
                    setTimeout(openLayanan, 10);
                    return;
                  }
                  t = t.parentNode;
                }
              });
              if(location.hash === '#layanan-pendukung'){
                window.addEventListener('load', function(){ setTimeout(openLayanan, 50); });
              }
            })();
          `,
        }}
      />
    </div>
  );
}
