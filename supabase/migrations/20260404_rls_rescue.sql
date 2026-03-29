-- ================================================================
-- EAGLE CHOICE: RLS RESCUE & PRODUCT LAUNCH PATCH
-- ================================================================
-- This migration fixes the "new row violates row-level security policy"
-- error that prevents Sellers from launching products.
-- ================================================================

-- 1. Drop the old admin-only policies
DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
DROP POLICY IF EXISTS "products_update_admin" ON public.products;
DROP POLICY IF EXISTS "products_delete_admin" ON public.products;

-- 2. Create the new Multi-Vendor Identity Policy
-- This allows any logged-in user with a 'seller' role to manage products
-- ONLY IF they are the owner of the store the product belongs to.
CREATE POLICY "Sellers manage their own store products" 
ON public.products
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE public.stores.id = public.products.store_id 
    AND public.stores.owner_id = auth.uid()
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE public.stores.id = public.products.store_id 
    AND public.stores.owner_id = auth.uid()
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. Ensure everyone can see products from active stores
DROP POLICY IF EXISTS "products_select_available" ON public.products;
CREATE POLICY "Public can view products from active stores"
ON public.products
FOR SELECT
TO authenticated, anon
USING (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE public.stores.id = public.products.store_id 
    AND public.stores.is_active = TRUE
  )
  OR is_available = TRUE
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Enable RLS (just in case)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
