import { 
  Code2, 
  PenTool, 
  TrendingUp, 
  Search, 
  Mail, 
  GraduationCap, 
  Palette, 
  BarChart3, 
  ListTodo, 
  HelpCircle,
  type LucideIcon 
} from 'lucide-react';
import { PromptCategory, CategoryMetadata } from './types';

/**
 * Complete category configuration with all metadata
 * This is the single source of truth for category information
 */
export const CATEGORY_CONFIG: Record<PromptCategory, CategoryMetadata & { iconComponent: LucideIcon }> = {
  [PromptCategory.SOFTWARE_DEV]: {
    id: PromptCategory.SOFTWARE_DEV,
    name: 'Software Development',
    description: 'Code generation, debugging, architecture, technical documentation',
    icon: 'Code2',
    iconComponent: Code2,
    colorClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    keywords: [
      'code', 'programming', 'debug', 'function', 'API', 'database', 
      'algorithm', 'refactor', 'bug', 'test', 'software', 'development',
      'framework', 'library', 'git', 'docker', 'deployment', 'backend',
      'frontend', 'fullstack', 'javascript', 'python', 'java', 'react',
      'node', 'typescript', 'sql', 'mongodb', 'kubernetes', 'CI/CD'
    ]
  },
  
  [PromptCategory.CONTENT_WRITING]: {
    id: PromptCategory.CONTENT_WRITING,
    name: 'Content Writing',
    description: 'Blog posts, articles, creative writing, storytelling',
    icon: 'PenTool',
    iconComponent: PenTool,
    colorClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    keywords: [
      'write', 'article', 'blog', 'story', 'content', 'creative',
      'narrative', 'essay', 'post', 'author', 'paragraph', 'draft',
      'edit', 'copy', 'headline', 'body', 'fiction', 'poetry',
      'journalism', 'publication', 'manuscript', 'novel', 'screenplay'
    ]
  },
  
  [PromptCategory.MARKETING]: {
    id: PromptCategory.MARKETING,
    name: 'Marketing & Advertising',
    description: 'Campaign ideas, ad copy, social media, branding',
    icon: 'TrendingUp',
    iconComponent: TrendingUp,
    colorClass: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    keywords: [
      'marketing', 'advertising', 'campaign', 'brand', 'social media',
      'ad', 'promotion', 'audience', 'customer', 'engagement',
      'conversion', 'viral', 'influencer', 'product launch', 'CTR',
      'ROI', 'funnel', 'lead generation', 'email marketing', 'PPC',
      'Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'TikTok'
    ]
  },
  
  [PromptCategory.SEO_RESEARCH]: {
    id: PromptCategory.SEO_RESEARCH,
    name: 'SEO & Research',
    description: 'Keyword research, optimization, competitor analysis',
    icon: 'Search',
    iconComponent: Search,
    colorClass: 'bg-green-500/20 text-green-400 border-green-500/30',
    keywords: [
      'SEO', 'keyword', 'search engine', 'ranking', 'optimization',
      'backlink', 'meta', 'title tag', 'competitor analysis', 'research',
      'Google', 'traffic', 'SERP', 'domain authority', 'analytics',
      'organic', 'on-page', 'off-page', 'link building', 'content strategy'
    ]
  },
  
  [PromptCategory.BUSINESS_COMM]: {
    id: PromptCategory.BUSINESS_COMM,
    name: 'Business Communication',
    description: 'Emails, proposals, presentations, reports',
    icon: 'Mail',
    iconComponent: Mail,
    colorClass: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    keywords: [
      'email', 'business', 'proposal', 'presentation', 'report',
      'memo', 'meeting', 'communication', 'professional', 'letter',
      'corporate', 'executive', 'stakeholder', 'client', 'B2B',
      'pitch', 'RFP', 'contract', 'agreement', 'minutes', 'summary'
    ]
  },
  
  [PromptCategory.EDUCATION]: {
    id: PromptCategory.EDUCATION,
    name: 'Education & Learning',
    description: 'Tutorials, explanations, lesson plans, teaching',
    icon: 'GraduationCap',
    iconComponent: GraduationCap,
    colorClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    keywords: [
      'education', 'learning', 'teach', 'tutorial', 'explain',
      'lesson', 'study', 'course', 'training', 'student',
      'instructor', 'curriculum', 'pedagogy', 'quiz', 'exam',
      'educational', 'workshop', 'seminar', 'syllabus', 'assessment'
    ]
  },
  
  [PromptCategory.CREATIVE_DESIGN]: {
    id: PromptCategory.CREATIVE_DESIGN,
    name: 'Creative & Design',
    description: 'UI/UX, graphic design, visual concepts, branding',
    icon: 'Palette',
    iconComponent: Palette,
    colorClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    keywords: [
      'design', 'creative', 'visual', 'UI', 'UX', 'interface',
      'graphic', 'layout', 'color', 'typography', 'logo',
      'brand identity', 'mockup', 'wireframe', 'aesthetic', 'artistic',
      'Figma', 'Photoshop', 'illustration', 'icon', 'prototype'
    ]
  },
  
  [PromptCategory.DATA_ANALYTICS]: {
    id: PromptCategory.DATA_ANALYTICS,
    name: 'Data & Analytics',
    description: 'Data analysis, visualization, statistical insights',
    icon: 'BarChart3',
    iconComponent: BarChart3,
    colorClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    keywords: [
      'data', 'analytics', 'statistics', 'analysis', 'chart',
      'graph', 'visualization', 'metrics', 'KPI', 'dashboard',
      'insight', 'trend', 'forecast', 'dataset', 'SQL', 'query',
      'reporting', 'BI', 'business intelligence', 'data science',
      'machine learning', 'pandas', 'excel', 'tableau', 'power bi'
    ]
  },
  
  [PromptCategory.PRODUCTIVITY]: {
    id: PromptCategory.PRODUCTIVITY,
    name: 'Productivity & Planning',
    description: 'Task organization, project planning, brainstorming',
    icon: 'ListTodo',
    iconComponent: ListTodo,
    colorClass: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    keywords: [
      'productivity', 'planning', 'organize', 'task', 'project',
      'schedule', 'agenda', 'brainstorm', 'strategy', 'goal',
      'timeline', 'workflow', 'management', 'prioritize', 'roadmap',
      'kanban', 'scrum', 'agile', 'sprint', 'milestone', 'OKR',
      'time management', 'to-do', 'checklist', 'calendar'
    ]
  },
  
  [PromptCategory.GENERAL]: {
    id: PromptCategory.GENERAL,
    name: 'General & Other',
    description: 'Miscellaneous or multi-category prompts',
    icon: 'HelpCircle',
    iconComponent: HelpCircle,
    colorClass: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    keywords: [
      'general', 'miscellaneous', 'other', 'various', 'mixed',
      'multiple', 'diverse', 'uncategorized', 'general purpose'
    ]
  }
};

/**
 * Get category metadata by category ID
 */
export const getCategoryMetadata = (category: PromptCategory): CategoryMetadata & { iconComponent: LucideIcon } => {
  return CATEGORY_CONFIG[category];
};

/**
 * Get all categories as an array
 */
export const getAllCategories = (): (CategoryMetadata & { iconComponent: LucideIcon })[] => {
  return Object.values(CATEGORY_CONFIG);
};

/**
 * Get category display name
 */
export const getCategoryName = (category: PromptCategory): string => {
  return CATEGORY_CONFIG[category].name;
};

/**
 * Get category color classes
 */
export const getCategoryColor = (category: PromptCategory): string => {
  return CATEGORY_CONFIG[category].colorClass;
};
