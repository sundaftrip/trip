import sanitizeHtml from "sanitize-html";
import { load } from "cheerio";
import { FAQ_SECTIONS, faqAnswerText, type FaqSection } from "./faq-content";

export const GENERAL_FAQ_SOURCE_KEY = "faq_general_source";

type CmsFaq = { id: string; section: string; question: string; answer: string; active: boolean; order: number };
const SECTION_ALIASES: Record<string, string> = {
  Umum: "tentang-sundaf-trip",
  "Pembayaran & Deposit": "pembayaran-deposit-refund",
  "Di Lapangan": "selama-perjalanan",
};

/** This runs on the server; rich content is sanitized before reaching the client. */
export function resolveGeneralFaqSections(source: string | null | undefined, rows: CmsFaq[]): FaqSection[] {
  if (source !== "cms") return FAQ_SECTIONS;
  const sections = new Map<string, FaqSection>();
  const activeRows = rows.filter((row) => row.active).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  for (const row of activeRows) {
    const template = FAQ_SECTIONS.find((section) => section.title === row.section || section.id === row.section || section.id === SECTION_ALIASES[row.section]);
    const sectionKey = template?.id || row.section;
    if (!sections.has(sectionKey)) sections.set(sectionKey, template ? { ...template, items: [] } : { id: `cms-section-${sections.size}`, title: row.section, description: "", items: [] });
    const original = template?.items.find((item) => item.question === row.question);
    if (original && faqAnswerText(original).trim() === row.answer.trim()) {
      sections.get(sectionKey)!.items.push({ ...original, id: row.id });
      continue;
    }
    const relatedSuffix = original?.relatedLinks?.length ? `Terkait: ${original.relatedLinks.map((link) => link.label).join(", ")}.` : "";
    const rawAnswer = relatedSuffix && row.answer.trim().endsWith(`\n\n${relatedSuffix}`) ? row.answer.trim().slice(0, -relatedSuffix.length).trim() : row.answer;
    const isHtml = /<\/?[a-z][\s>]/i.test(rawAnswer) || /<\/?(?:strong|blockquote|ul|ol|li|br|a)\b/i.test(rawAnswer);
    const answerHtml = isHtml ? sanitizeHtml(rawAnswer, {
      allowedTags: ["p", "br", "strong", "b", "em", "i", "ul", "ol", "li", "a", "blockquote"],
      allowedAttributes: { a: ["href", "title"] },
      allowedSchemes: ["http", "https", "mailto", "tel"],
      allowProtocolRelative: false,
    }) : undefined;
    const plain = answerHtml === undefined ? rawAnswer : load(answerHtml.replace(/<\/(?:p|li|ul|ol|blockquote)>|<br\s*\/?\s*>/gi, "\n\n")).text();
    sections.get(sectionKey)!.items.push({
      id: row.id,
      question: row.question,
      answer: plain.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
      ...(answerHtml !== undefined ? { answerHtml } : {}),
      ...(original?.relatedLinks ? { relatedLinks: original.relatedLinks } : {}),
    });
  }
  const order = FAQ_SECTIONS.map((section) => section.id);
  return [...sections.values()].sort((a, b) => {
    const aIndex = order.indexOf(a.id), bIndex = order.indexOf(b.id);
    return (aIndex < 0 ? order.length : aIndex) - (bIndex < 0 ? order.length : bIndex);
  });
}
