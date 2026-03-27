-- ============================================================
-- EAGLE CHOICE - Complete Database Schema
-- ============================================================
-- This migration creates all tables, indexes, functions,
-- triggers, and Row Level Security policies for the app.
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'client', 'user')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Products (laptops, accessories)
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('laptop', 'accessory')),
  brand TEXT,
  specifications JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Services (Ghana Card, Birth Certificate, Visa)
CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ghana_card', 'birth_certificate', 'visa')),
  is_variable_pricing BOOLEAN DEFAULT false,
  required_documents TEXT[] DEFAULT '{}',
  processing_time_days INTEGER,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order number sequence
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Orders
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL DEFAULT 'EC-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0'),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  order_type TEXT NOT NULL CHECK (order_type IN ('product', 'service')),
  product_id UUID REFERENCES public.products(id),
  service_id UUID REFERENCES public.services(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'payment_pending', 'paid', 'processing', 'completed', 'cancelled')),
  total_amount NUMERIC(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  form_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payments
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'GHS',
  paystack_reference TEXT UNIQUE NOT NULL,
  paystack_access_code TEXT,
  payment_method TEXT,
  provider TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'abandoned')),
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations
CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID NOT NULL REFERENCES public.profiles(id),
  participant_2 UUID NOT NULL REFERENCES public.profiles(id),
  order_id UUID REFERENCES public.orders(id),
  conversation_type TEXT NOT NULL CHECK (conversation_type IN ('order', 'admin_client', 'direct')),
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (participant_1, participant_2, order_id)
);

-- Messages
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Point Configuration (single row)
CREATE TABLE public.point_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  percentage_rate NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  conversion_rate INTEGER NOT NULL DEFAULT 100,
  min_redemption_points INTEGER DEFAULT 1000,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Points Ledger
CREATE TABLE public.points_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  order_id UUID REFERENCES public.orders(id),
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'adjustment')),
  points INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Redemption Requests
CREATE TABLE public.redemption_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  points_amount INTEGER NOT NULL,
  ghs_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  payout_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_client ON public.orders(client_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_payments_order ON public.payments(order_id);
CREATE INDEX idx_payments_reference ON public.payments(paystack_reference);
CREATE INDEX idx_points_ledger_client ON public.points_ledger(client_id);
CREATE INDEX idx_conversations_participants ON public.conversations(participant_1, participant_2);
CREATE INDEX idx_redemption_client ON public.redemption_requests(client_id);

-- ============================================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================================

-- 4a. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4b. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 4c. Update conversation last_message_at on new message
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is client
CREATE OR REPLACE FUNCTION public.is_client()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'client'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- PROFILES ----
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- PRODUCTS ----
CREATE POLICY "products_select_available" ON public.products
  FOR SELECT TO authenticated
  USING (is_available = true OR public.is_admin());

CREATE POLICY "products_insert_admin" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "products_update_admin" ON public.products
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "products_delete_admin" ON public.products
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---- SERVICES ----
CREATE POLICY "services_select_available" ON public.services
  FOR SELECT TO authenticated
  USING (is_available = true OR public.is_admin());

CREATE POLICY "services_insert_admin" ON public.services
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "services_update_admin" ON public.services
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "services_delete_admin" ON public.services
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---- ORDERS ----
CREATE POLICY "orders_select" ON public.orders
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR client_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "orders_insert_user" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_update" ON public.orders
  FOR UPDATE TO authenticated
  USING (
    client_id = auth.uid()
    OR public.is_admin()
  );

-- ---- PAYMENTS ----
CREATE POLICY "payments_select" ON public.payments
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
      AND orders.client_id = auth.uid()
    )
  );

CREATE POLICY "payments_insert" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ---- CONVERSATIONS ----
CREATE POLICY "conversations_select" ON public.conversations
  FOR SELECT TO authenticated
  USING (
    participant_1 = auth.uid()
    OR participant_2 = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "conversations_insert" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    participant_1 = auth.uid()
    OR participant_2 = auth.uid()
  );

-- ---- MESSAGES ----
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- ---- POINT CONFIG ----
CREATE POLICY "point_config_select" ON public.point_config
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "point_config_update_admin" ON public.point_config
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- POINTS LEDGER ----
CREATE POLICY "points_ledger_select" ON public.points_ledger
  FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR public.is_admin());

CREATE POLICY "points_ledger_insert_admin" ON public.points_ledger
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- ---- REDEMPTION REQUESTS ----
CREATE POLICY "redemption_select" ON public.redemption_requests
  FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR public.is_admin());

CREATE POLICY "redemption_insert_client" ON public.redemption_requests
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid() AND public.is_client());

CREATE POLICY "redemption_update_admin" ON public.redemption_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- NOTIFICATIONS ----
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 6. SEED DATA
-- ============================================================

-- Insert default point configuration
INSERT INTO public.point_config (percentage_rate, conversion_rate, min_redemption_points)
VALUES (5.00, 100, 1000);

-- ============================================================
-- 7. STORAGE BUCKETS (run in Supabase dashboard or via API)
-- ============================================================
-- Create buckets: product-images, chat-attachments, avatars
-- product-images: public read, authenticated write
-- chat-attachments: authenticated read/write
-- avatars: public read, authenticated write

-- ============================================================
-- 8. ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
