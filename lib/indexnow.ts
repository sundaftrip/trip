import { createHash, timingSafeEqual } from "node:crypto";

export const INDEXNOW_ORIGIN = "https://sundaftrip.com";
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_BATCH_SIZE = 100;

// Only known public document families are accepted, never arbitrary CMS URLs.
export const INDEXNOW_STATIC_PATHS = new Set([
  "/", "/tours", "/russia", "/russia/catering", "/amerika-latin",
  "/peru-amerika-selatan", "/amerika-latin/brasil-kolombia-peru-chile",
  "/open-trip-vietnam", "/visa", "/visa-intelligence", "/custom-trip",
  "/jasa-urus-visa-eropa", "/jasa-urus-visa-amerika-canada", "/jasa-urus-visa-terpercaya",
  "/visa/asuransi-visa-protection", "/visa/faq", "/blog", "/about", "/contact",
  "/faq", "/sundaf-trip", "/reviews", "/media-kit", "/legalitas-dan-keamanan",
  "/privacy", "/partnership-relation", "/open-trip-rusia-dari-jakarta",
  "/tour-rusia-dari-indonesia", "/open-trip-aurora-rusia", "/visa-rusia-wni",
  "/terms", "/destinations", "/destinations/murmansk", "/destinations/teriberka",
  "/destinations/kazakhstan", "/destinations/rusia-aurora", "/destinations/asia-tengah",
  "/destinations/vietnam", "/destinations/jepang",
]);

export function canonicalIndexNowUrl(input: string): string | null {
  if (typeof input !== "string" || input.length > 2048 || /[\\\s%?#]/.test(input)) return null;
  // URL parsing normalizes dot segments: reject them before parsing.
  if (/(?:^|\/)\.{1,2}(?:\/|$)/.test(input) || input.startsWith("//")) return null;
  try {
    const url = new URL(input, INDEXNOW_ORIGIN);
    if (url.origin !== INDEXNOW_ORIGIN || url.username || url.password || url.search || url.hash) return null;
    if (!input.startsWith("/") && !input.startsWith(`${INDEXNOW_ORIGIN}/`) && input !== INDEXNOW_ORIGIN) return null;
    const path = url.pathname;
    if (!INDEXNOW_STATIC_PATHS.has(path) && !/^\/(blog|tours|visa)\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path)) return null;
    return path === "/" ? INDEXNOW_ORIGIN : `${INDEXNOW_ORIGIN}${path}`;
  } catch {
    return null;
  }
}

export function isIndexNowProduction(env: Record<string, string | undefined> = process.env) {
  return env.VERCEL_ENV === "production" && env.INDEXNOW_DISABLED !== "true";
}

export function isIndexNowCronAuthorized(header: string | null, secret: string | undefined) {
  if (!secret?.trim() || !header?.startsWith("Bearer ")) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(header.slice(7)), digest(secret));
}

export type IndexNowResult = {
  status: number;
  accepted: boolean;
  verificationPending: boolean;
  retryAfterMs: number;
};

export function indexNowRetryDelay(status: number, attempts: number, retryAfter: string | null, now: number) {
  const exponential = Math.min(24 * 60 * 60_000, 60_000 * 2 ** Math.min(attempts, 11));
  const normalDelay = [400, 403, 422].includes(status) ? 24 * 60 * 60_000 : exponential;
  if (!retryAfter) return normalDelay;
  const seconds = /^\d+$/.test(retryAfter.trim()) ? Number(retryAfter) : NaN;
  const advertised = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(retryAfter) - now;
  // A long Retry-After is honored; the queue expires instead of retrying early.
  return Number.isFinite(advertised) ? Math.max(normalDelay, advertised) : normalDelay;
}

export async function submitIndexNow(
  urls: string[],
  key: string,
  fetcher: typeof fetch = fetch,
  env: Record<string, string | undefined> = process.env,
): Promise<IndexNowResult> {
  if (!isIndexNowProduction(env)) return { status: -1, accepted: false, verificationPending: false, retryAfterMs: 0 };
  const valid = [...new Set(urls.map(canonicalIndexNowUrl).filter((url): url is string => !!url))];
  if (!valid.length || valid.length !== new Set(urls).size || valid.length > INDEXNOW_BATCH_SIZE || !/^[a-zA-Z0-9-]{8,128}$/.test(key)) {
    return { status: 422, accepted: false, verificationPending: false, retryAfterMs: 0 };
  }
  try {
    const response = await fetcher(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: "sundaftrip.com", key, keyLocation: `${INDEXNOW_ORIGIN}/${key}.txt`, urlList: valid }),
      signal: AbortSignal.timeout(8000),
      redirect: "error",
      cache: "no-store",
    });
    // Do not print the request, key, or arbitrary remote response body.
    return {
      status: response.status,
      accepted: response.status === 200 || response.status === 202,
      verificationPending: response.status === 202,
      retryAfterMs: indexNowRetryDelay(response.status, 0, response.headers.get("retry-after"), Date.now()),
    };
  } catch {
    return { status: 0, accepted: false, verificationPending: false, retryAfterMs: 60_000 };
  }
}
