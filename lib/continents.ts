// Canonical names → continent
const BASE_MAP: Record<string, string> = {
  // Asia Tenggara
  "Malaysia": "Asia", "Singapura": "Asia", "Thailand": "Asia",
  "Vietnam": "Asia", "Kamboja": "Asia", "Myanmar": "Asia",
  "Filipina": "Asia", "Brunei": "Asia",
  // Asia Timur
  "Jepang": "Asia", "Korea Selatan": "Asia", "China": "Asia",
  "Taiwan": "Asia", "Hong Kong": "Asia", "Mongolia": "Asia",
  // Asia Selatan & Tengah
  "India": "Asia", "Bangladesh": "Asia", "Pakistan": "Asia",
  "Uzbekistan": "Asia", "Kazakhstan": "Asia", "Azerbaijan": "Asia",
  // Timur Tengah
  "Arab Saudi": "Timur Tengah", "Uni Emirat Arab": "Timur Tengah",
  "Qatar": "Timur Tengah", "Kuwait": "Timur Tengah", "Bahrain": "Timur Tengah",
  "Turki": "Timur Tengah", "Jordan": "Timur Tengah", "Israel": "Timur Tengah",
  "Palestina": "Timur Tengah", "Iran": "Timur Tengah", "Oman": "Timur Tengah",
  "Yaman": "Timur Tengah", "Irak": "Timur Tengah", "Suriah": "Timur Tengah",
  // Eropa
  "Rusia": "Eropa", "Inggris": "Eropa", "Perancis": "Eropa",
  "Jerman": "Eropa", "Italia": "Eropa", "Spanyol": "Eropa",
  "Belanda": "Eropa", "Swiss": "Eropa", "Austria": "Eropa",
  "Yunani": "Eropa", "Portugal": "Eropa", "Czech": "Eropa",
  "Polandia": "Eropa", "Norwegia": "Eropa", "Finlandia": "Eropa",
  "Swedia": "Eropa", "Denmark": "Eropa", "Belgia": "Eropa",
  "Hungaria": "Eropa", "Kroasia": "Eropa", "Serbia": "Eropa",
  "Skandinavia": "Eropa", "Eropa Timur": "Eropa", "Irlandia": "Eropa",
  "Skotlandia": "Eropa", "Wales": "Eropa", "Islandia": "Eropa",
  // Afrika
  "Maroko": "Afrika", "Mesir": "Afrika", "Afrika Selatan": "Afrika",
  "Tunisia": "Afrika", "Ethiopia": "Afrika", "Tanzania": "Afrika",
  "Kenya": "Afrika", "Algeria": "Afrika", "Libya": "Afrika",
  // Amerika
  "Amerika Serikat": "Amerika", "Kanada": "Amerika", "Brazil": "Amerika",
  "Argentina": "Amerika", "Meksiko": "Amerika", "Peru": "Amerika",
  "Kolombia": "Amerika", "Chile": "Amerika",
  // Oseania
  "Australia": "Oseania", "Selandia Baru": "Oseania",
  "Papua Nugini": "Oseania", "Fiji": "Oseania",
};

// Aliases: variasi ejaan, bahasa Inggris, singkatan, typo umum
// Semua lowercase → nama kanonik
const ALIAS_MAP: Record<string, string> = {
  // Rusia
  "russia": "Rusia", "rusia": "Rusia", "rusian": "Rusia",
  "russian": "Rusia", "russie": "Rusia",
  // Turki
  "turkey": "Turki", "turki": "Turki", "turkiye": "Turki", "turkei": "Turki",
  // Jepang
  "japan": "Jepang", "jepang": "Jepang", "jpn": "Jepang",
  // Korea
  "korea": "Korea Selatan", "south korea": "Korea Selatan",
  "korea selatan": "Korea Selatan",
  // Arab Saudi
  "arab saudi": "Arab Saudi", "saudi arabia": "Arab Saudi",
  "saudi": "Arab Saudi", "ksa": "Arab Saudi", "arabsaudi": "Arab Saudi",
  // Uni Emirat Arab
  "uae": "Uni Emirat Arab", "uni emirat arab": "Uni Emirat Arab",
  "dubai": "Uni Emirat Arab", "abu dhabi": "Uni Emirat Arab",
  "united arab emirates": "Uni Emirat Arab",
  // Palestina
  "palestine": "Palestina", "palestina": "Palestina",
  // Mesir
  "egypt": "Mesir", "mesir": "Mesir", "kairo": "Mesir",
  // Maroko
  "morocco": "Maroko", "maroko": "Maroko",
  // Amerika Serikat
  "usa": "Amerika Serikat", "us": "Amerika Serikat",
  "united states": "Amerika Serikat", "america": "Amerika Serikat",
  "amerika": "Amerika Serikat", "america serikat": "Amerika Serikat",
  // Inggris
  "uk": "Inggris", "england": "Inggris", "britain": "Inggris",
  "united kingdom": "Inggris", "great britain": "Inggris",
  // Perancis
  "france": "Perancis", "prancis": "Perancis", "perancis": "Perancis",
  "paris": "Perancis",
  // Jerman
  "germany": "Jerman", "deutschland": "Jerman",
  // Italia
  "italy": "Italia", "itali": "Italia",
  // Spanyol
  "spain": "Spanyol", "espana": "Spanyol",
  // Belanda
  "netherlands": "Belanda", "holland": "Belanda",
  // Swiss
  "switzerland": "Swiss", "suisse": "Swiss",
  // Yunani
  "greece": "Yunani",
  // Singapura
  "singapore": "Singapura",
  // Malaysia
  "malaysia": "Malaysia",
  // Thailand
  "thailand": "Thailand",
  // China
  "china": "China", "tiongkok": "China", "prc": "China",
  // India
  "india": "India",
  // Jordan
  "yordania": "Jordan",
  // Australia
  "australia": "Australia",
  // Selandia Baru
  "new zealand": "Selandia Baru", "selandia baru": "Selandia Baru",
};

// Pre-build lowercase lookup for fast matching
const LOWER_MAP: Record<string, string> = {};
Object.entries(BASE_MAP).forEach(([k, v]) => { LOWER_MAP[k.toLowerCase()] = v; });
Object.entries(ALIAS_MAP).forEach(([alias, canonical]) => {
  // alias → continent (via canonical or direct)
  LOWER_MAP[alias] = BASE_MAP[canonical] ?? canonical;
});

export const CONTINENT_MAP = BASE_MAP;
export const CONTINENT_ORDER = ["Asia", "Timur Tengah", "Eropa", "Afrika", "Amerika", "Oseania", "Lainnya"];

export function getContinent(country: string): string {
  if (!country) return "Lainnya";
  // Exact match first
  if (BASE_MAP[country]) return BASE_MAP[country];
  // Case-insensitive + alias match
  return LOWER_MAP[country.toLowerCase()] ?? "Lainnya";
}

// Normalize country name to canonical form (used for grouping)
export function normalizeCountry(country: string): string {
  if (!country) return country;
  if (BASE_MAP[country]) return country;
  const lower = country.toLowerCase();
  const found = Object.entries(ALIAS_MAP).find(([alias]) => alias === lower);
  return found ? found[1] : country;
}
