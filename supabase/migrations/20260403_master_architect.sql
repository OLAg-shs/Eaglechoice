-- ============================================================
-- 20260403: Master Architect (Automated System Building)
-- ============================================================
-- This migration adds core JSONB columns to track activated 
-- features and card branding for automated store setup.
-- ============================================================

-- Add columns to stores table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'features') THEN
    ALTER TABLE public.stores ADD COLUMN features JSONB DEFAULT '{"ai_agents": true, "branded_cards": true, "analytics": true}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'card_config') THEN
    ALTER TABLE public.stores ADD COLUMN card_config JSONB DEFAULT '{"theme": "midnight", "layout": "landscape", "primary_color": "#2563eb"}'::jsonb;
  END IF;
END $$;
