-- ================================================================
-- Eagle Choice: Payout & Momo Configuration Migration
-- Run this in your Supabase SQL Editor
-- ================================================================

-- 1. Update Stores Table for Seller Bank Details
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS payout_account_number TEXT,
ADD COLUMN IF NOT EXISTS payout_bank_name TEXT,
ADD COLUMN IF NOT EXISTS payout_account_name TEXT,
ADD COLUMN IF NOT EXISTS payout_bank_code TEXT;

-- 2. Update Profiles Table for Agent Momo Details
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS momo_number TEXT,
ADD COLUMN IF NOT EXISTS momo_provider TEXT CHECK (momo_provider IN ('mtn', 'vodafone', 'airteltigo'));

-- 3. Update Store Members for Agent Payout Preference
ALTER TABLE store_members 
ADD COLUMN IF NOT EXISTS payout_momo_number TEXT,
ADD COLUMN IF NOT EXISTS payout_momo_provider TEXT;

-- 4. RLS for Security (Owner and Admin can see store payouts)
-- (Existing RLS on stores is 'FOR ALL USING (owner_id = auth.uid())')

-- 5. Helper View for Admin to see Payout Status
CREATE OR REPLACE VIEW admin_payout_status AS
SELECT 
  s.id as store_id,
  s.name as store_name,
  s.payout_account_number as acc_num,
  s.payout_bank_name as bank,
  p.full_name as owner_name,
  p.email as owner_email
FROM stores s
JOIN profiles p ON s.owner_id = p.id;
