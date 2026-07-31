import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { Session } from "next-auth";
import {
  isCurrentSessionVersion,
  validatePersistedSession,
} from "../lib/auth";

const version = new Date("2026-07-31T03:04:05.678Z");

function session(sessionVersion: string | undefined): Session {
  return {
    expires: "2099-01-01T00:00:00.000Z",
    user: {
      id: "user-1",
      name: "Stale Name",
      email: "stale@example.com",
      image: "/stale.png",
      role: "ADMIN",
      sessionVersion,
    },
  };
}

const currentUser = {
  id: "user-1",
  name: "Current Name",
  email: "current@example.com",
  image: "/current.png",
  role: "VIEWER",
  updatedAt: version,
};

test("session version must exactly match the persisted updatedAt timestamp", () => {
  assert.equal(isCurrentSessionVersion(version.toISOString(), version), true);
  assert.equal(isCurrentSessionVersion(undefined, version), false);
  assert.equal(isCurrentSessionVersion("", version), false);
  assert.equal(
    isCurrentSessionVersion("2026-07-31T03:04:06.678Z", version),
    false,
  );
});

test("valid persisted session is refreshed from the current database user", async () => {
  const result = await validatePersistedSession(
    session(version.toISOString()),
    async () => currentUser,
  );

  assert.ok(result);
  assert.deepEqual(result.user, {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    image: currentUser.image,
    role: currentUser.role,
    sessionVersion: currentUser.updatedAt.toISOString(),
  });
});

test("missing legacy version, deleted user, changed user, and lookup failure fail closed", async () => {
  assert.equal(
    await validatePersistedSession(session(undefined), async () => currentUser),
    null,
  );
  assert.equal(
    await validatePersistedSession(session(version.toISOString()), async () => null),
    null,
  );
  assert.equal(
    await validatePersistedSession(session(version.toISOString()), async () => ({
      ...currentUser,
      updatedAt: new Date("2026-07-31T03:04:06.678Z"),
    })),
    null,
  );
  assert.equal(
    await validatePersistedSession(session(version.toISOString()), async () => {
      throw new Error("database unavailable");
    }),
    null,
  );
});

test("admin login remains reachable when a stale cookie exists", () => {
  const source = readFileSync(new URL("../proxy.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /isLoginPage\s*&&\s*isAuthenticated/);
  assert.match(source, /!isPublicAuthPage\s*&&\s*!isAuthenticated/);
});
