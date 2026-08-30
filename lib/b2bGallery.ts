import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/* Proof-wall foto keberangkatan nyata, dibaca otomatis dari /public/b2b-gallery.
   Dipakai di /partner, /b2b (B2BLandTour) dan /company-profile. */
let cachedProofPhotos: string[] | undefined;

export function getProofPhotos(): string[] {
  if (cachedProofPhotos) {
    return [...cachedProofPhotos];
  }

  try {
    const galleryDirectory = path.join(process.cwd(), "public", "b2b-gallery");

    cachedProofPhotos = fs
      .readdirSync(galleryDirectory)
      .filter((f) => /\.(webp|jpe?g|png)$/i.test(f))
      .sort()
      .map((f) => {
        const version = createHash("sha256")
          .update(fs.readFileSync(path.join(galleryDirectory, f)))
          .digest("hex")
          .slice(0, 12);

        return `/b2b-gallery/${f}?v=${version}`;
      });

    return [...cachedProofPhotos];
  } catch {
    return [];
  }
}
