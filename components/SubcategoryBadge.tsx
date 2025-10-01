'use client';

import React from 'react';
import { PromptSubcategory } from '@/lib/types';
import { getSubcategoryMetadata } from '@/lib/subcategoryConfig';

interface SubcategoryBadgeProps {
  subcategory: PromptSubcategory;
  size?: 'sm' | 'md';
  className?: string;
}

const SubcategoryBadge: React.FC<SubcategoryBadgeProps> = ({ 
  subcategory, 
  size = 'sm',
  className = ''
}) => {
  const metadata = getSubcategoryMetadata(subcategory);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1'
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1 rounded-md
        bg-gray-700/50 text-gray-300 border border-gray-600/50
        ${sizeClasses[size]}
        font-medium transition-all hover:bg-gray-600/50
        ${className}
      `}
      title={metadata.description}
    >
      <span>{metadata.icon}</span>
      <span>{metadata.name}</span>
    </span>
  );
};

export default SubcategoryBadge;
