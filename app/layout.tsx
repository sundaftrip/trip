import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Sundaf Trip — Travel & Wisata Halal",
  description: "Paket wisata religi, umroh, haji, dan city tour terpercaya bersama CV Sundaf Holiday Group.",
  keywords: "umroh, haji, wisata halal, travel, sundaf trip",
  openGraph: {
    title: "Sundaf Trip",
    description: "Paket wisata religi dan halal terpercaya",
    url: "https://sundaftrip.com",
    siteName: "Sundaf Trip",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
