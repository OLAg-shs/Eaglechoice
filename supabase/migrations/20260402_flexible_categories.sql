-- ============================================================
-- 20260402: Relax Category Constraints
-- ============================================================
-- Drops the rigid IN(...) check constraints on product and 
-- service categories to allow for dynamic multi-vendor growth.
-- ============================================================

-- Products Category
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;

-- Services Category
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_category_check;
