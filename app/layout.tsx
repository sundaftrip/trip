import type { Metadata } from "next";
import { Jost, Plus_Jakarta_Sans, DM_Sans, Outfit, Nunito, Playfair_Display, Raleway, Poppins, Anonymous_Pro, Caveat } from "next/font/google";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import Providers from "@/components/Providers";
import Analytics from "@/components/Analytics";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { unstable_cache } from "next/cache";
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

const siteUrl = process.env.NEXTAUTH_URL ?? "https://sundaftrip.com";

// Brand-forward, hardcode "Sundaf Trip" sebagai brand consumer-facing.
// Legal entity (CV SUNDAF HOLIDAY GROUP) tetap dipakai untuk schema/footer
// via company_name di DB. Tapi title/meta pakai brand simpel agar Google
// jelas paham "Sundaf Trip" itu entity utama, bukan typo "sunday trip".
const BRAND_NAME = "Sundaf Trip";
const BRAND_TAGLINE = "Spesialis Perjalanan Rusia, Asia Tengah & Aurora";

// Di-cache 1 jam: nama & logo perusahaan nyaris tak pernah berubah.
// Tanpa cache, query ini di generateMetadata memaksa SEMUA halaman jadi
// dynamic rendering → kena DB tiap request → TTFB tinggi. Saat admin
// mengubah company info, panggil revalidateTag("company-meta").
const getCompanyMeta = unstable_cache(
  async () => {
    try {
      const rows = await prisma.companyInfo.findMany({
        where: { key: { in: ["company_name", "company_logo"] } },
      });
      const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
      return {
        legalName: map["company_name"] ?? "CV Sundaf Holiday Group",
        logo: map["company_logo"] ?? null,
      };
    } catch {
      return {
        legalName: "CV Sundaf Holiday Group",
        logo: null,
      };
    }
  },
  ["company-meta"],
  { revalidate: 3600, tags: ["company-meta"] }
);

export async function generateMetadata(): Promise<Metadata> {
  const { logo } = await getCompanyMeta();
  const description =
    "Sundaf Trip, spesialis perjalanan Rusia, Asia Tengah, dan aurora borealis untuk traveler Indonesia. Dari visa sampai itinerary, semua kami rancang.";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      // Homepage default title, brand-forward
      default: `${BRAND_NAME}, ${BRAND_TAGLINE}`,
      // Child pages: "{page title} | Sundaf Trip", brand SELALU di belakang
      template: `%s | ${BRAND_NAME}`,
    },
    description,
    applicationName: BRAND_NAME,
    keywords: [
      "Sundaf Trip",
      "Sundaftrip",
      "Sundaf",
      "paket tour Rusia",
      "trip aurora",
      "tour Asia Tengah",
      "open trip Rusia",
      "visa Rusia Indonesia",
    ],
    openGraph: {
      title: `${BRAND_NAME}, ${BRAND_TAGLINE}`,
      description,
      url: siteUrl,
      siteName: BRAND_NAME,
      locale: "id_ID",
      type: "website",
      // Gambar OG diambil otomatis dari app/opengraph-image.tsx (kartu 1200×630).
    },
    twitter: {
      card: "summary_large_image",
      title: `${BRAND_NAME}, ${BRAND_TAGLINE}`,
      description,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: BRAND_NAME,
    },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      shortcut: "/favicon.svg",
      apple: logo || "/favicon.svg",
    },
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
