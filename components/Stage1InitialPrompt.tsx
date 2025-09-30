'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface Stage1InitialPromptProps {
  initialPrompt: string;
  loading: boolean;
  onPromptChange: (value: string) => void;
  onAnalyze: () => void;
}

const Stage1InitialPrompt: React.FC<Stage1InitialPromptProps> = ({
  initialPrompt,
  loading,
  onPromptChange,
  onAnalyze
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    onPromptChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && initialPrompt.trim()) {
      onAnalyze();
    }
  };

  const isDisabled = !initialPrompt.trim() || loading;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-purple-pink mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Prompt Master
        </h1>
        <p className="text-gray-400 text-lg">
          Transform your simple ideas into powerful AI prompts
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-xl">
        <label htmlFor="initial-prompt" className="block text-sm font-medium text-gray-300 mb-3">
          Enter your initial prompt or idea
        </label>
        <textarea
          id="initial-prompt"
          value={initialPrompt}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Example: Write a blog post about artificial intelligence..."
          disabled={loading}
          className="w-full min-h-[200px] px-4 py-3 bg-gray-900/80 border border-gray-600 rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Initial prompt input"
        />
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Tip: Press Ctrl/Cmd + Enter to analyze
          </p>
          <button
            onClick={onAnalyze}
            disabled={isDisabled}
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
