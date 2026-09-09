/** Keep unchanged publish/status fields out of edit-only requests. The server
 * remains responsible for authorizing every field that is actually submitted. */
export function omitUnchangedFields<T extends object>(
  payload: T,
  initial: Partial<T>,
  fields: readonly (keyof T)[],
): Partial<T> {
  const next = { ...payload };
  for (const field of fields) {
    if (Object.hasOwn(initial, field) && Object.is(next[field], initial[field])) delete next[field];
  }
  return next;
}

export async function requestAdminAction(
  url: string,
  init: RequestInit,
  fallback: string,
): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new Error("Koneksi terputus. Periksa jaringan lalu coba lagi.");
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message = typeof data?.error === "string" ? data.error.trim() : "";
    throw new Error(message || fallback);
  }
  return response;
}

export function adminActionError(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
