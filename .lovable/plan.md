# Phase 3 Plan — Existing Stripe + Member Claim Flow

## Context

You have a live Stripe account with 18 paying members on Contractor Circle. We need to:
1. Connect to **your** Stripe account (not the Lovable-managed sandbox we set up earlier)
2. Let those 18 members claim portal access without disrupting their subscriptions
3. Create a new product/price for new signups so the existing 18 stay grandfathered on their current price

## What changes from what we already built

The webhook handler, `subscriptions` table, `members` table, and embedded checkout component all stay — the data shapes are identical. What changes:

- **Stripe credentials**: Switch from Lovable-managed `STRIPE_SANDBOX_API_KEY` / `STRIPE_LIVE_API_KEY` to your own `STRIPE_SECRET_KEY` + `STRIPE_PUBLISHABLE_KEY` + `STRIPE_WEBHOOK_SECRET`. The `createStripeClient` helper gets simplified to use the real Stripe SDK directly with your keys (no more gateway proxy).
- **Webhook URL**: You'll add a new endpoint in your Stripe dashboard pointing at `https://circle-reborn-portal.lovable.app/api/public/payments/webhook`. We drop the `?env=` switching since there's only one account.
- **Product/price IDs**: We stop using `lookup_keys`. The webhook will store the raw Stripe price ID (e.g. `price_abc123`) — both the grandfathered $497 price and the new $497 price coexist cleanly.
- **No more sandbox/live banner**: One environment, one set of keys. The `PaymentTestModeBanner` gets removed.

## Step 1 — Collect your Stripe credentials

I'll request three secrets via the secure secrets form:
- `STRIPE_SECRET_KEY` — `sk_live_...` from your Stripe dashboard → Developers → API keys
- `STRIPE_PUBLISHABLE_KEY` — `pk_live_...` from the same page
- `STRIPE_WEBHOOK_SECRET` — created in Step 4 below; you'll add it after the webhook endpoint exists

You'll also tell me:
- The **existing $497 price ID** (e.g. `price_1Abc...`) — for the grandfathered members
- Whether you want the new $497 price on a **new product** ("Contractor Circle Membership 2026") or as a second price under your existing product

## Step 2 — Create the new $497 price for new signups

Done directly in your Stripe dashboard (or I can give you a one-time script). New signups will check out against this new price ID. Existing 18 stay on the old price ID forever — Stripe doesn't migrate them.

## Step 3 — Rewire the Stripe code to BYOK

- `src/lib/stripe.server.ts` — replace gateway proxy with `new Stripe(process.env.STRIPE_SECRET_KEY)`. Remove `StripeEnv` type, `getConnectionApiKey`, gateway URL.
- `src/lib/stripe.ts` — read `VITE_STRIPE_PUBLISHABLE_KEY` instead of `VITE_PAYMENTS_CLIENT_TOKEN`. Remove `getStripeEnvironment`.
- `src/lib/payments.functions.ts` — drop `environment` from inputs. `createCheckoutSession` takes a raw Stripe `priceId` (`price_xxx`), not a lookup key.
- `src/routes/api/public/payments/webhook.ts` — single Stripe client, single webhook secret, no `?env=` query param.
- `src/components/stripe-embedded-checkout.tsx` — drop env prop.
- Delete `src/components/payment-test-mode-banner.tsx` and its usages.
- Remove `.env.production` Stripe vars; add `VITE_STRIPE_PUBLISHABLE_KEY` to `.env`.

We delete the `environment` column from `subscriptions` (or just stop writing to it).

## Step 4 — Register the webhook in your Stripe dashboard

In Stripe → Developers → Webhooks → Add endpoint:
- URL: `https://circle-reborn-portal.lovable.app/api/public/payments/webhook`
- Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`

Copy the signing secret (`whsec_...`) and paste it into the `STRIPE_WEBHOOK_SECRET` form from Step 1.

## Step 5 — Backfill the 18 existing subscriptions

One-time admin server function (`/api/admin/backfill-subscriptions`, admin-only) that:
1. Lists all active subscriptions in your Stripe account
2. For each: writes a row into `subscriptions` (with `user_id = NULL` until claimed) and stages a row in a new `pending_claims` table keyed by `stripe_customer_id` + `email`

After this runs, you have 18 unclaimed records waiting in the database.

## Step 6 — Self-serve claim flow

New flow: existing member visits `/login` → enters the email used in Stripe → signs up (or logs in) → on first successful auth, a server function `claimExistingSubscription` runs:

1. Looks up `pending_claims` by `email = auth.user.email`
2. If found: updates the matching `subscriptions` row's `user_id` to the new auth user, populates `members` with the right `stripe_customer_id` / `stripe_subscription_id` / `status = 'active'` / `plan = 'grandfathered_497'`, deletes the `pending_claims` row
3. If not found: standard new-member flow (redirect to `/join` for checkout against the new price)

A small banner on `/portal` after claim: "Welcome back — your $497 membership is active. Manage billing →" linking to the Stripe Customer Portal.

## Step 7 — Email the 18 members

I'll draft a short email you can send (from your tool of choice) telling them:
- The portal is live at `circle-reborn-portal.lovable.app`
- Sign up with the same email they pay with
- Their subscription is untouched

## Technical details

**New table**:
```sql
create table public.pending_claims (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  stripe_customer_id text not null unique,
  stripe_subscription_id text not null unique,
  price_id text not null,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz default now()
);
-- RLS: admins only; the claim server function uses service role
create index idx_pending_claims_email on public.pending_claims(lower(email));
```

**Claim trigger point**: in `src/integrations/supabase/auth-middleware.ts` (or a post-login hook on `/portal` first load), call `claimExistingSubscription` once per session.

**Grandfathered price detection**: `members.plan` gets set to either `'grandfathered_497'` or `'standard_497'` based on which `price_id` the subscription points to. UI can show a small "Founding member" badge for grandfathered.

**Customer Portal**: `createPortalSession` already exists — works unchanged with BYOK keys. Both grandfathered and new members use it for billing self-service.

## Out of scope (unchanged from prior phases)

- Replays, templates, announcements UI is already built and works
- ConstructLine routes already exist
- Lead magnets at `/q2`, `/estimating`, `/silos` are unchanged

## Risks / things to confirm

- **Existing webhook**: if your live Stripe account already sends webhooks somewhere (your old portal?), we should leave that one alone and just add a second endpoint. Stripe supports multiple endpoints per event.
- **Email match is case-sensitive in Stripe but auth.users normalizes**: the claim query lowercases both sides.
- **What if someone signs up with a different email than they pay with?** They get the new-member checkout flow. They can email you to manually link — or we can add an admin "link this user to this Stripe customer" tool later.
