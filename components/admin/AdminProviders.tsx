"use client";

import { ThemeProvider } from "next-themes";

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="sundaf-admin-theme">
      {children}
    </ThemeProvider>
  );
}
