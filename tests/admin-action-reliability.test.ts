import assert from "node:assert/strict";
import test from "node:test";
import { adminActionError, omitUnchangedFields, requestAdminAction } from "../lib/admin-action";
import { DEFAULT_PERMISSIONS, PERMISSION_LABELS } from "../lib/permission-keys";
import { requiredPermissionsForMutation } from "../lib/authorization";

test("unchanged privileged fields are omitted without changing either input", () => {
  const payload = { title: "Updated", published: false, status: "DRAFT" };
  const initial = { title: "Before", published: false, status: "DRAFT" };
  assert.deepEqual(omitUnchangedFields(payload, initial, ["published", "status"]), { title: "Updated" });
  assert.equal(payload.published, false);
  assert.equal(initial.title, "Before");
});

test("changed privileged fields and new-record fields are preserved", () => {
  assert.deepEqual(omitUnchangedFields({ published: true }, { published: false }, ["published"]), { published: true });
  assert.deepEqual(omitUnchangedFields({ status: "DRAFT" }, {}, ["status"]), { status: "DRAFT" });
});

test("ordinary Editor saves omit unchanged publication/status but changed values still require permission", () => {
  for (const [field, value, changed, edit, special] of [
    ["published", false, true, "blog_edit", "blog_publish"],
    ["status", "DRAFT", "ACTIVE", "tour_edit", "tour_status"],
  ] as const) {
    const initial = { title: "Before", [field]: value };
    const payload = omitUnchangedFields({ title: "After", [field]: value }, initial, [field]);
    assert.deepEqual(requiredPermissionsForMutation(payload, edit, { [field]: special }), [edit]);
    assert.equal(DEFAULT_PERMISSIONS.EDITOR[edit], true);
    const changedPayload = omitUnchangedFields<Record<string, unknown>>({ title: "After", [field]: changed }, initial, [field]);
    assert.ok(requiredPermissionsForMutation(changedPayload, edit, { [field]: special }).includes(special));
    assert.equal(DEFAULT_PERMISSIONS.EDITOR[special], false);
  }
});

test("successful admin requests keep the response available to the caller", async (t) => {
  const response = Response.json({ id: "saved" });
  t.mock.method(globalThis, "fetch", async () => response);
  assert.equal(await requestAdminAction("/api/example", { method: "POST" }, "Gagal"), response);
  assert.deepEqual(await response.json(), { id: "saved" });
});

test("admin requests expose server errors and safely handle non-JSON error pages", async (t) => {
  for (const [response, expected] of [
    [Response.json({ error: "Tidak memiliki izin" }, { status: 403 }), "Tidak memiliki izin"],
    [Response.json({ error: "Slug sudah dipakai" }, { status: 409 }), "Slug sudah dipakai"],
    [new Response("Server error", { status: 500 }), "Gagal menyimpan"],
    [Response.json({ error: { nested: "not a message" } }, { status: 422 }), "Gagal menyimpan"],
    [Response.json({ error: "   " }, { status: 422 }), "Gagal menyimpan"],
  ] as const) {
    t.mock.method(globalThis, "fetch", async () => response);
    await assert.rejects(requestAdminAction("/api/example", {}, "Gagal menyimpan"), { message: expected });
  }
});

test("network failures give a retryable message rather than a raw exception", async (t) => {
  t.mock.method(globalThis, "fetch", async () => { throw new TypeError("Failed to fetch"); });
  await assert.rejects(requestAdminAction("/api/example", {}, "Gagal"), /Koneksi.*coba lagi/);
});

test("error feedback uses a meaningful error message or a safe fallback", () => {
  assert.equal(adminActionError(new Error("Tersambung ulang"), "Gagal"), "Tersambung ulang");
  assert.equal(adminActionError(new Error(""), "Gagal"), "Gagal");
  assert.equal(adminActionError(null, "Gagal"), "Gagal");
  assert.equal(adminActionError("not an Error", "Gagal"), "Gagal");
});

test("permission section metadata includes every public permission including visa discussions", () => {
  const sections = [...new Set(Object.values(PERMISSION_LABELS).map((item) => item.section))];
  assert.ok(sections.includes("Diskusi Visa"));
  assert.equal(Object.keys(PERMISSION_LABELS).filter((key) => sections.includes(PERMISSION_LABELS[key].section)).length, Object.keys(PERMISSION_LABELS).length);
});
