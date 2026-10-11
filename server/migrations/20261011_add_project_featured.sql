ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

UPDATE public.projects
SET is_featured = true
WHERE id IN (
  SELECT id
  FROM public.projects
  ORDER BY id
  LIMIT 4
);