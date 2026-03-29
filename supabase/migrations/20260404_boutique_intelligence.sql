-- ============================================================
-- 20260404: Boutique Intelligence & Bargain Suite
-- ============================================================
-- This migration fixes the registration bug and adds tables
-- for negotiations (Bargain Suite) and event tracking (Analytics).
-- ============================================================

-- 1. FIX: Allow 'seller' role in profiles
-- The original constraint might be an inline CHECK or a named constraint.
-- We drop both possibilities just in case.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'client', 'user', 'seller'));

-- 2. Add negotiation support to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_negotiation_enabled BOOLEAN DEFAULT FALSE;

-- 3. Create Negotiations table (The Bargain Suite)
CREATE TABLE IF NOT EXISTS public.negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  proposed_price NUMERIC(12,2) NOT NULL,
  original_price NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'expired')),
  chat_history JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Events table (The Insight Engine)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'view', 'click', 'search'
  entity_type TEXT, -- 'product', 'service', 'category'
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS Policies for Negotiations
ALTER TABLE public.negotiations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own negotiations" 
  ON public.negotiations FOR SELECT 
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Sellers can update their own negotiations" 
  ON public.negotiations FOR UPDATE 
  USING (seller_id = auth.uid());

CREATE POLICY "Buyers can create negotiations" 
  ON public.negotiations FOR INSERT 
  WITH CHECK (buyer_id = auth.uid());

-- 6. RLS Policies for Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert events" 
  ON public.events FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins and Owners can view events" 
  ON public.events FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR user_id = auth.uid()
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_negotiations_buyer ON public.negotiations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_seller ON public.negotiations(seller_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_status ON public.negotiations(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(type, created_at);
CREATE INDEX IF NOT EXISTS idx_events_entity ON public.events(entity_type, entity_id);
