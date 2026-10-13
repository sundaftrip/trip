"use client";

import { useEffect } from "react";
import { captureCampaignAttribution } from "@/lib/campaign-attribution";

/** Keeps utm_* parameters for the visit so booking and custom-trip leads carry them. */
export default function CampaignCapture() {
  useEffect(() => {
    captureCampaignAttribution(window.location.search);
  }, []);

  return null;
}
