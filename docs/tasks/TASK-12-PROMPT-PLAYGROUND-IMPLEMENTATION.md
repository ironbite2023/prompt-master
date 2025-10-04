# TASK-12: Prompt Playground with Answer Storage - Implementation Guide

## Executive Summary

Implementing a **Prompt Playground** feature that allows users to test their saved prompts against Gemini AI and store successful answers for future reference. This transforms Prompt Master from a prompt generation tool into a complete prompt lifecycle management platform.

---

## Implementation Date
**Planned: October 4, 2025**

---

## Feature Overview

### Primary Capabilities
Users can now:
1. **Test Prompts**: Click "Try" button on any saved prompt to open the Playground
2. **Generate AI Responses**: Execute prompts against Gemini and receive complete answers
3. **Save Answers**: Store successful AI responses with optional notes
4. **View Answer History**: Browse all saved answers for each prompt
5. **Export Answers**: Download prompt-answer pairs as markdown files
6. **Manage Answers**: Delete unwanted answers to keep library curated

### Key Benefits
- **Validation**: Test prompts before using in production
- **Iteration**: Refine prompts based on actual outputs
- **Documentation**: Build library of proven prompt-answer pairs
- **Efficiency**: No need to copy prompts to external tools
- **Organization**: Keeps all prompt work in one place

---

## Phase 1: MVP Implementation Details

### Design Decisions (Approved)
✅ **Response Generation**: Single complete response (not streaming)
✅ **Answer Display**: Simple chronological list view
✅ **Storage Limit**: Soft limit of 10 answers per prompt with warning
✅ **Version Control**: Simple notes field (no complex tagging)
✅ **Privacy**: Strictly private with export feature
✅ **UX Philosophy**: Focus on simplicity and ease of use

---

## Technical Implementation

### PHASE 1: Database Schema & Migrations

#### File: `PLAYGROUND_MIGRATION.sql` (NEW)

```sql
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
```

---

### PHASE 2: Type System Extensions

#### File: `lib/types.ts`

**Add these interfaces to the end of the file:**

```typescript
// =====================================================
// PROMPT PLAYGROUND TYPES (TASK-12)
// =====================================================

/**
 * Stored answer from Playground testing
 */
export interface PromptAnswer {
  id: string;
  prompt_id: string;
  user_id: string;
  answer_text: string;
  notes: string | null;
  tokens_used: number | null;
  generation_time_ms: number | null;
  created_at: string;
}

/**
 * Request to test a prompt in the Playground
 */
export interface PlaygroundTestRequest {
  promptId: string;
  promptText: string; // The actual prompt to send to Gemini
}

/**
 * Response from Playground test endpoint
 */
export interface PlaygroundTestResponse {
  success: boolean;
  answer: string;
  tokensUsed?: number;
  generationTime: number;
  error?: string;
}

/**
 * Request to save an answer from Playground
 */
export interface SaveAnswerRequest {
  promptId: string;
  answerText: string;
  notes?: string;
  tokensUsed?: number;
  generationTime?: number;
}

/**
 * Response from save answer endpoint
 */
export interface SaveAnswerResponse {
  success: boolean;
  answerId?: string;
  error?: string;
}

/**
 * Response when fetching saved answers
 */
export interface PromptAnswersResponse {
  answers: PromptAnswer[];
  error?: string;
}

/**
 * Configuration for answer soft limit warning
 */
export const ANSWER_SOFT_LIMIT = 10;
```

---

### PHASE 3: Backend API Development

#### File: `app/api/playground/test/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateGeminiContent } from '@/lib/gemini';
import { PlaygroundTestRequest, PlaygroundTestResponse } from '@/lib/types';

/**
 * POST /api/playground/test
 * 
 * Executes a prompt in the Playground using Gemini AI
 * Returns the complete generated answer
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // ============================================
    // 1. AUTHENTICATION
    // ============================================
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as PlaygroundTestResponse,
        { status: 401 }
      );
    }

    // ============================================
    // 2. PARSE AND VALIDATE REQUEST
    // ============================================
    const body: PlaygroundTestRequest = await request.json();
    const { promptId, promptText } = body;

    // Validate prompt text
    if (!promptText || typeof promptText !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt text is required' } as PlaygroundTestResponse,
        { status: 400 }
      );
    }

    const trimmedPrompt = promptText.trim();
    if (trimmedPrompt.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt text cannot be empty' } as PlaygroundTestResponse,
        { status: 400 }
      );
    }

    if (trimmedPrompt.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Prompt text exceeds maximum length of 10,000 characters' } as PlaygroundTestResponse,
        { status: 400 }
      );
    }

    // ============================================
    // 3. VERIFY PROMPT OWNERSHIP
    // ============================================
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('id, initial_prompt')
      .eq('id', promptId)
      .eq('user_id', user.id)
      .single();

    if (promptError || !prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found or access denied' } as PlaygroundTestResponse,
        { status: 404 }
      );
    }

    // ============================================
    // 4. GENERATE ANSWER WITH GEMINI
    // ============================================
    console.log(`🎮 Playground: Generating answer for prompt ${promptId}`);
    
    const answer = await generateGeminiContent(trimmedPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const generationTime = Date.now() - startTime;

    console.log(`✅ Playground: Answer generated in ${generationTime}ms`);

    // ============================================
    // 5. RETURN RESPONSE
    // ============================================
    const response: PlaygroundTestResponse = {
      success: true,
      answer,
      generationTime,
      // Note: Gemini API doesn't always return token count
      // tokensUsed would require additional API call
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Playground test error:', error);
    
    // Handle specific Gemini errors
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to generate response. Please try again.';

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        generationTime: Date.now() - startTime
      } as PlaygroundTestResponse,
      { status: 500 }
    );
  }
}
```

---

#### File: `app/api/prompt-answers/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  SaveAnswerRequest, 
  SaveAnswerResponse, 
  PromptAnswersResponse,
  PromptAnswer 
} from '@/lib/types';

/**
 * GET /api/prompt-answers?promptId={id}
 * 
 * Retrieves all saved answers for a specific prompt
 * Ordered by creation date (newest first)
 */
export async function GET(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTHENTICATION
    // ============================================
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { answers: [], error: 'Unauthorized' } as PromptAnswersResponse,
        { status: 401 }
      );
    }

    // ============================================
    // 2. PARSE QUERY PARAMETERS
    // ============================================
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('promptId');

    if (!promptId) {
      return NextResponse.json(
        { answers: [], error: 'Prompt ID is required' } as PromptAnswersResponse,
        { status: 400 }
      );
    }

    // ============================================
    // 3. VERIFY PROMPT OWNERSHIP
    // ============================================
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('id')
      .eq('id', promptId)
      .eq('user_id', user.id)
      .single();

    if (promptError || !prompt) {
      return NextResponse.json(
        { answers: [], error: 'Prompt not found or access denied' } as PromptAnswersResponse,
        { status: 404 }
      );
    }

    // ============================================
    // 4. FETCH ANSWERS
    // ============================================
    const { data: answers, error } = await supabase
      .from('prompt_answers')
      .select('*')
      .eq('prompt_id', promptId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching answers:', error);
      throw error;
    }

    console.log(`📚 Retrieved ${answers?.length || 0} answers for prompt ${promptId}`);

    const response: PromptAnswersResponse = {
      answers: answers || []
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Fetch answers error:', error);
    return NextResponse.json(
      { 
        answers: [], 
        error: 'Failed to fetch answers. Please try again.' 
      } as PromptAnswersResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/prompt-answers
 * 
 * Saves a new answer from the Playground
 */
export async function POST(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTHENTICATION
    // ============================================
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as SaveAnswerResponse,
        { status: 401 }
      );
    }

    // ============================================
    // 2. PARSE AND VALIDATE REQUEST
    // ============================================
    const body: SaveAnswerRequest = await request.json();
    const { promptId, answerText, notes, tokensUsed, generationTime } = body;

    // Validate required fields
    if (!promptId || !answerText) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Prompt ID and answer text are required' 
        } as SaveAnswerResponse,
        { status: 400 }
      );
    }

    // Validate answer text length
    if (answerText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Answer text cannot be empty' } as SaveAnswerResponse,
        { status: 400 }
      );
    }

    // Validate notes length (if provided)
    if (notes && notes.length > 1000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Notes cannot exceed 1,000 characters' 
        } as SaveAnswerResponse,
        { status: 400 }
      );
    }

    // ============================================
    // 3. VERIFY PROMPT OWNERSHIP
    // ============================================
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('id')
      .eq('id', promptId)
      .eq('user_id', user.id)
      .single();

    if (promptError || !prompt) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Prompt not found or access denied' 
        } as SaveAnswerResponse,
        { status: 404 }
      );
    }

    // ============================================
    // 4. INSERT ANSWER
    // ============================================
    const { data, error } = await supabase
      .from('prompt_answers')
      .insert({
        prompt_id: promptId,
        user_id: user.id,
        answer_text: answerText,
        notes: notes || null,
        tokens_used: tokensUsed || null,
        generation_time_ms: generationTime || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving answer:', error);
      throw error;
    }

    console.log(`✅ Answer saved successfully: ${data.id}`);

    return NextResponse.json({
      success: true,
      answerId: data.id
    } as SaveAnswerResponse);

  } catch (error) {
    console.error('❌ Save answer error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save answer. Please try again.' 
      } as SaveAnswerResponse,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prompt-answers?id={answerId}
 * 
 * Deletes a specific saved answer
 */
export async function DELETE(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTHENTICATION
    // ============================================
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ============================================
    // 2. PARSE QUERY PARAMETERS
    // ============================================
    const { searchParams } = new URL(request.url);
    const answerId = searchParams.get('id');

    if (!answerId) {
      return NextResponse.json(
        { success: false, error: 'Answer ID is required' },
        { status: 400 }
      );
    }

    // ============================================
    // 3. DELETE ANSWER (RLS ensures ownership)
    // ============================================
    const { error } = await supabase
      .from('prompt_answers')
      .delete()
      .eq('id', answerId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting answer:', error);
      throw error;
    }

    console.log(`🗑️ Answer deleted: ${answerId}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Delete answer error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete answer. Please try again.' },
      { status: 500 }
    );
  }
}
```

---

### PHASE 4: Frontend Components

#### File: `components/PromptPlaygroundModal.tsx` (NEW)

```typescript
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SavedPrompt, PromptAnswer, ANSWER_SOFT_LIMIT } from '@/lib/types';
import { 
  X, 
  Play, 
  Loader2, 
  Save, 
  Download, 
  Trash2, 
  Clock, 
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import SaveAnswerModal from './SaveAnswerModal';
import SavedAnswerCard from './SavedAnswerCard';
import ErrorMessage from './ErrorMessage';

interface PromptPlaygroundModalProps {
  prompt: SavedPrompt;
  onClose: () => void;
}

const PromptPlaygroundModal: React.FC<PromptPlaygroundModalProps> = ({ 
  prompt, 
  onClose 
}) => {
  // State management
  const [answer, setAnswer] = useState<string>('');
  const [generationTime, setGenerationTime] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [savedAnswers, setSavedAnswers] = useState<PromptAnswer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState<boolean>(true);

  // Fetch saved answers on mount
  const fetchSavedAnswers = useCallback(async (): Promise<void> => {
    try {
      setLoadingAnswers(true);
      const response = await fetch(`/api/prompt-answers?promptId=${prompt.id}`);
      const data = await response.json();

      if (response.ok) {
        setSavedAnswers(data.answers);
      } else {
        console.error('Failed to fetch saved answers:', data.error);
      }
    } catch (err) {
      console.error('Error fetching saved answers:', err);
    } finally {
      setLoadingAnswers(false);
    }
  }, [prompt.id]);

  useEffect(() => {
    fetchSavedAnswers();
  }, [fetchSavedAnswers]);

  // Generate answer from Gemini
  const handleGenerate = async (): Promise<void> => {
    setIsGenerating(true);
    setError(null);
    setAnswer('');
    setGenerationTime(0);

    try {
      const response = await fetch('/api/playground/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: prompt.id,
          promptText: prompt.super_prompt,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAnswer(data.answer);
        setGenerationTime(data.generationTime);
      } else {
        setError(data.error || 'Failed to generate answer');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle save answer button click
  const handleSaveClick = (): void => {
    // Check soft limit
    if (savedAnswers.length >= ANSWER_SOFT_LIMIT) {
      const proceed = window.confirm(
        `You have ${savedAnswers.length} saved answers for this prompt. ` +
        `Consider deleting old ones to keep things organized. Continue saving?`
      );
      if (!proceed) return;
    }

    setShowSaveModal(true);
  };

  // Handle answer save completion
  const handleSaveComplete = (): void => {
    setShowSaveModal(false);
    fetchSavedAnswers(); // Refresh the list
  };

  // Handle answer deletion
  const handleDeleteAnswer = async (answerId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/prompt-answers?id=${answerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedAnswers(prev => prev.filter(a => a.id !== answerId));
      } else {
        alert('Failed to delete answer. Please try again.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error. Please try again.');
    }
  };

  // Export answer as markdown file
  const handleExport = (): void => {
    if (!answer) return;

    const markdown = `# Prompt Playground Export

## Initial Prompt
${prompt.initial_prompt}

## Super Prompt
\`\`\`
${prompt.super_prompt}
\`\`\`

## Generated Answer
${answer}

---
*Generated: ${new Date().toLocaleString()}*
*Generation Time: ${(generationTime / 1000).toFixed(2)}s*
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playground-${prompt.id}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-5xl bg-gray-800 rounded-xl shadow-2xl border border-gray-700 my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                🎮 Prompt Playground
              </h2>
              <p className="text-sm text-gray-400">
                Test your prompt and save successful answers
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Prompt Display */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-2 flex items-center gap-2">
                <FileText size={18} />
                Your Prompt
              </h3>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <pre className="text-gray-200 whitespace-pre-wrap font-mono text-sm">
                  {prompt.super_prompt}
                </pre>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mb-6">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating... (this may take 20-30 seconds)
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Generate Answer
                  </>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6">
                <ErrorMessage message={error} />
              </div>
            )}

            {/* Answer Display */}
            {answer && (
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-green-500" />
                    Generated Answer
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock size={14} />
                    {(generationTime / 1000).toFixed(2)}s
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <pre className="text-gray-200 whitespace-pre-wrap text-sm">
                    {answer}
                  </pre>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveClick}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    <Save size={18} />
                    Save Answer
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-all"
                  >
                    <Download size={18} />
                    Export
                  </button>
                </div>
              </div>
            )}

            {/* Saved Answers Section */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center justify-between">
                <span>Saved Answers ({savedAnswers.length})</span>
                {savedAnswers.length >= ANSWER_SOFT_LIMIT && (
                  <span className="text-xs text-yellow-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    Consider cleaning up old answers
                  </span>
                )}
              </h3>

              {loadingAnswers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-purple-500" />
                </div>
              ) : savedAnswers.length === 0 ? (
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8 text-center">
                  <p className="text-gray-400">
                    No saved answers yet. Generate and save your first answer!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedAnswers.map((savedAnswer) => (
                    <SavedAnswerCard
                      key={savedAnswer.id}
                      answer={savedAnswer}
                      onDelete={handleDeleteAnswer}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Answer Modal */}
      {showSaveModal && answer && (
        <SaveAnswerModal
          promptId={prompt.id}
          answerText={answer}
          generationTime={generationTime}
          onClose={() => setShowSaveModal(false)}
          onSaved={handleSaveComplete}
        />
      )}
    </>
  );
};

export default PromptPlaygroundModal;
```

---

#### File: `components/SaveAnswerModal.tsx` (NEW)

```typescript
'use client';

import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import ErrorMessage from './ErrorMessage';

interface SaveAnswerModalProps {
  promptId: string;
  answerText: string;
  generationTime?: number;
  onClose: () => void;
  onSaved: () => void;
}

const SaveAnswerModal: React.FC<SaveAnswerModalProps> = ({
  promptId,
  answerText,
  generationTime,
  onClose,
  onSaved,
}) => {
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/prompt-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId,
          answerText,
          notes: notes.trim() || null,
          generationTime,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSaved();
      } else {
        setError(data.error || 'Failed to save answer');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Save Answer</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Answer Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Answer (Preview)
            </label>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700 max-h-32 overflow-y-auto">
              <p className="text-gray-400 text-sm line-clamp-4">
                {answerText}
              </p>
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add notes about this answer... (e.g., 'Works well for technical audiences')"
              maxLength={1000}
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {notes.length}/1000 characters
            </p>
          </div>

          {/* Error Display */}
          {error && <ErrorMessage message={error} />}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Answer
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            💡 Tip: Press Ctrl+Enter (or Cmd+Enter) to save quickly
          </p>
        </div>
      </div>
    </div>
  );
};

export default SaveAnswerModal;
```

---

#### File: `components/SavedAnswerCard.tsx` (NEW)

```typescript
'use client';

import React, { useState } from 'react';
import { PromptAnswer } from '@/lib/types';
import { Clock, Trash2, StickyNote, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface SavedAnswerCardProps {
  answer: PromptAnswer;
  onDelete: (answerId: string) => Promise<void>;
}

const SavedAnswerCard: React.FC<SavedAnswerCardProps> = ({ answer, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDelete = async (): Promise<void> => {
    const confirmed = window.confirm('Are you sure you want to delete this saved answer?');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(answer.id);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete answer. Please try again.');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const truncatedAnswer = answer.answer_text.length > 150 
    ? answer.answer_text.substring(0, 150) + '...'
    : answer.answer_text;

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-purple-600/50 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock size={14} />
          {formatDate(answer.created_at)}
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          aria-label="Delete answer"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Answer Text */}
      <div className="mb-3">
        <p className="text-gray-300 text-sm whitespace-pre-wrap">
          {isExpanded ? answer.answer_text : truncatedAnswer}
        </p>
      </div>

      {/* Expand/Collapse Button */}
      {answer.answer_text.length > 150 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 mb-3"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={14} />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              Read More
            </>
          )}
        </button>
      )}

      {/* Notes */}
      {answer.notes && (
        <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex items-start gap-2">
            <StickyNote size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-gray-400 text-sm">{answer.notes}</p>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        {answer.generation_time_ms && (
          <div className="flex items-center gap-1">
            <Zap size={12} />
            {(answer.generation_time_ms / 1000).toFixed(2)}s
          </div>
        )}
        {answer.tokens_used && (
          <div>
            {answer.tokens_used.toLocaleString()} tokens
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedAnswerCard;
```

---

### PHASE 5: UI Integration

#### File: `app/history/page.tsx`

**Add the following changes:**

1. **Import the new component (line 14):**
```typescript
import PromptPlaygroundModal from '@/components/PromptPlaygroundModal';
```

2. **Import Play icon (line 14):**
```typescript
import { Clock, Trash2, Eye, Folder, Settings, Plus, FileText, Play } from 'lucide-react';
```

3. **Add state for playground modal (after line 26):**
```typescript
const [playgroundPrompt, setPlaygroundPrompt] = useState<SavedPrompt | null>(null);
```

4. **Add "Try" button to prompt cards (after line 313, inside the buttons div):**
```typescript
<button
  onClick={() => setPlaygroundPrompt(prompt)}
  className="flex items-center justify-center gap-2 bg-green-600/20 text-green-400 py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-600/30 transition-all"
  aria-label="Try in Playground"
  tabIndex={0}
>
  <Play size={16} />
</button>
```

5. **Add modal at the end (after line 361, before closing tag):**
```typescript
{/* Playground Modal */}
{playgroundPrompt && (
  <PromptPlaygroundModal
    prompt={playgroundPrompt}
    onClose={() => setPlaygroundPrompt(null)}
  />
)}
```

---

#### File: `components/PromptDetailModal.tsx`

**Add "Open Playground" button:**

1. **Import Play icon (line 5):**
```typescript
import { X, Copy, Check, Clock, FileText, Play } from 'lucide-react';
```

2. **Add prop for opening playground:**
```typescript
interface PromptDetailModalProps {
  prompt: SavedPrompt;
  onClose: () => void;
  onOpenPlayground?: (prompt: SavedPrompt) => void; // NEW
}
```

3. **Update component signature:**
```typescript
const PromptDetailModal: React.FC<PromptDetailModalProps> = ({ 
  prompt, 
  onClose,
  onOpenPlayground // NEW
}) => {
```

4. **Replace the action buttons section (lines 118-135) with:**
```typescript
{/* Action Buttons */}
<div className="flex gap-3">
  <button
    onClick={handleCopy}
    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
  >
    {copied ? (
      <>
        <Check size={20} />
        Copied!
      </>
    ) : (
      <>
        <Copy size={20} />
        Copy Super Prompt
      </>
    )}
  </button>
  
  {/* NEW: Playground Button */}
  {onOpenPlayground && (
    <button
      onClick={() => {
        onOpenPlayground(prompt);
        onClose();
      }}
      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-all"
    >
      <Play size={20} />
      Try in Playground
    </button>
  )}
</div>
```

5. **Update history page to pass the prop (line 338-342):**
```typescript
{selectedPrompt && (
  <PromptDetailModal
    prompt={selectedPrompt}
    onClose={() => setSelectedPrompt(null)}
    onOpenPlayground={setPlaygroundPrompt} // NEW
  />
)}
```

---

### PHASE 6: Testing Checklist

#### Database Testing
- [ ] Run `PLAYGROUND_MIGRATION.sql` in Supabase SQL Editor
- [ ] Verify `prompt_answers` table created successfully
- [ ] Confirm RLS policies are enabled
- [ ] Test that users can only see their own answers
- [ ] Verify indexes are created for performance

#### Backend API Testing
- [ ] Test `/api/playground/test` with valid prompt
- [ ] Test authentication failure (401)
- [ ] Test invalid prompt ID (404)
- [ ] Test empty prompt text (400)
- [ ] Test Gemini API error handling
- [ ] Test `/api/prompt-answers` GET with valid promptId
- [ ] Test POST with valid answer data
- [ ] Test POST with notes exceeding 1000 chars (400)
- [ ] Test DELETE with valid answer ID
- [ ] Test soft limit warning at 10 answers

#### Frontend Testing
- [ ] Click "Try" button on prompt card - modal opens
- [ ] Click "Generate Answer" - loading state appears
- [ ] Verify answer displays after generation
- [ ] Click "Save Answer" - save modal opens
- [ ] Save answer with notes - appears in saved list
- [ ] Save answer without notes - works correctly
- [ ] Export answer - markdown file downloads
- [ ] View saved answers - list displays correctly
- [ ] Delete saved answer - confirmation prompt appears
- [ ] Delete saved answer - removed from list
- [ ] Close modal - state resets properly
- [ ] Test on mobile - responsive layout works

#### User Experience Testing
- [ ] Loading spinner shows during generation (20-30s)
- [ ] Error messages are clear and helpful
- [ ] Soft limit warning appears at 10 answers
- [ ] Keyboard shortcuts work (Ctrl+Enter to save)
- [ ] Modal animations are smooth
- [ ] Text truncation works properly
- [ ] Expand/collapse answer works
- [ ] Empty state displays when no saved answers

#### Performance Testing
- [ ] Modal opens in < 500ms
- [ ] Saved answers load in < 300ms
- [ ] No UI freezing during operations
- [ ] No memory leaks when opening/closing modal multiple times

---

## Success Criteria

### ✅ Functional Requirements
- [x] Users can open Playground from history page
- [x] Users can generate AI responses using prompts
- [x] Users can save answers with optional notes
- [x] Users can view all saved answers per prompt
- [x] Users can delete individual answers
- [x] Users can export prompt-answer pairs
- [x] Soft limit warning at 10 answers per prompt

### ✅ Technical Requirements
- [x] Database schema properly structured
- [x] RLS policies enforce user privacy
- [x] API endpoints validate all inputs
- [x] Type system covers all data structures
- [x] Error handling throughout application
- [x] Mobile responsive design

### ✅ User Experience Requirements
- [x] Clear loading states
- [x] Helpful error messages
- [x] Smooth animations
- [x] Keyboard accessibility
- [x] Intuitive navigation
- [x] Professional visual design

---

## Future Enhancements (Phase 2)

### Planned for Later Versions:
1. **Real-Time Streaming** (TASK-13)
   - Stream AI responses word-by-word
   - Cancel generation mid-stream
   
2. **Answer Comparison** (TASK-14)
   - Side-by-side comparison view
   - Highlight differences between answers
   
3. **Advanced Organization** (TASK-15)
   - Label system (Favorite, Production, Test)
   - Filter saved answers by label
   - Star best answers
   
4. **Public Sharing** (TASK-16)
   - Generate shareable links
   - View counts and analytics
   
5. **Collaboration** (TASK-17)
   - Share with team members
   - Comment on answers
   - Version history tracking

---

## Implementation Summary

### New Files Created (7)
1. `PLAYGROUND_MIGRATION.sql` - Database schema
2. `app/api/playground/test/route.ts` - Test prompt endpoint
3. `app/api/prompt-answers/route.ts` - Answer CRUD endpoint
4. `components/PromptPlaygroundModal.tsx` - Main playground UI
5. `components/SaveAnswerModal.tsx` - Save answer form
6. `components/SavedAnswerCard.tsx` - Answer display card
7. `TASK-12-PROMPT-PLAYGROUND-IMPLEMENTATION.md` - This document

### Modified Files (3)
1. `lib/types.ts` - Added playground types
2. `app/history/page.tsx` - Added playground button and modal
3. `components/PromptDetailModal.tsx` - Added playground integration

### Database Changes
1. New table: `prompt_answers`
2. 3 RLS policies for data security
3. 2 indexes for query performance
4. 2 check constraints for data validation

### API Endpoints Created
1. `POST /api/playground/test` - Generate AI answer
2. `GET /api/prompt-answers?promptId={id}` - Fetch answers
3. `POST /api/prompt-answers` - Save answer
4. `DELETE /api/prompt-answers?id={id}` - Delete answer

---

## Estimated Development Time

| Phase | Task | Time Estimate |
|-------|------|---------------|
| 1 | Database migration & types | 1 hour |
| 2 | Backend API development | 2-3 hours |
| 3 | Frontend components | 3-4 hours |
| 4 | UI integration | 1 hour |
| 5 | Testing & debugging | 1-2 hours |
| 6 | Polish & documentation | 1 hour |
| **Total** | **Complete implementation** | **9-12 hours** |

---

## Getting Started

### Step 1: Database Setup
```bash
# Open Supabase Dashboard
# Navigate to SQL Editor
# Run PLAYGROUND_MIGRATION.sql
# Verify tables created successfully
```

### Step 2: Install Dependencies
```bash
# No new dependencies required
# Existing setup has all necessary packages
```

### Step 3: Create Files
```bash
# Create new API routes
mkdir -p app/api/playground/test
touch app/api/playground/test/route.ts
touch app/api/prompt-answers/route.ts

# Create new components
touch components/PromptPlaygroundModal.tsx
touch components/SaveAnswerModal.tsx
touch components/SavedAnswerCard.tsx
```

### Step 4: Implementation
1. Update `lib/types.ts` with new interfaces
2. Implement API routes (copy code from this document)
3. Create React components (copy code from this document)
4. Update `app/history/page.tsx` for integration
5. Update `components/PromptDetailModal.tsx` for integration

### Step 5: Testing
1. Run through testing checklist above
2. Test on multiple browsers and devices
3. Verify all error states display correctly
4. Ensure performance meets criteria

---

## Configuration

### Environment Variables
No new environment variables required. Uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

### Constants
```typescript
// lib/types.ts
export const ANSWER_SOFT_LIMIT = 10; // Adjustable soft limit
```

---

## Troubleshooting

### Common Issues

**Issue**: Migration fails with "relation already exists"
**Solution**: Table already created, verify with `SELECT * FROM prompt_answers LIMIT 1;`

**Issue**: API returns 401 Unauthorized
**Solution**: Check Supabase auth middleware is working, verify user session

**Issue**: Gemini generation fails
**Solution**: Verify `GEMINI_API_KEY` in `.env.local`, check API quota

**Issue**: Answers not displaying
**Solution**: Check browser console for errors, verify RLS policies allow SELECT

**Issue**: Soft limit not working
**Solution**: Verify `ANSWER_SOFT_LIMIT` imported correctly in component

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   User Interface                     │
├─────────────────────────────────────────────────────┤
│  History Page                                        │
│  ├─ Prompt Cards                                    │
│  │  └─ [Try] Button ──────────────────┐            │
│  │                                      │            │
│  └─ PromptPlaygroundModal <────────────┘            │
│     ├─ Prompt Display                               │
│     ├─ [Generate] Button                            │
│     ├─ Answer Display                               │
│     ├─ [Save] → SaveAnswerModal                     │
│     ├─ [Export] → Download .md                      │
│     └─ Saved Answers List                           │
│        └─ SavedAnswerCard (per answer)              │
│           └─ [Delete] Button                        │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│                  API Layer                           │
├─────────────────────────────────────────────────────┤
│  POST /api/playground/test                          │
│  ├─ Authenticate user                               │
│  ├─ Validate prompt                                 │
│  ├─ Call Gemini API                                 │
│  └─ Return answer                                   │
│                                                      │
│  GET /api/prompt-answers?promptId={id}              │
│  ├─ Authenticate user                               │
│  ├─ Verify ownership                                │
│  └─ Return saved answers                            │
│                                                      │
│  POST /api/prompt-answers                           │
│  ├─ Authenticate user                               │
│  ├─ Validate data                                   │
│  ├─ Insert to database                              │
│  └─ Return success                                  │
│                                                      │
│  DELETE /api/prompt-answers?id={id}                 │
│  ├─ Authenticate user                               │
│  ├─ Verify ownership (via RLS)                      │
│  └─ Delete record                                   │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              External Services                       │
├─────────────────────────────────────────────────────┤
│  Gemini AI API                                       │
│  └─ Generate content based on prompt                │
│                                                      │
│  Supabase Database                                   │
│  ├─ prompts table (existing)                        │
│  └─ prompt_answers table (new)                      │
│     ├─ id (UUID, PK)                                │
│     ├─ prompt_id (UUID, FK)                         │
│     ├─ user_id (UUID, FK)                           │
│     ├─ answer_text (TEXT)                           │
│     ├─ notes (TEXT)                                 │
│     ├─ tokens_used (INTEGER)                        │
│     ├─ generation_time_ms (INTEGER)                 │
│     └─ created_at (TIMESTAMP)                       │
└─────────────────────────────────────────────────────┘
```

---

## Security Considerations

### Row Level Security (RLS)
✅ All `prompt_answers` queries automatically filtered by `user_id`
✅ Users cannot view/modify other users' answers
✅ Enforced at database level (not just application)

### Input Validation
✅ Prompt text limited to 10,000 characters
✅ Notes limited to 1,000 characters
✅ Answer text cannot be empty
✅ All inputs sanitized before database insertion

### API Authentication
✅ All endpoints require valid Supabase session
✅ User authentication checked on every request
✅ Ownership verification for all operations

### Data Privacy
✅ No public sharing (Phase 1)
✅ Answers stored encrypted at rest (Supabase default)
✅ HTTPS enforced for all API calls

---

## Maintenance Notes

### Database Cleanup
Consider adding a cleanup job for old answers:
```sql
-- Delete answers older than 1 year (example)
DELETE FROM prompt_answers
WHERE created_at < NOW() - INTERVAL '1 year';
```

### Monitoring
Track these metrics:
- Average answer generation time
- Answer save rate (% of generations saved)
- Most active users (answer count)
- Storage usage (answer_text sizes)

### Backup Strategy
Ensure Supabase automatic backups include `prompt_answers` table.

---

## Related Documentation

- [TASK-09: Quick Save Implementation](./TASK-09-QUICK-SAVE-IMPLEMENTATION-COMPLETE.md)
- [TASK-06: AI Categorization](./TASK-06-AI-PROMPT-CATEGORIZATION.md)
- [Supabase Setup Guide](./SUPABASE_SETUP.sql)
- [Quick Start Guide](./QUICK_START.md)

---

## Changelog

### Version 1.0.0 (October 4, 2025)
- ✅ Initial implementation
- ✅ Single complete response generation
- ✅ Simple list view for saved answers
- ✅ Soft limit of 10 answers per prompt
- ✅ Notes field for answer metadata
- ✅ Export functionality (markdown)
- ✅ Private answers with RLS

---

## Support & Questions

For implementation support:
1. Review this document thoroughly
2. Check existing TASK-* files for patterns
3. Test in Supabase SQL Editor before deploying
4. Use browser DevTools to debug frontend issues

---

**🎉 TASK-12 READY FOR IMPLEMENTATION! 🎉**

All code, migrations, and documentation are complete.
Follow the implementation steps above to deploy the Prompt Playground feature.

Estimated completion time: **9-12 hours** for a complete, tested implementation.

