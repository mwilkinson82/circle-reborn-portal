# Production Migration Checklist

Production Supabase project recorded during the hardening pass:
`qqbwiuqaqjtbvxkvqplo` (`alp-contractor-circle`)

Important update from 2026-05-15: this project is also used by the active Manus
Contractor Circle portal. Treat it as the live legacy database. Do not run new
rebuild migrations against it unless the explicit goal is repairing the live
Manus portal.

Isolated rebuild Supabase project created on 2026-05-15:
`eybiraytbghrfbldikhn` (`https://eybiraytbghrfbldikhn.supabase.co`)

Checked on 2026-05-13 with the Supabase connector.

## Applied During Hardening Pass

- `20260511133000_add_call_prep_packets.sql`
  - Creates `public.call_prep_packets`.
  - Enables RLS.
  - Adds member-owned `FOR ALL` policy scoped to `auth.uid() = user_id`.
- `20260512024500_add_bootcamp_command_center.sql`
  - Creates `public.bootcamp_sessions` and `public.bootcamp_questions`.
  - Enables RLS on both tables.
  - Lets authenticated members read published sessions.
  - Lets members view/submit/update only their own submitted questions.

## Must Apply Before Cutover

- Already applied manually: `20260513194811_seed_full_library_catalog.sql`
  - Replaces placeholder template/replay rows with the checked-in rebuild catalog.
  - Keeps old Manus-hosted template assets as `NULL` download URLs so the portal renders them as unavailable instead of linking to Manus storage.

## Next Cutover Rule

Before additional rebuild auth, membership, or portal-data work, provision an
isolated Supabase project for the Vercel rebuild and point Vercel production
environment variables to that project. The active Manus project should remain
stable until traffic is intentionally cut over.

Current target for new rebuild migrations: `eybiraytbghrfbldikhn`.

## Isolated Rebuild Bootstrap

Applied to `eybiraytbghrfbldikhn` on 2026-05-15:

- `bootstrap_rebuild_portal_schema`
- `seed_rebuild_library_catalog`
- `add_rebuild_fk_indexes`
- `restore_has_active_subscription_grant`
- `add_pending_claim_metadata`

The local shell lacked a Supabase access token, so these were applied through
the Supabase connector rather than `supabase db push`. Reconcile remote
migration history before enabling automated Supabase GitHub/CLI migration runs.

Verification result:

- `templates = 35`
- `replays = 12`
- `bootcamp_sessions = 1`
- `pending_claims = 30`
- `subscriptions = 19`
- `members = 0`
- `intensive_applications = 0`
- key portal tables have RLS enabled
- `authenticated` can execute `public.has_active_subscription(uuid)`
- Manus/live-project template URL references = `0`

Member bootstrap result from `members_20260515_174345.csv`:

- 30 rows staged in `pending_claims`
- 19 Stripe subscription rows staged in `subscriptions`
- 11 owner-confirmed comped rows staged with no active Stripe billing link
- 4 legacy customer-only CSV rows preserved as comped metadata only
- 1 row skipped because it had no email address

Vercel env vars are still intentionally unchanged until member/admin bootstrap
and authenticated smoke tests are complete.

## Already Present In Production

- `public.intensive_applications`
  - RLS enabled.
  - Members can insert their own application.
  - Members can view their own application.
- `template_category` includes `leadership`.

## Current Production Gaps

- `public.templates` still had only the five bootstrap placeholder rows.
- `public.replays` still had four bootstrap placeholder rows with no video URLs.
- Vercel production env var names are present, but encrypted values could not be decrypted through the current Codex/Vercel OAuth context.

## Verification Queries

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'call_prep_packets',
    'bootcamp_sessions',
    'bootcamp_questions',
    'intensive_applications'
  )
order by tablename;
```

```sql
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'call_prep_packets',
    'bootcamp_sessions',
    'bootcamp_questions',
    'intensive_applications'
  )
order by tablename, policyname;
```

```sql
select
  count(*)::int as total_templates,
  count(*) filter (where published)::int as published_templates,
  count(*) filter (where download_url like '%alpcontractorcircle.com/manus-storage%')::int as manus_template_urls
from public.templates;
```
