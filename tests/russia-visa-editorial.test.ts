/* eslint-disable @typescript-eslint/no-explicit-any -- Isolated React handlers and server-rendered element tree. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
type Node = { type: any; props: Record<string, any> };
const variant = { id: "stable-variant", name: "e-Visa", priceIDR: 1_600_000, processingTime: "5 hari kerja", notes: "30 hari" };
const entry = {
  id: "russia-id", sortOrder: 72, flag: "ru", name: "Rusia", en: "Russia", region: "Eropa Non-Schengen", visa: "evisa",
  stay: "30 hari", cost: "Rp 1.600.000", officialFee: "Cek portal resmi", servicePrice: "Rp 1.600.000", notes: "Pengajuan online.",
  sourceUrl: "https://evisa.kdmid.ru/", lastVerifiedAt: "2026-06-29", conditions: ["Gunakan port masuk yang diizinkan"],
  eligibility: [], documents: [], faqs: [], variants: [variant],
};

function harness(file: string, props: Record<string, any>, country = entry) {
  const slots: any[] = [];
  let cursor = 0;
  const requests: { url: string; method: string; body: Record<string, any> }[] = [];
  const react = {
    createElement: (type: any, props: object | null, ...children: unknown[]): Node => ({ type, props: { ...props, children } }),
    useState(initial: unknown) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === "function" ? initial() : initial;
      return [slots[i], (next: unknown) => { slots[i] = typeof next === "function" ? next(slots[i]) : next; }];
    },
  };
  const output = ts.transpileModule(readFileSync(resolve(file), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText;
  const compiled = { exports: {} as Record<string, any> };
  runInNewContext(output, {
    module: compiled, exports: compiled.exports, React: react,
    fetch: async (url: string, init: RequestInit) => { requests.push({ url, method: String(init.method), body: JSON.parse(String(init.body)) }); return { ok: true }; },
    require(id: string) {
      if (id === "react") return react;
      if (id === "next/navigation") return { useRouter: () => ({ push() {}, refresh() {} }), notFound() { throw new Error("not found"); } };
      if (id === "@/lib/prisma") return { prisma: { countryVisa: { findMany: async () => [country] }, companyInfo: { findMany: async () => [] }, testimonial: { findMany: async () => [] } } };
      if (id === "@/lib/visa-slug") return { findBySlug: (rows: any[]) => rows[0] };
      if (id === "@/lib/utils") return { toWaNumber: () => "" };
      if (id === "@/lib/visa-defaults" || id === "@/lib/safe-json-ld") return require(resolve(id.replace("@/", "")));
      if (id === "lucide-react") return new Proxy({}, { get: (_, name) => String(name) });
      return { __esModule: true, default: id };
    },
  });
  return { render() { cursor = 0; return compiled.exports.default(props); }, requests };
}

function all(root: unknown, predicate: (node: Node) => boolean): Node[] {
  if (Array.isArray(root)) return root.flatMap((child) => all(child, predicate));
  if (!root || typeof root !== "object" || !("props" in root)) return [];
  const node = root as Node;
  return [...(predicate(node) ? [node] : []), ...all(node.props.children, predicate)];
}
function one(root: unknown, predicate: (node: Node) => boolean): Node {
  const nodes = all(root, predicate);
  assert.equal(nodes.length, 1, "expected exactly one control");
  return nodes[0];
}
function text(root: unknown): string {
  if (Array.isArray(root)) return root.map(text).join(" ");
  if (root && typeof root === "object" && "props" in root) return text((root as Node).props.children);
  return typeof root === "string" || typeof root === "number" ? String(root) : "";
}
const form = (data?: typeof entry) => harness("components/admin/CountryVisaForm.tsx", data ? { entry: data } : {});
const submit = (h: ReturnType<typeof harness>) => h.render().props.onSubmit({ preventDefault() {} });

test("country factual edits omit unchanged variants while retaining other commercial fields", async () => {
  const h = form(entry);
  one(h.render(), (n) => n.type === "input" && n.props.type === "date").props.onChange({ target: { value: "2026-09-12" } });
  one(h.render(), (n) => n.props.title === "Syarat Kelayakan (Eligibility)").props.onAdd();
  one(h.render(), (n) => n.props.title === "Syarat Kelayakan (Eligibility)").props.onChange(0, "Paspor sesuai persyaratan Rusia");
  one(h.render(), (n) => n.type === "button" && text(n).includes("Tambah Dokumen")).props.onClick();
  one(h.render(), (n) => n.type === "input" && n.props.placeholder === "Paspor").props.onChange({ target: { value: "Foto halaman biodata paspor" } });
  await submit(h);
  assert.equal(h.requests[0].method, "PUT");
  assert.equal("variants" in h.requests[0].body, false);
  assert.equal(h.requests[0].body.lastVerifiedAt, "2026-09-12");
  assert.deepEqual(h.requests[0].body.eligibility, ["Paspor sesuai persyaratan Rusia"]);
  assert.deepEqual(h.requests[0].body.documents, [{ name: "Foto halaman biodata paspor", hint: "" }]);
  assert.equal(h.requests[0].body.servicePrice, entry.servicePrice);
  assert.deepEqual(h.requests[0].body.conditions, entry.conditions);
});

test("actual variant price changes, reorder and deletion still reach PUT", async () => {
  const changed = form(entry);
  one(changed.render(), (n) => n.type === "input" && n.props.placeholder === "950000").props.onChange({ target: { value: "1700000" } });
  await submit(changed);
  assert.equal(changed.requests[0].body.variants[0].priceIDR, 1_700_000);

  const reordered = form({ ...entry, variants: [variant, { ...variant, id: "second", name: "Visa reguler" }] });
  one(reordered.render(), (n) => n.props["aria-label"] === "Pindah ke bawah" && !n.props.disabled).props.onClick();
  await submit(reordered);
  assert.deepEqual(reordered.requests[0].body.variants.map((v: any) => [v.name, v.sortOrder]), [["Visa reguler", 0], ["e-Visa", 1]]);

  const deleted = form(entry);
  one(deleted.render(), (n) => n.props["aria-label"] === "Hapus varian").props.onClick();
  await submit(deleted);
  assert.deepEqual(deleted.requests[0].body.variants, []);
});

test("creation includes variants and reverting a variant edit omits unnecessary replacement", async () => {
  const created = form();
  await submit(created);
  assert.equal(created.requests[0].method, "POST");
  assert.deepEqual(created.requests[0].body.variants, []);

  const reverted = form(entry);
  const price = () => one(reverted.render(), (n) => n.type === "input" && n.props.placeholder === "950000");
  price().props.onChange({ target: { value: "1700000" } });
  price().props.onChange({ target: { value: "1600000" } });
  await submit(reverted);
  assert.equal("variants" in reverted.requests[0].body, false);
});

test("Russia alone distinguishes application documents and official timing from the service estimate", async () => {
  for (const country of [entry, { ...entry, name: "Vietnam", en: "Vietnam" }]) {
    const slug = country.en.toLowerCase();
    const h = harness("app/(website)/visa/[slug]/page.tsx", { params: Promise.resolve({ slug }) }, country);
    const page = await h.render();
    const docs = one(page, (n) => n.props.id === "dokumen");
    if (slug === "russia") {
      assert.match(text(docs), /Dokumen dan persiapan e-Visa/);
      assert.match(text(docs), /konfirmasi hotel bukan lampiran wajib/);
      assert.equal(one(docs, (n) => n.type === "a").props.href, "https://evisa.kdmid.ru/Home/Instruction");
      const schema = all(page, (n) => n.type === "script").map((n) => JSON.parse(n.props.dangerouslySetInnerHTML.__html)).find((s) => s["@type"] === "FAQPage");
      const answer = schema.mainEntity.find((q: any) => q.name === "Berapa lama proses e-Visa Rusia?").acceptedAnswer.text;
      assert.match(answer, /4 hari kalender/);
      assert.match(answer, /dihitung ulang/);
      assert.match(answer, /5 hari kerja/);
      assert.match(answer, /bukan batas waktu resmi otoritas atau jaminan visa terbit/);
      assert.ok(text(page).includes(answer), "visible FAQ and structured answer must agree");
    } else {
      assert.match(text(docs), /Dokumen Wajib/);
      assert.match(text(docs), /booking akomodasi, Sundaf yang siapkan/);
      assert.doesNotMatch(text(docs), /bukan lampiran wajib/);
      assert.doesNotMatch(text(page), /4 hari kalender/);
    }
  }
});
