
# Zero-Downtime Setup Plan

Goal: get the new portal fully wired to your existing Stripe account **without touching anything your 18 current members rely on**. Nothing here cancels, migrates, or emails them. The old Circle keeps running exactly as-is until *you* decide to flip the switch.

## Guiding rules

- **No member-facing changes** until you say go. We don't email the 18, don't cancel anything in Stripe, don't change their existing subscriptions.
- **Webhook is additive.** Adding a webhook endpoint in Stripe just means Stripe also notifies the new portal when things happen. It does not affect Circle or your members.
- **New price is separate.** `price_1TDR3aJdDAUSVXbNPYG3DK9Y` is only used for *new* signups through the new portal. Existing members stay on their existing prices forever (unless you choose to migrate later).

---

## Step 1 — Save the new price ID (I do this)

Set `VITE_STRIPE_NEW_PRICE_ID=price_1TDR3aJdDAUSVXbNPYG3DK9Y` in `.env.development` and `.env.production`. The `/join` page will use it for new signups. No effect on existing members.

## Step 2 — Add the webhook endpoint in Stripe (you do this)

In Stripe Dashboard → Developers → Webhooks → **Add endpoint**:

- **URL:** `https://circle-reborn-portal.lovable.app/api/public/payments/webhook`
- **Events to send:**
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- After creating it, click **Reveal signing secret** → copy the `whsec_...` value
- Paste it into the `STRIPE_WEBHOOK_SECRET` secret in Lovable (replacing the placeholder)

Why this is safe: this is a *new* endpoint. Your existing Circle webhook (if any) keeps receiving the same events independently. Stripe fans out to all endpoints.

## Step 3 — Backfill your 18 members into `pending_claims` (you click a button)

Once the webhook secret is in, sign in to the new portal, make sure your account has the `admin` role, then visit `/portal/admin/backfill`. Click **Run backfill**.

What it does: pulls every active subscription from your Stripe account and stages them in a `pending_claims` table keyed by email. **It does not email anyone, does not change Stripe, does not create user accounts.** It's a private staging table only you can see.

## Step 4 — Smoke test with your own account (you do this)

1. Sign up at `/join` with a throwaway email using a Stripe **test card** (we'll temporarily flip the publishable key to test mode for this, then flip back). Or skip and just verify the claim flow:
2. Sign up with one of the 18 members' emails *that you own* (or yours if you're one of them) — the auto-claim should link your new portal account to the existing Stripe subscription. You should see active membership in `/portal` without any new charge.

If anything looks off, we fix it here — still zero impact on the other members or Circle.

## Step 5 — Park here until you're ready to launch (no action)

The new portal is fully functional but **nobody knows about it**. Circle keeps running. Members keep paying. You can sit at this state for days, weeks, months.

## Step 6 — Launch day (later, your call)

When you're ready:
1. Email the 18 members: "We've moved to a new portal. Sign up at [URL] using **the same email** as your Stripe billing — your membership will link automatically. No new payment needed."
2. Once they've all claimed, shut down Circle on your timeline.
3. Optional later: migrate them onto the new price ID via Stripe (one-click per sub, or scripted) — only if you want them on the new SKU. Otherwise leave them grandfathered forever.

---

## What could break existing members? (answer: nothing in steps 1–5)

| Action | Touches existing subs? |
|---|---|
| Set env var with new price ID | No |
| Add new webhook endpoint in Stripe | No (additive) |
| Backfill (read-only Stripe API + insert into our DB) | No |
| Member signs up at new `/join` | Creates a new sub — only happens for *new* people you invite |
| Member claims existing sub | No Stripe change, just links our DB row to their new login |

The only step that ever modifies a member's Stripe subscription is the optional Step 6 migration, and that's entirely your call.

---

## Technical notes

- `/api/public/*` is unauthenticated by design (Stripe can't send a JWT). Security comes from the Stripe signature check in `verifyWebhook`.
- The `subscriptions.user_id` column is nullable so the webhook can stage rows for emails that haven't signed up yet — they get linked on first login via `claimMyPendingSubscription`.
- `GRANDFATHERED_PRICE_IDS` in `stripe.server.ts` already includes your three existing price IDs — they're recognized as valid memberships.
- No Circle API calls anywhere in this app. We don't talk to Circle at all; we only read your Stripe.

Tell me when Step 2 is done (webhook added + secret pasted) and I'll walk you through Step 3.
