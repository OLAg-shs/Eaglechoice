-- Boutique Style Studio & Negotiation Engine Migration
-- Adds themes, fonts, and negotiation tracking

-- 1. Store Styling Configuration
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS theme_id TEXT DEFAULT 'modern' CHECK (theme_id IN ('modern', 'luxury', 'minimal')),
ADD COLUMN IF NOT EXISTS font_preset TEXT DEFAULT 'sans' CHECK (font_preset IN ('sans', 'serif', 'mono')),
ADD COLUMN IF NOT EXISTS hero_layout TEXT DEFAULT 'center' CHECK (hero_layout IN ('center', 'split', 'banner'));

-- 2. Product Negotiation Toggle
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_negotiation_enabled BOOLEAN DEFAULT FALSE;

-- 3. Negotiations Table
CREATE TABLE IF NOT EXISTS negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  original_price NUMERIC(12,2) NOT NULL,
  offered_price NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'countered', 'accepted', 'rejected', 'expired')),
  last_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Negotiations
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;

-- Buyers can see their own negotiations
CREATE POLICY "Buyers can manage their negotiations" ON negotiations
FOR ALL USING (buyer_id = auth.uid());

-- Agents and Owners can see negotiations for their store
CREATE POLICY "Agents can manage negotiations" ON negotiations
FOR ALL USING (
  agent_id = auth.uid() 
  OR EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid())
);

-- 4. Tiered Badging Infrastructure (Aggregated View)
CREATE OR REPLACE VIEW store_stats AS
SELECT 
  store_id,
  COUNT(id) as total_negotiations,
  COUNT(CASE WHEN status = 'accepted' THEN 1 END) as successful_deals,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_response_seconds
FROM negotiations
GROUP BY store_id;
