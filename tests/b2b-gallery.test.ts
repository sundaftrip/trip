import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { getProofPhotos } from "../lib/b2bGallery";

test("B2B proof gallery versions every image URL from its content", () => {
  const photos = getProofPhotos();

  assert.equal(photos.length, 30);
  assert.equal(new Set(photos).size, photos.length);

  for (const photo of photos) {
    assert.match(photo, /^\/b2b-gallery\/b2b-\d{2}\.webp\?v=[a-f0-9]{12}$/);

    const [pathname, version] = photo.split("?v=");
    const expectedVersion = createHash("sha256")
      .update(fs.readFileSync(path.join(process.cwd(), "public", pathname)))
      .digest("hex")
      .slice(0, 12);

    assert.equal(version, expectedVersion);
  }
});
