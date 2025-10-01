'use client';

import React from 'react';
import { 
  Clock, 
  Tag, 
  ArrowRight, 
  Star,
  type LucideIcon 
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { PromptTemplate, TemplateDifficulty } from '@/lib/types';
import { getCategoryColor } from '@/lib/categoryConfig';

interface TemplateCardProps {
  template: PromptTemplate;
  onSelect: (template: PromptTemplate) => void;
  onViewDetails?: (template: PromptTemplate) => void;
  className?: string;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onSelect,
  onViewDetails,
  className = ''
}) => {
  // Get dynamic icon component
  const IconComponent = (LucideIcons[template.icon as keyof typeof LucideIcons] as LucideIcon) || Tag;
  
  // Difficulty styling
  const getDifficultyStyle = (difficulty: TemplateDifficulty): string => {
    switch (difficulty) {
      case TemplateDifficulty.BEGINNER:
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case TemplateDifficulty.INTERMEDIATE:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case TemplateDifficulty.ADVANCED:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Popularity stars
  const renderPopularityStars = (popularity: number): React.ReactNode[] => {
    const stars = [];
    const fullStars = Math.floor(popularity / 2);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < fullStars 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-600'
          }`}
        />
      );
    }
    return stars;
  };

  const handleSelect = (): void => {
    onSelect(template);
  };

  const handleViewDetails = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onViewDetails?.(template);
  };

  return (
    <div
      className={`bg-gray-800/50 rounded-xl p-5 backdrop-blur-sm border border-gray-700/50 
        hover:border-purple-500/30 hover:bg-gray-800/70 transition-all duration-300 
        cursor-pointer group hover:scale-[1.02] shadow-lg hover:shadow-xl ${className}`}
      onClick={handleSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {renderPopularityStars(template.popularity)}
              <span className="text-xs text-gray-500">
                ({template.popularity}/10)
              </span>
            </div>
          </div>
        </div>
        
        {/* Difficulty Badge */}
        <span className={`px-2 py-1 rounded-full text-xs font-medium border capitalize ${getDifficultyStyle(template.difficulty)}`}>
          {template.difficulty}
        </span>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-purple-300 transition-colors">
          {template.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {template.description}
        </p>
        
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{template.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>{template.useCases[0]}</span>
            {template.useCases.length > 1 && (
              <span className="text-gray-600">+{template.useCases.length - 1}</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleViewDetails}
          className="text-xs text-gray-400 hover:text-purple-400 transition-colors"
        >
          View Details
        </button>
        
        <button
          onClick={handleSelect}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
            hover:from-purple-700 hover:to-pink-700 rounded-lg text-sm font-medium text-white 
            transition-all duration-200 group-hover:shadow-lg"
        >
          <span>Use Template</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;
