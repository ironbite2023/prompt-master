'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { PromptTemplate, PromptCategory, TemplateDifficulty, TemplateFilters } from '@/lib/types';
import { getAllCategories, getCategoryName } from '@/lib/categoryConfig';
import { getTopTemplates, filterTemplates } from '@/lib/templateConfig';
import TemplateGrid from './TemplateGrid';
import TemplateDetailModal from './TemplateDetailModal';

interface TemplateSelectorProps {
  onTemplateSelect: (template: PromptTemplate) => void;
  className?: string;
  initialCollapsed?: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onTemplateSelect,
  className = '',
  initialCollapsed = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!initialCollapsed);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const [filters, setFilters] = useState<TemplateFilters>({
    category: 'all',
    difficulty: 'all',
    searchQuery: ''
  });

  // Get templates based on filters
  const displayTemplates = useMemo(() => {
    if (filters.category === 'all' && filters.difficulty === 'all' && !filters.searchQuery) {
      return getTopTemplates(isExpanded ? 12 : 6);
    }
    return filterTemplates(filters);
  }, [filters, isExpanded]);

  const handleFilterChange = useCallback((newFilters: Partial<TemplateFilters>): void => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleTemplateSelect = useCallback((template: PromptTemplate): void => {
    onTemplateSelect(template);
  }, [onTemplateSelect]);

  const handleViewDetails = useCallback((template: PromptTemplate): void => {
    setSelectedTemplate(template);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback((): void => {
    setShowModal(false);
    setSelectedTemplate(null);
  }, []);

  const toggleExpanded = useCallback((): void => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <>
      <div className={`bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700/30 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-purple-pink">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">
                Professional Templates
              </h2>
              <p className="text-sm text-gray-400">
                Quick-start with expert-crafted prompts
              </p>
            </div>
          </div>
          
          <button
            onClick={toggleExpanded}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-purple-400 transition-colors"
          >
            {isExpanded ? (
              <>
                <span>Show Less</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Show All</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Filters */}
        {isExpanded && (
          <div className="space-y-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-gray-100 
                  placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category & Difficulty Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange({ category: e.target.value as PromptCategory | 'all' })}
                  className="px-3 py-1 bg-gray-900/50 border border-gray-600 rounded text-sm text-gray-100 
                    focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="all">All Categories</option>
                  {getAllCategories().map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange({ difficulty: e.target.value as TemplateDifficulty | 'all' })}
                className="px-3 py-1 bg-gray-900/50 border border-gray-600 rounded text-sm text-gray-100 
                  focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="all">All Levels</option>
                <option value={TemplateDifficulty.BEGINNER}>Beginner</option>
                <option value={TemplateDifficulty.INTERMEDIATE}>Intermediate</option>
                <option value={TemplateDifficulty.ADVANCED}>Advanced</option>
              </select>
            </div>
          </div>
        )}

        {/* Template Grid */}
        <TemplateGrid
          templates={displayTemplates}
          onTemplateSelect={handleTemplateSelect}
          onTemplateDetails={handleViewDetails}
          emptyMessage="No templates match your current filters."
        />

        {/* Results Summary */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Showing {displayTemplates.length} template{displayTemplates.length !== 1 ? 's' : ''}
            {filters.category !== 'all' && ` in ${getCategoryName(filters.category as PromptCategory)}`}
          </p>
        </div>
      </div>

      {/* Template Detail Modal */}
      {showModal && selectedTemplate && (
        <TemplateDetailModal
          template={selectedTemplate}
          isOpen={showModal}
          onClose={handleCloseModal}
          onSelect={handleTemplateSelect}
        />
      )}
    </>
  );
};

export default TemplateSelector;
