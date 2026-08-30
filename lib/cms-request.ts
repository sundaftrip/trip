/** Keep untouched configuration out of mutations (including locked legacy keys). */
export function changedValues<T>(current: Record<string, T>, previous: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(current).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(previous[key])));
}

/** An HTTP error or an HTML sign-in page must never become a successful save. */
export async function requestCmsJson<T = Record<string, unknown>>(
  url: string,
  init: RequestInit = {},
  request: typeof fetch = fetch,
): Promise<T> {
  const response = await request(url, init);
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("Respons server tidak dapat dibaca. Muat ulang atau coba lagi; perubahan belum tersimpan.");
  }
  if (!response.ok) {
    const message = data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : "Perubahan belum tersimpan. Coba lagi.";
    throw new Error(message);
  }
  return data as T;
}

export function cmsErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi gangguan. Perubahan belum tersimpan; coba lagi.";
}
