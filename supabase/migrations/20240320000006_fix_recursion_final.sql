-- 1. Use PL/pgSQL to avoid function inlining (which causes infinite recursion in RLS)
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role FROM public.user_profiles WHERE id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'superadmin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Clean up old policies
DROP POLICY IF EXISTS "user_self_access" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_tenant_access" ON public.user_profiles;
DROP POLICY IF EXISTS "superadmin_global_access" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to see their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage tenant profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Superadmins can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can create sales profiles in their tenant" ON public.user_profiles;

-- 3. Apply stable, non-recursive policies
-- Policy A: Every user can always view/edit their own profile
CREATE POLICY "user_self_access" ON public.user_profiles
FOR ALL USING (id = auth.uid());

-- Policy B: Admins can manage all profiles within their own tenant
CREATE POLICY "admin_tenant_access" ON public.user_profiles
FOR ALL USING (
    public.get_current_role() = 'admin'
    AND
    tenant_id = public.get_current_tenant_id()
);

-- Policy C: Superadmins bypass everything
CREATE POLICY "superadmin_global_access" ON public.user_profiles
FOR ALL USING (public.is_superadmin());
