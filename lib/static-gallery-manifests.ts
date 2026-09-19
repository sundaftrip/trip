/**
 * Static public-asset manifests keep Next.js from tracing whole directories
 * into server functions. Update these counts when adding optimized gallery
 * files to public/about-gallery-md or public/b2b-gallery.
 */
export const ABOUT_GALLERY_IMAGES = Object.freeze(
  Array.from(
    { length: 24 },
    (_, index) => `/about-gallery-md/${String(index + 1).padStart(2, "0")}-aurora.webp`,
  ),
);

export const B2B_GALLERY_IMAGES = Object.freeze(
  Array.from(
    { length: 30 },
    (_, index) => `/b2b-gallery/b2b-${String(index + 1).padStart(2, "0")}.webp`,
  ),
);
