const GOOGLE_PROFILE_HOSTS = new Set([
  "g.co",
  "g.page",
  "goo.gl",
  "maps.app.goo.gl",
  "share.google",
]);

function isGoogleHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  return GOOGLE_PROFILE_HOSTS.has(host);
}

function isGoogleMapsUrl(url: URL): boolean {
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (isGoogleHost(host)) return true;

  const isGoogleDomain = host === "google.com" || host === "google.co.id";
  const isMapsSubdomain = host === "maps.google.com" || host === "maps.google.co.id";
  if (isMapsSubdomain) return true;
  if (!isGoogleDomain) return false;

  return url.pathname === "/maps" || url.pathname.startsWith("/maps/") || url.pathname.startsWith("/local/");
}

/**
 * Accept only public Google/Maps profile links. This value is used by the
 * website and JSON-LD; it never writes to or edits Google Business Profile.
 */
export function normalizeGoogleBusinessUrl(value: string | null | undefined): string | undefined {
  const input = value?.trim();
  if (!input) return undefined;

  const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const url = new URL(withProtocol);
    if (!isGoogleMapsUrl(url)) return undefined;
    url.protocol = "https:";
    url.username = "";
    url.password = "";
    return url.toString();
  } catch {
    return undefined;
  }
}
