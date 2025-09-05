-- Add cpf column if it doesn't exist and create a unique index on normalized digits
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS cpf text;

-- Create a unique index on only the digits of cpf to ensure uniqueness regardless of formatting
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
