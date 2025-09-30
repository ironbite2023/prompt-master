// Application stage enum
export enum Stage {
  INITIAL_PROMPT = 'initial',
  CLARIFICATION = 'clarification',
  SUPER_PROMPT = 'super_prompt'
}

// Question interface for Stage 2
export interface Question {
  question: string;
  suggestion: string;
}

// API response for analysis endpoint
export interface AnalyzeResponse {
  questions: Question[];
  error?: string;
}

// API response for generation endpoint
export interface GenerateResponse {
  superPrompt: string;
  error?: string;
}

// Application state interface
export interface AppState {
  currentStage: Stage;
  initialPrompt: string;
  questions: Question[];
  answers: Record<number, string>;
  superPrompt: string;
  loading: boolean;
  error: string | null;
}

// User authentication types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedPrompt {
  id: string;
  user_id: string;
  initial_prompt: string;
  questions: Question[] | null;
  answers: Record<number, string> | null;
  super_prompt: string;
  created_at: string;
}

// API Response for prompts
export interface PromptsResponse {
  prompts: SavedPrompt[];
  error?: string;
}

export interface SavePromptRequest {
  initialPrompt: string;
  questions: Question[];
  answers: Record<number, string>;
  superPrompt: string;
}

export interface SavePromptResponse {
  success: boolean;
  promptId?: string;
  error?: string;
}