'use client';

import React, { useState, useEffect, useMemo } from 'react';
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

  const steps: Step[] = useMemo(() => [
    { id: 0, label: 'Analyzing prompt and generating clarifying questions', icon: Brain, duration: 5000 },
    { id: 1, label: 'Auto-filling context with intelligent answers', icon: MessageSquare, duration: 8000 },
    { id: 2, label: 'Creating optimized super prompt', icon: Sparkles, duration: 7000 },
  ], []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const progressSteps = (): void => {
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

        {/* Screen reader announcement */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {steps[currentStep]?.label}
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
