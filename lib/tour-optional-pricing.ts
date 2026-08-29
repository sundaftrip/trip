import { formatCurrency } from "@/lib/utils";

type PriceableDeparture = {
  priceLabel: string;
  priceValue?: number;
};

export function applyOptionalServicesToDepartures<T extends PriceableDeparture>(
  departures: readonly T[],
  optionalServicesTotal: number,
): T[] {
  return departures.map((departure) => ({
    ...departure,
    priceLabel: typeof departure.priceValue === "number"
      ? formatCurrency(departure.priceValue + optionalServicesTotal)
      : departure.priceLabel,
  }));
}
