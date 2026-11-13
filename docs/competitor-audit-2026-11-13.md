# Competitor audit (13 Nov 2026)

Purpose: see how comparable stay sites present themselves and pick what suits FYStay: a small, local, trust-first marketplace in launch mode (no new features unless the owner asks or it is a launch blocker).

## What was looked at, and the limits

Live pages, fetched 13 Nov: Sykes Holiday Cottages (home, one property), cottages.com (home, one property), Canopy & Stars (home), Unique Homestays (home), Airbnb UK (home), Vrbo (home; the sandbox was sent to the Canadian site, so prices are Canadian stays but the layout is what matters).

Not covered: Booking.com (blocks scraping), anything behind a login, the real checkout of any competitor (so how their fees and deposits show at payment is unchecked), and how any site performs. Competitor claims below are what their pages say, not verified.

## What nearly all of them do

| Pattern | Who | FYStay today |
|---|---|---|
| A short trust strip under the search box (secure payment, support, "flexible cancellation") | Sykes, cottages.com, Canopy & Stars | None on the homepage |
| A visible low deposit to book (Sykes £20, cottages.com £25, Canopy 25%) | Sykes, cottages.com, Canopy & Stars | Full payment at checkout |
| "Flexible cancellation" promoted as a headline and a filter | Sykes, cottages.com | Policy shown on the stay page and checkout; not on search cards |
| Themed collections (dog-friendly, hot tubs, couples, large groups, half term, Christmas) | All four UK sites | Filters exist; no landing pages |
| Seasonal and "available this weekend" entry points with dates already filled in | Airbnb ("Available this weekend"), Canopy ("November availability"), Unique (half term, New Year) | Last-minute deals page only |
| Total price when dates are set (£260 total) | Airbnb, Vrbo ("includes taxes & fees") | Per night, and total once dates are chosen |
| "Newly added" shelf | cottages.com, Canopy | A "New" tag on cards |
| "Every place is checked/inspected by us" | Canopy, Unique, cottages.com | Not stated |
| Awards badges ("Customers' Choice", "Guest favourite") | cottages.com, Airbnb | None (correctly: not enough reviews) |
| Owner replies to reviews, owner named in reviews | Sykes | Built (host review responses) |
| Long SEO text blocks under the page | Sykes, cottages.com, Airbnb link lists | None (keep it that way) |
| Newsletter with a prize draw, apps, loyalty schemes, gift cards, podcasts | Sykes, cottages.com, Canopy | None |

## Where FYStay is already ahead or equal

- One honest price with no booking fees. The big sites often show "from" prices that move once dates and fees are added.
- Direct messaging with the host, host replies to reviews, and reviews only from completed stays.
- A local guide per town, walking distances to landmarks and a stay-level "getting around" block. Sykes and cottages.com have a paragraph of area text; FYStay has real distances.
- A cleaner, shorter page than any of them (cottages.com's property page is a long scroll with no price or cancellation near the button).

## Proposals, ranked

Launch fit: **A** = small, uses data we already have, makes no new claim; **B** = needs content or a decision first; **C** = after launch.

1. **"Free cancellation" tag on search cards and the stay-page header** (A). The cancellation policy already exists per stay. Airbnb, Booking.com, Sykes and cottages.com all lead with it because it is the main reason people book. Only show it when the policy really allows a full refund (Flexible), with the date ("until 5 days before"). Effort: small.
2. **One-line trust strip under the homepage search** (A). Three short, true statements: "Full price shown before you pay", "Reviews only from guests who stayed", "Secure payment with Stripe". No icons wall, no counters, no "1 million customers". Effort: small.
3. **"This weekend" and "Next weekend" chips beside the search box** (A). They open search with the dates filled in, and show only stays that really are free. It is the honest version of Airbnb's and Canopy's date shortcuts and suits a small catalogue. Effort: small to medium.
4. **Check-in and check-out times always shown** (A). Sykes lists "Check-in / Check-out: 16:00 / 10:00". FYStay shows them only if the host filled them in; default to 3pm / 11am in the listing form and show them in "Good to know". Effort: small.
5. **A "New on FYStay" shelf on the homepage** (A, after the first real listings exist). Honest and useful for a young marketplace. Effort: small.
6. **"Browse by" chips (Dog-friendly, Hot tub, Sea view, Sleeps 6+)** (B, once there are about 10 stays). These are filtered searches; add them when each has results. Effort: small.
7. **"Every listing is reviewed by FYStay before it goes live"** (B, owner decision). Canopy, Unique and cottages.com all use a checked-by-us claim. FYStay has an approval step (admin Approve listing, listing review events). The claim is only allowed if that is true for every live listing; "personally inspected" is not, unless the owner visits. Needs the owner to confirm the practice.
8. **A promised reply time for support** (B, owner decision). Sykes and cottages.com say 24/7. FYStay can't. Something true and specific ("We reply to hello@ within one working day") beats vague help text, but only if the owner can keep it.
9. **Low deposit or pay-in-instalments** (C). The biggest conversion lever in UK holiday lets, since holidays are booked months ahead. It changes payments, payout timing, cancellations and refunds, so it needs a policy decision, solicitor input and a Stripe design. Not before launch.
10. **Flexible-date search ("any weekend in December")** (C). Already on the 3 Nov roadmap; Canopy and Airbnb both have it.
11. **Theme landing pages for search engines (dog-friendly stays in Blackpool, and so on)** (C). Good for search traffic, thin until there are real listings.
12. **Gift cards, loyalty, an app, a prize-draw newsletter** (C, probably never at this size). They need legal and financial setup and add noise.

## Do not copy

- "Over 25,000 places", "1 million customers", "30 years": FYStay has none of these, and the launch rules ban fake or misleading trust claims.
- "Customers' Choice" or "Guest favourite" badges before enough real reviews exist.
- Urgency language ("only 1 left", countdowns).
- Long SEO paragraphs and link walls; the owner wants less writing, not more.
- "From" prices without a stated basis.

## Notes for the solicitor review

Total-price display (no hidden fees) is both a strength and, in the UK, increasingly an expectation in consumer law; worth confirming with the solicitor that the current "no booking fees" wording, the fee comparison on /host and any "reviewed by FYStay" claim are all safe.
