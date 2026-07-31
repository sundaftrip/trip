import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeRichHtml } from "../lib/sanitize-rich-html";

test("preserves useful editorial markup and safe attributes", () => {
  const sanitized = sanitizeRichHtml(`
    <h2 id="requirements" class="ignored">Requirements</h2>
    <p>Bring <strong>documents</strong> and <a href="/visa" title="Visa">apply</a>.</p>
    <blockquote cite="https://example.com/source">Quoted guidance</blockquote>
    <table><thead><tr><th scope="col">Item</th></tr></thead><tbody><tr><td colspan="2">Passport</td></tr></tbody></table>
    <figure><img src="https://example.com/passport.jpg" alt="Passport" width="640" height="480" loading="lazy" decoding="async"><figcaption>Passport</figcaption></figure>
  `);

  assert.match(sanitized, /<h2 id="requirements">Requirements<\/h2>/);
  assert.match(sanitized, /<a href="\/visa" title="Visa">apply<\/a>/);
  assert.match(sanitized, /<blockquote cite="https:\/\/example\.com\/source">/);
  assert.match(sanitized, /<th scope="col">Item<\/th>/);
  assert.match(sanitized, /<td colspan="2">Passport<\/td>/);
  assert.match(
    sanitized,
    /<img src="https:\/\/example\.com\/passport\.jpg" alt="Passport" width="640" height="480" loading="lazy" decoding="async" \/>/,
  );
  assert.equal(sanitized.includes("class="), false);
});

test("removes scripts, event handlers, inline styles, and unsafe elements", () => {
  const sanitized = sanitizeRichHtml(`
    <script>alert("script")</script>
    <style>body { display: none }</style>
    <iframe src="https://evil.example"></iframe>
    <p onclick="alert('click')" style="color:red">Safe text</p>
    <img src="https://example.com/image.jpg" onerror="alert('image')" style="width: 1px">
  `);

  assert.equal(sanitized.includes("script"), false);
  assert.equal(sanitized.includes("display: none"), false);
  assert.equal(sanitized.includes("iframe"), false);
  assert.equal(sanitized.includes("onclick"), false);
  assert.equal(sanitized.includes("onerror"), false);
  assert.equal(sanitized.includes("style="), false);
  assert.match(sanitized, /<p>Safe text<\/p>/);
  assert.match(sanitized, /<img src="https:\/\/example\.com\/image\.jpg" \/>/);
});

test("removes unsafe link and image protocols", () => {
  const sanitized = sanitizeRichHtml(`
    <a href="javascript:alert('xss')">unsafe link</a>
    <a href="mailto:hello@example.com">email</a>
    <img src="data:image/svg+xml,<svg onload=alert(1)></svg>" alt="unsafe image">
  `);

  assert.match(sanitized, /<a>unsafe link<\/a>/);
  assert.match(sanitized, /<a href="mailto:hello@example\.com">email<\/a>/);
  assert.equal(sanitized.includes("javascript:"), false);
  assert.equal(sanitized.includes("data:image"), false);
  assert.equal(sanitized.includes("<img"), false);
});

test("protects links that open a new tab", () => {
  const sanitized = sanitizeRichHtml(
    '<a href="https://example.com" target="_blank" rel="nofollow ignored">Visit</a>',
  );

  assert.equal(
    sanitized,
    '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">Visit</a>',
  );
});
