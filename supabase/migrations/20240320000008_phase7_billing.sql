-- 1. Update Tenants Table for Billing Management
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenants' AND column_name='plan_type') THEN
        ALTER TABLE public.tenants ADD COLUMN plan_type VARCHAR(50) DEFAULT 'BASIC' CHECK (plan_type IN ('BASIC', 'PRO'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenants' AND column_name='status') THEN
        ALTER TABLE public.tenants ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'LOCKED'));
    END IF;

    -- Ensure expiry_date exists (added in phase 5, but making double sure)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenants' AND column_name='expiry_date') THEN
        ALTER TABLE public.tenants ADD COLUMN expiry_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Create Invoices table for payment history
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    order_id VARCHAR(255), -- ID from PayOS or other provider
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on Invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policy for Admins to view their own invoices
CREATE POLICY "Admins can view their own invoices" 
ON public.invoices FOR SELECT 
USING (tenant_id = public.get_current_tenant_id());

-- Policy for Superadmins to manage all invoices
CREATE POLICY "Superadmins can manage all invoices" 
ON public.invoices FOR ALL 
USING (public.is_superadmin());
