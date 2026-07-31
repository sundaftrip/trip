import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogModuleUrl = pathToFileURL(
  path.join(repositoryRoot, "lib", "b2b-catalog.ts"),
).href;

test("slice A B2B access tokens fail closed and enforce signed expiry metadata", () => {
  const program = `
    import assert from "node:assert/strict";

    delete process.env.B2B_CATALOG_SECRET;
    delete process.env.AUTH_SECRET;
    delete process.env.NEXTAUTH_SECRET;
    process.env.AUTH_URL = "https://must-not-be-a-signing-secret.example";
    process.env.NEXTAUTH_URL = "https://must-not-be-a-signing-secret.example";

    const catalog = await import(${JSON.stringify(catalogModuleUrl)});
    const nowMs = Date.UTC(2026, 6, 31, 12, 0, 0);

    assert.throws(
      () => catalog.signCatalogAccessToken("password-row-1", nowMs),
      /signing secret is not configured/,
    );
    assert.equal(catalog.verifyCatalogAccessToken("payload.signature", nowMs), null);

    process.env.AUTH_SECRET = "   ";
    assert.throws(
      () => catalog.signCatalogAccessToken("password-row-1", nowMs),
      /signing secret is not configured/,
    );

    process.env.AUTH_SECRET = "slice-a-test-auth-secret-with-sufficient-entropy";
    const token = catalog.signCatalogAccessToken("password-row-1", nowMs);
    const [encodedPayload, signature] = token.split(".");
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));

    assert.equal(payload.version, 1);
    assert.equal(payload.passwordId, "password-row-1");
    assert.equal(payload.issuedAt, Math.floor(nowMs / 1000));
    assert.equal(
      payload.expiresAt - payload.issuedAt,
      catalog.B2B_CATALOG_TOKEN_TTL_SECONDS,
    );
    assert.equal(catalog.verifyCatalogAccessToken(token, nowMs), "password-row-1");
    assert.equal(
      catalog.verifyCatalogAccessToken(
        token,
        nowMs + catalog.B2B_CATALOG_TOKEN_TTL_SECONDS * 1000,
      ),
      null,
    );

    const changedPayload = Buffer.from(
      JSON.stringify({ ...payload, passwordId: "password-row-2" }),
      "utf8",
    ).toString("base64url");
    assert.equal(
      catalog.verifyCatalogAccessToken(changedPayload + "." + signature, nowMs),
      null,
    );
    assert.equal(catalog.verifyCatalogAccessToken("password-row-1." + signature, nowMs), null);
    assert.equal(catalog.verifyCatalogAccessToken(token + ".extra", nowMs), null);

    process.env.B2B_CATALOG_SECRET = "dedicated-slice-a-secret";
    assert.equal(catalog.verifyCatalogAccessToken(token, nowMs), null);
    const dedicatedToken = catalog.signCatalogAccessToken("password-row-1", nowMs);
    assert.equal(catalog.verifyCatalogAccessToken(dedicatedToken, nowMs), "password-row-1");
  `;

  const child = spawnSync(
    process.execPath,
    [
      "--conditions=react-server",
      "--import",
      "tsx",
      "--input-type=module",
      "--eval",
      program,
    ],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: { ...process.env },
    },
  );

  assert.equal(
    child.status,
    0,
    `B2B token assertions failed.\nstdout:\n${child.stdout}\nstderr:\n${child.stderr}`,
  );
});
