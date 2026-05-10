
# ALP Contractor Circle Portal — Rebuild Plan

A full rebuild of a 30+ page portal is a multi-week effort. We'll execute it in phases. Each phase ends with a working, shippable site. This plan covers Phase 1 in detail and outlines Phases 2–5 so you know what's coming.

## What we're rebuilding (from your zip)

The current app is an Express + Drizzle + tRPC + Wouter + Stripe + Discord stack with these page groups:

- **Public marketing**: Contractor Circle landing, Join, Circle Welcome, ConstructLine landing, Beta Login/Signup
- **Lead magnets**: Q2, Estimating Checklist, Three Silos (+ thank-you pages)
- **Member Portal**: Dashboard, Replays, Templates, Account, Subscribers
- **Admin**: Members, Analytics, Feedback, Drip Dashboard, Portal Admin
- **CPM Scheduler**: List, Scheduler, Reports, Comparison
- **ConstructLine tools**: Hub, Takeoff list/detail, Cost Library, Labor Library

## Target stack

- TanStack Start v1 + React 19 + Vite 7 (current template)
- Tailwind v4 + shadcn/ui (already in)
- Lovable Cloud (Supabase) — auth, Postgres, storage, server functions
- Stripe via server route + webhook (`/api/public/webhooks/stripe`)
- File-based routes under `src/routes/` — every section gets its own route (no hash anchors)

## Design direction — Modern SaaS / Editorial

A refined, premium contractor tool that doesn't look like construction software. Think Linear meets Notion meets a finely-printed trade magazine.

- **Palette**: warm off-white canvas (`oklch(0.985 0.005 80)`), deep ink foreground (`oklch(0.18 0.01 260)`), single accent — burnt amber (`oklch(0.68 0.16 55)`) used sparingly. Subtle elevated surface for cards. Dark mode mirror.
- **Typography**: display serif for headlines (Fraunces or Instrument Serif) + clean grotesque body (Geist or Inter Tight). Big, confident H1s; generous line-height; tabular numerals for data.
- **Layout**: 12-col grid with wide gutters on marketing pages; portal uses a quiet left sidebar (icon + label, collapsible) with content max-width 1200px. Section dividers are hairline rules, not boxes.
- **Motion**: framer-motion — single hero reveal, page transitions, list stagger on dashboards. No bouncy micro-interactions.
- **Data viz**: Recharts with monochrome amber palette + thin gridlines. Tabular-num everywhere money/duration appears.
- **Tone**: copy that sounds like a senior PM, not marketing. Short, declarative, no exclamation points.

All tokens defined in `src/styles.css` as oklch — no hardcoded colors in components.

## Phase 1 — Foundation + Member Portal Dashboard (this turn)

**Deliverables**

1. **Design system** in `src/styles.css`: full light/dark token set, serif/grotesque font pairing via Google Fonts, motion primitives, container utility.
2. **Lovable Cloud enabled** — provisions Supabase, creates initial schema:
   - `profiles` (id ↔ auth.users, display_name, avatar_url, company, role)
   - `user_roles` (separate table, enum `app_role`: admin, member, beta) + `has_role()` security definer + RLS
   - `members` (subscription status, stripe_customer_id, plan, joined_at)
   - `replays` (title, description, video_url, thumbnail_url, recorded_at, duration, tags)
   - `templates` (title, description, long_description, category, file_type, download_url, featured, badge, pages, highlights[])
   - `announcements` (for dashboard feed)
   - All tables with RLS; members read replays/templates, only admins write
3. **Auth shell**: `/login`, `/signup` (email + Google), `/reset-password`. `_authenticated` layout route guards portal pages with `beforeLoad` session gate.
4. **Portal layout**: collapsible sidebar (Dashboard, Replays, Templates, Scheduler, Takeoffs, Cost Library, Account, Admin) using shadcn `Sidebar`. Top bar with breadcrumb + user menu.
5. **Portal Dashboard** (`/portal`) — the anchor page:
   - Welcome strip with member name + quick stats (active subscription, days as member, next live call)
   - "Continue where you left off" card (latest replay)
   - Featured templates row (3 cards from `templates` where `featured=true`)
   - Upcoming live sessions / announcements feed
   - Quick links grid (Scheduler, Takeoff, Cost Library, Discord)
   - All data fetched via `createServerFn` + TanStack Query
6. **Public landing** (`/`) — refreshed Contractor Circle hero with new design system, CTA to `/join`. Minimal but complete so the homepage isn't a placeholder.
7. **Seed data** for replays + templates so the dashboard isn't empty.

**Out of scope this phase**: Stripe checkout, Discord OAuth, Scheduler, Takeoff, Cost/Labor Library, Admin, Drip, lead magnets.

## Phase 2 — Public site + signup funnel

- `/` Contractor Circle landing (full sections: hero, value props, testimonials, pricing, FAQ, CTA)
- `/join` with Stripe Checkout via `createServerFn` + `/api/public/webhooks/stripe`
- `/circle/welcome` post-purchase
- `/constructline` landing + `/constructline/login` (beta access)
- Lead magnets: `/q2`, `/estimating`, `/silos` + thank-you pages, all writing to `leads` and `email_subscribers` tables
- SEO `head()` per route (title, description, og:image)

## Phase 3 — Member Portal core

- `/portal/replays` — searchable, filterable replay library with player route `/portal/replays/$id`
- `/portal/templates` — category filter, search, download tracking
- `/portal/account` — profile, billing portal link, subscription status
- `/portal/subscribers` — for members who manage their own list (if applicable)

## Phase 4 — Admin

- `/portal/admin` (overview)
- `/portal/members` (table, search, filters, role management via `user_roles`)
- `/portal/analytics` (Recharts dashboards)
- `/portal/feedback`
- `/portal/drip` — drip campaign dashboard + sender (with hard "no send without confirmation" guardrail per AGENTS.md)

## Phase 5 — ConstructLine tools (heaviest phase, may split)

- Scheduler: list, detail (Gantt/CPM), reports, comparison — port `cpmEngine.ts` logic to a server function
- Takeoff: list, detail (sheet viewer + AI extraction)
- Cost Library, Labor Library
- These are full-screen tools and will use a dedicated `hideSidebar` layout

## Migration notes (technical)

- Drop tRPC; use `createServerFn` + TanStack Query. One thin `*.functions.ts` file per resource.
- Drop wouter; use TanStack Router file-based routes.
- Drop Drizzle migrations; rebuild schema as Lovable Cloud migrations. `cpmEngine.ts`, `csiDivisions.ts`, `costTable.ts`, `laborTable.ts` etc. port over as pure modules under `src/lib/` since they have no IO.
- Express endpoints become server routes under `src/routes/api/`. Webhooks go under `/api/public/`.
- AGENTS.md guardrails (no broadcast emails without confirmation, members ≠ subscribers ≠ leads) become explicit confirmation flows in the admin Drip UI, not just docs.
- Stripe live keys: Phase 2 — you'll add `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` as Lovable Cloud secrets when we wire checkout. `VITE_STRIPE_PUBLISHABLE_KEY` lives in code.
- Discord auth (current portal login method): Lovable Cloud doesn't natively support Discord OAuth. Options when we get to it: (a) email/password + Google for the portal and use Discord only for the community link, or (b) connect raw Supabase to enable Discord provider. **Default**: email + Google (recommended).

## Confirmation needed before I implement Phase 1

- This plan covers Phase 1 only. After approval I'll enable Lovable Cloud, create the schema, build the Dashboard + auth + landing, and seed data. Phases 2–5 will each be separate prompts so we can iterate on design and scope as we go.
- Old assets (logos, replay thumbnails, marketing images) aren't in the zip's binary form here — for Phase 1 I'll use placeholder imagery in the new design language. If you have the ALP logo SVG/PNG, drop it in and I'll wire it in.
