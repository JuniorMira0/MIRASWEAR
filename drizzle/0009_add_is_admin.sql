-- Safer migration to add is_admin column to user table without data loss
-- 1) add nullable column
-- 2) backfill existing rows with false
-- 3) set default to false
-- 4) make column NOT NULL

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS is_admin boolean;

-- Backfill existing rows (adjust if you want some initial admins)
UPDATE "user" SET is_admin = false WHERE is_admin IS NULL;

-- Set default for future inserts
ALTER TABLE "user" ALTER COLUMN is_admin SET DEFAULT false;

-- Make column NOT NULL
ALTER TABLE "user" ALTER COLUMN is_admin SET NOT NULL;

-- Optional: mark initial admins
-- UPDATE "user" SET is_admin = true WHERE email IN ('seu@adm.com');
