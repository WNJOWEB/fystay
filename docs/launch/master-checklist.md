# FYStay master launch checklist

**The single remaining-work list.** Update this file instead of re-auditing.
When an item is done, move it to COMPLETE with the commit or date.

Last verified: **13 October 2026** (live Stripe Identity and Connect onboarding
tested by the owner; read-only checks of Vercel logs, Sentry, Stripe and
Supabase). The 12 Oct snapshot below is kept as history. Earlier audits are kept
below as history. [handover.md](handover.md) has the background.

Related: [handover](handover.md) · [Stripe and email setup](stripe-and-email-setup.md) ·
[launch runbook](launch-runbook.md) ·
[environment variables](environment-variables.md) ·
[legal drafts](legal-drafts.md)

---

## Verified state (12 Oct 2026, history)

| Area | State | Evidence |
|---|---|---|
| Code | Working branch `claude/airbnb-competitor-1fjjpk` at `1c0eb6f` (merge of release PR #32: #17, #25, #26, #27, #28, #29, #30, #31) | GitHub; every PR head is in the branch history (`git merge-base --is-ancestor`) |
| Production deploy | `1c0eb6f`, Ready and serving `www.fystay.co.uk` / `fystay.co.uk` since ~17:32 UTC 12 Oct | Vercel deployment `dpl_6Um84ppqMAPApsVps8k2z7PWbyaA`; live pages carry Sentry release `1c0eb6f` |
| Production health | `/api/health`: status ok, database ok, config ok | Fetched 12 Oct 17:33 UTC |
| Live features (checked 17:33-17:36 UTC, signed out) | Header: "· Apartments · B&Bs · Lodges"; desktop tabs inline in the header (hidden below `lg`); phones/tablets get the fixed bottom tab bar (Stays, Explore, Travel, Services; hidden at `lg`). Search: suggestions answer (landmarks only, see Catalogue); `GET /api/listings` without dates gives 400 "Add a check-in date"; landmark + dates + `propertyType=LODGE` + price filter gives 200; `/search` with dates renders "No stays match your search". `/api/search/place` gives 503 (no Google key, expected). Hotels: "Hotel search is unavailable" (no live partner; test hotels are blocked on Production by design), so hotel booking links can't be exercised live. `/admin/properties` and `/host/calendar` send signed-out visitors to login; the calendar export answers 404 for an unknown listing/token | Fetched through Vercel; signed-in admin and calendar sync screens not exercised on Production (no Production test account; covered by the release's browser tests) |
| Production settings | Database, Auth, base URL and `NEXTAUTH_URL` (www domain), cron, 2FA key, Supabase, Sentry, Google sign-in, Resend key, `EMAIL_FROM` on own domain, dispute inbox, live Stripe key, both live webhook secrets: all present | Vercel variable names (values never read); health check confirms the Stripe key is live |
| Stripe live account | Charges and payouts enabled, identity verified, bank account linked, statement descriptor `FYSTAY`; account type: individual | Stripe API, read-only |
| Live webhooks | Account-events and connected-accounts endpoints enabled on `https://www.fystay.co.uk/api/webhooks/stripe` | Stripe API, read-only; no live event delivered yet |
| Production database | 62 migrations applied, latest `20261012170000_listing_location_index`, none unfinished. PropertyType has BED_AND_BREAKFAST and LODGE; `Listing_latitude_longitude_idx` exists; HostInvitation, ListingReviewEvent and AdminAuditEvent have row-level security on; iCal sync error columns present | Migration run 38284206307 (owner-approved, success 12 Oct ~17:29); read-only SQL 17:31 UTC. Old run 38244398792 cancelled (superseded) |
| Catalogue | 0 listings live, so town suggestions are empty (they come from towns with live stays) and search returns no stays | Live `/api/listings` and suggestions, 12 Oct 17:33 |

## Verified state (13 Oct 2026)

| Area | State | Evidence |
|---|---|---|
| Production deploy | `5923a71` (#46), then #47 when approved; health ok | Vercel `dpl_G5okwZqVrjMyKUmfJzFfjABK2YPa`; `/api/health` 13 Oct 14:06 UTC |
| Email verification at sign-up | Live (#36) | Merged 13 Oct |
| Real email delivery | Works | hello@fystay.co.uk confirmed through the emailed link, 13 Oct 01:54 UTC |
| Admins | hello@fystay.co.uk and the original Gmail account | Granted 13 Oct at the owner's request |
| Stripe Identity | **Live.** Activated by the owner 13 Oct; a live verification session was created for the owner's host account (status PENDING until they finish the ID + selfie) | Production DB, read-only |
| Stripe Connect | **Live.** First connected account `acct_1UQ6NfE6g0pKrmpo` (owner's host account): `stripe_transfers` and `payouts` active, no requirements; FYStay shows "Payouts active" | Stripe API (read-only), payouts page |
| Connect platform profile | Completed by the owner as "Sellers collect payments directly", Stripe liable, full Dashboard - not the marketplace setup. Live refused recipient-only accounts (`capability_not_available_without_other_capability`), so #46 requests `card_payments` alongside `stripe_transfers`; checkout is still destination charges. Stripe Support case opened 13 Oct to correct the profile (reply due within 24h) | Vercel logs, Sentry JAVASCRIPT-NEXTJS-A |
| Catalogue | 0 published listings | Production DB |

## LAUNCH BLOCKERS (outstanding, rechecked 16 Oct)

**2 Nov, owner decision: nightly Production backups are PAUSED until launch.** All 17 nightly runs since 17 Oct failed (the backup step stops within a second, probably missing or wrong `backup` environment secrets). The schedule is switched off so it stops emailing failures. **Launch blocker: restore the schedule and get a green manual run, with a file in the `prod-backups` bucket, before the first real signup, booking or payment.** Supabase Free has no backups of its own.

**3 Nov, owner decision: no backups until the systems are upgraded (Supabase paid plan).** Accepted risk, not fixed: until then a database loss means no recovery, so keep real customer data to a minimum. This is not ticked off - revisit when the plan is upgraded and before real bookings are taken at any scale.

**3 Nov, owner actions in Stripe (dashboard, live mode):** review Radar rules; turn on dispute email alerts. Checkout already requires 3D Secure and records the guest's acceptance of the cancellation policy (payment metadata). Link is optional and not needed.

**3 Nov, 2FA:** turn it on for hello@fystay.co.uk (Account → Security) - owner.

16 Oct, read-only: health ok (status, database, config); Production database has 0 listings, 0 bookings, 5 users. Open PRs waiting on the owner: #7 (blocker 1), #9 (Spotlight), #52 (nightly backup: needs the read-only login and two secrets, see its runbook), #53 (smart pricing: migration + solicitor first).

| # | Blocker | Owner action |
|---|---|---|
| 1 | **Trader identity: sole trader (owner decision 3 Nov).** The structure is decided; the legal name and a publishable address are not yet supplied, so `NEXT_PUBLIC_COMPANY_LEGAL_NAME` / `_ADDRESS` aren't set and #7 can't merge. **Never publish placeholder details.** A sole trader publishes their own name and a contact address (can be a business address, not necessarily home). | Owner: give the trading name and the address to publish. Then I set the two variables with approval and merge #7. |
| 2 | **Legal sign-off - owner has taken this (3 Nov: "I will get that done soon").** Not yet signed off. Solicitor review of Terms, Privacy, Cookies, cancellation wording (now incl. the No refund option), host terms ([legal-drafts.md](legal-drafts.md)), the fee comparison on /host against Airbnb and Booking.com; ICO registration; HMRC platform reporting; chargeback liability. A sole trader isn't VAT-registered unless turnover passes the threshold. | Owner: instruct solicitor. |
| 3 | **No listings.** 0 published. New listings now get a map position anywhere in the UK (#49). | Create and approve the first listings (Admin → Add a property → Approve listing) |
| 4 | **No real-money test yet.** The sandbox (test-mode) booking, cancellation, refund and payout flow was exercised on 11 Oct, but a controlled real-money transaction is still required by the launch standard (LAUNCH_READINESS.md). Includes the new payout timing (day after check-in). | After 1: one real booking, cancellation, refund and payout ([handover.md](handover.md) Step 4) |

**Should do before launch:** **production backups** (both Supabase projects are on the Free plan: no Supabase backups, no PITR; the nightly backup into fystaybackup ([production-database-backups.md](../production-database-backups.md), #52) is merged but **not running yet** - waits on the owner's one-time setup and a first verified run); contact addresses point at hello@ (owner, 16 Oct); Stripe business description: "Online marketplace for UK holiday accommodation. Guests book and pay through FYStay; hosts receive the booking amount less FYStay's commission of 8–15%."; payout timing: the day after check-in, the industry standard (owner, 3 Nov; had been 89 days after payment from 17 Oct, #56); retake the Connect platform profile as Stripe Support asked on 14 Oct (marketplace: FYStay collects payments, pays hosts by destination charges, FYStay responsible for negative balances), then retry one host onboarding (#55 merged 16 Oct) - send Stripe the request ID if it fails; final phone and desktop check once listings exist. Redeploys: choose the latest `claude/airbnb-competitor-1fjjpk` deployment - redeploying a PR branch's deployment as Production put unmerged code live twice on 13 Oct.

**Done 13 Oct (owner, confirmed):** database password rotated (Vercel + GitHub secret, health ok); Stripe sandbox key rolled (Preview only); Google sign-in fixed on www and consent screen published; Vercel production branch confirmed as `claude/airbnb-competitor-1fjjpk`; real email delivery proven; Stripe Identity activated; Connect onboarding live; owner's own ID check **verified** by Stripe (session `vs_1UQ6VxCgubLh6wuSBGPKXE9U`, document + matching selfie, `identity.verification_session.verified` at 14:18 UTC, webhook delivered; FYStay shows VERIFIED).

**Done 13 Oct (Google Maps, #49/#50):** `GOOGLE_MAPS_API_KEY` (server, Places API (New)), `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` (Maps JavaScript, website-restricted) and `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` set for Production and Preview. Verified live 21:33 UTC: suggestions for "Manchester" come from Google; the search page's security policy allows Google Maps. Google refusals are now logged with their reason (#50).

## PRs (13 Oct)

**Merged 13 Oct (later):** #47 payouts page auto-refresh · #48 short /privacy, /terms, /cookies links · #49 UK-wide search with Google Maps · #50 Google refusal logging.

**Merged and live 13 Oct:** #36 email verification · #37 identity retry cap · #38-#41 homepage, stay cards, booking-box sign-up link · #42 Now covering strip · #43 hero photos · #44 Liverpool and Manchester in Now covering · #45 Connect/Identity error handling and live status · #46 card_payments alongside transfers for host accounts.

**Open:** #7 trader-identity payment gate (waits on blocker 1) · #9 Spotlight overselling safeguard (owner review).

## PRs (12 Oct)

**Merged 12 Oct** (into `claude/airbnb-competitor-1fjjpk`, CI green):
[#8](https://github.com/fystay/fystay/pull/8) hosts confirm their email before connecting payouts ·
[#10](https://github.com/fystay/fystay/pull/10) date-change "payment unavailable" message ·
[#12](https://github.com/fystay/fystay/pull/12) checkout + privacy say the host sees the guest's email and phone once confirmed ·
[#13](https://github.com/fystay/fystay/pull/13) host guide explains how and when hosts get paid ·
[#14](https://github.com/fystay/fystay/pull/14) migration revoking API access to `rls_auto_enable()` (applied on Production 12 Oct, run 38284206307) ·
[#15](https://github.com/fystay/fystay/pull/15) admin nav landmark label.

**Open, waiting on the owner:**

| PR | What | Waiting on |
|---|---|---|
| [#7](https://github.com/fystay/fystay/pull/7) | Refuse new live payments until trader name + address are set (blocker 3) | Blocker 1 (legal entity) + approval. Merging closes live checkout until the two settings exist. |
| [#9](https://github.com/fystay/fystay/pull/9) | Spotlight: re-check capacity on payment; refund + email the host instead of overselling; 31-min payment pages | Approval: changes the live Stripe webhook and Spotlight payments |

**Release 12 Oct: live.** Release PR [#32](https://github.com/fystay/fystay/pull/32) (branch `claude/release-2026-10-12` at `bd9d389`, CI green: unit/typecheck/lint/build and browser tests) merged as `1c0eb6f` at ~17:30 UTC after migration run 38284206307 applied `20261012120000`-`170000`. #17, #25, #26, #27, #28, #29, #30 and #31 are all in it (heads verified in history); GitHub marked them merged. Post-deploy checks: see "Verified state".

**Merged 12 Oct (later):** #16, #18 (password show/hide), #19 (Google Places search), #20, #21, #22 (calendar re-sync before booking), #23 (hello@ sender), #24. Working branch now `d5ba58c`.

**Location search without a Google key (verified locally, no key set):** FYStay's own suggestions work: towns with stays or a destination page, curated landmarks, and stay names. Town and landmark searches return results by name and by a 5-mile area. **Unavailable until `GOOGLE_MAPS_API_KEY` is set** (server-side key, Places API (New) enabled, billing on, no referrer restriction): suggestions for any other place, postcode or address, and the place-details lookup (`/api/search/place` answers 503). A guest can't type a postcode and search; they pick a town or landmark instead.

## Checked 12 Oct, no change needed

- Placeholder content: none visible to guests or hosts (only an admin-page example and "Photo coming soon" image fallbacks).
- Trust signals: host badges ("Identity verified", ratings, review counts) come from real data; no hard-coded claims.
- Guest promo codes already need a confirmed email; booking itself doesn't.
- Fees: service-fee and cleaning-fee rows on receipts and summaries only appear for bookings made before the 11 Oct commission change; new bookings show no extra fees.

**Not to be done before blockers 1-2:** enabling live payments, publishing
legal details, or onboarding real hosts.

## Owner decisions still open

- Hosts can't cancel a confirmed booking themselves; support does it from `/admin/bookings`.
- Spotlight prices £15 / £25 / £45 (`src/lib/listingPromotions.ts`).
- Optional settings, only if wanted at launch: `PMS_ENCRYPTION_KEY` (property-management connections), Apple sign-in (`APPLE_*`), `EV_EXEC_NOTIFICATION_EMAIL` (trip-extra orders inbox).
- Branch `claude/admin-assisted-onboarding` (listing approval, unmerged, large): not a launch blocker unless chosen as the answer to blocker 4.

## Website polish from the 13 Nov audit

Audit method: local production build with the demo catalogue, 19 pages at desktop and phone size. Retracted after checking: the host fee wording (already follows the smart-pricing setting; only the Stripe business description still says 8-15%), the phone airport banner (a lazy-loading capture artifact), the cookie bar (already slim) and the footer (three short columns).

**Done (committed, 13 Nov):** star score shown only from 3 reviews (cards and booking box show "N reviews" below that); listing page loses the generic "Why book with FYStay" block, the card's repeated "message your host" line and the long account paragraph, and the booking heading is "Book this stay"; "no booking fees" said once in the search notice instead of under every card; host page about 19% shorter.

**Done (13 Nov, later):** one-line reason under the sign-up heading (guests and hosts see different lines). Corrected: the stay-page photo gallery already has a five-tile grid with "View all N photos" and a full viewer (arrows, keyboard, swipe), so no change is needed.

**Done (13 Nov, signed-in audit):** every guest, host and admin screen and the booking flow (stay, checkout, pay, confirmation, booking page) checked at desktop and phone size on a local build; all 141 browser tests pass. Fixed: Identity, Phone and Two-factor cards hidden when their service isn't configured (no "Not available yet" boxes; Verification tab goes with them); missing top padding on the notification and host-bio cards; cancellation policy no longer repeated at checkout; phone placeholder cut off on phones; town page hero text cut off mid-sentence, the false "No ticketed events found" line (shown whenever events aren't connected) and the empty "Near Your Stay" teaser removed; shorter About and Deals intros. Not a bug, confirmed: all pages have a visible h1.

**Verified 13 Nov (full QA sweep, local build with demo data):** 177 page loads (public, guest, host and admin routes at 390, 768 and 1280px): 0 HTTP errors, 0 horizontal overflow, 0 broken own-site images, exactly one h1 per page, no console errors apart from map tiles the test sandbox can't reach. Missing pages show "We can't find that page"; protected pages redirect to login and carry noindex; every sensitive API route and all cron routes answer 401 signed out; demo seeding refuses. Security headers present (nonce CSP, HSTS, frame deny, nosniff, referrer and permissions policies); `X-Powered-By` now off. robots.txt, sitemap (59 URLs), canonical, Open Graph and structured data present. A brand-new host can register, confirm, log in and lands on a clear three-step first screen. Not testable here: live Stripe, real email, Google sign-in, the live site itself. Found and fixed in the sweep: red error and "Cancel" text was 4.44:1 on the cream background (WCAG AA needs 4.5:1) in 33 places, now the darker red. Final result: 141/141 browser tests, 194 test files / 2,045 unit tests, typecheck and lint clean (4 old warnings). One test used a fixed email against a per-email reset limit and failed on reruns within 15 minutes; it now uses a fresh email.

**Competitor audit (13 Nov):** [competitor-audit-2026-11-13.md](../competitor-audit-2026-11-13.md) - six comparable sites, 12 ranked proposals. Held as proposals (launch mode): the five small ones are free-cancellation tags on cards, a three-line trust strip, this-weekend date chips, default check-in/out times and a New shelf.

**Done (13 Nov, owner asked "build the quick wins" after the competitor audit):** "Free cancellation up to N days before check-in" on search cards and in the stay page's booking card, shown only where the policy refunds in full (Flexible, Moderate, a Custom 100% policy; never Strict, Non-refundable or No refund) and, once dates are searched, only if check-in is far enough away; a three-line trust strip under the homepage search (full price shown, reviews only from guests who stayed, secure payment with Stripe); two Friday-to-Sunday "Weekend" chips in the homepage search that fill the dates; check-in/out times: no change needed - the host form defaults to 3pm/11am and the stay page shows them whenever stored (listings made without times, such as the Lodge import, show none until the host or admin sets them). Not built yet: a "New on FYStay" shelf (waits for real listings). Verified: 141/141 old browser tests, 3 new ones (e2e/quick-wins.spec.ts), 2,052 unit tests.

**Next, if wanted:** homepage rails once real listings exist (the deals rail is thin with demo data); town page length (see town-pages-restructure.md); a signed-in pass over host, guest and checkout screens, which the audit did not cover.

## OPTIONAL / POST-LAUNCH

- **Decision for you:** hosts can't cancel a confirmed booking themselves.
  Support (admin) does it from `/admin/bookings` and chooses the refund. Fine
  for a small launch; a host-side cancel flow needs a policy on refunds and
  penalties first.
- **Marketplace audit and roadmap (owner, 3 Nov):** gaps against Airbnb and Booking.com, a plan for easier host, admin and guest dashboards (grouped Menu instead of sideways rows), a pitch-readiness list and a weeks-to-months checklist: [marketplace-audit-2026-11-03.md](../marketplace-audit-2026-11-03.md). Awaiting the owner's go-ahead on the order of work.
- **Town pages restructure (owner, 2 Nov, later):** each `/destinations/<town>` page crams hero, listings, weather, events, itineraries and a 14-category guide into one long page. Plan: a short hub plus separate topic pages (things to do, eat, dog-friendly, beaches and walks, rainy day and so on) for SEO and speed, rolled out from Blackpool to all six towns. Plan and checklist: [town-pages-restructure.md](../town-pages-restructure.md). Not a launch blocker.
- Host terms page: add `/legal/host-terms` and require acceptance before
  publishing, once the draft in legal-drafts.md is approved.

- Twilio phone verification (`TWILIO_*`): code flow built and tested (#28, deployed); off in Production until the three settings are added.
- Ticketmaster events on destination pages (`TICKETMASTER_API_KEY`).
- Booking.com hotel affiliate. Credentials alone never switch it on: the code must also list it in `LIVE_HOTEL_PROVIDER_CODES`.
- PMS integrations: Cloudbeds is built, SiteMinder and SuperControl are stubs.
- Uptime monitoring: `.github/workflows/uptime-production.yml` checks `/` and `/api/health` every 30 minutes once merged (GitHub emails on failure). Backups: Supabase Free plan has none; #52 adds a nightly backup.
- A test-timezone tidy-up: the hotel deep link used the wrong day on UK summer time; fixed in [#31](https://github.com/fystay/fystay/pull/31) (open).

---

## Demo/test data audit (1 October 2026)

**Production database** (`wzatjhyfwtmxdxfmurkm`): clean.
- 1 user (a real GUEST account); no `@fystay.dev` demo accounts.
- 0 listings, 0 bookings, 0 reviews, 0 trip-extra providers or offerings, 0 promo codes.
- No admin yet (see runbook step 3).

**What still references demo data, and why it's safe:**
- `src/lib/demoSeed.ts` and `/api/admin/seed-demo-data` create the demo
  catalogue. The route refuses in Production unless `ALLOW_PRODUCTION_SEED=true`
  (never set it). Keep them for Preview and local development.
- Town cover photos in `public/images/listings/` are used only by demo seeding.
- The Preview database (`sqkpixwvugrxllrxlexs`) is full of demo data. That's
  intended; it never reaches Production.

**Before launch:** nothing to delete. Keep `ALLOW_PRODUCTION_SEED` unset.

## Integration audit (1 October 2026)

Every integration fails safely when its credentials are missing. None returns
a secret or link, and none treats an unconfigured service as success.

| Integration | Without credentials, Production… |
|---|---|
| Stripe checkout, change payments, trip extras | refuses: "payments aren't available" |
| Stripe deposits, identity, Connect onboarding/dashboard, webhooks | refuses (501/503 or redirect with an error) |
| Resend (email) | skips notifications; password reset gives the generic reply; email change is refused |
| 2FA | shows "not available"; enroll returns 503 |
| Twilio | shows "not available" |
| Google sign-in | button hidden, provider not registered |
| Supabase storage | uploads say "not configured" (Production **is** configured: buckets `listing-photos`, `avatars`) |
| PMS (Cloudbeds/SiteMinder/SuperControl) | connect fails with a clear error; webhooks fail closed |
| Hotel affiliate | mock provider never runs in Production; Booking.com needs code activation |
| Ticketmaster | no events shown |
| Sentry | no-op |
| Cron | requires `CRON_SECRET` (set, verified) |

## SEO / mobile / accessibility / admin audit (1 October 2026)

- **SEO:** every page has metadata. Search is noindexed, as are suspended
  listings. robots.txt blocks the private areas. Sitemap and canonical URLs
  are fixed for the trailing-slash base URL (`65bf640`). Structured data on
  home, listing, destination and help pages.
- **Mobile:** no horizontal overflow on the live pages checked at 390px
  (home, search, hotels, destination, host, travel extras, help, contact,
  admin listings). The empty-catalogue states read correctly.
- **Accessibility:** axe checks run in CI on home, search, listing,
  destination, login/register, account/bookings/wishlist and host dashboard.
- **Admin:** overview, bookings, users (suspend), **listings (suspend and
  reinstate, new in `0137da1`)**, promo codes, trip extras, hotel affiliate,
  disputes, review reports, support tickets, local data. The first admin is
  created with `npm run admin:grant` (new in `c546f0a`).

---

## Database connection pooling (investigated and fixed 2 Oct)

**Production fixed.** Production `DATABASE_URL` is the Supabase transaction pooler (6543) with
`?pgbouncer=true&connection_limit=5&pool_timeout=20` (was `connection_limit=1`), deployed in
`dpl_5wVMUCxWzkiQ9YnvYrS8a2rr1dPo`. Check: 35 concurrent requests (25 homepage + 10 search)
all returned 200, with no pool-timeout or database errors.

The database password was reset during the change. Production `DATABASE_URL`, `DIRECT_URL` and
the GitHub `production` secret `PROD_DIRECT_URL` were all updated to it. There was an outage of
about 30 minutes (old credentials) on 2 Oct, 08:00-08:32 UTC, while Production had no listings
or bookings.

**Still open:**
- **Preview** `DATABASE_URL` still has `connection_limit=1` (user `fystay_app`). Add the same
  suffix when convenient.

**Region moved to Dublin (2 Oct).** `vercel.json` now has `"regions": ["dub1"]` (`012ee79`), so
functions run next to the `eu-west-1` database instead of in `iad1` (Washington DC). It was verified on
Preview (`dpl_64wcAbxaPbggF24RU8bhJkBmEioA`), then deployed fresh to Production
(`dpl_9WJQUZfZfxCosrifsFdy6eio8JnY`). Every response's `x-vercel-id` shows `dub1` as the function region.

Measured from the test sandbox, which is in the US, so these times include a transatlantic hop to the client:

| | Before (`iad1`) | After (`dub1`) |
|---|---|---|
| `/api/health` database `latencyMs` | 418 | 11-26 warm (186 on the first, cold call) |
| `/` warm time to first byte | 1.31-1.46s | 0.34-0.41s |
| `/search` warm time to first byte | 0.21-0.44s | 0.27-0.33s |
| Pages that don't touch the database | 0.19-0.41s | 0.25-0.37s |
| Burst of 35 concurrent requests | avg 5.2s, max 7.4s | avg 2.7-2.9s, max 3.6s |

Every Production page checked returned 200: `/`, `/search`, `/login`, `/legal/terms`, `/legal/privacy` and
`/api/health`. There were no error or warning logs on Preview or Production, and no new Sentry issues. Across two
bursts, 1 of 35 requests in each never got a response at the client. The one with an error message
failed in the sandbox's outbound proxy during the TLS handshake (`SSL_ERROR_SYSCALL`). Vercel logged no
non-200 responses for the deployment. Guests in the UK should gain more
than these US-measured numbers show, but that wasn't measured.

## COMPLETE

| Item | Commit |
|---|---|
| Sentry error monitoring live in Production (browser + server + edge, source maps, releases); verified with a Preview test event | `c12c250` |
| Production deploy of the readiness batch (admin listings, base-URL fix, privacy processors, admin bootstrap, 2FA state, a11y CI fix), verified live, 2 Oct | `b225c38` (`dpl_AKEpMP9VuEpTJo9dzv7xZtZRSVBa`) |
| Password-reset guard verified live in Production (no link; guard log line present) | `4bc67b5`, kept in `b225c38` |
| Cron auth verified: real Vercel cron returned 200 with `CRON_SECRET`; spoofed header and wrong secret return 401 | `2341bf1`, kept in `b225c38` |
| Accessibility CI check made deterministic (fade-in race that failed CI on `4bc67b5`; real contrast 5.09:1, not a UI bug) | `4625d57` |
| Launch docs (this checklist, runbook, env reference, legal drafts) | `54480f9` |
| Admin listing moderation page | `0137da1` |
| Base URL trailing-slash normalisation (sitemap/canonical/email/Stripe links) | `65bf640` |
| Privacy policy names every data processor, conditional on configuration | `2d4ea9c` |
| Admin bootstrap script; 2FA "not available" state; sole-trader disclosure; configurable contact emails | `c546f0a` |
| Password-reset and email-change links never returned off local; trip extras never marked paid without Stripe (deployed) | `4bc67b5` |
| Demo cover-photo retrofit route removed | `774a7a8` |
| Stay dates stored as calendar dates; data migration run in Production | `a2401df` |
| Cron authenticated with `CRON_SECRET` (verified with a real Vercel cron run) | `2341bf1` |
| 2FA attempt rate limit | `6ce0201` |
| Host-entered email content escaped | `5d84ef5` |
| Malformed JSON gives 400 on all body-parsing routes | `6ec6503` |
| Suspended listings removed from sitemap; robots.txt blocks private areas | `e0acb77` |
| Fixed-locale dates; mobile host dashboard | `7c53cd7` |
| Late-payment, double-booking and change-extension fixes; checkout session expiry | `c921936`, `db91e28` |
| Public API no longer returns private listing fields; guests can become hosts | earlier phase-5 commits |
