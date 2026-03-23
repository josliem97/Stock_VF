-- Fix missing INSERT policy for invoices
-- This was preventing invoice records from being saved when users click "Pay"
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'invoices' 
        AND policyname = 'Admins can insert their own invoices'
    ) THEN
        CREATE POLICY "Admins can insert their own invoices" 
        ON public.invoices 
        FOR INSERT 
        WITH CHECK (tenant_id = public.get_current_tenant_id());
    END IF;
END $$;

-- Also ensure service role can bypass RLS for webhook
ALTER TABLE public.invoices FORCE ROW LEVEL SECURITY;
