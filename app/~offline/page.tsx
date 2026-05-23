/* Halaman fallback untuk PWA saat offline. Service worker (app/sw.ts) akan
   memetakan navigasi yang gagal ke route ini. Sengaja minimalis — tidak
   butuh data dari server, tidak ada client JS berat. */
import Link from "next/link";

export const dynamic = "force-static";

export const metadata = {
  title: "Offline — Sundaf Trip",
  description: "Koneksi internet bermasalah. Halaman utama akan kembali saat kamu online.",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md mx-auto">
        <div className="mx-auto mb-6 w-14 h-14 rounded-2xl bg-gray-900 dark:bg-white flex items-center justify-center">
          <span className="text-2xl" aria-hidden>
            ✈
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Kamu sedang offline
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
          Konten yang kamu cari belum kami simpan secara offline. Coba periksa koneksi
          internet, lalu muat ulang halaman.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm transition hover:opacity-90"
        >
          Coba lagi
        </Link>
      </div>
    </main>
  );
}
