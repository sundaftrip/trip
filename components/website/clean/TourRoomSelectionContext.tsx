"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TourVisaOffer } from "@/lib/tour-visa-offers";
import type { TourRoomPrice } from "@/lib/tour-room-pricing";

export type TourSelectableAddOn = {
  name: string;
  price: number;
};

type TourRoomSelectionValue = {
  selectedRoom?: TourRoomPrice;
  selectedRoomCode: string;
  setSelectedRoomCode: (value: string) => void;
  selectableAddOn?: TourSelectableAddOn;
  includeSelectableAddOn: boolean;
  setIncludeSelectableAddOn: (value: boolean) => void;
  selectableAddOnTotal: number;
  selectableAddOnPreference: string;
  visaOffers: TourVisaOffer[];
  includedVisaOfferIds: string[];
  setVisaOfferIncluded: (id: string, value: boolean) => void;
  visaOfferTotal: number;
  visaOfferPreference: string;
  optionalServicesTotal: number;
  optionalServicesPreference: string;
  hasOptionalServices: boolean;
};

const TourRoomSelectionContext = createContext<TourRoomSelectionValue | null>(null);

export function TourRoomSelectionProvider({
  roomPrices,
  selectableAddOn,
  visaOffers = [],
  children,
}: {
  roomPrices: TourRoomPrice[];
  selectableAddOn?: TourSelectableAddOn;
  visaOffers?: TourVisaOffer[];
  children: ReactNode;
}) {
  const [selectedRoomCode, setSelectedRoomCode] = useState<string>(roomPrices[0]?.code ?? "");
  const [includeSelectableAddOn, setIncludeSelectableAddOn] = useState(false);
  const [includedVisaOfferIds, setIncludedVisaOfferIds] = useState<string[]>([]);
  const selectedRoom = roomPrices.find((room) => room.code === selectedRoomCode) ?? roomPrices[0];
  const selectableAddOnTotal = includeSelectableAddOn && selectableAddOn
    ? selectableAddOn.price
    : 0;
  const selectableAddOnPreference = selectableAddOn
    ? `${selectableAddOn.name} ${includeSelectableAddOn ? "disertakan" : "tidak disertakan"}`
    : "";
  const setVisaOfferIncluded = useCallback((id: string, included: boolean) => {
    setIncludedVisaOfferIds((current) => {
      if (included) return current.includes(id) ? current : [...current, id];
      return current.filter((currentId) => currentId !== id);
    });
  }, []);
  const visaOfferTotal = visaOffers.reduce(
    (total, offer) => total + (includedVisaOfferIds.includes(offer.id) ? offer.price : 0),
    0,
  );
  const visaOfferPreference = visaOffers
    .map((offer) => (
      `${offer.name}: ${includedVisaOfferIds.includes(offer.id) ? "Ya, perlu dibantu" : "Tidak"}`
    ))
    .join("; ");
  const optionalServicesTotal = selectableAddOnTotal + visaOfferTotal;
  const optionalServicesPreference = [selectableAddOnPreference, visaOfferPreference]
    .filter(Boolean)
    .join("; ");
  const hasOptionalServices = Boolean(selectableAddOn || visaOffers.length > 0);
  const value = useMemo(() => ({
    selectedRoom,
    selectedRoomCode,
    setSelectedRoomCode,
    selectableAddOn,
    includeSelectableAddOn,
    setIncludeSelectableAddOn,
    selectableAddOnTotal,
    selectableAddOnPreference,
    visaOffers,
    includedVisaOfferIds,
    setVisaOfferIncluded,
    visaOfferTotal,
    visaOfferPreference,
    optionalServicesTotal,
    optionalServicesPreference,
    hasOptionalServices,
  }), [
    hasOptionalServices,
    includeSelectableAddOn,
    includedVisaOfferIds,
    optionalServicesPreference,
    optionalServicesTotal,
    selectableAddOn,
    selectableAddOnPreference,
    selectableAddOnTotal,
    selectedRoom,
    selectedRoomCode,
    setVisaOfferIncluded,
    visaOfferPreference,
    visaOfferTotal,
    visaOffers,
  ]);

  return (
    <TourRoomSelectionContext.Provider value={value}>
      {children}
    </TourRoomSelectionContext.Provider>
  );
}

export function useTourRoomSelection() {
  const value = useContext(TourRoomSelectionContext);
  if (!value) throw new Error("useTourRoomSelection must be used within TourRoomSelectionProvider");
  return value;
}
