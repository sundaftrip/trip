export const META_TITLE_MAX = 60;
export const META_TITLE_SUFFIX = " · Sundaf Trip";
export const META_PAGE_TITLE_MAX = META_TITLE_MAX - META_TITLE_SUFFIX.length;
export const META_DESCRIPTION_MAX = 155;

const TRAILING_BRAND = /\s*(?:(?:[|·,:—–-]\s*)|(?:bersama\s+))?sundaf\s*trip\s*$/i;

export function cleanMetadataText(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateMetadataText(
  value: string | null | undefined,
  maxLength: number,
): string {
  const text = cleanMetadataText(value);
  if (text.length <= maxLength) return text;

  const suffix = "…";
  const budget = Math.max(1, maxLength - suffix.length);
  let shortened = text.slice(0, budget);

  if (!/\s/.test(text.charAt(budget)) && /\s/.test(shortened)) {
    shortened = shortened.replace(/\s+\S*$/, "");
  }

  shortened = shortened.replace(/[\s,.;:!?|/—–-]+$/, "");
  if (!shortened) shortened = text.slice(0, budget);
  return `${shortened}${suffix}`;
}

/**
 * Child-page titles inherit " · Sundaf Trip" from the root layout. Keep the
 * page-specific portion within the remaining budget and remove a redundant
 * trailing brand name before Next.js applies that suffix.
 */
export function toPageMetadataTitle(value: string | null | undefined): string {
  const cleaned = cleanMetadataText(value);
  const withoutTrailingBrand = cleaned.replace(TRAILING_BRAND, "").replace(/[\s,.;:!?|/—–-]+$/, "");
  return truncateMetadataText(withoutTrailingBrand || cleaned, META_PAGE_TITLE_MAX);
}

/** Keep a short differentiator (for example, an archived departure date) at
 * the end of a child-page title without allowing the layout's brand suffix to
 * push the published title past the budget. */
function toQualifiedMetadataTitle(
  value: string | null | undefined,
  qualifier: string | null | undefined,
  maxLength: number,
): string {
  const cleanQualifier = cleanMetadataText(qualifier);
  if (!cleanQualifier) return truncateMetadataText(value, maxLength);

  const separator = " · ";
  const safeQualifier = truncateMetadataText(
    cleanQualifier,
    Math.max(1, maxLength - separator.length - 1),
  );
  const baseBudget = maxLength - separator.length - safeQualifier.length;
  const cleaned = cleanMetadataText(value);
  const withoutTrailingBrand = cleaned.replace(TRAILING_BRAND, "").replace(/[\s,.;:!?|/—–-]+$/, "");
  const base = truncateMetadataText(withoutTrailingBrand || cleaned, Math.max(1, baseBudget));

  return `${base}${separator}${safeQualifier}`;
}

export function toQualifiedPageMetadataTitle(
  value: string | null | undefined,
  qualifier: string | null | undefined,
): string {
  return toQualifiedMetadataTitle(value, qualifier, META_PAGE_TITLE_MAX);
}

export function toQualifiedAbsoluteMetadataTitle(
  value: string | null | undefined,
  qualifier: string | null | undefined,
): string {
  return toQualifiedMetadataTitle(value, qualifier, META_TITLE_MAX);
}

export function toAbsoluteMetadataTitle(value: string | null | undefined): string {
  return truncateMetadataText(value, META_TITLE_MAX);
}

export function toMetaDescription(value: string | null | undefined): string {
  return truncateMetadataText(value, META_DESCRIPTION_MAX);
}

/** Prefix repeated CMS copy with page-specific context so similar products do
 * not publish identical descriptions. */
export function toContextualMetaDescription(
  context: string | null | undefined,
  description: string | null | undefined,
): string {
  const cleanContext = cleanMetadataText(context);
  const cleanDescription = cleanMetadataText(description);
  if (!cleanContext) return toMetaDescription(cleanDescription);
  if (!cleanDescription) return toMetaDescription(cleanContext);
  if (cleanDescription.toLocaleLowerCase("id-ID").startsWith(cleanContext.toLocaleLowerCase("id-ID"))) {
    return toMetaDescription(cleanDescription);
  }
  return toMetaDescription(`${cleanContext}. ${cleanDescription}`);
}
