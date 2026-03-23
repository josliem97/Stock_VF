-- 1. Create inventory_logs table for audit history
CREATE TABLE public.inventory_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- e.g., 'inline_edit', 'reservation_approval', 'excel_import'
    field_changed VARCHAR(50),
    old_value INT,
    new_value INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- 2. Drop the old basic RLS policies (from phase 1 MVP)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tenants;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.tenants;
DROP POLICY IF EXISTS "Enable all for all" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable all for all" ON public.master_cars;
DROP POLICY IF EXISTS "Enable all for all" ON public.inventory;
DROP POLICY IF EXISTS "Enable all for all" ON public.reservations;

-- 3. Strict RLS Policies based on tenant_id
-- We need a function to get the current user's tenant_id securely
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
    tenant UUID;
BEGIN
    SELECT tenant_id INTO tenant FROM public.user_profiles WHERE id = auth.uid();
    RETURN tenant;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenants: users can only see their own tenant
CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT USING (id = public.get_current_tenant_id());

-- User Profiles: users can see profiles of their own tenant
CREATE POLICY "Users can view profiles in their tenant" ON public.user_profiles
  FOR SELECT USING (tenant_id = public.get_current_tenant_id());
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (id = auth.uid());

-- Master Cars: universally readable (common dictionary)
CREATE POLICY "Anyone can read master_cars" ON public.master_cars
  FOR SELECT USING (true);

-- Inventory: isolated by tenant_id
CREATE POLICY "Users can manage their tenant inventory" ON public.inventory
  FOR ALL USING (tenant_id = public.get_current_tenant_id());

-- Reservations: isolated by tenant_id
CREATE POLICY "Users can manage their tenant reservations" ON public.reservations
  FOR ALL USING (tenant_id = public.get_current_tenant_id());

-- Inventory Logs: isolated by tenant_id
CREATE POLICY "Users can view their tenant inventory logs" ON public.inventory_logs
  FOR SELECT USING (tenant_id = public.get_current_tenant_id());
CREATE POLICY "Users can insert tenant inventory logs" ON public.inventory_logs
  FOR INSERT WITH CHECK (tenant_id = public.get_current_tenant_id());
