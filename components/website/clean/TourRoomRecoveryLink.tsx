"use client";

import { buildWhatsAppBookingHref } from "@/lib/tour-commerce";
import { formatCurrency } from "@/lib/utils";
import type { BookingMode } from "./TourBookingSheet";
import { useTourRoomSelection } from "./TourRoomSelectionContext";

type TourRoomRecoveryLinkProps = {
  fallbackHref: string;
  phone: string;
  tourName: string;
  departureLabel: string | null;
  bookingMode: BookingMode;
  analyticsPlacement: string;
};

export default function TourRoomRecoveryLink({
  fallbackHref,
  phone,
  tourName,
  departureLabel,
  bookingMode,
  analyticsPlacement,
}: TourRoomRecoveryLinkProps) {
  const { selectedRoom } = useTourRoomSelection();
  const href = selectedRoom
    ? buildWhatsAppBookingHref(phone, {
        tourName,
        departureDate: departureLabel,
        formattedPrice: formatCurrency(selectedRoom.mandatoryTotalPrice),
        priceCaption: "Total wajib",
        roomPreference: selectedRoom.label,
        intent: bookingMode === "flexible" ? "private" : "booking",
      })
    : fallbackHref;

  return (
    <a href={href} data-analytics-placement={analyticsPlacement}>
      minta salinan via WhatsApp
    </a>
  );
}
