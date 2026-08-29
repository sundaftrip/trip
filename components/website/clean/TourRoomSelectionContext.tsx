"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
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
};

const TourRoomSelectionContext = createContext<TourRoomSelectionValue | null>(null);

export function TourRoomSelectionProvider({
  roomPrices,
  selectableAddOn,
  children,
}: {
  roomPrices: TourRoomPrice[];
  selectableAddOn?: TourSelectableAddOn;
  children: ReactNode;
}) {
  const [selectedRoomCode, setSelectedRoomCode] = useState<string>(roomPrices[0]?.code ?? "");
  const [includeSelectableAddOn, setIncludeSelectableAddOn] = useState(false);
  const selectedRoom = roomPrices.find((room) => room.code === selectedRoomCode) ?? roomPrices[0];
  const selectableAddOnTotal = includeSelectableAddOn && selectableAddOn
    ? selectableAddOn.price
    : 0;
  const selectableAddOnPreference = selectableAddOn
    ? `${selectableAddOn.name} ${includeSelectableAddOn ? "disertakan" : "tidak disertakan"}`
    : "";
  const value = useMemo(() => ({
    selectedRoom,
    selectedRoomCode,
    setSelectedRoomCode,
    selectableAddOn,
    includeSelectableAddOn,
    setIncludeSelectableAddOn,
    selectableAddOnTotal,
    selectableAddOnPreference,
  }), [
    includeSelectableAddOn,
    selectableAddOn,
    selectableAddOnPreference,
    selectableAddOnTotal,
    selectedRoom,
    selectedRoomCode,
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
