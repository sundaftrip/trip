import type { Metadata } from "next";
import { Jost, Plus_Jakarta_Sans, DM_Sans, Outfit, Nunito, Playfair_Display, Raleway, Poppins, Anonymous_Pro, Caveat } from "next/font/google";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import Providers from "@/components/Providers";
import { prisma } from "@/lib/prisma";

/* Font loading strategy:
   - Jost: default body font, PRELOAD (paling sering jadi --site-font)
   - Anonymous_Pro: monospace dipakai Globe theme (boarding pass), PRELOAD
   - Sisanya (7 fonts): tetap available tapi preload: false → tidak dimuat
     kecuali admin mengaktifkan via site_font setting. Lighthouse drop dari
     15 woff2 preload → 2.
*/
const jost         = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });
const anonymousPro = Anonymous_Pro({ weight: ["400","700"], subsets: ["latin"], variable: "--font-anonymous-pro", display: "swap" });
const plusJakarta  = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta", display: "swap", preload: false });
const dmSans       = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap", preload: false });
const outfit       = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap", preload: false });
const nunito       = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap", preload: false });
const playfair     = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap", preload: false });
const raleway      = Raleway({ subsets: ["latin"], variable: "--font-raleway", display: "swap", preload: false });
const poppins      = Poppins({ weight: ["400","500","600","700","800","900"], subsets: ["latin"], variable: "--font-poppins", display: "swap", preload: false });
const caveat       = Caveat({ weight: ["400","600","700"], subsets: ["latin"], variable: "--font-caveat", display: "swap", preload: false });

const ALL_FONT_VARS = [
  jost.variable, plusJakarta.variable, dmSans.variable, outfit.variable,
  nunito.variable, playfair.variable, raleway.variable, poppins.variable,
  anonymousPro.variable, caveat.variable,
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
    description: `Spesialis perjalanan Rusia, Asia Tengah, dan aurora borealis. Dari visa sampai itinerary, semua dirancang untuk traveler Indonesia.`,
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
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: name,
    },
    ...(logo ? { icons: { icon: "/favicon.svg", apple: logo } } : {}),
  };
}

// theme-color sengaja dinamis: gelap saat dark scheme, terang saat light.
// PWA splash + status bar Android jadi mengikuti tema sistem.
export const viewport: import("next").Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

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
