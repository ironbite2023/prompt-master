'use client';

import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Sparkles, Save } from 'lucide-react';
import { Question } from '@/lib/types';
import { useAuth } from './providers/AuthProvider';

interface Stage3SuperPromptProps {
  superPrompt: string;
  onStartOver: () => void;
  initialPrompt: string;
  questions: Question[];
  answers: Record<number, string>;
}

const Stage3SuperPrompt: React.FC<Stage3SuperPromptProps> = ({
  superPrompt,
  onStartOver,
  initialPrompt,
  questions,
  answers
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const { user } = useAuth();

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(superPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = superPrompt;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!user || saving || saved) return;

    setSaving(true);

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialPrompt,
          questions,
          answers,
          superPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save prompt');
      }

      setSaved(true);
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Failed to save prompt. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-purple-pink mb-4 animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Your Super Prompt is Ready!
        </h2>
        <p className="text-gray-400">
          Copy this optimized prompt and use it with any AI model
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-300">Generated Super Prompt</h3>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-white"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
        </div>

        <div
          className="w-full min-h-[300px] max-h-[500px] overflow-y-auto px-4 py-3 bg-gray-900/80 border border-gray-600 rounded-lg text-foreground whitespace-pre-wrap"
          role="textbox"
          aria-readonly="true"
          aria-label="Generated super prompt"
        >
          {superPrompt}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {user && (
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-colors font-medium text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Save prompt to history"
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Saved to History</span>
                </>
              ) : saving ? (
                <>
                  <Save className="w-5 h-5 animate-pulse" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save to History</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={onStartOver}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-medium text-white shadow-lg"
            aria-label="Start over with new prompt"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Start Over</span>
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <p className="text-sm text-purple-200 text-center">
          💡 <strong>Tip:</strong> Test this super prompt with different AI models like ChatGPT, Claude, or Gemini to see which produces the best results!
        </p>
      </div>
    </div>
  );
};

export default Stage3SuperPrompt;
