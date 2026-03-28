-- Add verification and terms fields to stores
ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN DEFAULT FALSE;

-- Automatically verify the official store if it exists
UPDATE stores SET is_verified = TRUE, accepted_terms = TRUE WHERE is_official = TRUE;

-- Update RLS for stores to only allow public viewing of verified stores
DROP POLICY IF EXISTS "Public stores are viewable by everyone" ON stores;
CREATE POLICY "Public stores are viewable by everyone" 
  ON stores FOR SELECT 
  USING (is_active = TRUE AND is_verified = TRUE);

-- Store owners can still see their own unverified store
CREATE POLICY "Owners can see their own unverified store" 
  ON stores FOR SELECT 
  USING (owner_id = auth.uid());
