# Manus Exit Cutover Plan

Created: 2026-05-15

## Current Reality

- The active Manus Contractor Circle portal is still live.
- Manus production was confirmed to use Supabase project
  `qqbwiuqaqjtbvxkvqplo` (`https://qqbwiuqaqjtbvxkvqplo.supabase.co`).
- The Vercel rebuild had also been using that same Supabase project.
- The isolated Supabase project for the Vercel rebuild is now
  `eybiraytbghrfbldikhn` (`https://eybiraytbghrfbldikhn.supabase.co`).
- The shared database was the risk. Rebuild migrations must now target the
  isolated project only.

## Immediate Rule

Freeze rebuild schema and RLS work against `qqbwiuqaqjtbvxkvqplo`.

Use that project only for:

- active Manus portal repairs,
- read-only audits,
- controlled exports for cutover,
- emergency member access fixes.

Do not run new rebuild migrations, member-gate changes, or seed experiments
against that project.

## Stage 1: Stabilize Live Manus

- Keep the active Manus portal running while the rebuild is prepared.
- Confirm active members can log in after the 2026-05-15 Supabase repair.
- If another member is blocked, repair the live `public.members` row in Supabase
  first, then inspect Manus auth/session behavior.
- Keep member-specific repair SQL out of the public repo.

## Stage 2: Create Isolated Rebuild Supabase

Created separate Supabase project for the Vercel rebuild:

- project ref: `eybiraytbghrfbldikhn`
- project URL: `https://eybiraytbghrfbldikhn.supabase.co`
- purpose: Vercel rebuild production data
- owner: ALP organization

After creation:

- update `supabase/config.toml` to the new project ref,
- apply and verify rebuild migrations/seeds before changing Vercel production
  env vars,
- keep the live Manus env vars unchanged.

## Stage 3: Build Rebuild Data Baseline

Apply the rebuild schema and seeds to the isolated project:

- portal schema/RLS migrations,
- template/replay catalog seed,
- call prep packets,
- bootcamp sessions/questions,
- intensive applications,
- admin roles,
- any required storage buckets.

Then import only intentional cutover data from Manus/live Supabase:

- active member roster: done on 2026-05-15 in `eybiraytbghrfbldikhn`,
- Stripe customer/subscription identifiers where needed: 19 subscription records staged,
- published library rows,
- replay metadata,
- admin emails/roles.

Do not blindly copy legacy Manus implementation tables unless the rebuild uses
them directly.

## Stage 4: Auth And Membership Cutover

The rebuild needs a clear access model before onboarding members:

- Supabase Auth users are the login identity.
- `public.members.user_id` should be attached once a user signs in.
- legacy email-based fallback can exist temporarily for imported members.
- admin access should be explicit through configured admin emails and
  `public.user_roles`.

Smoke test before pilot:

- admin login,
- active member login,
- non-member blocked,
- Stripe-backed active member,
- comped/founding member,
- password reset/magic link if enabled,
- membership check refresh does not trap users on a spinner.

## Stage 5: Product Port

Move the member experience into Vercel in this order:

1. Home/dashboard and portal shell.
2. Template library and replay library from Supabase.
3. Bring One Issue / call-prep packets.
4. Bootcamp question flow and admin review.
5. Intensive applications and admin visibility.
6. Command Tools workbench.
7. AOS external bridge.
8. ConstructLine links as current external workspaces.

Do not rebuild AOS or ConstructLine inside this portal until that migration is
explicitly scoped.

## Stage 6: Controlled Cutover

Before replacing Manus:

- verify no Vercel env points at the Manus/shared project unless intentional,
- run authenticated admin/member smoke tests on the Vercel rebuild,
- verify templates/replays are database-backed,
- verify member access does not depend on Manus storage or Manus auth behavior,
- prepare rollback by leaving Manus untouched until the Vercel rebuild is proven.

Only then move members/domain traffic toward Vercel.

## Immediate Next Work

1. Confirm admin access.
2. Confirm one active test member can enter the portal.
3. Confirm one comped/founding member can enter the portal.
4. Confirm one non-member is blocked.
5. Update Vercel env to target the new project.
6. Run authenticated smoke tests in Vercel.
