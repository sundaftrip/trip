const INDONESIAN_MINOR_WORDS = new Set([
  "dan",
  "dari",
  "dengan",
  "di",
  "ke",
  "serta",
  "untuk",
]);

function capitalizeWord(word: string) {
  return word.replace(/\p{L}/u, (letter) => letter.toLocaleUpperCase("id-ID"));
}

/**
 * Keep intentional mixed-case product names intact, but repair titles that were
 * imported entirely in lowercase. This avoids data-specific overrides in the UI.
 */
export function normalizeTourDisplayTitle(value: string) {
  const title = value.replace(/\s+/g, " ").trim();
  if (!title || title !== title.toLocaleLowerCase("id-ID")) return title;

  let wordIndex = 0;
  return title
    .split(/(\s+)/)
    .map((part) => {
      if (/^\s+$/.test(part)) return part;
      const normalized = part.toLocaleLowerCase("id-ID");
      const next = wordIndex > 0 && INDONESIAN_MINOR_WORDS.has(normalized)
        ? normalized
        : capitalizeWord(normalized);
      wordIndex += 1;
      return next;
    })
    .join("");
}

const MONTH_NAME = [
  "januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus",
  "september", "oktober", "november", "desember", "january", "february", "march",
  "may", "june", "july", "august", "october", "november", "december",
].join("|");

const LEADING_ITINERARY_DATE = new RegExp(
  `^\\(?\\d{1,2}\\s+(?:${MONTH_NAME})\\s+\\d{4}\\)?\\s*[):.\\-–—]*\\s*`,
  "i",
);

/** Remove a date/day prefix when the itinerary UI already shows it separately. */
export function normalizeItineraryDisplayTitle(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .replace(LEADING_ITINERARY_DATE, "")
    .replace(/^(?:hari\s*(?:ke-?)?|day\s*)\d+\s*[:.\-–—]+\s*/i, "")
    .trim();
}
