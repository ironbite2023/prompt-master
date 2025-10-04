-- =====================================================
-- PROMPT PLAYGROUND - DATABASE MIGRATION
-- =====================================================
-- Run this in Supabase SQL Editor after TASK-09
-- =====================================================

-- =====================================================
-- 1. CREATE PROMPT_ANSWERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.prompt_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answer_text TEXT NOT NULL,
  notes TEXT,
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add helpful comment
COMMENT ON TABLE public.prompt_answers IS 'Stores AI-generated answers from the Prompt Playground feature';

-- =====================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.prompt_answers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own answers
CREATE POLICY "Users can view own prompt answers"
  ON public.prompt_answers FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own answers
CREATE POLICY "Users can insert own prompt answers"
  ON public.prompt_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own answers
CREATE POLICY "Users can delete own prompt answers"
  ON public.prompt_answers FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary lookup: get all answers for a specific prompt
CREATE INDEX IF NOT EXISTS prompt_answers_prompt_id_created_at_idx 
  ON public.prompt_answers(prompt_id, created_at DESC);

-- User lookup: get all answers by a user (for analytics)
CREATE INDEX IF NOT EXISTS prompt_answers_user_id_idx 
  ON public.prompt_answers(user_id);

-- =====================================================
-- 4. ADD HELPFUL CONSTRAINTS
-- =====================================================

-- Ensure answer_text is not empty
ALTER TABLE public.prompt_answers 
  ADD CONSTRAINT answer_text_not_empty 
  CHECK (char_length(trim(answer_text)) > 0);

-- Ensure notes (if provided) are not excessively long
ALTER TABLE public.prompt_answers 
  ADD CONSTRAINT notes_max_length 
  CHECK (notes IS NULL OR char_length(notes) <= 1000);

-- =====================================================
-- 5. VERIFY SETUP
-- =====================================================

-- Check table exists
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'prompt_answers';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'prompt_answers';

-- Check indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'prompt_answers'
  AND schemaname = 'public';

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- Next: Update lib/types.ts with new interfaces
-- =====================================================

