ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS short_description text;

UPDATE public.projects
SET short_description = COALESCE(description, title)
WHERE short_description IS NULL;

ALTER TABLE public.projects
ALTER COLUMN short_description SET NOT NULL;