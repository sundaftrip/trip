import type React from "react";
import Link from "@/components/website/clean/PreserveScrollLink";
import { ArrowRight } from "lucide-react";
import doc from "@/components/website/clean/DocFormat.module.css";
import styles from "./GeoPage.module.css";

import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import StableDetails from "@/components/website/clean/StableDetails";
import { serializeJsonLd } from "@/lib/safe-json-ld";

export interface GeoFaq {
  question: string;
  answer: string;
}

interface GeoPageProps {
  title: string;
  eyebrow: string;
  description: string;
  descriptionHighlights?: string[];
  canonicalPath: string;
  primaryCta: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  sections: Array<{ title: string; body?: string; items?: string[] }>;
  faqs: GeoFaq[];
  schema?: Record<string, unknown>;
  children?: React.ReactNode;
}

const SITE_URL = "https://sundaftrip.com";
const LINK_TOKEN_RE = /(https?:\/\/[^\s<>"']+|(?<![a-z0-9])\/[a-z0-9][a-z0-9/_-]*(?:\?[^\s<>"']*)?)/gi;
const TRAILING_PUNCTUATION_RE = /[.,;:)]+$/;

function LinkedText({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(LINK_TOKEN_RE)) {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(text.slice(cursor, start));

    const trailing = token.match(TRAILING_PUNCTUATION_RE)?.[0] ?? "";
    const href = trailing ? token.slice(0, -trailing.length) : token;
    const isInternal = href.startsWith("/");
    const className = styles.link;

    nodes.push(
      isInternal ? (
        <Link key={`${href}-${start}`} href={href} className={className}>
          {href}
        </Link>
      ) : (
        <a key={`${href}-${start}`} href={href} target="_blank" rel="noreferrer" className={className}>
          {href}
        </a>
      )
    );
    if (trailing) nodes.push(trailing);
    cursor = start + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}

function SelectiveHighlights({ text, phrases }: { text: string; phrases: string[] }) {
  const matches = phrases
    .map((phrase) => ({ phrase, start: text.indexOf(phrase) }))
    .filter((match) => match.phrase && match.start >= 0)
    .sort((a, b) => a.start - b.start);

  if (!matches.length) return <LinkedText text={text} />;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  matches.forEach(({ phrase, start }, index) => {
    if (start < cursor) return;
    if (start > cursor) {
      nodes.push(<LinkedText key={`plain-${index}`} text={text.slice(cursor, start)} />);
    }
    nodes.push(
      <mark className={doc.mark} key={`highlight-${index}`}>
        <LinkedText text={phrase} />
      </mark>
    );
    cursor = start + phrase.length;
  });

  if (cursor < text.length) {
    nodes.push(<LinkedText key="plain-final" text={text.slice(cursor)} />);
  }

  return <>{nodes}</>;
}

export default function GeoPage({
  title,
  eyebrow,
  description,
  descriptionHighlights,
  canonicalPath,
  primaryCta,
  secondaryCta,
  sections,
  faqs,
  schema,
  children,
}: GeoPageProps) {
  const pageUrl = `${SITE_URL}${canonicalPath}`;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    inLanguage: "id-ID",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className={styles.page}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: title, url: canonicalPath },
        ]}
      />
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />

      <section className={`${styles.shell} ${styles.hero}`} aria-labelledby="geo-page-title">
        <p className={doc.eyebrow}>{eyebrow}</p>
        <h1 id="geo-page-title" className={`${doc.title} ${styles.title}`}>{title}</h1>
        <p className={styles.lede}>
          {descriptionHighlights?.length ? (
            <SelectiveHighlights text={description} phrases={descriptionHighlights} />
          ) : (
            <LinkedText text={description} />
          )}
        </p>
        <div className={styles.actions}>
          <Link href={primaryCta.href} className={doc.button}>
            {primaryCta.label} <ArrowRight aria-hidden="true" />
          </Link>
          {secondaryCta && (
            <Link href={secondaryCta.href} className={styles.secondary}>
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </section>

      {children}

      <section className={`${styles.shell} ${styles.sections}`} aria-label={`Ringkasan ${title}`}>
        <div className={styles.boxes}>
          {sections.map((section) => (
            <div key={section.title} className={styles.box}>
              <h2 className={styles.boxTitle}>{section.title}</h2>
              {section.body && (
                <p>
                  <LinkedText text={section.body} />
                </p>
              )}
              {section.items && (
                <ul className={styles.list}>
                  {section.items.map((item) => (
                    <li key={item}>
                      <LinkedText text={item} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className={`${styles.shell} ${styles.faq}`} aria-labelledby="geo-faq-title">
        <h2 id="geo-faq-title" className={doc.tag}>FAQ</h2>
        <div className={styles.faqRows}>
          {faqs.map((faq) => (
            <StableDetails key={faq.question} className={styles.faqRow}>
              <summary>{faq.question}</summary>
              <p>
                <LinkedText text={faq.answer} />
              </p>
            </StableDetails>
          ))}
        </div>
      </section>
    </div>
  );
}
