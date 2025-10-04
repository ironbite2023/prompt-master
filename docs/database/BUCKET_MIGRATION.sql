-- =====================================================
-- BUCKET CATEGORIZATION SYSTEM MIGRATION
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- Dashboard -> SQL Editor -> New Query
-- =====================================================

-- =====================================================
-- 1. CREATE BUCKETS TABLE
-- =====================================================

-- Create buckets table
CREATE TABLE IF NOT EXISTS public.buckets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#8B5CF6',
    icon TEXT DEFAULT 'folder',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name)
);

-- Create index for faster queries
CREATE INDEX idx_buckets_user_id ON public.buckets(user_id);

-- Enable Row Level Security
ALTER TABLE public.buckets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own buckets
CREATE POLICY "Users can view their own buckets"
    ON public.buckets
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own buckets
CREATE POLICY "Users can insert their own buckets"
    ON public.buckets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own buckets
CREATE POLICY "Users can update their own buckets"
    ON public.buckets
    FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own buckets
CREATE POLICY "Users can delete their own buckets"
    ON public.buckets
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger for buckets table
CREATE TRIGGER on_bucket_updated
    BEFORE UPDATE ON public.buckets
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- =====================================================
-- 2. UPDATE PROMPTS TABLE
-- =====================================================

-- Add bucket_id column to prompts table (nullable initially for migration)
ALTER TABLE public.prompts 
ADD COLUMN IF NOT EXISTS bucket_id UUID REFERENCES public.buckets(id) ON DELETE SET NULL;

-- Create index for faster bucket-based queries
CREATE INDEX IF NOT EXISTS idx_prompts_bucket_id ON public.prompts(bucket_id);

-- =====================================================
-- 3. CREATE DEFAULT BUCKETS FOR EXISTING USERS
-- =====================================================

-- Function to create default buckets for all existing users
CREATE OR REPLACE FUNCTION create_default_buckets_for_users()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    personal_bucket_id UUID;
BEGIN
    -- Loop through all users who have prompts but no buckets
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM public.prompts 
        WHERE user_id IS NOT NULL
    LOOP
        -- Check if user already has buckets
        IF NOT EXISTS (
            SELECT 1 FROM public.buckets WHERE user_id = user_record.user_id
        ) THEN
            -- Create Personal bucket
            INSERT INTO public.buckets (user_id, name, color, icon)
            VALUES (user_record.user_id, 'Personal', '#8B5CF6', 'user')
            RETURNING id INTO personal_bucket_id;
            
            -- Create Work bucket
            INSERT INTO public.buckets (user_id, name, color, icon)
            VALUES (user_record.user_id, 'Work', '#EA580C', 'briefcase');
            
            -- Assign all existing prompts to Personal bucket
            UPDATE public.prompts
            SET bucket_id = personal_bucket_id
            WHERE user_id = user_record.user_id AND bucket_id IS NULL;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create default buckets
SELECT create_default_buckets_for_users();

-- Drop the function as it's no longer needed
DROP FUNCTION create_default_buckets_for_users();

-- =====================================================
-- 4. CREATE TRIGGER FOR NEW USERS
-- =====================================================

-- Function to create default buckets for new users
CREATE OR REPLACE FUNCTION create_default_buckets_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create Personal bucket
    INSERT INTO public.buckets (user_id, name, color, icon)
    VALUES (NEW.id, 'Personal', '#8B5CF6', 'user');
    
    -- Create Work bucket
    INSERT INTO public.buckets (user_id, name, color, icon)
    VALUES (NEW.id, 'Work', '#EA580C', 'briefcase');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default buckets when a new profile is created
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_buckets_for_new_user();

-- =====================================================
-- 5. MAKE BUCKET_ID REQUIRED (AFTER MIGRATION)
-- =====================================================

-- After all existing prompts have bucket_id, make it NOT NULL
-- Run this only after verifying all prompts have a bucket_id
ALTER TABLE public.prompts 
ALTER COLUMN bucket_id SET NOT NULL;

-- =====================================================
-- 6. VERIFY SETUP
-- =====================================================

-- Verify buckets table was created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'buckets';

-- Verify RLS is enabled on buckets
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'buckets';

-- Verify bucket_id column was added to prompts
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'prompts'
  AND column_name = 'bucket_id';

-- Count buckets created
SELECT COUNT(*) as total_buckets FROM public.buckets;

-- Count prompts with bucket assignments
SELECT 
  COUNT(*) as total_prompts,
  COUNT(bucket_id) as prompts_with_bucket
FROM public.prompts;

-- Show sample buckets by user
SELECT user_id, name, color, icon, created_at
FROM public.buckets
ORDER BY created_at
LIMIT 10;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Verify all prompts have been assigned to buckets
-- 2. Update application code to use bucket system
-- 3. Test bucket creation, editing, and deletion
-- =====================================================
