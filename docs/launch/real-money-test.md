# Real-money test: one booking, one cancellation, one payout

Owner-run. Claude can't do this step: it needs a real card and live Stripe.
Do it once, after the trading name and address are published and the first
listing is approved. Allow about 30 minutes, plus the payout a day after check-in.

Keep the booking small (a cheap listing, one night). Note the booking reference
at every step.

## Before you start (check each)

- [ ] Trading name and address live on the site footer and terms.
- [ ] One listing published and approved (Admin → Properties → Approve).
- [ ] The host account for that listing has Stripe payouts and identity verified.
- [ ] Stripe live mode: webhooks show "enabled" for both endpoints.
- [ ] `https://www.fystay.co.uk/api/health` shows `"status":"ok"`.

## 1. Book (guest)

1. Sign in as a guest who is not the host.
2. Open the listing, pick dates, choose Reserve.
3. Confirm the details, tick the cancellation policy, pay with your own card.
4. Expected: "Booking confirmed" page; the total matches the listing price exactly,
   with no extra booking fee.

## 2. Check the money (Stripe dashboard, live mode)

- [ ] Payments: one charge for the booking total, status succeeded.
- [ ] Connect: a transfer to the host's connected account for the host's share.
- [ ] FYStay's commission equals the rate on /host (10% unless smart pricing).

## 3. Check the emails (guest and host)

- [ ] Guest: booking confirmation arrives, not in spam.
- [ ] Host: new booking email arrives, with guest contact details.

## 4. Cancel and refund (guest, then check)

1. Open My trips → the booking → Cancel booking.
2. Expected refund matches the policy shown at booking (for Flexible
   or Moderate, a full refund if cancelled early enough).
3. Stripe: a refund for the right amount; the host transfer is reversed by the
   same proportion.
4. Guest and host each get a cancellation email.

## 5. Payout (the day after check-in)

Only for a booking that is not cancelled. Use a second test booking
for this, with check-in in the past or set by the admin.

- [ ] Host dashboard → Payouts: the amount is shown as paid or scheduled.
- [ ] Stripe: a payout to the host's bank the day after check-in.

## If something is wrong

- Stop. Don't repeat the payment.
- Note the booking reference and the Stripe request ID shown on the error.
- Tell Claude; include those two things and what you saw.

## When it's done

Tell Claude the booking reference and which boxes passed. Claude will record it
in the master checklist and clear the last launch blocker.
