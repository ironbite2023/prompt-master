# TASK-08: AI Mode - Skip Stage 2 Enhancement

## Overview

Enhance AI Mode to skip the clarification stage (Stage 2) completely and proceed directly from prompt analysis to super prompt generation. This creates a truly automated, "one-click" experience that delivers on the "~30 seconds" promise.

## Problem Statement

### Current Behavior
- AI Mode generates questions AND auto-fills answers
- Shows Stage 2 with **read-only** text fields
- User must click "Generate Super Prompt" button
- Creates confusion: "Why am I seeing this if I can't edit?"
- Doesn't deliver on the "fastest" promise

### Issues
1. **Breaks User Expectation**: Selecting "AI Mode" implies full automation
2. **Unnecessary Step**: Read-only Stage 2 adds no value
3. **Extra Click Required**: User must click "Generate" even though they can't change anything
4. **Cognitive Load**: User must visually scan 4-6 answers they can't edit
5. **Performance**: Extra render cycle for Stage 2 component

---

## Solution: Skip Stage 2 Completely in AI Mode

### New Flow
```
AI Mode:
1. User selects AI Mode
2. User enters prompt
3. User clicks "Analyze Prompt"
   ↓
4. Backend: AI analyzes + auto-fills + generates super prompt (all in sequence)
   ↓
5. Frontend: Shows progress indicator with steps
   ↓
6. Stage 3: Super Prompt displayed immediately
   - Badge: "Generated with AI Mode"
   - Optional: "View AI's Analysis" button (opens modal)
```

### Benefits
✅ **True Automation**: 1 click from prompt to super prompt  
✅ **Speed**: Delivers on "~30 seconds" promise  
✅ **Clear Differentiation**: AI Mode is distinctly different from Normal/Extensive  
✅ **Better UX**: No confusing read-only fields  
✅ **Fewer Clicks**: Optimal workflow for speed-focused users  
✅ **Performance**: Skip unnecessary Stage 2 render  

---

## Implementation Steps

### **STEP 1: Backend - Combined Analysis + Generation Endpoint**

#### Option A: Modify Analyze API (Simpler)
Update `/api/analyze` to optionally trigger generation for AI mode.

**File:** `app/api/analyze/route.ts`

```typescript
export async function POST(request: NextRequest): Promise<NextResponse> {
  // ... existing auth and validation ...

  const { prompt, mode = AnalysisMode.NORMAL, autoGenerate = false } = body;

  // ... existing analysis logic ...

  // If AI mode with autoGenerate flag, generate super prompt immediately
  if (mode === AnalysisMode.AI && autoGenerate) {
    // Call generation logic inline
    const superPrompt = await generateSuperPromptInline(
      prompt, 
      questions, 
      autoAnswers as Record<number, string>
    );

    return NextResponse.json({
      questions,
      mode,
      autoAnswers,
      superPrompt, // NEW: Include generated super prompt
    });
  }

  // Normal/Extensive: Return just questions
  return NextResponse.json({
    questions,
    mode,
    ...(autoAnswers && { autoAnswers }),
  });
}

/**
 * Generate super prompt inline (for AI mode)
 */
async function generateSuperPromptInline(
  initialPrompt: string,
  questions: Question[],
  autoAnswers: Record<number, string>
): Promise<string> {
  const ai = getGeminiClient();
  
  const questionsAndAnswers = questions.map((q, index) => ({
    question: q.question,
    answer: autoAnswers[index] || '',
  }));

  const qaText = questionsAndAnswers
    .map((qa, i) => `${i + 1}. Q: ${qa.question}\n   A: ${qa.answer}`)
    .join('\n\n');

  const fullPrompt = GENERATION_PROMPT + initialPrompt + '\n\nQuestions and Answers:\n' + qaText;

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: fullPrompt,
    config: {
      temperature: 0.8,
      maxOutputTokens: 2048,
    }
  });

  return response.text || '';
}
```

#### Option B: Create Dedicated AI Mode Endpoint (Cleaner)
Create `/api/ai-analyze-generate` specifically for AI mode.

**File:** `app/api/ai-analyze-generate/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, DEFAULT_MODEL } from '@/lib/gemini';
import { AI_MODE_ANALYSIS_PROMPT, GENERATION_PROMPT } from '@/lib/prompts';
import { Question, AnalysisMode } from '@/lib/types';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * AI Mode: Combined analysis + generation endpoint
 * Skips user input completely
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Invalid prompt provided' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    // Step 1: Analyze and generate questions + auto-answers
    const analysisResponse = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: AI_MODE_ANALYSIS_PROMPT + prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 3072,
      }
    });

    let questions: Question[];
    let autoAnswers: Record<number, string>;

    try {
      const cleaned = analysisResponse.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsed = JSON.parse(cleaned);
      questions = parsed.questions || [];
      autoAnswers = parsed.autoAnswers || {};
    } catch (parseError) {
      console.error('Failed to parse analysis:', parseError);
      throw new Error('Failed to analyze prompt');
    }

    // Step 2: Generate super prompt using auto-answers
    const questionsAndAnswers = questions.map((q, index) => ({
      question: q.question,
      answer: autoAnswers[index] || '',
    }));

    const qaText = questionsAndAnswers
      .map((qa, i) => `${i + 1}. Q: ${qa.question}\n   A: ${qa.answer}`)
      .join('\n\n');

    const generationPromptText = GENERATION_PROMPT + prompt + '\n\nQuestions and Answers:\n' + qaText;

    const generationResponse = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: generationPromptText,
      config: {
        temperature: 0.8,
        maxOutputTokens: 2048,
      }
    });

    const superPrompt = generationResponse.text || '';

    console.log(`[AI-MODE] User ${user.id} generated super prompt via AI mode`);

    // Return everything for transparency
    return NextResponse.json({
      questions,
      autoAnswers,
      superPrompt,
      mode: AnalysisMode.AI,
    });

  } catch (error) {
    console.error('Error in AI mode analyze-generate:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `AI mode failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
```

**Recommendation:** Use **Option B** for cleaner separation of concerns.

---

### **STEP 2: Update Response Types**

**File:** `lib/types.ts`

```typescript
// Update AnalyzeResponse to optionally include superPrompt
export interface AnalyzeResponse {
  questions: Question[];
  mode: AnalysisMode;
  autoAnswers?: Record<number, string>; // AI Mode auto-generated answers
  superPrompt?: string; // NEW: AI Mode auto-generated super prompt
  error?: string;
}
```

---

### **STEP 3: Update Frontend - Main Page Logic**

**File:** `app/page.tsx`

Update `handleAnalyze` to detect AI mode and handle accordingly:

```typescript
const handleAnalyze = useCallback(async (): Promise<void> => {
  if (!user) {
    setShowAuthModal(true);
    return;
  }

  if (!initialPrompt.trim()) return;

  setLoading(true);
  setError(null);

  try {
    // AI Mode: Use dedicated endpoint for combined analysis + generation
    if (selectedMode === AnalysisMode.AI) {
      const response = await fetch('/api/ai-analyze-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: initialPrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate super prompt');
      }

      // Store questions/answers for transparency (can show in modal)
      setQuestions(data.questions);
      setAnswers(data.autoAnswers);
      setSuperPrompt(data.superPrompt);
      
      // Skip Stage 2, go directly to Stage 3
      setCurrentStage(Stage.SUPER_PROMPT);
    } else {
      // Normal/Extensive Mode: Use regular analyze endpoint
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
      setAnswers(data.autoAnswers || {});
      
      // Show Stage 2 for user input
      setCurrentStage(Stage.CLARIFICATION);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
}, [initialPrompt, selectedMode, user]);
```

---

### **STEP 4: Add AI Mode Progress Indicator**

**File:** `components/AIModeProgress.tsx` (NEW)

```typescript
'use client';

import React from 'react';
import { Zap, CheckCircle, Loader2 } from 'lucide-react';

interface AIModeProgressProps {
  stage: 'analyzing' | 'generating' | 'complete';
}

const AIModeProgress: React.FC<AIModeProgressProps> = ({ stage }) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-8 backdrop-blur-sm">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-green-500/20 rounded-full">
            <Zap className="w-12 h-12 text-green-400 animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 text-green-400">
          ⚡ AI Mode - Automated Generation
        </h2>
        <p className="text-center text-gray-400 mb-8">
          AI is analyzing your prompt and generating an optimized super prompt...
        </p>

        <div className="space-y-4">
          {/* Step 1: Analyzing */}
          <div className="flex items-center gap-3">
            {stage === 'analyzing' ? (
              <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
            <span className={stage === 'analyzing' ? 'text-green-400' : 'text-gray-400'}>
              Analyzing prompt and generating clarifying questions
            </span>
          </div>

          {/* Step 2: Auto-filling */}
          <div className="flex items-center gap-3">
            {stage === 'analyzing' ? (
              <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
            ) : stage === 'generating' ? (
              <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
            <span className={stage === 'generating' ? 'text-green-400' : 'text-gray-400'}>
              Auto-filling context with intelligent answers
            </span>
          </div>

          {/* Step 3: Generating */}
          <div className="flex items-center gap-3">
            {stage !== 'complete' ? (
              <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
            <span className={stage === 'complete' ? 'text-green-400' : 'text-gray-400'}>
              Creating optimized super prompt
            </span>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          This usually takes ~20-30 seconds
        </div>
      </div>
    </div>
  );
};

export default AIModeProgress;
```

**Update `app/page.tsx` to show progress:**

```typescript
// In the main return
{loading && selectedMode === AnalysisMode.AI && (
  <AIModeProgress stage="analyzing" />
)}
```

---

### **STEP 5: Add "View AI's Analysis" to Stage 3**

**File:** `components/Stage3SuperPrompt.tsx`

Add optional modal to show AI's analysis:

```typescript
interface Stage3SuperPromptProps {
  superPrompt: string;
  onStartOver: () => void;
  initialPrompt: string;
  questions: Question[];
  answers: Record<number, string>;
  mode?: AnalysisMode; // Add mode prop
}

const Stage3SuperPrompt: React.FC<Stage3SuperPromptProps> = ({
  superPrompt,
  onStartOver,
  initialPrompt,
  questions,
  answers,
  mode
}) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const isAIMode = mode === AnalysisMode.AI;

  // ... existing code ...

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* AI Mode Badge */}
      {isAIMode && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" />
              <p className="text-sm text-green-400 font-medium">
                This super prompt was generated using AI Mode with automated analysis.
              </p>
            </div>
            <button
              onClick={() => setShowAnalysis(true)}
              className="text-xs text-green-400 hover:text-green-300 underline transition-colors"
            >
              View AI's Analysis
            </button>
          </div>
        </div>
      )}

      {/* Existing super prompt display */}
      {/* ... */}

      {/* AI Analysis Modal */}
      {showAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">AI's Analysis</h3>
              <button
                onClick={() => setShowAnalysis(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="bg-gray-900/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-300 mb-2">
                    {index + 1}. {q.question}
                  </p>
                  <p className="text-sm text-green-400 bg-green-500/10 p-3 rounded border border-green-500/30">
                    {answers[index]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

### **STEP 6: Update Mode Descriptions**

**File:** `lib/modeConfig.ts`

Update AI Mode description to reflect new behavior:

```typescript
[AnalysisMode.AI]: {
  id: AnalysisMode.AI,
  name: 'AI Mode',
  description: 'Fully automated generation. AI analyzes, answers questions, and creates your super prompt - all in one step.',
  icon: 'Zap',
  colorClass: 'from-green-500 to-emerald-500',
  estimatedTime: '~20-30 seconds',
  questionCount: '4-6 questions (auto-filled, hidden)',
  badge: {
    text: 'Fastest',
    colorClass: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
},
```

---

## Testing Checklist

### **Functional Testing**

- [ ] **AI Mode Flow**
  - [ ] Select AI Mode
  - [ ] Enter prompt and click "Analyze Prompt"
  - [ ] Verify progress indicator shows
  - [ ] Verify Stage 2 is skipped
  - [ ] Verify lands directly on Stage 3 with super prompt
  - [ ] Verify AI Mode badge shows on Stage 3
  - [ ] Verify "View AI's Analysis" button works
  - [ ] Verify analysis modal displays questions and auto-answers

- [ ] **Normal Mode (Unchanged)**
  - [ ] Select Normal Mode
  - [ ] Verify Stage 2 shows with empty answer fields
  - [ ] Verify user can fill answers
  - [ ] Verify generate button works

- [ ] **Extensive Mode (Unchanged)**
  - [ ] Select Extensive Mode
  - [ ] Verify Stage 2 shows with 8-12 questions
  - [ ] Verify scrollable UI works

- [ ] **Error Handling**
  - [ ] Test with API failure in AI mode
  - [ ] Verify error message shows
  - [ ] Verify can retry

### **Performance Testing**

- [ ] Measure AI Mode total time (should be ~20-30 seconds)
- [ ] Compare vs Normal Mode (2-3 min with user input)
- [ ] Verify no memory leaks

### **UX Testing**

- [ ] AI Mode feels "automated" and "fast"
- [ ] Progress indicator provides clarity
- [ ] Mode differentiation is clear
- [ ] Analysis modal provides transparency without friction

---

## Success Criteria

✅ **Core Functionality**
- AI Mode skips Stage 2 completely
- User goes from prompt → super prompt in one click
- Total time is ~20-30 seconds

✅ **Transparency**
- Progress indicator shows what AI is doing
- "View AI's Analysis" provides transparency
- User can see questions/answers if desired

✅ **Mode Differentiation**
- AI Mode: 1 click, fully automated
- Normal Mode: User answers 4-6 questions
- Extensive Mode: User answers 8-12 questions

✅ **No Regressions**
- Normal and Extensive modes work unchanged
- Existing functionality maintained

---

## Migration Notes

1. **Backward Compatibility**: Normal and Extensive modes unchanged
2. **Database**: No schema changes needed
3. **API Keys**: Uses existing Gemini API key
4. **User Data**: Questions/answers still stored for AI mode (for transparency)

---

## Future Enhancements

1. **AI Mode Settings**: Allow users to toggle "Show Analysis" preference
2. **Hybrid Mode**: Mix of AI-filled and user-edited answers
3. **Progressive Enhancement**: Stream progress updates in real-time
4. **Analytics**: Track AI mode success rate and user satisfaction
5. **A/B Testing**: Compare super prompt quality across modes

---

## Conclusion

This enhancement transforms AI Mode from a "read-only Stage 2" experience to a truly automated "one-click" solution, delivering on the promise of speed and automation while maintaining transparency through optional analysis viewing.

**Key Benefit:** Users who choose AI Mode get exactly what they expect - a fast, fully automated experience with minimal clicks.

---

**Status:** Ready for implementation  
**Estimated Time:** 3-4 hours  
**Priority:** High (improves core UX of AI Mode)
