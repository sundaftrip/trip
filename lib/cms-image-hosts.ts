/* Gambar CMS yang boleh tampil di website publik. Sumber lain diganti foto stok
   agar halaman tidak memuat gambar dari host yang tidak dikenal. */

const ALLOWED_EXACT_HOSTS = new Set([
  "res.cloudinary.com",
  "images.unsplash.com",
  "picsum.photos",
  "fastly.picsum.photos",
  "images.pexels.com",
  "upload.wikimedia.org",
]);

const ALLOWED_HOST_SUFFIXES = [".pexels.com", ".rbth.com"];

/** Path lokal ("/foto.jpg") atau URL https dari host yang diizinkan. */
export function isAllowedCmsImageUrl(value?: string | null) {
  const source = value?.trim();
  if (!source) return false;
  if (/^\/(?!\/)/.test(source)) return true;

  try {
    const url = new URL(source);
    return url.protocol === "https:"
      && (ALLOWED_EXACT_HOSTS.has(url.hostname) || ALLOWED_HOST_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix)));
  } catch {
    return false;
  }
}
