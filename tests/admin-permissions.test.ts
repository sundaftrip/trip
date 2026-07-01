import assert from "node:assert/strict";
import test from "node:test";
import {
  ALL_PERMISSION_KEYS,
  DEFAULT_PERMISSIONS,
  PERMISSION_LABELS,
} from "../lib/permission-keys";

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

test("role defaults explicitly cover every permission key", () => {
  for (const role of ["ADMIN", "EDITOR"] as const) {
    for (const key of ALL_PERMISSION_KEYS) {
      assert.equal(
        typeof DEFAULT_PERMISSIONS[role][key],
        "boolean",
        `${role} is missing a default for ${key}`,
      );
    }
  }
});
