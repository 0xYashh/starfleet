-- Migration: Extend public.ships with extra metadata captured by the Launch Wizard
-- Purpose: commander name, roles, status (Building/Launched), and social links

-- Create status constraint first (safe for repeated runs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'ships' AND c.conname = 'ships_status_check'
  ) THEN
    ALTER TABLE public.ships
    ADD COLUMN IF NOT EXISTS status text,
    ADD CONSTRAINT ships_status_check CHECK (status IN ('Building','Launched'));
  ELSE
    -- Ensure column exists even if constraint already present
    ALTER TABLE public.ships
    ADD COLUMN IF NOT EXISTS status text;
  END IF;
END $$;

-- Other columns (idempotent with IF NOT EXISTS)
ALTER TABLE public.ships
  ADD COLUMN IF NOT EXISTS commander_name text,
  ADD COLUMN IF NOT EXISTS roles text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS x_handle text,
  ADD COLUMN IF NOT EXISTS instagram_handle text,
  ADD COLUMN IF NOT EXISTS github_handle text,
  ADD COLUMN IF NOT EXISTS youtube_url text;

-- Set default status for existing rows if NULL
UPDATE public.ships SET status = 'Launched' WHERE status IS NULL;

-- Done 