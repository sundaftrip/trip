const JSON_LD_ESCAPE_PATTERN = /[<>&\u2028\u2029]/g;

const JSON_LD_ESCAPES: Readonly<Record<string, string>> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

/**
 * Serializes JSON-LD without leaving characters that can break out of a script element.
 */
export function serializeJsonLd(value: unknown): string {
  const serialized = JSON.stringify(value);

  if (serialized === undefined) {
    throw new TypeError("JSON-LD value must be JSON-serializable.");
  }

  return serialized.replace(
    JSON_LD_ESCAPE_PATTERN,
    (character) => JSON_LD_ESCAPES[character],
  );
}
