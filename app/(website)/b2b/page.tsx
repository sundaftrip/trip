import type { Metadata } from "next";
import B2BLandTour from "@/components/website/B2BLandTour";

export const metadata: Metadata = {
  title: "Land Tour Operator — Sundaf Trip",
  description:
    "Sundaf Trip is a land tour operator for travel agents in Indonesia — "
    + "ground operations for groups to Russia, Central Asia, and India.",
  robots: { index: false, follow: false },
};

export default function B2BPage() {
  return <B2BLandTour />;
}
