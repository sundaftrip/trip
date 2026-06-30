import type React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

export interface GeoFaq {
  question: string;
  answer: string;
}

interface GeoPageProps {
  title: string;
  eyebrow: string;
  description: string;
  canonicalPath: string;
  primaryCta: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  sections: Array<{ title: string; body?: string; items?: string[] }>;
  faqs: GeoFaq[];
  schema?: Record<string, unknown>;
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
    const className = "font-semibold underline decoration-[var(--site-accent)] underline-offset-4 hover:opacity-80";

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

export default function GeoPage({
  title,
  eyebrow,
  description,
  canonicalPath,
  primaryCta,
  secondaryCta,
  sections,
  faqs,
  schema,
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
    <main className="min-h-screen pt-24 at-grid-bg" style={{ backgroundColor: "var(--at-bg)" }}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: title, url: canonicalPath },
        ]}
      />
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <span className="at-pill mb-5 inline-flex text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--at-subtext)" }}>
          {eyebrow}
        </span>
        <h1 className="max-w-4xl text-4xl lg:text-6xl font-black leading-tight" style={{ color: "var(--at-text)" }}>
          {title}
        </h1>
        <div className="mt-6 max-w-3xl">
          <p className="text-base lg:text-lg leading-relaxed" style={{ color: "var(--at-subtext)" }}>
            <span className="stabilo">
              <LinkedText text={description} />
            </span>
          </p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href={primaryCta.href} className="at-btn-solid inline-flex items-center justify-center gap-2 px-6 py-3 text-sm">
            {primaryCta.label} <ArrowRight size={15} />
          </Link>
          {secondaryCta && (
            <Link href={secondaryCta.href} className="at-btn inline-flex items-center justify-center gap-2 px-6 py-3 text-sm">
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className="at-card p-5">
              <h2 className="text-lg font-black mb-3" style={{ color: "var(--at-text)" }}>
                {section.title}
              </h2>
              {section.body && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
                  <LinkedText text={section.body} />
                </p>
              )}
              {section.items && (
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0" style={{ color: "var(--site-accent)" }} />
                      <span>
                        <LinkedText text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-black mb-5" style={{ color: "var(--at-text)" }}>
          FAQ
        </h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="at-card p-5 group">
              <summary className="cursor-pointer list-none font-bold text-sm" style={{ color: "var(--at-text)" }}>
                {faq.question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
                <LinkedText text={faq.answer} />
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
