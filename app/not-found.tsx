/* Halaman 404 custom. Berada di luar route group (website), jadi navbar/footer
   tidak ikut — halaman ini mandiri: server component, tanpa data fetch,
   ringan, dan tetap konsisten brand (netral + aksen --site-accent). */
import Link from "next/link";

export default function NotFound() {
  const links = [
    { href: "/", label: "Beranda" },
    { href: "/tours", label: "Paket Tour" },
    { href: "/visa", label: "Info Visa" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md w-full text-center py-16">
        <p
          className="text-7xl sm:text-8xl font-black tracking-tight mb-4"
          style={{ color: "var(--site-accent,#2d6a4f)" }}
        >
          404
        </p>
        <h1 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-white">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-sm leading-relaxed mb-8 text-gray-500 dark:text-gray-400">
          Maaf, halaman yang kamu cari tidak ada atau sudah dipindahkan.
          Mungkin tautannya salah ketik, atau kontennya sudah kami perbarui.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-bold text-white transition hover:opacity-90 mb-8"
          style={{ background: "var(--site-accent,#2d6a4f)" }}
        >
          Kembali ke Beranda
        </Link>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <p className="text-xs uppercase tracking-widest font-semibold mb-3 text-gray-400 dark:text-gray-500">
            Atau jelajahi
          </p>
          <nav className="flex flex-wrap justify-center gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 transition hover:border-gray-400 dark:hover:border-gray-600"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </main>
  );
}
