import { withPageSocialMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "@/components/website/clean/PreserveScrollLink";
import { ChevronLeft } from "lucide-react";
import { FaqList, type FaqItem } from "./FaqList";
import doc from "@/components/website/clean/DocFormat.module.css";
import styles from "./VisaFaqDoc.module.css";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import { prisma } from "@/lib/prisma";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";
import { serializeJsonLd } from "@/lib/safe-json-ld";

export const revalidate = 300; // segarkan tiap 5 menit setelah edit di CMS

export const metadata: Metadata = withPageSocialMetadata({
  title: "FAQ Teknis Visa Schengen untuk Paspor Indonesia",
  description:
    "Kasus teknis Schengen yang sering bikin reject: cerai, anak di bawah 18, apostille Spanyol, sponsor pasangan, rekening kecil, apply dari negara lain.",
  alternates: { canonical: "https://sundaftrip.com/visa/faq" },
});

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
    a: <div className="space-y-3" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(row.answer) }} />,
    layanan: row.service === null ? undefined : row.service === "__NONE__" ? null : row.service,
  };
}

function htmlToText(html: string): string {
  return sanitizeRichHtml(html)
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
    <div className={styles.page}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Info Visa", url: "/visa" },
          { name: "FAQ Teknis Visa", url: "/visa/faq" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(VISA_FAQ_SCHEMA) }}
      />
      <div className={styles.shell}>
        <Link href="/visa" className={styles.back}>
          <ChevronLeft size={14} aria-hidden="true" />
          Kembali ke Database Visa
        </Link>

        <p className={doc.eyebrow}>FAQ teknis visa / Sundaf Trip</p>
        <h1 className={`${doc.title} ${styles.title}`}>
          Kasus Teknis yang Sering Bikin Reject
        </h1>
        <p className={styles.lede}>
          Jawaban praktis untuk situasi yang tidak ada di checklist standar
          kedutaan, dari status cerai, anak di bawah 18, sampai strategi apply
          ulang setelah visa ditolak.
        </p>

        {SECTIONS.map((sec) => {
          const items = bySection(sec.db).map(toItem);
          if (items.length === 0) return null;
          return (
            <section key={sec.db} id={sec.id} className={styles.section}>
              <h2 className={doc.tag}>{sec.title}</h2>
              <p className={styles.sectionNote}>{sec.sub}</p>
              <FaqList items={items} showInlinePreview={sec.inlinePreview ?? true} />
            </section>
          );
        })}

        <div className={`${doc.boxSage} ${styles.box}`}>
          <div>
            <div>
              <h3 className={styles.boxTitle}>
                Punya kasus yang tidak ada di sini?
              </h3>
              <p>
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

        <div className={`${doc.boxSand} ${styles.box}`}>
          <p className={doc.subhead}>
            Disclaimer
          </p>
          <p>
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
