# FYStay project status (engineering tracker)

Working tracker for the autonomous build loop (ASSESS → PLAN → BUILD → TEST → FIX → REVIEW).
The launch-blocker list stays in [launch/master-checklist.md](launch/master-checklist.md);
this file tracks engineering tiers, test results and known bugs. Update it after every change.

## Tiers

| Tier | Scope | State |
|---|---|---|
| 1 | Backend foundation (auth, roles, validation, storage, email, payments, security) | In progress - audit running |
| 2 | Booking engine (listings, search, availability, pricing, reservations, payments) | Not started |
| 3 | Guest, host and admin dashboards | Not started |
| 4 | UI/UX refinement (typography, spacing, copy, mobile) | Partly done (see log) |
| 5 | Full QA and production readiness | Not started |

## Test baseline (7 Nov 2026, branch claude/affectionate-meitner-5a9q99)

- Unit tests (vitest): 192 files, 2,033 tests - pass.
- Typecheck, lint (0 errors, 4 pre-existing warnings in untouched files), production build - pass.
- E2E (Playwright, local Postgres + `next start`): see the Test results log below.

## Test results log

- 7 Nov, first run: 14 passed, 107 failed. Cause: local Postgres went down mid-run (sandbox restart). Not an app failure.
- 7 Nov, clean run on a healthy database: 138 passed, 2 failed.
  - `search-bar-dates` "without dates" expected the old copy "Add your dates above". Test updated to the new wording (the copy change was intentional).
  - `spotlight` "Seen N times" missing in the full run only. Cause: the e2e suite shares one IP, and event posts are limited to 120 per visitor per 10 minutes, so later tests used up the allowance. The spec passes alone. The spec now gets its own forwarded address.
- 7 Nov, full rerun with both fixes: **138 passed, 1 failed** (2.4 min, 3 workers).
  - Failing: `spotlight` - the host's "Seen N times" never appears for the "tiny B&B for two" fixture in the full run. The server logged a foreign-key error (`ListingPromotionStat_promotionId_fkey`) for an event posted against a promotion that is no longer in the database. The spec passes alone. Open: find which promotion id the homepage sends, and why it isn't the one the host page reads. Treat as a real bug until proven otherwise.
- 7 Nov, spotlight fix: 139 passed, 1 failed (`favourites` sign-up). Cause: the sign-up limit (see Known bugs). Fixed by giving that test its own address.
- 7 Nov, after per-test addresses, one failure in `email-verification-signup` (the `afterAll` race) and one timeout in `authorization` during teardown. Fixed the race by making the file serial. The authorization test passed on rerun.
- 7 Nov, final: **140 passed, 0 failed** (2.5 min, 3 workers, exit 0).

## Known bugs

- **Spotlight deleted-placement race (fixed 7 Nov):** the event insert can fail if the placement's listing is deleted between the live check and the insert. That now counts as "not live" (`src/lib/spotlightStats.ts`), covered by unit tests.
- **Spotlight stats (fixed 7 Nov):** the spec featured the host's first listing, which another spec (`search-filters`) creates and deletes mid-run. Deleting a listing cascades to its placement and view counts. The spec now creates and features its own fixture listing and deletes it afterwards.
- **Shared test IP (fixed 7 Nov):** sign-up is limited to 5 per hour per address, and the limit is stored in the database, so repeated runs in the same hour exhaust it. Sign-up specs now give each test its own address (`e2e/isolate-ip.ts`).
- **Verification spec race (fixed 7 Nov):** its `afterAll` removed every account with the shared prefix, including accounts other workers were still using. The file now runs in serial mode.
- **Rate-limit IP header (checked 7 Nov, no code change):** Vercel's documentation says it overwrites `x-forwarded-for` on every request, so a client cannot choose the address the limits see. Checked against the documentation only, not by probing Production. Note: `x-vercel-forwarded-for` is the same value and is not overwritten if another proxy ever sits in front of Vercel. Revisit only if the hosting changes.

## Technical decisions

- Local verification uses a local Postgres 16 with the schema from `prisma migrate deploy` and the demo seed (`prisma/seed.ts`). Never run against Production.
- Production changes (migrations, env vars, merges to the production branch) stay with the owner, per `CLAUDE.md`.

## External dependencies (owner)

See [launch/master-checklist.md](launch/master-checklist.md): trader identity, legal sign-off, backups, real listings, a real-money test.

## Work log (autonomous loop)

- 7 Nov, item 1 - rate-limit IP header: checked against Vercel's documentation, no code change needed (see Known bugs).
- 7 Nov, item 2 - Spotlight deleted-placement race: treated as "not live", with unit tests.
- 7 Nov, item 3 - admin failures view: new `DeliveryFailure` table (migration `20261107113211_delivery_failures`, RLS on, added to the manifest). Emails the provider refuses and Stripe webhooks that throw are recorded. Admins see them at `/admin/failures` and mark them handled. Overview shows the open count. Unit tests + e2e (`e2e/admin-failures.spec.ts`).
  - **Owner action:** apply the migration to Production through the normal migration workflow. It's additive (a new table and enum).

- 7 Nov, item 4 - UI pass (first slice, phone checked): the account's email row is now one line that opens the form on request (was an always-open form); the trips tabs no longer wrap; the host Today page no longer repeats the payouts setup (the checklist already shows it). Full e2e: 141 passed. Still open in tiers 3-4: the trip card's journey panel, the admin screens at phone width, search results, and a full desktop pass.

- 7 Nov, item 4 - UI pass (second slice): admin stat cards show the full figure on a phone (icon above the number; "Platform revenue" was cut off); admin copy shortened ("Booking value", "Commission"); the Suspend button is no longer a solid red block. Trip card: a transfer offer is no longer shown on a finished stay (it was: "Need a ride from the airport?" on a past holiday), and the redundant "Stay" tick is gone. Checked at phone and desktop: admin overview, homepage, search, host calendar, register. Full e2e 141 passed (one authorization run failed only because a local test account had been promoted to admin during the run; rerun alone 4/4).

- 7 Nov, item 5 - QA and production readiness:
  - Crawl of 120 public pages from the homepage: all 200, no broken internal links. Console errors on listing pages are OpenStreetMap map tiles blocked by the sandbox proxy, not an app fault.
  - Every admin and host API route refuses a signed-out request (401/403/redirect). The seed-demo-data route returns 501 in production by design.
  - Dependency audit (production): found 2 critical advisories in `next` (16.3.3, affected up to 16.4.0) and `@sentry/nextjs` (10.74.0). Upgraded to next 16.4.5, @sentry/nextjs 10.78.0, zod 4.6.7. Criticals cleared.
  - Still open (high, production dependencies): Prisma 6 advisory via `@prisma/config` / `deepmerge-ts`, which is used when the Prisma CLI loads config (build and migrations, not request handling). The fix is Prisma 7, a major upgrade. Planned, not done.
  - Test fix: the autocomplete spec read the place-details session before the request was made (race). It now waits for the request.
  - Full e2e after upgrades: 141 passed.

## Next priorities

1. Get a clean e2e run; fix every failure that is a real app bug.
2. Audit booking availability and double-booking under concurrency (Tier 2).
3. Audit guest, host and admin dashboards for wording and layout (Tiers 3-4).
