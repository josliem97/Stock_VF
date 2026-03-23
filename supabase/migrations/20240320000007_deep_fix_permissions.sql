-- FINAL FIX: Zero-Recursion RLS & Explicit Permissions
-- 1. Explicitly grant permissions just in case
GRANT ALL ON TABLE public.user_profiles TO postgres, service_role, authenticated;

-- 2. Drop all previous confusing policies
DROP POLICY IF EXISTS "user_self_access" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_tenant_access" ON public.user_profiles;
DROP POLICY IF EXISTS "superadmin_global_access" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to see their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage tenant profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Superadmins can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can create sales profiles in their tenant" ON public.user_profiles;

-- 3. Robust helper functions using PL/pgSQL (No inlining, Security Definer)
CREATE OR REPLACE FUNCTION public.check_user_role(target_role text)
RETURNS boolean AS $$
DECLARE
    actual_role text;
BEGIN
    SELECT role INTO actual_role FROM public.user_profiles WHERE id = auth.uid();
    RETURN actual_role = target_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS uuid AS $$
BEGIN
    RETURN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Simple, Non-Recursive Policies
-- Policy 1: Personal access (Highest priority)
CREATE POLICY "p1_self" ON public.user_profiles FOR ALL USING (id = auth.uid());

-- Policy 2: Admin tenant access (Only for OTHER rows to prevent recursion)
-- We use the helper functions which bypass RLS
CREATE POLICY "p2_admin" ON public.user_profiles FOR ALL
USING (
  id != auth.uid() -- Only apply to other users
  AND public.check_user_role('admin') 
  AND tenant_id = public.get_my_tenant_id()
);

-- Policy 3: Superadmin bypass
CREATE POLICY "p3_super" ON public.user_profiles FOR ALL 
USING (public.check_user_role('superadmin'));
