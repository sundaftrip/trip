import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

import {
  GEO_CMS_ROUTES,
  buildGeoSaveInput,
  getGeoCmsDisplayState,
  getGeoCmsBaselineNotice,
  getGeoSaveError,
  isSupportedGeoRoute,
  normalizeGeoRoutePath,
  validateGeoRouteMutation,
} from "../lib/geo-cms-routes";
import { requiredPermissionsForMutation } from "../lib/authorization";

const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("every editable route has both a fallback and a public CMS reader", () => {
  const fallbackSource = source("lib/geo-pages.ts");
  const tree = ts.createSourceFile("geo-pages.ts", fallbackSource, ts.ScriptTarget.Latest, true);
  let fallbackKeys: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(tree) === "GEO_FALLBACKS"
      && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
      fallbackKeys = node.initializer.properties.flatMap((property) => (
        property.name && ts.isStringLiteral(property.name) ? [property.name.text] : []
      ));
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  assert.equal(GEO_CMS_ROUTES.length, 10);
  assert.equal(new Set(GEO_CMS_ROUTES.map((route) => route.routePath)).size, GEO_CMS_ROUTES.length);
  for (const route of GEO_CMS_ROUTES) {
    assert.ok(fallbackKeys.includes(route.routePath), `${route.routePath} has fallback content`);
    const page = source(`app/(website)${route.routePath}/page.tsx`);
    assert.ok(page.includes(`"${route.routePath}"`));
    assert.match(page, /getGeoPageContent\(ROUTE(?:_PATH)?\)/);
    assert.ok(route.label.trim());
  }
});

test("excludes hardcoded and arbitrary pages even when a public URL or fallback exists", () => {
  for (const route of ["/jasa-urus-visa-terpercaya", "/custom-page", "/visa", "/", "/__proto__", "/constructor"]) {
    assert.equal(isSupportedGeoRoute(route), false, route);
    assert.equal(getGeoCmsDisplayState(route, true).publicHref, null);
  }
  const referralPage = source("app/(website)/[slug]/page.tsx");
  assert.match(referralPage, /ReferralLandingPage/);
  assert.doesNotMatch(referralPage, /getGeoPageContent/);
});

test("normalizes only the existing route shorthand, never URL variants or unsafe destinations", () => {
  assert.equal(normalizeGeoRoutePath(" visa-rusia-wni "), "/visa-rusia-wni");
  for (const value of [null, undefined, {}, 10, "", "   "]) assert.equal(normalizeGeoRoutePath(value), "");
  for (const route of ["https://example.com", "//example.com", "/visa-rusia-wni#faq", "/visa-rusia-wni?x=1", "/visa-rusia-wni/", "/VISA-RUSIA-WNI", " /visa-rusia-wni "]) {
    assert.equal(isSupportedGeoRoute(route), false, route);
  }
});

test("create and route changes reject records the public CMS cannot render", () => {
  assert.ok(validateGeoRouteMutation({ routePath: "/not-a-geo-route" }));
  assert.ok(validateGeoRouteMutation({}));
  assert.ok(validateGeoRouteMutation({ routePath: "/jasa-urus-visa-terpercaya" }));
  assert.ok(validateGeoRouteMutation({ routePath: "/not-a-geo-route" }, "/visa-rusia-wni"));
  const data = { routePath: " visa-rusia-wni " };
  assert.equal(validateGeoRouteMutation(data), null);
  assert.equal(data.routePath, "/visa-rusia-wni");
});

test("partial supported edits work but legacy records cannot become falsely published", () => {
  assert.equal(validateGeoRouteMutation({ title: "New title" }, "/visa-rusia-wni"), null);
  assert.equal(validateGeoRouteMutation({ published: true }, "/visa-rusia-wni"), null);
  assert.ok(validateGeoRouteMutation({ published: true }, "/custom-page"));
  assert.ok(validateGeoRouteMutation({ title: "New title" }, "/custom-page"));
  assert.equal(validateGeoRouteMutation({ published: false }, "/custom-page"), null);
  assert.ok(validateGeoRouteMutation({ published: false, title: "New title" }, "/custom-page"));
});

test("existing records cannot move onto another route or activate legacy content by renaming", () => {
  assert.ok(validateGeoRouteMutation({ routePath: "/visa-rusia-wni" }, "/custom-page"));
  assert.ok(validateGeoRouteMutation({ routePath: "/visa-rusia-wni" }, "/open-trip-vietnam"));
  assert.equal(validateGeoRouteMutation({ routePath: " visa-rusia-wni " }, "/visa-rusia-wni"), null);
});

test("unchanged publication state is omitted for text editors without weakening mutation policy", () => {
  for (const published of [true, false]) {
    const form = { routePath: "/visa-rusia-wni", title: "Edited", published };
    const payload = buildGeoSaveInput(form, published, true);
    assert.equal(Object.hasOwn(payload, "published"), false);
    assert.deepEqual(requiredPermissionsForMutation(payload, "geo_edit", { published: "geo_publish" }), ["geo_edit"]);
    assert.equal(form.published, published);
  }
  const changed = buildGeoSaveInput({ routePath: "/visa-rusia-wni", published: false }, true, true);
  assert.equal(changed.published, false);
  assert.deepEqual(requiredPermissionsForMutation(changed, "geo_edit", { published: "geo_publish" }), ["geo_edit", "geo_publish"]);
  assert.equal(buildGeoSaveInput({ routePath: "/visa-rusia-wni", published: false }, false, false).published, false);
});

test("status copy distinguishes CMS content, default content, and unsupported records", () => {
  const active = getGeoCmsDisplayState("/visa-rusia-wni", true);
  assert.equal(active.label, "Konten CMS aktif");
  assert.equal(active.publicHref, "/visa-rusia-wni");
  assert.match(active.description, /bagian yang didukung/);
  for (const published of [false, undefined]) {
    const state = getGeoCmsDisplayState("/visa-rusia-wni", published);
    assert.equal(state.label, "Konten bawaan aktif");
    assert.equal(state.publicHref, "/visa-rusia-wni");
    assert.match(state.description, /tetap dapat dibuka/);
  }
  assert.equal(getGeoCmsDisplayState("/not-supported", true).label, "Belum terhubung");
});

test("protected default content is disclosed without changing public renderer rules", () => {
  assert.match(getGeoCmsBaselineNotice("/sundaf-trip") ?? "", /Metadata, schema/);
  for (const route of ["/tour-rusia-dari-indonesia", "/open-trip-aurora-rusia"]) {
    assert.match(getGeoCmsBaselineNotice(route) ?? "", /Ringkasan utama.*CTA/);
    assert.match(getGeoCmsBaselineNotice(route) ?? "", /judul atau pertanyaan baru/);
  }
  assert.equal(getGeoCmsBaselineNotice("/visa-rusia-wni"), null);
});

test("save errors remain actionable and never treat a network failure as confirmed success", () => {
  assert.match(getGeoSaveError(401, null), /login/i);
  assert.match(getGeoSaveError(403, null), /izin/i);
  assert.equal(getGeoSaveError(422, { error: "Route path GEO sudah dipakai." }), "Route path GEO sudah dipakai.");
  assert.match(getGeoSaveError(500, { error: {} }), /Gagal menyimpan/);
});

test("API routes keep strict permissions and validate the effective public route before writes", () => {
  const create = source("app/api/geo-pages/route.ts");
  const update = source("app/api/geo-pages/[id]/route.ts");
  assert.match(create, /getPublicationCreatePolicy/);
  assert.match(create, /checkPermissions\(session, publicationPolicy.requiredPermissions\)/);
  assert.match(create, /validateGeoRouteMutation\(data\)/);
  assert.match(update, /requiredPermissionsForMutation/);
  assert.match(update, /published: "geo_publish"/);
  assert.match(update, /checkPermissions\(session, requiredPermissions\)/);
  assert.match(update, /validateGeoRouteMutation\(data, existing\.routePath\)/);
  assert.ok(update.indexOf("validateGeoRouteMutation(data, existing.routePath)") < update.indexOf("prisma.geoPage.update"));
});

test("form preserves edits on save failures and offers only supported public controls", () => {
  const form = source("components/admin/GeoPageForm.tsx");
  assert.match(form, /buildGeoSaveInput\(form, initial\.published, isEdit\)/);
  assert.match(form, /finally\s*\{\s*setLoading\(false\)/);
  assert.match(form, /role="alert"/);
  assert.match(form, /Belum dapat memastikan penyimpanan/);
  assert.match(form, /disabled=\{!canPublish/);
  assert.match(form, /Gunakan konten CMS di halaman publik/);
  assert.match(form, /publicHref &&/);
  assert.match(form, /href=\{publicHref\}/);
  assert.doesNotMatch(form, />Published</);
  assert.doesNotMatch(form, /placeholder="\/visa-rusia-wni"/);
});

test("admin listing and creation do not advertise arbitrary published URLs", () => {
  const listing = source("app/admin/geo/page.tsx");
  const create = source("app/admin/geo/new/page.tsx");
  assert.match(listing, /getGeoCmsDisplayState/);
  assert.match(listing, /isSupportedGeoRoute/);
  assert.match(create, /GEO_CMS_ROUTES/);
  assert.match(create, /isSupportedGeoRoute/);
  assert.doesNotMatch(listing, /\? "Published" : "Draft"/);
});
