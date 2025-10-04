'use client';

import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import ErrorMessage from './ErrorMessage';

interface SaveAnswerModalProps {
  promptId: string;
  answerText: string;
  generationTime?: number;
  onClose: () => void;
  onSaved: () => void;
}

const SaveAnswerModal: React.FC<SaveAnswerModalProps> = ({
  promptId,
  answerText,
  generationTime,
  onClose,
  onSaved,
}) => {
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/prompt-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId,
          answerText,
          notes: notes.trim() || null,
          generationTime,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSaved();
      } else {
        setError(data.error || 'Failed to save answer');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Save Answer</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
            tabIndex={0}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Answer Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Answer (Preview)
            </label>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700 max-h-32 overflow-y-auto">
              <p className="text-gray-400 text-sm line-clamp-4">
                {answerText}
              </p>
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add notes about this answer... (e.g., 'Works well for technical audiences')"
              maxLength={1000}
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {notes.length}/1000 characters
            </p>
          </div>

          {/* Error Display */}
          {error && <ErrorMessage message={error} />}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Answer
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            💡 Tip: Press Ctrl+Enter (or Cmd+Enter) to save quickly
          </p>
        </div>
      </div>
    </div>
  );
};

export default SaveAnswerModal;

