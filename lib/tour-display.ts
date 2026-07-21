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

