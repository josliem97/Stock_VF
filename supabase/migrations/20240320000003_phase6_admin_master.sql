-- 1. Relax RLS on master_cars to allow admin roles to manage catalog
DROP POLICY IF EXISTS "Anyone can read master_cars" ON public.master_cars;
DROP POLICY IF EXISTS "Admins can manage master_cars" ON public.master_cars;

CREATE POLICY "Anyone can read master_cars" 
ON public.master_cars FOR SELECT 
USING (true);

CREATE POLICY "Admins and Superadmins can manage master_cars" 
ON public.master_cars FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);
