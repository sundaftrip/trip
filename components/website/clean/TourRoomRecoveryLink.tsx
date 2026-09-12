"use client";

import { buildWhatsAppBookingHref } from "@/lib/tour-commerce";
import { tourSubtotalLabel } from "@/lib/tour-cost-disclosure";
import { formatCurrency } from "@/lib/utils";
import type { BookingMode } from "./TourBookingSheet";
import { useTourRoomSelection } from "./TourRoomSelectionContext";

type TourRoomRecoveryLinkProps = {
  fallbackHref: string;
  phone: string;
  startingTotal: number;
  tourName: string;
  departureLabel: string | null;
  bookingMode: BookingMode;
  analyticsPlacement: string;
  hasMandatoryAddOns: boolean;
};

export default function TourRoomRecoveryLink({
  fallbackHref,
  phone,
  startingTotal,
  tourName,
  departureLabel,
  bookingMode,
  analyticsPlacement,
  hasMandatoryAddOns,
}: TourRoomRecoveryLinkProps) {
  const {
    selectedRoom,
    hasOptionalServices,
    optionalServicesTotal,
    optionalServicesPreference,
  } = useTourRoomSelection();
  const totalPrice = (selectedRoom?.mandatoryTotalPrice ?? startingTotal) + optionalServicesTotal;
  const href = selectedRoom || hasOptionalServices
    ? buildWhatsAppBookingHref(phone, {
        tourName,
        departureDate: departureLabel,
        formattedPrice: formatCurrency(totalPrice),
        priceCaption: tourSubtotalLabel(hasMandatoryAddOns, optionalServicesTotal > 0),
        roomPreference: selectedRoom?.label,
        addOnPreference: optionalServicesPreference,
        intent: bookingMode === "flexible" ? "private" : "booking",
      })
    : fallbackHref;

  return (
    <a href={href} data-analytics-placement={analyticsPlacement}>
      minta salinan via WhatsApp
    </a>
  );
}
