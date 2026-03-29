-- ============================================================
-- 20260329: Master Architect Expanded — Wizard v2
-- Adds store_config, social_links, dashboard_config, and
-- category_focus columns for the full 9-step seller wizard.
-- Run this in your Supabase SQL Editor.
-- ============================================================

DO $$
BEGIN

  -- 1. store_config: mode (online/physical/hybrid), availability, announcement banner
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'store_config'
  ) THEN
    ALTER TABLE public.stores
      ADD COLUMN store_config JSONB DEFAULT '{
        "mode": "online",
        "availability": "open",
        "announcement": ""
      }'::jsonb;
  END IF;

  -- 2. social_links: instagram, facebook, whatsapp, website
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'social_links'
  ) THEN
    ALTER TABLE public.stores
      ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- 3. dashboard_config: theme (dark/light/system), sidebar_style, primary_color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'dashboard_config'
  ) THEN
    ALTER TABLE public.stores
      ADD COLUMN dashboard_config JSONB DEFAULT '{
        "theme": "dark",
        "sidebar_style": "glass",
        "primary_color": "#7c3aed"
      }'::jsonb;
  END IF;

  -- 4. category_focus: primary category string
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'category_focus'
  ) THEN
    ALTER TABLE public.stores
      ADD COLUMN category_focus TEXT DEFAULT 'General';
  END IF;

  -- 5. category_tags: array of selected category strings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'category_tags'
  ) THEN
    ALTER TABLE public.stores
      ADD COLUMN category_tags TEXT[] DEFAULT '{}';
  END IF;

  -- 6. tagline: short marketing line
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'tagline'
  ) THEN
    ALTER TABLE public.stores
      ADD COLUMN tagline TEXT;
  END IF;

  -- 7. logo_url: brand mark
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE public.stores
      ADD COLUMN logo_url TEXT;
  END IF;

  -- 8. accepted_terms: boolean flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'accepted_terms'
  ) THEN
    ALTER TABLE public.stores
      ADD COLUMN accepted_terms BOOLEAN DEFAULT FALSE;
  END IF;

  -- 9. commission_rate: platform fee
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'commission_rate'
  ) THEN
    ALTER TABLE public.stores
      ADD COLUMN commission_rate NUMERIC(5,4) DEFAULT 0.05;
  END IF;

END $$;

-- ── Expand features JSONB default to include all wizard powers ──
-- (Safe: only affects stores created before this migration)
UPDATE public.stores
SET features = features || '{
  "negotiation": true,
  "loyalty": true,
  "reviews": true,
  "live_chat": false
}'::jsonb
WHERE features IS NOT NULL
  AND NOT (features ? 'negotiation');

COMMENT ON COLUMN public.stores.store_config IS
  'Wizard v2: store mode (online/physical/hybrid), buyer availability, announcement banner';

COMMENT ON COLUMN public.stores.social_links IS
  'Wizard v2: instagram, facebook, whatsapp, website handles/URLs';

COMMENT ON COLUMN public.stores.dashboard_config IS
  'Wizard v2: seller portal theme (dark/light/system), sidebar_style, accent color';
