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
  options: PackageOption[];
  basisNote: string;
  groups: PackageGroupPrice[];
};

export type PackageGroupPrice = {
  groupSize: number;
  from: number;
  optionPrices: Record<string, number>;
  roomNote: string;
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

export function packageGroup(price: PackagePrice, groupSize = price.groupSize) {
  const group = price.groups.find((group) => group.groupSize === groupSize);
  if (!group) throw new RangeError(`Unsupported group size: ${groupSize}`);
  return group;
}

export function packageTotal(price: PackagePrice, selected: readonly string[] = [], groupSize = price.groupSize) {
  const group = packageGroup(price, groupSize);
  const chosen = new Set(selected);
  return group.from + price.options.reduce((total, option) => total + (chosen.has(option.id) ? group.optionPrices[option.id] : 0), 0);
}

export function rupiah(amount: number) {
  return `Rp${amount.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
}

export function rupiahMillions(amount: number) {
  return `Rp${(amount / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} juta`;
}
