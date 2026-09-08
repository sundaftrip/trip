export type PackageOption = {
  id: string;
  name: string;
  amount: number;
  description: string;
};

export type PackagePrice = {
  from: number;
  groupSize: number;
  hotel: string;
  updated: string;
  components: { label: string; amount: number; description: string }[];
  options: PackageOption[];
  airfareNote: string;
  basisNote: string;
};

export type PackageDay = {
  title: string;
  description: string;
  overnight: string;
  meals?: string;
};

export type PackageDetails = {
  duration: string;
  travelNote: string;
  price: PackagePrice;
  days: PackageDay[];
  included: string[];
  excluded: string[];
  hotels: { city: string; nights: number; note: string }[];
  gallery: { src: string; alt: string; caption: string }[];
  flightRoute: string;
  flightNote: string;
  englishSummary: string;
};

export function packageTotal(price: PackagePrice, selected: readonly string[] = []) {
  const chosen = new Set(selected);
  return price.from + price.options.reduce((total, option) => total + (chosen.has(option.id) ? option.amount : 0), 0);
}

export function rupiah(amount: number) {
  return `Rp${amount.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
}

export function rupiahMillions(amount: number) {
  return `Rp${(amount / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} juta`;
}
