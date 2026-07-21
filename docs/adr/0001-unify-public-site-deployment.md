# ADR 0001: Unify the public site in the main Next.js application

- Status: Accepted
- Date: 2026-07-21

## Context

The public domain was served by a separate static Vercel project for `/`, `/tours`, and a proxy that rewrote tour-detail HTML from the main Next.js deployment. Trip records were duplicated as hard-coded HTML and JavaScript, so availability, pricing, and visual state could drift from the database and admin system.

## Decision

The main Next.js application is the single source and deployment target for all public routes.

- The current clean public design is implemented as native React and CSS-module components.
- Home and catalog content is rendered from Prisma records.
- `getPublicTourState` is the canonical rule for `bookable`, `flexible`, `sold`, and `completed` states.
- The two scheduled products already exposed by the old facade remain public through an explicit slug allowlist until their database status is migrated from `DRAFT` to `ACTIVE`; no other draft becomes public.
- Sold and completed cards apply grayscale to the complete card.
- Existing non-Atlas themes remain available; the active Atlas public theme uses the clean shell.
- The production domain moves only after the preview passes route, responsive, and interaction checks.

## Consequences

- Tour data is edited once through the existing application and admin workflow.
- The static facade and HTML-rewriting API are no longer required after the domain move.
- Public navigation, metadata, structured data, detail routes, and transactional routes share one release lifecycle.
- A rollback remains possible by restoring the domain alias to the previous Vercel project while the old deployment is retained.
