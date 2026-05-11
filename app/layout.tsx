import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { prisma } from "@/lib/prisma";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

async function getCompanyMeta() {
  try {
    const rows = await prisma.companyInfo.findMany({
      where: { key: { in: ["company_name", "company_logo"] } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      name: map["company_name"] ?? process.env.NEXT_PUBLIC_APP_NAME ?? "Travel & Wisata",
      logo: map["company_logo"] ?? null,
    };
  } catch {
    return {
      name: process.env.NEXT_PUBLIC_APP_NAME ?? "Travel & Wisata",
      logo: null,
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { name, logo } = await getCompanyMeta();

  return {
    title: {
      default: name,
      template: `%s — ${name}`,
    },
    description: `Paket wisata religi, umroh, haji, dan city tour terpercaya bersama ${name}.`,
    openGraph: {
      title: name,
      description: `Paket wisata religi dan halal terpercaya`,
      url: siteUrl,
      siteName: name,
      locale: "id_ID",
      type: "website",
      ...(logo ? { images: [{ url: logo, width: 512, height: 512 }] } : {}),
    },
    twitter: {
      card: "summary",
      title: name,
      ...(logo ? { images: [logo] } : {}),
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jost.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col font-jost">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
