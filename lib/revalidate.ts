import { revalidateTag, revalidatePath } from "next/cache";

// Next mengetik revalidateTag/Path agak ketat di beberapa versi; cast aman.
const rTag = revalidateTag as unknown as (t: string) => void;
const rPath = revalidatePath as unknown as (p: string, t?: "page" | "layout") => void;

/**
 * Buang cache konten publik setelah edit CMS (Tour, Blog, Testimoni, Teks, dll)
 * supaya perubahan langsung tampil di situs — bukan menunggu ISR 5 menit.
 *
 * Membuang tag data ber-cache (home-data dipakai homepage + /tours, footer,
 * schema) lalu revalidatePath("/", "layout") agar seluruh route di bawah layout
 * publik ikut segar. Pola ini identik dengan /api/settings yang sudah instan.
 */
export function revalidatePublicContent() {
  for (const tag of ["home-data", "footer-data", "site-org-schema", "company-info"]) {
    rTag(tag);
  }
  rPath("/", "layout");
}
