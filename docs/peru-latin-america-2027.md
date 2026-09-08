# Peru and Latin America group catalogue

## Public experience

Peru and Latin America are peer cards on `/destinations`. The catalogue is available at `/amerika-latin`; detail pages are `/peru-amerika-selatan` and `/amerika-latin/brasil-kolombia-peru-chile`. Each programme offers a choice of 10, 15 or 20 paying guests, with one Indonesian tour leader.

The price selector updates the base retail estimate, optional hotel upgrade, room arrangement and WhatsApp enquiry together. Previously selected options stay selected when group size changes and use the new group's prices. The lowest advertised price refers to 20 guests. The 15-guest arrangement includes seven twin/double rooms and one single room for participants. Additional single rooms require a separate offer.

Only customer-facing package totals, optional services and inclusions belong in public content. Never put procurement breakdowns, research dates, sampled airfares, allocation methods or supplier correspondence in the public data payload, rendered pages, metadata, crawler summaries or PDF. Keep operational costing outside this repository.

## Data and components

- `lib/latin-america-packages.ts`: customer-facing package details and retail group tiers.
- `lib/latin-america-package-types.ts`: public types, group lookup and option-total calculation.
- `lib/latin-america.ts`: programme identity, metadata and enquiry URL helper.
- `components/website/LatinAmericaPricePanel.tsx`: native radio group, optional services and WhatsApp enquiry.
- `components/website/LatinAmericaProgramme.tsx`: itinerary, hotels, inclusions, flights and FAQ.
- `scripts/latin-america-brochure/generate_brochure.py`: five-page PDF from the same public data, including all three group prices, room arrangements and optional hotel rates.

`price.from` and `price.options[].amount` describe the default group. `price.groups[]` supplies the price and every option amount for each selectable group. Tests ensure the default values agree with its group entry, all options have prices, and unsupported group sizes cannot produce a misleading total.

## PDF regeneration

Follow the applicable PDF skill operation-marker requirement before authoring. Export public data and generate:

```sh
npx tsx -e 'import { LATIN_AMERICA_PACKAGES } from "./lib/latin-america-packages"; import { writeFileSync } from "node:fs"; writeFileSync("/tmp/sundaf-public-packages.json", JSON.stringify(LATIN_AMERICA_PACKAGES, null, 2));'
python3 scripts/latin-america-brochure/generate_brochure.py --data-file /tmp/sundaf-public-packages.json --repo-root "$PWD" --output public/downloads/sundaf-trip-peru-south-america-2027.pdf
```

Render all five pages for visual inspection. Preserve bundled font licences, photo provenance and on-page attribution. The generator rejects procurement fields and research terminology in the public package data.

## Customer conditions

Prices are estimates. Final travel dates, flights, hotels, admission availability and prices are confirmed in writing before booking. The catalogue does not create dated departure inventory, a reservation, checkout or payment obligation. Wi-Fi depends on the operating airline and aircraft. No past departures or official partnership status are claimed.

## Verification and release

- `npm run lint`, `npx tsc --noEmit`, `npm test`.
- Check native radio selection and keyboard navigation for all three group sizes, including retained options, recomputed totals, room notes and the WhatsApp message.
- Check both programmes at 390px, 747px and 1440px; verify no page overflow or client errors.
- Verify public HTML, metadata, data payloads, catalogue PDF and crawler summaries contain no procurement disclosures.
- Render the PDF; match downloaded preview and production hashes to the local artifact.
- Use a dedicated branch, PR and successful Vercel preview, then merge and verify the production pipeline. Do not run database seed or schema commands for this release.
