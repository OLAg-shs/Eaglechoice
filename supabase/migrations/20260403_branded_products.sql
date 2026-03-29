-- Add display_config to products table for branded rendering controls
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'display_config'
  ) THEN
    ALTER TABLE public.products
      ADD COLUMN display_config JSONB DEFAULT '{
        "background": "solid",
        "padding": "md",
        "objectFit": "contain",
        "showBranding": true
      }'::jsonb;
  END IF;
END $$;

COMMENT ON COLUMN public.products.display_config IS 
  'Stores visual rendering choices: background style (solid/gradient/glass), padding (sm/md/lg), object-fit (contain/cover), and branding visibility.';
