"use client";

import { useEffect, useMemo } from "react";
import { Check, MessageCircle } from "lucide-react";
import { getOrCreateReferralVisitorId } from "@/lib/referral-visitor";

const REFERRAL_KEY = "sundaf_ref";

type Props = {
  partnerId: string;
  campaignId: string;
  partnerName: string;
  referralCode: string;
  sourceUrl: string;
  claimUrl: string;
  withoutCodeUrl: string;
};

function storeReferral(code: string) {
  try {
    window.localStorage.setItem(REFERRAL_KEY, code);
    document.cookie = `${REFERRAL_KEY}=${encodeURIComponent(code)}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`;
  } catch {
    // Ignore storage failures; the WhatsApp message still carries the code.
  }
}

type EventProps = Pick<Props, "partnerId" | "campaignId" | "partnerName" | "referralCode" | "sourceUrl">;

function sendEvent(eventType: string, eventProps: EventProps, extra?: Record<string, string>) {
  const visitorId = getOrCreateReferralVisitorId();

  fetch("/api/referrals/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      eventType,
      eventLabel: eventProps.partnerName,
      partnerId: eventProps.partnerId,
      campaignId: eventProps.campaignId,
      referralCode: eventProps.referralCode,
      metadata: {
        sourceUrl: eventProps.sourceUrl,
        visitorId,
        ...extra,
      },
    }),
  }).catch(() => {});
}

export default function ReferralGateClient(props: Props) {
  const { partnerId, campaignId, partnerName, referralCode, sourceUrl, claimUrl, withoutCodeUrl } = props;
  const isReady = Boolean(claimUrl && withoutCodeUrl);
  const eventProps = useMemo(
    () => ({ partnerId, campaignId, partnerName, referralCode, sourceUrl }),
    [campaignId, partnerId, partnerName, referralCode, sourceUrl]
  );

  useEffect(() => {
    storeReferral(referralCode);
    sendEvent("referral_page_view", eventProps, { captureMethod: "short_slug" });
    sendEvent("referral_code_detected", eventProps, { captureMethod: "short_slug" });
  }, [eventProps, referralCode]);

  function redirect(kind: "claim" | "without_code") {
    if (!isReady) return;
    if (kind === "claim") {
      storeReferral(referralCode);
      sendEvent("claim_discount_clicked", eventProps);
      sendEvent("whatsapp_redirect_clicked", eventProps, { mode: "claim_discount" });
      window.location.href = claimUrl;
      return;
    }

    sendEvent("continue_without_code_clicked", eventProps);
    sendEvent("whatsapp_redirect_clicked", eventProps, { mode: "without_code" });
    window.location.href = withoutCodeUrl;
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => redirect("claim")}
        disabled={!isReady}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#00ADB5] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#07959c] focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        <MessageCircle size={18} />
        Klaim Diskon
      </button>

      <button
        type="button"
        onClick={() => redirect("without_code")}
        disabled={!isReady}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      >
        Lanjut Tanpa Kode
      </button>

      <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-teal-700">
        <Check size={14} />
        Kode tersimpan untuk kunjungan berikutnya
      </p>

      {!isReady && (
        <p className="text-center text-xs font-semibold text-red-600">
          Nomor WhatsApp Sundaf Trip belum dikonfigurasi.
        </p>
      )}
    </div>
  );
}
