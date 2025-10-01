'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, Sparkles, Save, Zap, X } from 'lucide-react';
import { Question, AnalysisMode } from '@/lib/types';
import { useAuth } from './providers/AuthProvider';
import BucketSelector from './BucketSelector';

interface Stage3SuperPromptProps {
  superPrompt: string;
  onStartOver: () => void;
  initialPrompt: string;
  questions: Question[];
  answers: Record<number, string>;
  mode?: AnalysisMode; // TASK-08: Optional mode tracking
}

const Stage3SuperPrompt: React.FC<Stage3SuperPromptProps> = ({
  superPrompt,
  onStartOver,
  initialPrompt,
  questions,
  answers,
  mode
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
  const [showBucketSelector, setShowBucketSelector] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const { user } = useAuth();
  const isAIMode = mode === AnalysisMode.AI;

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

  const handleSaveClick = useCallback((): void => {
    setShowBucketSelector(true);
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    if (!user || saving || saved || !selectedBucketId) return;

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
          bucketId: selectedBucketId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save prompt');
      }

      setSaved(true);
      setShowBucketSelector(false);
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Failed to save prompt. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [user, saving, saved, selectedBucketId, initialPrompt, questions, answers, superPrompt]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* AI Mode Badge (TASK-08) */}
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
              aria-label="View AI's analysis"
            >
              View AI&apos;s Analysis
            </button>
          </div>
        </div>
      )}

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

        {/* Bucket Selection Modal */}
        {showBucketSelector && user && !saved && (
          <div className="mt-6 bg-gray-900/80 border border-purple-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">
              Choose a bucket to save this prompt
            </h3>
            <BucketSelector
              selectedBucketId={selectedBucketId}
              onSelect={setSelectedBucketId}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={!selectedBucketId || saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-white shadow-lg"
              >
                {saving ? (
                  <>
                    <Save className="w-5 h-5 animate-pulse" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save to Bucket</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowBucketSelector(false)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-medium text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {user && !saved && !showBucketSelector && (
            <button
              onClick={handleSaveClick}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-colors font-medium text-white shadow-lg"
              aria-label="Save prompt to history"
            >
              <Save className="w-5 h-5" />
              <span>Save to History</span>
            </button>
          )}
          
          {saved && (
            <div className="flex items-center gap-2 px-6 py-3 bg-green-600/20 border border-green-500/30 rounded-lg font-medium text-green-400">
              <Check className="w-5 h-5" />
              <span>Saved to History</span>
            </div>
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

      {/* AI Analysis Modal (TASK-08) */}
      {showAnalysis && isAIMode && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAnalysis(false)}
        >
          <div 
            className="bg-gray-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">AI&apos;s Analysis</h3>
              <button
                onClick={() => setShowAnalysis(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">
              These are the questions AI generated and auto-filled to create your super prompt:
            </p>

            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="bg-gray-900/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-300 mb-2">
                    {index + 1}. {q.question}
                  </p>
                  <div className="bg-green-500/10 p-3 rounded border border-green-500/30">
                    <p className="text-sm text-green-400">
                      {answers[index] || 'No answer provided'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stage3SuperPrompt;
