CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  company text,
  source text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leads_source_created_idx ON public.leads (source, created_at DESC);
CREATE INDEX leads_email_idx ON public.leads (email);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a lead (no auth required for lead magnets)
CREATE POLICY "Anyone can insert a lead"
ON public.leads FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins read leads"
ON public.leads FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage leads"
ON public.leads FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));