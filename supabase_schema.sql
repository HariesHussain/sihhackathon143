-- ==========================================================
-- FoodResQ - Complete Supabase Database Schema (DDL)
-- Problem Statement: SIH26234 (MoFPI)
-- Tagline: Rescue Food. Reduce Waste.
-- ==========================================================

-- 1. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('kitchen_operator', 'ngo', 'admin')),
    organization_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Kitchens Table
CREATE TABLE IF NOT EXISTS public.kitchens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    capacity INT NOT NULL DEFAULT 500,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NGOs / Community Kitchens Table
CREATE TABLE IF NOT EXISTS public.ngos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    contact TEXT NOT NULL,
    beneficiary_capacity INT NOT NULL DEFAULT 150,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Meal Demand Predictions Table
CREATE TABLE IF NOT EXISTS public.meal_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kitchen_id UUID REFERENCES public.kitchens(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL,
    date DATE NOT NULL,
    expected_diners INT NOT NULL,
    predicted_quantity INT NOT NULL,
    recommended_cooking INT NOT NULL,
    buffer_quantity INT NOT NULL,
    waste_prevented_kg NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    weather_condition TEXT,
    is_exam_period BOOLEAN DEFAULT FALSE,
    is_holiday BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Food Batches Table
CREATE TABLE IF NOT EXISTS public.food_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kitchen_id UUID REFERENCES public.kitchens(id) ON DELETE CASCADE,
    food_name TEXT NOT NULL,
    prepared_portions INT NOT NULL,
    recommended_portions INT NOT NULL,
    surplus_portions INT NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'portions',
    status TEXT NOT NULL CHECK (status IN ('COOKED', 'INSPECTED', 'SURPLUS_DECLARED', 'MATCHED', 'DELIVERED', 'DISCARDED')),
    prepared_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Food Inspections Table (Strictly 3 photos)
CREATE TABLE IF NOT EXISTS public.food_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_batch_id UUID REFERENCES public.food_batches(id) ON DELETE CASCADE,
    freshness_score NUMERIC(5, 2) NOT NULL,
    grade TEXT NOT NULL CHECK (grade IN ('GRADE_A', 'GRADE_B', 'INEDIBLE')),
    safe_window_minutes INT NOT NULL,
    recommendation TEXT NOT NULL,
    image_url_top TEXT NOT NULL,
    image_url_side TEXT NOT NULL,
    image_url_closeup TEXT NOT NULL,
    observations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Surplus Declarations Table
CREATE TABLE IF NOT EXISTS public.surplus_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_batch_id UUID REFERENCES public.food_batches(id) ON DELETE CASCADE,
    quantity_portions INT NOT NULL,
    quantity_kg NUMERIC(8, 2) NOT NULL,
    available_until TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'REQUESTED', 'CLAIMED', 'EXPIRED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Redistribution Requests Table
CREATE TABLE IF NOT EXISTS public.redistribution_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    surplus_id UUID REFERENCES public.surplus_declarations(id) ON DELETE CASCADE,
    ngo_id UUID REFERENCES public.ngos(id) ON DELETE CASCADE,
    portions INT NOT NULL,
    distance_km NUMERIC(6, 2) NOT NULL,
    estimated_time_mins INT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING_NGO', 'ACCEPTED', 'DECLINED', 'IN_TRANSIT', 'COMPLETED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Dispatches & Handover OTP Table
CREATE TABLE IF NOT EXISTS public.dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    redistribution_request_id UUID REFERENCES public.redistribution_requests(id) ON DELETE CASCADE,
    pickup_time TIMESTAMPTZ,
    delivery_time TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('SCHEDULED', 'PICKED_UP', 'DELIVERED')),
    otp VARCHAR(6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Impact Metrics Table
CREATE TABLE IF NOT EXISTS public.impact_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kitchen_id UUID REFERENCES public.kitchens(id) ON DELETE CASCADE,
    food_saved_kg NUMERIC(10, 2) DEFAULT 0.0,
    meals_rescued INT DEFAULT 0,
    money_saved_inr NUMERIC(12, 2) DEFAULT 0.0,
    co2_avoided_kg NUMERIC(10, 2) DEFAULT 0.0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surplus_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redistribution_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read active food rescue data
CREATE POLICY "Public read active surplus" ON public.surplus_declarations FOR SELECT USING (true);
CREATE POLICY "Public read NGOs" ON public.ngos FOR SELECT USING (true);
CREATE POLICY "Public read Kitchens" ON public.kitchens FOR SELECT USING (true);
