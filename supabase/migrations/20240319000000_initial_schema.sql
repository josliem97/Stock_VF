-- 1. Tenants Table (Đại lý)
CREATE TABLE public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Profiles Table (Extending Supabase Auth users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    role VARCHAR(50) CHECK (role IN ('admin', 'sales')) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Master_Cars Table (Danh mục xe dùng chung)
CREATE TABLE public.master_cars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_type VARCHAR(100) NOT NULL, -- Loại xe (e.g., VF 3, VF 5)
    model_year INT NOT NULL, -- Năm SX (e.g., 2024)
    trim_level VARCHAR(100) NOT NULL, -- Kiểu xe / Phiên bản (e.g., Plus, Base)
    exterior_color VARCHAR(100) NOT NULL, -- Màu ngoại thất
    interior_color VARCHAR(100) NOT NULL, -- Màu nội thất
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Inventory Table (Quản lý tồn kho)
CREATE TABLE public.inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    master_car_id UUID REFERENCES public.master_cars(id) ON DELETE RESTRICT,
    beginning_stock INT DEFAULT 0, -- Tồn đầu
    in_transit INT DEFAULT 0, -- Xe đi đường
    pending_delivery INT DEFAULT 0, -- Ký chờ
    continuous_contract INT DEFAULT 0, -- Xe HĐ nối
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security) - basic setup
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Note: We grant basic public access for testing. Adjust policies before production!
CREATE POLICY "Enable read access for all users" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.tenants FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable all for all" ON public.user_profiles FOR ALL USING (true);
CREATE POLICY "Enable all for all" ON public.master_cars FOR ALL USING (true);
CREATE POLICY "Enable all for all" ON public.inventory FOR ALL USING (true);
