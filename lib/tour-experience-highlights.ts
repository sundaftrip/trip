export type TourExperienceHighlightSource = {
  day: number;
  image?: string | null;
};

/**
 * Keep the first six itinerary days as the editorial default, then include
 * every later day for which the CMS editor deliberately supplied a highlight
 * image. An explicit image is an editorial choice and must never disappear
 * merely because the day falls after the default rail length.
 */
export function selectTourExperienceHighlights<T extends TourExperienceHighlightSource>(
  itinerary: readonly T[],
  defaultLimit = 6,
) {
  return itinerary.filter((item, index) => index < defaultLimit || Boolean(item.image?.trim()));
}
