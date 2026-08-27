import assert from "node:assert/strict";
import test from "node:test";
import {
  CANADA_ROCKIES_PREVIEW_ID,
  getCanadaRockiesPreviewTour,
  resolveCanadaRockiesPdfNotes,
  selectCanadaRockiesTourSource,
} from "../lib/canada-catalog-preview";
import {
  CANADA_ROCKIES_SLUG,
  CANADA_ROCKIES_TOUR,
} from "../data/catalog/canada-rockies-april-2027";

test("Canada fixture is available on deployed Vercel targets", () => {
  const originalVercelEnv = process.env.VERCEL_ENV;
  try {
    delete process.env.VERCEL_ENV;
    assert.equal(getCanadaRockiesPreviewTour(CANADA_ROCKIES_SLUG), null);

    process.env.VERCEL_ENV = "production";
    const production = getCanadaRockiesPreviewTour(CANADA_ROCKIES_SLUG);
    assert.equal(production?.id, CANADA_ROCKIES_PREVIEW_ID);
    assert.equal(production?.status, "ACTIVE");

    process.env.VERCEL_ENV = "preview";
    const preview = getCanadaRockiesPreviewTour(CANADA_ROCKIES_SLUG);
    assert.equal(preview?.id, CANADA_ROCKIES_PREVIEW_ID);
    assert.equal(preview?.status, "ACTIVE");
    assert.equal(preview?.itinerary && Array.isArray(preview.itinerary), true);
    assert.equal(getCanadaRockiesPreviewTour("another-tour"), null);
  } finally {
    if (originalVercelEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = originalVercelEnv;
  }
});

test("production uses the persisted Canada record so generated links keep its real ID", () => {
  const databaseTour = { id: "database-tour-id" };
  const previewTour = { id: CANADA_ROCKIES_PREVIEW_ID };

  assert.equal(
    selectCanadaRockiesTourSource(databaseTour, previewTour, "production")?.id,
    databaseTour.id,
  );
  assert.equal(
    selectCanadaRockiesTourSource(databaseTour, previewTour, "preview")?.id,
    previewTour.id,
  );
  assert.equal(
    selectCanadaRockiesTourSource(null, previewTour, "production")?.id,
    previewTour.id,
  );
});

test("Canada PDF replaces only the known stale detailed note", () => {
  const staleDetailedNote = [
    "Harga target pada tahap pendaftaran awal bukan harga tetap.",
    "Harga final ditetapkan setelah tiket grup, hotel, coach dalam mata uang CAD, dan biaya lain dikonfirmasi.",
  ].join(" ");

  assert.equal(
    resolveCanadaRockiesPdfNotes(staleDetailedNote, CANADA_ROCKIES_SLUG),
    CANADA_ROCKIES_TOUR.notes,
  );
  assert.equal(
    resolveCanadaRockiesPdfNotes("Catatan baru dari CMS.", CANADA_ROCKIES_SLUG),
    "Catatan baru dari CMS.",
  );
  assert.equal(
    resolveCanadaRockiesPdfNotes(staleDetailedNote, "another-tour"),
    staleDetailedNote,
  );
});
