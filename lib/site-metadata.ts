import type { Metadata } from "next";

export const DEFAULT_OG_ALT = "Sundaf Trip, spesialis perjalanan Rusia, Asia Tengah, aurora, dan visa";
export const DEFAULT_OG_IMAGE = "/opengraph-image";

export function defaultOpenGraphImages(alt = DEFAULT_OG_ALT): NonNullable<Metadata["openGraph"]>["images"] {
  return [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt }];
}

export function defaultTwitterImages(): NonNullable<Metadata["twitter"]>["images"] {
  return [DEFAULT_OG_IMAGE];
}

type PublicPageMetadata = Metadata & {
  title: string | { absolute: string };
  description: string;
  alternates: { canonical: string };
};

/** Next replaces nested metadata fields, so each page needs complete social data. */
export function withPageSocialMetadata(metadata: PublicPageMetadata): Metadata {
  const title = typeof metadata.title === "string" ? metadata.title : metadata.title.absolute;
  const images = metadata.openGraph?.images ?? defaultOpenGraphImages();

  return {
    ...metadata,
    openGraph: {
      title,
      description: metadata.description,
      url: metadata.alternates.canonical,
      siteName: "Sundaf Trip",
      locale: "id_ID",
      type: "website",
      ...metadata.openGraph,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metadata.description,
      images,
      ...metadata.twitter,
    },
  };
}
