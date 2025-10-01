-- Migration: Add analysis_mode column to prompts table
-- Created: 2025-10-01
-- Purpose: Track which analysis mode was used for each prompt

-- Add analysis_mode column with default 'normal'
ALTER TABLE prompts
ADD COLUMN analysis_mode TEXT NOT NULL DEFAULT 'normal';

-- Add check constraint to ensure valid modes
ALTER TABLE prompts
ADD CONSTRAINT analysis_mode_check 
CHECK (analysis_mode IN ('ai', 'normal', 'extensive'));

-- Create index for filtering by mode
CREATE INDEX idx_prompts_analysis_mode 
ON prompts(analysis_mode);

-- Add comment for documentation
COMMENT ON COLUMN prompts.analysis_mode IS 
'Analysis mode used: ai (automated), normal (balanced), or extensive (deep analysis)';
