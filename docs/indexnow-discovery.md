# IndexNow content notifications

Sundaf sends changed public URLs to `https://api.indexnow.org/indexnow` after CMS saves. The protocol shares notifications with participating search engines. HTTP 200 confirms receipt; HTTP 202 means receipt with ownership verification pending. Neither proves crawling, indexing, ranking, or a search-result appearance.

## Activation and ownership

- Sending and queue writes require `VERCEL_ENV=production`. Local development and Vercel previews never enqueue or submit, even if they share the production database.
- `INDEXNOW_DISABLED=true` is the operational kill switch. It stops enqueue, reconciliation, and delivery without deleting existing entries.
- An existing root-level public ownership text file is read on the server. Its contents must equal its filename without `.txt`. The existing file is unchanged. No additional API credential is required.
- The only outbound request is a POST to the fixed IndexNow endpoint. URLs and host are fixed to canonical `https://sundaftrip.com` documents. Redirects are refused; CMS-provided URLs are never fetched.
- The daily cron at `02:25 UTC` (`09:25 WIB`) requires Vercel's existing `CRON_SECRET` bearer header. It is independent of the scraper cron.
- Initial full-catalog submission remains an explicit operator action. Activating this code does not submit all historical URLs. Register or verify the property and sitemap in the engines' own webmaster tools separately.

## CMS coverage

Tour, blog, visa, and supported GEO changes notify their public document paths. Rename and deletion handlers capture the old public path before changing the record. Unpublishing a previously public page notifies its old URL so engines can observe its removal. A draft that has never been public is excluded. Tours use the same visibility and substantive-archive policy as the public page; the existing two legacy public tour slugs remain subject to that established visibility rule.

FAQ, testimonial, website text, business settings, and terms changes notify their affected public landing pages. Pure theme/color changes do not notify search engines. Supporting listing pages accompany document changes. Unsupported GEO `routePath` values do not create public routes and are excluded.

When adding a new public route family, update `INDEXNOW_STATIC_PATHS` or the strict document-family validation along with the sitemap. There is no public arbitrary-URL submission endpoint.

## Durable queue and retries

This repository has no schema migration history and production schema changes are disabled by its build wrapper. To avoid introducing an unmanaged database migration, the implementation uses bounded operational rows in the existing `CompanyInfo` key/value table. Each URL has a separate key under the reserved `__indexnow_` prefix. Queue state contains only a public URL, timestamps, revision, attempt count, and protocol status; no credentials or customer data are stored there.

The prefix is rejected by CMS settings writes, excluded from authenticated and public settings responses, and filtered from the remaining broad website and maintenance-script reads. Other company readers already use explicit public key allowlists or `company_`/`about_` prefixes. The isolation regression test audits all collection readers.

- A maximum of 1,000 URL rows is enforced for new inserts under a short transaction-scoped PostgreSQL advisory lock. Network calls never run inside a transaction. This capacity is for queue entries plus recent receipts, not 1,000 requests per day.
- Entries expire 30 days after the newest enqueued edit. Cleanup removes expired or malformed entries and reports a count; unresolved deliveries that reach expiry require investigation and explicit resubmission.
- Each save persists the queue before scheduling HTTP using Next.js `after()`. Engine errors never fail a CMS save. Storage failures are caught and logged separately.
- Compare-and-swap updates preserve the latest revision if another edit arrives while a submission is in flight. A receipt remains for the accepted revision so reconciliation does not repeatedly submit unchanged content.
- A database lease limits concurrent senders. Each drain sends at most 100 URLs in one request, with an 8-second network timeout and no in-process sleep or retry loop.
- Timeouts, 429, and 5xx retain pending entries with exponential backoff up to one day. A valid `Retry-After` can extend that delay; it is never shortened. A delay past retention causes expiry rather than an early retry.
- Invalid format/ownership/host responses (400/403/422) retain entries and impose a one-day cooldown. The cooldown also covers newly enqueued edits, preventing CMS writes from bypassing engine throttling.
- A cron invocation can drain twice, around reconciliation, for a bounded maximum of 200 delivery attempts. After-response delivery drains once. Future cron invocations provide retries after any platform interruption.

## Reconciliation and practical limits

On its first run reconciliation records the current time, without historical backfill. Later runs query only records changed since its saved cursors, in stable `(updatedAt, id)` order, with a one-minute delay for in-flight writes. Each run examines at most 10 records each for blog, tour, visa, and GEO. Larger backlogs are paginated over later runs. Cursors advance only after enqueue succeeds; accepted receipts make repeated cursor pages harmless.

Reconciliation recovers current public content changed by a script or after an enqueue failure. It cannot reconstruct a former public URL removed through deletion, rename, unpublishing, or a visibility/noindex transition if the removal was never successfully queued. This is the deliberate tradeoff for not making CMS saves depend on queue availability. Strong atomic recovery of such historical changes would require a dedicated outbox table written in each content transaction, and a managed migration workflow. Static content edited in Git should receive an explicit deployment-time submission; a code deployment alone does not imply every sitemap URL changed.

The queue is an operational use of `CompanyInfo`, not business configuration. If discovery volume approaches the row limit, move it to a dedicated indexed outbox table instead of raising limits or allowing CMS access to internal rows.

## Operations and validation

Investigate the sanitized server messages `IndexNow delivery`, `IndexNow delivery deferred`, `IndexNow enqueue failed`, or `IndexNow cron failed`. Logs contain counts and protocol statuses, never the ownership key or request body. A `verification_pending` response is not success evidence for indexing; inspect the engine webmaster dashboard for later coverage.

Run:

```sh
npm run lint
npx tsc --noEmit
npm test
VERCEL_ENV=preview npm run build
```

Use the Git-connected Vercel preview build when local database configuration is unavailable. Never invoke the build wrapper locally without `VERCEL_ENV=preview`, because the legacy local build branch runs schema push and seed.

The tests cover public/private URL boundaries, production gating, fixed endpoint behavior, 202 semantics, authorization, retries, concurrent saves and sends, expiry, rename/unpublish/delete behavior, and settings isolation. Production submission is not part of automated tests.

References: [IndexNow documentation](https://www.indexnow.org/documentation), [Next.js after](https://nextjs.org/docs/app/api-reference/functions/after).
