# Cutover Dependency Audit

Checked on 2026-05-13.

## Intentional External Systems

- Supabase project `qqbwiuqaqjtbvxkvqplo` for portal data.
- Vercel project `circle-reborn-portal` for hosting.
- Stripe live keys and webhook secrets for checkout/subscription state.
- Resend for Intensive application email delivery.
- AOS remains external and centralized through `src/lib/aos-link.ts`.
- ConstructLine, Basis, Baseline, Cost Library, and Trade Rate Library remain external/current linked workspaces through `src/lib/constructline-links.ts`.

## Remaining Manus Or Current-Portal Dependencies

- `src/lib/resource-links.ts`
  - `LEAD_MAGNET_DOWNLOADS.silos` still points to `https://alpcontractorcircle.com/manus-storage/ALP_Three_Silos_Framework_v3_3ba50529.pdf`.
  - This is a public lead magnet asset and must be rehosted before final cutover.
- `src/lib/library-catalog.ts`
  - Some historical template catalog rows still contain old Manus storage URLs in the local fallback catalog.
  - Runtime sanitizer now treats those URLs as unavailable so members see the asset as not ready instead of opening Manus storage.
  - The production seed migration writes these as `NULL`.
- `supabase/migrations/20260511100500_seed_real_member_library.sql` and `20260512053000_repair_template_asset_urls.sql`
  - Historical migrations contain old Manus storage URLs.
  - The newer full catalog seed supersedes these values and removes Manus URLs from production seed data.
- `src/lib/constructline-links.ts`
  - Links to `alpcontractorcircle.com/portal/...` are intentional for the current ConstructLine stack.
  - They are env-overridable with `VITE_CONSTRUCTLINE_BASE_URL` and labeled in code as temporary/current linked workspaces.

## Search Terms Used

`manus`, `manus-storage`, `alpcontractorcircle.com/portal`, `bridge`, `migration`, `pending`, `legacy`, `localhost`.
