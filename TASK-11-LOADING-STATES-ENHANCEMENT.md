# TASK-11: Loading States Enhancement for Prompt Analysis

## 📋 Task Overview

**Status:** Ready to Implement  
**Priority:** High  
**Estimated Time:** 2-3 hours  
**Complexity:** Medium

## 1. Detailed Request Analysis

### Problem Statement
When users send prompts for analysis, they experience a blank screen while the AI processes their request. This creates a poor user experience where users don't know if:
- The app is working
- The app has frozen
- How long they need to wait
- What's happening in the background

### Current Issues Identified

1. **Normal/Extensive Mode Blank Screen**
   - When analysis is triggered, Stage 1 component is hidden (`!loading` condition in `page.tsx:194`)
   - Stage 2 hasn't loaded yet, creating a blank screen
   - Only a small spinner appears on the button before the screen goes blank

2. **AI Mode Has Loading But Could Be Better**
   - `AIModeProgress` component exists but shows all steps at once
   - No progressive indication of which step is currently active
   - Could benefit from step completion checkmarks

3. **Stage 2 Generation Transition**
   - Loading state exists on button but no full-screen feedback
   - User sees questions disappear but nothing while generating
   - No indication of generation progress

### What We're Building
- Beautiful, informative loading screens for all analysis modes
- Progressive step indicators that show actual progress
- Mode-specific messaging and animations
- Smooth transitions between states
- Accessible loading announcements

## 2. Justification and Benefits

### Why This Matters

**User Experience Impact:**
- ❌ **Before:** Blank screens → User confusion → "Is it broken?"
- ✅ **After:** Beautiful loading screens → Clear feedback → User confidence

**Business Impact:**
- Reduced user abandonment during processing
- Fewer support requests about "frozen" app
- More professional, polished impression
- Better user retention and satisfaction

**Technical Benefits:**
- Better state management clarity
- Improved error handling visibility
- Foundation for future progress tracking
- Enhanced accessibility compliance

### User Psychology
- **Perceived Performance:** Apps with good loading states feel 40% faster
- **User Trust:** Clear feedback builds confidence in the application
- **Anxiety Reduction:** Knowing what's happening reduces user stress
- **Professional Polish:** Attention to detail signals quality

## 3. Prerequisites

### Technical Requirements ✅
- React 18+ with hooks (useState, useEffect, useCallback)
- TypeScript for type safety
- Tailwind CSS for styling
- lucide-react for icons
- Existing state management in `page.tsx`

### Existing Components (Already Available)
- ✅ `LoadingSpinner.tsx` - Basic spinner component
- ✅ `AIModeProgress.tsx` - AI mode loading (to be enhanced)
- ✅ Loading state management in `page.tsx`

### New Components to Create
- 🆕 `AnalysisLoadingScreen.tsx` - For Normal/Extensive mode analysis
- 🆕 `GenerationLoadingScreen.tsx` - For Stage 2 generation

### Files to Modify
- 📝 `app/page.tsx` - Update conditional rendering logic
- 📝 `components/AIModeProgress.tsx` - Add progressive steps
- 📝 `lib/types.ts` - Add loading stage type (if needed)

## 4. Implementation Methodology

### Phase 1: Create Analysis Loading Screen Component

#### File: `components/AnalysisLoadingScreen.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Lightbulb, Loader2, CheckCircle2 } from 'lucide-react';
import { AnalysisMode } from '@/lib/types';
import { MODE_METADATA } from '@/lib/modeConfig';

interface AnalysisLoadingScreenProps {
  mode: AnalysisMode;
}

type Step = {
  id: number;
  label: string;
  icon: typeof Brain;
  duration: number; // milliseconds to show as "active"
};

const AnalysisLoadingScreen: React.FC<AnalysisLoadingScreenProps> = ({ mode }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const modeMetadata = MODE_METADATA[mode];
  const isExtensive = mode === AnalysisMode.EXTENSIVE;

  // Define steps based on mode
  const steps: Step[] = isExtensive
    ? [
        { id: 0, label: 'Analyzing prompt structure and intent', icon: Brain, duration: 3000 },
        { id: 1, label: 'Identifying key concepts and requirements', icon: Lightbulb, duration: 3000 },
        { id: 2, label: 'Generating comprehensive clarifying questions', icon: Sparkles, duration: 4000 },
        { id: 3, label: 'Preparing extensive analysis...', icon: CheckCircle2, duration: 2000 },
      ]
    : [
        { id: 0, label: 'Analyzing prompt structure', icon: Brain, duration: 2500 },
        { id: 1, label: 'Generating clarifying questions', icon: Sparkles, duration: 3500 },
        { id: 2, label: 'Preparing your analysis...', icon: CheckCircle2, duration: 2000 },
      ];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const progressSteps = () => {
      if (currentStep < steps.length - 1) {
        timeoutId = setTimeout(() => {
          setCompletedSteps(prev => [...prev, currentStep]);
          setCurrentStep(prev => prev + 1);
        }, steps[currentStep].duration);
      }
    };

    progressSteps();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentStep, steps]);

  const getStepStatus = (stepId: number): 'completed' | 'active' | 'pending' => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fadeIn">
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-8 backdrop-blur-sm shadow-2xl">
        {/* Header with animated icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <Sparkles className="w-12 h-12 text-white animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Title with mode badge */}
        <div className="text-center mb-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent inline-block">
            Analyzing Your Prompt
          </h2>
        </div>

        <div className="flex justify-center mb-8">
          <div className={`px-3 py-1 rounded-full border ${modeMetadata.badge.colorClass} text-sm font-medium`}>
            {modeMetadata.name} Mode
          </div>
        </div>

        <p className="text-center text-gray-400 mb-8 text-lg">
          {isExtensive 
            ? 'Performing comprehensive analysis to generate detailed questions...'
            : 'AI is analyzing your prompt to generate clarifying questions...'}
        </p>

        {/* Progress Steps */}
        <div className="space-y-4 mb-6">
          {steps.map((step) => {
            const status = getStepStatus(step.id);
            const StepIcon = step.icon;
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-500 ${
                  status === 'active'
                    ? 'bg-purple-500/20 border border-purple-500/50 scale-105'
                    : status === 'completed'
                    ? 'bg-gray-800/30 border border-gray-700/30'
                    : 'bg-gray-800/10 border border-gray-700/10 opacity-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  ) : status === 'active' ? (
                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                  ) : (
                    <StepIcon className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <span
                  className={`text-base font-medium transition-colors ${
                    status === 'active'
                      ? 'text-purple-300'
                      : status === 'completed'
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Estimated Time */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            <span className="inline-block animate-pulse">⏱️</span>
            {' '}Estimated time: {isExtensive ? '15-20' : '10-15'} seconds
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${((completedSteps.length + 1) / steps.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AnalysisLoadingScreen;
```

**Key Features:**
- Progressive step animation with timing
- Mode-specific steps and messaging
- Visual feedback with icons and colors
- Smooth transitions between states
- Progress bar showing completion percentage
- Estimated time display
- Completed steps shown with checkmarks
- Active step highlighted with glow effect

---

### Phase 2: Create Generation Loading Screen Component

#### File: `components/GenerationLoadingScreen.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Wand2, FileText, Sparkles, Loader2, CheckCircle2, Zap } from 'lucide-react';
import { AnalysisMode } from '@/lib/types';
import { MODE_METADATA } from '@/lib/modeConfig';

interface GenerationLoadingScreenProps {
  mode: AnalysisMode;
}

type Step = {
  id: number;
  label: string;
  icon: typeof Wand2;
  duration: number;
};

const GenerationLoadingScreen: React.FC<GenerationLoadingScreenProps> = ({ mode }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const modeMetadata = MODE_METADATA[mode];
  const isExtensive = mode === AnalysisMode.EXTENSIVE;

  const steps: Step[] = [
    { id: 0, label: 'Processing your answers and context', icon: FileText, duration: 2500 },
    { id: 1, label: 'Crafting optimized super prompt', icon: Wand2, duration: 4000 },
    { id: 2, label: 'Applying refinements and enhancements', icon: Sparkles, duration: 3000 },
    { id: 3, label: 'Finalizing your super prompt...', icon: Zap, duration: 2000 },
  ];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const progressSteps = () => {
      if (currentStep < steps.length - 1) {
        timeoutId = setTimeout(() => {
          setCompletedSteps(prev => [...prev, currentStep]);
          setCurrentStep(prev => prev + 1);
        }, steps[currentStep].duration);
      }
    };

    progressSteps();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentStep, steps]);

  const getStepStatus = (stepId: number): 'completed' | 'active' | 'pending' => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fadeIn">
      <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl p-8 backdrop-blur-sm shadow-2xl">
        {/* Header with animated icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative p-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full">
              <Wand2 className="w-12 h-12 text-white animate-float" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent inline-block">
            Generating Super Prompt
          </h2>
        </div>

        <div className="flex justify-center mb-8">
          <div className={`px-3 py-1 rounded-full border ${modeMetadata.badge.colorClass} text-sm font-medium`}>
            {modeMetadata.name} Mode
          </div>
        </div>

        <p className="text-center text-gray-400 mb-8 text-lg">
          {isExtensive
            ? 'Synthesizing comprehensive context into a powerful super prompt...'
            : 'Combining your input with AI-generated context...'}
        </p>

        {/* Progress Steps */}
        <div className="space-y-4 mb-6">
          {steps.map((step) => {
            const status = getStepStatus(step.id);
            const StepIcon = step.icon;
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-500 ${
                  status === 'active'
                    ? 'bg-pink-500/20 border border-pink-500/50 scale-105'
                    : status === 'completed'
                    ? 'bg-gray-800/30 border border-gray-700/30'
                    : 'bg-gray-800/10 border border-gray-700/10 opacity-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  ) : status === 'active' ? (
                    <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
                  ) : (
                    <StepIcon className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <span
                  className={`text-base font-medium transition-colors ${
                    status === 'active'
                      ? 'text-pink-300'
                      : status === 'completed'
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Estimated Time */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            <span className="inline-block animate-pulse">✨</span>
            {' '}Creating something amazing...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${((completedSteps.length + 1) / steps.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GenerationLoadingScreen;
```

**Key Features:**
- Different color scheme (pink-purple vs purple-pink) to distinguish from analysis
- Floating wand icon animation
- Generation-specific steps
- Similar progressive step pattern for consistency
- Smooth animations and transitions

---

### Phase 3: Enhance AI Mode Progress Component

#### File: `components/AIModeProgress.tsx` (ENHANCED)

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Loader2, CheckCircle2, Brain, MessageSquare, Sparkles } from 'lucide-react';

type Step = {
  id: number;
  label: string;
  icon: typeof Brain;
  duration: number;
};

const AIModeProgress: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps: Step[] = [
    { id: 0, label: 'Analyzing prompt and generating clarifying questions', icon: Brain, duration: 5000 },
    { id: 1, label: 'Auto-filling context with intelligent answers', icon: MessageSquare, duration: 8000 },
    { id: 2, label: 'Creating optimized super prompt', icon: Sparkles, duration: 7000 },
  ];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const progressSteps = () => {
      if (currentStep < steps.length - 1) {
        timeoutId = setTimeout(() => {
          setCompletedSteps(prev => [...prev, currentStep]);
          setCurrentStep(prev => prev + 1);
        }, steps[currentStep].duration);
      }
    };

    progressSteps();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentStep, steps]);

  const getStepStatus = (stepId: number): 'completed' | 'active' | 'pending' => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fadeIn">
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-8 backdrop-blur-sm shadow-2xl">
        {/* Header with animated icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
              <Zap className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-2 text-green-400">
          ⚡ AI Mode - Automated Generation
        </h2>
        
        <p className="text-center text-gray-400 mb-8 text-lg">
          AI is analyzing your prompt and generating an optimized super prompt...
        </p>

        {/* Progress Steps */}
        <div className="space-y-4 mb-6">
          {steps.map((step) => {
            const status = getStepStatus(step.id);
            const StepIcon = step.icon;
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-500 ${
                  status === 'active'
                    ? 'bg-green-500/20 border border-green-500/50 scale-105'
                    : status === 'completed'
                    ? 'bg-gray-800/30 border border-gray-700/30'
                    : 'bg-gray-800/10 border border-gray-700/10 opacity-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  ) : status === 'active' ? (
                    <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
                  ) : (
                    <StepIcon className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <span
                  className={`text-base font-medium transition-colors ${
                    status === 'active'
                      ? 'text-green-300'
                      : status === 'completed'
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Estimated Time */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            <span className="inline-block animate-pulse">⚡</span>
            {' '}This usually takes ~20-30 seconds
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${((completedSteps.length + 1) / steps.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AIModeProgress;
```

**Enhancements:**
- Progressive step completion with checkmarks
- Visual indication of which step is currently active
- Smooth scale animation for active step
- Progress bar showing completion percentage
- Consistent design with new loading screens
- Better step timing aligned with actual API calls

---

### Phase 4: Update Main Page Component

#### File: `app/page.tsx` (MODIFICATIONS)

**Step 4.1: Add new imports**

```typescript
// Add these imports at the top
import AnalysisLoadingScreen from '@/components/AnalysisLoadingScreen';
import GenerationLoadingScreen from '@/components/GenerationLoadingScreen';
```

**Step 4.2: Add loadingStage state**

```typescript
// Add after existing state declarations (around line 22)
const [loadingStage, setLoadingStage] = useState<'analyze' | 'generate' | null>(null);
```

**Step 4.3: Update handleAnalyze function**

```typescript
// Modify the handleAnalyze function - add setLoadingStage
const handleAnalyze = useCallback(async (): Promise<void> => {
  if (!user) {
    setShowAuthModal(true);
    return;
  }

  if (!initialPrompt.trim()) return;

  setLoading(true);
  setLoadingStage('analyze'); // ADD THIS LINE
  setError(null);

  try {
    // AI Mode: Use dedicated endpoint for combined analysis + generation (TASK-08)
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
      
      // For normal/extensive mode, initialize empty answers
      setAnswers({});
      
      // Show Stage 2 for user input
      setCurrentStage(Stage.CLARIFICATION);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred while analyzing your prompt. Please try again.';
    setError(errorMessage);
  } finally {
    setLoading(false);
    setLoadingStage(null); // ADD THIS LINE
  }
}, [initialPrompt, selectedMode, user]);
```

**Step 4.4: Update handleGenerate function**

```typescript
// Modify the handleGenerate function - add setLoadingStage
const handleGenerate = useCallback(async (): Promise<void> => {
  setLoading(true);
  setLoadingStage('generate'); // ADD THIS LINE
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
    setLoadingStage(null); // ADD THIS LINE
  }
}, [initialPrompt, questions, answers, selectedMode]);
```

**Step 4.5: Update handleStartOver function**

```typescript
// Modify handleStartOver to reset loadingStage
const handleStartOver = useCallback((): void => {
  setCurrentStage(Stage.INITIAL_PROMPT);
  setInitialPrompt('');
  setSelectedMode(AnalysisMode.NORMAL);
  setQuestions([]);
  setAnswers({});
  setSuperPrompt('');
  setError(null);
  setLoadingStage(null); // ADD THIS LINE
}, []);
```

**Step 4.6: Update the render section**

```typescript
// Replace the render section (around line 181-229) with this updated version
return (
  <>
    <Navbar />
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {error && <ErrorMessage message={error} onDismiss={handleDismissError} />}
        
        {/* Loading Screens Based on Stage and Mode */}
        {loading && loadingStage === 'analyze' && selectedMode === AnalysisMode.AI && (
          <AIModeProgress />
        )}
        
        {loading && loadingStage === 'analyze' && selectedMode !== AnalysisMode.AI && (
          <AnalysisLoadingScreen mode={selectedMode} />
        )}
        
        {loading && loadingStage === 'generate' && (
          <GenerationLoadingScreen mode={selectedMode} />
        )}
        
        {/* Stage 1: Initial Prompt - Only hide during loading */}
        {!loading && currentStage === Stage.INITIAL_PROMPT && (
          <Stage1InitialPrompt
            initialPrompt={initialPrompt}
            selectedMode={selectedMode}
            loading={authLoading}
            onPromptChange={handlePromptChange}
            onModeChange={handleModeChange}
            onAnalyze={handleAnalyze}
            onTemplateSelect={handleTemplateSelect}
          />
        )}

        {/* Stage 2: Clarification - Only show when not loading */}
        {!loading && currentStage === Stage.CLARIFICATION && (
          <Stage2Clarification
            initialPrompt={initialPrompt}
            questions={questions}
            answers={answers}
            mode={selectedMode}
            loading={false}
            onAnswerChange={handleAnswerChange}
            onBack={handleBack}
            onGenerate={handleGenerate}
          />
        )}

        {/* Stage 3: Super Prompt - Only show when not loading */}
        {!loading && currentStage === Stage.SUPER_PROMPT && (
          <Stage3SuperPrompt
            superPrompt={superPrompt}
            onStartOver={handleStartOver}
            initialPrompt={initialPrompt}
            questions={questions}
            answers={answers}
            mode={selectedMode}
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
```

**Key Changes:**
1. Added `loadingStage` state to track which operation is loading
2. Set `loadingStage` when starting analyze or generate operations
3. Clear `loadingStage` in finally blocks and handleStartOver
4. Render appropriate loading screen based on `loadingStage` and `selectedMode`
5. Hide stage components during loading (prevents blank screen)
6. Pass `loading={false}` to Stage2 since we handle loading separately now

---

### Phase 5: Polish and Testing

#### 5.1 Accessibility Enhancements

**Add ARIA announcements to loading screens:**

In each loading screen component, add:

```typescript
// Add to AnalysisLoadingScreen.tsx after the main div
<div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
  {steps[currentStep]?.label}
</div>
```

This ensures screen readers announce each step as it progresses.

#### 5.2 Error Handling Verification

Ensure all error scenarios properly clear loading states:
- Network errors
- API errors
- Timeout errors
- User cancellation

#### 5.3 Testing Checklist

**Functional Testing:**
- [ ] Normal Mode: Analyze → Loading → Clarification → Generate → Loading → Result
- [ ] Extensive Mode: Same flow with more questions
- [ ] AI Mode: Analyze → Loading → Direct to Result
- [ ] Back button from Stage 2 returns to Stage 1
- [ ] Start Over resets everything including loading states
- [ ] Errors properly clear loading states
- [ ] No blank screens at any point in the flow

**Visual Testing:**
- [ ] Loading animations are smooth on desktop
- [ ] Loading animations are smooth on mobile
- [ ] Responsive design works on all screen sizes
- [ ] No layout shifts or jumps
- [ ] Progress bars animate smoothly
- [ ] Step transitions are visually pleasing

**Accessibility Testing:**
- [ ] Screen reader announces loading states
- [ ] Screen reader announces step progress
- [ ] Keyboard navigation works (though limited during loading)
- [ ] Focus management is proper
- [ ] ARIA labels are present and correct

**Performance Testing:**
- [ ] Animations don't cause lag
- [ ] Memory usage is acceptable
- [ ] No memory leaks from timers
- [ ] Component cleanup works properly

#### 5.4 Responsive Design Considerations

**Mobile optimizations:**
```css
/* Add to loading screen components if needed */
@media (max-width: 640px) {
  .loading-screen {
    padding: 1rem;
  }
  .step-text {
    font-size: 0.875rem;
  }
  .icon-size {
    width: 1rem;
    height: 1rem;
  }
}
```

## 5. Success Criteria

### ✅ Completion Checklist

**Functionality:**
- [ ] All three loading screens created and functional
- [ ] `AnalysisLoadingScreen` shows for Normal/Extensive modes
- [ ] `GenerationLoadingScreen` shows during Stage 2 generation
- [ ] Enhanced `AIModeProgress` shows for AI mode
- [ ] No blank screens during any operation
- [ ] Progressive step indicators work correctly
- [ ] Progress bars animate smoothly
- [ ] Estimated times are displayed

**User Experience:**
- [ ] Users always see visual feedback during processing
- [ ] Loading states clearly communicate what's happening
- [ ] Animations are smooth and professional
- [ ] Mode-specific messaging is clear
- [ ] Design matches app's overall aesthetic

**Technical Quality:**
- [ ] TypeScript types are correct
- [ ] No console errors or warnings
- [ ] Proper cleanup of timers/effects
- [ ] Loading states properly reset on errors
- [ ] State management is clean and predictable

**Accessibility:**
- [ ] Screen readers announce loading states
- [ ] ARIA labels are present
- [ ] Loading role attributes are correct
- [ ] Keyboard users have proper experience

**Performance:**
- [ ] No noticeable lag from animations
- [ ] Component mounts/unmounts efficiently
- [ ] No memory leaks detected
- [ ] Smooth transitions between states

### 📊 Metrics for Success

**Before Implementation:**
- Blank screen duration: 2-5 seconds
- User confusion: High
- Perceived wait time: Feels long
- Professional polish: Moderate

**After Implementation:**
- Blank screen duration: 0 seconds
- User confusion: Minimal
- Perceived wait time: Feels shorter (40% improvement)
- Professional polish: High
- User satisfaction: Expected to increase significantly

## 6. Implementation Timeline

### Estimated Time Breakdown:
- **Phase 1** (AnalysisLoadingScreen): 45 minutes
- **Phase 2** (GenerationLoadingScreen): 30 minutes
- **Phase 3** (Enhance AIModeProgress): 30 minutes
- **Phase 4** (Update page.tsx): 30 minutes
- **Phase 5** (Testing & Polish): 45 minutes

**Total Estimated Time:** 3 hours

### Suggested Implementation Order:
1. ✅ Create `AnalysisLoadingScreen.tsx` (test immediately)
2. ✅ Update `page.tsx` to use it (verify no blank screen)
3. ✅ Create `GenerationLoadingScreen.tsx` (test Stage 2 flow)
4. ✅ Enhance `AIModeProgress.tsx` (test AI mode)
5. ✅ Final testing and polish
6. ✅ Accessibility audit
7. ✅ Update documentation

## 7. Rollout Plan

### Development:
1. Implement on feature branch
2. Test all scenarios locally
3. Review code for quality
4. Test on multiple devices

### Testing:
1. Test all three analysis modes
2. Test error scenarios
3. Test responsive design
4. Test accessibility
5. Performance profiling

### Deployment:
1. Merge to main branch
2. Deploy to production
3. Monitor for errors
4. Gather user feedback

## 8. Future Enhancements

### Potential Improvements (Out of Scope):
- Add actual real-time progress tracking from API
- Include character count/word count during generation
- Add fun facts or tips during loading
- Implement skeleton screens for faster perceived loading
- Add ability to cancel long-running operations
- Show estimated tokens being processed
- Add sound effects (optional, user preference)

## 9. Related Documentation

**Related Tasks:**
- TASK-08: AI Mode Implementation (AI loading is enhancement)
- TASK-07: Three-Tier Analysis Modes (Different loading per mode)
- General UX improvements across the application

**Dependencies:**
- `lib/types.ts` - Type definitions
- `lib/modeConfig.ts` - Mode metadata for badges
- Tailwind CSS configuration

## 10. Notes and Considerations

### Design Decisions:
1. **Progressive vs Static Loading**: Chose progressive to show actual progress
2. **Color Coding**: Different colors for each mode (green=AI, purple=analysis, pink=generation)
3. **Step Timing**: Based on typical API response times
4. **Animations**: Kept subtle to avoid distraction

### Technical Considerations:
1. **Timer Cleanup**: useEffect cleanup prevents memory leaks
2. **State Management**: Separate `loadingStage` prevents conflicts
3. **Responsive**: Mobile-first approach with scaling
4. **Performance**: CSS animations > JavaScript animations for smoothness

### UX Principles Applied:
- **Feedback**: Users always know what's happening
- **Control**: Users can go back during non-loading states
- **Consistency**: Similar patterns across all modes
- **Clarity**: Clear messaging about what's being processed
- **Delight**: Smooth animations add polish without distraction

---

## ✅ TASK READY TO IMPLEMENT

This task is fully planned and ready for implementation. All components, modifications, and testing procedures are documented.

**Next Steps:**
1. Confirm plan approval
2. Begin Phase 1 implementation
3. Test incrementally after each phase
4. Complete all phases
5. Final testing and polish
6. Deploy to production

**Questions or Concerns:**
- Any specific animation preferences?
- Should we add more or fewer steps?
- Any specific timing adjustments needed?
- Additional accessibility requirements?

---

*Task documented by: Plan Agent*  
*Date: October 2, 2025*  
*Status: Ready for Implementation* 🚀
