'use client';

import React, { useState, useCallback } from 'react';
import { SavedPrompt, Bucket } from '@/lib/types';
import { AlertTriangle, X, Folder } from 'lucide-react';
import CategoryBadge from './CategoryBadge';

interface DeletePromptModalProps {
  prompt: SavedPrompt;
  bucket?: Bucket;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const DeletePromptModal: React.FC<DeletePromptModalProps> = ({
  prompt,
  bucket,
  onConfirm,
  onCancel,
}) => {
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = useCallback(async (): Promise<void> => {
    setDeleting(true);
    setError(null);

    try {
      await onConfirm();
      // Modal will be closed by parent component
    } catch {
      setError('Failed to delete prompt. Please try again.');
      setDeleting(false);
    }
  }, [onConfirm]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-lg w-full p-6 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="text-red-400" size={24} />
            Delete Prompt?
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-300 transition-colors"
            disabled={deleting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete this prompt? This action cannot be undone.
        </p>

        {/* Prompt Preview Card */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-4">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {bucket && (
              <div
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: `${bucket.color}20`,
                  color: bucket.color,
                }}
              >
                <Folder size={12} />
                {bucket.name}
              </div>
            )}
            <CategoryBadge category={prompt.category} size="sm" />
          </div>

          {/* 🆕 UPDATED: Title + Prompt Preview */}
          <p className="text-white font-semibold mb-2">{prompt.title}</p>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {prompt.initial_prompt}
          </p>

          {/* Creation Date */}
          <p className="text-xs text-gray-500">
            Created: {new Date(prompt.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-200">
            ⚠️ This action cannot be undone.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600/20 border border-red-600 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {deleting ? 'Deleting...' : 'Delete Prompt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePromptModal;
