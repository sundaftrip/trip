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

const EMPTY_1F916_ATTRIBUTION = {
  matched: false,
  detectionMethod: "",
  source: "",
  medium: "",
  campaign: "",
  content: "",
} as const;

function boundedCampaignValue(value: string | null) {
  return (value ?? "").trim().slice(0, 100);
}

export function oneF916AttributionFromLocation(search: string, referrer = "") {
  const params = new URLSearchParams(search);
  const utmSource = boundedCampaignValue(params.get("utm_source")).toLowerCase();
  if (utmSource === "1f916" || utmSource === "1f916.ai") {
    return {
      matched: true,
      detectionMethod: "utm_source",
      source: "1f916",
      medium: boundedCampaignValue(params.get("utm_medium")),
      campaign: boundedCampaignValue(params.get("utm_campaign")),
      content: boundedCampaignValue(params.get("utm_content")),
    };
  }

  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
    if (host === "1f916.ai" || host.endsWith(".1f916.ai")) {
      return {
        matched: true,
        detectionMethod: "referrer",
        source: "1f916",
        medium: "referral",
        campaign: "",
        content: "",
      };
    }
  } catch {
    return EMPTY_1F916_ATTRIBUTION;
  }

  return EMPTY_1F916_ATTRIBUTION;
}
