"use client";

import { ThemeProvider } from "next-themes";

// SessionProvider (next-auth/react) DIHAPUS: tidak ada satupun komponen yang
// memakai useSession di codebase ini (admin pakai auth() server-side). Provider
// itu cuma menambah JS next-auth/react ke SEMUA halaman publik tanpa guna.
// Kalau nanti ada client component yang butuh useSession, bungkus HANYA subtree
// itu (mis. di AdminProviders), jangan di root global.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem enableColorScheme={false} storageKey="sundaf-theme">
      {children}
    </ThemeProvider>
  );
}
