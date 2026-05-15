# Rebuild Supabase Bootstrap

Created: 2026-05-15

## Project

The isolated Supabase project for the Vercel rebuild is:

- project ref: `eybiraytbghrfbldikhn`
- project URL: `https://eybiraytbghrfbldikhn.supabase.co`

The active Manus portal remains on:

- project ref: `qqbwiuqaqjtbvxkvqplo`
- project URL: `https://qqbwiuqaqjtbvxkvqplo.supabase.co`

Do not point Manus at the rebuild project yet.

## GitHub Integration

Use the GitHub repository:

```text
mwilkinson82/circle-reborn-portal
```

Use working directory:

```text
.
```

because the `supabase/` directory is at the repository root.

Recommended safety settings before first migration run:

- connect only this rebuild repo,
- do not connect the active Manus project/repo,
- keep preview/branch automation enabled only if desired,
- avoid automatic production migration runs until the migration stack has been
  applied once and verified on the isolated project.

## Repo Pointer

`supabase/config.toml` should point to:

```toml
project_id = "eybiraytbghrfbldikhn"
```

## Vercel Environment Variables

Update the Vercel `circle-reborn-portal` project production env vars to use the
new rebuild Supabase project:

```text
SUPABASE_URL=https://eybiraytbghrfbldikhn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<new project service role key>
SUPABASE_PUBLISHABLE_KEY=<new project publishable key>
VITE_SUPABASE_URL=https://eybiraytbghrfbldikhn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<new project publishable key>
VITE_SUPABASE_PROJECT_ID=eybiraytbghrfbldikhn
```

Do not change the active Manus portal env vars during this step.

## First Verification Queries

After migrations/seeds apply to the isolated project, verify:

```sql
select
  (select count(*) from public.templates) as templates,
  (select count(*) from public.replays) as replays,
  (select count(*) from public.bootcamp_sessions) as bootcamp_sessions,
  (select count(*) from public.members) as members;
```

Expected catalog baseline after the full seed:

```text
templates = 35
replays = 12
```

Then verify RLS is enabled on key portal tables:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'members',
    'subscriptions',
    'pending_claims',
    'templates',
    'replays',
    'call_prep_packets',
    'bootcamp_sessions',
    'bootcamp_questions',
    'intensive_applications'
  )
order by tablename;
```

## Before Vercel Cutover

- Add the active member roster intentionally.
- Confirm admin access.
- Confirm one active test member can enter the portal.
- Confirm one non-member is blocked.
- Run the authenticated portal smoke test.

## Bootstrap Applied

Applied to `eybiraytbghrfbldikhn` on 2026-05-15 through the Supabase connector:

- `bootstrap_rebuild_portal_schema`
- `seed_rebuild_library_catalog`
- `add_rebuild_fk_indexes`
- `restore_has_active_subscription_grant`
- `add_pending_claim_metadata`

Note: the local shell did not have a Supabase access token, so the initial
isolated-project bootstrap was applied through the Supabase connector instead of
`supabase db push`. Do not enable automated Supabase GitHub/CLI migrations for
this project until the remote migration history is reconciled with the checked-in
migration folder.

Verified after bootstrap:

- `templates = 35`
- `replays = 12`
- `bootcamp_sessions = 1`
- `members = 0`
- `intensive_applications = 0`
- `authenticated` can execute `public.has_active_subscription(uuid)`
- Manus/live-project template URL references = `0`

## Member Bootstrap Applied

Applied the active member CSV `members_20260515_174345.csv` to
`eybiraytbghrfbldikhn` on 2026-05-15 as a one-time data import, not a
checked-in PII migration.

Verified after import:

- `pending_claims = 30`
- imported `pending_claims = 30`
- `subscriptions = 19`
- imported `subscriptions = 19`
- `members = 0`
- comped pending claims = `11`
- Stripe-linked pending claims = `19`
- comped claims with active `stripe_customer_id` = `0`

Owner-confirmed comped members whose CSV rows contained legacy Stripe customer
IDs were imported without active Stripe billing links. The legacy customer IDs
were preserved only in `pending_claims.metadata`.

One CSV row was skipped because it had no email address to match against
Supabase Auth.

Do not update Vercel production Supabase env vars until member/admin access has
been intentionally bootstrapped and smoke tested.
