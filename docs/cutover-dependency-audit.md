# Cutover Dependency Audit

Checked on 2026-05-13.

## Intentional External Systems

- Supabase project `qqbwiuqaqjtbvxkvqplo` is the live legacy database used by
  the active Manus Contractor Circle portal.
- Supabase project `eybiraytbghrfbldikhn` is the isolated rebuild database for
  the Vercel portal.
- Vercel project `circle-reborn-portal` for hosting.
- Stripe live keys and webhook secrets for checkout/subscription state.
- Resend for Intensive application email delivery.
- AOS remains external and centralized through `src/lib/aos-link.ts`.
- ConstructLine, Basis, Baseline, Cost Library, and Trade Rate Library remain external/current linked workspaces through `src/lib/constructline-links.ts`.

## Live Database Freeze

Do not apply rebuild migrations, RLS edits, membership schema changes, or seed
experiments to `qqbwiuqaqjtbvxkvqplo` unless the explicit goal is to repair the
active Manus portal. New portal auth/member work should target
`eybiraytbghrfbldikhn`.

Member bootstrap note from 2026-05-15: the active member CSV was imported only
into `eybiraytbghrfbldikhn`. The import staged 30 pending claims and 19 Stripe
subscription records; 11 owner-confirmed comped members have no active Stripe
billing link in the rebuild database.

Emergency repair note from 2026-05-15: the active Manus portal was confirmed to
use `https://qqbwiuqaqjtbvxkvqplo.supabase.co`. The live access repair restored
the `public.has_active_subscription(uuid)` authenticated execute path, restored
legacy email-based member visibility, and restored an active member row. Keep
any member-specific repair SQL out of the public repo.

## Remaining Manus Or Current-Portal Dependencies

- No active member-facing code paths point to Manus storage.
- The Three Silos lead magnet is now served by the rebuild at
  `/lead-magnets/alp-three-silos-framework.pdf`.
- `src/lib/library-catalog.ts`
  - Historical template rows whose assets were not found now use `NULL` download URLs in the local fallback catalog.
  - Members see those assets as unavailable/Coming next instead of opening Manus storage.
  - The production seed migration writes these as `NULL`.
- `supabase/migrations/20260511100500_seed_real_member_library.sql` and `20260512053000_repair_template_asset_urls.sql`
  - Historical migrations contain old Manus storage URLs.
  - The newer full catalog seed supersedes these values and removes Manus URLs from production seed data.
- `src/lib/constructline-links.ts`
  - Links to `alpcontractorcircle.com/portal/...` are intentional for the current ConstructLine stack.
  - They are env-overridable with `VITE_CONSTRUCTLINE_BASE_URL` and labeled in code as temporary/current linked workspaces.

## Search Terms Used

`manus`, `manus-storage`, `alpcontractorcircle.com/portal`, `bridge`, `migration`, `pending`, `legacy`, `localhost`.
