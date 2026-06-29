# Sundaf Trip Web

Internal Next.js CMS and public website for Sundaf Trip.

## What This App Owns

- Public website routes under `app/(website)`.
- Admin CMS routes under `app/admin`.
- API routes under `app/api`.
- Password-gated B2B Russia catalog under `app/b2b-russia-catalog`.
- Public AI crawler docs under `app/llms.txt` and `app/llms-full.txt`.
- PDF rendering for tour itineraries and internal documents.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Use Node.js 20 or newer. The dev server uses Next webpack mode.

## Build Safety

`npm run build` runs `scripts/build.mjs`.

That script runs `prisma db push --skip-generate` and `tsx prisma/seed.ts` for local builds where `VERCEL_ENV` is not set. Preview builds skip database changes. Production builds also skip database changes unless `ALLOW_PRODUCTION_DB_MIGRATION=true` is explicitly set for that deploy. If `.env.local` points at a shared or production database, use:

```bash
VERCEL_ENV=preview npm run build
```

Production Vercel builds must not run the database push and seed path without an explicit migration approval. Do not run the default local build against production data unless that is the exact maintenance task.

## Daily Checks

```bash
npm run lint
VERCEL_ENV=preview npm run build
npm audit --omit=dev
```

For production truth checks, verify the Vercel alias and the live HTML:

```bash
vercel inspect sundaftrip.com
/usr/bin/curl -I https://sundaftrip.com
```

Use the apex domain as canonical. `www.sundaftrip.com` redirects to `sundaftrip.com`.

## Route Smoke List

Check these before release:

- `/`
- `/tours`
- `/blog`
- `/visa`
- `/about`
- `/faq`
- `/legalitas-dan-keamanan`
- `/custom-trip`
- `/reviews`
- `/media-kit`
- `/privacy`
- `/b2b-russia-catalog`

`/contact` is not a standalone route. Contact navigation targets the homepage contact section with `/#contact`.

## Environment Variables

Use `.env.example` as the reference list. Important groups:

- Database: `DATABASE_URL`, optional Prisma pool tuning.
- Auth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST`.
- Site: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_PLAN`.
- Admin seed: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME`.
- Cloudinary: cloud name, API key, API secret, optional folder.
- Scraper and cron: `ANTHROPIC_API_KEY`, `PEXELS_API_KEY`, `CRON_SECRET`, optional Facebook cookie.
- Analytics: optional GA and Facebook Pixel IDs.

Never commit `.env.local` or real secrets.

## Maintenance Notes

- Keep user-facing trust references synchronized across public pages, `llms.txt`, `llms-full.txt`, sitemap coverage, and structured data.
- Treat gated routes carefully: the login form only proves the gate is active. Unlocked B2B catalog checks need a valid catalog cookie or local equivalent verification.
- Keep admin editing touch-friendly. Catalog, terms, and rules pages are commonly edited from a phone.
- Avoid adding dependency families for one small control. Prefer existing app patterns and `lucide-react` icons.
- Keep public route metadata explicit. Thin tour or blog content is a content debt, not a robots or sitemap problem.
