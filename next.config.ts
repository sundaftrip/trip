import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function publicPrecacheEntries(publicDir = path.join(process.cwd(), "public")) {
  if (!fs.existsSync(publicDir)) return [];

  const entries: Array<{ url: string; revision: string }> = [];
  const exclude = [/^sw\.js(\.map)?$/, /^swe-worker-.*\.js(\.map)?$/, /^vietnam\/catalog\//];

  const walk = (dir: string) => {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolutePath = path.join(dir, item.name);
      const relativePath = path.relative(publicDir, absolutePath).split(path.sep).join("/");
      if (exclude.some((pattern) => pattern.test(item.isDirectory() ? `${relativePath}/` : relativePath))) continue;

      if (item.isDirectory()) {
        walk(absolutePath);
        continue;
      }

      entries.push({
        url: `/${relativePath}`,
        revision: crypto.createHash("md5").update(fs.readFileSync(absolutePath)).digest("hex"),
      });
    }
  };

  walk(publicDir);
  return entries;
}

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // Dev: matikan service worker supaya HMR Next dev tidak diintervensi cache.
  // Production build tetap aktifkan.
  disable: process.env.NODE_ENV !== "production",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  additionalPrecacheEntries: publicPrecacheEntries(),
});

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(process.env.NODE_ENV !== "production" ? ["'unsafe-eval'"] : []),
  "https://va.vercel-scripts.com",
  "https://vercel.live",
].join(" ");

const nextConfig: NextConfig = {
  // Tree-shake lucide-react & icon libraries — cut JS bundle signifikan.
  // Tanpa ini, import { Foo } dari "lucide-react" akan bawa seluruh barrel.
  experimental: {
    optimizePackageImports: ["lucide-react"],
    // optimizeCss: pakai critters untuk inline critical CSS + defer sisanya.
    // Target "Render blocking requests" insight Lighthouse.
    optimizeCss: true,
  },
  images: {
    // unoptimized=true → skip Vercel Image Optimization, foto langsung di-serve
    // dari Cloudinary CDN (yang sudah punya auto-resize via URL params).
    // Hemat kuota Vercel Image Optim free tier (1000 source/bulan).
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.rbth.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "**.pexels.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  compress: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sundaftrip.com" }],
        destination: "https://sundaftrip.com/:path*",
        permanent: true,
      },
      {
        source: "/tour",
        destination: "/tours",
        permanent: true,
      },
      {
        source: "/sundaftrip",
        destination: "/sundaf-trip",
        permanent: true,
      },
      {
        source: "/sundaf",
        destination: "/sundaf-trip",
        permanent: true,
      },
      {
        source: "/trip-sundaf",
        destination: "/sundaf-trip",
        permanent: true,
      },
      {
        source: "/opentrip-vietnam",
        destination: "/open-trip-vietnam",
        permanent: true,
      },
      {
        source: "/open-trip-vietnam-dari-jakarta",
        destination: "/open-trip-vietnam",
        permanent: true,
      },
      {
        source: "/paket-open-trip-vietnam",
        destination: "/open-trip-vietnam",
        permanent: true,
      },
      {
        source: "/jasa-membuat-visa-eropa",
        destination: "/jasa-urus-visa-eropa",
        permanent: true,
      },
      {
        source: "/cara-membuat-visa-eropa",
        destination: "/jasa-urus-visa-eropa",
        permanent: true,
      },
      {
        source: "/cara-mengurus-visa-eropa",
        destination: "/jasa-urus-visa-eropa",
        permanent: true,
      },
      {
        source: "/jasa-buat-visa-eropa",
        destination: "/jasa-urus-visa-eropa",
        permanent: true,
      },
      {
        source: "/cara-mengurus-visa-canada",
        destination: "/jasa-urus-visa-amerika-canada",
        permanent: true,
      },
      {
        source: "/cara-mengurus-visa-kanada",
        destination: "/jasa-urus-visa-amerika-canada",
        permanent: true,
      },
      {
        source: "/cara-mengurus-visa-amerika",
        destination: "/jasa-urus-visa-amerika-canada",
        permanent: true,
      },
      {
        source: "/jasa-urus-visa-canada",
        destination: "/jasa-urus-visa-amerika-canada",
        permanent: true,
      },
      {
        source: "/jasa-urus-visa-kanada",
        destination: "/jasa-urus-visa-amerika-canada",
        permanent: true,
      },
      {
        source: "/jasa-urus-visa-amerika",
        destination: "/jasa-urus-visa-amerika-canada",
        permanent: true,
      },
      {
        source: "/jasa-urus-visa-murah",
        destination: "/jasa-urus-visa-terpercaya",
        permanent: true,
      },
      {
        source: "/jasa-urus-visa-terbaik",
        destination: "/jasa-urus-visa-terpercaya",
        permanent: true,
      },
      {
        source: "/rekomendasi-urus-visa-murah-terpercaya",
        destination: "/jasa-urus-visa-terpercaya",
        permanent: true,
      },
      {
        source: "/rekomendasi-pembuatan-visa-lolos",
        destination: "/jasa-urus-visa-terpercaya",
        permanent: true,
      },
      {
        source: "/rekomendasi-urus-visa-lolos",
        destination: "/jasa-urus-visa-terpercaya",
        permanent: true,
      },
      {
        source: "/pembuatan-visa-lolos",
        destination: "/jasa-urus-visa-terpercaya",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Landing page statis trip perdana Vietnam (file di public/vietnam/).
      // Sajikan di URL bersih /vietnam tanpa trailing slash; aset & /vietnam/
      // tetap jalan karena semua path di halaman ini absolut (/vietnam/...).
      { source: "/vietnam", destination: "/vietnam/index.html" },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js butuh unsafe-inline + unsafe-eval untuk hydration & dev tools.
              // Vercel Analytics di va.vercel-scripts.com.
              // unsafe-eval dihilangkan — hanya dibutuhkan oleh dev HMR, prod
              // Next.js tidak pakai eval(). unsafe-inline masih perlu karena
              // Next.js emit bootstrap script inline (untuk hilangkan butuh
              // nonce-CSP yang membatalkan edge cache — trade-off tidak worth).
              `script-src ${scriptSrc}`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              // media-src untuk <video>/<audio>. Tanpa ini, video dari CDN
              // (Cloudinary, dll) DIBLOKIR karena fallback ke default-src 'self'
              // — poster (img) tetap muncul tapi video tak bisa load.
              "media-src 'self' blob: data: https:",
              "font-src 'self' https://fonts.gstatic.com data:",
              "connect-src 'self' https: wss:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // COOP: isolate browsing context — Lighthouse Best Practices.
          // same-origin-allow-popups supaya WhatsApp & external links tetap bisa
          // dibuka di tab baru.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
      {
        source: "/(.*)\\.(jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/sundaftrip-company-profile.pdf",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/sundaftrip-company-profile-billy.pdf",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/sundaftrip-company-profile-ru.pdf",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/partner/billy.jpg",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noimageindex, noarchive" },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
