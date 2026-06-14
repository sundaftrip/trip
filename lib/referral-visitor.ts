export const REFERRAL_VISITOR_KEY = "sundaf_visitor_id";

function fallbackId() {
  return `rv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateReferralVisitorId() {
  try {
    const existing = window.localStorage.getItem(REFERRAL_VISITOR_KEY);
    if (existing) return existing;

    const next =
      typeof window.crypto?.randomUUID === "function"
        ? `rv_${window.crypto.randomUUID()}`
        : fallbackId();
    window.localStorage.setItem(REFERRAL_VISITOR_KEY, next);
    document.cookie = `${REFERRAL_VISITOR_KEY}=${encodeURIComponent(next)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    return next;
  } catch {
    return fallbackId();
  }
}
