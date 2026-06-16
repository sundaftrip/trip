const PAIRED_MARKER_RE = /(^|[\s([{])(\*{1,3})\s*([^*\n][^*\n]*?)\s*\2(?=$|[\s.,;:!?)}\]])/g;

export function stripLooseItineraryMarkup(value: string) {
  return value
    .replace(/(^|\n)\s*[-\u2013\u2014•]\s+/g, "$1")
    .replace(/(^|\n)\s*Catatan:\s*s:\s*/gi, "$1Catatan: ")
    .replace(/\*{2,}/g, "")
    .replace(/(^|[\s([{])\*(?=\S)/g, "$1")
    .replace(/([^\d\s])\*(?=$|[\s.,;:!?)}\]])/g, "$1")
    .replace(/\s{2,}/g, " ");
}

export function stripItineraryMarkup(value: string) {
  return stripLooseItineraryMarkup(
    value.replace(PAIRED_MARKER_RE, (_match, prefix: string, _marker: string, text: string) => `${prefix}${text.trim()}`),
  ).trim();
}
