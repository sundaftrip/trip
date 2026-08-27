import Link from "@/components/website/clean/PreserveScrollLink";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Landmark,
  MessageCircle,
  Search,
  Send,
} from "lucide-react";

import { FlagIcon } from "@/lib/flag-icon";
import { visaSlug } from "@/lib/visa-slug";
import StableDetails from "@/components/website/clean/StableDetails";
import type { VisaCountry } from "./VisaDatabase";
import VisaCountryDirectory from "./VisaCountryDirectory";
import styles from "./VisaPages.module.css";

type VisaKey = "bebas" | "voa" | "evisa" | "wajib" | "conditional";

type VisaFaqItem = {
  id: string;
  question: string;
  answer: string;
};

type VisaLandingProps = {
  entries: VisaCountry[];
  featured: VisaCountry[];
  faqs: VisaFaqItem[];
  whatsappHref: string;
};

const VISA_LABEL: Record<VisaKey, string> = {
  bebas: "Bebas Visa",
  voa: "Visa on Arrival",
  evisa: "E-Visa",
  wajib: "Visa Wajib",
  conditional: "Bersyarat",
};

const PROCESS_STEPS = [
  {
    title: "Pilih negara dan waktu",
    description:
      "Sampaikan tujuan, rencana keberangkatan, dan profil singkat perjalananmu.",
  },
  {
    title: "Terima daftar dokumen",
    description:
      "Tim menyesuaikan checklist dengan jenis visa dan ketentuan negara tujuan.",
  },
  {
    title: "Dokumen ditinjau",
    description:
      "Kelengkapan diperiksa sebelum pengajuan melalui kanal resmi yang berlaku.",
  },
  {
    title: "Pantau hasil permohonan",
    description:
      "Perkembangan dan langkah berikutnya disampaikan tanpa menjanjikan persetujuan.",
  },
];

const DOCUMENT_GROUPS = [
  {
    icon: FileText,
    title: "Paspor dan identitas",
    description:
      "Paspor, foto, dan data pribadi sesuai format negara tujuan.",
  },
  {
    icon: BadgeCheck,
    title: "Bukti pendukung",
    description:
      "Dokumen pekerjaan, keuangan, atau sponsor bila memang diwajibkan.",
  },
  {
    icon: ClipboardCheck,
    title: "Rencana perjalanan",
    description:
      "Itinerary, reservasi, dan dokumen perjalanan yang relevan.",
  },
  {
    icon: Landmark,
    title: "Syarat khusus negara",
    description:
      "Formulir, biometrik, wawancara, atau dokumen tambahan mengikuti aturan terkini.",
  },
];

function isVisaKey(value: string): value is VisaKey {
  return value === "bebas"
    || value === "voa"
    || value === "evisa"
    || value === "wajib"
    || value === "conditional";
}

function feeLabel(country: VisaCountry) {
  return country.servicePrice?.trim()
    || country.officialFee?.trim()
    || country.cost?.trim()
    || "Cek detail";
}

function newestVerification(entries: VisaCountry[]) {
  const newest = entries.reduce<Date | null>((current, entry) => {
    if (!entry.lastVerifiedAt) return current;
    const date = entry.lastVerifiedAt instanceof Date
      ? entry.lastVerifiedAt
      : new Date(entry.lastVerifiedAt);
    if (Number.isNaN(date.getTime())) return current;
    return !current || date > current ? date : current;
  }, null);

  if (!newest) return "Tanggal verifikasi tersedia di tiap negara";
  return `Pembaruan terbaru ${new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(newest)}`;
}

export default function VisaLanding({
  entries,
  featured,
  faqs,
  whatsappHref,
}: VisaLandingProps) {
  const consultationHref = whatsappHref || "/contact";
  const consultationTarget = whatsappHref ? "_blank" : undefined;
  const consultationRel = whatsappHref ? "noopener noreferrer" : undefined;

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#visa-main">
        Lewati ke konten visa
      </a>

      <section className={styles.hero} aria-labelledby="visa-page-title">
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Layanan visa Sundaf Trip</p>
            <h1 className={styles.heroTitle} id="visa-page-title">
              Cari persyaratan visa sebelum menyiapkan dokumen.
            </h1>
            <p className={styles.heroLede}>
              Pilih negara tujuan untuk melihat jenis visa, masa tinggal, dokumen,
              estimasi proses, dan biaya yang tercatat. Keputusan permohonan tetap
              berada pada kedutaan atau otoritas terkait.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#visa-database">
                <Search size={17} aria-hidden="true" />
                Cari negara tujuan
              </a>
              <Link className={styles.secondaryAction} href="/jasa-urus-visa-terpercaya">
                <MessageCircle size={17} aria-hidden="true" />
                Jasa pembuatan visa
              </Link>
            </div>
            <Link className={styles.intelligenceLink} href="/visa-intelligence">
              Powered by Sundaf Visa Intelligence
            </Link>
          </div>

          <dl className={styles.heroFacts} aria-label="Ringkasan database visa">
            <div className={styles.heroFact}>
              <dt>Negara tercatat</dt>
              <dd>{entries.length} negara</dd>
            </div>
            <div className={styles.heroFact}>
              <dt>Status data</dt>
              <dd>{newestVerification(entries)}</dd>
            </div>
            <div className={styles.heroFact}>
              <dt>Hasil visa</dt>
              <dd>Ditentukan otoritas terkait</dd>
            </div>
          </dl>
        </div>
      </section>

      <div id="visa-main" tabIndex={-1}>
        {featured.length > 0 && (
          <section className={styles.section} aria-labelledby="featured-visa-title">
            <div className={styles.shell}>
              <div className={styles.sectionHeader}>
                <p className={styles.eyebrow}>Layanan visa pilihan</p>
                <h2 className={styles.sectionTitle} id="featured-visa-title">
                  Mulai dari layanan yang tersedia sekarang
                </h2>
                <p className={styles.sectionLede}>
                  Kartu ini memakai data negara dan biaya yang sudah tercatat di
                  database. Buka detail untuk memastikan persyaratan sebelum mengajukan.
                </p>
              </div>

              <div className={styles.serviceRail} role="region" aria-label="Layanan visa pilihan">
                {featured.map((country) => {
                  const visaLabel = isVisaKey(country.visa)
                    ? VISA_LABEL[country.visa]
                    : country.visa;

                  return (
                    <Link
                      key={country.id}
                      className={styles.serviceCard}
                      href={`/visa/${visaSlug(country.en)}`}
                    >
                      <div className={styles.serviceTop}>
                        <span className={styles.flag}>
                          <FlagIcon
                            flag={country.flag}
                            rounded
                            label={`Bendera ${country.name}`}
                            width={42}
                          />
                        </span>
                        <span className={styles.statusBadge}>{visaLabel}</span>
                      </div>
                      <h3 className={styles.serviceName}>Visa {country.name}</h3>
                      <p className={styles.serviceEnglish}>{country.en}</p>
                      <dl className={styles.serviceFacts}>
                        <div>
                          <dt>Maks. tinggal</dt>
                          <dd>{country.stay}</dd>
                        </div>
                        <div>
                          <dt>Biaya tercatat</dt>
                          <dd>{feeLabel(country)}</dd>
                        </div>
                      </dl>
                      <span className={styles.cardAction}>
                        Cek persyaratan <ArrowRight size={15} aria-hidden="true" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className={styles.documentSection} aria-labelledby="visa-process-title">
          <div className={`${styles.shell} ${styles.sectionPlain}`}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Alur layanan</p>
              <h2 className={styles.sectionTitle} id="visa-process-title">
                Empat langkah dari konsultasi sampai hasil
              </h2>
              <p className={styles.sectionLede}>
                Alur dapat berbeda menurut negara dan jenis visa. Tim akan menjelaskan
                langkah yang benar sebelum dokumen diproses.
              </p>
            </div>

            <ol className={styles.steps}>
              {PROCESS_STEPS.map((step, index) => (
                <li className={styles.stepCard} key={step.title}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="document-overview-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Gambaran dokumen</p>
              <h2 className={styles.sectionTitle} id="document-overview-title">
                Siapkan kelompok dokumennya, lalu cek detail negara
              </h2>
              <p className={styles.sectionLede}>
                Ini adalah gambaran awal, bukan checklist final. Daftar resmi mengikuti
                jenis visa, profil pemohon, dan kebijakan negara tujuan.
              </p>
            </div>

            <div className={styles.documentGrid}>
              {DOCUMENT_GROUPS.map(({ icon: Icon, title, description }) => (
                <article className={styles.documentCard} key={title}>
                  <span className={styles.iconBox}>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.databaseSection}`}
          id="visa-database"
          aria-labelledby="visa-database-title"
        >
          <div className={styles.shell}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Database visa</p>
              <h2 className={styles.sectionTitle} id="visa-database-title">
                Cari aturan untuk negara tujuanmu
              </h2>
              <p className={styles.sectionLede}>
                Gunakan nama negara, wilayah, atau jenis visa. Informasi detail tetap
                perlu dikonfirmasi menjelang pengajuan karena ketentuan dapat berubah.
              </p>
            </div>
            <VisaCountryDirectory entries={entries} />
          </div>
        </section>

        {faqs.length > 0 && (
          <section className={styles.section} aria-labelledby="visa-faq-title">
            <div className={styles.shell}>
              <div className={styles.sectionHeader}>
                <p className={styles.eyebrow}>Pertanyaan visa</p>
                <h2 className={styles.sectionTitle} id="visa-faq-title">
                  Jawaban yang sudah dipublikasikan
                </h2>
                <p className={styles.sectionLede}>
                  Jawaban berikut berasal dari FAQ visa aktif di sistem Sundaf Trip.
                </p>
              </div>

              <div className={styles.faqList}>
                {faqs.map((faq) => (
                  <StableDetails className={styles.faqItem} key={faq.id}>
                    <summary className={styles.faqSummary}>
                      <span>{faq.question}</span>
                      <ChevronDown size={18} aria-hidden="true" />
                    </summary>
                    <p className={styles.faqAnswer}>{faq.answer}</p>
                  </StableDetails>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className={styles.cta} aria-labelledby="visa-consultation-title">
          <div className={`${styles.shell} ${styles.ctaGrid}`}>
            <div>
              <p className={styles.eyebrow}>Perlu dicek sebelum mengajukan?</p>
              <h2 className={styles.ctaTitle} id="visa-consultation-title">
                Ceritakan negara tujuan dan tanggal keberangkatanmu.
              </h2>
              <p className={styles.ctaCopy}>
                Tim akan membantu menjelaskan alur, dokumen, dan biaya yang tersedia.
                Konsultasi tidak menjamin permohonan visa disetujui.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <a
                className={styles.primaryAction}
                href={consultationHref}
                target={consultationTarget}
                rel={consultationRel}
              >
                <Send size={17} aria-hidden="true" />
                Konsultasi via WhatsApp
                {whatsappHref && <span className="sr-only">, membuka tab baru</span>}
              </a>
              <Link className={styles.secondaryAction} href="/visa/faq">
                <FileCheck2 size={17} aria-hidden="true" />
                Baca FAQ teknis
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
