-- Migration: Add payment_id and missing orbit fields to ships table
-- Purpose: Support payment tracking and complete orbital mechanics

-- Add payment_id column for tracking Dodo Payments transactions
ALTER TABLE public.ships
  ADD COLUMN IF NOT EXISTS payment_id text UNIQUE;

-- Add missing orbital mechanics fields
ALTER TABLE public.ships
  ADD COLUMN IF NOT EXISTS ascending_node real,
  ADD COLUMN IF NOT EXISTS eccentricity real;

-- Add orbit_tags array column if not exists (from previous migration)
ALTER TABLE public.ships
  ADD COLUMN IF NOT EXISTS orbit_tags text[] NOT NULL DEFAULT ARRAY[]::text[];

-- Add updated_at column if not exists
ALTER TABLE public.ships
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create index on payment_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ships_payment_id ON public.ships(payment_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_ships_updated_at ON public.ships;
CREATE TRIGGER update_ships_updated_at
    BEFORE UPDATE ON public.ships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Done

