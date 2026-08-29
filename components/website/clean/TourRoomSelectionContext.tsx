"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { TourRoomPrice } from "@/lib/tour-room-pricing";

type TourRoomSelectionValue = {
  selectedRoom?: TourRoomPrice;
  selectedRoomCode: string;
  setSelectedRoomCode: (value: string) => void;
};

const TourRoomSelectionContext = createContext<TourRoomSelectionValue | null>(null);

export function TourRoomSelectionProvider({
  roomPrices,
  children,
}: {
  roomPrices: TourRoomPrice[];
  children: ReactNode;
}) {
  const [selectedRoomCode, setSelectedRoomCode] = useState<string>(roomPrices[0]?.code ?? "");
  const selectedRoom = roomPrices.find((room) => room.code === selectedRoomCode) ?? roomPrices[0];
  const value = useMemo(() => ({
    selectedRoom,
    selectedRoomCode,
    setSelectedRoomCode,
  }), [selectedRoom, selectedRoomCode]);

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
