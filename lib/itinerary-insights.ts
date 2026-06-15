export type ItineraryInsightKind =
  | "meals"
  | "transport"
  | "stay"
  | "time"
  | "distance"
  | "ascent";

export interface ItineraryInsight {
  kind: ItineraryInsightKind;
  label: string;
  value: string;
}

export interface ItineraryDisplayDay {
  day: number;
  title: string;
  description: string;
  insights: ItineraryInsight[];
}

interface SourceItineraryDay {
  day: number;
  title: string;
  description: string;
}

const MEAL_CODES: Record<string, string> = {
  B: "Sarapan",
  L: "Makan siang",
  D: "Makan malam",
  BR: "Brunch",
  BRUNCH: "Brunch",
};

function pushUnique(items: string[], value: string) {
  if (!items.includes(value)) items.push(value);
}

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function removeMealCodeSuffix(title: string) {
  return normalizeSpaces(
    title
      .replace(
        /\s*\((?:\s*(?:B|L|D|BR|Brunch|Breakfast|Lunch|Dinner|Sarapan|Makan siang|Makan malam)\s*,?)+\)\s*$/i,
        "",
      )
      .replace(/\s*\/\s*/g, " / "),
  );
}

function inferMeals(source: string): string | null {
  const meals: string[] = [];
  const noMeal = /\b(no meals?|makan\s+belum\s+termasuk|belum\s+termasuk\s+makan|meals?\s*:\s*no meal|makan\s*:\s*belum termasuk)\b/i.test(source);

  for (const match of source.matchAll(/\(([^)]{1,40})\)/g)) {
    const tokens = match[1]
      .split(/[,+/&\s]+/)
      .map((token) => token.trim().toUpperCase())
      .filter(Boolean);

    if (tokens.length > 0 && tokens.every((token) => token in MEAL_CODES)) {
      tokens.forEach((token) => pushUnique(meals, MEAL_CODES[token]));
    }
  }

  if (/\b(sarapan|breakfast)\b/i.test(source)) pushUnique(meals, "Sarapan");
  if (/\bbrunch\b/i.test(source)) pushUnique(meals, "Brunch");
  if (/\b(makan\s+siang|lunch)\b/i.test(source)) pushUnique(meals, "Makan siang");
  if (/\b(makan\s+malam|dinner)\b/i.test(source)) pushUnique(meals, "Makan malam");

  if (meals.length > 0) return meals.join(", ");
  return noMeal ? "Belum termasuk" : null;
}

function inferTransport(source: string): string | null {
  const textForTrain = source.replace(/\btrain\s+street\b/gi, "");
  const transports: string[] = [];

  if (/\b(penerbangan|flight|flights|fly|airport|bandara|pesawat)\b/i.test(source)) {
    pushUnique(transports, "Penerbangan");
  }
  if (/\b(kereta(?:\s+api)?|by\s+train|train\s+transfer|journey[^.]{0,50}train|sancaka|railway|rail)\b/i.test(textForTrain)) {
    pushUnique(transports, "Kereta api");
  }
  if (/\b(bus|shuttle|coach)\b/i.test(source)) {
    pushUnique(transports, "Bus");
  }
  if (/\b(cruise|kapal|boat|ferry|speed\s*boat|speedboat|perahu|sampan)\b/i.test(source)) {
    pushUnique(transports, "Kapal/cruise");
  }
  if (/\b(transfer|drive|driving|dijemput|diantar|jemput|antar|driver|pengemudi|kendaraan)\b/i.test(source)) {
    pushUnique(transports, "Transfer darat");
  }

  return transports.length > 0 ? transports.join(", ") : null;
}

function cleanStayValue(value: string) {
  return normalizeSpaces(
    value
      .replace(/\((?:\s*(?:B|L|D|BR|Brunch|Breakfast|Lunch|Dinner)\s*,?)+\)/gi, "")
      .replace(/^(?:di|in|on)\s+/i, "")
      .replace(/\s+(?:makan|meals?|sarapan|breakfast|lunch|dinner|brunch|termasuk|included|setibanya|upon|today|after|you|we|at\s+\d{1,2}[:.]?\d{0,2}).*$/i, "")
      .replace(/[.,;:/\s]+$/g, ""),
  );
}

function inferStay(source: string): string | null {
  const patterns = [
    /\b(?:bermalam|overnight)\s*:\s*([^.\n]+)/i,
    /\b(?:bermalam|overnight)\s+(?:di|in|on)\s+([^.\n()]+)/i,
    /\b(?:akomodasi|accommodation)\s*:\s*([^.\n]+)/i,
    /\b(?:akomodasi|accommodation)\s+([^.\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (!match) continue;

    const value = cleanStayValue(match[1]);
    if (value) return value;
  }

  return null;
}

function inferExplicitMetric(source: string, label: string, kind: ItineraryInsightKind, pattern: RegExp): ItineraryInsight | null {
  const match = source.match(pattern);
  if (!match) return null;
  const value = match.slice(1).find(Boolean);
  if (!value) return null;

  return {
    kind,
    label,
    value: normalizeSpaces(value).toUpperCase(),
  };
}

function stripLeadingItineraryMeta(description: string) {
  let out = normalizeSpaces(description);
  let changed = true;
  let guard = 0;

  while (changed && guard < 8) {
    const before = out;
    out = out
      .replace(/^(?:makan|meals)\s*:\s*(?:belum termasuk|no meals?|sarapan|breakfast|brunch|makan siang|lunch|makan malam|dinner)(?:\s*(?:,|dan|&)\s*(?:sarapan|breakfast|brunch|makan siang|lunch|makan malam|dinner))*\s*/i, "")
      .replace(/^(?:makan|meals)\s+belum\s+termasuk\s*/i, "")
      .replace(/^(?:bermalam|overnight)\s*(?::|di|in|on)?\s+.{1,90}?(?=\s+(?:makan|meals|sarapan|breakfast|lunch|dinner|brunch|termasuk|included|setibanya|upon|today|after|you|we|at\s+\d{1,2}[:.]?\d{0,2}|[A-Z][A-Za-z]+[-\s]))/i, "")
      .replace(/^(?:sarapan|breakfast)(?:\s*(?:,|dan|&)\s*(?:makan siang|lunch|brunch|makan malam|dinner))*\s+(?:termasuk|included)\s*/i, "")
      .replace(/^(?:termasuk|included)\s+(?:sarapan|breakfast)(?:\s*(?:,|dan|&)\s*(?:makan siang|lunch|brunch|makan malam|dinner))*\s*/i, "");
    out = normalizeSpaces(out);
    changed = out !== before;
    guard += 1;
  }

  return out;
}

export function buildItineraryDisplay(day: SourceItineraryDay): ItineraryDisplayDay {
  const source = `${day.title}\n${day.description}`;
  const insights: ItineraryInsight[] = [];
  const meals = inferMeals(source);
  const transport = inferTransport(source);
  const stay = inferStay(source);
  const explicitMetrics = [
    inferExplicitMetric(source, "Waktu", "time", /\b(?:(?:time|waktu)\s*:\s*([^.\n,;]+)|time\s+(\d[\d.,]*(?:\s*[-\u2013]\s*\d[\d.,]*)?\s*(?:hrs?|hours?|jam)(?:\s+\w+)?))/i),
    inferExplicitMetric(source, "Jarak", "distance", /\b(?:(?:distance|jarak)\s*:\s*([^.\n,;]+)|distance\s+(\d[\d.,]*\s*km))/i),
    inferExplicitMetric(source, "Pendakian", "ascent", /\b(?:(?:ascent|kenaikan|pendakian)\s*:\s*([^.\n,;]+)|ascent\s+(\d[\d.,]*\s*m))/i),
  ].filter((item): item is ItineraryInsight => Boolean(item));

  if (meals) insights.push({ kind: "meals", label: "Makan", value: meals });
  if (transport) insights.push({ kind: "transport", label: "Transportasi", value: transport });
  if (stay) insights.push({ kind: "stay", label: "Bermalam", value: stay });
  insights.push(...explicitMetrics);

  return {
    day: day.day,
    title: removeMealCodeSuffix(day.title),
    description: stripLeadingItineraryMeta(day.description),
    insights,
  };
}
