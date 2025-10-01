'use client';

import React from 'react';
import { PromptTemplate } from '@/lib/types';
import TemplateCard from './TemplateCard';
import LoadingSpinner from './LoadingSpinner';

interface TemplateGridProps {
  templates: PromptTemplate[];
  onTemplateSelect: (template: PromptTemplate) => void;
  onTemplateDetails?: (template: PromptTemplate) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  onTemplateSelect,
  onTemplateDetails,
  loading = false,
  emptyMessage = 'No templates found matching your criteria.',
  className = ''
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">📝</div>
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {templates.map((template, index) => (
        <div
          key={template.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <TemplateCard
            template={template}
            onSelect={onTemplateSelect}
            onViewDetails={onTemplateDetails}
          />
        </div>
      ))}
    </div>
  );
};

export default TemplateGrid;
