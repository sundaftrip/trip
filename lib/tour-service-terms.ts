export function normalizeTourServiceTerms(value: string) {
  return value
    .replace(/\btour leader\b/gi, "Tour Leader")
    .replace(/\b(Tour Leader)\s*&\s*driver\b/gi, "$1 & Driver")
    .replace(/\b(Tour Leader)\s+(?:dan|and)\s+driver\b/gi, "$1 & Driver")
    .replace(/\bpemimpin tur\b/gi, "Tour Leader")
    .replace(/\bpengemudi\b/gi, "Driver")
    .replace(/\bTour Leader\s*(?:&|dan|and)\s*Driver\b/gi, "Tour Leader & Driver");
}
