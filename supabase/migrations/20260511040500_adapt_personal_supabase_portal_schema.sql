-- Adapt the personal ALP Contractor Circle Supabase project for the Vercel portal.
-- This is intentionally additive/idempotent because the project already has
-- older members/leads tables from prior experiments.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'member', 'beta');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'template_category') THEN
    CREATE TYPE public.template_category AS ENUM (
      'proposals',
      'contracts',
      'sales',
      'operations',
      'finance',
      'estimating',
      'contractor_circle'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE public.subscription_status AS ENUM (
      'trialing',
      'active',
      'past_due',
      'canceled',
      'incomplete'
    );
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  company text,
  headline text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status public.subscription_status NOT NULL DEFAULT 'incomplete',
  ADD COLUMN IF NOT EXISTS plan text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS joined_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_founding boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_comped boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'members_user_id_key'
  ) THEN
    ALTER TABLE public.members ADD CONSTRAINT members_user_id_key UNIQUE (user_id);
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.replays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text,
  thumbnail_url text,
  duration_minutes int,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  tags text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  long_description text,
  category public.template_category NOT NULL,
  file_type text NOT NULL DEFAULT 'pdf',
  download_url text,
  featured boolean NOT NULL DEFAULT false,
  badge text,
  pages text,
  highlights text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  link_url text,
  link_label text,
  pinned boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  source text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS user_agent text;

CREATE INDEX IF NOT EXISTS leads_source_created_idx ON public.leads (source, created_at DESC);
CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads (email);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  environment text NOT NULL DEFAULT 'live' CHECK (environment IN ('sandbox', 'live')),
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text NOT NULL,
  price_id text,
  product_id text,
  status text NOT NULL,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_stripe_subscription_id_key'
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS subscriptions_user_env_idx
  ON public.subscriptions (user_id, environment, created_at DESC);

CREATE TABLE IF NOT EXISTS public.pending_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  price_id text,
  status text NOT NULL,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  claimed_by uuid
);

CREATE INDEX IF NOT EXISTS idx_pending_claims_email_lower
  ON public.pending_claims (lower(email));

CREATE UNIQUE INDEX IF NOT EXISTS pending_claims_sub_unique
  ON public.pending_claims (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS pending_claims_email_comped_unique
  ON public.pending_claims (lower(email))
  WHERE stripe_subscription_id IS NULL;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'preferred_username',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.members WHERE user_id = NEW.id) THEN
    INSERT INTO public.members (user_id, status)
    VALUES (NEW.id, 'incomplete');
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS profiles_updated ON public.profiles;
CREATE TRIGGER profiles_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS members_updated ON public.members;
CREATE TRIGGER members_updated
BEFORE UPDATE ON public.members
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS subscriptions_set_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_set_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_claims ENABLE ROW LEVEL SECURITY;

-- The personal Supabase project already had early experiment tables/policies.
-- Clear existing policies for this portal surface before installing the
-- Vercel portal rules below, so older anon/member visibility does not survive.
DO $$
DECLARE
  existing_policy record;
BEGIN
  FOR existing_policy IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles',
        'user_roles',
        'members',
        'replays',
        'templates',
        'announcements',
        'leads',
        'subscriptions',
        'pending_claims'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  END LOOP;
END$$;

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members view own membership" ON public.members;
CREATE POLICY "Members view own membership"
ON public.members FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Authenticated can view published replays" ON public.replays;
CREATE POLICY "Authenticated can view published replays"
ON public.replays FOR SELECT TO authenticated
USING (
  published = true
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Authenticated can view published templates" ON public.templates;
CREATE POLICY "Authenticated can view published templates"
ON public.templates FOR SELECT TO authenticated
USING (
  published = true
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Authenticated can view published announcements" ON public.announcements;
CREATE POLICY "Authenticated can view published announcements"
ON public.announcements FOR SELECT TO authenticated
USING (
  published = true
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Anyone can insert a lead" ON public.leads;
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead"
ON public.leads FOR INSERT TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND email <> ''
  AND email LIKE '%@%'
  AND source IS NOT NULL
  AND source <> ''
);

DROP POLICY IF EXISTS "Admins read leads" ON public.leads;
CREATE POLICY "Admins read leads"
ON public.leads FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Users view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users view own subscriptions"
ON public.subscriptions FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
);

DROP POLICY IF EXISTS "Users can view their own pending claim by email" ON public.pending_claims;
CREATE POLICY "Users can view their own pending claim by email"
ON public.pending_claims FOR SELECT TO authenticated
USING (lower(email) = lower((auth.jwt() ->> 'email')));

-- Server-side code uses SUPABASE_SERVICE_ROLE_KEY and bypasses RLS for imports,
-- claims, Stripe webhook updates, and admin maintenance.

INSERT INTO public.replays (title, description, duration_minutes, recorded_at, tags, thumbnail_url)
SELECT 'How Marshall Closes a $4M Bid',
       'Live walkthrough of the bid review framework Marshall used on a recent commercial pursuit.',
       62,
       now() - interval '3 days',
       '{Sales,Bidding}',
       null
WHERE NOT EXISTS (SELECT 1 FROM public.replays WHERE title = 'How Marshall Closes a $4M Bid');

INSERT INTO public.replays (title, description, duration_minutes, recorded_at, tags, thumbnail_url)
SELECT 'The 3-Silo Operating Model',
       'Why every contracting business breaks at the same three points and how to architect around it.',
       47,
       now() - interval '10 days',
       '{Operations,Strategy}',
       null
WHERE NOT EXISTS (SELECT 1 FROM public.replays WHERE title = 'The 3-Silo Operating Model');

INSERT INTO public.replays (title, description, duration_minutes, recorded_at, tags, thumbnail_url)
SELECT 'Estimating: From Takeoff to Margin',
       'A working session on pricing labor + materials with a real GC scope.',
       78,
       now() - interval '21 days',
       '{Estimating,Finance}',
       null
WHERE NOT EXISTS (SELECT 1 FROM public.replays WHERE title = 'Estimating: From Takeoff to Margin');

INSERT INTO public.replays (title, description, duration_minutes, recorded_at, tags, thumbnail_url)
SELECT 'Q&A: Hiring a First Project Manager',
       'Live member Q&A on the first PM hire — comp, ramp, and accountability.',
       53,
       now() - interval '35 days',
       '{Hiring,Operations}',
       null
WHERE NOT EXISTS (SELECT 1 FROM public.replays WHERE title = 'Q&A: Hiring a First Project Manager');

INSERT INTO public.templates (
  title,
  description,
  long_description,
  category,
  file_type,
  featured,
  badge,
  pages,
  highlights
)
SELECT 'Subcontractor Bid Submittal Form',
       'The exact form Marshall sends to every sub on a competitive bid.',
       'A 2-page submittal form that forces subs to break out scope, exclusions, and unit costs in a comparable format.',
       'estimating',
       'pdf',
       true,
       'Most Used',
       '2 pages',
       '{Scope clarity,Apples-to-apples comparison,Exclusion checklist}'
WHERE NOT EXISTS (SELECT 1 FROM public.templates WHERE title = 'Subcontractor Bid Submittal Form');

INSERT INTO public.templates (
  title,
  description,
  long_description,
  category,
  file_type,
  featured,
  badge,
  pages,
  highlights
)
SELECT 'Schedule of Values Template',
       'Banker-grade SOV that gets your draws approved without a fight.',
       'A line-item SOV structured around how lenders actually review pay applications.',
       'finance',
       'xlsx',
       true,
       'New',
       '1 sheet',
       '{Lender-friendly format,Stored materials column,Retainage schedule}'
WHERE NOT EXISTS (SELECT 1 FROM public.templates WHERE title = 'Schedule of Values Template');

INSERT INTO public.templates (
  title,
  description,
  long_description,
  category,
  file_type,
  featured,
  badge,
  pages,
  highlights
)
SELECT 'EOS-Lite Operating Playbook',
       'The lightweight operating system Marshall installs at $5M-$50M GCs.',
       'A condensed EOS variant tuned for construction — L10s, scorecards, and rocks built for crews and PMs.',
       'operations',
       'pdf',
       true,
       null,
       '18 pages',
       '{Weekly L10 agenda,KPI scorecard,Quarterly rocks template}'
WHERE NOT EXISTS (SELECT 1 FROM public.templates WHERE title = 'EOS-Lite Operating Playbook');

INSERT INTO public.templates (
  title,
  description,
  long_description,
  category,
  file_type,
  featured,
  badge,
  pages,
  highlights
)
SELECT 'Master Subcontract Agreement',
       'A defensible MSA template with the change-order language that protects you.',
       'Reviewed annually by construction counsel.',
       'contracts',
       'docx',
       false,
       null,
       '12 pages',
       '{Change order procedures,Indemnity clause,Pay-when-paid language}'
WHERE NOT EXISTS (SELECT 1 FROM public.templates WHERE title = 'Master Subcontract Agreement');

INSERT INTO public.templates (
  title,
  description,
  long_description,
  category,
  file_type,
  featured,
  badge,
  pages,
  highlights
)
SELECT 'Discovery Call Script',
       'The first-call framework that qualifies a project in 22 minutes.',
       null,
       'sales',
       'pdf',
       false,
       null,
       '4 pages',
       '{Budget qualification,Decision process,Next-step trial close}'
WHERE NOT EXISTS (SELECT 1 FROM public.templates WHERE title = 'Discovery Call Script');

INSERT INTO public.announcements (title, body, link_url, link_label, pinned, published_at)
SELECT 'Live call this Thursday: Bid Review Bootcamp',
       'Marshall is opening the floor to walk through three live member bids. Bring a current pursuit.',
       null,
       null,
       true,
       now() + interval '2 days'
WHERE NOT EXISTS (SELECT 1 FROM public.announcements WHERE title = 'Live call this Thursday: Bid Review Bootcamp');

INSERT INTO public.announcements (title, body, link_url, link_label, pinned, published_at)
SELECT 'New template added: Schedule of Values',
       'Banker-grade SOV is in the library. Download from Templates → Finance.',
       '/portal/templates',
       'Open templates',
       false,
       now() - interval '1 day'
WHERE NOT EXISTS (SELECT 1 FROM public.announcements WHERE title = 'New template added: Schedule of Values');

INSERT INTO public.announcements (title, body, link_url, link_label, pinned, published_at)
SELECT 'Discord: #estimating channel is live',
       'Working room for active estimates. Drop your scope, get a sanity check from the room.',
       null,
       null,
       false,
       now() - interval '4 days'
WHERE NOT EXISTS (SELECT 1 FROM public.announcements WHERE title = 'Discord: #estimating channel is live');
