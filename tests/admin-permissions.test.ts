import assert from "node:assert/strict";
import test from "node:test";
import {
  ALL_PERMISSION_KEYS,
  DEFAULT_PERMISSIONS,
  PERMISSION_LABELS,
} from "../lib/permission-keys";
import {
  isViewerRole,
  isViewerWriteBlockedPath,
  shouldBlockViewerMutation,
} from "../lib/viewer-access";

test("finance permissions are registered and default-deny for editors", () => {
  assert.ok(ALL_PERMISSION_KEYS.includes("finance_view"));
  assert.ok(ALL_PERMISSION_KEYS.includes("finance_edit"));
  assert.equal(PERMISSION_LABELS.finance_view.section, "Keuangan");
  assert.equal(PERMISSION_LABELS.finance_edit.section, "Keuangan");

  assert.equal(DEFAULT_PERMISSIONS.ADMIN.finance_view, true);
  assert.equal(DEFAULT_PERMISSIONS.ADMIN.finance_edit, true);
  assert.equal(DEFAULT_PERMISSIONS.EDITOR.finance_view, false);
  assert.equal(DEFAULT_PERMISSIONS.EDITOR.finance_edit, false);
});

test("viewer defaults are read-only but can open overview modules", () => {
  assert.ok(ALL_PERMISSION_KEYS.includes("b2b_catalog_view"));
  assert.equal(DEFAULT_PERMISSIONS.VIEWER.receipt_view, true);
  assert.equal(DEFAULT_PERMISSIONS.VIEWER.finance_view, true);
  assert.equal(DEFAULT_PERMISSIONS.VIEWER.scraper_view, true);
  assert.equal(DEFAULT_PERMISSIONS.VIEWER.b2b_catalog_view, true);
  assert.equal(DEFAULT_PERMISSIONS.VIEWER.b2b_catalog_edit, false);
  assert.equal(DEFAULT_PERMISSIONS.VIEWER.finance_edit, false);
  assert.equal(DEFAULT_PERMISSIONS.VIEWER.tour_create, false);
  assert.equal(DEFAULT_PERMISSIONS.VIEWER.blog_publish, false);
  assert.equal(DEFAULT_PERMISSIONS.VIEWER.scraper_run, false);
});

test("role defaults explicitly cover every permission key", () => {
  for (const role of ["ADMIN", "EDITOR", "VIEWER"] as const) {
    for (const key of ALL_PERMISSION_KEYS) {
      assert.equal(
        typeof DEFAULT_PERMISSIONS[role][key],
        "boolean",
        `${role} is missing a default for ${key}`,
      );
    }
  }
});

test("viewer write guard blocks CMS mutations without blocking public writes", () => {
  assert.equal(isViewerRole("VIEWER"), true);
  assert.equal(isViewerRole("ADMIN"), false);
  assert.equal(isViewerWriteBlockedPath("/admin/tours"), true);
  assert.equal(isViewerWriteBlockedPath("/api/tours"), true);
  assert.equal(isViewerWriteBlockedPath("/api/auth/callback/credentials"), false);
  assert.equal(isViewerWriteBlockedPath("/api/inquiries"), false);
  assert.equal(shouldBlockViewerMutation("POST", "/api/tours", "VIEWER"), true);
  assert.equal(shouldBlockViewerMutation("GET", "/api/tours", "VIEWER"), false);
  assert.equal(shouldBlockViewerMutation("POST", "/api/tours", "ADMIN"), false);
});
