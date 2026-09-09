/* eslint-disable @typescript-eslint/no-explicit-any -- The isolated renderer accepts arbitrary component props and hook values. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import { ALL_PERMISSION_KEYS } from "../lib/permission-keys";

const require = createRequire(import.meta.url);
type Node = { type: string; props: Record<string, any> };

// Exercise the real handlers with isolated hook state and transport. No browser,
// database or external calls are made; child visual components are placeholders.
function harness(file: string, props: Record<string, unknown>, transport: typeof fetch, named?: string) {
  const slots: any[] = [];
  let cursor = 0;
  const navigation: string[] = [];
  const effects: (() => void)[] = [];
  const scheduled: (() => void)[] = [];
  const localStorage = { removeItem() {} };
  const createElement = (type: string, values: object | null, ...children: unknown[]): Node => ({ type, props: { ...values, children } });
  const react = {
    createElement,
    useState(initial: unknown) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === "function" ? initial() : initial;
      return [slots[i], (next: unknown) => { slots[i] = typeof next === "function" ? next(slots[i]) : next; }];
    },
    useRef(initial: unknown) { return react.useState({ current: initial })[0]; },
    useMemo(callback: () => unknown) { return callback(); },
    useEffect(callback: () => void) { effects.push(callback); },
  };
  const filename = resolve(file);
  const source = readFileSync(filename, "utf8") + (named ? `\nexports.__testComponent = ${named};` : "");
  const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText;
  const compiledModule = { exports: {} as Record<string, any> };
  runInNewContext(output, {
    module: compiledModule, exports: compiledModule.exports, React: react, fetch: transport, confirm: () => true,
    setTimeout: () => 0, clearTimeout() {},
    window: { localStorage, setTimeout(callback: () => void) { scheduled.push(callback); return 0; }, clearTimeout() {} },
    require(id: string) {
      if (id === "react") return react;
      if (id === "next/navigation") return { useRouter: () => ({ refresh: () => navigation.push("refresh"), push: (url: string) => navigation.push(url) }) };
      if (id === "lucide-react") return new Proxy({}, { get: (_, name) => String(name) });
      if (id.startsWith("@/lib/")) return require(resolve(id.replace("@/", "")));
      return { __esModule: true, default: id };
    },
  });
  const Component = named ? compiledModule.exports.__testComponent : compiledModule.exports.default;
  const render = () => { cursor = 0; return Component(props) as Node; };
  const runEffects = () => {
    for (const callback of effects.splice(0)) callback();
    for (const callback of scheduled.splice(0)) callback();
  };
  return { render, navigation, runEffects, localStorage };
}

function all(root: unknown, predicate: (node: Node) => boolean): Node[] {
  if (Array.isArray(root)) return root.flatMap((child) => all(child, predicate));
  if (!root || typeof root !== "object" || !("props" in root)) return [];
  const node = root as Node;
  return [...(predicate(node) ? [node] : []), ...all(node.props.children, predicate)];
}
function one(root: unknown, predicate: (node: Node) => boolean): Node {
  const result = all(root, predicate);
  assert.equal(result.length, 1, "expected exactly one control");
  return result[0];
}
function text(root: unknown): string {
  if (Array.isArray(root)) return root.map(text).join(" ");
  if (root && typeof root === "object" && "props" in root) return text((root as Node).props.children);
  return typeof root === "string" || typeof root === "number" ? String(root) : "";
}
const fail = async () => Response.json({ error: "Tidak memiliki izin" }, { status: 403 });
const offline = async () => { throw new TypeError("Failed to fetch"); };

for (const [name, transport] of [["HTTP", fail], ["network", offline]] as const) {
  test(`delete failure (${name}) stays retryable and does not refresh`, async (t) => {
    t.mock.method(globalThis, "fetch", transport);
    const h = harness("components/admin/DeleteButton.tsx", { id: "x", endpoint: "/api/tours", label: "tour" }, transport);
    one(h.render(), (n) => n.type === "button").props.onClick();
    await one(h.render(), (n) => n.type === "button" && text(n) === "Ya").props.onClick();
    assert.equal(one(h.render(), (n) => n.type === "button" && text(n) === "Ya").props.disabled, false);
    assert.ok(all(h.render(), (n) => n.props.role === "alert").length);
    assert.deepEqual(h.navigation, []);
  });

  test(`pin failure (${name}) rolls back and re-enables button`, async (t) => {
    t.mock.method(globalThis, "fetch", transport);
    const h = harness("components/admin/TourPinButton.tsx", { id: "x", pinned: false }, transport);
    await one(h.render(), (n) => n.type === "button").props.onClick();
    const button = one(h.render(), (n) => n.type === "button");
    assert.equal(button.props.disabled, false);
    assert.equal(button.props["aria-label"], "Pin tour");
    assert.deepEqual(h.navigation, []);
    assert.ok(all(h.render(), (n) => n.props.role === "alert").length);
  });

  test(`inquiry status failure (${name}) restores previous status`, async (t) => {
    t.mock.method(globalThis, "fetch", transport);
    const h = harness("app/admin/inquiries/InquiryRow.tsx", { inquiry: { id: "x", name: "Rina", whatsapp: "0811", status: "NEW", createdAt: "2026-09-01" }, statusLabel: { NEW: "Baru", CLOSED: "Selesai" } }, transport);
    await one(h.render(), (n) => n.type === "select").props.onChange({ target: { value: "CLOSED" } });
    assert.equal(one(h.render(), (n) => n.type === "select").props.value, "NEW");
    assert.equal(one(h.render(), (n) => n.type === "select").props.disabled, false);
    assert.ok(all(h.render(), (n) => n.props.role === "alert").length);
    assert.deepEqual(h.navigation, []);
  });
}

test("blog edit omits unchanged published field and a failed save preserves content", async (t) => {
  let body: Record<string, unknown> = {};
  const transport: typeof fetch = async (_url, init) => { body = JSON.parse(String(init?.body)); return fail(); };
  t.mock.method(globalThis, "fetch", transport);
  const h = harness("components/admin/BlogForm.tsx", { post: { id: "x", title: "Original", slug: "original", published: false } }, transport);
  one(h.render(), (n) => n.type === "input" && n.props.placeholder === "Judul artikel").props.onChange({ target: { value: "Revised" } });
  await h.render().props.onSubmit({ preventDefault() {} });
  assert.equal(body.title, "Revised");
  assert.equal("published" in body, false);
  assert.equal(one(h.render(), (n) => n.type === "input" && n.props.placeholder === "Judul artikel").props.value, "Revised");
  assert.match(text(h.render()), /Tidak memiliki izin/);
  assert.deepEqual(h.navigation, []);
});

test("permissions card exposes all permissions via a keyboard button and named checked switches", () => {
  const h = harness("app/admin/permissions/page.tsx", { user: { id: "x", name: "Editor", email: "editor@example.test", role: "EDITOR", permissions: {} }, onSaved() {} }, fail, "UserPermCard");
  const expand = one(h.render(), (n) => n.type === "button" && n.props["aria-expanded"] === false);
  expand.props.onClick();
  assert.equal(one(h.render(), (n) => n.type === "button" && "aria-expanded" in n.props).props["aria-expanded"], true);
  const switches = all(h.render(), (n) => n.props.role === "switch");
  assert.equal(switches.length, ALL_PERMISSION_KEYS.length);
  for (const control of switches) {
    assert.ok(control.props["aria-label"]);
    assert.equal(typeof control.props["aria-checked"], "boolean");
  }
  assert.ok(switches.some((n) => n.props["aria-label"] === "Moderasi Diskusi Visa"));
});

for (const [file, props] of [
  ["components/admin/BlogForm.tsx", { post: { id: "x", title: "Article", slug: "article", published: false } }],
  ["components/admin/TourForm.tsx", { tour: { id: "x", title: "Tour", status: "DRAFT", price: 1_000_000 } }],
  ["components/admin/CountryVisaForm.tsx", { entry: { id: "x", sortOrder: 1, flag: "vn", name: "Vietnam", en: "Vietnam", region: "Asia Tenggara", visa: "bebas", stay: "30 hari", cost: "", notes: "" } }],
  ["app/admin/testimonials/TestimonialForm.tsx", { id: "x", initial: { name: "Rina", content: "Perjalanan menyenangkan" } }],
] as const) {
  for (const [failureName, transport] of [["HTTP", fail], ["network", offline]] as const) {
    test(`${file} save failure (${failureName}) is visible and can be retried`, async (t) => {
      t.mock.method(globalThis, "fetch", transport);
      const h = harness(file, props, transport);
      await h.render().props.onSubmit({ preventDefault() {} });
      assert.equal(one(h.render(), (n) => String(n.type).endsWith("StickyFormActions")).props.loading, false);
      assert.ok(all(h.render(), (n) => n.props.role === "alert").length);
      assert.deepEqual(h.navigation, []);
    });
  }
}

test("tour edit omits only unchanged status; a changed status still reaches strict API checks", async (t) => {
  let body: Record<string, unknown> = {};
  const transport: typeof fetch = async (_url, init) => { body = JSON.parse(String(init?.body)); return fail(); };
  t.mock.method(globalThis, "fetch", transport);
  const h = harness("components/admin/TourForm.tsx", { tour: { id: "x", title: "Tour", status: "DRAFT", price: 1_000_000 } }, transport);
  await h.render().props.onSubmit({ preventDefault() {} });
  assert.equal("status" in body, false);
  one(h.render(), (n) => n.type === "select" && n.props.value === "DRAFT").props.onChange({ target: { value: "ACTIVE" } });
  await h.render().props.onSubmit({ preventDefault() {} });
  assert.equal(body.status, "ACTIVE");
  assert.deepEqual(h.navigation, []);
});

test("changed publication and new-record publication are not silently discarded", async (t) => {
  let body: Record<string, unknown> = {};
  const transport: typeof fetch = async (_url, init) => { body = JSON.parse(String(init?.body)); return fail(); };
  t.mock.method(globalThis, "fetch", transport);
  for (const props of [{ post: { id: "x", title: "Article", published: false } }, {}]) {
    const h = harness("components/admin/BlogForm.tsx", props, transport);
    one(h.render(), (n) => n.type === "input" && n.props.id === "published").props.onChange({ target: { checked: true } });
    await h.render().props.onSubmit({ preventDefault() {} });
    assert.equal(body.published, true);
  }
});

test("new tours keep their initial status when creating", async (t) => {
  let body: Record<string, unknown> = {};
  const transport: typeof fetch = async (_url, init) => { body = JSON.parse(String(init?.body)); return fail(); };
  t.mock.method(globalThis, "fetch", transport);
  const h = harness("components/admin/TourForm.tsx", {}, transport);
  await h.render().props.onSubmit({ preventDefault() {} });
  assert.equal(body.status, "DRAFT");
});

test("inquiry deletion failure is visible and preserves the row for retry", async (t) => {
  t.mock.method(globalThis, "fetch", offline);
  const h = harness("app/admin/inquiries/InquiryRow.tsx", { inquiry: { id: "x", name: "Rina", whatsapp: "0811", status: "NEW", createdAt: "2026-09-01" }, statusLabel: { NEW: "Baru" } }, offline);
  await one(h.render(), (n) => n.type === "button").props.onClick();
  assert.equal(one(h.render(), (n) => n.type === "button").props.disabled, false);
  assert.ok(all(h.render(), (n) => n.props.role === "alert").length);
  assert.deepEqual(h.navigation, []);
});

test("permissions save failure leaves switches retryable and never announces success", async (t) => {
  t.mock.method(globalThis, "fetch", offline);
  let saved = 0;
  const h = harness("app/admin/permissions/page.tsx", { user: { id: "x", name: "Editor", email: "editor@example.test", role: "EDITOR", permissions: {} }, onSaved() { saved += 1; } }, offline, "UserPermCard");
  one(h.render(), (n) => n.type === "button" && "aria-expanded" in n.props).props.onClick();
  await one(h.render(), (n) => n.type === "button" && text(n).trim() === "Simpan").props.onClick();
  assert.equal(saved, 0);
  assert.ok(all(h.render(), (n) => n.props.role === "alert").length);
  assert.equal(all(h.render(), (n) => n.props.role === "status").length, 0);
  assert.ok(all(h.render(), (n) => n.props.role === "switch").every((n) => n.props.disabled === false));
});

test("successful action paths refresh only after confirmed writes", async (t) => {
  const transport = async () => Response.json({ success: true });
  t.mock.method(globalThis, "fetch", transport);
  const deletion = harness("components/admin/DeleteButton.tsx", { id: "x", endpoint: "/api/tours", label: "tour" }, transport);
  one(deletion.render(), (n) => n.type === "button").props.onClick();
  await one(deletion.render(), (n) => n.type === "button" && text(n) === "Ya").props.onClick();
  assert.deepEqual(deletion.navigation, ["refresh"]);
  assert.equal(one(deletion.render(), (n) => n.type === "button").props["aria-label"], "Hapus tour");
  const pin = harness("components/admin/TourPinButton.tsx", { id: "x", pinned: false }, transport);
  await one(pin.render(), (n) => n.type === "button").props.onClick();
  assert.deepEqual(pin.navigation, ["refresh"]);
  assert.equal(one(pin.render(), (n) => n.type === "button").props["aria-label"], "Lepas pin tour");
});

test("permission loading failures do not masquerade as an empty user list", async (t) => {
  t.mock.method(globalThis, "fetch", fail);
  const h = harness("app/admin/permissions/page.tsx", {}, fail);
  h.render();
  h.runEffects();
  await new Promise((done) => setImmediate(done));
  assert.match(text(h.render()), /Tidak memiliki izin/);
  assert.doesNotMatch(text(h.render()), /Belum ada pengguna/);
  assert.equal(one(h.render(), (n) => n.type === "button" && text(n) === "Coba lagi").props.disabled, false);
});

test("a confirmed tour save is not reported as failed when local draft cleanup is blocked", async (t) => {
  const transport = async () => Response.json({ success: true });
  t.mock.method(globalThis, "fetch", transport);
  const h = harness("components/admin/TourForm.tsx", { tour: { id: "x", title: "Tour", status: "DRAFT", price: 1_000_000 } }, transport);
  h.localStorage.removeItem = () => { throw new Error("Storage unavailable"); };
  await h.render().props.onSubmit({ preventDefault() {} });
  assert.deepEqual(h.navigation, ["/admin/tours", "refresh"]);
  assert.equal(all(h.render(), (n) => n.props.role === "alert").length, 0);
});

test("successful form saves navigate only after the write and reset loading", async (t) => {
  const transport = async () => Response.json({ id: "x" });
  t.mock.method(globalThis, "fetch", transport);
  for (const [file, props, href] of [
    ["components/admin/BlogForm.tsx", { post: { id: "x", title: "Article", published: false } }, "/admin/blog"],
    ["components/admin/TourForm.tsx", { tour: { id: "x", title: "Tour", status: "DRAFT" } }, "/admin/tours"],
    ["components/admin/CountryVisaForm.tsx", {}, "/admin/database-visa"],
    ["app/admin/testimonials/TestimonialForm.tsx", { initial: { name: "Rina", content: "Perjalanan menyenangkan" } }, "/admin/testimonials"],
  ] as const) {
    const h = harness(file, props, transport);
    await h.render().props.onSubmit({ preventDefault() {} });
    assert.deepEqual(h.navigation, [href, "refresh"]);
    assert.equal(one(h.render(), (n) => String(n.type).endsWith("StickyFormActions")).props.loading, false);
    assert.equal(all(h.render(), (n) => n.props.role === "alert").length, 0);
  }
});

test("testimonial rating and publication controls expose their selected state", () => {
  const h = harness("app/admin/testimonials/TestimonialForm.tsx", {}, fail);
  const rating = one(h.render(), (n) => n.props["aria-label"] === "Rating 3 dari 5");
  rating.props.onClick();
  assert.equal(one(h.render(), (n) => n.props["aria-label"] === "Rating 3 dari 5").props["aria-pressed"], true);
  const published = one(h.render(), (n) => n.props.role === "switch");
  assert.equal(published.props["aria-checked"], true);
  published.props.onClick();
  assert.equal(one(h.render(), (n) => n.props.role === "switch").props["aria-checked"], false);
});
