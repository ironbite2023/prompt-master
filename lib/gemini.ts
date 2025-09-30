import { GoogleGenAI } from '@google/genai';

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

// Default model to use
export const DEFAULT_MODEL = 'gemini-2.0-flash-exp';
