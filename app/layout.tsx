import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });

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
    <html lang="id" className={`${jost.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-jost">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
