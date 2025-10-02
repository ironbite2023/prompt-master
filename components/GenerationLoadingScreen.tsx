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
