'use client';

import React from 'react';
import { PromptCategory } from '@/lib/types';
import { getCategoryMetadata } from '@/lib/categoryConfig';

interface CategoryBadgeProps {
  category: PromptCategory;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category, 
  size = 'md',
  showIcon = true 
}) => {
  const metadata = getCategoryMetadata(category);
  const IconComponent = metadata.iconComponent;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <div 
      className={`
        inline-flex items-center gap-1.5 rounded-full border
        ${metadata.colorClass}
        ${sizeClasses[size]}
        font-medium transition-all
      `}
      title={metadata.description}
    >
      {showIcon && <IconComponent size={iconSizes[size]} />}
      <span>{metadata.name}</span>
    </div>
  );
};

export default CategoryBadge;
