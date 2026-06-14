"use client";

import { useEffect } from "react";
import { getOrCreateReferralVisitorId } from "@/lib/referral-visitor";

const REFERRAL_KEY = "sundaf_ref";

function storeReferral(code: string) {
  try {
    window.localStorage.setItem(REFERRAL_KEY, code);
    document.cookie = `${REFERRAL_KEY}=${encodeURIComponent(code)}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`;
  } catch {
    // Browser privacy mode can reject storage; the URL param still works for this session.
  }
}

export default function ReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref")?.trim().toUpperCase();
    if (!ref) return;

    storeReferral(ref);
    const visitorId = getOrCreateReferralVisitorId();
    fetch("/api/referrals/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventType: "referral_code_detected",
        referralCode: ref,
        metadata: {
          sourceUrl: window.location.href,
          captureMethod: "url_param",
          visitorId,
        },
      }),
    }).catch(() => {});
  }, []);

  return null;
}
