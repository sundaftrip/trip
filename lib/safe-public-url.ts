import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import {
  Agent,
  buildConnector,
  fetch as undiciFetch,
  type RequestInit as UndiciRequestInit,
} from "undici";

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeUrlError";
  }
}

export type AddressResolver = (hostname: string) => Promise<string[]>;

type ResolvedPublicUrl = {
  addresses: string[];
  url: URL;
};

export type FetchLike = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

export type PublicTextOptions = {
  allowedHostnameSuffixes?: readonly string[];
  allowedHostnames?: readonly string[];
  allowedProtocols?: readonly ("http:" | "https:")[];
  fetchImpl?: FetchLike;
  headers?: HeadersInit;
  maxBytes?: number;
  maxRedirects?: number;
  resolveAddresses?: AddressResolver;
  timeoutMs?: number;
};

export type PublicBytesOptions = PublicTextOptions & {
  allowedContentTypes?: readonly string[];
};

export type PublicTextResponse = {
  headers: Headers;
  ok: boolean;
  status: number;
  text: string;
  url: URL;
};

export type PublicBytesResponse = {
  bytes: Uint8Array;
  headers: Headers;
  ok: boolean;
  status: number;
  url: URL;
};

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
]);

const BLOCKED_HOST_SUFFIXES = [
  ".example",
  ".home",
  ".internal",
  ".invalid",
  ".lan",
  ".local",
  ".localhost",
  ".test",
];

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
}

function ipv4Parts(address: string): number[] | null {
  const parts = address.split(".").map(Number);
  if (
    parts.length !== 4
    || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return null;
  }
  return parts;
}

function isBlockedIpv4(address: string): boolean {
  const parts = ipv4Parts(address);
  if (!parts) return true;

  const [a, b, c] = parts;
  return a === 0
    || a === 10
    || a === 127
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 0 && (c === 0 || c === 2))
    || (a === 192 && b === 168)
    || (a === 198 && (b === 18 || b === 19))
    || (a === 198 && b === 51 && c === 100)
    || (a === 203 && b === 0 && c === 113)
    || a >= 224;
}

function ipv6Words(address: string): number[] | null {
  let normalized = address.toLowerCase().split("%")[0];
  const dottedTail = normalized.match(/(?:^|:)(\d+\.\d+\.\d+\.\d+)$/)?.[1];

  if (dottedTail) {
    const parts = ipv4Parts(dottedTail);
    if (!parts) return null;
    const high = ((parts[0] << 8) | parts[1]).toString(16);
    const low = ((parts[2] << 8) | parts[3]).toString(16);
    normalized = normalized.slice(0, -dottedTail.length) + `${high}:${low}`;
  }

  const halves = normalized.split("::");
  if (halves.length > 2) return null;

  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || missing < 0) return null;

  const words = [
    ...left,
    ...Array.from({ length: halves.length === 2 ? missing : 0 }, () => "0"),
    ...right,
  ].map((word) => Number.parseInt(word || "0", 16));

  if (words.length !== 8 || words.some((word) => !Number.isInteger(word) || word < 0 || word > 0xffff)) {
    return null;
  }
  return words;
}

function isBlockedIpv6(address: string): boolean {
  const words = ipv6Words(address);
  if (!words) return true;

  const allZero = words.every((word) => word === 0);
  const loopback = words.slice(0, 7).every((word) => word === 0) && words[7] === 1;
  if (allZero || loopback) return true;

  // IPv4-compatible and IPv4-mapped IPv6 addresses inherit the IPv4 policy.
  if (words.slice(0, 5).every((word) => word === 0) && (words[5] === 0 || words[5] === 0xffff)) {
    const mapped = `${words[6] >> 8}.${words[6] & 0xff}.${words[7] >> 8}.${words[7] & 0xff}`;
    return isBlockedIpv4(mapped);
  }

  return (words[0] & 0xfe00) === 0xfc00 // unique-local fc00::/7
    || (words[0] & 0xffc0) === 0xfe80 // link-local fe80::/10
    || (words[0] & 0xff00) === 0xff00 // multicast ff00::/8
    || (words[0] === 0x2001 && words[1] === 0x0db8) // documentation
    || (words[0] === 0x0064 && words[1] === 0xff9b); // NAT64 well-known prefix
}

export function isPublicIpAddress(address: string): boolean {
  const normalized = normalizeHostname(address).split("%")[0];
  const version = isIP(normalized);
  if (version === 4) return !isBlockedIpv4(normalized);
  if (version === 6) return !isBlockedIpv6(normalized);
  return false;
}

async function defaultResolver(hostname: string): Promise<string[]> {
  if (isIP(hostname)) return [hostname];
  const addresses = await lookup(hostname, { all: true, verbatim: true });
  return addresses.map(({ address }) => address);
}

async function resolvePublicHttpUrl(
  input: string | URL,
  resolveAddresses: AddressResolver = defaultResolver,
  allowedHostnames?: readonly string[],
  allowedHostnameSuffixes?: readonly string[],
  allowedProtocols?: readonly ("http:" | "https:")[],
): Promise<ResolvedPublicUrl> {
  let url: URL;
  try {
    url = input instanceof URL ? new URL(input.href) : new URL(input);
  } catch {
    throw new UnsafeUrlError("URL sumber tidak valid.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError("URL sumber hanya boleh memakai HTTP atau HTTPS.");
  }
  if (allowedProtocols && !allowedProtocols.includes(url.protocol)) {
    throw new UnsafeUrlError("Protokol URL sumber tidak diizinkan.");
  }
  if (
    (url.protocol === "http:" && url.port && url.port !== "80")
    || (url.protocol === "https:" && url.port && url.port !== "443")
  ) {
    throw new UnsafeUrlError("URL sumber memakai port yang tidak diizinkan.");
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError("URL sumber tidak boleh memuat kredensial.");
  }

  const hostname = normalizeHostname(url.hostname);
  if (!hostname) throw new UnsafeUrlError("URL sumber tidak memiliki hostname.");
  if (
    BLOCKED_HOSTNAMES.has(hostname)
    || BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
  ) {
    throw new UnsafeUrlError("URL lokal atau internal tidak diizinkan.");
  }

  if (allowedHostnames || allowedHostnameSuffixes) {
    const allowed = new Set((allowedHostnames ?? []).map(normalizeHostname));
    const allowedSuffixes = (allowedHostnameSuffixes ?? []).map((suffix) => {
      const normalized = normalizeHostname(suffix);
      return normalized.startsWith(".") ? normalized : `.${normalized}`;
    });
    if (
      !allowed.has(hostname)
      && !allowedSuffixes.some((suffix) => hostname.endsWith(suffix))
    ) {
      throw new UnsafeUrlError("Hostname sumber tidak diizinkan.");
    }
  }

  let addresses: string[];
  try {
    addresses = await resolveAddresses(hostname);
  } catch {
    throw new UnsafeUrlError("Hostname sumber tidak dapat diverifikasi.");
  }
  if (addresses.length === 0 || addresses.some((address) => !isPublicIpAddress(address))) {
    throw new UnsafeUrlError("URL sumber mengarah ke jaringan privat atau khusus.");
  }

  return { addresses, url };
}

export async function assertPublicHttpUrl(
  input: string | URL,
  resolveAddresses: AddressResolver = defaultResolver,
  allowedHostnames?: readonly string[],
  allowedHostnameSuffixes?: readonly string[],
  allowedProtocols?: readonly ("http:" | "https:")[],
): Promise<URL> {
  return (
    await resolvePublicHttpUrl(
      input,
      resolveAddresses,
      allowedHostnames,
      allowedHostnameSuffixes,
      allowedProtocols,
    )
  ).url;
}

async function pinnedFetch(
  resolved: ResolvedPublicUrl,
  init: RequestInit,
): Promise<{ close: () => Promise<void>; response: Response }> {
  const address = resolved.addresses[0];
  const connect = buildConnector({});
  const dispatcher = new Agent({
    connect(options, callback) {
      connect({
        ...options,
        hostname: address,
        servername: isIP(resolved.url.hostname) ? undefined : resolved.url.hostname,
      }, callback);
    },
  });

  try {
    const requestInit: UndiciRequestInit = {
      headers: init.headers,
      redirect: init.redirect,
      signal: init.signal,
      dispatcher,
    };
    const response = await undiciFetch(resolved.url, requestInit);
    return {
      close: async () => { await dispatcher.close(); },
      response: response as unknown as Response,
    };
  } catch (error) {
    await dispatcher.close();
    throw error;
  }
}

async function readTextWithLimit(
  response: Response,
  maxBytes: number,
  signal?: AbortSignal,
): Promise<string> {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    await response.body?.cancel();
    throw new UnsafeUrlError("Respons sumber terlalu besar.");
  }
  if (!response.body) return "";

  const reader = response.body.getReader();
  const onAbort = () => {
    void reader.cancel().catch(() => {});
  };
  if (signal?.aborted) onAbort();
  else signal?.addEventListener("abort", onAbort, { once: true });
  const decoder = new TextDecoder();
  let byteLength = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel();
        throw new UnsafeUrlError("Respons sumber terlalu besar.");
      }
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }

  return text + decoder.decode();
}

async function readBytesWithLimit(
  response: Response,
  maxBytes: number,
  signal?: AbortSignal,
): Promise<Uint8Array> {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    await response.body?.cancel();
    throw new UnsafeUrlError("Respons sumber terlalu besar.");
  }
  if (!response.body) return new Uint8Array();

  const reader = response.body.getReader();
  const onAbort = () => {
    void reader.cancel().catch(() => {});
  };
  if (signal?.aborted) onAbort();
  else signal?.addEventListener("abort", onAbort, { once: true });
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel();
        throw new UnsafeUrlError("Respons sumber terlalu besar.");
      }
      chunks.push(value);
    }
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

function withAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) {
    return Promise.reject(new UnsafeUrlError("Pengambilan sumber melewati batas waktu."));
  }

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      reject(new UnsafeUrlError("Pengambilan sumber melewati batas waktu."));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(resolve, reject).finally(() => {
      signal.removeEventListener("abort", onAbort);
    });
  });
}

export async function fetchPublicBytes(
  input: string | URL,
  options: PublicBytesOptions = {},
): Promise<PublicBytesResponse> {
  const {
    allowedContentTypes,
    allowedHostnameSuffixes,
    allowedHostnames,
    allowedProtocols,
    fetchImpl,
    headers,
    maxBytes = 2_000_000,
    maxRedirects = 3,
    resolveAddresses = defaultResolver,
    timeoutMs = 12_000,
  } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let current = await withAbort(
      resolvePublicHttpUrl(
        input,
        resolveAddresses,
        allowedHostnames,
        allowedHostnameSuffixes,
        allowedProtocols,
      ),
      controller.signal,
    );

    for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
      const requestInit: RequestInit = {
        headers,
        redirect: "manual",
        signal: controller.signal,
      };
      const request = fetchImpl
        ? {
            close: async () => {},
            response: await withAbort(fetchImpl(current.url, requestInit), controller.signal),
          }
        : await withAbort(pinnedFetch(current, requestInit), controller.signal);
      const { response } = request;

      try {
        if ([301, 302, 303, 307, 308].includes(response.status)) {
          const location = response.headers.get("location");
          await response.body?.cancel();
          if (!location) throw new UnsafeUrlError("Redirect sumber tidak memiliki tujuan.");
          if (redirectCount === maxRedirects) {
            throw new UnsafeUrlError("Redirect sumber terlalu banyak.");
          }
          current = await withAbort(
            resolvePublicHttpUrl(
              new URL(location, current.url),
              resolveAddresses,
              allowedHostnames,
              allowedHostnameSuffixes,
              allowedProtocols,
            ),
            controller.signal,
          );
          continue;
        }

        if (allowedContentTypes) {
          const contentType = response.headers
            .get("content-type")
            ?.split(";", 1)[0]
            ?.trim()
            .toLowerCase();
          const allowed = new Set(allowedContentTypes.map((value) => value.toLowerCase()));
          if (!contentType || !allowed.has(contentType)) {
            await response.body?.cancel();
            throw new UnsafeUrlError("Tipe konten sumber tidak diizinkan.");
          }
        }

        return {
          bytes: await withAbort(
            readBytesWithLimit(response, maxBytes, controller.signal),
            controller.signal,
          ),
          headers: response.headers,
          ok: response.ok,
          status: response.status,
          url: current.url,
        };
      } finally {
        await request.close();
      }
    }

    throw new UnsafeUrlError("Redirect sumber terlalu banyak.");
  } catch (error) {
    if (controller.signal.aborted) {
      throw new UnsafeUrlError("Pengambilan sumber melewati batas waktu.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchPublicText(
  input: string | URL,
  options: PublicTextOptions = {},
): Promise<PublicTextResponse> {
  const {
    allowedHostnameSuffixes,
    allowedHostnames,
    allowedProtocols,
    fetchImpl,
    headers,
    maxBytes = 2_000_000,
    maxRedirects = 3,
    resolveAddresses = defaultResolver,
    timeoutMs = 12_000,
  } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let current = await withAbort(
      resolvePublicHttpUrl(
        input,
        resolveAddresses,
        allowedHostnames,
        allowedHostnameSuffixes,
        allowedProtocols,
      ),
      controller.signal,
    );

    for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
      const requestInit: RequestInit = {
        headers,
        redirect: "manual",
        signal: controller.signal,
      };
      const request = fetchImpl
        ? {
            close: async () => {},
            response: await withAbort(fetchImpl(current.url, requestInit), controller.signal),
          }
        : await withAbort(pinnedFetch(current, requestInit), controller.signal);
      const { response } = request;

      try {
        if ([301, 302, 303, 307, 308].includes(response.status)) {
          const location = response.headers.get("location");
          await response.body?.cancel();
          if (!location) throw new UnsafeUrlError("Redirect sumber tidak memiliki tujuan.");
          if (redirectCount === maxRedirects) {
            throw new UnsafeUrlError("Redirect sumber terlalu banyak.");
          }
          current = await withAbort(
            resolvePublicHttpUrl(
              new URL(location, current.url),
              resolveAddresses,
              allowedHostnames,
              allowedHostnameSuffixes,
              allowedProtocols,
            ),
            controller.signal,
          );
          continue;
        }

        return {
          headers: response.headers,
          ok: response.ok,
          status: response.status,
          text: await withAbort(
            readTextWithLimit(response, maxBytes, controller.signal),
            controller.signal,
          ),
          url: current.url,
        };
      } finally {
        await request.close();
      }
    }

    throw new UnsafeUrlError("Redirect sumber terlalu banyak.");
  } catch (error) {
    if (controller.signal.aborted) {
      throw new UnsafeUrlError("Pengambilan sumber melewati batas waktu.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
