import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeGeoCmsEditorData,
  validateGeoCmsStructuredInput,
} from "../lib/geo-cms-input";
import type { GeoDestinationContent, GeoPageContent } from "../types/geo";

function destinationFixture(): GeoDestinationContent {
  return {
    hero: {
      eyebrow: "Destination", titleLine1: "Murmansk", titleLine2: "Aurora",
      description: "Trip", image: "/hero.jpg", imageAlt: "Aurora",
      primaryCtaLabel: "Tours", allToursCtaLabel: "All tours", secondaryCtaLabel: "Contact",
    },
    quickFacts: [{ icon: "map-pin", label: "Location", value: "Russia" }],
    intro: { eyebrow: "Intro", title: "Visit", paragraphs: ["Paragraph"] },
    guide: { eyebrow: "Guide", title: "Plan", cards: [{ title: "Season", content: "Winter" }] },
    activities: {
      eyebrow: "Activities", title: "Explore",
      items: [{ title: "Aurora", desc: "Watch", img: "/aurora.jpg", video: "/video.mp4", credit: "Team" }],
    },
    travel: { eyebrow: "Travel", title: "Getting there", steps: [{ step: "01", title: "Fly", desc: "Flight" }] },
    budget: {
      eyebrow: "Budget", title: "Costs", items: [{ item: "Meal", range: "100" }],
      totalLabel: "Total", totalValue: "100", note: "Estimate",
    },
    emptyTours: { icon: "Map", title: "Ask us", description: "Plan a trip", ctaLabel: "Contact", ctaHref: "/contact" },
    finalCta: { title: "Travel", description: "Ask us", buttonLabel: "Contact" },
  };
}

function fallbackFixture(): GeoPageContent {
  return {
    routePath: "/destinations/murmansk", title: "Murmansk", eyebrow: "Destination",
    metaDescription: "Description", answer: "Answer", schemaType: "Article", published: true,
    sections: [{ title: "Fallback section", body: "Body", items: ["Item"] }],
    faqs: [{ question: "Fallback question", answer: "Answer" }],
    destination: destinationFixture(),
  };
}

test("structured validation accepts missing PATCH fields, empty arrays, null content, and complete content", () => {
  for (const input of [{}, { title: "Text only" }, { sections: [], faqs: [], content: null }]) {
    assert.equal(validateGeoCmsStructuredInput(input), null);
  }
  const input = {
    sections: [{ title: "Title" }, { title: "", body: "", items: [] }],
    faqs: [{ question: "", answer: "" }], content: destinationFixture(),
  };
  const before = structuredClone(input);
  assert.equal(validateGeoCmsStructuredInput(input), null);
  assert.deepEqual(input, before);
});

test("section and FAQ validation rejects nonarrays, null rows, and malformed fields without coercion", () => {
  for (const sections of [null, undefined, {}, "text", [null], ["text"], [{}], [{ title: 1 }], [{ title: "T", body: null }], [{ title: "T", items: "item" }], [{ title: "T", items: [null] }], new Array(1)]) {
    assert.match(validateGeoCmsStructuredInput({ sections }) ?? "", /Konten tambahan/);
  }
  for (const faqs of [null, undefined, {}, "text", [null], ["text"], [{}], [{ question: "Q" }], [{ question: 1, answer: "A" }], [{ question: "Q", answer: [] }], new Array(1)]) {
    assert.match(validateGeoCmsStructuredInput({ faqs }) ?? "", /FAQ/);
  }
});

test("destination validation rejects primitives, empty objects, and each missing required group", () => {
  for (const content of [undefined, {}, [], "text", 12, false]) {
    assert.match(validateGeoCmsStructuredInput({ content }) ?? "", /Konten halaman destinasi/);
  }
  for (const group of Object.keys(destinationFixture())) {
    const content = destinationFixture() as unknown as Record<string, unknown>;
    delete content[group];
    assert.ok(validateGeoCmsStructuredInput({ content }), group);
    content[group] = null;
    assert.ok(validateGeoCmsStructuredInput({ content }), `${group}: null`);
  }
});

test("every required destination field rejects missing values and wrong primitive types", () => {
  const valid = destinationFixture();
  function paths(value: unknown, prefix: (string | number)[] = []): (string | number)[][] {
    if (typeof value === "string") return [prefix];
    if (!value || typeof value !== "object") return [];
    return Object.entries(value).flatMap(([key, item]) => paths(item, [...prefix, Array.isArray(value) ? Number(key) : key]));
  }
  for (const path of paths(valid)) {
    for (const replacement of [null, 123, {}, []]) {
      const content = structuredClone(valid);
      let parent: unknown = content;
      for (const key of path.slice(0, -1)) parent = (parent as Record<string | number, unknown>)[key];
      (parent as Record<string | number, unknown>)[path.at(-1)!] = replacement;
      assert.ok(validateGeoCmsStructuredInput({ content }), `${path.join(".")} rejects ${JSON.stringify(replacement)}`);
    }
  }
  for (const [group, fields] of Object.entries(valid)) {
    if (Array.isArray(fields)) continue;
    for (const field of Object.keys(fields)) {
      const content = structuredClone(valid) as unknown as Record<string, Record<string, unknown>>;
      delete content[group][field];
      assert.ok(validateGeoCmsStructuredInput({ content }), `${group}.${field} required`);
    }
  }
});

test("destination arrays reject malformed rows and use only the supported quick-fact icons", () => {
  const paths = [["quickFacts"], ["intro", "paragraphs"], ["guide", "cards"], ["activities", "items"], ["travel", "steps"], ["budget", "items"]];
  for (const path of paths) {
    for (const replacement of [null, {}, "text", [null], [123], new Array(1)]) {
      const content = destinationFixture();
      let parent: unknown = content;
      for (const key of path.slice(0, -1)) parent = (parent as Record<string, unknown>)[key];
      (parent as Record<string, unknown>)[path.at(-1)!] = replacement;
      assert.ok(validateGeoCmsStructuredInput({ content }), path.join("."));
    }
  }
  for (const icon of ["plane", "calendar", "thermometer", "wallet", "map-pin"]) {
    const content = destinationFixture();
    content.quickFacts[0].icon = icon as GeoDestinationContent["quickFacts"][number]["icon"];
    assert.equal(validateGeoCmsStructuredInput({ content }), null);
  }
  const content = destinationFixture();
  content.quickFacts[0].icon = "unsupported" as GeoDestinationContent["quickFacts"][number]["icon"];
  assert.ok(validateGeoCmsStructuredInput({ content }));
});

test("optional activity video and credit may be absent or string, and empty typed arrays remain valid", () => {
  const content = destinationFixture();
  delete content.activities.items[0].video;
  delete content.activities.items[0].credit;
  assert.equal(validateGeoCmsStructuredInput({ content }), null);
  content.quickFacts = [];
  content.intro.paragraphs = [];
  content.guide.cards = [];
  content.activities.items = [];
  content.travel.steps = [];
  content.budget.items = [];
  assert.equal(validateGeoCmsStructuredInput({ content }), null);
});

test("normalization preserves valid stored values by reference, including intentional empty arrays", () => {
  const fallback = fallbackFixture();
  const data = { sections: [], faqs: [{ question: "Stored", answer: "Answer" }], content: destinationFixture() };
  const result = normalizeGeoCmsEditorData(data, fallback);
  assert.equal(result.sections, data.sections);
  assert.equal(result.faqs, data.faqs);
  assert.equal(result.destination, data.content);
  assert.deepEqual(result.invalidFields, []);
  const destination = destinationFixture();
  assert.equal(normalizeGeoCmsEditorData({ destination }, fallback).destination, destination);
});

test("null and undefined legacy fields mean fallback, not malformed data", () => {
  const fallback = fallbackFixture();
  for (const data of [{}, { sections: null, faqs: null, content: null }, { sections: undefined, faqs: undefined, content: undefined }]) {
    const result = normalizeGeoCmsEditorData(data, fallback);
    assert.equal(result.sections, fallback.sections);
    assert.equal(result.faqs, fallback.faqs);
    assert.equal(result.destination, fallback.destination);
    assert.deepEqual(result.invalidFields, []);
  }
  assert.deepEqual(normalizeGeoCmsEditorData({}), { sections: [], faqs: [], destination: undefined, invalidFields: [] });
});

test("malformed legacy data uses display fallback and reports every invalid field without rewriting it", () => {
  const fallback = fallbackFixture();
  const data = { sections: [null], faqs: [null], content: {} };
  const before = structuredClone(data);
  const result = normalizeGeoCmsEditorData(data, fallback);
  assert.equal(result.sections, fallback.sections);
  assert.equal(result.faqs, fallback.faqs);
  assert.equal(result.destination, fallback.destination);
  assert.deepEqual(result.invalidFields, ["sections", "faqs", "content"]);
  assert.deepEqual(data, before);
  assert.deepEqual(normalizeGeoCmsEditorData(data), { sections: [], faqs: [], destination: undefined, invalidFields: ["sections", "faqs", "content"] });
});

test("a malformed non-null content field cannot be concealed by a valid destination alias", () => {
  const fallback = fallbackFixture();
  const destination = destinationFixture();
  const result = normalizeGeoCmsEditorData({ content: {}, destination }, fallback);
  assert.equal(result.destination, fallback.destination);
  assert.deepEqual(result.invalidFields, ["content"]);
  assert.equal(normalizeGeoCmsEditorData({ content: null, destination }, fallback).destination, destination);
  assert.deepEqual(normalizeGeoCmsEditorData({ destination: { hero: null } }, fallback).invalidFields, ["content"]);
});
