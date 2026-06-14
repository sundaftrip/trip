"use client";

import { useEffect } from "react";
import { Check, MessageCircle } from "lucide-react";

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

function sendEvent(eventType: string, props: Props, extra?: Record<string, string>) {
  fetch("/api/referrals/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      eventType,
      eventLabel: props.partnerName,
      partnerId: props.partnerId,
      campaignId: props.campaignId,
      referralCode: props.referralCode,
      metadata: {
        sourceUrl: props.sourceUrl,
        ...extra,
      },
    }),
  }).catch(() => {});
}

export default function ReferralGateClient(props: Props) {
  const isReady = Boolean(props.claimUrl && props.withoutCodeUrl);

  useEffect(() => {
    storeReferral(props.referralCode);
    sendEvent("referral_code_detected", props, { captureMethod: "short_slug" });
  }, [props]);

  function redirect(kind: "claim" | "without_code") {
    if (!isReady) return;
    if (kind === "claim") {
      storeReferral(props.referralCode);
      sendEvent("claim_discount_clicked", props);
      sendEvent("whatsapp_redirect_clicked", props, { mode: "claim_discount" });
      window.location.href = props.claimUrl;
      return;
    }

    sendEvent("continue_without_code_clicked", props);
    sendEvent("whatsapp_redirect_clicked", props, { mode: "without_code" });
    window.location.href = props.withoutCodeUrl;
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
