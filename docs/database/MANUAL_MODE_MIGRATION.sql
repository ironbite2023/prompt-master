-- =====================================================
-- MANUAL MODE SUPPORT MIGRATION (TASK-09)
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- Dashboard -> SQL Editor -> New Query
-- =====================================================

-- =====================================================
-- 1. UPDATE ANALYSIS MODE CONSTRAINTS
-- =====================================================

-- Drop existing constraint if it exists
ALTER TABLE public.prompts 
DROP CONSTRAINT IF EXISTS prompts_analysis_mode_check;

-- Add new constraint that includes 'manual' mode
ALTER TABLE public.prompts 
ADD CONSTRAINT prompts_analysis_mode_check 
CHECK (analysis_mode IN ('ai', 'normal', 'extensive', 'manual'));

-- =====================================================
-- 2. ENSURE ANALYSIS MODE COLUMN PROPERTIES
-- =====================================================

-- Set default value for new records
ALTER TABLE public.prompts 
ALTER COLUMN analysis_mode SET DEFAULT 'normal';

-- Update any existing NULL values to 'normal' (if any)
UPDATE public.prompts 
SET analysis_mode = 'normal' 
WHERE analysis_mode IS NULL;

-- Make analysis_mode NOT NULL (if not already)
ALTER TABLE public.prompts 
ALTER COLUMN analysis_mode SET NOT NULL;

-- =====================================================
-- 3. ADD INDEX FOR ANALYSIS MODE QUERIES
-- =====================================================

-- Create index for faster filtering by analysis mode
CREATE INDEX IF NOT EXISTS idx_prompts_analysis_mode 
ON public.prompts(analysis_mode);

-- Create composite index for user + mode queries
CREATE INDEX IF NOT EXISTS idx_prompts_user_mode 
ON public.prompts(user_id, analysis_mode, created_at DESC);

-- =====================================================
-- 4. VERIFY SETUP
-- =====================================================

-- Check constraint was added
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.prompts'::regclass 
  AND conname LIKE '%analysis_mode%';

-- Check column properties
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'prompts'
  AND column_name = 'analysis_mode';

-- Check indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'prompts' 
  AND indexname LIKE '%analysis_mode%';

-- Count existing records by mode
SELECT 
  analysis_mode, 
  COUNT(*) as count
FROM public.prompts
GROUP BY analysis_mode
ORDER BY count DESC;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- The prompts table now supports:
-- - 'ai': AI mode (automated questions + answers)
-- - 'normal': Normal mode (AI questions, user answers)  
-- - 'extensive': Extensive mode (8-12 detailed questions)
-- - 'manual': Manual mode (quick save, no analysis)
-- =====================================================
