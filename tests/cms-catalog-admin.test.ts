import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  ACCESS_PRESETS,
  ALL_PERMISSION_KEYS,
  DEFAULT_PERMISSIONS,
  accessLabel,
  detectAccessPreset,
  resolvePermissionMap,
} from "../lib/permission-keys";
import { ADMIN_MODULES, adminModuleForPath, canOpenAdminModule } from "../lib/admin-modules";
import { withoutUnchangedFields } from "../lib/authorization";
import { describeTourChanges, normalizeTourInput } from "../lib/api-input";
import { adminTourIssues, adminTourVisibility, needsCatalogAttention } from "../lib/admin-tour-checks";
import { accessToUserFields, normalizeEmail, userAccessOf } from "../lib/user-access";
import { isAllowedCmsImageUrl } from "../lib/cms-image-hosts";
import { EDITABLE_SETTING_KEYS } from "../lib/company-settings";
import { HOME_TEXT_KEYS } from "../lib/home-text-fields";

const root = path.join(import.meta.dirname, "..");
const read = (relativePath: string) => readFileSync(path.join(root, relativePath), "utf8");

const catalogSubject = { role: "EDITOR", permissions: resolvePermissionMap("EDITOR", ACCESS_PRESETS.catalog.permissions) };

test("the catalog preset can create, edit, and publish tours but nothing else", () => {
  const enabled = ALL_PERMISSION_KEYS.filter((key) => ACCESS_PRESETS.catalog.permissions[key]);
  assert.deepEqual(enabled.sort(), ["tour_create", "tour_edit", "tour_status"]);
  assert.equal(ACCESS_PRESETS.catalog.role, "EDITOR");
  assert.equal(ACCESS_PRESETS.catalog.permissions.tour_delete, false);
  assert.equal(ACCESS_PRESETS.catalog.permissions.finance_view, false);
  assert.equal(ACCESS_PRESETS.catalog.permissions.inquiry_view, false);
});

test("stored permissions override role defaults and presets are recognised", () => {
  assert.equal(resolvePermissionMap("SUPERADMIN", {}).finance_edit, true);
  assert.equal(resolvePermissionMap("EDITOR", null).tour_status, false);
  assert.equal(resolvePermissionMap("EDITOR", { tour_status: true }).tour_status, true);
  assert.equal(resolvePermissionMap("ADMIN", { finance_view: false }).finance_view, false);

  assert.equal(detectAccessPreset("EDITOR", ACCESS_PRESETS.catalog.permissions), "catalog");
  assert.equal(detectAccessPreset("ADMIN", ACCESS_PRESETS.catalog.permissions), null);
  assert.equal(detectAccessPreset("EDITOR", null), null);
  assert.equal(detectAccessPreset("EDITOR", { ...ACCESS_PRESETS.catalog.permissions, blog_edit: true }), null);
  assert.equal(accessLabel("EDITOR", ACCESS_PRESETS.catalog.permissions), "Admin Katalog");
  assert.equal(accessLabel("VIEWER", null), "Demo (hanya lihat)");
});

test("removed modules no longer have permission keys and new modules do", () => {
  for (const removed of ["visa_discussion_view", "visa_discussion_moderate", "color_edit"]) {
    assert.equal(ALL_PERMISSION_KEYS.includes(removed), false, removed);
  }
  for (const added of ["inquiry_view", "inquiry_edit", "visa_edit", "testimonial_edit"]) {
    assert.ok(ALL_PERMISSION_KEYS.includes(added), added);
  }
  // Lead berisi data pelanggan: akun demo tidak melihatnya.
  assert.equal(DEFAULT_PERMISSIONS.VIEWER.inquiry_view, false);
  assert.equal(DEFAULT_PERMISSIONS.EDITOR.inquiry_view, true);
});

test("catalog admins only see the dashboard, guide, and tours", () => {
  const visible = ADMIN_MODULES.filter((module) => canOpenAdminModule(module, catalogSubject)).map((module) => module.key);
  assert.deepEqual(visible, ["dashboard", "guide", "tours"]);
});

test("module access follows role and permissions", () => {
  const superadmin = { role: "SUPERADMIN", permissions: {} };
  assert.equal(ADMIN_MODULES.every((module) => canOpenAdminModule(module, superadmin)), true);

  const admin = { role: "ADMIN", permissions: resolvePermissionMap("ADMIN", null) };
  const adminVisible = ADMIN_MODULES.filter((module) => canOpenAdminModule(module, admin)).map((module) => module.key);
  assert.ok(adminVisible.includes("finance"));
  assert.ok(!adminVisible.includes("users"));
  assert.ok(!adminVisible.includes("settings"));

  const viewer = { role: "VIEWER", permissions: resolvePermissionMap("VIEWER", null) };
  const viewerVisible = ADMIN_MODULES.filter((module) => canOpenAdminModule(module, viewer)).map((module) => module.key);
  assert.ok(viewerVisible.includes("tours"));
  assert.ok(viewerVisible.includes("receipts"));
  assert.ok(!viewerVisible.includes("inquiries"));
  assert.ok(!viewerVisible.includes("users"));
});

test("admin paths map to the most specific module", () => {
  assert.equal(adminModuleForPath("/admin")?.key, "dashboard");
  assert.equal(adminModuleForPath("/admin/tours/abc")?.key, "tours");
  assert.equal(adminModuleForPath("/admin/keuangan/jurnal")?.key, "finance");
  assert.equal(adminModuleForPath("/admin/login"), null);
});

test("unchanged gated fields do not require extra permissions", () => {
  assert.deepEqual(
    withoutUnchangedFields({ status: "ACTIVE", title: "Baru" }, { status: "ACTIVE" }, ["status"]),
    { title: "Baru" },
  );
  assert.deepEqual(
    withoutUnchangedFields({ status: "FULL" }, { status: "ACTIVE" }, ["status"]),
    { status: "FULL" },
  );
  assert.deepEqual(withoutUnchangedFields({ published: true }, null, ["published"]), { published: true });
});

test("tour input is validated and normalised before reaching the database", () => {
  const ok = normalizeTourInput({
    title: "  Aurora Murmansk ",
    country: "Rusia",
    seatsLeft: 3.6,
    promoPrice: 0,
    tripDate: "2026-12-01T00:00:00.000Z",
    itinerary: [{ day: 2, title: "Teriberka", description: "" }, { day: 1, title: "Tiba", description: "Moskow" }, {}],
    addOns: [{ name: "Bagasi", price: 450000.4, tag: "wajib" }, { name: "", price: 1 }],
    hotel: { Moskow: "Azimut 4*", __room_price_quad: "32500000", __room_price_twin: "" },
  });
  assert.equal(ok.ok, true);
  if (!ok.ok) return;
  assert.equal(ok.value.title, "Aurora Murmansk");
  assert.equal(ok.value.seatsLeft, 4);
  assert.equal(ok.value.promoPrice, null);
  assert.ok(ok.value.tripDate instanceof Date);
  assert.deepEqual((ok.value.itinerary as { day: number }[]).map((item) => item.day), [1, 2]);
  assert.deepEqual(ok.value.addOns, [{ name: "Bagasi", price: 450000, tag: "wajib" }]);
  assert.deepEqual(ok.value.hotel, { Moskow: "Azimut 4*", __room_price_quad: 32500000 });

  assert.equal(normalizeTourInput({ title: " " }).ok, false);
  assert.equal(normalizeTourInput({ itinerary: "hari 1" }).ok, false);
  assert.equal(normalizeTourInput({ itinerary: [{ day: 1, title: "", description: "isi" }] }).ok, false);
  assert.equal(normalizeTourInput({ tripDate: "bukan tanggal" }).ok, false);
  assert.equal(normalizeTourInput({ hotel: { __room_price_quad: "Rp32.500.000" } }).ok, false);
});

test("tour changes are summarised for the activity log", () => {
  const detail = describeTourChanges(
    { status: "DRAFT", price: 30000000, seatsLeft: 10, gallery: ["a"], title: "Trip" },
    { status: "ACTIVE", price: 28500000, seatsLeft: 8, gallery: ["a", "b"], title: "Trip" },
  );
  assert.match(detail, /Status Draft → Aktif/);
  assert.match(detail, /Harga Rp 30\.000\.000 → Rp 28\.500\.000/);
  assert.match(detail, /Kursi 10 → 8/);
  assert.match(detail, /Ubah: galeri/);
  assert.doesNotMatch(detail, /judul/);
});

test("catalog checks flag incomplete public tours", () => {
  const now = new Date("2026-10-13T00:00:00Z");
  const complete = {
    status: "ACTIVE", price: 30000000, seatsLeft: 5, tripDate: "2026-12-01", heroImg: "https://res.cloudinary.com/x.jpg",
    description: "Rute", itinerary: [{ day: 1 }], hotel: null,
  };
  assert.deepEqual(adminTourIssues(complete), []);
  assert.deepEqual(adminTourIssues({ ...complete, heroImg: "", price: 0, itinerary: [] }), [
    "Foto utama belum diisi",
    "Harga belum diisi",
    "Itinerary masih kosong",
  ]);
  // Harga per kamar menggantikan harga normal.
  assert.deepEqual(adminTourIssues({ ...complete, price: 0, hotel: { __room_price_quad: 32500000 } }), []);
  assert.match(adminTourIssues({ ...complete, seatsLeft: 0 }).join(), /Sisa kursi 0/);
  assert.match(adminTourIssues({ ...complete, status: "DRAFT", slug: "russia-aurora" }).join(), /pengecualian lama/);

  assert.equal(adminTourVisibility({ ...complete, status: "DRAFT" }, now).visible, false);
  assert.equal(adminTourVisibility(complete, now).tone, "live");
  assert.equal(adminTourVisibility({ ...complete, tripDate: "2026-01-01" }, now).tone, "past");
  assert.deepEqual(needsCatalogAttention({ ...complete, status: "DRAFT", heroImg: "" }, now), []);
});

test("user access options map to roles and stored permissions", () => {
  assert.deepEqual(accessToUserFields("catalog"), { role: "EDITOR", permissions: ACCESS_PRESETS.catalog.permissions });
  assert.deepEqual(accessToUserFields("ADMIN"), { role: "ADMIN", permissions: {} });
  // An empty map means "use the role defaults".
  assert.deepEqual(resolvePermissionMap("ADMIN", {}), resolvePermissionMap("ADMIN", null));
  assert.equal(userAccessOf("EDITOR", ACCESS_PRESETS.catalog.permissions), "catalog");
  assert.equal(userAccessOf("EDITOR", null), "EDITOR");
  assert.equal(normalizeEmail("  Admin.Katalog@Gmail.COM "), "admin.katalog@gmail.com");
});

test("only displayable image hosts are accepted for public tour photos", () => {
  assert.equal(isAllowedCmsImageUrl("https://res.cloudinary.com/demo/image/upload/a.jpg"), true);
  assert.equal(isAllowedCmsImageUrl("https://images.pexels.com/photos/1.jpeg"), true);
  assert.equal(isAllowedCmsImageUrl("/images/hero.jpg"), true);
  assert.equal(isAllowedCmsImageUrl("http://res.cloudinary.com/a.jpg"), false);
  assert.equal(isAllowedCmsImageUrl("https://instagram.com/p/abc"), false);
  assert.equal(isAllowedCmsImageUrl("//evil.example/a.jpg"), false);
});

test("settings and texts accept only keys that have a CMS form", () => {
  assert.ok(EDITABLE_SETTING_KEYS.has("company_whatsapp"));
  assert.ok(EDITABLE_SETTING_KEYS.has("about_story"));
  for (const removed of ["site_theme", "site_font", "color_accent", "color_scheme", "favicon_logo", "keuangan_reset_hash"]) {
    assert.equal(EDITABLE_SETTING_KEYS.has(removed), false, removed);
  }
  assert.ok(HOME_TEXT_KEYS.has("home_hero_title"));
  assert.equal(HOME_TEXT_KEYS.has("hero_title"), false);

  const settingsApi = read("app/api/settings/route.ts");
  assert.match(settingsApi, /EDITABLE_SETTING_KEYS\.has\(key\)/);
  assert.doesNotMatch(settingsApi, /PLAN_FEATURES|getPlan|color_edit/);
  const settingsForm = read("app/admin/settings/SettingsForm.tsx");
  assert.doesNotMatch(settingsForm, /Tema Layout|Skema Warna|Font Website/);
});

test("removed CMS modules stay removed", () => {
  for (const removedPath of [
    "app/admin/partners",
    "app/admin/leads",
    "app/admin/commissions",
    "app/admin/disputes",
    "app/api/referrals",
    "app/(website)/[slug]/page.tsx",
    "app/(website)/partner/[slug]/page.tsx",
    "components/website/ReferralCapture.tsx",
    "lib/referrals.ts",
    "lib/plan.ts",
    "lib/license.ts",
    "app/api/plan/route.ts",
    "scripts/set-nusantara.ts",
  ]) {
    assert.equal(existsSync(path.join(root, removedPath)), false, `${removedPath} should stay deleted`);
  }
  // The public partner landing (B2B) stays.
  assert.ok(existsSync(path.join(root, "app/(website)/partner/page.tsx")));
  // Campaign attribution keeps working without the referral capture.
  assert.match(read("app/(website)/layout.tsx"), /<CampaignCapture \/>/);
  assert.doesNotMatch(read("proxy.ts"), /preview-theme/);
});

test("tour API keeps slugs server-managed and gates publishing", () => {
  const update = read("app/api/tours/[id]/route.ts");
  assert.match(update, /delete picked\.slug/);
  assert.match(update, /withoutUnchangedFields\(picked, current, \["status"\]\)/);
  assert.match(update, /describeTourChanges/);
  const importer = read("app/api/tours/import/route.ts");
  assert.match(importer, /status === "ACTIVE" \? \["tour_create", "tour_status"\] : \["tour_create"\]/);
  assert.match(importer, /uniqueTourSlug/);
});

test("every CMS page outside receipts and finance checks module access", () => {
  const pages = [
    "app/admin/page.tsx",
    "app/admin/panduan/page.tsx",
    "app/admin/tours/page.tsx",
    "app/admin/tours/new/page.tsx",
    "app/admin/tours/[id]/page.tsx",
    "app/admin/tours/import/page.tsx",
    "app/admin/inquiries/page.tsx",
    "app/admin/database-visa/page.tsx",
    "app/admin/blog/page.tsx",
    "app/admin/geo/page.tsx",
    "app/admin/testimonials/page.tsx",
    "app/admin/texts/page.tsx",
    "app/admin/about/page.tsx",
    "app/admin/faq/page.tsx",
    "app/admin/terms/page.tsx",
    "app/admin/users/page.tsx",
    "app/admin/permissions/page.tsx",
    "app/admin/logs/page.tsx",
    "app/admin/settings/page.tsx",
  ];
  for (const page of pages) {
    assert.match(read(page), /requireAdminModule\("/, page);
  }
});
