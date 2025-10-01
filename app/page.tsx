'use client';

import React, { useState, useCallback } from 'react';
import { Stage, Question, AnalyzeResponse, GenerateResponse, AnalysisMode, PromptTemplate } from '@/lib/types';
import Stage1InitialPrompt from '@/components/Stage1InitialPrompt';
import Stage2Clarification from '@/components/Stage2Clarification';
import Stage3SuperPrompt from '@/components/Stage3SuperPrompt';
import AIModeProgress from '@/components/AIModeProgress';
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

  const handleTemplateSelect = useCallback((template: PromptTemplate): void => {
    setInitialPrompt(template.prompt);
    setError(null);
    
    // Scroll to prompt textarea after a brief delay
    setTimeout(() => {
      const textarea = document.getElementById('initial-prompt');
      textarea?.focus();
    }, 100);
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
          
          {/* AI Mode Progress Indicator */}
          {loading && selectedMode === AnalysisMode.AI && (
            <AIModeProgress />
          )}
          
          {/* Stage 1: Initial Prompt */}
          {!loading && currentStage === Stage.INITIAL_PROMPT && (
            <Stage1InitialPrompt
              initialPrompt={initialPrompt}
              selectedMode={selectedMode}
              loading={loading || authLoading}
              onPromptChange={handlePromptChange}
              onModeChange={handleModeChange}
              onAnalyze={handleAnalyze}
              onTemplateSelect={handleTemplateSelect}
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
};

export default HomePage;
