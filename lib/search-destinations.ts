export type SearchDestination = {
  name: string;
  region: string;
  href: string;
  description: string;
  keywords: string[];
};

export const SEARCH_DESTINATIONS: SearchDestination[] = [
  {
    name: "Murmansk",
    region: "Rusia · Lingkar Arktik",
    href: "/destinations/murmansk",
    description: "Kota Arktik Rusia untuk aurora borealis, husky sledding, snowmobile, dan gerbang perjalanan ke Teriberka.",
    keywords: ["aurora", "aurora borealis", "rusia arktik", "kola peninsula", "snowmobile", "husky", "kepiting raja"],
  },
  {
    name: "Teriberka",
    region: "Rusia · Laut Barents",
    href: "/destinations/teriberka",
    description: "Desa nelayan di tepi Laut Barents untuk whale watching, aurora, Pantai Telur Naga, dan lanskap Arktik Rusia.",
    keywords: ["laut barents", "whale watching", "paus", "pantai telur naga", "leviathan", "murmansk teriberka", "aurora teriberka"],
  },
  {
    name: "Kazakhstan",
    region: "Asia Tengah",
    href: "/destinations/kazakhstan",
    description: "Destinasi Asia Tengah untuk Almaty, Danau Kaindy, Charyn Canyon, Astana, dan perjalanan bebas visa 30 hari untuk WNI.",
    keywords: ["almaty", "danau kaindy", "charyn canyon", "astana", "asia tengah", "bebas visa"],
  },
];

function normalizeSearchText(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function destinationSearchText(destination: SearchDestination) {
  return [
    destination.name,
    destination.region,
    destination.description,
    ...destination.keywords,
  ].join(" ");
}

export function findSearchDestinations(query: string, limit = 6) {
  const normalizedQuery = normalizeSearchText(query.trim());
  if (normalizedQuery.length < 2) return [];

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return SEARCH_DESTINATIONS
    .map((destination) => {
      const name = normalizeSearchText(destination.name);
      const haystack = normalizeSearchText(destinationSearchText(destination));
      const matchesAllTokens = tokens.every((token) => haystack.includes(token));
      const score = name === normalizedQuery ? 4
        : name.startsWith(normalizedQuery) ? 3
        : name.includes(normalizedQuery) ? 2
        : matchesAllTokens ? 1
        : 0;
      return { destination, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.destination.name.localeCompare(b.destination.name))
    .slice(0, limit)
    .map(({ destination }) => ({
      name: destination.name,
      region: destination.region,
      href: destination.href,
      description: destination.description,
    }));
}
