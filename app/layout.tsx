import type { Metadata } from "next";
import { Jost, Plus_Jakarta_Sans, DM_Sans, Outfit, Nunito, Playfair_Display, Raleway, Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { prisma } from "@/lib/prisma";

const jost        = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta", display: "swap" });
const dmSans      = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const outfit      = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const nunito      = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const playfair    = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const raleway     = Raleway({ subsets: ["latin"], variable: "--font-raleway", display: "swap" });
const poppins     = Poppins({ weight: ["400","500","600","700","800","900"], subsets: ["latin"], variable: "--font-poppins", display: "swap" });

const ALL_FONT_VARS = [
  jost.variable, plusJakarta.variable, dmSans.variable, outfit.variable,
  nunito.variable, playfair.variable, raleway.variable, poppins.variable,
].join(" ");

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
    description: `Spesialis perjalanan ke Rusia, Asia Tengah, dan aurora borealis. Panduan visa, itinerary, dan tips dari traveler Indonesia yang sudah ke sana — bukan agen, tapi teman yang pernah merasakannya.`,
    openGraph: {
      title: name,
      description: `Spesialis perjalanan Rusia, Asia Tengah, dan aurora borealis untuk traveler Indonesia`,
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
    <html lang="id" className={`${ALL_FONT_VARS} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
