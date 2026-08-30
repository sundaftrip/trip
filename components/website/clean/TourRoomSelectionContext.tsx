"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  calculateVisaSelection,
  clampVisaTravelerCount,
  formatVisaSelectionPreference,
  updateVisaTravelerParty,
  type SelectableVisaOffer,
  type TourVisaAssessmentView,
  type VisaSelection,
} from "@/lib/tour-visa-selection";
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
  visaOffers: SelectableVisaOffer[];
  visaAssessment?: TourVisaAssessmentView;
  adults: number;
  childCount: number;
  travelerCount: number;
  setAdults: (value: number) => void;
  setChildCount: (value: number) => void;
  visaSelection: VisaSelection;
  setVisaTravelerCount: (id: string, count: number) => void;
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
  visaAssessment,
  children,
}: {
  roomPrices: TourRoomPrice[];
  selectableAddOn?: TourSelectableAddOn;
  visaOffers?: SelectableVisaOffer[];
  visaAssessment?: TourVisaAssessmentView;
  children: ReactNode;
}) {
  const [selectedRoomCode, setSelectedRoomCode] = useState<string>(roomPrices[0]?.code ?? "");
  const [includeSelectableAddOn, setIncludeSelectableAddOn] = useState(false);
  const [travelers, setTravelers] = useState({ adults: 1, childCount: 0, visaCounts: {} as Record<string, number> });
  const { adults, childCount } = travelers;
  const travelerCount = adults + childCount;
  const setTravelerCount = useCallback((field: "adults" | "childCount", value: number) => {
    setTravelers((current) => updateVisaTravelerParty(current, field, value));
  }, []);
  const setAdults = useCallback((value: number) => setTravelerCount("adults", value), [setTravelerCount]);
  const setChildCount = useCallback((value: number) => setTravelerCount("childCount", value), [setTravelerCount]);
  const setVisaTravelerCount = useCallback((id: string, count: number) => {
    if (!visaOffers.some((offer) => offer.id === id)) return;
    setTravelers((current) => ({
      ...current,
      visaCounts: { ...current.visaCounts, [id]: clampVisaTravelerCount(count, current.adults + current.childCount) },
    }));
  }, [visaOffers]);
  const selectedRoom = roomPrices.find((room) => room.code === selectedRoomCode) ?? roomPrices[0];
  const selectableAddOnTotal = includeSelectableAddOn && selectableAddOn
    ? selectableAddOn.price
    : 0;
  const selectableAddOnPreference = selectableAddOn
    ? `${selectableAddOn.name} ${includeSelectableAddOn ? "disertakan" : "tidak disertakan"}`
    : "";
  const setVisaOfferIncluded = useCallback((id: string, included: boolean) => {
    setVisaTravelerCount(id, included ? travelerCount : 0);
  }, [setVisaTravelerCount, travelerCount]);
  const visaSelection = useMemo(
    () => calculateVisaSelection(visaOffers, travelers.visaCounts, travelerCount),
    [visaOffers, travelers.visaCounts, travelerCount],
  );
  const includedVisaOfferIds = visaSelection.items.map((item) => item.id);
  const visaOfferTotal = visaSelection.total;
  const visaOfferPreference = visaOffers.length ? formatVisaSelectionPreference(visaSelection) : "";
  // Visa assistance is priced per applicant, not per traveler in the entire group.
  const optionalServicesTotal = selectableAddOnTotal;
  const optionalServicesPreference = [selectableAddOnPreference, visaOfferPreference]
    .filter(Boolean)
    .join("; ");
  const hasOptionalServices = Boolean(selectableAddOn || visaOffers.length > 0 || visaAssessment);
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
    visaAssessment,
    adults,
    childCount,
    travelerCount,
    setAdults,
    setChildCount,
    visaSelection,
    setVisaTravelerCount,
    includedVisaOfferIds,
    setVisaOfferIncluded,
    visaOfferTotal,
    visaOfferPreference,
    optionalServicesTotal,
    optionalServicesPreference,
    hasOptionalServices,
  }), [
    hasOptionalServices,
    adults,
    childCount,
    travelerCount,
    setAdults,
    setChildCount,
    setVisaTravelerCount,
    visaAssessment,
    visaSelection,
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
