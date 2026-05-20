import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tree-shake lucide-react & icon libraries — cut JS bundle signifikan.
  // Tanpa ini, import { Foo } dari "lucide-react" akan bawa seluruh barrel.
  experimental: {
    optimizePackageImports: ["lucide-react", "@auth/prisma-adapter"],
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
              "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
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
    ];
  },
};

export default nextConfig;
