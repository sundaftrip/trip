type TranslationOriginEnvironment = {
  VERCEL_ENV?: string;
  VERCEL_URL?: string;
  VERCEL_BRANCH_URL?: string;
};

const EXISTING_ORIGIN_HOSTS = new Set([
  "sundaftrip.com", "www.sundaftrip.com", "localhost", "127.0.0.1",
]);

// Vercel supplies bare deployment/branch hostnames, never schemes or paths.
// Validate the DNS label as well as the suffix; do not allow all vercel.app sites.
const VERCEL_HOST = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/i;

function parseOrigin(value: string): URL | null {
  const match = /^https?:\/\/([a-z0-9.-]+)(?::[0-9]+)?$/i.exec(value);
  if (!match) return null;

  try {
    const url = new URL(value);
    // Reject hostname rewriting (for example an abbreviated IPv4 address).
    return url.hostname === match[1].toLowerCase() ? url : null;
  } catch {
    return null;
  }
}

export function isAllowedTranslationOrigin(
  origin: string | null,
  environment: TranslationOriginEnvironment = {
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
  },
): boolean {
  // Preserve clients that omit Origin, including the route's empty-header behavior.
  if (!origin) return true;

  const url = parseOrigin(origin);
  if (!url) return false;

  // Existing site/local HTTP(S) hosts retain their port behavior.
  if (EXISTING_ORIGIN_HOSTS.has(url.hostname)) return true;

  // Preview permissions never widen the production deployment's allowlist.
  if (environment.VERCEL_ENV !== "preview" || url.protocol !== "https:" || url.port) {
    return false;
  }

  return [environment.VERCEL_URL, environment.VERCEL_BRANCH_URL].some((host) => (
    typeof host === "string"
    && VERCEL_HOST.test(host)
    && url.origin === `https://${host.toLowerCase()}`
  ));
}
