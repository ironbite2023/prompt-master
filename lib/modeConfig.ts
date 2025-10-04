import { AnalysisMode, AnalysisModeMetadata, ModeConfig } from './types';
import { GEMINI_CONFIG } from './gemini';

/**
 * Configuration for each analysis mode
 * References centralized GEMINI_CONFIG from lib/gemini.ts
 */
export const MODE_CONFIGS: Record<AnalysisMode, ModeConfig> = {
  [AnalysisMode.AI]: {
    minQuestions: 4,
    maxQuestions: 6,
    temperature: GEMINI_CONFIG.temperature.balanced,
    maxOutputTokens: GEMINI_CONFIG.maxOutputTokens.analysis,
    autoAnswer: true,
  },
  [AnalysisMode.NORMAL]: {
    minQuestions: 4,
    maxQuestions: 6,
    temperature: GEMINI_CONFIG.temperature.balanced,
    maxOutputTokens: GEMINI_CONFIG.maxOutputTokens.analysis,
    autoAnswer: false,
  },
  [AnalysisMode.EXTENSIVE]: {
    minQuestions: 8,
    maxQuestions: 12,
    temperature: GEMINI_CONFIG.temperature.creative,
    maxOutputTokens: GEMINI_CONFIG.maxOutputTokens.extensive,
    autoAnswer: false,
  },
  [AnalysisMode.MANUAL]: {
    minQuestions: 0,
    maxQuestions: 0,
    temperature: 0,
    maxOutputTokens: 0,
    autoAnswer: false,
  },
};

/**
 * Display metadata for each mode
 */
export const MODE_METADATA: Record<AnalysisMode, AnalysisModeMetadata> = {
  [AnalysisMode.AI]: {
    id: AnalysisMode.AI,
    name: 'AI Mode',
    description: 'Fully automated generation. AI analyzes, answers questions, and creates your super prompt - all in one step.',
    icon: 'Zap',
    colorClass: 'from-green-500 to-emerald-500',
    estimatedTime: '~20-30 seconds',
    questionCount: '4-6 questions (automated)',
    badge: {
      text: 'Fastest',
      colorClass: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
  },
  [AnalysisMode.NORMAL]: {
    id: AnalysisMode.NORMAL,
    name: 'Normal Mode',
    description: 'Balanced approach with AI-generated questions and your input. Ideal for most use cases.',
    icon: 'Brain',
    colorClass: 'from-blue-500 to-cyan-500',
    estimatedTime: '~2-3 minutes',
    questionCount: '4-6 questions',
    badge: {
      text: 'Balanced',
      colorClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
  },
  [AnalysisMode.EXTENSIVE]: {
    id: AnalysisMode.EXTENSIVE,
    name: 'Extensive Mode',
    description: 'Deep analysis with comprehensive questions covering all aspects. Best for complex, critical prompts.',
    icon: 'Microscope',
    colorClass: 'from-purple-500 to-pink-500',
    estimatedTime: '~5-7 minutes',
    questionCount: '8-12 questions',
    badge: {
      text: 'Most Detailed',
      colorClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
  },
  [AnalysisMode.MANUAL]: {
    id: AnalysisMode.MANUAL,
    name: 'Manual Entry',
    description: 'Direct prompt entry without analysis workflow',
    icon: 'FileText',
    colorClass: 'from-gray-500 to-gray-600',
    estimatedTime: '< 1 min',
    questionCount: '0',
    badge: {
      text: 'MANUAL',
      colorClass: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    },
  },
};

/**
 * Get configuration for a specific mode
 */
export const getModeConfig = (mode: AnalysisMode): ModeConfig => {
  return MODE_CONFIGS[mode];
};

/**
 * Get metadata for a specific mode
 */
export const getModeMetadata = (mode: AnalysisMode): AnalysisModeMetadata => {
  return MODE_METADATA[mode];
};
