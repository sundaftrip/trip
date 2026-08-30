import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { isAllowedTranslationOrigin } from "../lib/translation-origin";

const preview = {
  VERCEL_ENV: "preview",
  VERCEL_URL: "sundaftrip-abc123-sundaftrips-projects.vercel.app",
  VERCEL_BRANCH_URL: "sundaftrip-git-preview-sundaftrips-projects.vercel.app",
};

test("preserves missing Origin and existing public/local HTTP(S) callers", () => {
  for (const origin of [
    null,
    "",
    "https://sundaftrip.com",
    "https://www.sundaftrip.com",
    "http://sundaftrip.com",
    "https://sundaftrip.com:8443",
    "http://localhost:3000",
    "https://localhost:3001",
    "http://127.0.0.1:4310",
  ]) {
    assert.equal(isAllowedTranslationOrigin(origin, {}), true, String(origin));
  }
});

test("allows exactly this preview's deployment and branch HTTPS origins", () => {
  for (const host of [preview.VERCEL_URL, preview.VERCEL_BRANCH_URL]) {
    assert.equal(isAllowedTranslationOrigin(`https://${host}`, preview), true);
    assert.equal(isAllowedTranslationOrigin(`https://${host}:443`, preview), true);
    assert.equal(isAllowedTranslationOrigin(`https://${host.toUpperCase()}`, preview), true);
    assert.equal(isAllowedTranslationOrigin(`http://${host}`, preview), false);
    assert.equal(isAllowedTranslationOrigin(`https://${host}:8443`, preview), false);
    assert.equal(isAllowedTranslationOrigin(`https://${host}:65536`, preview), false);
  }
});

test("does not trust arbitrary, older, or lookalike Vercel deployments", () => {
  for (const origin of [
    "https://unrelated.vercel.app",
    "https://sundaftrip-previous-sundaftrips-projects.vercel.app",
    "https://sundaftrip.com.evil.example",
    "https://vercel.app",
    `https://${preview.VERCEL_URL}.evil.example`,
    `https://evil.${preview.VERCEL_URL}`,
    `https://${preview.VERCEL_URL}.`,
  ]) {
    assert.equal(isAllowedTranslationOrigin(origin, preview), false, origin);
  }
});

test("preview origins are disabled outside a configured preview environment", () => {
  for (const VERCEL_ENV of [undefined, "", "production", "development", "staging", "Preview"]) {
    assert.equal(isAllowedTranslationOrigin(`https://${preview.VERCEL_URL}`, {
      ...preview, VERCEL_ENV,
    }), false);
  }

  assert.equal(isAllowedTranslationOrigin(`https://${preview.VERCEL_URL}`, {
    VERCEL_ENV: "preview",
  }), false);
});

test("malformed or non-Vercel configured hosts fail closed independently", () => {
  const malformedHosts = [
    "",
    "example.org",
    "vercel.app",
    "*.vercel.app",
    "nested.preview.vercel.app",
    `https://${preview.VERCEL_URL}`,
    `http://${preview.VERCEL_URL}`,
    `${preview.VERCEL_URL}:443`,
    `${preview.VERCEL_URL}/`,
    `${preview.VERCEL_URL}?query=1`,
    `${preview.VERCEL_URL}#fragment`,
    `${preview.VERCEL_URL}.evil.example`,
    `user@${preview.VERCEL_URL}`,
    ` ${preview.VERCEL_URL}`,
    `${preview.VERCEL_URL}\n`,
    "-preview.vercel.app",
    "preview-.vercel.app",
    `${"a".repeat(64)}.vercel.app`,
  ];

  for (const host of malformedHosts) {
    for (const key of ["VERCEL_URL", "VERCEL_BRANCH_URL"] as const) {
      const environment = { VERCEL_ENV: "preview", [key]: host };
      assert.equal(isAllowedTranslationOrigin(`https://${preview.VERCEL_URL}`, environment), false, host);
      assert.equal(isAllowedTranslationOrigin(`https://${host}`, environment), false, host);
    }
    assert.equal(isAllowedTranslationOrigin(`https://${preview.VERCEL_BRANCH_URL}`, {
      ...preview, VERCEL_URL: host,
    }), true, "A bad deployment URL must not invalidate a valid branch URL");
  }
});

test("rejects malformed, credential-bearing, non-HTTP(S), and non-origin values", () => {
  for (const host of ["sundaftrip.com", preview.VERCEL_URL]) {
    for (const origin of [
      `https://user@${host}`,
      `https://user:password@${host}`,
      `https://${host}/`,
      `https://${host}/path`,
      `https://${host}?q=1`,
      `https://${host}#section`,
      `ftp://${host}`,
      `file://${host}`,
      `//${host}`,
      `https:\\\\${host}`,
      ` https://${host}`,
      `https://${host}\n`,
      `https://${host} https://example.org`,
      `https://${host},https://example.org`,
      `https://${host}:invalid`,
      `https://${host}:65536`,
    ]) {
      assert.equal(isAllowedTranslationOrigin(origin, preview), false, origin);
    }
  }
  for (const origin of ["null", "http://127.1", "http://2130706433", "https://%73undaftrip.com"]) {
    assert.equal(isAllowedTranslationOrigin(origin, preview), false, origin);
  }
});

test("translation route enforces the helper before rate limiting or external work", () => {
  const source = readFileSync(new URL("../app/api/translate/route.ts", import.meta.url), "utf8");
  const handler = source.slice(source.indexOf("export async function POST"));
  assert.match(handler, /if \(!isAllowedTranslationOrigin\(req\.headers\.get\("origin"\)\)\)/);
  assert.ok(handler.indexOf("isAllowedTranslationOrigin") < handler.indexOf("rateLimit("));
  assert.match(handler, /\{ error: "Forbidden" \}, \{ status: 403 \}/);
  assert.doesNotMatch(handler, /req\.nextUrl|headers\.get\("(?:host|x-forwarded-host)"\)/);
});
