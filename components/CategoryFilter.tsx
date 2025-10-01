'use client';

import React, { useMemo, useState } from 'react';
import { PromptCategory, PromptSubcategory, SavedPrompt } from '@/lib/types';
import { getAllCategories } from '@/lib/categoryConfig';
import { getSubcategoriesByCategory } from '@/lib/subcategoryConfig';
import { Filter, X, ChevronDown, ChevronRight } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: PromptCategory | 'all';
  selectedSubcategory?: PromptSubcategory | 'all';
  onCategoryChange: (category: PromptCategory | 'all') => void;
  onSubcategoryChange?: (subcategory: PromptSubcategory | 'all') => void;
  prompts: SavedPrompt[];
  showCounts?: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  selectedSubcategory = 'all',
  onCategoryChange,
  onSubcategoryChange,
  prompts,
  showCounts = true
}) => {
  const categories = getAllCategories();
  const [expandedCategory, setExpandedCategory] = useState<PromptCategory | null>(
    selectedCategory !== 'all' ? selectedCategory : null
  );

  // Calculate category and subcategory counts
  const counts = useMemo(() => {
    const catCounts: Record<string, number> = { all: prompts.length };
    const subcatCounts: Record<string, number> = {};
    
    prompts.forEach(prompt => {
      catCounts[prompt.category] = (catCounts[prompt.category] || 0) + 1;
      if (prompt.subcategory) {
        subcatCounts[prompt.subcategory] = (subcatCounts[prompt.subcategory] || 0) + 1;
      }
    });

    return { category: catCounts, subcategory: subcatCounts };
  }, [prompts]);

  const handleCategoryClick = (category: PromptCategory | 'all'): void => {
    onCategoryChange(category);
    if (category !== 'all') {
      setExpandedCategory(category);
    }
  };

  const toggleExpand = (category: PromptCategory, e: React.MouseEvent | React.KeyboardEvent): void => {
    e.stopPropagation();
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleSubcategoryClick = (subcategory: PromptSubcategory): void => {
    if (onSubcategoryChange) {
      onSubcategoryChange(subcategory);
    }
  };

  const handleClearFilter = (): void => {
    onCategoryChange('all');
    if (onSubcategoryChange) {
      onSubcategoryChange('all');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-300">Filter by Category</h3>
        </div>
        
        {selectedCategory !== 'all' && (
          <button
            onClick={handleClearFilter}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            aria-label="Clear filter"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* All Categories */}
      <button
        onClick={() => handleCategoryClick('all')}
        className={`
          w-full flex items-center justify-between px-4 py-2.5 rounded-lg
          text-sm font-medium transition-all
          ${selectedCategory === 'all'
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
          }
        `}
      >
        <span>All Categories</span>
        {showCounts && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            selectedCategory === 'all' ? 'bg-white/20' : 'bg-gray-700'
          }`}>
            {counts.category.all || 0}
          </span>
        )}
      </button>

      {/* Category List with Expandable Subcategories */}
      <div className="space-y-1">
        {categories.map(category => {
          const count = counts.category[category.id] || 0;
          const isSelected = selectedCategory === category.id;
          const isExpanded = expandedCategory === category.id;
          const IconComponent = category.iconComponent;
          const subcategories = getSubcategoriesByCategory(category.id);
          const hasSubcategories = subcategories.length > 0;

          return (
            <div key={category.id}>
              {/* Main Category Button */}
              <button
                onClick={() => handleCategoryClick(category.id)}
                disabled={count === 0}
                className={`
                  w-full flex items-center justify-between px-4 py-2.5 rounded-lg
                  text-sm font-medium transition-all
                  ${isSelected
                    ? `${category.colorClass} border`
                    : count === 0
                      ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-transparent'
                  }
                `}
                title={category.description}
              >
                <div className="flex items-center gap-2 flex-1">
                  {hasSubcategories && (
                    <div
                      onClick={(e) => toggleExpand(category.id, e)}
                      className="hover:bg-gray-600/30 rounded p-0.5 transition-colors cursor-pointer flex items-center"
                      role="button"
                      tabIndex={0}
                      aria-label={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleExpand(category.id, e);
                        }
                      }}
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  )}
                  <IconComponent size={16} />
                  <span>{category.name}</span>
                </div>
                
                {showCounts && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-current/20' : count === 0 ? 'bg-gray-700/50' : 'bg-gray-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>

              {/* Subcategories (Expandable) */}
              {hasSubcategories && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {subcategories.map(subcatMeta => {
                    const subcatId = subcatMeta.id;
                    const subcatCount = counts.subcategory[subcatId] || 0;
                    const isSubcatSelected = selectedSubcategory === subcatId;

                    return (
                      <button
                        key={subcatId}
                        onClick={() => handleSubcategoryClick(subcatId)}
                        disabled={subcatCount === 0}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 rounded-md
                          text-xs font-medium transition-all
                          ${isSubcatSelected
                            ? 'bg-gray-600/50 text-white border border-gray-500'
                            : subcatCount === 0
                              ? 'bg-gray-800/20 text-gray-600 cursor-not-allowed'
                              : 'bg-gray-800/30 text-gray-400 hover:bg-gray-700/40'
                          }
                        `}
                        title={subcatMeta.description}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{subcatMeta.icon}</span>
                          <span>{subcatMeta.name}</span>
                        </div>
                        {showCounts && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            isSubcatSelected ? 'bg-white/10' : 'bg-gray-700/50'
                          }`}>
                            {subcatCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
