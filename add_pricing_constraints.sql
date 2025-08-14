-- Migration to update existing data and add check constraints for pricing

-- Step 1: Update existing rows in the 'ships' table with the old price (e.g. 5) to the new price (2).
UPDATE public.ships
SET price = 2
WHERE price > 0 AND price != 2;

-- Step 2: Update existing rows in the 'payments' table with any old amount to the new amount (2).
UPDATE public.payments
SET amount = 2
WHERE amount != 2;

-- Step 3: Add a check constraint to the ships table to ensure the price is either 0 or 2.
-- This may fail if there are still rows with invalid prices.
ALTER TABLE public.ships
ADD CONSTRAINT price_check CHECK (price IN (0, 2));

-- Step 4: Add a check constraint to the payments table to ensure the amount is 2.
ALTER TABLE public.payments
ADD CONSTRAINT amount_check CHECK (amount = 2);
