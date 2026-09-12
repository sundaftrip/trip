/* eslint-disable @typescript-eslint/no-explicit-any -- Isolated component hook and event harness. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";

type Node = { type: string; props: Record<string, any> };

// Run the actual form handlers with isolated React state and a captured request.
// Child controls are placeholders: no browser, database, or network is used.
function harness(body: string) {
  const slots: any[] = [];
  let cursor = 0;
  const requests: { url: string; init: RequestInit; payload: Record<string, unknown> }[] = [];
  const react = {
    createElement: (type: string, props: object | null, ...children: unknown[]): Node => ({ type, props: { ...props, children } }),
    useState(initial: unknown) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], (next: unknown) => { slots[index] = typeof next === "function" ? next(slots[index]) : next; }];
    },
    useRef(initial: unknown) { return react.useState({ current: initial })[0]; },
  };
  const output = ts.transpileModule(readFileSync(resolve("components/admin/BlogForm.tsx"), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText;
  const compiled = { exports: {} as Record<string, any> };
  runInNewContext(output, {
    module: compiled,
    exports: compiled.exports,
    React: react,
    fetch: async (url: string, init: RequestInit) => {
      requests.push({ url, init, payload: JSON.parse(String(init.body)) });
      return { ok: true };
    },
    require(id: string) {
      if (id === "react") return react;
      if (id === "next/navigation") return { useRouter: () => ({ push() {} }) };
      return { __esModule: true, default: id };
    },
  });
  return {
    render() {
      cursor = 0;
      return compiled.exports.default({ post: { id: "blog-id", slug: "rusia", title: "Rusia", body, published: true } }) as Node;
    },
    requests,
  };
}

function all(root: unknown, predicate: (node: Node) => boolean): Node[] {
  if (Array.isArray(root)) return root.flatMap((child) => all(child, predicate));
  if (!root || typeof root !== "object" || !("props" in root)) return [];
  const node = root as Node;
  return [...(predicate(node) ? [node] : []), ...all(node.props.children, predicate)];
}

function one(root: Node, predicate: (node: Node) => boolean): Node {
  const nodes = all(root, predicate);
  assert.equal(nodes.length, 1, "expected exactly one control");
  return nodes[0];
}

const sourceControl = (node: Node) => node.type === "textarea" && node.props.id === "blog-body-html";
const visualControl = (node: Node) => node.type === "./RichTextEditor";
const sourceButton = (node: Node) => node.type === "button" && node.props.children.includes("Edit HTML");
const submit = (node: Node) => node.props.onSubmit({ preventDefault() {} });
const faqBody = '<p data-guide="rusia">Asuransi perlu diperiksa.</p>\n<script type="application/ld+json">\n{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[]}\n</script>\n';

test("stored FAQ JSON-LD never mounts the visual editor and survives a metadata-only save byte for byte", async () => {
  const h = harness(faqBody);
  assert.equal(all(h.render(), visualControl).length, 0);
  assert.equal(one(h.render(), sourceControl).props.value, faqBody);
  one(h.render(), (n) => n.type === "input" && n.props.placeholder === "cth: Umroh, Travel Tips").props.onChange({ target: { value: "Rusia" } });
  await submit(h.render());
  assert.equal(h.requests[0].url, "/api/blog/blog-id");
  assert.equal(h.requests[0].init.method, "PUT");
  assert.equal(h.requests[0].payload.body, faqBody);
  assert.equal(h.requests[0].payload.category, "Rusia");
  assert.equal(h.requests[0].payload.published, true);
});

test("raw paragraph edits retain JSON-LD, whitespace, and unknown HTML attributes through save", async () => {
  const h = harness(faqBody);
  const edited = faqBody.replace("Asuransi perlu diperiksa.", "Periksa cakupan dan masa berlaku asuransi.");
  one(h.render(), sourceControl).props.onChange({ target: { value: edited } });
  one(h.render(), (n) => n.type === "input" && n.props.id === "published").props.onChange({ target: { checked: false } });
  assert.equal(one(h.render(), sourceControl).props.value, edited);
  await submit(h.render());
  assert.equal(h.requests[0].payload.body, edited);
  assert.equal(h.requests[0].payload.published, false);
});

test("script variants use source mode before mount without depending on type attribute syntax", () => {
  for (const body of [
    "<SCRIPT TYPE='application/ld+json'>{}</SCRIPT>",
    "<script\n type=application/ld+json>{}</script>",
    '<script id="faq" type = "application/ld+json">{}</script>',
    "<p>Text</p><script>custom()</script>",
  ]) {
    const h = harness(body);
    assert.equal(all(h.render(), visualControl).length, 0);
    assert.equal(one(h.render(), sourceControl).props.value, body);
  }
});

test("normal articles retain visual editing by default and save visual changes", async () => {
  const h = harness("<p>Original</p>");
  assert.equal(all(h.render(), sourceControl).length, 0);
  one(h.render(), visualControl).props.onChange("<p>Updated visually</p>");
  await submit(h.render());
  assert.equal(h.requests[0].payload.body, "<p>Updated visually</p>");
});

test("switching to HTML retains the latest draft and ignores late visual callbacks before and after rerender", async () => {
  const h = harness("<p>Original</p>");
  const visual = one(h.render(), visualControl);
  visual.props.onChange("<p>Visual draft</p>");
  one(h.render(), sourceButton).props.onClick();
  visual.props.onChange("<p>Stale update during unmount</p>");
  assert.equal(one(h.render(), sourceControl).props.value, "<p>Visual draft</p>");
  one(h.render(), sourceControl).props.onChange({ target: { value: faqBody } });
  visual.props.onChange("<p>Stale update after raw edit</p>");
  assert.equal(all(h.render(), visualControl).length, 0);
  assert.equal(all(h.render(), sourceButton).length, 0);
  assert.equal(one(h.render(), sourceControl).props.value, faqBody);
  await submit(h.render());
  assert.equal(h.requests[0].payload.body, faqBody);
});
