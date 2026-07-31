import assert from "node:assert/strict";
import test from "node:test";

import {
  checkPermissionsWithLookup,
  getPublicationCreatePolicy,
  requiredPermissionsForMutation,
  type PersistedPermissionUser,
} from "../lib/authorization";

test("slice B permission lookup denies sessions without a persisted user", async () => {
  let lookupCount = 0;
  const lookup = async (): Promise<PersistedPermissionUser | null> => {
    lookupCount += 1;
    return null;
  };

  assert.equal(await checkPermissionsWithLookup(null, ["finance_view"], lookup), false);
  assert.equal(
    await checkPermissionsWithLookup(
      { user: { id: "user-1", role: "ADMIN" } },
      [],
      lookup,
    ),
    false,
  );
  assert.equal(
    await checkPermissionsWithLookup(
      { user: { role: "SUPERADMIN" } },
      ["finance_view"],
      lookup,
    ),
    false,
  );
  assert.equal(lookupCount, 0);

  assert.equal(
    await checkPermissionsWithLookup(
      { user: { id: "deleted-user", role: "SUPERADMIN" } },
      ["finance_view"],
      lookup,
    ),
    false,
  );
  assert.equal(lookupCount, 1);
});

test("slice B permission lookup ignores stale session roles", async () => {
  const staleSuperadminSession = {
    user: { id: "editor-1", role: "SUPERADMIN" },
  };
  const persistedEditor: PersistedPermissionUser = {
    id: "editor-1",
    role: "EDITOR",
    permissions: null,
  };

  assert.equal(
    await checkPermissionsWithLookup(
      staleSuperadminSession,
      ["blog_publish"],
      async () => persistedEditor,
    ),
    false,
  );

  const staleEditorSession = { user: { id: "super-1", role: "EDITOR" } };
  const persistedSuperadmin: PersistedPermissionUser = {
    id: "super-1",
    role: "SUPERADMIN",
    permissions: null,
  };
  assert.equal(
    await checkPermissionsWithLookup(
      staleEditorSession,
      ["finance_edit"],
      async () => persistedSuperadmin,
    ),
    true,
  );
});

test("slice B permission lookup requires every requested permission", async () => {
  let lookupCount = 0;
  const persistedEditor: PersistedPermissionUser = {
    id: "editor-2",
    role: "EDITOR",
    permissions: { blog_edit: true, blog_publish: false },
  };
  const allowed = await checkPermissionsWithLookup(
    { user: { id: "editor-2", role: "EDITOR" } },
    ["blog_edit", "blog_publish", "blog_edit"],
    async () => {
      lookupCount += 1;
      return persistedEditor;
    },
  );

  assert.equal(allowed, false);
  assert.equal(lookupCount, 1);
});

test("slice B mutation policy requires edit and publish or status for mixed fields", () => {
  assert.deepEqual(
    requiredPermissionsForMutation(
      { published: true },
      "blog_edit",
      { published: "blog_publish" },
    ),
    ["blog_publish"],
  );
  assert.deepEqual(
    requiredPermissionsForMutation(
      { title: "Revised", published: true },
      "blog_edit",
      { published: "blog_publish" },
    ),
    ["blog_edit", "blog_publish"],
  );
  assert.deepEqual(
    requiredPermissionsForMutation(
      { status: "ACTIVE", title: "Revised" },
      "tour_edit",
      { status: "tour_status" },
    ),
    ["tour_status", "tour_edit"],
  );
});

test("slice B publication create policy defaults to draft and gates publication", () => {
  assert.deepEqual(
    getPublicationCreatePolicy(undefined, "geo_create", "geo_publish"),
    { published: false, requiredPermissions: ["geo_create"] },
  );
  assert.deepEqual(
    getPublicationCreatePolicy(false, "blog_create", "blog_publish"),
    { published: false, requiredPermissions: ["blog_create"] },
  );
  assert.deepEqual(
    getPublicationCreatePolicy(true, "blog_create", "blog_publish"),
    {
      published: true,
      requiredPermissions: ["blog_create", "blog_publish"],
    },
  );
});
