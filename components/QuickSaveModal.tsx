'use client';

import React, { useState, useCallback } from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';
import { PromptCategory, PromptSubcategory, QuickSavePromptRequest } from '@/lib/types';
import BucketSelector from './BucketSelector';
import CategorySelector from './CategorySelector';
import SubcategorySelector from './SubcategorySelector';
import LoadingSpinner from './LoadingSpinner';

interface QuickSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: QuickSavePromptRequest) => Promise<void>;
}

const QuickSaveModal: React.FC<QuickSaveModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [promptText, setPromptText] = useState('');
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<PromptSubcategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset subcategory when category changes
  const handleCategoryChange = useCallback((category: PromptCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null); // Reset subcategory
    setError(null); // Clear any errors
  }, []);

  // Form validation
  const canSave = 
    promptText.trim().length >= 10 &&
    selectedBucketId !== null &&
    selectedCategory !== null &&
    !saving;

  const handleSave = async (): Promise<void> => {
    if (!canSave) return;

    setSaving(true);
    setError(null);

    try {
      await onSave({
        promptText: promptText.trim(),
        bucketId: selectedBucketId!,
        category: selectedCategory!,
        subcategory: selectedSubcategory || undefined
      });

      // Reset form on success
      setPromptText('');
      setSelectedBucketId(null);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save prompt';
      setError(errorMessage);
      console.error('Quick save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = useCallback((): void => {
    if (saving) return; // Prevent closing during save
    onClose();
  }, [saving, onClose]);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPromptText('');
      setSelectedBucketId(null);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setError(null);
    }
  }, [isOpen]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-purple-400" />
              <h2 className="text-xl font-bold text-white">Quick Save Prompt</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={saving}
              className="p-2 text-gray-400 hover:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
              )}

              {/* Prompt Text Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Prompt Text <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Enter your prompt here... (minimum 10 characters)"
                  className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                  disabled={saving}
                />
                <div className="flex justify-between items-center">
                  <div className={`text-xs ${
                    promptText.length < 10 
                      ? 'text-red-400' 
                      : promptText.length > 5000 
                        ? 'text-yellow-400' 
                        : 'text-gray-400'
                  }`}>
                    {promptText.length < 10 
                      ? `${10 - promptText.length} more characters needed`
                      : `${promptText.length} characters`}
                  </div>
                  {promptText.length > 5000 && (
                    <div className="text-xs text-yellow-400">
                      Very long prompt - consider splitting
                    </div>
                  )}
                </div>
              </div>

              {/* Two Column Layout for Selectors */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Bucket Selector */}
                  <BucketSelector
                    selectedBucketId={selectedBucketId}
                    onSelect={setSelectedBucketId}
                  />

                  {/* Category Selector */}
                  <CategorySelector
                    selectedCategory={selectedCategory}
                    onSelect={handleCategoryChange}
                  />
                </div>

                {/* Right Column */}
                <div>
                  {/* Subcategory Selector */}
                  <SubcategorySelector
                    parentCategory={selectedCategory}
                    selectedSubcategory={selectedSubcategory}
                    onSelect={setSelectedSubcategory}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 p-6">
            <div className="flex items-center justify-between">
              {/* Save Info */}
              <div className="text-xs text-gray-500">
                Prompt will be saved without analysis workflow
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={saving}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Prompt</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSaveModal;
