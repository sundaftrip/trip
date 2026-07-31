import assert from "node:assert/strict";
import test from "node:test";
import {
  META_DESCRIPTION_MAX,
  META_PAGE_TITLE_MAX,
  META_TITLE_MAX,
  META_TITLE_SUFFIX,
  cleanMetadataText,
  toAbsoluteMetadataTitle,
  toContextualMetaDescription,
  toMetaDescription,
  toPageMetadataTitle,
  toQualifiedAbsoluteMetadataTitle,
  toQualifiedPageMetadataTitle,
} from "../lib/metadata-text";

test("metadata text is cleaned and constrained to the published budgets", () => {
  assert.equal(cleanMetadataText(" <p>Visa&nbsp; Rusia &amp; Aurora</p>  "), "Visa Rusia & Aurora");
  assert.ok(toMetaDescription("kata ".repeat(80)).length <= META_DESCRIPTION_MAX);
  assert.ok(toAbsoluteMetadataTitle("Judul sangat panjang ".repeat(10)).length <= META_TITLE_MAX);
  assert.ok(toPageMetadataTitle("Judul sangat panjang ".repeat(10)).length <= META_PAGE_TITLE_MAX);
  assert.ok(`${toPageMetadataTitle("Judul sangat panjang ".repeat(10))}${META_TITLE_SUFFIX}`.length <= META_TITLE_MAX);
});

test("child title removes a redundant trailing Sundaf Trip brand", () => {
  assert.equal(
    toPageMetadataTitle("Open Trip Vietnam Sapa dan Halong bersama Sundaf Trip"),
    "Open Trip Vietnam Sapa dan Halong",
  );
  assert.equal(
    toPageMetadataTitle("Wisata Kazakhstan, Sundaftrip"),
    "Wisata Kazakhstan",
  );
});

test("context makes repeated tour descriptions unique before truncation", () => {
  const shared = "Paket land tour privat Vietnam dengan rute utama Hanoi, Ninh Binh, dan Teluk Halong. Cocok untuk itinerary fleksibel.";
  const north = toContextualMetaDescription("Vietnam Utara 4 Hari", shared);
  const cruise = toContextualMetaDescription("Vietnam Utara dan Halong Cruise 4 Hari", shared);

  assert.notEqual(north, cruise);
  assert.ok(north.startsWith("Vietnam Utara 4 Hari."));
  assert.ok(cruise.startsWith("Vietnam Utara dan Halong Cruise 4 Hari."));
  assert.ok(north.length <= META_DESCRIPTION_MAX);
  assert.ok(cruise.length <= META_DESCRIPTION_MAX);
});

test("qualified child title preserves a distinguishing departure date", () => {
  const title = toQualifiedPageMetadataTitle(
    "Rusia menakjubkan musim gugur dengan rangkaian perjalanan panjang",
    "18 Sep 2023",
  );

  assert.ok(title.endsWith(" · 18 Sep 2023"));
  assert.ok(`${title}${META_TITLE_SUFFIX}`.length <= META_TITLE_MAX);

  const socialTitle = toQualifiedAbsoluteMetadataTitle(
    "Rusia menakjubkan musim gugur dengan rangkaian perjalanan yang sangat panjang",
    "18 Sep 2023",
  );
  assert.ok(socialTitle.endsWith(" · 18 Sep 2023"));
  assert.ok(socialTitle.length <= META_TITLE_MAX);
});
