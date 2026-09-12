import { canonicalTourPath, isSubstantialArchivedTour, type TourIndexabilityInput } from "./seo-routes";
import { isPublicTourVisible } from "./public-tours";
import { visaSlug } from "./visa-slug";

export type PublicContentChange = { paths: string[]; changedAt?: Date };
type Tour = TourIndexabilityInput & { id: string; status?: string | null; updatedAt?: Date };
type Blog = { slug: string; published: boolean; updatedAt?: Date };
type Visa = { en: string; updatedAt?: Date };
type Geo = { routePath: string; published: boolean; updatedAt?: Date };

const GEO_PUBLIC_PATHS = new Set([
  "/sundaf-trip", "/open-trip-vietnam", "/open-trip-rusia-dari-jakarta",
  "/tour-rusia-dari-indonesia", "/open-trip-aurora-rusia", "/visa-rusia-wni",
  "/jasa-urus-visa-eropa", "/jasa-urus-visa-amerika-canada",
  "/destinations/murmansk", "/destinations/teriberka",
]);

export function tourContentChange(before: Tour | null, after: Tour | null): PublicContentChange {
  const path = (tour: Tour | null) => tour && isPublicTourVisible(tour) && isSubstantialArchivedTour(tour)
    ? canonicalTourPath(tour) : null;
  const paths = [path(before), path(after)].filter((value): value is string => !!value);
  return { paths: paths.length ? [...new Set(["/", "/tours", ...paths])] : [], changedAt: after?.updatedAt };
}

export function blogContentChange(before: Blog | null, after: Blog | null): PublicContentChange {
  const paths = [before, after].filter((post): post is Blog => !!post?.published).map((post) => `/blog/${post.slug}`);
  return { paths: paths.length ? [...new Set(["/", "/blog", ...paths])] : [], changedAt: after?.updatedAt };
}

export function visaContentChange(before: Visa | null, after: Visa | null): PublicContentChange {
  const paths = [before, after].filter((visa): visa is Visa => !!visa).map((visa) => `/visa/${visaSlug(visa.en)}`);
  return { paths: paths.length ? [...new Set(["/visa", "/visa-intelligence", ...paths])] : [], changedAt: after?.updatedAt };
}

export function geoContentChange(before: Geo | null, after: Geo | null): PublicContentChange {
  // Unknown CMS routePath values do not create Next.js pages. Unpublishing a
  // known GEO override still changes its public fallback page.
  return {
    paths: [...new Set([before, after].filter((page): page is Geo => !!page?.published && GEO_PUBLIC_PATHS.has(page.routePath)).map((page) => page.routePath))],
    changedAt: after?.updatedAt,
  };
}

export function settingsContentChange(before: Record<string, string>, after: Record<string, string>): PublicContentChange {
  const changed = Object.keys(after).some((key) =>
    (key.startsWith("company_") || key.startsWith("about_")) && before[key] !== after[key]);
  return { paths: changed ? ["/", "/about", "/contact", "/media-kit", "/legalitas-dan-keamanan", "/sundaf-trip"] : [] };
}
