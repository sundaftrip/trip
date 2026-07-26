import assert from "node:assert/strict";
import test from "node:test";
import {
  HOME_COPY,
  LEGACY_HOME_COPY,
  replaceLegacyHomepageCopy,
} from "../lib/home-copy";

test("replaces only retired homepage hero copy from CMS", () => {
  assert.equal(
    replaceLegacyHomepageCopy(
      LEGACY_HOME_COPY.heroEyebrow,
      LEGACY_HOME_COPY.heroEyebrow,
      HOME_COPY.heroEyebrow,
    ),
    HOME_COPY.heroEyebrow,
  );
  assert.equal(
    replaceLegacyHomepageCopy(
      "  Pergi jauh, tanpa repot  ",
      LEGACY_HOME_COPY.heroTitle,
      HOME_COPY.heroTitle,
    ),
    HOME_COPY.heroTitle,
  );
  assert.equal(
    replaceLegacyHomepageCopy(
      LEGACY_HOME_COPY.heroBody,
      LEGACY_HOME_COPY.heroBody,
      HOME_COPY.heroBody,
    ),
    HOME_COPY.heroBody,
  );
});

test("preserves a deliberate future CMS edit", () => {
  const customCopy = "Musim dingin yang ingin kamu ceritakan.";
  assert.equal(
    replaceLegacyHomepageCopy(
      customCopy,
      LEGACY_HOME_COPY.heroTitle,
      HOME_COPY.heroTitle,
    ),
    customCopy,
  );
});
