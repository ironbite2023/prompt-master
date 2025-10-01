'use client';

import React from 'react';
import { Zap, Brain, Microscope, FileText } from 'lucide-react';
import { AnalysisMode } from '@/lib/types';
import { MODE_METADATA } from '@/lib/modeConfig';

interface AnalysisModeSelectorProps {
  selectedMode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  disabled?: boolean;
}

const ICON_MAP = {
  Zap,
  Brain,
  Microscope,
  FileText,
};

const AnalysisModeSelector: React.FC<AnalysisModeSelectorProps> = ({
  selectedMode,
  onModeChange,
  disabled = false,
}) => {
  const handleModeSelect = (mode: AnalysisMode): void => {
    if (!disabled) {
      onModeChange(mode);
    }
  };

  const handleKeyDown = (mode: AnalysisMode, e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleModeSelect(mode);
    }
  };

  return (
    <div className="w-full mb-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-3">
        Choose Analysis Mode
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(AnalysisMode).map((mode) => {
          const metadata = MODE_METADATA[mode];
          const Icon = ICON_MAP[metadata.icon as keyof typeof ICON_MAP];
          const isSelected = selectedMode === mode;

          return (
            <button
              key={mode}
              onClick={() => handleModeSelect(mode)}
              onKeyDown={(e) => handleKeyDown(mode, e)}
              disabled={disabled}
              className={`
                relative p-5 rounded-xl border-2 transition-all duration-200
                ${isSelected
                  ? `border-transparent bg-gradient-to-br ${metadata.colorClass} shadow-lg scale-105`
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/80'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
              `}
              aria-label={`Select ${metadata.name}`}
              aria-pressed={isSelected}
              tabIndex={0}
            >
              {/* Badge */}
              <div className="absolute top-3 right-3">
                <span className={`text-xs px-2 py-1 rounded-full border ${metadata.badge.colorClass}`}>
                  {metadata.badge.text}
                </span>
              </div>

              {/* Icon */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`
                  p-2 rounded-lg
                  ${isSelected ? 'bg-white/20' : 'bg-gray-700/50'}
                `}>
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-300'}`} />
                </div>
                <h4 className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                  {metadata.name}
                </h4>
              </div>

              {/* Description */}
              <p className={`text-sm mb-4 ${isSelected ? 'text-white/90' : 'text-gray-400'}`}>
                {metadata.description}
              </p>

              {/* Stats */}
              <div className="space-y-1 text-xs">
                <div className={`flex items-center justify-between ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                  <span>Time:</span>
                  <span className="font-medium">{metadata.estimatedTime}</span>
                </div>
                <div className={`flex items-center justify-between ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                  <span>Questions:</span>
                  <span className="font-medium">{metadata.questionCount}</span>
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute inset-0 rounded-xl ring-2 ring-white/50 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisModeSelector;
