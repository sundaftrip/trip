# Peru and Latin America priced catalogue

## Public routes

- `/destinations`: six equal destination cards; Peru and Latin America use the same layout as Russia, Central Asia, Vietnam and Japan.
- `/amerika-latin`: catalogue for Peru and Brazil, Colombia, Peru, Chile.
- `/peru-amerika-selatan`: Peru, 10 calendar days from Jakarta / 7 local days / 6 hotel nights; indicative price Rp64.5 million per paying guest.
- `/amerika-latin/brasil-kolombia-peru-chile`: 16 calendar days / 13 local days / 12 hotel nights; indicative price Rp152.6 million.
- `/downloads/sundaf-trip-peru-south-america-2027.pdf`: five-page catalogue with Indonesian itinerary, options and English trade brief.

Both estimates use 20 paying guests plus one tour leader and twin/double sharing. The public breakdown includes selling-price ground services, international airfare allowances and the tour leader flight allocation. Domestic/regional flights are included as allowances. Hotel and train upgrades, plus Palcoyo on the four-country itinerary, are separate options. Selecting an option updates the total and WhatsApp enquiry; it does not reserve or charge anything.

## Content and regeneration

- `lib/latin-america-packages.ts`: public prices, day-by-day itineraries, hotels, inclusions, exclusions, photos and flight notes.
- `lib/latin-america-package-types.ts`: types, price formatting and pure option-total calculation.
- `lib/latin-america.ts`: programme identity, metadata and contextual enquiry links.
- `components/website/LatinAmericaProgramme.tsx`: shared programme detail page.
- `components/website/LatinAmericaPricePanel.tsx`: accessible option controls and enquiry handoff.
- `components/website/LatinAmericaPhotoCredit.tsx`: credits linked to photo provenance.
- `scripts/latin-america-brochure/generate_brochure.py`: five-page PDF using ReportLab, Pillow, bundled fonts and HD photos.

Export the same public data used by the website, then generate the PDF:

```sh
npx tsx -e 'import { LATIN_AMERICA_PACKAGES } from "./lib/latin-america-packages"; import { writeFileSync } from "node:fs"; writeFileSync("/tmp/sundaf-public-packages.json", JSON.stringify(LATIN_AMERICA_PACKAGES, null, 2));'
python3 scripts/latin-america-brochure/generate_brochure.py --data-file /tmp/sundaf-public-packages.json --repo-root "$PWD" --output public/downloads/sundaf-trip-peru-south-america-2027.pdf
```

Follow the applicable PDF skill's operation-marker requirement before the first PDF creation/edit in a session. Render and visually inspect all five pages. Preserve font licences in the generator assets directory. Photo licences and transformations are recorded in `public/images/latin-america/CREDITS.txt` and `metadata.json`, with attribution on the website and PDF.

## Pricing and commercial boundaries

The international allowances use arithmetic means of three observed regular Qatar Economy Classic return fares per destination, on dates matching the local programme. Research date: 9 September 2026. No promotion code, redemption or group-seat guarantee is claimed. Peru connections include airline partners. Wi-Fi depends on the operating aircraft and each flight segment.

The Peru land basis is a supplier's published retail programme; it is not a confirmed 2027 group quotation. The four-country cost basis uses a historical supplier proposal requiring renewal. Domestic Peru flights are a planning reserve, not a verified market average. Regional baggage, taxes, schedules, hotel inventory and admission availability must be reconfirmed. There is no fixed departure inventory, checkout, seat count, payment schedule or Offer structured data.

Private procurement calculations, supplier correspondence and buyer-application evidence remain outside this public repository. These materials do not claim previous Peru departures, supplier partnership status, hosted-buyer acceptance or sponsorship. Sundaf Trip's entity is CV Sundaf Holiday Group.

## Validation

- `npm run lint`, `npx tsc --noEmit`, `npm test` (263 tests, including price reconciliation and option arithmetic).
- Browser checks at 1440px and 390px for all four public pages: six peer cards, image loading, no page overflow, single H1, canonical metadata, options/total/WhatsApp synchronisation, itinerary expansion and navigation scroll reset.
- Five-page PDF render, readable text, complete content and working URLs.
- `VERCEL_ENV=preview npm run build` is the safe local build variant; it skips migration and seed. Local full prerender can fail on the existing `/blog` route when local database environment values are unavailable. The remote Vercel preview build is required before release.

Use a dedicated branch, PR and preview, then the merged production pipeline. Do not push or seed the database as part of this catalogue release.
