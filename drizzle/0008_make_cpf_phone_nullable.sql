-- Make cpf and phone columns nullable to allow user creation without these fields
ALTER TABLE "user" ALTER COLUMN cpf DROP NOT NULL;
ALTER TABLE "user" ALTER COLUMN phone DROP NOT NULL;

-- If a unique constraint exists on cpf digits it should remain; ensure index exists (no-op if already created)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'user_cpf_digits_unique_idx'
  ) THEN
    CREATE UNIQUE INDEX user_cpf_digits_unique_idx ON "user" (regexp_replace(cpf, '\\D', '', 'g')) WHERE cpf IS NOT NULL;
  END IF;
END$$;
