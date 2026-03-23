-- 1. Fix user_profiles RLS to avoid circular dependencies and ensure access for admins
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can create sales profiles in their tenant" ON public.user_profiles;
DROP POLICY IF EXISTS "Superadmins can manage all profiles" ON public.user_profiles;

-- Policy A: Everyone can see their own profile (Crucial for session initialization)
CREATE POLICY "Allow users to see their own profile" 
ON public.user_profiles FOR SELECT 
USING (id = auth.uid());

-- Policy B: Admins can see and manage all profiles in their tenant
-- We use the SECURITY DEFINER function to avoid circularity during RLS evaluation
CREATE POLICY "Admins can manage tenant profiles" 
ON public.user_profiles FOR ALL
USING (
  tenant_id = public.get_current_tenant_id()
);

-- Policy C: Superadmins can manage everything
CREATE POLICY "Superadmins can manage all profiles" 
ON public.user_profiles FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'superadmin')
);

-- 2. Redefine get_current_tenant_id to be more robust
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
  -- We use a direct select which is fine because the function is SECURITY DEFINER
  SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;
