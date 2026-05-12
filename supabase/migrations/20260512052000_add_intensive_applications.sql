-- Portal-side applications for the Six-Week Contractor Intensive.
-- Applications are submitted from inside Contractor Circle instead of opening a mailto link.

CREATE TABLE IF NOT EXISTS public.intensive_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  company_name text NOT NULL,
  annual_revenue_range text NOT NULL,
  biggest_challenge text NOT NULL,
  already_tried text NOT NULL,
  applying_for text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'reviewed', 'accepted', 'declined')),
  email_status text NOT NULL DEFAULT 'pending',
  email_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.intensive_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can submit intensive applications"
ON public.intensive_applications;
CREATE POLICY "Members can submit intensive applications"
ON public.intensive_applications
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members can view own intensive applications"
ON public.intensive_applications;
CREATE POLICY "Members can view own intensive applications"
ON public.intensive_applications
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'intensive_applications_updated'
  ) THEN
    CREATE TRIGGER intensive_applications_updated
    BEFORE UPDATE ON public.intensive_applications
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
