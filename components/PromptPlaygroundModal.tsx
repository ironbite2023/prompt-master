'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SavedPrompt, PromptAnswer, ANSWER_SOFT_LIMIT } from '@/lib/types';
import { 
  X, 
  Play, 
  Loader2, 
  Save, 
  Download, 
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
              tabIndex={0}
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
                tabIndex={0}
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
                    tabIndex={0}
                  >
                    <Save size={18} />
                    Save Answer
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-all"
                    tabIndex={0}
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

