'use client';

import React from 'react';
import { X, Clock, Tag, Star, ArrowRight, Copy, type LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { PromptTemplate } from '@/lib/types';
import { getCategoryColor, getCategoryName } from '@/lib/categoryConfig';

interface TemplateDetailModalProps {
  template: PromptTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: PromptTemplate) => void;
}

const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  template,
  isOpen,
  onClose,
  onSelect
}) => {
  if (!isOpen) return null;

  const IconComponent = (LucideIcons[template.icon as keyof typeof LucideIcons] as LucideIcon) || Tag;

  const handleSelect = (): void => {
    onSelect(template);
    onClose();
  };

  const handleCopyPrompt = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(template.prompt);
      // Optional: Show toast notification
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const renderPopularityStars = (popularity: number): React.ReactNode[] => {
    const stars = [];
    const fullStars = Math.floor(popularity / 2);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < fullStars 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-600'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 shadow-xl rounded-2xl border border-gray-700">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${getCategoryColor(template.category)}`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-100">
                  {template.title}
                </h2>
                <p className="text-gray-400 mt-1">
                  {getCategoryName(template.category)} • {template.difficulty}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Description & Meta */}
            <div>
              <p className="text-gray-300 text-lg mb-4">
                {template.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{template.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderPopularityStars(template.popularity)}
                  <span>({template.popularity}/10)</span>
                </div>
              </div>
            </div>

            {/* Use Cases */}
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                Perfect For:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {template.useCases.map((useCase, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-gray-300"
                  >
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                    <span>{useCase}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Output */}
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                Expected Output:
              </h3>
              <p className="text-gray-300 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                {template.expectedOutput}
              </p>
            </div>

            {/* Template Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-200">
                  Template Preview:
                </h3>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
              <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                  {template.prompt}
                </pre>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                Tags:
              </h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium text-white 
                transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Use This Template</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDetailModal;
