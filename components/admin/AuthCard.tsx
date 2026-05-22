/** Pembungkus kartu untuk halaman auth (login / lupa password / reset). */
export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Sundaf Trip" className="h-12 w-auto" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          {title}
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8">
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  );
}
