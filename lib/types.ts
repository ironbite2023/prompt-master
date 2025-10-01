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

// =====================================================
// ANALYSIS MODE TYPES (TASK-07)
// =====================================================

/**
 * Analysis mode enum - determines the depth and automation level
 */
export enum AnalysisMode {
  AI = 'ai',           // Automated: AI generates and answers questions
  NORMAL = 'normal',   // Balanced: AI generates, user answers
  EXTENSIVE = 'extensive', // Deep: AI generates 8-12 comprehensive questions
  MANUAL = 'manual'    // Quick Save: User provides prompt directly without analysis
}

/**
 * Metadata for each analysis mode
 */
export interface AnalysisModeMetadata {
  id: AnalysisMode;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  colorClass: string; // Tailwind classes for visual distinction
  estimatedTime: string;
  questionCount: string;
  badge: {
    text: string;
    colorClass: string;
  };
}

/**
 * Mode-specific configuration
 */
export interface ModeConfig {
  minQuestions: number;
  maxQuestions: number;
  temperature: number;
  maxOutputTokens: number;
  autoAnswer: boolean;
}

// API response for analysis endpoint
export interface AnalyzeResponse {
  questions: Question[];
  mode: AnalysisMode; // Track which mode was used
  autoAnswers?: Record<number, string>; // AI Mode auto-generated answers
  superPrompt?: string; // NEW: AI Mode auto-generated super prompt (TASK-08)
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
  selectedMode: AnalysisMode; // NEW: Currently selected mode
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

export interface Bucket {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
  promptCount?: number; // Optional: Added by API for statistics
  lastUsedDate?: string | null; // Optional: Added by API for statistics
}

export interface SavedPrompt {
  id: string;
  user_id: string;
  initial_prompt: string;
  questions: Question[] | null;
  answers: Record<number, string> | null;
  super_prompt: string;
  bucket_id: string;
  category: PromptCategory; // Added category field
  subcategory?: PromptSubcategory | null; // TASK-08: Optional subcategory for granular classification
  analysis_mode: AnalysisMode; // NEW: Track analysis mode used
  created_at: string;
  bucket?: Bucket; // Optional joined bucket data
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
  bucketId: string; // Required bucket selection
  category?: PromptCategory; // Optional: auto-assigned if not provided
}

export interface SavePromptResponse {
  success: boolean;
  promptId?: string;
  error?: string;
}

// Bucket API responses
export interface BucketsResponse {
  buckets: Bucket[];
  error?: string;
}

export interface CreateBucketRequest {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateBucketRequest {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
}

export interface DeleteBucketRequest {
  bucketId: string;
  reassignToBucketId: string; // Required: where to move prompts
}

export interface BucketResponse {
  success: boolean;
  bucket?: Bucket;
  error?: string;
}

// =====================================================
// CATEGORY SYSTEM TYPES (TASK-06)
// =====================================================

/**
 * Enum for all available prompt categories
 * These are predefined and cannot be modified by users
 */
export enum PromptCategory {
  SOFTWARE_DEV = 'software-development',
  CONTENT_WRITING = 'content-writing',
  MARKETING = 'marketing-advertising',
  SEO_RESEARCH = 'seo-research',
  BUSINESS_COMM = 'business-communication',
  EDUCATION = 'education-learning',
  CREATIVE_DESIGN = 'creative-design',
  DATA_ANALYTICS = 'data-analytics',
  PRODUCTIVITY = 'productivity-planning',
  GENERAL = 'general-other'
}

/**
 * Metadata for each category including display information
 */
export interface CategoryMetadata {
  id: PromptCategory;
  name: string;           // Display name
  description: string;    // Full description
  icon: string;           // Lucide icon name
  colorClass: string;     // Tailwind color classes
  keywords: string[];     // Keywords for AI classification
}

// =====================================================
// SUBCATEGORY SYSTEM TYPES (TASK-08)
// =====================================================

/**
 * All subcategories across all main categories (61 total)
 * Organized by parent category for clarity
 */
export enum PromptSubcategory {
  // Software Development (7)
  AI_ML_DEV = 'ai-ml-development',
  WEB_DEV = 'web-development',
  MOBILE_DEV = 'mobile-development',
  DATABASE_BACKEND = 'database-backend',
  DEVOPS_INFRA = 'devops-infrastructure',
  TESTING_QA = 'testing-quality',
  DOCS_ARCH = 'docs-architecture',
  
  // Content Writing (6)
  BLOG_ARTICLES = 'blog-articles',
  CREATIVE_FICTION = 'creative-fiction',
  JOURNALISM = 'journalism-news',
  TECHNICAL_WRITING = 'technical-writing',
  COPYWRITING = 'copywriting',
  SCRIPTS = 'scripts-screenplays',
  
  // Marketing & Advertising (7)
  SOCIAL_MEDIA = 'social-media',
  EMAIL_MARKETING = 'email-marketing',
  CONTENT_MARKETING = 'content-marketing',
  PAID_ADS = 'paid-advertising',
  BRAND_STRATEGY = 'brand-strategy',
  GROWTH_ANALYTICS = 'growth-analytics',
  INFLUENCER = 'influencer-marketing',
  
  // SEO & Research (5)
  KEYWORD_RESEARCH = 'keyword-research',
  ON_PAGE_SEO = 'on-page-seo',
  LINK_BUILDING = 'link-building',
  TECHNICAL_SEO = 'technical-seo',
  COMPETITIVE = 'competitive-analysis',
  
  // Business Communication (6)
  PROF_EMAILS = 'professional-emails',
  PRESENTATIONS = 'presentations',
  REPORTS_DOCS = 'reports-docs',
  PROPOSALS = 'proposals-contracts',
  MEETINGS = 'meeting-materials',
  CLIENT_COMM = 'client-communication',
  
  // Education & Learning (6)
  COURSE_CONTENT = 'course-content',
  TUTORIALS = 'tutorials',
  EDU_VIDEOS = 'educational-videos',
  STUDY_GUIDES = 'study-guides',
  LESSON_PLANS = 'lesson-plans',
  ASSESSMENTS = 'assessments',
  
  // Creative & Design (7)
  UI_UX = 'ui-ux-design',
  GRAPHIC_DESIGN = 'graphic-design',
  BRANDING = 'branding-identity',
  WEB_DESIGN = 'web-design',
  VISUAL_CONCEPTS = 'visual-concepts',
  ILLUSTRATION = 'illustration-art',
  MOTION_DESIGN = 'motion-design',
  
  // Data & Analytics (6)
  DATA_ANALYSIS = 'data-analysis',
  DATA_VIZ = 'data-visualization',
  STATISTICS = 'statistical-analysis',
  BUSINESS_INTEL = 'business-intelligence',
  DATA_SCIENCE = 'data-science-ml',
  REPORTING = 'reporting-dashboards',
  
  // Productivity & Planning (6)
  TASK_MGMT = 'task-management',
  PROJECT_PLAN = 'project-planning',
  GOALS_OKRS = 'goals-okrs',
  BRAINSTORMING = 'brainstorming',
  TIME_MGMT = 'time-management',
  WORKFLOW = 'workflow-optimization',
  
  // General & Other (5)
  MISC = 'miscellaneous',
  MULTI_CAT = 'multi-category',
  CONVERSATIONAL = 'conversational',
  EXPLORATORY = 'exploratory',
  UNCATEGORIZED = 'uncategorized'
}

/**
 * Metadata for each subcategory
 */
export interface SubcategoryMetadata {
  id: PromptSubcategory;
  name: string;
  description: string;
  parentCategory: PromptCategory;
  icon: string; // Emoji
  keywords: string[];
}

/**
 * Category classification result from AI
 */
export interface CategoryClassification {
  category: PromptCategory;
  subcategory?: PromptSubcategory; // Optional: Subcategory for granular classification
  confidence?: number;     // Optional: 0-1 confidence score
  reasoning?: string;      // Optional: Why this category was chosen
}

/**
 * Filter options for history page
 */
export interface PromptFilters {
  category: PromptCategory | 'all';
  subcategory?: PromptSubcategory | 'all'; // TASK-08: Filter by subcategory
  bucketId?: string | 'all';
  searchQuery?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Category statistics for analytics
 */
export interface CategoryStats {
  category: PromptCategory;
  count: number;
  percentage: number;
  lastUsed?: string;
}

// =====================================================
// TEMPLATE SYSTEM TYPES (TASK-09)
// =====================================================

/**
 * Professional prompt template structure
 */
export interface PromptTemplate {
  id: string;                          // Unique identifier
  title: string;                       // Display name
  description: string;                 // Brief explanation (1-2 sentences)
  category: PromptCategory;            // Links to existing category system
  prompt: string;                      // The actual template prompt text
  icon: string;                        // Lucide icon name
  tags: string[];                      // Searchable keywords
  difficulty: TemplateDifficulty;      // User skill level required
  estimatedTime: string;               // "2-3 minutes"
  useCases: string[];                  // Example applications
  expectedOutput: string;              // What the super prompt typically generates
  popularity: number;                  // Sorting weight (1-10)
}

/**
 * Template difficulty levels
 */
export enum TemplateDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate', 
  ADVANCED = 'advanced'
}

/**
 * Template filtering options
 */
export interface TemplateFilters {
  category: PromptCategory | 'all';
  difficulty: TemplateDifficulty | 'all';
  searchQuery: string;
}

/**
 * Template selection event
 */
export interface TemplateSelectEvent {
  template: PromptTemplate;
  source: 'grid' | 'search' | 'modal';
}

// =====================================================
// QUICK SAVE TYPES (TASK-09)
// =====================================================

/**
 * Request type for quick saving prompts without analysis
 */
export interface QuickSavePromptRequest {
  promptText: string;              // The actual prompt content
  bucketId: string;                // Required bucket selection
  category: PromptCategory;        // Required category
  subcategory?: PromptSubcategory; // Optional subcategory
}

/**
 * Response type for quick save operations
 */
export interface QuickSaveResponse {
  success: boolean;
  promptId?: string;
  error?: string;
}