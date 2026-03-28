-- ================================================================
-- Eagle Choice Multi-Vendor Marketplace Migration
-- Run this in your Supabase SQL Editor
-- ================================================================

-- 1. Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logo_url TEXT,
  banner_url TEXT,
  brand_color TEXT DEFAULT '#2563eb',
  tagline TEXT,
  description TEXT,
  category_tags TEXT[] DEFAULT '{}',
  paystack_subaccount_code TEXT,
  commission_rate NUMERIC(4,2) DEFAULT 0.05,
  is_active BOOLEAN DEFAULT TRUE,
  is_official BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create store_members table (links agents to a store)
CREATE TABLE IF NOT EXISTS store_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('owner', 'agent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (store_id, user_id)
);

-- 3. Add store_id to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);

-- 4. Add store_id to services
ALTER TABLE services ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);

-- 5. Add store_id and commission to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS platform_commission NUMERIC(12,2) DEFAULT 0;

-- 6. Allow 'seller' role in profiles (add to check constraint if exists, or just allow it)
-- Note: if your profiles table has a CHECK constraint on role, remove and recreate it
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
-- ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
--   CHECK (role IN ('admin', 'client', 'user', 'seller'));

-- 7. Create Eagle Choice Official Store (run after you know the admin's user ID)
-- Replace 'YOUR-ADMIN-USER-ID' with the actual admin UUID from your profiles table
-- You can find it by running: SELECT id FROM profiles WHERE role = 'admin' LIMIT 1;
/*
INSERT INTO stores (name, slug, owner_id, brand_color, tagline, description, is_official, commission_rate)
SELECT 
  'Eagle Choice Official', 
  'eagle-choice',
  id,
  '#2563eb',
  'The original Eagle Choice store',
  'Premium laptops, accessories, and services — direct from Eagle Choice.',
  TRUE,
  0.00  -- no commission for official store
FROM profiles WHERE role = 'admin' LIMIT 1;

-- 8. Assign all existing products to Eagle Choice Official Store
UPDATE products SET store_id = (SELECT id FROM stores WHERE slug = 'eagle-choice') WHERE store_id IS NULL;

-- 9. Assign all existing services to Eagle Choice Official Store
UPDATE services SET store_id = (SELECT id FROM stores WHERE slug = 'eagle-choice') WHERE store_id IS NULL;

-- 10. Assign all existing orders to Eagle Choice Official Store
UPDATE orders SET store_id = (SELECT id FROM stores WHERE slug = 'eagle-choice') WHERE store_id IS NULL;
*/

-- RLS Policies
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_members ENABLE ROW LEVEL SECURITY;

-- Stores: everyone can read active stores
CREATE POLICY "Public stores are viewable by everyone" ON stores FOR SELECT USING (is_active = TRUE);
-- Sellers can manage their own store
CREATE POLICY "Sellers can manage their store" ON stores FOR ALL USING (owner_id = auth.uid());
-- Admins can see all stores
CREATE POLICY "Admins can manage all stores" ON stores FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Store members: store owners and admins can manage
CREATE POLICY "Store owners can manage members" ON store_members FOR ALL USING (
  EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Members can read their store membership" ON store_members FOR SELECT USING (user_id = auth.uid());
