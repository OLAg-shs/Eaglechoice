-- 00002_agent_products.sql

-- 1. Add is_verified back to profiles (only admin can change it)
ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;

-- 2. Add client_id to products
ALTER TABLE public.products ADD COLUMN client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
CREATE INDEX idx_products_client_id ON public.products(client_id);

-- 3. Update Policy for Products to allow Clients to Insert/Update their own products
CREATE POLICY "Clients can insert own products" ON public.products
  FOR INSERT
  WITH CHECK (auth.uid() = client_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'client'));

CREATE POLICY "Clients can update own products" ON public.products
  FOR UPDATE
  USING (auth.uid() = client_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'client'))
  WITH CHECK (auth.uid() = client_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'client'));

CREATE POLICY "Clients can delete own products" ON public.products
  FOR DELETE
  USING (auth.uid() = client_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'client'));
