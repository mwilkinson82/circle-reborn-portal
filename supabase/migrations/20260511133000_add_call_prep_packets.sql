DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'call_prep_category') THEN
    CREATE TYPE public.call_prep_category AS ENUM (
      'leadership',
      'people',
      'cash',
      'sales',
      'production'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'call_prep_output') THEN
    CREATE TYPE public.call_prep_output AS ENUM (
      'decision',
      'todo',
      'sop_gap',
      'scorecard_metric',
      'aos_issue'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'call_prep_status') THEN
    CREATE TYPE public.call_prep_status AS ENUM (
      'draft',
      'ready',
      'discussed',
      'converted'
    );
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.call_prep_packets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category public.call_prep_category NOT NULL,
  issue text NOT NULL,
  tried text,
  avoiding text,
  consequence text,
  win text,
  expected_output public.call_prep_output NOT NULL DEFAULT 'decision',
  output_summary text,
  owner text,
  due_date date,
  status public.call_prep_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS call_prep_packets_user_updated_idx
  ON public.call_prep_packets (user_id, updated_at DESC);

DROP TRIGGER IF EXISTS call_prep_packets_updated ON public.call_prep_packets;
CREATE TRIGGER call_prep_packets_updated
BEFORE UPDATE ON public.call_prep_packets
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.call_prep_packets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members manage own call prep packets" ON public.call_prep_packets;
CREATE POLICY "Members manage own call prep packets"
ON public.call_prep_packets
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
