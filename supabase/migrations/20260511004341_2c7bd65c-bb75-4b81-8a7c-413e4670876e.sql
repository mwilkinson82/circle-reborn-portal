-- Allow comped pending_claims (no Stripe sub) and add founding flag to members
ALTER TABLE public.pending_claims
  ALTER COLUMN price_id DROP NOT NULL,
  ALTER COLUMN stripe_customer_id DROP NOT NULL,
  ALTER COLUMN stripe_subscription_id DROP NOT NULL;

-- Drop unique constraint on stripe_subscription_id if it exists, recreate as partial unique
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pending_claims_stripe_subscription_id_key'
  ) THEN
    ALTER TABLE public.pending_claims DROP CONSTRAINT pending_claims_stripe_subscription_id_key;
  END IF;
END$$;

CREATE UNIQUE INDEX IF NOT EXISTS pending_claims_sub_unique
  ON public.pending_claims (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS pending_claims_email_comped_unique
  ON public.pending_claims (lower(email))
  WHERE stripe_subscription_id IS NULL;

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS is_founding boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_comped boolean NOT NULL DEFAULT false;