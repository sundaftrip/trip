export const CAMPAIGN_STORAGE_KEY = "sundaf_utm";

export function campaignParamsFromSearch(search: string) {
  const source = new URLSearchParams(search);
  const campaign = new URLSearchParams();
  source.forEach((value, key) => {
    if (key.toLowerCase().startsWith("utm_")) campaign.set(key, value);
  });
  return campaign;
}

export function captureCampaignAttribution(search: string) {
  const campaign = campaignParamsFromSearch(search).toString();
  if (!campaign || typeof window === "undefined") return campaign;
  try {
    window.sessionStorage.setItem(CAMPAIGN_STORAGE_KEY, campaign);
  } catch {
    // Attribution must not block navigation in restricted storage modes.
  }
  return campaign;
}

export function readCampaignAttribution() {
  if (typeof window === "undefined") return "";
  const current = campaignParamsFromSearch(window.location.search).toString();
  if (current) return current;
  try {
    return window.sessionStorage.getItem(CAMPAIGN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function appendCampaignToPath(path: string, search: string) {
  const campaign = campaignParamsFromSearch(search);
  if (!campaign.size) return path;
  const url = new URL(path, "https://sundaftrip.com");
  campaign.forEach((value, key) => url.searchParams.set(key, value));
  return `${url.pathname}${url.search}${url.hash}`;
}
