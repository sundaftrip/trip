# Sundaf Trip Homepage Performance Phase 2

Date: 2026-06-29
Target route: `/`
Audit mode: local production build via `VERCEL_ENV=preview npm run build` and `next start -p 3001`.

## Lighthouse Before/After

| Audit | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS | Speed Index | Unused JS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Before mobile | 69 | 100 | 96 | 100 | 1.67s | 5.75s | 388ms | 0.0031 | 2.82s | 46.2 KiB |
| After mobile | 95 | 100 | 100 | 100 | 1.36s | 2.87s | 30ms | 0.0006 | 1.36s | 52.8 KiB |
| After desktop | 100 | 100 | 100 | 100 | 0.42s | 0.75s | 0ms | 0.0005 | 0.60s | 52.7 KiB |

JSON evidence:
- Before mobile: `/tmp/sundaf-phase2-before-mobile.json`
- After mobile: `/tmp/sundaf-phase2-final-mobile.json`
- After desktop: `/tmp/sundaf-phase2-final-desktop.json`

## Actual LCP Element

Before:
- Element: first homepage tour-card image.
- Label: `Rusia Aurora`
- Selector: `a.block > div.at-card > div.relative > img.object-cover`
- Problem: card image was partially inside the first mobile viewport, `loading="lazy"`, and used a larger Cloudinary transform (`w_720,c_fill,q_auto,f_auto`).

After:
- Element: mobile hero headline text.
- Label: `Tour Rusia, Asia Tengah & Aurora`
- Selector: `div.lg:flex > div.flex-1 > h1.text-[clamp(1.82rem,8.3vw,6rem)] > span.block`
- Result: text LCP at 2.87s, no image resource required for mobile LCP.

## Phase 2 Files Changed

- `app/(website)/page.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `components/Analytics.tsx`
- `components/website/HeroSection.tsx`
- `components/website/Navbar.tsx`
- `components/website/TourCard.tsx`
- `components/website/ToursSection.tsx`
- `lib/utils.ts`
- `scripts/build.mjs`
- `docs/homepage-performance-phase-2-2026-06-29.md`

Note: the worktree also contains Phase 1 and other existing modified files outside this Phase 2 scope.

## What Changed

- Moved mobile LCP away from below-fold tour images by spacing the Atlas tour grid below the first viewport.
- Stopped prefetching initial hero, tour-card, and Atlas navbar routes before user intent.
- Replaced mobile hero letter-by-letter rendering with a two-line plain text headline while keeping desktop animation.
- Disabled mobile hero/title animations that delayed first paint.
- Swapped the default Atlas CMS logo to the local `/logo.png` asset for the known default logo and kept `fetchpriority="high"` for the desktop/header logo path.
- Removed webfont preloads from the mobile critical path and removed the unused `fonts.gstatic.com` preconnect.
- Removed Cloudinary preconnect from the head because the final mobile LCP is text, not Cloudinary media. DNS prefetch remains.
- Kept homepage tour thumbnails small with Cloudinary thumbnail transforms.
- Delayed GA/Meta vendor script loading until first user interaction or WhatsApp click.

## Analytics/Tracking Risk

GA and Meta scripts no longer load during initial render. This reduces third-party work before LCP, but passive pageviews from users who never interact may be delayed or missed depending on whether the queued call is flushed before exit.

WhatsApp click tracking remains safer: click listeners queue `whatsapp_click`/`Contact` and trigger vendor script loading on the click path.

## Mobile Viewport Evidence

| Width | Screenshot | Scroll Width | Client Width | Horizontal Scroll | WhatsApp Links | Contact Links |
| ---: | --- | ---: | ---: | --- | ---: | --- |
| 320 | `/tmp/sundaf-phase2-viewport-320.png` | 320 | 320 | No | 2 | `/#contact`, `/#contact` |
| 360 | `/tmp/sundaf-phase2-viewport-360.png` | 360 | 360 | No | 3 | `/#contact`, `/#contact` |
| 390 | `/tmp/sundaf-phase2-viewport-390.png` | 390 | 390 | No | 3 | `/#contact`, `/#contact` |
| 430 | `/tmp/sundaf-phase2-viewport-430.png` | 430 | 430 | No | 3 | `/#contact`, `/#contact` |
| 768 | `/tmp/sundaf-phase2-viewport-768.png` | 768 | 768 | No | 3 | `/#contact`, `/#contact` |

Inspection JSON: `/tmp/sundaf-phase2-viewport-inspection.json`

## Route Smoke

All expected public routes returned 200:

`/`, `/tours`, `/tours/russia-aurora`, `/blog`, `/blog/open-trip-aurora-rusia-dari-indonesia`, `/visa`, `/visa/russia`, `/about`, `/faq`, `/legalitas-dan-keamanan`, `/custom-trip`, `/reviews`, `/media-kit`, `/privacy`, `/sundaf-trip`, `/open-trip-vietnam`, `/b2b-russia-catalog`.

`/contact` returned 404 as expected because contact is `/#contact`; UI contact links point to `/#contact`.

## Final Regression Checklist

- `npm run lint`: passed.
- `VERCEL_ENV=preview npm run build`: passed.
- Mobile Performance >= 85: passed, 95.
- Mobile LCP <= 3.0s: passed, 2.87s.
- Mobile Accessibility >= 95: passed, 100.
- Mobile Best Practices >= 95: passed, 100.
- Mobile SEO >= 95: passed, 100.
- Desktop Performance >= 95: passed, 100.
- WhatsApp CTAs present: passed.
- No horizontal scroll at 320px: passed.
- Contact UI links use `/#contact`: passed.
- Route smoke: passed, with `/contact` 404 allowed.

## Residual Notes

Lighthouse still reports about 52.8 KiB unused JavaScript from shared Next/app chunks. Analytics is no longer in the initial request path, but shared chunk reduction would require a deeper client-boundary split, mainly around layout/navigation/search code.
