// Turns a tour's city highlight (e.g. "Moskow•, St Petersburg•, Murmansk•, Moskow")
// into a schema.org ItemList of Places for TouristTrip.itinerary, so assistants
// can answer "which cities does this trip visit" from structured data.
export function itineraryFromCityHighlight(cityHighlight: string | null | undefined) {
  if (!cityHighlight?.trim()) return null;
  const places = cityHighlight
    .split(/[•,;/]|\s&\s|\s\+\s/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((part) => part.length > 1)
    // Keep the travelled order (a return to the first city is meaningful) but
    // drop accidental back-to-back duplicates.
    .filter((part, index, all) => index === 0 || part.toLowerCase() !== all[index - 1].toLowerCase());
  if (places.length < 2) return null;
  return {
    "@type": "ItemList",
    itemListElement: places.map((name, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: { "@type": "Place", name },
    })),
  };
}
