
-- Drop the env-composite unique on subscriptions; we now run a single Stripe account
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_stripe_subscription_id_environment_key;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_stripe_subscription_id_key;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id);

-- Allow user_id to be null for unclaimed (backfilled) subscriptions
ALTER TABLE public.subscriptions ALTER COLUMN user_id DROP NOT NULL;

-- Make environment default to 'live'
ALTER TABLE public.subscriptions ALTER COLUMN environment SET DEFAULT 'live';

-- pending_claims table: holds backfilled Stripe subscriptions awaiting member signup
CREATE TABLE public.pending_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  stripe_customer_id text NOT NULL UNIQUE,
  stripe_subscription_id text NOT NULL UNIQUE,
  price_id text NOT NULL,
  status text NOT NULL,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  claimed_by uuid
);

CREATE INDEX idx_pending_claims_email_lower ON public.pending_claims (lower(email));

ALTER TABLE public.pending_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage pending_claims"
  ON public.pending_claims
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow a user to see whether their own email has a pending claim
CREATE POLICY "Users can view their own pending claim by email"
  ON public.pending_claims
  FOR SELECT
  TO authenticated
  USING (lower(email) = lower((auth.jwt() ->> 'email')));
