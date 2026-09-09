import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function settingsRoute(options: { allowed?: string[]; anonymous?: boolean; plan?: string; failWrite?: boolean } = {}) {
  const calls = { permissions: [] as string[], writes: [] as unknown[], transactions: 0, plan: 0, invalidations: 0, logs: 0 };
  const allowed = new Set(options.allowed ?? []);
  const source = readFileSync(new URL("../app/api/settings/route.ts", import.meta.url), "utf8");
  const modules: Record<string, unknown> = {
    "next/server": { NextResponse: { json: (body: unknown, init?: ResponseInit) => Response.json(body, init) } },
    "@/lib/prisma": { prisma: {
      companyInfo: { upsert: (args: unknown) => Promise.resolve(args) },
      $transaction: async (operations: Promise<unknown>[]) => {
        calls.transactions++;
        const values = await Promise.all(operations);
        if (options.failWrite) throw new Error("private database detail");
        calls.writes.push(...values);
        return values;
      },
    } },
    "@/lib/auth": { auth: async () => options.anonymous ? null : { user: { id: "editor", role: "EDITOR", name: "Editor" } } },
    "next/cache": { revalidateTag: () => calls.invalidations++, revalidatePath: () => calls.invalidations++ },
    "@/lib/permissions": {
      checkPermission: async (_session: unknown, key: string) => { calls.permissions.push(key); return allowed.has(key); },
      checkPermissions: async (_session: unknown, keys: string[]) => { calls.permissions.push(...keys); return keys.every((key) => allowed.has(key)); },
    },
    "@/lib/activityLog": { logActivity: async () => { calls.logs++; } },
    "@/lib/plan": { PLAN_FEATURES: { theme_tropical: "pro", color_schemes: "pro" } },
    "@/lib/license": { getPlan: async () => { calls.plan++; return options.plan ?? "pro"; } },
    "@/lib/api-error": { apiError: () => Response.json({ error: "Tidak dapat menyimpan pengaturan" }, { status: 500 }) },
  };
  const exports: { PUT?: (request: unknown) => Promise<Response> } = {};
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(compiled, { exports, require(name: string) { assert.ok(name in modules, `Unexpected module ${name}`); return modules[name]; } });
  return { calls, put: (body: unknown) => exports.PUT!({ json: async () => body }) };
}

test("settings reject anonymous writes before checking permissions or persisting", async () => {
  const route = settingsRoute({ anonymous: true });
  assert.equal((await route.put({ company_name: "Sundaf" })).status, 401);
  assert.deepEqual(route.calls.permissions, []);
  assert.equal(route.calls.transactions, 0);
});

test("company-only edits require company permission and do not consult theme licensing", async () => {
  const route = settingsRoute({ allowed: ["company_edit"], plan: "basic" });
  assert.equal((await route.put({ company_name: "Sundaf", company_whatsapp: "+62 811 162 0207" })).status, 200);
  assert.deepEqual(route.calls.permissions, ["company_edit"]);
  assert.equal(route.calls.plan, 0);
  assert.equal(route.calls.transactions, 1);
  assert.equal(route.calls.writes.length, 2);
  assert.match(JSON.stringify(route.calls.writes), /628111620207/);
});

test("appearance-only edits require appearance permission", async () => {
  const route = settingsRoute({ allowed: ["color_edit"] });
  assert.equal((await route.put({ color_accent: "#075D63" })).status, 200);
  assert.deepEqual(route.calls.permissions, ["color_edit"]);
  assert.equal(route.calls.transactions, 1);
});

test("mixed company and appearance payloads require both permissions before any write", async () => {
  for (const allowed of [["color_edit"], ["company_edit"], []]) {
    const route = settingsRoute({ allowed });
    assert.equal((await route.put({ company_phone: "08111620207", color_accent: "#075D63" })).status, 403);
    assert.deepEqual(new Set(route.calls.permissions), new Set(["company_edit", "color_edit"]));
    assert.equal(route.calls.transactions, 0);
    assert.equal(route.calls.logs, 0);
  }
});

test("mixed authorized edits commit together before success is returned", async () => {
  const route = settingsRoute({ allowed: ["company_edit", "color_edit"] });
  const response = await route.put({ company_phone: "08111620207", color_accent: "#075D63" });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  assert.equal(route.calls.transactions, 1);
  assert.equal(route.calls.writes.length, 2);
  assert.equal(route.calls.logs, 1);
});

test("invalid or empty settings do not silently discard fields and claim success", async () => {
  for (const body of [null, [], 42, "settings", {}, { company_name: 123 }, { company_name: "Sundaf", color_accent: false }]) {
    const route = settingsRoute({ allowed: ["company_edit", "color_edit"] });
    assert.equal((await route.put(body)).status, 400);
    assert.equal(route.calls.transactions, 0);
  }
});

test("appearance licensing still blocks Pro-only settings", async () => {
  for (const body of [{ site_theme: "tropical" }, { color_scheme: "custom" }]) {
    const route = settingsRoute({ allowed: ["color_edit"], plan: "basic" });
    assert.equal((await route.put(body)).status, 403);
    assert.equal(route.calls.transactions, 0);
  }
});

test("generic settings cannot bypass the explicit permissioned FAQ source control", async () => {
  const route = settingsRoute({ allowed: ["company_edit", "color_edit", "text_edit"] });
  assert.equal((await route.put({ faq_general_source: "cms" })).status, 400);
  assert.equal(route.calls.transactions, 0);
});

test("company editors cannot write hidden credential keys through generic settings", async () => {
  for (const key of ["keuangan_reset_hash", "api_key", "private-key", "admin_password", "access_token"]) {
    const route = settingsRoute({ allowed: ["company_edit", "color_edit"] });
    assert.equal((await route.put({ [key]: "replacement" })).status, 400);
    assert.equal(route.calls.transactions, 0);
  }
});

test("failed settings transaction neither reports success nor invalidates public caches", async () => {
  const route = settingsRoute({ allowed: ["company_edit"], failWrite: true });
  const response = await route.put({ company_name: "Sundaf", company_phone: "08111620207" });
  assert.equal(response.status, 500);
  assert.doesNotMatch(await response.text(), /private database detail/);
  assert.equal(route.calls.writes.length, 0);
  assert.equal(route.calls.invalidations, 0);
  assert.equal(route.calls.logs, 0);
});
