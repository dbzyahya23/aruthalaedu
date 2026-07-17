-- Migration: 005_admin_features.sql

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Izinkan user (admin/guru) mencatat log aktivitas mereka sendiri
CREATE POLICY "Enable insert for authenticated users" 
ON public.audit_logs FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Hanya Admin tingkat atas yang bisa melihat semua log aktivitas
CREATE POLICY "Enable read access for admins" 
ON public.audit_logs FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('SUPER_ADMIN', 'YAYASAN_ADMIN')
    )
);
