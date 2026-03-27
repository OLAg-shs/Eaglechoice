-- Create settings table for platform configuration
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Initial settings
INSERT INTO public.settings (key, value, description)
VALUES ('admin_payout_number', '', 'The phone number where the admin receives payouts')
ON CONFLICT (key) DO NOTHING;

-- RLS for settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are viewable by all authenticated users"
ON public.settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Settings can be updated by admins only"
ON public.settings FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
