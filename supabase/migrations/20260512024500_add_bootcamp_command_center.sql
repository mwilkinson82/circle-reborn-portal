-- Admin-managed bootcamp schedule and member bootcamp question queue.
-- Questions are separate from Bring One Issue pressure packets so bootcamps can
-- accept/reject selected member questions without implying unlimited consulting.

CREATE TABLE IF NOT EXISTS public.bootcamp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  session_date timestamptz NOT NULL,
  session_url text,
  replay_url text,
  notes text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bootcamp_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.bootcamp_sessions(id) ON DELETE SET NULL,
  question text NOT NULL,
  context text,
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'accepted', 'declined', 'discussed')),
  admin_note text,
  accepted_at timestamptz,
  declined_at timestamptz,
  discussed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bootcamp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view published bootcamp sessions"
ON public.bootcamp_sessions;
CREATE POLICY "Authenticated can view published bootcamp sessions"
ON public.bootcamp_sessions
FOR SELECT TO authenticated
USING (published = true);

DROP POLICY IF EXISTS "Members can view own bootcamp questions"
ON public.bootcamp_questions;
CREATE POLICY "Members can view own bootcamp questions"
ON public.bootcamp_questions
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members can submit own bootcamp questions"
ON public.bootcamp_questions;
CREATE POLICY "Members can submit own bootcamp questions"
ON public.bootcamp_questions
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members can update draft bootcamp questions"
ON public.bootcamp_questions;
CREATE POLICY "Members can update draft bootcamp questions"
ON public.bootcamp_questions
FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status = 'submitted')
WITH CHECK (auth.uid() = user_id AND status = 'submitted');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'bootcamp_sessions_updated'
  ) THEN
    CREATE TRIGGER bootcamp_sessions_updated
    BEFORE UPDATE ON public.bootcamp_sessions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'bootcamp_questions_updated'
  ) THEN
    CREATE TRIGGER bootcamp_questions_updated
    BEFORE UPDATE ON public.bootcamp_questions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

INSERT INTO public.bootcamp_sessions (title, session_date, session_url, notes, published)
SELECT
  'Monthly Bootcamp — Building the Machine',
  '2026-05-30T16:00:00.000Z'::timestamptz,
  NULL,
  'Admin-managed monthly bootcamp slot. Update the date/link here when holidays or scheduling changes move the session.',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.bootcamp_sessions
);

UPDATE public.templates
SET long_description = replace(
  long_description,
  'Block 5 — Member-Submitted Topics (25 min): Open floor for real problems from real contractors. Facilitated by Marshall Wilkinson.',
  'Block 5 — Selected member patterns and implementation discussion (25 min): questions reviewed for broad group value and turned into operating-system lessons.'
)
WHERE title = 'Monthly Boot Camp — Building the Machine (April 2026)'
  AND long_description LIKE '%Open floor for real problems%';
