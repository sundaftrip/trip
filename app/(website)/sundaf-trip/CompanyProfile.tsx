import type { ReactNode } from "react";
import { Plus } from "lucide-react";

import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import Link from "@/components/website/clean/PreserveScrollLink";
import StableDetails from "@/components/website/clean/StableDetails";
import { geoPageSchema } from "@/lib/geo-pages";
import { serializeJsonLd } from "@/lib/safe-json-ld";
import type { GeoPageContent, GeoSection } from "@/types/geo";
import styles from "./CompanyProfile.module.css";

export type CompanyProfileReview = { id: string; name: string; content: string };
type CompanyProfileProps = { content: GeoPageContent; reviews: CompanyProfileReview[] };

const SECTION_IDS = ["pilihan-perjalanan", "bantuan-di-rusia", "sebelum-memesan", "identitas-kontak"];
const SECTION_LABELS = ["Layanan", "Pendampingan", "Persiapan", "Perusahaan"];
const INLINE_LINK_RE = /\[([^\]\n]+)\]\(([^\s)]+)\)|(https?:\/\/[^\s<>"']+|(?<![a-z0-9])\/[a-z0-9][a-z0-9/_-]*(?:\?[^\s<>"']*)?)/gi;

function safeHref(value: string): string | null {
  if (/[\u0000-\u0020\u007f\\]/.test(value)) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (/^mailto:[a-z0-9.!#$%&'*+\-/=?^_`{|}~]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)) return value;
  try {
    const url = new URL(value);
    if ((url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password) return url.href;
  } catch {
    return null;
  }
  return null;
}

/** CMS text stays text; only explicit safe links are enhanced. */
function LinkedText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(INLINE_LINK_RE)) {
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(text.slice(cursor, start));
    const isMarkdown = Boolean(match[1]);
    const token = match[2] || match[3];
    const trailing = isMarkdown ? "" : (token.match(/[.,;:)]+$/)?.[0] ?? "");
    const value = trailing ? token.slice(0, -trailing.length) : token;
    const href = safeHref(value);
    const label = isMarkdown ? match[1] : value;
    if (!href) nodes.push(match[0]);
    else if (href.startsWith("/")) {
      nodes.push(<Link key={start} className={styles.inlineLink} href={href}>{label}</Link>);
      if (trailing) nodes.push(trailing);
    } else {
      nodes.push(<a key={start} className={styles.inlineLink} href={href}>{label}</a>);
      if (trailing) nodes.push(trailing);
    }
    cursor = start + match[0].length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}

function itemParts(item: string) {
  const colon = item.indexOf(": ");
  if (colon > 0 && colon < 100 && !item.slice(0, colon).includes("[")) {
    return { heading: item.slice(0, colon), body: item.slice(colon + 2) };
  }
  return { heading: "", body: item };
}

function SectionHeader({ section, index }: { section: GeoSection; index: number }) {
  return (
    <div className={styles.sectionHeading}>
      <p className={styles.eyebrow}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{SECTION_LABELS[index] || "Tentang Sundaf"}</p>
      <h2 id={`${SECTION_IDS[index] || `bagian-${index + 1}`}-title`}>{section.title}</h2>
      {section.body && <p className={styles.sectionIntro}><LinkedText text={section.body} /></p>}
    </div>
  );
}

function ContentSection({ section, index }: { section: GeoSection; index: number }) {
  const id = SECTION_IDS[index] || `bagian-${index + 1}`;
  const kind = index === 0 ? styles.services : index === 1 ? styles.support : index === 2 ? styles.preparation : styles.identity;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`${styles.section} ${kind}`}>
      <div className={styles.sectionInner}>
        <SectionHeader section={section} index={index} />
        {section.items?.length ? (
          <ul className={styles.itemList}>
            {section.items.map((item, itemIndex) => {
              const { heading, body } = itemParts(item);
              return (
                <li key={`${itemIndex}-${heading}`} className={styles.item}>
                  {index === 2 && <span className={styles.stepNumber} aria-hidden="true">{String(itemIndex + 1).padStart(2, "0")}</span>}
                  <div className={styles.itemContent}>
                    {heading && <h3>{heading}</h3>}
                    <p><LinkedText text={body} /></p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export default function CompanyProfile({ content, reviews }: CompanyProfileProps) {
  const primaryCta = { href: safeHref(content.primaryCtaHref || "") || "/tours", label: content.primaryCtaLabel || "Lihat jadwal & biaya" };
  const secondaryHref = content.secondaryCtaHref ? safeHref(content.secondaryCtaHref) : null;
  const secondaryCta = secondaryHref && content.secondaryCtaLabel
    ? { href: secondaryHref, label: content.secondaryCtaLabel }
    : null;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `https://sundaftrip.com${content.routePath}#faq`,
    inLanguage: "id-ID",
    mainEntity: content.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer.replace(/\[([^\]\n]+)\]\([^\s)]+\)/g, "$1") },
    })),
  };
  return (
    <div className={styles.page}>
      <BreadcrumbSchema crumbs={[{ name: "Beranda", url: "/" }, { name: content.title, url: content.routePath }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(geoPageSchema(content)) }} />
      {content.faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }} />}

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/"><span className={styles.markerText}>Beranda</span></Link><span aria-hidden="true">/</span><span aria-current="page">{content.title}</span></nav>
          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>{content.eyebrow}</p>
              <h1>{content.title}</h1>
              <p className={styles.heroDescription}><LinkedText text={content.answer} /></p>
              <div className={styles.heroActions}>
                <Link href={primaryCta.href} className={styles.primaryButton}>{primaryCta.label}</Link>
                {secondaryCta && <Link href={secondaryCta.href} className={styles.secondaryLink}><span className={styles.markerText}>{secondaryCta.label}</span></Link>}
              </div>
            </div>
            {content.sections.length > 0 && (
              <nav className={styles.contents} aria-label="Isi profil perusahaan">
                <p className={styles.contentsLabel}>Dalam profil ini</p>
                <ol>
                  {content.sections.map((section, index) => (
                    <li key={`${index}-${section.title}`}>
                      <a href={`#${SECTION_IDS[index] || `bagian-${index + 1}`}`}><span className={styles.contentsNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span>{section.title}</span></a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>
        </div>
      </header>

      {content.sections.map((section, index) => <ContentSection key={`${index}-${section.title}`} section={section} index={index} />)}

      {reviews.length > 0 && (
        <section className={styles.reviews} aria-labelledby="participant-reviews-title">
          <div className={styles.reviewsHeader}>
            <h2 id="participant-reviews-title">Dari peserta perjalanan</h2>
            <Link href="/reviews" className={styles.secondaryLink}><span className={styles.markerText}>Baca semua ulasan</span></Link>
          </div>
          <div className={styles.quotes}>
            {reviews.map((review) => (
              <figure className={styles.quote} key={review.id}>
                <span className={styles.quoteMark} aria-hidden="true">“</span>
                <blockquote>{review.content}</blockquote>
                <figcaption><strong>{review.name}</strong><span>Peserta perjalanan</span></figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {content.faqs.length > 0 && (
        <section className={styles.faq} id="faq" aria-labelledby="company-faq-title">
          <div className={styles.faqHeading}><p className={styles.eyebrow}>Pertanyaan Anda</p><h2 id="company-faq-title">Yang perlu Anda ketahui</h2></div>
          <div className={styles.questions}>
            {content.faqs.map((faq) => (
              <StableDetails className={styles.question} key={faq.question}>
                <summary>{faq.question}<Plus size={20} aria-hidden="true" /></summary>
                <p><LinkedText text={faq.answer} /></p>
              </StableDetails>
            ))}
          </div>
        </section>
      )}

      <section className={styles.closing} aria-labelledby="next-step-title">
        <h2 id="next-step-title">Mulai dari rencana Anda.</h2>
        <div className={styles.closingActions}>
          <Link href={primaryCta.href} className={styles.primaryButton}>{primaryCta.label}</Link>
          {secondaryCta && <Link href={secondaryCta.href} className={styles.secondaryLink}><span className={styles.markerText}>{secondaryCta.label}</span></Link>}
        </div>
      </section>
    </div>
  );
}
