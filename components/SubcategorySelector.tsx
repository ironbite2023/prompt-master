'use client';

import React from 'react';
import { PromptCategory, PromptSubcategory } from '@/lib/types';
import { getSubcategoriesByCategory } from '@/lib/subcategoryConfig';

interface SubcategorySelectorProps {
  parentCategory: PromptCategory | null;
  selectedSubcategory: PromptSubcategory | null;
  onSelect: (subcategory: PromptSubcategory | null) => void;
}

const SubcategorySelector: React.FC<SubcategorySelectorProps> = ({
  parentCategory,
  selectedSubcategory,
  onSelect
}) => {
  const subcategories = parentCategory ? getSubcategoriesByCategory(parentCategory) : [];

  if (!parentCategory) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-400">
          Subcategory (Optional)
        </label>
        <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg text-center">
          <p className="text-sm text-gray-500">
            Select a category first to see subcategory options
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Subcategory <span className="text-gray-500">(Optional)</span>
      </label>
      
      {/* None Option */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`w-full flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
          selectedSubcategory === null
            ? 'border-purple-500 bg-purple-500/20 text-purple-300'
            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 text-gray-400'
        }`}
      >
        <span className="text-lg">🚫</span>
        <span className="text-sm">None (category only)</span>
      </button>
      
      {/* Subcategory Options */}
      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
        {subcategories.map((subcategory) => {
          const isSelected = selectedSubcategory === subcategory.id;
          
          return (
            <button
              key={subcategory.id}
              type="button"
              onClick={() => onSelect(subcategory.id)}
              className={`flex items-start gap-2 p-2 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
              }`}
            >
              <span className="text-sm flex-shrink-0">{subcategory.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-200">
                  {subcategory.name}
                </div>
                <div className="text-xs text-gray-400 line-clamp-1">
                  {subcategory.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {subcategories.length === 0 && (
        <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg text-center">
          <p className="text-sm text-gray-500">
            No subcategories available for this category
          </p>
        </div>
      )}
    </div>
  );
};

export default SubcategorySelector;
