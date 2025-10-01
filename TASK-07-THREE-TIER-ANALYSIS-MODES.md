# TASK-07: Three-Tier Analysis Mode System

## Overview

This task implements a flexible analysis mode system that allows users to choose between three distinct levels of prompt analysis:

- **AI Mode**: Fully automated analysis with AI-generated questions and answers
- **Normal Mode**: Current balanced approach with user-provided answers
- **Extensive Mode**: Deep analysis with 8-12 comprehensive questions

## Benefits

### User Benefits
- **Flexibility**: Choose analysis depth based on time and requirements
- **Speed**: AI Mode provides instant results for quick tasks
- **Quality**: Extensive Mode ensures maximum refinement for critical prompts
- **Control**: Normal Mode maintains familiar workflow

### Business Benefits
- **User Satisfaction**: Accommodates different user personas and use cases
- **Competitive Advantage**: Unique multi-mode analysis feature
- **Analytics**: Insights into user preferences and behavior patterns
- **Scalability**: Supports diverse scenarios from quick drafts to critical tasks

---

## Implementation Steps

### STEP 1: Type System Extensions

#### 1.1 Update `lib/types.ts`

Add the following types and enums:

```typescript
// =====================================================
// ANALYSIS MODE TYPES (TASK-07)
// =====================================================

/**
 * Analysis mode enum - determines the depth and automation level
 */
export enum AnalysisMode {
  AI = 'ai',           // Automated: AI generates and answers questions
  NORMAL = 'normal',   // Balanced: AI generates, user answers
  EXTENSIVE = 'extensive' // Deep: AI generates 8-12 comprehensive questions
}

/**
 * Metadata for each analysis mode
 */
export interface AnalysisModeMetadata {
  id: AnalysisMode;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  colorClass: string; // Tailwind classes for visual distinction
  estimatedTime: string;
  questionCount: string;
  badge: {
    text: string;
    colorClass: string;
  };
}

/**
 * Mode-specific configuration
 */
export interface ModeConfig {
  minQuestions: number;
  maxQuestions: number;
  temperature: number;
  maxOutputTokens: number;
  autoAnswer: boolean;
}
```

Update existing interfaces:

```typescript
// Update AnalyzeResponse
export interface AnalyzeResponse {
  questions: Question[];
  mode: AnalysisMode; // NEW: Track which mode was used
  autoAnswers?: Record<number, string>; // NEW: AI Mode auto-generated answers
  error?: string;
}

// Update SavedPrompt
export interface SavedPrompt {
  id: string;
  user_id: string;
  initial_prompt: string;
  questions: Question[] | null;
  answers: Record<number, string> | null;
  super_prompt: string;
  bucket_id: string;
  category: PromptCategory;
  analysis_mode: AnalysisMode; // NEW: Track analysis mode used
  created_at: string;
  bucket?: Bucket;
}

// Update AppState
export interface AppState {
  currentStage: Stage;
  initialPrompt: string;
  selectedMode: AnalysisMode; // NEW: Currently selected mode
  questions: Question[];
  answers: Record<number, string>;
  superPrompt: string;
  loading: boolean;
  error: string | null;
}
```

---

### STEP 2: Mode Configuration

#### 2.1 Create `lib/modeConfig.ts`

```typescript
import { AnalysisMode, AnalysisModeMetadata, ModeConfig } from './types';
import { Zap, Brain, Microscope } from 'lucide-react';

/**
 * Configuration for each analysis mode
 */
export const MODE_CONFIGS: Record<AnalysisMode, ModeConfig> = {
  [AnalysisMode.AI]: {
    minQuestions: 4,
    maxQuestions: 6,
    temperature: 0.7,
    maxOutputTokens: 3072,
    autoAnswer: true,
  },
  [AnalysisMode.NORMAL]: {
    minQuestions: 4,
    maxQuestions: 6,
    temperature: 0.7,
    maxOutputTokens: 2048,
    autoAnswer: false,
  },
  [AnalysisMode.EXTENSIVE]: {
    minQuestions: 8,
    maxQuestions: 12,
    temperature: 0.8,
    maxOutputTokens: 4096,
    autoAnswer: false,
  },
};

/**
 * Display metadata for each mode
 */
export const MODE_METADATA: Record<AnalysisMode, AnalysisModeMetadata> = {
  [AnalysisMode.AI]: {
    id: AnalysisMode.AI,
    name: 'AI Mode',
    description: 'AI automatically analyzes and answers all questions. Perfect for quick tasks and time-sensitive needs.',
    icon: 'Zap',
    colorClass: 'from-green-500 to-emerald-500',
    estimatedTime: '~30 seconds',
    questionCount: '4-6 questions (auto-filled)',
    badge: {
      text: 'Fastest',
      colorClass: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
  },
  [AnalysisMode.NORMAL]: {
    id: AnalysisMode.NORMAL,
    name: 'Normal Mode',
    description: 'Balanced approach with AI-generated questions and your input. Ideal for most use cases.',
    icon: 'Brain',
    colorClass: 'from-blue-500 to-cyan-500',
    estimatedTime: '~2-3 minutes',
    questionCount: '4-6 questions',
    badge: {
      text: 'Balanced',
      colorClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
  },
  [AnalysisMode.EXTENSIVE]: {
    id: AnalysisMode.EXTENSIVE,
    name: 'Extensive Mode',
    description: 'Deep analysis with comprehensive questions covering all aspects. Best for complex, critical prompts.',
    icon: 'Microscope',
    colorClass: 'from-purple-500 to-pink-500',
    estimatedTime: '~5-7 minutes',
    questionCount: '8-12 questions',
    badge: {
      text: 'Most Detailed',
      colorClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
  },
};

/**
 * Get configuration for a specific mode
 */
export const getModeConfig = (mode: AnalysisMode): ModeConfig => {
  return MODE_CONFIGS[mode];
};

/**
 * Get metadata for a specific mode
 */
export const getModeMetadata = (mode: AnalysisMode): AnalysisModeMetadata => {
  return MODE_METADATA[mode];
};
```

---

### STEP 3: Enhanced AI Prompts

#### 3.1 Update `lib/prompts.ts`

Add mode-specific prompts:

```typescript
/**
 * AI Mode: Generate questions AND auto-fill answers
 */
export const AI_MODE_ANALYSIS_PROMPT = `You are an expert prompt engineer. Analyze the following user prompt and generate 4-6 clarifying questions that would help refine it into a high-quality super prompt.

IMPORTANT: For each question, also provide an intelligent, well-reasoned answer based on:
- Context clues in the original prompt
- Best practices for similar tasks
- Common user intentions
- Industry standards

Return a JSON object with this EXACT structure:
{
  "questions": [
    {
      "question": "Clear, specific question",
      "suggestion": "Helpful example or placeholder"
    }
  ],
  "autoAnswers": {
    "0": "Your intelligent answer to question 1",
    "1": "Your intelligent answer to question 2",
    ...
  }
}

Guidelines for auto-answers:
- Be specific and actionable
- Make reasonable assumptions based on context
- Provide professional, industry-standard responses
- Consider the most common use case
- If uncertain, provide a safe, versatile answer

User's prompt: `;

/**
 * Normal Mode: Current behavior (questions only)
 */
export const NORMAL_MODE_ANALYSIS_PROMPT = `You are an expert prompt engineer. Analyze the following user prompt and generate 4-6 clarifying questions that would help refine it into a high-quality super prompt.

Focus on:
- Understanding the user's goals and context
- Identifying missing critical information
- Clarifying tone, style, and format preferences
- Determining target audience and constraints

Return ONLY a JSON array of questions with this structure:
[
  {
    "question": "Clear, specific question",
    "suggestion": "Helpful example or placeholder"
  }
]

User's prompt: `;

/**
 * Extensive Mode: Deep analysis with 8-12 comprehensive questions
 */
export const EXTENSIVE_MODE_ANALYSIS_PROMPT = `You are an expert prompt engineer performing a COMPREHENSIVE, DEEP analysis. Generate 8-12 detailed clarifying questions that explore EVERY aspect of the user's request.

Cover ALL of these dimensions:
1. **Context & Background**: What's the bigger picture? What problem is being solved?
2. **Target Audience**: Who will consume/use this output? What's their expertise level?
3. **Tone & Voice**: Formal/casual? Professional/friendly? Technical/accessible?
4. **Format & Structure**: How should the output be organized? What format?
5. **Constraints & Limitations**: Word count, time limits, specific requirements?
6. **Goals & Objectives**: What does success look like? What should this achieve?
7. **Examples & References**: Are there examples to follow or avoid?
8. **Edge Cases & Scenarios**: What special situations should be considered?
9. **Deliverables & Outputs**: What exactly should be produced?
10. **Success Metrics**: How will quality be measured?

Return ONLY a JSON array of 8-12 questions with this structure:
[
  {
    "question": "Detailed, probing question",
    "suggestion": "Comprehensive example or guidance"
  }
]

Make questions:
- Specific and actionable
- Non-overlapping
- Progressively detailed
- Cover different aspects

User's prompt: `;

// Keep existing GENERATION_PROMPT and update if needed
export const GENERATION_PROMPT = `You are an expert prompt engineer. Your task is to create an optimized "super prompt" based on the user's initial prompt and their answers to clarifying questions.

The super prompt should:
- Be clear, specific, and comprehensive
- Incorporate all relevant context from the answers
- Be structured and well-organized
- Include all necessary constraints and requirements
- Be ready to use with any AI model

Initial Prompt: {initialPrompt}

Questions and Answers:
{questionsAndAnswers}

Create a refined, production-ready super prompt that incorporates all this information. Return ONLY the super prompt text, nothing else.`;
```

---

### STEP 4: Update Analyze API

#### 4.1 Update `app/api/analyze/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, DEFAULT_MODEL } from '@/lib/gemini';
import {
  AI_MODE_ANALYSIS_PROMPT,
  NORMAL_MODE_ANALYSIS_PROMPT,
  EXTENSIVE_MODE_ANALYSIS_PROMPT,
} from '@/lib/prompts';
import { Question, AnalysisMode, AnalyzeResponse } from '@/lib/types';
import { requireAuth } from '@/lib/auth/middleware';
import { getModeConfig } from '@/lib/modeConfig';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Check authentication
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    const { prompt, mode = AnalysisMode.NORMAL } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Invalid prompt provided' },
        { status: 400 }
      );
    }

    // Validate mode
    if (!Object.values(AnalysisMode).includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid analysis mode' },
        { status: 400 }
      );
    }

    // Get mode configuration
    const config = getModeConfig(mode);

    // Select appropriate prompt template
    let analysisPrompt: string;
    switch (mode) {
      case AnalysisMode.AI:
        analysisPrompt = AI_MODE_ANALYSIS_PROMPT;
        break;
      case AnalysisMode.EXTENSIVE:
        analysisPrompt = EXTENSIVE_MODE_ANALYSIS_PROMPT;
        break;
      case AnalysisMode.NORMAL:
      default:
        analysisPrompt = NORMAL_MODE_ANALYSIS_PROMPT;
        break;
    }

    // Initialize Gemini client
    const ai = getGeminiClient();

    // Generate analysis
    const fullPrompt = analysisPrompt + prompt;
    
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: fullPrompt,
      config: {
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens,
      }
    });

    const responseText = response.text;
    
    if (!responseText) {
      throw new Error('No response from AI model');
    }

    // Parse response based on mode
    let questions: Question[];
    let autoAnswers: Record<number, string> | undefined;

    try {
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      if (mode === AnalysisMode.AI) {
        // AI Mode: Parse both questions and autoAnswers
        const parsed = JSON.parse(cleanedText);
        questions = parsed.questions || [];
        autoAnswers = parsed.autoAnswers || {};
      } else {
        // Normal/Extensive Mode: Parse questions only
        questions = JSON.parse(cleanedText);
      }
      
      // Validate the response format
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions format');
      }

      // Validate question count based on mode
      if (questions.length < config.minQuestions) {
        throw new Error(`Expected at least ${config.minQuestions} questions for ${mode} mode`);
      }

      // Trim to max if needed
      if (questions.length > config.maxQuestions) {
        questions = questions.slice(0, config.maxQuestions);
      }
      
      // Ensure each question has required fields
      questions = questions.map((q) => ({
        question: q.question || '',
        suggestion: q.suggestion || ''
      }));
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Return mode-appropriate fallback questions
      questions = getFallbackQuestions(mode);
      
      if (mode === AnalysisMode.AI) {
        autoAnswers = getFallbackAutoAnswers();
      }
    }

    console.log(`[API] User ${user.id} analyzed prompt with ${mode} mode`);

    const apiResponse: AnalyzeResponse = {
      questions,
      mode,
      ...(autoAnswers && { autoAnswers }),
    };

    return NextResponse.json(apiResponse);

  } catch (error) {
    console.error('Error in analyze API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to analyze prompt: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Get fallback questions based on mode
 */
function getFallbackQuestions(mode: AnalysisMode): Question[] {
  const baseQuestions: Question[] = [
    {
      question: 'Who is the target audience for this content?',
      suggestion: 'e.g., beginners, professionals, students, general public'
    },
    {
      question: 'What tone and style should be used?',
      suggestion: 'e.g., formal, casual, technical, conversational'
    },
    {
      question: 'What format should the output be in?',
      suggestion: 'e.g., essay, bullet points, step-by-step guide'
    },
    {
      question: 'Are there any specific constraints or requirements?',
      suggestion: 'e.g., word count, specific topics to include/avoid'
    }
  ];

  if (mode === AnalysisMode.EXTENSIVE) {
    return [
      ...baseQuestions,
      {
        question: 'What is the primary goal or objective?',
        suggestion: 'e.g., educate, persuade, inform, entertain'
      },
      {
        question: 'What is the context or background for this request?',
        suggestion: 'e.g., project type, industry, use case'
      },
      {
        question: 'Are there any examples or references to follow?',
        suggestion: 'e.g., similar content, style guides, templates'
      },
      {
        question: 'What are the success criteria?',
        suggestion: 'e.g., engagement metrics, clarity, completeness'
      }
    ];
  }

  return baseQuestions;
}

/**
 * Get fallback auto-answers for AI mode
 */
function getFallbackAutoAnswers(): Record<number, string> {
  return {
    0: 'General audience with moderate familiarity with the topic',
    1: 'Professional yet accessible tone, balancing expertise with clarity',
    2: 'Well-structured format with clear sections and actionable points',
    3: 'Comprehensive coverage while maintaining readability and engagement'
  };
}
```

---

### STEP 5: Create Mode Selector Component

#### 5.1 Create `components/AnalysisModeSelector.tsx`

```typescript
'use client';

import React from 'react';
import { Zap, Brain, Microscope } from 'lucide-react';
import { AnalysisMode } from '@/lib/types';
import { MODE_METADATA } from '@/lib/modeConfig';

interface AnalysisModeSelectorProps {
  selectedMode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  disabled?: boolean;
}

const ICON_MAP = {
  Zap,
  Brain,
  Microscope,
};

const AnalysisModeSelector: React.FC<AnalysisModeSelectorProps> = ({
  selectedMode,
  onModeChange,
  disabled = false,
}) => {
  const handleModeSelect = (mode: AnalysisMode): void => {
    if (!disabled) {
      onModeChange(mode);
    }
  };

  const handleKeyDown = (mode: AnalysisMode, e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleModeSelect(mode);
    }
  };

  return (
    <div className="w-full mb-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-3">
        Choose Analysis Mode
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(AnalysisMode).map((mode) => {
          const metadata = MODE_METADATA[mode];
          const Icon = ICON_MAP[metadata.icon as keyof typeof ICON_MAP];
          const isSelected = selectedMode === mode;

          return (
            <button
              key={mode}
              onClick={() => handleModeSelect(mode)}
              onKeyDown={(e) => handleKeyDown(mode, e)}
              disabled={disabled}
              className={`
                relative p-5 rounded-xl border-2 transition-all duration-200
                ${isSelected
                  ? `border-transparent bg-gradient-to-br ${metadata.colorClass} shadow-lg scale-105`
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/80'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
              `}
              aria-label={`Select ${metadata.name}`}
              aria-pressed={isSelected}
              tabIndex={0}
            >
              {/* Badge */}
              <div className="absolute top-3 right-3">
                <span className={`text-xs px-2 py-1 rounded-full border ${metadata.badge.colorClass}`}>
                  {metadata.badge.text}
                </span>
              </div>

              {/* Icon */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`
                  p-2 rounded-lg
                  ${isSelected ? 'bg-white/20' : 'bg-gray-700/50'}
                `}>
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-300'}`} />
                </div>
                <h4 className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                  {metadata.name}
                </h4>
              </div>

              {/* Description */}
              <p className={`text-sm mb-4 ${isSelected ? 'text-white/90' : 'text-gray-400'}`}>
                {metadata.description}
              </p>

              {/* Stats */}
              <div className="space-y-1 text-xs">
                <div className={`flex items-center justify-between ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                  <span>Time:</span>
                  <span className="font-medium">{metadata.estimatedTime}</span>
                </div>
                <div className={`flex items-center justify-between ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                  <span>Questions:</span>
                  <span className="font-medium">{metadata.questionCount}</span>
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute inset-0 rounded-xl ring-2 ring-white/50 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisModeSelector;
```

---

### STEP 6: Update Stage 1 Component

#### 6.1 Update `components/Stage1InitialPrompt.tsx`

Add mode selector and pass mode to analyze handler:

```typescript
'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { AnalysisMode } from '@/lib/types';
import LoadingSpinner from './LoadingSpinner';
import AnalysisModeSelector from './AnalysisModeSelector';

interface Stage1InitialPromptProps {
  initialPrompt: string;
  selectedMode: AnalysisMode;
  loading: boolean;
  onPromptChange: (value: string) => void;
  onModeChange: (mode: AnalysisMode) => void;
  onAnalyze: () => void;
}

const Stage1InitialPrompt: React.FC<Stage1InitialPromptProps> = ({
  initialPrompt,
  selectedMode,
  loading,
  onPromptChange,
  onModeChange,
  onAnalyze
}) => {
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    onPromptChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (initialPrompt.trim() && !loading) {
        onAnalyze();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          Prompt Master
        </h1>
        <p className="text-gray-400 text-lg">
          Transform your ideas into powerful AI prompts
        </p>
      </div>

      {/* Mode Selector */}
      <AnalysisModeSelector
        selectedMode={selectedMode}
        onModeChange={onModeChange}
        disabled={loading}
      />

      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-xl">
        <label htmlFor="initial-prompt" className="block text-sm font-medium text-gray-300 mb-2">
          Enter your initial prompt or idea
        </label>
        <textarea
          id="initial-prompt"
          value={initialPrompt}
          onChange={handlePromptChange}
          onKeyDown={handleKeyDown}
          placeholder="Example: Write a blog post about sustainable living..."
          disabled={loading}
          className="w-full min-h-[200px] px-4 py-3 bg-gray-900/80 border border-gray-600 rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Initial prompt input"
        />
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Tip: Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Cmd/Ctrl + Enter</kbd> to analyze
          </p>
          <button
            onClick={onAnalyze}
            disabled={!initialPrompt.trim() || loading}
            className="gradient-purple-pink hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center gap-2 shadow-lg"
            aria-label="Analyze prompt"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyze Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stage1InitialPrompt;
```

---

### STEP 7: Update Stage 2 Component

#### 6.2 Update `components/Stage2Clarification.tsx`

Handle AI mode (show auto-filled answers as read-only or skip) and extensive mode (better UI for more questions):

```typescript
'use client';

import React from 'react';
import { ArrowLeft, Wand2, Sparkles } from 'lucide-react';
import { Question, AnalysisMode } from '@/lib/types';
import { MODE_METADATA } from '@/lib/modeConfig';
import LoadingSpinner from './LoadingSpinner';

interface Stage2ClarificationProps {
  initialPrompt: string;
  questions: Question[];
  answers: Record<number, string>;
  mode: AnalysisMode;
  loading: boolean;
  onAnswerChange: (index: number, value: string) => void;
  onBack: () => void;
  onGenerate: () => void;
}

const Stage2Clarification: React.FC<Stage2ClarificationProps> = ({
  initialPrompt,
  questions,
  answers,
  mode,
  loading,
  onAnswerChange,
  onBack,
  onGenerate
}) => {
  const isAIMode = mode === AnalysisMode.AI;
  const modeMetadata = MODE_METADATA[mode];

  const handleAnswerChange = (index: number, e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    onAnswerChange(index, e.target.value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Go back to edit prompt"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Initial Prompt</span>
        </button>

        {/* Mode Badge */}
        <div className={`px-3 py-1 rounded-full border ${modeMetadata.badge.colorClass} text-sm font-medium`}>
          {modeMetadata.name}
        </div>
      </div>

      <div className="bg-gray-800/30 rounded-lg p-4 mb-8 border border-gray-700/30">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Your Initial Prompt:</h3>
        <p className="text-gray-200">{initialPrompt}</p>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-xl">
        <div className="flex items-start gap-3 mb-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {isAIMode ? 'AI Analysis Complete' : 'Help us refine your prompt'}
          </h2>
        </div>
        
        <p className="text-gray-400 mb-6">
          {isAIMode
            ? 'AI has automatically analyzed and answered these questions. Review and proceed to generate.'
            : mode === AnalysisMode.EXTENSIVE
            ? 'Answer these comprehensive questions for maximum prompt refinement'
            : 'Answer these questions to add important context and details'}
        </p>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {questions.map((q, index) => (
            <div key={index} className="space-y-2">
              <label
                htmlFor={`question-${index}`}
                className="block text-sm font-medium text-gray-300"
              >
                {index + 1}. {q.question}
              </label>
              <textarea
                id={`question-${index}`}
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e)}
                placeholder={q.suggestion}
                disabled={loading || isAIMode}
                readOnly={isAIMode}
                className={`
                  w-full min-h-[100px] px-4 py-3 border rounded-lg text-foreground placeholder-gray-500 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y transition-all
                  ${isAIMode
                    ? 'bg-gray-900/50 border-gray-700 cursor-default'
                    : 'bg-gray-900/80 border-gray-600'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                aria-label={`Answer for question ${index + 1}`}
              />
              {isAIMode && answers[index] && (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-generated by AI</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-end gap-4">
          <button
            onClick={onGenerate}
            disabled={loading}
            className="gradient-purple-pink hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center gap-2 shadow-lg"
            aria-label="Generate super prompt"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Generate Super Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }
      `}</style>
    </div>
  );
};

export default Stage2Clarification;
```

---

### STEP 8: Update Main Page

#### 8.1 Update `app/page.tsx`

Add mode state and pass through workflow:

```typescript
'use client';

import React, { useState, useCallback } from 'react';
import { Stage, Question, AnalyzeResponse, GenerateResponse, AnalysisMode } from '@/lib/types';
import Stage1InitialPrompt from '@/components/Stage1InitialPrompt';
import Stage2Clarification from '@/components/Stage2Clarification';
import Stage3SuperPrompt from '@/components/Stage3SuperPrompt';
import ErrorMessage from '@/components/ErrorMessage';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/components/providers/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';

const HomePage: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<Stage>(Stage.INITIAL_PROMPT);
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>(AnalysisMode.NORMAL);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [superPrompt, setSuperPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  
  const { user, loading: authLoading } = useAuth();

  const handlePromptChange = useCallback((value: string): void => {
    setInitialPrompt(value);
    setError(null);
  }, []);

  const handleModeChange = useCallback((mode: AnalysisMode): void => {
    setSelectedMode(mode);
  }, []);

  const handleAnalyze = useCallback(async (): Promise<void> => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!initialPrompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: initialPrompt,
          mode: selectedMode 
        }),
      });

      const data: AnalyzeResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze prompt');
      }

      setQuestions(data.questions);
      
      // For AI mode, use auto-generated answers
      if (data.autoAnswers) {
        setAnswers(data.autoAnswers);
      } else {
        setAnswers({});
      }
      
      setCurrentStage(Stage.CLARIFICATION);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while analyzing your prompt. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [initialPrompt, selectedMode, user]);

  const handleAnswerChange = useCallback((index: number, value: string): void => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  }, []);

  const handleBack = useCallback((): void => {
    setCurrentStage(Stage.INITIAL_PROMPT);
    setError(null);
  }, []);

  const handleGenerate = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const questionsAndAnswers = questions.map((q, index) => ({
        question: q.question,
        answer: answers[index] || '',
      }));

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialPrompt,
          questionsAndAnswers,
          mode: selectedMode, // Pass mode for context
        }),
      });

      const data: GenerateResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate super prompt');
      }

      setSuperPrompt(data.superPrompt);
      setCurrentStage(Stage.SUPER_PROMPT);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while generating your super prompt. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [initialPrompt, questions, answers, selectedMode]);

  const handleStartOver = useCallback((): void => {
    setCurrentStage(Stage.INITIAL_PROMPT);
    setInitialPrompt('');
    setSelectedMode(AnalysisMode.NORMAL);
    setQuestions([]);
    setAnswers({});
    setSuperPrompt('');
    setError(null);
  }, []);

  const handleDismissError = useCallback((): void => {
    setError(null);
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {error && <ErrorMessage message={error} onDismiss={handleDismissError} />}
          
          {currentStage === Stage.INITIAL_PROMPT && (
            <Stage1InitialPrompt
              initialPrompt={initialPrompt}
              selectedMode={selectedMode}
              loading={loading || authLoading}
              onPromptChange={handlePromptChange}
              onModeChange={handleModeChange}
              onAnalyze={handleAnalyze}
            />
          )}

          {currentStage === Stage.CLARIFICATION && (
            <Stage2Clarification
              initialPrompt={initialPrompt}
              questions={questions}
              answers={answers}
              mode={selectedMode}
              loading={loading}
              onAnswerChange={handleAnswerChange}
              onBack={handleBack}
              onGenerate={handleGenerate}
            />
          )}

          {currentStage === Stage.SUPER_PROMPT && (
            <Stage3SuperPrompt
              superPrompt={superPrompt}
              onStartOver={handleStartOver}
              initialPrompt={initialPrompt}
              questions={questions}
              answers={answers}
            />
          )}
        </div>
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default HomePage;
```

---

### STEP 9: Database Migration

#### 9.1 Create `ANALYSIS_MODES_MIGRATION.sql`

```sql
-- Migration: Add analysis_mode column to saved_prompts table
-- Created: 2025-10-01
-- Purpose: Track which analysis mode was used for each prompt

-- Add analysis_mode column with default 'normal'
ALTER TABLE saved_prompts
ADD COLUMN analysis_mode TEXT NOT NULL DEFAULT 'normal';

-- Add check constraint to ensure valid modes
ALTER TABLE saved_prompts
ADD CONSTRAINT analysis_mode_check 
CHECK (analysis_mode IN ('ai', 'normal', 'extensive'));

-- Create index for filtering by mode
CREATE INDEX idx_saved_prompts_analysis_mode 
ON saved_prompts(analysis_mode);

-- Add comment for documentation
COMMENT ON COLUMN saved_prompts.analysis_mode IS 
'Analysis mode used: ai (automated), normal (balanced), or extensive (deep analysis)';
```

---

### STEP 10: Update Stage 3 (Optional Enhancement)

#### 10.1 Update `components/Stage3SuperPrompt.tsx`

Add mode badge to show which mode was used:

```typescript
// Add to imports
import { AnalysisMode } from '@/lib/types';
import { MODE_METADATA } from '@/lib/modeConfig';

// Add to interface
interface Stage3SuperPromptProps {
  superPrompt: string;
  onStartOver: () => void;
  initialPrompt: string;
  questions: Question[];
  answers: Record<number, string>;
  mode?: AnalysisMode; // NEW: Optional mode tracking
}

// Add mode badge in the component (after title, before super prompt display)
{mode && (
  <div className="mb-4">
    <span className={`inline-block px-3 py-1 rounded-full border text-sm font-medium ${MODE_METADATA[mode].badge.colorClass}`}>
      Generated with {MODE_METADATA[mode].name}
    </span>
  </div>
)}
```

---

## Testing Checklist

### Functional Testing

- [ ] **AI Mode**
  - [ ] Questions are generated (4-6)
  - [ ] Auto-answers are populated
  - [ ] Answers are read-only in Stage 2
  - [ ] Super prompt is generated successfully
  - [ ] Auto-answers are contextually relevant

- [ ] **Normal Mode**
  - [ ] Questions are generated (4-6)
  - [ ] No auto-answers provided
  - [ ] User can input answers
  - [ ] Maintains existing behavior exactly

- [ ] **Extensive Mode**
  - [ ] Questions are generated (8-12)
  - [ ] Questions cover diverse aspects
  - [ ] UI handles larger question set
  - [ ] Super prompts are more detailed

### UI/UX Testing

- [ ] Mode selector is visually clear
- [ ] Selected mode is highlighted
- [ ] Mode badges display correctly
- [ ] Loading states work per mode
- [ ] Mobile responsive design
- [ ] Keyboard navigation works
- [ ] ARIA labels are correct

### Integration Testing

- [ ] Mode persists through workflow
- [ ] API calls include mode parameter
- [ ] Database saves mode correctly
- [ ] History displays mode badge
- [ ] Error handling works per mode

### Performance Testing

- [ ] AI mode completes in <45 seconds
- [ ] Normal mode unchanged performance
- [ ] Extensive mode handles 12 questions smoothly
- [ ] No memory leaks with mode switching

---

## Success Criteria

✅ **Core Functionality**
- All three modes work as specified
- Mode selection is intuitive
- No regressions in existing features

✅ **Quality Metrics**
- AI mode auto-answers are >85% relevant
- Extensive mode generates 8-12 quality questions
- Normal mode maintains current quality

✅ **User Experience**
- Mode selection adds <2 clicks
- Visual feedback is clear
- Mobile experience is smooth
- Accessibility standards met

✅ **Technical Requirements**
- Type-safe implementation
- Comprehensive error handling
- Database migration successful
- No breaking changes

---

## Deployment Notes

1. **Database Migration First**: Run `ANALYSIS_MODES_MIGRATION.sql` before deploying code
2. **Backwards Compatibility**: Existing prompts default to 'normal' mode
3. **Environment Variables**: No new env vars required
4. **API Keys**: Uses existing Gemini API key
5. **Monitoring**: Track mode usage in analytics

---

## Future Enhancements

1. **Custom Modes**: Allow users to save custom mode configurations
2. **Mode Recommendations**: AI suggests best mode based on prompt complexity
3. **Hybrid Modes**: Mix of AI and user answers
4. **Analytics Dashboard**: Mode usage statistics and insights
5. **A/B Testing**: Compare super prompt quality across modes

---

## Documentation

- Update README with mode descriptions
- Add mode selector to user guide
- Document API changes in SETUP_INSTRUCTIONS
- Create mode comparison table
- Add troubleshooting section for modes

---

## Task Complete! 🎉

This implementation provides a flexible, user-centric analysis system that accommodates different use cases and time constraints while maintaining code quality and type safety.
