-- Cover member-owned portal foreign keys before Vercel cutover.
CREATE INDEX IF NOT EXISTS bootcamp_questions_user_id_idx
  ON public.bootcamp_questions (user_id);

CREATE INDEX IF NOT EXISTS bootcamp_questions_session_id_idx
  ON public.bootcamp_questions (session_id);

CREATE INDEX IF NOT EXISTS intensive_applications_user_id_idx
  ON public.intensive_applications (user_id);
