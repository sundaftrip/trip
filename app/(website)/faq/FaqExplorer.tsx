"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  ChevronDown,
  CreditCard,
  FileCheck2,
  HelpCircle,
  MessageCircle,
  Plane,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { CSSProperties } from "react";
import type { FaqButton, FaqCta, FaqItem, FaqSection } from "@/lib/faq-content";

type ThemeProps = {
  isOutlined: boolean;
  pfx: string;
  headClr?: string;
  subClr?: string;
  cardBg?: string;
  bdrClr?: string;
};

type FaqExplorerProps = {
  sections: FaqSection[];
  bottomCta: FaqCta;
  whatsappHref: string;
  theme: ThemeProps;
};

const SECTION_ICONS: Record<string, typeof HelpCircle> = {
  "tentang-sundaf-trip": HelpCircle,
  "legalitas-keamanan": ShieldCheck,
  "paket-tour-keberangkatan": Plane,
  "visa-dokumen": FileCheck2,
  "pembayaran-deposit-refund": CreditCard,
  "selama-perjalanan": Users,
  "private-corporate-kerja-sama": BriefcaseBusiness,
  "bantuan-kontak": MessageCircle,
};

function resolveHref(href: string, whatsappHref: string) {
  return href === "WHATSAPP" ? whatsappHref : href;
}

function buttonClass(button: FaqButton, theme: ThemeProps) {
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2.5 text-sm font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  if (theme.isOutlined) {
    if (button.variant === "primary") return `${base} ${theme.pfx}-btn`;
    return `${base} ${theme.pfx}-pill`;
  }

  if (button.variant === "primary") {
    return `${base} rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-600`;
  }
  if (button.variant === "secondary") {
    return `${base} rounded-lg bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200`;
  }
  return `${base} rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50 focus-visible:outline-gray-400 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-900`;
}

function CtaBlock({
  cta,
  whatsappHref,
  theme,
  compact = false,
}: {
  cta: FaqCta;
  whatsappHref: string;
  theme: ThemeProps;
  compact?: boolean;
}) {
  const style = theme.isOutlined
    ? ({ background: theme.cardBg, borderColor: theme.bdrClr } satisfies CSSProperties)
    : undefined;

  return (
    <div
      className={`border ${
        compact
          ? "mt-5 p-5 sm:p-6"
          : "mt-12 p-6 sm:p-8"
      } ${theme.isOutlined ? "border-2 border-dashed" : "rounded-lg border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"}`}
      style={style}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h3
            className={`text-lg font-black leading-snug ${!theme.isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={theme.isOutlined ? { color: theme.headClr } : undefined}
          >
            {cta.title}
          </h3>
          <p
            className={`mt-2 text-sm leading-relaxed ${!theme.isOutlined ? "text-gray-600 dark:text-gray-300" : ""}`}
            style={theme.isOutlined ? { color: theme.subClr } : undefined}
          >
            {cta.body}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
          {cta.buttons.map((button) => {
            const href = resolveHref(button.href, whatsappHref);
            const className = buttonClass(button, theme);
            if (href.startsWith("http")) {
              return (
                <a key={`${button.label}-${href}`} href={href} target="_blank" rel="noreferrer" className={className}>
                  {button.label.includes("WhatsApp") && <MessageCircle size={16} aria-hidden="true" />}
                  {button.label}
                </a>
              );
            }
            return (
              <Link key={`${button.label}-${href}`} href={href} className={className}>
                {button.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD");
}

function itemMatches(item: FaqItem, query: string) {
  if (!query) return true;
  const haystack = normalize([
    item.question,
    ...item.answer,
    ...(item.relatedLinks?.map((link) => link.label) ?? []),
  ].join(" "));
  return haystack.includes(query);
}

export default function FaqExplorer({ sections, bottomCta, whatsappHref, theme }: FaqExplorerProps) {
  const [query, setQuery] = useState("");
  const [openItems, setOpenItems] = useState<Set<string>>(() => new Set([sections[0]?.items[0]?.id].filter(Boolean)));
  const normalizedQuery = normalize(query.trim());

  const filteredSections = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => itemMatches(item, normalizedQuery)),
        }))
        .filter((section) => section.items.length > 0),
    [sections, normalizedQuery],
  );

  const totalResults = filteredSections.reduce((sum, section) => sum + section.items.length, 0);
  const showSectionCtas = normalizedQuery.length === 0;

  const toggleItem = (id: string) => {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <div className="mb-10 space-y-4">
        <div className="relative">
          <label htmlFor="faq-search" className="sr-only">
            Cari FAQ Sundaf Trip
          </label>
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari visa, refund, deposit, aurora, private trip..."
            className={`h-12 w-full border bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:bg-gray-950 ${
              theme.isOutlined ? "border-2" : "rounded-lg border-gray-200 dark:border-gray-800"
            }`}
            style={theme.isOutlined ? { background: theme.cardBg, borderColor: theme.bdrClr, color: theme.headClr } : undefined}
          />
        </div>

        <nav aria-label="Kategori FAQ" className="flex gap-2 overflow-x-auto pb-2">
          {sections.map((section) => {
            const Icon = SECTION_ICONS[section.id] ?? HelpCircle;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 px-3 py-2 text-xs font-black transition ${
                  theme.isOutlined
                    ? `${theme.pfx}-pill`
                    : "rounded-full border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                }`}
                style={theme.isOutlined ? { background: theme.cardBg, color: theme.headClr, borderColor: theme.bdrClr } : undefined}
              >
                <Icon size={14} aria-hidden="true" />
                {section.title}
              </a>
            );
          })}
        </nav>

        {normalizedQuery && (
          <p
            className={`text-sm ${!theme.isOutlined ? "text-gray-500 dark:text-gray-400" : ""}`}
            style={theme.isOutlined ? { color: theme.subClr } : undefined}
            aria-live="polite"
          >
            {totalResults} jawaban cocok untuk &quot;{query.trim()}&quot;.
          </p>
        )}
      </div>

      {filteredSections.length === 0 ? (
        <div
          className={`border p-8 text-center ${theme.isOutlined ? "border-2 border-dashed" : "rounded-lg border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"}`}
          style={theme.isOutlined ? { background: theme.cardBg, borderColor: theme.bdrClr, color: theme.subClr } : undefined}
        >
          <p className="text-sm font-semibold">Tidak ada FAQ yang cocok.</p>
          <p className="mt-2 text-sm">Coba kata lain seperti visa, refund, deposit, aurora, atau private trip.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {filteredSections.map((section) => {
            const Icon = SECTION_ICONS[section.id] ?? HelpCircle;
            return (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <div className="mb-5 flex items-start gap-3">
                  <span
                    className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center ${theme.isOutlined ? "border-2" : "rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"}`}
                    style={theme.isOutlined ? { borderColor: theme.bdrClr, color: theme.headClr, background: theme.cardBg } : undefined}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <h2
                      className={`text-2xl font-black tracking-normal ${!theme.isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                      style={theme.isOutlined ? { color: theme.headClr } : undefined}
                    >
                      {section.title}
                    </h2>
                    <p
                      className={`mt-1 text-sm leading-relaxed ${!theme.isOutlined ? "text-gray-500 dark:text-gray-400" : ""}`}
                      style={theme.isOutlined ? { color: theme.subClr } : undefined}
                    >
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {section.items.map((item) => {
                    const isOpen = openItems.has(item.id);
                    const answerId = `faq-answer-${item.id}`;
                    const buttonId = `faq-button-${item.id}`;
                    return (
                      <article
                        key={item.id}
                        className={`border ${
                          theme.isOutlined
                            ? "border-2"
                            : "rounded-lg border-gray-200 bg-white shadow-sm shadow-gray-950/[0.02] dark:border-gray-800 dark:bg-gray-900"
                        }`}
                        style={theme.isOutlined ? { background: theme.cardBg, borderColor: theme.bdrClr } : undefined}
                      >
                        <h3>
                          <button
                            id={buttonId}
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={answerId}
                            onClick={() => toggleItem(item.id)}
                            className={`flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-black leading-snug transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-base ${
                              !theme.isOutlined
                                ? "text-gray-900 hover:bg-gray-50 focus-visible:outline-emerald-600 dark:text-white dark:hover:bg-gray-800"
                                : ""
                            }`}
                            style={theme.isOutlined ? { color: theme.headClr } : undefined}
                          >
                            <span>{item.question}</span>
                            <ChevronDown
                              size={18}
                              className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                              style={theme.isOutlined ? { color: theme.bdrClr } : { color: "#6b7280" }}
                              aria-hidden="true"
                            />
                          </button>
                        </h3>
                        <div
                          id={answerId}
                          role="region"
                          aria-labelledby={buttonId}
                          hidden={!isOpen}
                          className={`border-t px-5 pb-5 pt-4 text-sm leading-relaxed ${
                            theme.isOutlined
                              ? "border-dashed"
                              : "border-gray-100 text-gray-600 dark:border-gray-800 dark:text-gray-300"
                          }`}
                          style={theme.isOutlined ? { color: theme.subClr, borderColor: theme.bdrClr } : undefined}
                        >
                          <div className="space-y-3">
                            {item.answer.map((paragraph) => (
                              <p key={paragraph}>{paragraph}</p>
                            ))}
                            {item.relatedLinks?.length ? (
                              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
                                <span>Terkait:</span>
                                {item.relatedLinks.map((link, index) => (
                                  <span key={link.href} className="inline-flex items-center gap-2">
                                    <Link
                                      href={link.href}
                                      className="underline underline-offset-4 hover:opacity-75"
                                      style={{ color: "var(--site-accent-ink,#2d6a4f)" }}
                                    >
                                      {link.label}
                                    </Link>
                                    {index < (item.relatedLinks?.length ?? 0) - 1 && <span aria-hidden="true">/</span>}
                                  </span>
                                ))}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {section.cta && showSectionCtas && (
                  <CtaBlock cta={section.cta} whatsappHref={whatsappHref} theme={theme} compact />
                )}
              </section>
            );
          })}
        </div>
      )}

      <CtaBlock cta={bottomCta} whatsappHref={whatsappHref} theme={theme} />
    </>
  );
}
