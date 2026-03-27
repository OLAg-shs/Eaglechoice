-- Add agent_id columns to products and services to allow admins to assign verified experts
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.profiles(id);
