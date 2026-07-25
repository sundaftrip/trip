# Sundaf mobile redesign route and migration policy

Date: 2026-07-26

This change redesigns public presentation in place. It does not delete tour,
article, visa, inquiry, finance, or CMS records, and it does not require a
production database migration.

## Route decisions

| Route group | Decision | Reason |
| --- | --- | --- |
| `/` | Redesign in place | Preserve the homepage canonical and all inbound links. |
| `/tours` | Redesign in place | Keep the catalog canonical while separating open trips, private land tours, and archives in the interface. |
| `/tours/[slug-or-id]` | Redesign in place | Preserve every current slug and the legacy ID fallback. |
| `/tours/[id]/pdf` | Keep unchanged | Preserve generated itinerary PDF URLs and business logic. |
| `/custom-trip` | Redesign in place | Replace the long brief page with a five-step form while keeping its canonical URL. |
| `/visa`, `/visa/[country]`, `/visa/faq`, `/visa/asuransi-visa-protection` | Keep and progressively restyle | Preserve the existing database, country slugs, reviewed fields, and visa SEO value. |
| `/destinations` | Redesign in place | Preserve the destination hub canonical. |
| `/destinations/murmansk`, `/destinations/teriberka`, `/destinations/kazakhstan` | Keep unchanged | These pages contain substantial unique destination content. |
| `/destinations/rusia-aurora`, `/destinations/asia-tengah`, `/destinations/vietnam`, `/destinations/jepang` | Add canonical hubs | Provide the region-level navigation required by the new shell without replacing existing detailed destination pages. |
| `/blog`, `/blog/[slug]` | Keep and progressively restyle | Preserve article slugs, metadata, and Article schema. |
| `/about`, `/reviews`, `/contact`, `/faq`, `/sundaf-trip`, `/company-profile`, `/media-kit` | Keep unchanged | Preserve entity, proof, and contact routes. |
| `/privacy`, `/terms`, `/legalitas-dan-keamanan` | Keep unchanged | Preserve legal URLs and approved copy. |
| Russia query landing pages (`/open-trip-rusia-dari-jakarta`, `/tour-rusia-dari-indonesia`, `/open-trip-aurora-rusia`, `/visa-rusia-wni`) | Keep pending search evidence | Do not redirect pages with potential backlinks or unique intent without Search Console and backlink evidence. Their consolidation should be a separate measured migration. |
| Existing aliases in `next.config.ts` | Keep permanent redirects | Preserve already-established canonicalization. |
| `/search` | Keep `noindex` and omit from sitemap | Internal search results are not canonical landing pages. |
| `/admin/**`, `/api/**`, `/lapor/**`, `/b2b-russia-catalog` | Keep application behavior unchanged | These are operational surfaces outside the public redesign. |

## Tour archive policy

- Upcoming, flexible, and sold-out future departures retain their canonical tour
  URL and remain eligible for indexing.
- Completed tours remain indexable only when they contain at least two strong
  documentation signals: substantial editorial copy, a multi-day itinerary,
  a participant/gallery set, or detailed package inclusions.
- Thin completed tours keep returning `200` for link continuity, receive
  `noindex,follow`, and are omitted from the sitemap.
- No tour slug is redirected or deleted by this change.

## Data compatibility

The current `Tour` table stores one departure date and coarse status fields.
The redesign uses a TypeScript compatibility layer to derive richer display
states and a single compatible departure object. This keeps the interface ready
for normalized departures without changing production data in this task.

## Required follow-up before any future consolidation

1. Export Search Console clicks, impressions, canonicals, and indexed status.
2. Export backlinks for each candidate Russia or archive URL.
3. Compare content uniqueness and conversion events.
4. Approve a one-to-one redirect map.
5. Add permanent redirects, remove redirected URLs from the sitemap, and
   monitor coverage after release.
