-- Add the old portal leadership template category before importing the full catalog.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'template_category'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'template_category' AND e.enumlabel = 'leadership'
  ) THEN
    ALTER TYPE public.template_category ADD VALUE 'leadership';
  END IF;
END$$;
