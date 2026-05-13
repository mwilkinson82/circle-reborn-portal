# Production Migration Checklist

Production Supabase project: `qqbwiuqaqjtbvxkvqplo` (`alp-contractor-circle`)

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

- `20260513194811_seed_full_library_catalog.sql`
  - Replaces placeholder template/replay rows with the checked-in rebuild catalog.
  - Keeps old Manus-hosted template assets as `NULL` download URLs so the portal renders them as unavailable instead of linking to Manus storage.

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
