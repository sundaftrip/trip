export const CONTINENT_MAP: Record<string, string> = {
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
  "Skandinavia": "Eropa", "Eropa Timur": "Eropa",
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

export const CONTINENT_ORDER = ["Asia", "Timur Tengah", "Eropa", "Afrika", "Amerika", "Oseania", "Lainnya"];

export function getContinent(country: string): string {
  return CONTINENT_MAP[country] ?? "Lainnya";
}
