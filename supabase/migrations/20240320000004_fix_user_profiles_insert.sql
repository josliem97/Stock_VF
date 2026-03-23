-- Add INSERT policy for user_profiles so Admins can create Sales accounts
-- Using policy-based approach to resolve "permission denied" error

DROP POLICY IF EXISTS "Admins can create sales profiles in their tenant" ON public.user_profiles;

CREATE POLICY "Admins can create sales profiles in their tenant" 
ON public.user_profiles FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin' AND tenant_id = public.user_profiles.tenant_id
  )
);

-- Ensure Superadmin can also insert
DROP POLICY IF EXISTS "Superadmins can manage all profiles" ON public.user_profiles;
CREATE POLICY "Superadmins can manage all profiles" 
ON public.user_profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);
