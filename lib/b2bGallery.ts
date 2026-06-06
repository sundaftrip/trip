import fs from "node:fs";
import path from "node:path";

/* Proof-wall foto keberangkatan nyata, dibaca otomatis dari /public/b2b-gallery.
   Dipakai di /partner, /b2b (B2BLandTour) dan /company-profile. */
export function getProofPhotos(): string[] {
  try {
    return fs
      .readdirSync(path.join(process.cwd(), "public", "b2b-gallery"))
      .filter((f) => /\.(webp|jpe?g|png)$/i.test(f))
      .sort()
      .map((f) => `/b2b-gallery/${f}`);
  } catch {
    return [];
  }
}
