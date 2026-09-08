# Peru and Latin America programme catalogue

## Public routes

- `/amerika-latin`: catalogue with a Peru programme and a Brazil, Colombia, Peru, Chile programme.
- `/peru-amerika-selatan`: Peru programme, indicative route, enquiry handoff and English trade summary.
- `/amerika-latin/brasil-kolombia-peru-chile`: four-country programme and English trade summary.
- `/downloads/sundaf-trip-peru-south-america-2027.pdf`: two-page Indonesian / English product brochure.

The catalogue is linked from tours, destinations, the public footer, company profile, sitemap and both crawler summaries. It is separate from dated departure inventory: there is no invented price, seat count, confirmed departure, payment flow or Product/Offer structured data. The Peru-only programme requires a separate supplier quotation.

## Editing and regeneration

- Programme copy and contextual enquiry links: `lib/latin-america.ts`.
- Catalogue layout: `app/(website)/amerika-latin/page.tsx`.
- Shared detail page: `components/website/LatinAmericaProgramme.tsx`.
- Shared styles and catalogue promotion: `components/website/LatinAmerica.module.css`, `LatinAmericaCollection.tsx`.
- Brochure generator: `scripts/latin-america-brochure/generate_brochure.py`. Requires Python and ReportLab. Bundled fonts have accompanying OFL licences and provenance.

```sh
python3 scripts/latin-america-brochure/generate_brochure.py --output public/downloads/sundaf-trip-peru-south-america-2027.pdf
```

Re-render and inspect both PDF pages after editing. Keep the bilingual brochure and website status consistent. Photo source and derivative licence details are in `public/images/latin-america/CREDITS.txt`; on-page credits are linked from detail images.

## Commercial boundaries

The public offer is a request for a tailored quotation for programmes in development for 2027. Final dates, duration, flight connections, service scope, pricing and availability require confirmation. The catalogue does not claim prior Peru departures or official supplier partnerships. Corporate credentials belong to Sundaf Trip / CV Sundaf Holiday Group.

Private correspondence, supplier net prices and buyer-application evidence are stored outside this public repository. No hosted-buyer acceptance or travel sponsorship is promised by these materials.

## Validation

- `npm run lint` and `npm test`.
- `VERCEL_ENV=preview npm run build` skips database migration and seed. Local compilation and TypeScript succeeded; full local prerender stopped at the existing `/blog` route because downloaded Vercel database values are empty. Remote Vercel build must be verified before release.
- Browser inspection at 1440px and 390px: catalogue and both programmes, image loading, no horizontal overflow, canonical metadata, one H1, enquiry targets, PDF response and FAQ expansion. Check navigation from a scrolled catalogue to the top of a detail page on touch devices.
- PDF: two A4 pages, bilingual content and clickable links; both rendered pages visually inspected.

Use a task PR and preview before the production pipeline. Do not run database push or seed as part of this content release.
