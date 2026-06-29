# Sundaf Trip Codebase Health Audit

Date: 2026-06-29
Repo: `/Users/ferdiansahyusuf/sundaftrip`
Live canonical domain: `https://sundaftrip.com`

## Executive Summary

The app is buildable, lint-clean, and the live production alias is healthy. The main issues found were not routing or SEO infrastructure problems; they were dependency hygiene, accessibility details in the Atlas homepage UI, stale operator documentation, and mobile performance headroom.

This audit pass did not deploy the local changes. Production was checked for current health, but the code fixes listed here are local until a production deploy is intentionally run.

This pass fixed the actionable codebase issues that could be corrected safely without overwriting existing user-owned work:

- Removed unused dependencies and resolved npm audit advisories.
- Upgraded Next/ESLint config package alignment to `16.2.9`.
- Added the missing `server-only` dependency used by server-only modules.
- Added package overrides for transitive `postcss` and `undici` advisory resolution.
- Fixed Atlas card contrast, hidden heading order, label-name mismatch, touch target, sticky WhatsApp contrast, and local CSP/console issues.
- Replaced the placeholder README with operational maintenance documentation.
- Updated `.env.example` to match the environment variables the app actually reads.

## Final Verification Snapshot

| Check | Result | Notes |
| --- | ---: | --- |
| `npm run lint` | Pass | ESLint completed with no reported errors. |
| `VERCEL_ENV=preview npm run build` | Pass | Skipped Prisma push/seed; generated 100 static pages. |
| `npm audit --json` | Pass | 0 total vulnerabilities. |
| `npm audit --omit=dev --json` | Pass | 0 production vulnerabilities. |
| Local route smoke | Pass | Core routes returned 200; `/contact` returned 404 because contact is `/#contact`. |
| Production route smoke | Pass | Core live routes returned 200. |
| Vercel alias truth | Pass | `sundaftrip.com` target is production and Ready. |
| Robots/sitemap/LLMS | Pass | `robots.txt`, `sitemap.xml`, `llms.txt`, and `llms-full.txt` return 200. |

## Lighthouse Homepage Results

Final Lighthouse target: local production build at `http://localhost:3001`.

| Form factor | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 75 | 100 | 100 | 100 | 5.7s | 215ms | 0.005 |
| Desktop | 100 | 100 | 100 | 100 | 0.7s | 0ms | 0.002 |

Remaining performance debt:

- Mobile LCP is still slow for a travel homepage with rich imagery.
- Lighthouse still reports about 113 KiB unused JavaScript on mobile, led by Google Analytics and shared Next chunks.
- This is not a correctness blocker, but it is the next best conversion-speed target.

## Production Evidence

`vercel inspect sundaftrip.com` showed:

- Deployment: `sundaftrip-fky9hu3fm-sundaftrips-projects.vercel.app`
- Target: production
- Status: Ready
- Aliases include `https://sundaftrip.com` and `https://www.sundaftrip.com`

HTTP checks:

- `https://www.sundaftrip.com` returns `308` to `https://sundaftrip.com/`.
- `https://sundaftrip.com` returns `200`.
- `https://sundaftrip.com/robots.txt` returns `200`.
- `https://sundaftrip.com/sitemap.xml` returns `200`.
- `https://sundaftrip.com/llms.txt` returns `200`.
- `https://sundaftrip.com/llms-full.txt` returns `200`.

## Route Smoke

The following routes returned `200` locally and in production:

- `/`
- `/tours`
- `/tours/russia-aurora`
- `/blog`
- `/blog/open-trip-aurora-rusia-dari-indonesia`
- `/visa`
- `/visa/russia`
- `/about`
- `/faq`
- `/legalitas-dan-keamanan`
- `/custom-trip`
- `/reviews`
- `/media-kit`
- `/privacy`
- `/sundaf-trip`
- `/open-trip-vietnam`
- `/b2b-russia-catalog`

`/contact` returned `404` locally and in production. This is expected because navigation uses the homepage contact anchor `/#contact`, not a standalone route.

## Dependency And Security Cleanup

Removed unused packages reported by depcheck:

- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-label`
- `@radix-ui/react-select`
- `@radix-ui/react-separator`
- `@radix-ui/react-switch`
- `@radix-ui/react-tabs`
- `@radix-ui/react-toast`
- `class-variance-authority`
- `groq-sdk`
- `tailwindcss-animate`

Kept as known depcheck false positives:

- `@tailwindcss/typography`, used through Tailwind CSS configuration.
- `@tailwindcss/postcss` and `tailwindcss`, required by the Tailwind v4 pipeline.
- `critters`, required by Next `optimizeCss`.

Security status:

- `npm audit --json`: 0 vulnerabilities.
- `npm audit --omit=dev --json`: 0 vulnerabilities.
- Tracked-file secret scan found no obvious committed private keys or API secrets.

## Accessibility Fixes

Fixed issues found by Lighthouse:

- Atlas cards no longer use low-contrast light text tokens.
- Dimmed Atlas cards no longer reduce whole-card opacity.
- Old-price strike text keeps sufficient contrast.
- The Atlas tour section now has a screen-reader heading before repeated `h3` card titles.
- Scroll reveal no longer fades text through low-contrast opacity states.
- Visible link labels no longer conflict with custom `aria-label` values.
- Testimonial dot controls now have 24px-plus hit targets.
- Sticky WhatsApp uses a darker green background with sufficient white text contrast.
- The tour-list CTA has enough vertical spacing to pass target-size checks.

## SEO And GEO Status

The technical crawler layer is healthy:

- Canonical apex domain is live.
- Sitemap is available.
- Robots file is available and references the sitemap/LLMS files.
- Homepage metadata and Open Graph image are present.
- `llms.txt` and `llms-full.txt` are live.

Remaining SEO/GEO debt is content-level, not infrastructure-level:

- Some legacy tour/category pages can still be thin compared with the trust/reference pages.
- Future SEO work should prioritize pruning, enriching, and differentiating content clusters rather than changing robots or sitemap plumbing again.

## Mobile UX Status

Automated mobile checks passed for accessibility, best practices, SEO, route availability, and major layout stability. The key remaining mobile weakness is speed:

- LCP is too slow at 5.7s in Lighthouse mobile.
- Rich hero/tour imagery and analytics JavaScript are the likely next optimization targets.

Admin pages remain partially gated. Without an admin session, the right proof boundary is build/lint, source inspection, and expected redirects rather than claiming unlocked visual screenshots.

## Files Changed In This Pass

- `.env.example`
- `README.md`
- `app/(website)/page.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `components/website/HeroSection.tsx`
- `components/website/StickyWhatsApp.tsx`
- `components/website/TestimonialSection.tsx`
- `components/website/TourCard.tsx`
- `components/website/ToursCatalog.tsx`
- `components/website/ToursSection.tsx`
- `next.config.ts`
- `package.json`
- `package-lock.json`

## Recommended Next Work

1. Optimize mobile LCP: inspect the homepage hero image path, preload strategy, and Cloudinary sizing for the actual LCP element.
2. Reduce client JavaScript: delay Google Analytics until after interaction or consent, and review shared chunks loaded by the homepage.
3. Run authenticated admin mobile screenshots when a valid admin session is available.
4. Enrich thin legacy tour pages and avoid more crawler-file churn unless live crawl evidence shows a real defect.
