import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import * as icons from "lucide-react";
import ts from "typescript";
import * as geoInput from "../lib/geo-cms-input";
import * as geoRoutes from "../lib/geo-cms-routes";
import type { GeoDestinationContent, GeoPageContent } from "../types/geo";

const destination: GeoDestinationContent = {
  hero: { eyebrow: "", titleLine1: "Visible hero", titleLine2: "", description: "", image: "", imageAlt: "", primaryCtaLabel: "", allToursCtaLabel: "", secondaryCtaLabel: "" },
  quickFacts: [], intro: { eyebrow: "", title: "", paragraphs: [] }, guide: { eyebrow: "", title: "", cards: [] },
  activities: { eyebrow: "", title: "", items: [] }, travel: { eyebrow: "", title: "", steps: [] },
  budget: { eyebrow: "", title: "", items: [], totalLabel: "", totalValue: "", note: "" },
  emptyTours: { icon: "", title: "", description: "", ctaLabel: "", ctaHref: "" }, finalCta: { title: "", description: "", buttonLabel: "" },
};
const fallback: GeoPageContent = {
  routePath: "/destinations/murmansk", title: "Article headline", eyebrow: "", metaDescription: "", answer: "Summary",
  sections: [{ title: "Legacy section", body: "Body" }], faqs: [{ question: "Question", answer: "Answer" }], destination,
  schemaType: "Article", published: true,
};

const compiled = ts.transpileModule(readFileSync(new URL("../components/admin/GeoPageForm.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const dependencies: Record<string, unknown> = {
  react: React, "react/jsx-runtime": jsxRuntime, "lucide-react": icons,
  "next/navigation": { useRouter: () => ({ push: () => undefined, refresh: () => undefined }) },
  "next/link": { __esModule: true, default: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => React.createElement("a", props) },
  "./StickyFormActions": { __esModule: true, default: (props: { disabled: boolean }) => React.createElement("button", { id: "save-control", disabled: props.disabled }, "Save") },
  "@/lib/geo-cms-input": geoInput, "@/lib/geo-cms-routes": geoRoutes,
};
const formModule = { exports: {} as { default: React.ComponentType<Record<string, unknown>> } };
runInNewContext(compiled, {
  module: formModule, exports: formModule.exports,
  require: (name: string) => {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected form dependency: ${name}`);
    return dependencies[name];
  },
});
function render(page: Record<string, unknown>, structuredFallback?: GeoPageContent) {
  return load(renderToStaticMarkup(React.createElement(formModule.exports.default, { page, structuredFallback, canPublish: false })));
}

test("the real editor renders malformed legacy arrays and destination data without throwing", () => {
  const raw = { ...fallback, id: "legacy", sections: [null], faqs: [null], content: {} };
  const before = structuredClone(raw);
  const $ = render(raw, fallback);
  assert.match($("#geo-legacy-data-help").text(), /Data asli tetap tersimpan/);
  for (const id of ["geo-section-fields", "geo-faq-fields", "geo-destination-fields"]) assert.ok($(`#${id}`).is("[disabled]"), id);
  assert.equal($("#save-control").is("[disabled]"), false);
  assert.deepEqual(raw, before);
});

test("destination editor disables only unused controls when the stored data is valid", () => {
  for (const routePath of ["/destinations/murmansk", "/destinations/teriberka"]) {
    const $ = render({ ...fallback, id: "valid", routePath, schemaType: "WebPage", content: destination }, fallback);
    assert.equal($("#geo-schema-type").val(), "Article");
    assert.ok($("#geo-schema-type").is("[disabled]"));
    assert.ok($("#geo-section-fields").is("[disabled]"));
    assert.equal($("#geo-faq-fields").is("[disabled]"), false);
    assert.equal($("#geo-destination-fields").is("[disabled]"), false);
    assert.equal($("#geo-legacy-data-help").length, 0);
    assert.match($("form").text(), /Judul ini digunakan sebagai headline Article/);
  }
});

test("normal GEO sections stay editable and unsupported legacy schema remains truthful", () => {
  const generic = render({ ...fallback, id: "generic", routePath: "/visa-rusia-wni", schemaType: "WebPage", destination: undefined });
  assert.equal(generic("#geo-schema-type").is("[disabled]"), false);
  assert.equal(generic("#geo-section-fields").is("[disabled]"), false);
  const legacy = render({ ...fallback, id: "old", routePath: "/unsupported", schemaType: "CustomSchema", sections: [null], faqs: [null], content: {}, destination: undefined });
  assert.equal(legacy("#geo-schema-type").val(), "CustomSchema");
  assert.ok(legacy("#save-control").is("[disabled]"));
  assert.equal(legacy("#geo-destination-fields").length, 0);
  assert.match(legacy("#geo-legacy-data-help").text(), /Format data lama/);
});
