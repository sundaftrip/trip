import crypto from "node:crypto";

import { publicHttpUrl } from "@/lib/visa-intelligence";
import {
  VISA_DISCUSSION_REPORT_REASONS,
  VISA_DISCUSSION_TOPICS,
  type VisaDiscussionReportReasonInput,
  type VisaDiscussionTopicInput,
} from "@/lib/visa-discussion-public";

export {
  VISA_DISCUSSION_REPORT_LABELS,
  VISA_DISCUSSION_REPORT_REASONS,
  VISA_DISCUSSION_TOPIC_LABELS,
  VISA_DISCUSSION_TOPICS,
} from "@/lib/visa-discussion-public";
export type {
  VisaDiscussionReportReasonInput,
  VisaDiscussionTopicInput,
} from "@/lib/visa-discussion-public";

const BIDI_OR_CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069]/u;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu;
const PHONE_OR_LONG_NUMBER = /(?:\+?\d[\s().-]*){8,}/u;
const DOCUMENT_IDENTIFIER = /\b(?:paspor|passport|nomor\s+visa|visa\s+number|application\s+(?:id|number)|nomor\s+aplikasi)\b[^\n]{0,24}\b[A-Z0-9-]{5,}\b/iu;

function plainText(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(/[\t ]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function hasUnsafeUnicode(value: string) {
  return BIDI_OR_CONTROL.test(value);
}

export function findLikelyPersonalData(value: string) {
  if (EMAIL.test(value)) return "alamat email";
  if (DOCUMENT_IDENTIFIER.test(value)) return "nomor dokumen atau aplikasi";
  if (PHONE_OR_LONG_NUMBER.test(value)) return "nomor telepon atau rangkaian angka panjang";
  return null;
}

export function normalizeVisaDiscussionInput(body: Record<string, unknown>) {
  const parentId = plainText(body.parentId);
  const isReply = Boolean(parentId);
  const authorName = plainText(body.authorName);
  const countryName = plainText(body.countryName);
  const topic = plainText(body.topic);
  const caseContext = plainText(body.caseContext);
  const title = plainText(body.title);
  const message = plainText(body.message);
  const rawSourceUrl = plainText(body.sourceUrl);

  const allText = [authorName, countryName, caseContext, title, message, rawSourceUrl].join("\n");
  if (hasUnsafeUnicode(allText)) {
    return { ok: false as const, error: "Teks memuat karakter tersembunyi yang tidak didukung." };
  }
  if (authorName.length < 2 || authorName.length > 60) {
    return { ok: false as const, error: "Nama tampilan harus 2–60 karakter." };
  }
  const minimumMessage = isReply ? 20 : 40;
  const maximumMessage = isReply ? 1500 : 2000;
  if (message.length < minimumMessage || message.length > maximumMessage) {
    return {
      ok: false as const,
      error: `Isi harus ${minimumMessage}–${maximumMessage} karakter.`,
    };
  }
  if (rawSourceUrl.length > 500) {
    return { ok: false as const, error: "Tautan rujukan terlalu panjang." };
  }
  const sourceUrl = rawSourceUrl ? publicHttpUrl(rawSourceUrl) : null;
  if (rawSourceUrl && !sourceUrl) {
    return { ok: false as const, error: "Gunakan tautan lengkap http:// atau https:// tanpa kredensial." };
  }
  const pii = findLikelyPersonalData(
    [authorName, countryName, caseContext, title, message, rawSourceUrl].join("\n"),
  );
  if (pii) {
    return {
      ok: false as const,
      error: `Hapus ${pii} sebelum mengirim. Jangan bagikan data pribadi di ruang publik.`,
    };
  }
  if (parentId.length > 80) {
    return { ok: false as const, error: "Thread tidak valid." };
  }

  if (!isReply) {
    if (countryName.length < 2 || countryName.length > 80) {
      return { ok: false as const, error: "Pilih negara tujuan." };
    }
    if (!VISA_DISCUSSION_TOPICS.includes(topic as VisaDiscussionTopicInput)) {
      return { ok: false as const, error: "Pilih topik diskusi." };
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(caseContext)) {
      return { ok: false as const, error: "Isi bulan dan tahun kejadian atau rencana perjalanan." };
    }
    if (title.length < 12 || title.length > 120) {
      return { ok: false as const, error: "Judul harus 12–120 karakter." };
    }
  }

  const value = {
    parentId: parentId || null,
    authorName,
    countryName: isReply ? null : countryName,
    countrySlug: isReply ? null : slugifyCountry(countryName),
    topic: isReply ? null : topic as VisaDiscussionTopicInput,
    caseContext: isReply ? null : caseContext,
    title: isReply ? null : title,
    message,
    sourceUrl,
  };

  return {
    ok: true as const,
    value: {
      ...value,
      contentHash: contentDigest(value),
    },
  };
}

export function normalizeVisaDiscussionReport(body: Record<string, unknown>) {
  const reason = plainText(body.reason);
  const details = plainText(body.details);

  if (!VISA_DISCUSSION_REPORT_REASONS.includes(reason as VisaDiscussionReportReasonInput)) {
    return { ok: false as const, error: "Pilih alasan laporan." };
  }
  if (details.length > 300 || hasUnsafeUnicode(details)) {
    return { ok: false as const, error: "Keterangan laporan tidak valid." };
  }
  const pii = findLikelyPersonalData(details);
  if (pii) {
    return { ok: false as const, error: "Jangan menambahkan data pribadi ke laporan." };
  }

  return {
    ok: true as const,
    value: {
      reason: reason as VisaDiscussionReportReasonInput,
      details: details || null,
    },
  };
}

export function contentDigest(value: unknown) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");
}

export function slugifyCountry(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || null;
}
