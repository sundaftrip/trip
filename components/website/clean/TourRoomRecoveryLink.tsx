"use client";

import { buildWhatsAppBookingHref } from "@/lib/tour-commerce";
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
};

export default function TourRoomRecoveryLink({
  fallbackHref,
  phone,
  startingTotal,
  tourName,
  departureLabel,
  bookingMode,
  analyticsPlacement,
}: TourRoomRecoveryLinkProps) {
  const {
    selectedRoom,
    hasOptionalServices,
    optionalServicesTotal,
    optionalServicesPreference,
    adults,
    childCount,
    visaOffers,
  } = useTourRoomSelection();
  const totalPrice = (selectedRoom?.mandatoryTotalPrice ?? startingTotal) + optionalServicesTotal;
  const href = selectedRoom || hasOptionalServices
    ? buildWhatsAppBookingHref(phone, {
        tourName,
        departureDate: departureLabel,
        formattedPrice: formatCurrency(totalPrice),
        priceCaption: visaOffers.length > 0 ? "Per orang, di luar bantuan visa" : hasOptionalServices ? "Total per orang" : "Total wajib",
        roomPreference: selectedRoom?.label,
        travelerCount: adults,
        childCount,
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
