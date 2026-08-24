import assert from "node:assert/strict";
import test from "node:test";
import {
  CANADA_ROCKIES_PREVIEW_ID,
  getCanadaRockiesPreviewTour,
} from "../lib/canada-catalog-preview";
import { CANADA_ROCKIES_SLUG } from "../data/catalog/canada-rockies-april-2027";

test("Canada fixture is available only on Vercel preview", () => {
  const originalVercelEnv = process.env.VERCEL_ENV;
  try {
    process.env.VERCEL_ENV = "production";
    assert.equal(getCanadaRockiesPreviewTour(CANADA_ROCKIES_SLUG), null);

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
