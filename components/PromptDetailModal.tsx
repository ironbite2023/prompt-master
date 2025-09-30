'use client';

import React, { useState } from 'react';
import { SavedPrompt } from '@/lib/types';
import { X, Copy, Check } from 'lucide-react';

interface PromptDetailModalProps {
  prompt: SavedPrompt;
  onClose: () => void;
}

const PromptDetailModal: React.FC<PromptDetailModalProps> = ({ prompt, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(prompt.super_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl border border-gray-700 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <h2 className="text-2xl font-bold text-white mb-4">
            Prompt Details
          </h2>

          {/* Initial Prompt */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">
              Initial Prompt
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-200">{prompt.initial_prompt}</p>
            </div>
          </div>

          {/* Questions and Answers */}
          {prompt.questions && prompt.questions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">
                Questions & Answers
              </h3>
              <div className="space-y-3">
                {prompt.questions.map((q, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-300 font-medium mb-1">
                      {index + 1}. {q.question}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {prompt.answers?.[index] || 'Not answered'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Super Prompt */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">
              Generated Super Prompt
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <pre className="text-gray-200 whitespace-pre-wrap font-mono text-sm">
                {prompt.super_prompt}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              {copied ? (
                <>
                  <Check size={20} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={20} />
                  Copy Super Prompt
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptDetailModal;
