# FYStay marketplace audit (3 Nov 2026)

Owner's brief: audit the site against Airbnb and Booking.com (remembering FYStay is its own, smaller, more personal marketplace), list what is missing as a checklist to work through over the next few weeks and months, and say how to make the host, admin and guest areas easier to use. The goal is a site that looks and works well enough to pitch to a host ("I could list here") and to win a booking over one listing among millions on Airbnb.

How this was done: the page and component code was read, every route was listed (80 pages), and the host, admin and account areas were opened on a phone-size screen against a local copy with demo data (21 demo listings, 70 demo bookings - not what Production holds). Comparisons with Airbnb and Booking.com are from general knowledge of those sites, not checked live today. Where a feature is called "missing" the code was searched for it and nothing was found.

## 1. Verdict

The foundations are stronger than most marketplaces at this stage: the booking and payment engine, host payouts, trust tools and local content are all real. What stops it feeling like a finished product is mostly **navigation and polish on the logged-in side**, **thin content**, and a handful of **expected marketplace features** that guests and hosts will look for. None of the gaps needs a rebuild.

Priority order:
1. Launch cleanliness: remove demo and generic listings, get real listings with real photos, finish the launch blockers already on the master checklist.
2. Make the host area and the admin area easy to use on a phone (section 3).
3. Fill the few expected features guests and hosts will notice are missing (section 2, "First month").
4. Then differentiate: the local guide, direct-contact feel, honest pricing.

## 2. What exists, and what is missing

### Already there (checked in the code)
- **Guests:** search with filters, map view, Google Places location search, instant book and request to book, weekend rates, weekly and monthly discounts, last-minute deals, five cancellation policies, security deposit and cleaning fee, promo codes, referrals, wishlist, reviews, messaging, receipts, date-change requests, multi-currency display, a local guide for every town, airport transfers, hotel search (affiliate).
- **Hosts:** listing editor with completeness score, calendar, bookings with action states, earnings, Stripe Connect payouts, iCal import and export, a channel-manager integration (Cloudbeds), paid Spotlight promotion, smart pricing (off, shadow mode), identity verification.
- **Platform:** email verification, two-factor sign-in, Stripe Identity, support tickets, disputes, review reports, admin listing import, sitemap and structured data, installable-app manifest, legal pages.

### Missing or weak (searched for, not found)

Effort: S = a day or less, M = a few days, L = a week or more. When: **Pre-launch**, **First month** (after launch), **Quarter** (months 2-3), **Later**.

| Area | Gap | Why it matters | Effort | When |
|---|---|---|---|---|
| Content | Demo and generic listings and example hosts still in the seed data | A pitch built on obviously fake stays loses trust at once | S | Pre-launch |
| Content | Real listings with real photos (and the Lodge on the Lake as the showpiece) | The product is the listings | - | Pre-launch |
| Content | Town topic pages are thin (about 3 hand-written entries per category) | Most will stay out of search until written up | M per town | First month |
| Trust | Host public profile page (photo, about, all their stays, response time) | Airbnb and Booking.com both show who you are booking from; it is the big advantage for a personal marketplace | M | First month |
| Trust | Honest badges: "Identity verified" exists; add "Responds within X" and, later, "Top rated" computed from real reviews only | Social proof without invented claims | S | First month |
| Guest | Notification settings (what emails and texts to receive) | Expected on every account page | S-M | First month |
| Guest | Several named wishlists, shareable | Trip planning with a partner or friends | M | Quarter |
| Guest | Saved searches and price or availability alerts | Brings people back | M | Quarter |
| Guest | Search by flexible dates ("any weekend in December") | Airbnb and Booking.com both have it | M | Quarter |
| Guest | Pay later or in instalments | Large bookings convert better; needs a Stripe feature decision | M | Later |
| Guest | Languages | Probably not needed for a UK coast launch | L | Later |
| Host | Message templates and quick replies | Saves a host time on every enquiry | S-M | First month |
| Host | Performance insights (views, conversion, search position) | Hosts ask "why am I not getting bookings" | M | Quarter |
| Host | Co-host or team access | Needed by hosts with a cleaner or manager | M | Quarter |
| Host | Payout and earnings statements for tax (downloadable) | Hosts expect it at year end | S-M | Quarter |
| Host | "Why list with FYStay" pitch page with a fee calculator against what they pay elsewhere | Directly serves the goal of recruiting hosts | M | Pre-launch |
| Platform | Monitoring of failed emails and webhooks in one admin view | Support and money safety | M | First month |
| Platform | Working nightly database backup | Launch blocker already recorded | S | Pre-launch |
| Growth | Reviews prompting after stay (the email exists) tuned and tested end to end | Reviews are the product's trust | S | First month |
| Design | Search results still use the arch frame while the homepage uses square cards | Inconsistent look | S | Decide (see section 5) |

## 3. Making the dashboards easy to use

### What the screens showed
- **Host (phone):** a good base - a five-tab bottom bar (Today, Bookings, Calendar, Earnings, Listings) - but a second, sideways-scrolling row sits at the top (Messages, Payouts, Channels, Spotlight) and is cut off at the right edge ("S..."). The account menu repeats some of the same links. On the Listings page each card carries a toggle plus Edit, Calendar, Reviews, View and a red Delete, all visible at once. The Today screen opens with a large "finish setting up" card that pushes the real work below the fold.
- **Admin (phone):** 13 tabs in one sideways-scrolling row, repeated at the top of every admin page, with no grouping. Hard to find a section without swiping, and the bottom of the screen has no navigation at all.
- **Guest account:** one long page of 9 stacked cards (profile, email, identity, phone, two-factor, sign-in methods, sessions, privacy). The account menu itself is fine.

### Proposal: group everything, show only what is needed

**Host: five tabs plus a grouped Menu**
- Bottom bar: **Today · Bookings · Calendar · Messages · Menu**. Messages gets the unread badge it deserves.
- **Menu** opens a full-height sheet with sections, not a row to swipe:
  - *Your business:* Listings, Earnings, Payouts
  - *Grow:* Spotlight, Channels (calendar sync), Smart pricing
  - *Account:* Settings, Security, Identity verification, Help, Switch to travelling, Log out
- Remove the top sideways row entirely.
- **Listing cards:** one clear "Edit" button plus a "..." menu holding Calendar, Reviews, View live, Pause and Delete (Delete asks to confirm).
- **Today:** needs-attention items first; the "finish setting up" checklist collapses to one line with a progress bar once started, and is dismissible.
- Same URLs as today, so nothing is lost and no redirects are needed.

**Admin: a grouped menu and a section dropdown**
- On a phone, a **Menu** button at the top opens a grouped list, and the current page's name shows as a dropdown title (for example "Bookings v"):
  - *Operations:* Bookings, Disputes, Support tickets, Review reports
  - *Catalogue:* Listings, Add a property, Users
  - *Revenue and growth:* Promo codes, Spotlight, Trip extras, Hotel affiliate
  - *System:* Local data
- On desktop the same groups become a left sidebar.
- The Overview becomes an action list: counts of open disputes, new tickets, reported reviews and listings waiting for approval, each a tap away, above the money figures.

**Guest: a simple account hub**
- Account becomes a list of rows, each opening its own page, the way Airbnb does it: *Personal details, Login and security (password, two-factor, devices), Identity and phone, Notifications, Privacy and data.*
- Bookings gets Upcoming, Past and Cancelled tabs.
- The account menu stays as it is, with Help added.

Effort: host navigation M (about 2 days), admin navigation S-M (1 day), account hub M (2 days), listing card menu S. Work in this order: host, admin, guest. Every change is layout only; no data or URL changes.

## 4. Pitch readiness: "this looks like a proper website, I could list here"

- [ ] Clear out demo and generic listings, example hosts and example reviews; keep Preview-only example data clearly labelled.
- [ ] 6-10 real listings with real photography and honest descriptions, the Lodge on the Lake first.
- [ ] A "Why list with FYStay" page: how bookings and payouts work, what a host earns on a sample booking, what guests see, how to get started in five steps. Quote competitor fees only after checking their current published rates.
- [ ] The host sign-up and first-listing flow tested start to finish on a phone by someone who has never used it.
- [ ] Host profile pages, so a guest sees a real person.
- [ ] No placeholder text, dead links, empty rows or broken layouts on any public page (full pass on phone and desktop).
- [ ] Real emails checked: confirmation, host notice, reminder, review request, cancellation.
- [ ] Legal entity details published once the company is confirmed (PR #7 stays unmerged until then).
- [ ] Speed check (Lighthouse on a phone profile) on homepage, search, listing and a town page.

## 5. Decisions for the owner

1. **Arch-shaped cards on search results:** the homepage now uses square cards; results still use the arch. Make them match, or keep the arch for results only?
2. **Order of work:** my suggestion is dashboard navigation first (it is what a prospective host sees), then host profile pages, then the pitch page.
3. **Pay later or instalments:** worth the Stripe set-up and fees, or skip until there is demand?

## 6. Checklist to work through

Decisions (3 Nov): square cards on results (done); order of work is dashboards, then host profile pages, then the pitch page; pay later is skipped until there is demand.

Also fixed on the way (found by a new test): the cookie notice covered the host's bottom tabs and a listing's "Add dates" bar on a first phone visit. It now sits above them.

**Weeks 1-2 (before launch)**
- [ ] Remove demo and generic listings and example data from anything real people can see
- [ ] Real listings and photos in
- [ ] Backups working (launch blocker), then re-enable the nightly schedule
- [x] Host navigation: five tabs plus grouped Menu; remove the sideways row (built 3 Nov, Preview)
- [x] Listing cards: Edit plus "More" menu (built 3 Nov, Preview)
- [x] Admin navigation: grouped menu and section dropdown (built 3 Nov, Preview). Still to do: the action-first Overview (counts of open disputes, tickets, reports)
- [ ] "Why list with FYStay" page
- [ ] Phone and desktop QA pass on every public page

**Weeks 3-6 (first month after launch)**
- [x] Account page grouped into four sections with a sticky jump bar (built 3 Nov, Preview; kept as one page so Google linking, identity return and email confirmation still work). Still to do: Notification settings
- [ ] Host public profile page; "responds within" badge
- [ ] Message templates and quick replies
- [ ] Admin monitoring view for failed emails and webhooks
- [ ] Review-request email tested end to end
- [ ] Written content for the town topic pages, town by town
- [x] Arch frame on results replaced with the square card, matching the homepage (owner decision 3 Nov)

**Months 2-3**
- [ ] Host performance insights
- [ ] Named, shareable wishlists
- [ ] Saved searches and alerts
- [ ] Flexible-date search
- [ ] Co-host access
- [ ] Downloadable payout and earnings statements

**Later**
- [ ] Pay later or instalments
- [ ] Languages
- [ ] Anything customers ask for once real bookings are coming in
