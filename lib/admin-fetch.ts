/* Helper kecil untuk form CMS: baca pesan error API dengan bahasa yang jelas. */

const STATUS_MESSAGES: Record<number, string> = {
  401: "Sesi login berakhir. Muat ulang halaman lalu masuk lagi.",
  403: "Akun Anda tidak punya izin untuk tindakan ini.",
  404: "Data tidak ditemukan. Mungkin sudah dihapus.",
  413: "Ukuran data terlalu besar.",
};

export async function readApiError(res: Response, fallback = "Gagal menyimpan. Coba lagi.") {
  const data = await res.json().catch(() => null) as { error?: unknown } | null;
  if (data && typeof data.error === "string" && data.error.trim()) return data.error;
  return STATUS_MESSAGES[res.status] ?? fallback;
}

/** Kirim JSON ke API CMS. Mengembalikan pesan error atau null bila sukses. */
export async function sendJson(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  fallback?: string,
): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return res.ok ? null : await readApiError(res, fallback);
  } catch {
    return "Koneksi gagal. Periksa internet lalu coba lagi.";
  }
}
