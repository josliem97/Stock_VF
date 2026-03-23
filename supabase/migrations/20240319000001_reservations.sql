-- 1. Create Reservations Table
CREATE TABLE public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    sales_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 3. Set basic policies for MVP
CREATE POLICY "Enable all for all" ON public.reservations FOR ALL USING (true);
