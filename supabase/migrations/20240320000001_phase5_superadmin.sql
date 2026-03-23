-- 1. Add expiry_date to Tenants
ALTER TABLE public.tenants ADD COLUMN expiry_date TIMESTAMP WITH TIME ZONE;

-- 2. Update role constraint to include superadmin
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('admin', 'sales', 'superadmin'));

-- 3. Make tenant_id nullable because Superadmins might not belong to any specific tenant
ALTER TABLE public.user_profiles ALTER COLUMN tenant_id DROP NOT NULL;

-- 4. Add Superadmin RLS Bypass Policies using direct Subqueries (No Functions Needed)
CREATE POLICY "Superadmins bypass RLS on tenants" ON public.tenants FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "Superadmins bypass RLS on master_cars" ON public.master_cars FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "Superadmins bypass RLS on inventory" ON public.inventory FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "Superadmins bypass RLS on reservations" ON public.reservations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "Superadmins bypass RLS on inventory_logs" ON public.inventory_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'superadmin')
);
