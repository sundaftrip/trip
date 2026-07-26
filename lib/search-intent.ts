export type SearchIntent = {
  countryLabel: string;
  countryTerms: string[];
  tourHref: string;
};

type SearchIntentDefinition = SearchIntent & {
  aliases: string[];
};

const SEARCH_INTENTS: SearchIntentDefinition[] = [
  {
    countryLabel: "Rusia",
    aliases: [
      "rusia",
      "russia",
      "russian",
      "moscow",
      "moskow",
      "murmansk",
      "st petersburg",
      "saint petersburg",
      "teriberka",
    ],
    countryTerms: ["Rusia", "Russia"],
    tourHref: "/tours?destination=rusia",
  },
  {
    countryLabel: "Kanada",
    aliases: ["kanada", "canada", "canadian", "toronto", "vancouver", "montreal"],
    countryTerms: ["Kanada", "Canada"],
    tourHref: "/tours?destination=canada",
  },
  {
    countryLabel: "Kazakhstan",
    aliases: ["kazakhstan", "kazakstan", "astana", "almaty", "shymkent"],
    countryTerms: ["Kazakhstan", "Kazakstan"],
    tourHref: "/tours?destination=asia-tengah",
  },
  {
    countryLabel: "Jepang",
    aliases: ["jepang", "japan", "japanese", "tokyo", "osaka", "kyoto", "sapporo", "hokkaido"],
    countryTerms: ["Jepang", "Japan"],
    tourHref: "/tours?destination=jepang",
  },
  {
    countryLabel: "Vietnam",
    aliases: ["vietnam", "hanoi", "saigon", "ho chi minh", "sapa", "danang", "da nang", "hoi an"],
    countryTerms: ["Vietnam"],
    tourHref: "/tours?destination=vietnam",
  },
  {
    countryLabel: "Korea Selatan",
    aliases: ["korea", "korea selatan", "south korea", "seoul", "busan"],
    countryTerms: ["Korea Selatan", "South Korea", "Korea"],
    tourHref: "/tours?destination=korea-selatan",
  },
  {
    countryLabel: "Amerika Serikat",
    aliases: ["amerika", "amerika serikat", "united states", "usa", "new york", "los angeles"],
    countryTerms: ["Amerika Serikat", "United States", "USA"],
    tourHref: "/tours?destination=amerika-serikat",
  },
];

export function normalizeSearchQuery(value: string) {
  return value
    .toLocaleLowerCase("id-ID")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsAlias(query: string, alias: string) {
  return (` ${query} `).includes(` ${alias} `);
}

export function resolveSearchIntent(value: string): SearchIntent | null {
  const query = normalizeSearchQuery(value);
  if (!query) return null;

  const match = SEARCH_INTENTS
    .flatMap((intent) => intent.aliases.map((alias) => ({
      alias: normalizeSearchQuery(alias),
      intent,
    })))
    .filter(({ alias }) => containsAlias(query, alias))
    .sort((a, b) => b.alias.length - a.alias.length)[0];

  if (!match) return null;
  const { countryLabel, countryTerms, tourHref } = match.intent;
  return { countryLabel, countryTerms, tourHref };
}

export function expandedSearchTerms(value: string) {
  const raw = value.trim();
  const intent = resolveSearchIntent(raw);
  return Array.from(new Set([
    raw,
    ...(intent?.countryTerms ?? []),
  ].filter(Boolean)));
}
