import type { Metadata } from "next";

export const DEFAULT_OG_ALT = "Sundaf Trip, spesialis perjalanan Rusia, Asia Tengah, aurora, dan visa";
export const DEFAULT_OG_IMAGE = "/opengraph-image";

export function defaultOpenGraphImages(alt = DEFAULT_OG_ALT): NonNullable<Metadata["openGraph"]>["images"] {
  return [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt }];
}

export function defaultTwitterImages(): NonNullable<Metadata["twitter"]>["images"] {
  return [DEFAULT_OG_IMAGE];
}
