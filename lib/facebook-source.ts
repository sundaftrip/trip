import { fetchPublicText, type AddressResolver, type PublicTextResponse } from "@/lib/safe-public-url";

const FACEBOOK_HOSTNAMES = [
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "mbasic.facebook.com",
] as const;

export function normalizeFacebookGroupUrl(input: unknown): URL {
  if (typeof input !== "string" || !input.trim()) {
    throw new Error("groupUrl diperlukan");
  }

  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new Error("URL grup Facebook tidak valid");
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (
    url.protocol !== "https:"
    || !FACEBOOK_HOSTNAMES.includes(hostname as (typeof FACEBOOK_HOSTNAMES)[number])
    || url.username
    || url.password
    || url.port
    || !url.pathname.startsWith("/groups/")
  ) {
    throw new Error("Gunakan URL HTTPS grup Facebook yang valid");
  }

  url.hostname = "mbasic.facebook.com";
  url.hash = "";
  return url;
}

export function fetchFacebookGroupHtml(
  url: URL,
  cookie: string,
  resolveAddresses?: AddressResolver,
): Promise<PublicTextResponse> {
  return fetchPublicText(url, {
    allowedHostnames: FACEBOOK_HOSTNAMES,
    headers: {
      Cookie: cookie,
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
    },
    maxBytes: 2_000_000,
    maxRedirects: 4,
    resolveAddresses,
    timeoutMs: 15_000,
  });
}
