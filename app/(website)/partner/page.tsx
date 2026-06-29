import type { Metadata } from "next";
import B2BLandTour from "@/components/website/B2BLandTour";

export const metadata: Metadata = {
  title: "Sundaf Trip Group - Travel Operations & Supplier Relations",
  description:
    "Sundaf Trip Group is the corporate-facing identity of Sundaf Trip for B2B travel operations, supplier relations, and group travel coordination.",
  robots: { index: false, follow: false },
};

export default function PartnerPage() {
  return <B2BLandTour withCofounder />;
}
