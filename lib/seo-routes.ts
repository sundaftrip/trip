export type TourIndexabilityInput = {
  id?: string | null;
  slug?: string | null;
  tripDate?: Date | string | null;
  description?: string | null;
  notes?: string | null;
  gallery?: unknown;
  itinerary?: unknown;
  inclusions?: unknown;
};

function validDate(value?: Date | string | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function canonicalTourPath(tour: { id: string; slug?: string | null }) {
  return `/tours/${tour.slug?.trim() || tour.id}`;
}

export function isSubstantialArchivedTour(
  tour: TourIndexabilityInput,
  now = new Date(),
) {
  const departure = validDate(tour.tripDate);
  if (!departure || departure.getTime() >= now.getTime()) return true;

  const textLength = `${tour.description || ""} ${tour.notes || ""}`.trim().length;
  const itineraryCount = Array.isArray(tour.itinerary) ? tour.itinerary.length : 0;
  const galleryCount = Array.isArray(tour.gallery) ? tour.gallery.length : 0;
  const inclusionCount = Array.isArray(tour.inclusions) ? tour.inclusions.length : 0;

  const evidenceSignals = [
    textLength >= 220,
    itineraryCount >= 3,
    galleryCount >= 3,
    inclusionCount >= 4,
  ].filter(Boolean).length;

  return evidenceSignals >= 2;
}
