import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { oneF916AttributionFromLocation } from "../lib/campaign-attribution";
import {
  normalizeVisaDiscussionInput,
  normalizeVisaDiscussionReport,
} from "../lib/visa-discussion-input";
import {
  VISA_INTELLIGENCE_CANONICAL_URL,
  VISA_INTELLIGENCE_JSON_URL,
  VISA_INTELLIGENCE_RSS_URL,
  buildVisaIntelligenceDataset,
  publicHttpUrl,
  serializeVisaIntelligenceRss,
} from "../lib/visa-intelligence";
import { isVisaDiscussionTurnstileResult } from "../lib/turnstile-verification";

const repositoryRoot = path.join(import.meta.dirname, "..");
const readSource = (relativePath: string) =>
  readFileSync(path.join(repositoryRoot, relativePath), "utf8");

const sampleRecords = [
  {
    id: "jp",
    flag: "🇯🇵",
    name: "Jepang",
    en: "Japan",
    region: "Asia Timur",
    visa: "evisa",
    stay: "15 hari",
    cost: "Tergantung aplikasi",
    officialFee: null,
    servicePrice: null,
    notes: "Contoh record untuk pengujian.",
    conditions: ["Paspor Indonesia"],
    sourceUrl: "https://example.com/visa",
    lastVerifiedAt: "2026-08-20T00:00:00.000Z",
    updatedAt: "2026-08-21T00:00:00.000Z",
  },
  {
    id: "vn",
    flag: "🇻🇳",
    name: "Vietnam",
    en: "Vietnam",
    region: "Asia Tenggara",
    visa: "bebas",
    stay: "30 hari",
    cost: "Gratis",
    notes: "Contoh kedua.",
    sourceUrl: null,
    lastVerifiedAt: null,
    updatedAt: "2026-08-19T00:00:00.000Z",
  },
] as const;

const validQuestion = {
  authorName: "Rina",
  countryName: "Jepang",
  topic: "APPLICATION",
  caseContext: "2026-09",
  title: "Pengalaman mengajukan eVisa Jepang",
  message:
    "Saya sedang menyiapkan pengajuan eVisa Jepang dan ingin membandingkan waktu proses dengan pengalaman terbaru pembaca lain.",
  sourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/",
};

test("visa intelligence dataset uses the current transparent snapshot URLs", () => {
  const dataset = buildVisaIntelligenceDataset(sampleRecords, "2026-08-26T00:00:00.000Z");

  assert.equal(VISA_INTELLIGENCE_CANONICAL_URL, "https://sundaftrip.com/visa-intelligence");
  assert.equal(VISA_INTELLIGENCE_JSON_URL, "https://sundaftrip.com/visa-intelligence/data.json");
  assert.equal(VISA_INTELLIGENCE_RSS_URL, "https://sundaftrip.com/visa-intelligence/feed.xml");
  assert.equal(dataset.canonical_url, VISA_INTELLIGENCE_CANONICAL_URL);
  assert.equal(dataset.distributions.json, VISA_INTELLIGENCE_JSON_URL);
  assert.equal(dataset.distributions.rss, VISA_INTELLIGENCE_RSS_URL);
  assert.equal(dataset.dataset_type, "current_status_snapshot");
  assert.equal(dataset.summary.record_count, 2);
  assert.equal(dataset.summary.records_with_source, 1);
});

test("visa intelligence dataset serializes as JSON and a transparent RSS snapshot", () => {
  const dataset = buildVisaIntelligenceDataset(sampleRecords, "2026-08-26T00:00:00.000Z");
  const json = JSON.parse(JSON.stringify(dataset)) as typeof dataset;
  const rss = serializeVisaIntelligenceRss(dataset);

  assert.equal(json.distributions.html, VISA_INTELLIGENCE_CANONICAL_URL);
  assert.equal(json.distributions.json, VISA_INTELLIGENCE_JSON_URL);
  assert.equal(json.distributions.rss, VISA_INTELLIGENCE_RSS_URL);
  assert.equal(json.records[0]?.source?.url, "https://example.com/visa");
  assert.match(rss, /<title>Sundaf Visa Intelligence<\/title>/);
  assert.match(rss, /Current visa-status snapshots/);
  assert.match(rss, /Not an official change log/);
  assert.match(rss, /<sundaf:sourceUrl>https:\/\/example\.com\/visa<\/sundaf:sourceUrl>/);
  assert.match(rss, /<atom:link href="https:\/\/sundaftrip\.com\/visa-intelligence\/feed\.xml"/);
});

test("visa intelligence route is discoverable from sitemap and llms files", () => {
  const sitemap = readSource("app/sitemap.ts");
  const llms = readSource("app/llms.txt/route.ts");
  const llmsFull = readSource("app/llms-full.txt/route.ts");
  const visaLanding = readSource("app/(website)/visa/VisaLanding.tsx");
  const visaStyles = readSource("app/(website)/visa/VisaPages.module.css");

  assert.match(sitemap, /\/visa-intelligence/);
  assert.match(llms, /Sundaf Visa Intelligence/);
  assert.match(llms, /\/visa-intelligence\/data\.json/);
  assert.match(llms, /\/visa-intelligence\/feed\.xml/);
  assert.match(llmsFull, /Sundaf Visa Intelligence/);
  assert.match(llmsFull, /\/visa-intelligence\/data\.json/);
  assert.match(llmsFull, /\/visa-intelligence\/feed\.xml/);
  assert.match(visaLanding, /className=\{styles\.intelligenceLink\}[\s\S]*?Sundaf Visa Intelligence/);
  assert.match(visaStyles, /\.intelligenceLink\s*\{[\s\S]*?font-size:\s*11px/);
  assert.match(visaStyles, /\.intelligenceLink\s*\{[\s\S]*?font-weight:\s*400/);
});

test("public source URL sanitizer only accepts plain HTTP(S) URLs", () => {
  assert.equal(publicHttpUrl("https://example.com/path"), "https://example.com/path");
  assert.equal(publicHttpUrl("javascript:alert(1)"), null);
  assert.equal(publicHttpUrl("https://user:pass@example.com"), null);
  assert.equal(publicHttpUrl("not a url"), null);
});

test("1F916 traffic preserves the pilot campaign attribution", () => {
  assert.deepEqual(
    oneF916AttributionFromLocation(
      "?utm_source=1f916&utm_medium=agent_community&utm_campaign=visa_intelligence_pilot&utm_content=launch_post",
      "",
    ),
    {
      matched: true,
      detectionMethod: "utm_source",
      source: "1f916",
      medium: "agent_community",
      campaign: "visa_intelligence_pilot",
      content: "launch_post",
    },
  );

  assert.deepEqual(oneF916AttributionFromLocation("", "https://1f916.ai/post/123"), {
    matched: true,
    detectionMethod: "referrer",
    source: "1f916",
    medium: "referral",
    campaign: "",
    content: "",
  });

  assert.equal(oneF916AttributionFromLocation("?utm_source=instagram", "").matched, false);
});

test("visa discussion validation accepts a structured question, reply, and report", () => {
  const question = normalizeVisaDiscussionInput(validQuestion);
  assert.equal(question.ok, true);
  if (!question.ok) return;
  assert.equal(question.value.parentId, null);
  assert.equal(question.value.countrySlug, "jepang");
  assert.equal(question.value.topic, "APPLICATION");
  assert.equal(question.value.sourceUrl, validQuestion.sourceUrl);
  assert.equal(question.value.contentHash.length, 64);

  const reply = normalizeVisaDiscussionInput({
    parentId: "discussion_123",
    authorName: "Budi",
    message: "Pengajuan saya diproses dalam enam hari kerja pada bulan yang sama.",
    sourceUrl: "https://www.mofa.go.jp/",
  });
  assert.equal(reply.ok, true);
  if (!reply.ok) return;
  assert.equal(reply.value.parentId, "discussion_123");
  assert.equal(reply.value.countryName, null);
  assert.equal(reply.value.topic, null);
  assert.equal(reply.value.title, null);

  const report = normalizeVisaDiscussionReport({
    reason: "MISINFORMATION",
    details: "Informasi ini perlu dibandingkan dengan aturan kedutaan terbaru.",
  });
  assert.deepEqual(report, {
    ok: true,
    value: {
      reason: "MISINFORMATION",
      details: "Informasi ini perlu dibandingkan dengan aturan kedutaan terbaru.",
    },
  });
});

test("visa discussion validation rejects personal data and hidden control text", () => {
  const invalidMessages = [
    "Silakan hubungi saya melalui alamat nama.pengguna@example.com untuk membahas pengalaman pengajuan visa ini.",
    "Nomor kontak saya 0812 3456 7890 dan saya ingin menanyakan proses pengajuan visa terbaru.",
    "Nomor aplikasi ABCDE12345 tercantum pada bukti pengajuan yang ingin saya tanyakan di ruang diskusi ini.",
  ];

  for (const message of invalidMessages) {
    const result = normalizeVisaDiscussionInput({ ...validQuestion, message });
    assert.equal(result.ok, false, message);
  }

  const hiddenText = normalizeVisaDiscussionInput({
    ...validQuestion,
    title: "Pengalaman eVisa Jepang\u202Epalsu",
  });
  assert.equal(hiddenText.ok, false);
  if (!hiddenText.ok) assert.match(hiddenText.error, /karakter tersembunyi/i);
});

test("visa discussion validation rejects executable or credential-bearing source URLs", () => {
  for (const sourceUrl of [
    "javascript:alert(1)",
    "https://user:password@example.com/visa",
  ]) {
    const result = normalizeVisaDiscussionInput({ ...validQuestion, sourceUrl });
    assert.equal(result.ok, false, sourceUrl);
    if (!result.ok) assert.match(result.error, /http:\/\/ atau https:\/\//i);
  }
});

test("visa discussion Turnstile result requires the exact action", () => {
  assert.equal(isVisaDiscussionTurnstileResult({
    success: true,
    action: "visa_discussion",
    hostname: "sundaftrip.com",
  }, "SUNDAFTRIP.COM."), true);
  assert.equal(isVisaDiscussionTurnstileResult({
    success: true,
    hostname: "sundaftrip.com",
  }, "sundaftrip.com"), false);
  assert.equal(isVisaDiscussionTurnstileResult({
    success: true,
    action: "different_action",
    hostname: "sundaftrip.com",
  }, "sundaftrip.com"), false);
  assert.equal(isVisaDiscussionTurnstileResult({
    success: false,
    action: "visa_discussion",
    hostname: "sundaftrip.com",
  }, "sundaftrip.com"), false);
  assert.equal(isVisaDiscussionTurnstileResult({
    success: true,
    action: "visa_discussion",
  }, "sundaftrip.com"), false);
  assert.equal(isVisaDiscussionTurnstileResult({
    success: true,
    action: "visa_discussion",
    hostname: "other.example",
  }, "sundaftrip.com"), false);
});

test("public discussion payload cannot promote itself or impersonate Sundaf staff", () => {
  const normalized = normalizeVisaDiscussionInput({
    ...validQuestion,
    status: "PUBLISHED",
    isAdminReply: true,
    reviewedById: "attacker",
  });
  assert.equal(normalized.ok, true);
  if (!normalized.ok) return;

  assert.equal("status" in normalized.value, false);
  assert.equal("isAdminReply" in normalized.value, false);
  assert.equal("reviewedById" in normalized.value, false);
});

test("visa discussion public write and rendering paths enforce moderation boundaries", () => {
  const schema = readSource("prisma/schema.prisma");
  const publicApi = readSource("app/api/visa-discussions/route.ts");
  const adminApi = readSource("app/api/admin/visa-discussions/[id]/route.ts");
  const reportAdminApi = readSource("app/api/admin/visa-discussions/reports/[id]/route.ts");
  const adminPage = readSource("app/admin/visa-discussions/page.tsx");
  const publicComponent = readSource("app/(website)/visa-intelligence/VisaDiscussion.tsx");
  const discussionServer = readSource("lib/visa-discussions.ts");
  const mutationSecurity = readSource("lib/public-mutation-security.ts");

  assert.match(schema, /enum VisaDiscussionStatus/);
  assert.match(schema, /model VisaDiscussion/);
  assert.match(discussionServer, /VISA_DISCUSSION_WRITES_ENABLED\s*===\s*["']true["']/);
  assert.match(discussionServer, /TURNSTILE_SECRET_KEY/);
  assert.match(discussionServer, /NEXT_PUBLIC_TURNSTILE_SITE_KEY/);
  assert.match(discussionServer, /challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/);
  assert.match(discussionServer, /where:\s*\{\s*status:\s*["']PUBLISHED["']\s*\}/);
  assert.match(publicApi, /status:\s*["']PENDING["']/);
  assert.match(publicApi, /isAdminReply:\s*false/);
  assert.match(publicApi, /publicWritesConfigured/);
  assert.match(publicApi, /verifyTurnstileToken/);
  assert.match(publicApi, /discussionRateLimit/);
  assert.match(publicApi, /isDuplicateDiscussion/);
  assert.match(publicApi, /validateSameOriginMutation\(req\)/);
  assert.match(publicApi, /readBoundedJson\(req\)/);
  assert.doesNotMatch(publicApi, /parsed\.value\.(?:status|isAdminReply|reviewedById)/);
  assert.doesNotMatch(publicApi, /normalized\.value\.(?:status|isAdminReply|reviewedById)/);
  assert.doesNotMatch(adminApi, /export async function DELETE/);
  assert.doesNotMatch(reportAdminApi, /export async function DELETE/);
  assert.match(adminApi, /authorName:\s*["']Tim Sundaf["']/);
  assert.match(reportAdminApi, /REPORT_STATUSES\s*=\s*\[["']RESOLVED["'],\s*["']DISMISSED["']\]/);
  assert.match(reportAdminApi, /reviewedById:\s*session\.user\.id/);
  assert.match(reportAdminApi, /reviewedAt:\s*new Date\(\)/);
  assert.match(adminPage, /reports:\s*\{[\s\S]*?reason:\s*true[\s\S]*?details:\s*true[\s\S]*?status:\s*true/);
  assert.match(adminPage, /status:\s*["']OPEN["']/);

  assert.match(mutationSecurity, /PUBLIC_MUTATION_BODY_LIMIT\s*=\s*10_240/);
  assert.match(mutationSecurity, /content-type/);
  assert.match(mutationSecurity, /sec-fetch-site/);
  assert.match(mutationSecurity, /req\.headers\.get\(["']origin["']\)/);
  assert.doesNotMatch(mutationSecurity, /x-forwarded-(?:host|proto)/i);
  assert.match(mutationSecurity, /new TextEncoder\(\)\.encode\(raw\)\.byteLength/);

  const createBlock = publicApi.match(
    /await prisma\.visaDiscussion\.create\(\{[\s\S]*?\n    \}\);/,
  )?.[0] ?? "";
  assert.ok(createBlock);
  assert.match(createBlock, /authorFingerprint/);
  assert.match(createBlock, /topic:\s*asPrismaTopic\(normalized\.value\.topic\)/);
  assert.match(createBlock, /status:\s*["']PENDING["']/);
  assert.match(createBlock, /isAdminReply:\s*false/);
  assert.doesNotMatch(createBlock, /status:\s*["']PUBLISHED["']/);

  assert.match(
    publicComponent,
    /rel=["'][^"']*\bugc\b[^"']*\bnofollow\b[^"']*["']/,
  );
  assert.match(publicComponent, /sedang ditinjau|ditinjau sebelum ditampilkan/i);
  assert.match(publicComponent, /Jangan menulis nomor paspor,[\s\S]*NIK/);
});
