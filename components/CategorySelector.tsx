'use client';

import React from 'react';
import { PromptCategory } from '@/lib/types';
import { getAllCategories } from '@/lib/categoryConfig';

interface CategorySelectorProps {
  selectedCategory: PromptCategory | null;
  onSelect: (category: PromptCategory) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelect
}) => {
  const categories = getAllCategories();

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Category <span className="text-red-400">*</span>
      </label>
      
      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const IconComponent = category.iconComponent;
          
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <div className="flex-shrink-0">
                <IconComponent size={20} className="text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-200 mb-1">
                  {category.name}
                </div>
                <div className="text-xs text-gray-400 line-clamp-2">
                  {category.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;
