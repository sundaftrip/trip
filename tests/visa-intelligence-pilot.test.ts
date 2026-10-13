import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { oneF916AttributionFromLocation } from "../lib/campaign-attribution";
import {
  VISA_INTELLIGENCE_CANONICAL_URL,
  VISA_INTELLIGENCE_JSON_URL,
  VISA_INTELLIGENCE_RSS_URL,
  buildVisaIntelligenceDataset,
  publicHttpUrl,
  serializeVisaIntelligenceRss,
} from "../lib/visa-intelligence";

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

test("visa sources remain discoverable without implementation branding in the customer hero", () => {
  const sitemap = readSource("app/sitemap.ts");
  const profile = readSource("lib/crawl-catalog.ts");
  assert.match(sitemap, /\/visa-intelligence/);
  assert.match(profile, /\/visa-intelligence/);
  assert.match(profile, /\/visa-intelligence\/data\.json/);
  assert.match(profile, /\/visa-intelligence\/feed\.xml/);
  for (const route of ["app/llms.txt/route.ts", "app/llms-full.txt/route.ts"]) {
    assert.match(readSource(route), /CRAWL_PROFILE/);
  }
  assert.doesNotMatch(readSource("app/(website)/visa/VisaLanding.tsx"), /Powered by/);
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

test("the visa discussion module stays removed from the page, API, and CMS", () => {
  const page = readSource("app/(website)/visa-intelligence/page.tsx");
  assert.doesNotMatch(page, /VisaDiscussion|diskusi-visa|loadVisaDiscussionPublicState/);

  for (const removedPath of [
    "app/api/visa-discussions/route.ts",
    "app/api/admin/visa-discussions/[id]/route.ts",
    "app/admin/visa-discussions/page.tsx",
    "app/(website)/visa-intelligence/VisaDiscussion.tsx",
    "lib/visa-discussions.ts",
  ]) {
    assert.equal(existsSync(path.join(repositoryRoot, removedPath)), false, `${removedPath} should stay deleted`);
  }

  // The archived tables stay in the schema so existing rows are kept.
  const schema = readSource("prisma/schema.prisma");
  assert.match(schema, /model VisaDiscussion \{/);
});
