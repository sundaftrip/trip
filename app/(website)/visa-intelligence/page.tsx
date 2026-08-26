import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarCheck2,
  Database,
  ExternalLink,
  FileJson,
  MessageCircle,
  MessagesSquare,
  Radio,
  ShieldCheck,
} from "lucide-react";

import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import { serializeJsonLd } from "@/lib/safe-json-ld";
import {
  VISA_INTELLIGENCE_CANONICAL_URL,
  VISA_INTELLIGENCE_JSON_URL,
  VISA_INTELLIGENCE_RSS_URL,
} from "@/lib/visa-intelligence";
import { loadVisaDiscussionPublicState } from "@/lib/visa-discussions";
import { loadVisaIntelligencePageData } from "@/lib/visa-intelligence-server";
import { buildWhatsAppHref } from "@/lib/utils";
import VisaDiscussion from "./VisaDiscussion";
import styles from "./VisaIntelligence.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Visa Intelligence untuk Paspor Indonesia",
  description:
    "Snapshot status visa dalam database Sundaf Trip untuk paspor Indonesia, dengan rujukan tersimpan, batasan data, serta akses JSON dan RSS.",
  alternates: { canonical: VISA_INTELLIGENCE_CANONICAL_URL },
  openGraph: {
    title: "Sundaf Visa Intelligence",
    description:
      "Snapshot database visa untuk pemegang paspor biasa Indonesia—transparan tentang sumber, tanggal cek, dan keterbatasannya.",
    url: VISA_INTELLIGENCE_CANONICAL_URL,
    type: "website",
  },
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function displayDate(value: string | null) {
  if (!value) return "Belum tercatat";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? dateFormatter.format(date) : "Belum tercatat";
}

export default async function VisaIntelligencePage() {
  const [{ dataset, whatsapp }, discussionState] = await Promise.all([
    loadVisaIntelligencePageData(),
    loadVisaDiscussionPublicState(),
  ]);
  const correctionHref = buildWhatsAppHref(
    whatsapp,
    "Halo Sundaf Trip, saya menemukan data di Visa Intelligence yang perlu diperiksa atau dikoreksi.",
  );
  const consultationHref = buildWhatsAppHref(
    whatsapp,
    "Halo Sundaf Trip, saya membaca Visa Intelligence dan ingin memastikan persyaratan visa untuk perjalanan saya.",
  );
  const recentRecords = dataset.records.slice(0, 12);
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${VISA_INTELLIGENCE_CANONICAL_URL}#dataset`,
    name: "Sundaf Visa Intelligence",
    description:
      "Current-status snapshot from the Sundaf Trip visa database for Indonesian ordinary-passport holders. Stored source links require independent verification.",
    url: VISA_INTELLIGENCE_CANONICAL_URL,
    inLanguage: "id-ID",
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      "@id": "https://sundaftrip.com#organization",
      name: "Sundaf Trip",
      url: "https://sundaftrip.com",
    },
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: VISA_INTELLIGENCE_JSON_URL,
      },
      {
        "@type": "DataDownload",
        encodingFormat: "application/rss+xml",
        contentUrl: VISA_INTELLIGENCE_RSS_URL,
      },
    ],
  };

  return (
    <div className={styles.page}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Info Visa", url: "/visa" },
          { name: "Visa Intelligence", url: "/visa-intelligence" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(datasetSchema) }}
      />

      <section className={styles.hero} aria-labelledby="visa-intelligence-title">
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Sundaf Visa Intelligence</p>
            <h1 className={styles.heroTitle} id="visa-intelligence-title">
              Status visa, dengan batas data yang terlihat.
            </h1>
            <p className={styles.heroLede}>
              Snapshot database Sundaf Trip untuk pemegang paspor biasa Indonesia.
              Setiap record memisahkan status tercatat, tanggal pemeriksaan internal,
              dan rujukan yang masih perlu diverifikasi sebelum perjalanan.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#snapshot-terkini">
                <Database size={17} aria-hidden="true" />
                Lihat snapshot
              </a>
              <Link
                className={styles.secondaryAction}
                href="/visa-intelligence/data.json"
                data-analytics-event="visa_intelligence_feed_click"
                data-analytics-format="json"
                data-analytics-placement="visa_intelligence_hero"
              >
                <FileJson size={17} aria-hidden="true" />
                Buka JSON
              </Link>
              <Link
                className={styles.secondaryAction}
                href="/visa-intelligence/feed.xml"
                data-analytics-event="visa_intelligence_feed_click"
                data-analytics-format="rss"
                data-analytics-placement="visa_intelligence_hero"
              >
                <Radio size={17} aria-hidden="true" />
                Ikuti RSS
              </Link>
              <a className={styles.secondaryAction} href="#diskusi-visa">
                <MessagesSquare size={17} aria-hidden="true" />
                Diskusi visa
              </a>
            </div>
          </div>

          <aside className={styles.trustPanel} aria-label="Batasan utama dataset">
            <div className={styles.trustIcon}>
              <ShieldCheck size={23} aria-hidden="true" />
            </div>
            <p className={styles.trustKicker}>Label data yang jujur</p>
            <h2>Bukan log perubahan resmi.</h2>
            <p>
              Pembaruan database tidak membuktikan bahwa pemerintah baru saja mengubah
              aturan. Tanggal cek juga bukan tanggal efektif kebijakan.
            </p>
            <a href="#metodologi" className={styles.inlineLink}>
              Baca metodologi <ArrowRight size={15} aria-hidden="true" />
            </a>
          </aside>
        </div>
      </section>

      <section className={styles.statsBand} aria-label="Ringkasan cakupan dataset">
        <div className={`${styles.shell} ${styles.statsGrid}`}>
          <div className={styles.statCard}>
            <span>{dataset.summary.record_count}</span>
            <p>negara tercatat</p>
          </div>
          <div className={styles.statCard}>
            <span>{dataset.summary.records_with_source}</span>
            <p>record dengan rujukan tersimpan</p>
          </div>
          <div className={styles.statCard}>
            <span>{dataset.summary.records_with_check_date}</span>
            <p>record dengan tanggal cek</p>
          </div>
          <div className={styles.statCard}>
            <span className={styles.dateValue}>
              {displayDate(dataset.summary.latest_checked_at)}
            </span>
            <p>tanggal cek terbaru di dataset</p>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <section className={styles.section} id="snapshot-terkini" aria-labelledby="snapshot-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>Snapshot terkini</p>
                <h2 className={styles.sectionTitle} id="snapshot-title">
                  Record yang paling baru diperiksa atau diperbarui
                </h2>
              </div>
              <p className={styles.sectionIntro}>
                Urutan memakai tanggal pemeriksaan internal bila tersedia, lalu tanggal
                pembaruan database. Ini bukan urutan perubahan kebijakan pemerintah.
              </p>
            </div>

            {recentRecords.length > 0 ? (
              <div className={styles.recordsGrid}>
                {recentRecords.map((record) => (
                  <article className={styles.recordCard} key={record.record_id}>
                    <div className={styles.recordTop}>
                      <div className={styles.countryIdentity}>
                        <span className={styles.flag} aria-hidden="true">
                          {record.country.flag}
                        </span>
                        <div>
                          <h3>{record.country.name_id}</h3>
                          <p>{record.country.region}</p>
                        </div>
                      </div>
                      <span className={styles.statusBadge}>{record.visa_status.label_id}</span>
                    </div>

                    <dl className={styles.recordFacts}>
                      <div>
                        <dt>Masa tinggal tercatat</dt>
                        <dd>{record.maximum_stay ?? "Tidak disebutkan"}</dd>
                      </div>
                      <div>
                        <dt>Terakhir diperiksa</dt>
                        <dd>{displayDate(record.last_checked_at)}</dd>
                      </div>
                    </dl>

                    {record.notes && <p className={styles.recordNotes}>{record.notes}</p>}

                    <div className={styles.recordActions}>
                      <Link href={record.detail_url.replace("https://sundaftrip.com", "")}>
                        Detail negara <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                      {record.source ? (
                        <a
                          href={record.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-analytics-event="visa_intelligence_source_click"
                          data-analytics-record-id={record.record_id}
                          data-analytics-placement="visa_intelligence_record"
                        >
                          Rujukan tersimpan <ExternalLink size={13} aria-hidden="true" />
                          <span className="sr-only">, membuka tab baru</span>
                        </a>
                      ) : (
                        <span>Rujukan belum tersimpan</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Database size={24} aria-hidden="true" />
                <p>Belum ada record yang dapat ditampilkan.</p>
              </div>
            )}

            <div className={styles.directoryLink}>
              <Link href="/visa">
                Cari seluruh database visa <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.discussionSection} id="diskusi-visa" aria-labelledby="discussion-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>Ruang diskusi visa</p>
                <h2 className={styles.sectionTitle} id="discussion-title">
                  Ada konteks yang tidak tertulis di tabel?
                </h2>
              </div>
              <p className={styles.sectionIntro}>
                Ceritakan masalah visa yang kamu hadapi. Komunitas dapat berbagi pengalaman,
                sementara Tim Sundaf membantu membedakan pengalaman pribadi dari informasi
                yang masih perlu diverifikasi.
              </p>
            </div>
            <VisaDiscussion
              state={discussionState}
              countries={dataset.records.map((record) => record.country.name_id)}
            />
          </div>
        </section>

        <section className={styles.methodSection} id="metodologi" aria-labelledby="method-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>Metodologi dan batasan</p>
                <h2 className={styles.sectionTitle} id="method-title">
                  Cara membaca dataset ini
                </h2>
              </div>
              <p className={styles.sectionIntro}>
                Transparansi ini sengaja dibuat machine-readable agar manusia dan agent
                tidak mengubah snapshot database menjadi klaim hukum yang lebih kuat.
              </p>
            </div>

            <div className={styles.methodGrid}>
              <article>
                <span>01</span>
                <h3>Snapshot, bukan riwayat</h3>
                <p>Feed menampilkan keadaan database saat diminta, tanpa histori perubahan.</p>
              </article>
              <article>
                <span>02</span>
                <h3>Rujukan tersimpan</h3>
                <p>Adanya URL tidak otomatis membuktikan otoritas atau kesegarannya.</p>
              </article>
              <article>
                <span>03</span>
                <h3>Tanggal cek internal</h3>
                <p>Tanggal ini bukan tanggal efektif aturan pemerintah atau imigrasi.</p>
              </article>
              <article>
                <span>04</span>
                <h3>Verifikasi sebelum berangkat</h3>
                <p>Konfirmasi kembali ke pemerintah, kedutaan, konsulat, dan maskapai terkait.</p>
              </article>
            </div>

            <div className={styles.warning} role="note">
              <AlertTriangle size={21} aria-hidden="true" />
              <p>
                Dataset ini bersifat informasional dan bukan nasihat hukum atau imigrasi.
                Cakupan dapat tidak lengkap atau sudah tertinggal dari aturan terbaru.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.machineSection} aria-labelledby="machine-title">
          <div className={`${styles.shell} ${styles.machineGrid}`}>
            <div className={styles.machineCopy}>
              <span className={styles.machineIcon}>
                <Bot size={23} aria-hidden="true" />
              </span>
              <p className={styles.eyebrow}>Untuk agent dan peneliti</p>
              <h2 className={styles.sectionTitle} id="machine-title">
                Format terbuka, batasan ikut terbawa.
              </h2>
              <p>
                JSON menyediakan seluruh record dan metadata metodologi. RSS memberi
                snapshot yang dapat dipantau tanpa menyembunyikan caveat sumber dan tanggal.
              </p>
            </div>

            <div className={styles.formatCards}>
              <Link
                href="/visa-intelligence/data.json"
                data-analytics-event="visa_intelligence_feed_click"
                data-analytics-format="json"
                data-analytics-placement="visa_intelligence_machine"
              >
                <FileJson size={21} aria-hidden="true" />
                <span>
                  <strong>Dataset JSON</strong>
                  <small>/visa-intelligence/data.json</small>
                </span>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link
                href="/visa-intelligence/feed.xml"
                data-analytics-event="visa_intelligence_feed_click"
                data-analytics-format="rss"
                data-analytics-placement="visa_intelligence_machine"
              >
                <Radio size={21} aria-hidden="true" />
                <span>
                  <strong>Feed RSS</strong>
                  <small>/visa-intelligence/feed.xml</small>
                </span>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection} aria-labelledby="correction-title">
          <div className={`${styles.shell} ${styles.ctaGrid}`}>
            <div>
              <p className={styles.eyebrow}>Audit terbuka</p>
              <h2 id="correction-title">Menemukan data yang meragukan?</h2>
              <p>
                Kirim negara, bagian yang perlu dicek, dan tautan pembanding. Tim Sundaf
                akan meninjau laporan tanpa menjanjikan bahwa record saat ini sudah benar.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <a
                href={correctionHref || "/contact"}
                target={correctionHref ? "_blank" : undefined}
                rel={correctionHref ? "noopener noreferrer" : undefined}
                data-analytics-event="visa_intelligence_correction_click"
                data-analytics-placement="visa_intelligence_footer"
              >
                <CalendarCheck2 size={17} aria-hidden="true" />
                Laporkan koreksi
              </a>
              <a
                href={consultationHref || "/contact"}
                target={consultationHref ? "_blank" : undefined}
                rel={consultationHref ? "noopener noreferrer" : undefined}
                data-analytics-event="whatsapp_consultation_click"
                data-analytics-placement="visa_intelligence_footer"
              >
                <MessageCircle size={17} aria-hidden="true" />
                Konsultasi perjalanan
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
