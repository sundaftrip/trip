import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Travel & Wisata";
const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: appName,
  description: `Paket wisata religi, umroh, haji, dan city tour terpercaya bersama ${appName}.`,
  openGraph: {
    title: appName,
    description: `Paket wisata religi dan halal terpercaya`,
    url: siteUrl,
    siteName: appName,
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
