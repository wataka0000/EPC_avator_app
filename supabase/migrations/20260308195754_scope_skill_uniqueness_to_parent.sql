BEGIN;

-- Prevent silent failure: ensure current data does not violate target uniqueness.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.skill_subdomains
    GROUP BY domain_id, key
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add UNIQUE(domain_id, key) to skill_subdomains because duplicates exist.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.skill_items
    GROUP BY subdomain_id, key
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add UNIQUE(subdomain_id, key) to skill_items because duplicates exist.';
  END IF;
END
$$;

-- Drop single-column unique constraints on key (if present).
DO $$
DECLARE
  c record;
  key_attnum int;
BEGIN
  SELECT a.attnum
    INTO key_attnum
  FROM pg_attribute a
  WHERE a.attrelid = 'public.skill_subdomains'::regclass
    AND a.attname = 'key'
    AND NOT a.attisdropped;

  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.skill_subdomains'::regclass
      AND contype = 'u'
      AND array_length(conkey, 1) = 1
      AND conkey[1] = key_attnum
  LOOP
    EXECUTE format('ALTER TABLE public.skill_subdomains DROP CONSTRAINT %I', c.conname);
  END LOOP;
END
$$;

DO $$
DECLARE
  c record;
  key_attnum int;
BEGIN
  SELECT a.attnum
    INTO key_attnum
  FROM pg_attribute a
  WHERE a.attrelid = 'public.skill_items'::regclass
    AND a.attname = 'key'
    AND NOT a.attisdropped;

  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.skill_items'::regclass
      AND contype = 'u'
      AND array_length(conkey, 1) = 1
      AND conkey[1] = key_attnum
  LOOP
    EXECUTE format('ALTER TABLE public.skill_items DROP CONSTRAINT %I', c.conname);
  END LOOP;
END
$$;

-- Add parent-scoped unique constraints.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.skill_subdomains'::regclass
      AND conname = 'skill_subdomains_domain_id_key_key'
  ) THEN
    ALTER TABLE public.skill_subdomains
      ADD CONSTRAINT skill_subdomains_domain_id_key_key UNIQUE (domain_id, key);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.skill_items'::regclass
      AND conname = 'skill_items_subdomain_id_key_key'
  ) THEN
    ALTER TABLE public.skill_items
      ADD CONSTRAINT skill_items_subdomain_id_key_key UNIQUE (subdomain_id, key);
  END IF;
END
$$;

COMMIT;
