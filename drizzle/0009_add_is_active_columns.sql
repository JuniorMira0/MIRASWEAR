-- Add is_active columns to product and product_variant
ALTER TABLE product ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE product_variant ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Backfill any existing rows (should be unnecessary because of DEFAULT true)
UPDATE product SET is_active = true WHERE is_active IS NULL;
UPDATE product_variant SET is_active = true WHERE is_active IS NULL;
