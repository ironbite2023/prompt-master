import { GoogleGenAI } from '@google/genai';

// =====================================================
// CENTRALIZED GEMINI CONFIGURATION
// =====================================================
// Change these values in ONE place to affect ALL API calls

/**
 * Model Selection
 */
export const DEFAULT_MODEL = 'gemini-2.5-pro'; // Primary model for maximum quality
export const FLASH_MODEL = 'gemini-2.5-flash'; // Alternative for speed-critical operations

/**
 * Global Gemini API Configuration
 * These parameters control the quality and behavior of all AI responses
 */
export const GEMINI_CONFIG = {
  // Sampling parameters (applied to all API calls)
  topP: 0.95,    // Nucleus sampling: 0.0-1.0 (higher = more diverse)
  topK: 40,      // Token diversity: 1-100 (higher = more options)
  
  // Temperature ranges by use case
  temperature: {
    creative: 1.0,      // For creative, diverse outputs (generation, playground)
    balanced: 0.9,      // For balanced quality (normal analysis)
    analytical: 0.7,    // For focused, consistent outputs (if needed)
  },
  
  // Token limits by operation type
  maxOutputTokens: {
    analysis: 4096,     // For generating questions (Normal/AI modes)
    extensive: 6144,    // For extensive analysis (8-12 questions)
    generation: 8192,   // For super prompt generation
    playground: 8192,   // For playground responses
  }
} as const;

/**
 * Get base config for Gemini API calls
 * This ensures consistency across all endpoints
 */
export const getBaseGeminiConfig = () => ({
  topP: GEMINI_CONFIG.topP,
  topK: GEMINI_CONFIG.topK,
});

/**
 * Get config for creative outputs (generation, playground)
 */
export const getCreativeConfig = (maxTokens: number = GEMINI_CONFIG.maxOutputTokens.generation) => ({
  ...getBaseGeminiConfig(),
  temperature: GEMINI_CONFIG.temperature.creative,
  maxOutputTokens: maxTokens,
});

/**
 * Get config for analytical outputs (question generation)
 */
export const getAnalysisConfig = (maxTokens: number = GEMINI_CONFIG.maxOutputTokens.analysis) => ({
  ...getBaseGeminiConfig(),
  temperature: GEMINI_CONFIG.temperature.balanced,
  maxOutputTokens: maxTokens,
});

// Initialize the Gemini AI client
// The API key should be stored in environment variables
export const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }

  return new GoogleGenAI({
    apiKey: apiKey
  });
};
