-- ============================================================
-- 20260401: Buyer & Seller Preference Column
-- ============================================================
-- This migration adds the preferences JSONB column to the 
-- profiles table to track wizard completion status, interests, 
-- and personalized budget ranges.
-- ============================================================

-- Add the preferences column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
    ALTER TABLE public.profiles ADD COLUMN preferences JSONB DEFAULT '{"onboarding_complete": false}'::jsonb;
  END IF;
END $$;

-- Update the handle_new_user function to ensure default preferences are set
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email, phone, preferences)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'phone',
    '{"onboarding_complete": false}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
