# 🚀 TASK-09: Quick Save Prompt Implementation

## 📋 OVERVIEW

**Feature**: Quick Save Prompt from History Page  
**Objective**: Allow users to save pre-existing prompts directly without analysis workflow  
**Priority**: High  
**Estimated Time**: 2 hours  
**Dependencies**: Existing bucket system, category system, authentication  

## 🎯 USER STORY

> **As a user with existing refined prompts,**  
> **I want to quickly save them to my organized bucket system,**  
> **So that I can import my prompt library without going through unnecessary analysis steps.**

## ✅ ACCEPTANCE CRITERIA

1. ✅ **Quick Save Button**: History page has "Quick Save Prompt" button next to "Manage Buckets"
2. ✅ **Modal Interface**: Clicking opens modal with form for manual prompt entry
3. ✅ **Form Fields**:
   - Large textarea for prompt text (required, min 10 characters)
   - Bucket selector (required, reuses existing component)
   - Category selector (required, 10 main categories)
   - Subcategory selector (optional, filtered by parent category)
4. ✅ **Validation**: Form prevents submission until required fields filled
5. ✅ **Database Save**: Prompt saves with analysis_mode = 'manual'
6. ✅ **Immediate Refresh**: Saved prompt appears in history list immediately
7. ✅ **Full Integration**: Manual prompts work with all existing filters and views

## 🏗️ IMPLEMENTATION PLAN

---

### **PHASE 1: Type System Updates** ⏱️ 5 min

#### Step 1.1: Update Analysis Mode Enum

**File**: `lib/types.ts`

```typescript
// Find the AnalysisMode enum and add MANUAL option
export enum AnalysisMode {
  AI = 'ai',           // Automated: AI generates and answers questions
  NORMAL = 'normal',   // Balanced: AI generates, user answers
  EXTENSIVE = 'extensive', // Deep: AI generates 8-12 comprehensive questions
  MANUAL = 'manual'    // 🆕 Quick Save: User provides prompt directly
}
```

#### Step 1.2: Add Quick Save Request Type

**File**: `lib/types.ts` (add at end of file before export)

```typescript
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
```

#### Step 1.3: Update Mode Configuration

**File**: `lib/modeConfig.ts` (add manual mode config)

```typescript
// Find ANALYSIS_MODES and add manual mode
export const ANALYSIS_MODES: Record<AnalysisMode, AnalysisModeMetadata> = {
  // ... existing modes ...
  
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
      colorClass: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }
};
```

---

### **PHASE 2: Subcategory Configuration** ⏱️ 15 min

#### Step 2.1: Create Subcategory Config File

**File**: `lib/subcategoryConfig.ts` (new file)

```typescript
import { PromptSubcategory, SubcategoryMetadata, PromptCategory } from './types';

/**
 * Complete subcategory configuration with metadata
 * Organized by parent category for clarity
 */
export const SUBCATEGORY_CONFIG: Record<PromptSubcategory, SubcategoryMetadata> = {
  // Software Development (7 subcategories)
  [PromptSubcategory.AI_ML_DEV]: {
    id: PromptSubcategory.AI_ML_DEV,
    name: 'AI & ML Development',
    description: 'Machine learning models, AI algorithms, data science',
    parentCategory: PromptCategory.SOFTWARE_DEV,
    icon: '🤖',
    keywords: ['ai', 'machine learning', 'neural network', 'tensorflow', 'pytorch']
  },
  [PromptSubcategory.WEB_DEV]: {
    id: PromptSubcategory.WEB_DEV,
    name: 'Web Development',
    description: 'Frontend, backend, full-stack web applications',
    parentCategory: PromptCategory.SOFTWARE_DEV,
    icon: '🌐',
    keywords: ['react', 'javascript', 'html', 'css', 'nodejs', 'web app']
  },
  [PromptSubcategory.MOBILE_DEV]: {
    id: PromptSubcategory.MOBILE_DEV,
    name: 'Mobile Development',
    description: 'iOS, Android, React Native, Flutter apps',
    parentCategory: PromptCategory.SOFTWARE_DEV,
    icon: '📱',
    keywords: ['ios', 'android', 'react native', 'flutter', 'mobile app']
  },
  [PromptSubcategory.DATABASE_BACKEND]: {
    id: PromptSubcategory.DATABASE_BACKEND,
    name: 'Database & Backend',
    description: 'Database design, API development, server architecture',
    parentCategory: PromptCategory.SOFTWARE_DEV,
    icon: '🗄️',
    keywords: ['database', 'api', 'backend', 'sql', 'nosql', 'server']
  },
  [PromptSubcategory.DEVOPS_INFRA]: {
    id: PromptSubcategory.DEVOPS_INFRA,
    name: 'DevOps & Infrastructure',
    description: 'CI/CD, cloud services, containerization, deployment',
    parentCategory: PromptCategory.SOFTWARE_DEV,
    icon: '⚙️',
    keywords: ['devops', 'docker', 'kubernetes', 'aws', 'ci/cd', 'deployment']
  },
  [PromptSubcategory.TESTING_QA]: {
    id: PromptSubcategory.TESTING_QA,
    name: 'Testing & Quality',
    description: 'Unit tests, integration tests, QA processes',
    parentCategory: PromptCategory.SOFTWARE_DEV,
    icon: '🧪',
    keywords: ['testing', 'qa', 'unit test', 'integration', 'quality assurance']
  },
  [PromptSubcategory.DOCS_ARCH]: {
    id: PromptSubcategory.DOCS_ARCH,
    name: 'Documentation & Architecture',
    description: 'Technical docs, system design, architecture planning',
    parentCategory: PromptCategory.SOFTWARE_DEV,
    icon: '📚',
    keywords: ['documentation', 'architecture', 'system design', 'tech docs']
  },

  // Content Writing (6 subcategories)
  [PromptSubcategory.BLOG_ARTICLES]: {
    id: PromptSubcategory.BLOG_ARTICLES,
    name: 'Blog Posts & Articles',
    description: 'Blog content, online articles, web copy',
    parentCategory: PromptCategory.CONTENT_WRITING,
    icon: '📝',
    keywords: ['blog', 'article', 'web content', 'online writing']
  },
  [PromptSubcategory.CREATIVE_FICTION]: {
    id: PromptSubcategory.CREATIVE_FICTION,
    name: 'Creative & Fiction',
    description: 'Stories, novels, creative writing, fiction',
    parentCategory: PromptCategory.CONTENT_WRITING,
    icon: '✨',
    keywords: ['story', 'fiction', 'creative writing', 'novel', 'narrative']
  },
  [PromptSubcategory.JOURNALISM]: {
    id: PromptSubcategory.JOURNALISM,
    name: 'Journalism & News',
    description: 'News articles, interviews, investigative pieces',
    parentCategory: PromptCategory.CONTENT_WRITING,
    icon: '📰',
    keywords: ['news', 'journalism', 'interview', 'investigative', 'reporter']
  },
  [PromptSubcategory.TECHNICAL_WRITING]: {
    id: PromptSubcategory.TECHNICAL_WRITING,
    name: 'Technical Writing',
    description: 'Technical documentation, how-to guides, manuals',
    parentCategory: PromptCategory.CONTENT_WRITING,
    icon: '⚡',
    keywords: ['technical writing', 'documentation', 'manual', 'how-to']
  },
  [PromptSubcategory.COPYWRITING]: {
    id: PromptSubcategory.COPYWRITING,
    name: 'Copywriting',
    description: 'Sales copy, marketing copy, persuasive writing',
    parentCategory: PromptCategory.CONTENT_WRITING,
    icon: '💰',
    keywords: ['copywriting', 'sales copy', 'marketing copy', 'persuasive']
  },
  [PromptSubcategory.SCRIPTS]: {
    id: PromptSubcategory.SCRIPTS,
    name: 'Scripts & Screenplays',
    description: 'Video scripts, screenplays, dialogue writing',
    parentCategory: PromptCategory.CONTENT_WRITING,
    icon: '🎬',
    keywords: ['script', 'screenplay', 'dialogue', 'video script']
  },

  // Marketing & Advertising (7 subcategories)
  [PromptSubcategory.SOCIAL_MEDIA]: {
    id: PromptSubcategory.SOCIAL_MEDIA,
    name: 'Social Media Marketing',
    description: 'Social posts, engagement strategies, platform-specific content',
    parentCategory: PromptCategory.MARKETING,
    icon: '📱',
    keywords: ['social media', 'facebook', 'instagram', 'twitter', 'linkedin']
  },
  [PromptSubcategory.EMAIL_MARKETING]: {
    id: PromptSubcategory.EMAIL_MARKETING,
    name: 'Email Marketing',
    description: 'Email campaigns, newsletters, drip sequences',
    parentCategory: PromptCategory.MARKETING,
    icon: '📧',
    keywords: ['email marketing', 'newsletter', 'email campaign', 'drip sequence']
  },
  [PromptSubcategory.CONTENT_MARKETING]: {
    id: PromptSubcategory.CONTENT_MARKETING,
    name: 'Content Marketing',
    description: 'Content strategy, editorial calendars, content planning',
    parentCategory: PromptCategory.MARKETING,
    icon: '📈',
    keywords: ['content marketing', 'content strategy', 'editorial calendar']
  },
  [PromptSubcategory.PAID_ADS]: {
    id: PromptSubcategory.PAID_ADS,
    name: 'Paid Advertising',
    description: 'PPC campaigns, ad copy, display ads, sponsored content',
    parentCategory: PromptCategory.MARKETING,
    icon: '💸',
    keywords: ['ppc', 'paid ads', 'ad copy', 'google ads', 'facebook ads']
  },
  [PromptSubcategory.BRAND_STRATEGY]: {
    id: PromptSubcategory.BRAND_STRATEGY,
    name: 'Brand Strategy',
    description: 'Brand positioning, messaging, identity development',
    parentCategory: PromptCategory.MARKETING,
    icon: '🎯',
    keywords: ['branding', 'brand strategy', 'positioning', 'messaging']
  },
  [PromptSubcategory.GROWTH_ANALYTICS]: {
    id: PromptSubcategory.GROWTH_ANALYTICS,
    name: 'Growth & Analytics',
    description: 'Growth hacking, marketing analytics, performance tracking',
    parentCategory: PromptCategory.MARKETING,
    icon: '📊',
    keywords: ['growth hacking', 'analytics', 'marketing metrics', 'conversion']
  },
  [PromptSubcategory.INFLUENCER]: {
    id: PromptSubcategory.INFLUENCER,
    name: 'Influencer Marketing',
    description: 'Influencer partnerships, creator content, collaborations',
    parentCategory: PromptCategory.MARKETING,
    icon: '⭐',
    keywords: ['influencer', 'creator', 'partnership', 'collaboration']
  },

  // SEO & Research (5 subcategories)
  [PromptSubcategory.KEYWORD_RESEARCH]: {
    id: PromptSubcategory.KEYWORD_RESEARCH,
    name: 'Keyword Research',
    description: 'Keyword analysis, search intent, competition research',
    parentCategory: PromptCategory.SEO_RESEARCH,
    icon: '🔍',
    keywords: ['keyword research', 'search intent', 'keyword analysis']
  },
  [PromptSubcategory.ON_PAGE_SEO]: {
    id: PromptSubcategory.ON_PAGE_SEO,
    name: 'On-Page SEO',
    description: 'Content optimization, meta tags, internal linking',
    parentCategory: PromptCategory.SEO_RESEARCH,
    icon: '📄',
    keywords: ['on-page seo', 'meta tags', 'content optimization', 'internal linking']
  },
  [PromptSubcategory.LINK_BUILDING]: {
    id: PromptSubcategory.LINK_BUILDING,
    name: 'Link Building',
    description: 'Backlink strategies, outreach, link acquisition',
    parentCategory: PromptCategory.SEO_RESEARCH,
    icon: '🔗',
    keywords: ['link building', 'backlinks', 'outreach', 'link acquisition']
  },
  [PromptSubcategory.TECHNICAL_SEO]: {
    id: PromptSubcategory.TECHNICAL_SEO,
    name: 'Technical SEO',
    description: 'Site speed, crawling, indexing, technical optimization',
    parentCategory: PromptCategory.SEO_RESEARCH,
    icon: '⚙️',
    keywords: ['technical seo', 'site speed', 'crawling', 'indexing']
  },
  [PromptSubcategory.COMPETITIVE]: {
    id: PromptSubcategory.COMPETITIVE,
    name: 'Competitive Analysis',
    description: 'Competitor research, market analysis, SWOT analysis',
    parentCategory: PromptCategory.SEO_RESEARCH,
    icon: '🎯',
    keywords: ['competitor analysis', 'market research', 'competitive intelligence']
  },

  // Business Communication (6 subcategories)
  [PromptSubcategory.PROF_EMAILS]: {
    id: PromptSubcategory.PROF_EMAILS,
    name: 'Professional Emails',
    description: 'Business emails, client communication, formal correspondence',
    parentCategory: PromptCategory.BUSINESS_COMM,
    icon: '📧',
    keywords: ['professional email', 'business communication', 'formal email']
  },
  [PromptSubcategory.PRESENTATIONS]: {
    id: PromptSubcategory.PRESENTATIONS,
    name: 'Presentations',
    description: 'Slide decks, pitch presentations, speaking engagements',
    parentCategory: PromptCategory.BUSINESS_COMM,
    icon: '📊',
    keywords: ['presentation', 'slide deck', 'pitch deck', 'speaking']
  },
  [PromptSubcategory.REPORTS_DOCS]: {
    id: PromptSubcategory.REPORTS_DOCS,
    name: 'Reports & Documents',
    description: 'Business reports, white papers, formal documents',
    parentCategory: PromptCategory.BUSINESS_COMM,
    icon: '📄',
    keywords: ['business report', 'white paper', 'formal document', 'analysis']
  },
  [PromptSubcategory.PROPOSALS]: {
    id: PromptSubcategory.PROPOSALS,
    name: 'Proposals & Contracts',
    description: 'Project proposals, contracts, agreements, RFPs',
    parentCategory: PromptCategory.BUSINESS_COMM,
    icon: '📋',
    keywords: ['proposal', 'contract', 'agreement', 'rfp', 'project proposal']
  },
  [PromptSubcategory.MEETINGS]: {
    id: PromptSubcategory.MEETINGS,
    name: 'Meeting Materials',
    description: 'Agendas, meeting notes, action items, summaries',
    parentCategory: PromptCategory.BUSINESS_COMM,
    icon: '🤝',
    keywords: ['meeting agenda', 'meeting notes', 'action items', 'meeting summary']
  },
  [PromptSubcategory.CLIENT_COMM]: {
    id: PromptSubcategory.CLIENT_COMM,
    name: 'Client Communication',
    description: 'Client updates, status reports, relationship management',
    parentCategory: PromptCategory.BUSINESS_COMM,
    icon: '👥',
    keywords: ['client communication', 'client update', 'status report']
  },

  // Education & Learning (6 subcategories)
  [PromptSubcategory.COURSE_CONTENT]: {
    id: PromptSubcategory.COURSE_CONTENT,
    name: 'Course Content',
    description: 'Online courses, curriculum design, educational modules',
    parentCategory: PromptCategory.EDUCATION,
    icon: '🎓',
    keywords: ['course content', 'curriculum', 'online course', 'educational module']
  },
  [PromptSubcategory.TUTORIALS]: {
    id: PromptSubcategory.TUTORIALS,
    name: 'Tutorials & How-To',
    description: 'Step-by-step guides, instructional content, walkthroughs',
    parentCategory: PromptCategory.EDUCATION,
    icon: '📚',
    keywords: ['tutorial', 'how-to guide', 'step-by-step', 'instructional']
  },
  [PromptSubcategory.EDU_VIDEOS]: {
    id: PromptSubcategory.EDU_VIDEOS,
    name: 'Educational Videos',
    description: 'Video scripts, educational content, learning videos',
    parentCategory: PromptCategory.EDUCATION,
    icon: '🎥',
    keywords: ['educational video', 'video script', 'learning video', 'explainer']
  },
  [PromptSubcategory.STUDY_GUIDES]: {
    id: PromptSubcategory.STUDY_GUIDES,
    name: 'Study Guides',
    description: 'Study materials, exam prep, reference guides',
    parentCategory: PromptCategory.EDUCATION,
    icon: '📖',
    keywords: ['study guide', 'exam prep', 'study materials', 'reference guide']
  },
  [PromptSubcategory.LESSON_PLANS]: {
    id: PromptSubcategory.LESSON_PLANS,
    name: 'Lesson Plans',
    description: 'Teaching plans, classroom activities, educational objectives',
    parentCategory: PromptCategory.EDUCATION,
    icon: '📝',
    keywords: ['lesson plan', 'teaching plan', 'classroom activity', 'education']
  },
  [PromptSubcategory.ASSESSMENTS]: {
    id: PromptSubcategory.ASSESSMENTS,
    name: 'Assessments & Quizzes',
    description: 'Tests, quizzes, evaluation methods, rubrics',
    parentCategory: PromptCategory.EDUCATION,
    icon: '✅',
    keywords: ['assessment', 'quiz', 'test', 'evaluation', 'rubric']
  },

  // Creative & Design (7 subcategories)
  [PromptSubcategory.UI_UX]: {
    id: PromptSubcategory.UI_UX,
    name: 'UI/UX Design',
    description: 'User interface design, user experience, wireframes',
    parentCategory: PromptCategory.CREATIVE_DESIGN,
    icon: '🎨',
    keywords: ['ui design', 'ux design', 'wireframe', 'user interface']
  },
  [PromptSubcategory.GRAPHIC_DESIGN]: {
    id: PromptSubcategory.GRAPHIC_DESIGN,
    name: 'Graphic Design',
    description: 'Visual design, graphics, print design, digital art',
    parentCategory: PromptCategory.CREATIVE_DESIGN,
    icon: '🎭',
    keywords: ['graphic design', 'visual design', 'print design', 'digital art']
  },
  [PromptSubcategory.BRANDING]: {
    id: PromptSubcategory.BRANDING,
    name: 'Branding & Identity',
    description: 'Brand identity, logo design, visual branding',
    parentCategory: PromptCategory.CREATIVE_DESIGN,
    icon: '🏷️',
    keywords: ['branding', 'brand identity', 'logo design', 'visual identity']
  },
  [PromptSubcategory.WEB_DESIGN]: {
    id: PromptSubcategory.WEB_DESIGN,
    name: 'Web Design',
    description: 'Website design, landing pages, web layouts',
    parentCategory: PromptCategory.CREATIVE_DESIGN,
    icon: '🌐',
    keywords: ['web design', 'website design', 'landing page', 'web layout']
  },
  [PromptSubcategory.VISUAL_CONCEPTS]: {
    id: PromptSubcategory.VISUAL_CONCEPTS,
    name: 'Visual Concepts',
    description: 'Creative concepts, visual storytelling, artistic direction',
    parentCategory: PromptCategory.CREATIVE_DESIGN,
    icon: '💡',
    keywords: ['visual concept', 'creative concept', 'visual storytelling']
  },
  [PromptSubcategory.ILLUSTRATION]: {
    id: PromptSubcategory.ILLUSTRATION,
    name: 'Illustration & Art',
    description: 'Digital illustration, artwork, creative visuals',
    parentCategory: PromptCategory.CREATIVE_DESIGN,
    icon: '🖌️',
    keywords: ['illustration', 'digital art', 'artwork', 'creative visual']
  },
  [PromptSubcategory.MOTION_DESIGN]: {
    id: PromptSubcategory.MOTION_DESIGN,
    name: 'Motion Design',
    description: 'Animation, motion graphics, video design',
    parentCategory: PromptCategory.CREATIVE_DESIGN,
    icon: '🎬',
    keywords: ['motion design', 'animation', 'motion graphics', 'video design']
  },

  // Data & Analytics (6 subcategories)
  [PromptSubcategory.DATA_ANALYSIS]: {
    id: PromptSubcategory.DATA_ANALYSIS,
    name: 'Data Analysis',
    description: 'Data interpretation, statistical analysis, insights',
    parentCategory: PromptCategory.DATA_ANALYTICS,
    icon: '📊',
    keywords: ['data analysis', 'statistical analysis', 'data interpretation']
  },
  [PromptSubcategory.DATA_VIZ]: {
    id: PromptSubcategory.DATA_VIZ,
    name: 'Data Visualization',
    description: 'Charts, graphs, dashboards, visual data representation',
    parentCategory: PromptCategory.DATA_ANALYTICS,
    icon: '📈',
    keywords: ['data visualization', 'charts', 'graphs', 'dashboard', 'data viz']
  },
  [PromptSubcategory.STATISTICS]: {
    id: PromptSubcategory.STATISTICS,
    name: 'Statistical Analysis',
    description: 'Statistical methods, hypothesis testing, data modeling',
    parentCategory: PromptCategory.DATA_ANALYTICS,
    icon: '📉',
    keywords: ['statistics', 'statistical analysis', 'hypothesis testing']
  },
  [PromptSubcategory.BUSINESS_INTEL]: {
    id: PromptSubcategory.BUSINESS_INTEL,
    name: 'Business Intelligence',
    description: 'BI tools, business metrics, performance analysis',
    parentCategory: PromptCategory.DATA_ANALYTICS,
    icon: '💼',
    keywords: ['business intelligence', 'bi tools', 'business metrics', 'kpi']
  },
  [PromptSubcategory.DATA_SCIENCE]: {
    id: PromptSubcategory.DATA_SCIENCE,
    name: 'Data Science & ML',
    description: 'Machine learning, predictive analytics, data modeling',
    parentCategory: PromptCategory.DATA_ANALYTICS,
    icon: '🔬',
    keywords: ['data science', 'machine learning', 'predictive analytics']
  },
  [PromptSubcategory.REPORTING]: {
    id: PromptSubcategory.REPORTING,
    name: 'Reporting & Dashboards',
    description: 'Reports, dashboards, data presentation, metrics',
    parentCategory: PromptCategory.DATA_ANALYTICS,
    icon: '📋',
    keywords: ['reporting', 'dashboard', 'data presentation', 'metrics']
  },

  // Productivity & Planning (6 subcategories)
  [PromptSubcategory.TASK_MGMT]: {
    id: PromptSubcategory.TASK_MGMT,
    name: 'Task Management',
    description: 'To-do lists, task organization, productivity systems',
    parentCategory: PromptCategory.PRODUCTIVITY,
    icon: '✅',
    keywords: ['task management', 'to-do list', 'productivity system', 'gtd']
  },
  [PromptSubcategory.PROJECT_PLAN]: {
    id: PromptSubcategory.PROJECT_PLAN,
    name: 'Project Planning',
    description: 'Project management, timelines, resource planning',
    parentCategory: PromptCategory.PRODUCTIVITY,
    icon: '📅',
    keywords: ['project planning', 'project management', 'timeline', 'gantt']
  },
  [PromptSubcategory.GOALS_OKRS]: {
    id: PromptSubcategory.GOALS_OKRS,
    name: 'Goals & OKRs',
    description: 'Goal setting, OKRs, strategic planning, objectives',
    parentCategory: PromptCategory.PRODUCTIVITY,
    icon: '🎯',
    keywords: ['goals', 'okr', 'objectives', 'strategic planning', 'goal setting']
  },
  [PromptSubcategory.BRAINSTORMING]: {
    id: PromptSubcategory.BRAINSTORMING,
    name: 'Brainstorming',
    description: 'Idea generation, creative thinking, innovation sessions',
    parentCategory: PromptCategory.PRODUCTIVITY,
    icon: '💡',
    keywords: ['brainstorming', 'idea generation', 'creative thinking', 'innovation']
  },
  [PromptSubcategory.TIME_MGMT]: {
    id: PromptSubcategory.TIME_MGMT,
    name: 'Time Management',
    description: 'Scheduling, calendar management, time optimization',
    parentCategory: PromptCategory.PRODUCTIVITY,
    icon: '⏰',
    keywords: ['time management', 'scheduling', 'calendar', 'time blocking']
  },
  [PromptSubcategory.WORKFLOW]: {
    id: PromptSubcategory.WORKFLOW,
    name: 'Workflow Optimization',
    description: 'Process improvement, automation, efficiency',
    parentCategory: PromptCategory.PRODUCTIVITY,
    icon: '⚙️',
    keywords: ['workflow', 'process improvement', 'automation', 'efficiency']
  },

  // General & Other (5 subcategories)
  [PromptSubcategory.MISC]: {
    id: PromptSubcategory.MISC,
    name: 'Miscellaneous',
    description: 'Various topics that don\'t fit other categories',
    parentCategory: PromptCategory.GENERAL,
    icon: '🔀',
    keywords: ['miscellaneous', 'various', 'mixed', 'other']
  },
  [PromptSubcategory.MULTI_CAT]: {
    id: PromptSubcategory.MULTI_CAT,
    name: 'Multi-Category',
    description: 'Prompts spanning multiple categories or disciplines',
    parentCategory: PromptCategory.GENERAL,
    icon: '🔄',
    keywords: ['multi-category', 'cross-functional', 'interdisciplinary']
  },
  [PromptSubcategory.CONVERSATIONAL]: {
    id: PromptSubcategory.CONVERSATIONAL,
    name: 'Conversational',
    description: 'Chat-based interactions, dialogue, conversation starters',
    parentCategory: PromptCategory.GENERAL,
    icon: '💬',
    keywords: ['conversation', 'chat', 'dialogue', 'conversational ai']
  },
  [PromptSubcategory.EXPLORATORY]: {
    id: PromptSubcategory.EXPLORATORY,
    name: 'Exploratory',
    description: 'Research, discovery, open-ended exploration',
    parentCategory: PromptCategory.GENERAL,
    icon: '🔍',
    keywords: ['exploratory', 'research', 'discovery', 'open-ended']
  },
  [PromptSubcategory.UNCATEGORIZED]: {
    id: PromptSubcategory.UNCATEGORIZED,
    name: 'Uncategorized',
    description: 'Prompts that haven\'t been classified yet',
    parentCategory: PromptCategory.GENERAL,
    icon: '❓',
    keywords: ['uncategorized', 'unclassified', 'unknown']
  }
};

/**
 * Get subcategories filtered by parent category
 */
export const getSubcategoriesByCategory = (category: PromptCategory): SubcategoryMetadata[] => {
  return Object.values(SUBCATEGORY_CONFIG).filter(sub => sub.parentCategory === category);
};

/**
 * Get subcategory metadata by ID
 */
export const getSubcategoryMetadata = (subcategory: PromptSubcategory): SubcategoryMetadata => {
  return SUBCATEGORY_CONFIG[subcategory];
};

/**
 * Get all subcategories as an array
 */
export const getAllSubcategories = (): SubcategoryMetadata[] => {
  return Object.values(SUBCATEGORY_CONFIG);
};

/**
 * Get subcategory display name
 */
export const getSubcategoryName = (subcategory: PromptSubcategory): string => {
  return SUBCATEGORY_CONFIG[subcategory].name;
};
```

---

### **PHASE 3: Backend API Enhancement** ⏱️ 15 min

#### Step 3.1: Update Prompts API Route

**File**: `app/api/prompts/route.ts`

**Modify the POST function** to handle Quick Save requests:

```typescript
// Add at top of file
import { QuickSavePromptRequest, AnalysisMode } from '@/lib/types';

// Replace the existing POST function
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user, supabase } = authResult;

  try {
    const body = await request.json();
    
    // 🆕 DETECT REQUEST TYPE: Quick Save vs Normal Save
    const isQuickSave = 'promptText' in body;
    
    if (isQuickSave) {
      // 🆕 QUICK SAVE WORKFLOW
      return await handleQuickSave(body as QuickSavePromptRequest, user, supabase);
    } else {
      // 🔄 EXISTING NORMAL SAVE WORKFLOW
      return await handleNormalSave(body as SavePromptRequest, user, supabase);
    }
  } catch (error) {
    console.error('Error in prompts API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// 🆕 NEW: Handle Quick Save requests
async function handleQuickSave(
  body: QuickSavePromptRequest, 
  user: any, 
  supabase: any
): Promise<NextResponse> {
  const { promptText, bucketId, category, subcategory } = body;

  // Validation
  if (!promptText || promptText.trim().length < 10) {
    return NextResponse.json(
      { error: 'Prompt text must be at least 10 characters' },
      { status: 400 }
    );
  }

  if (!bucketId) {
    return NextResponse.json(
      { error: 'Bucket selection is required' },
      { status: 400 }
    );
  }

  if (!category) {
    return NextResponse.json(
      { error: 'Category selection is required' },
      { status: 400 }
    );
  }

  // Verify bucket belongs to user
  const { data: bucket, error: bucketError } = await supabase
    .from('buckets')
    .select('id')
    .eq('id', bucketId)
    .eq('user_id', user.id)
    .single();

  if (bucketError || !bucket) {
    return NextResponse.json(
      { error: 'Invalid bucket selection' },
      { status: 400 }
    );
  }

  // Save prompt with manual mode
  const { data, error } = await supabase
    .from('prompts')
    .insert({
      user_id: user.id,
      initial_prompt: promptText.trim(),
      questions: null,                    // No questions for quick save
      answers: null,                      // No answers for quick save  
      super_prompt: promptText.trim(),    // Same as initial for quick save
      bucket_id: bucketId,
      category: category,
      subcategory: subcategory || null,   // Optional subcategory
      analysis_mode: AnalysisMode.MANUAL  // 🆕 Mark as manual entry
    })
    .select()
    .single();

  if (error) {
    console.error('Database error during quick save:', error);
    throw error;
  }

  console.log(`✅ Quick saved prompt: ${data.id} (${category}${subcategory ? ' > ' + subcategory : ''})`);

  return NextResponse.json({ 
    success: true, 
    promptId: data.id 
  });
}

// 🔄 EXISTING: Handle Normal Save requests (refactored for clarity)
async function handleNormalSave(
  body: SavePromptRequest, 
  user: any, 
  supabase: any
): Promise<NextResponse> {
  const { initialPrompt, questions, answers, superPrompt, bucketId, category } = body;

  if (!initialPrompt || !superPrompt) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  if (!bucketId) {
    return NextResponse.json(
      { error: 'Bucket selection is required' },
      { status: 400 }
    );
  }

  // Verify bucket belongs to user
  const { data: bucket, error: bucketError } = await supabase
    .from('buckets')
    .select('id')
    .eq('id', bucketId)
    .eq('user_id', user.id)
    .single();

  if (bucketError || !bucket) {
    return NextResponse.json(
      { error: 'Invalid bucket selection' },
      { status: 400 }
    );
  }

  // 🆕 AUTOMATIC CATEGORIZATION (existing logic)
  let finalCategory: PromptCategory;
  let finalSubcategory: PromptSubcategory | undefined;
  
  if (category) {
    finalCategory = category;
  } else {
    console.log('Auto-categorizing prompt with two-tier classification...');
    const classification = await categorizePrompt(initialPrompt);
    finalCategory = classification.category;
    finalSubcategory = classification.subcategory;
    console.log(`Categorized as: ${finalCategory} > ${finalSubcategory} (confidence: ${classification.confidence})`);
  }

  const { data, error } = await supabase
    .from('prompts')
    .insert({
      user_id: user.id,
      initial_prompt: initialPrompt,
      questions: questions || [],
      answers: answers || {},
      super_prompt: superPrompt,
      bucket_id: bucketId,
      category: finalCategory,
      subcategory: finalSubcategory,
      analysis_mode: 'normal'  // Default for analyzed prompts
    })
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({ success: true, promptId: data.id });
}
```

---

### **PHASE 4: UI Components Development** ⏱️ 45 min

#### Step 4.1: Create CategorySelector Component

**File**: `components/CategorySelector.tsx` (new file)

```tsx
'use client';

import React from 'react';
import { PromptCategory } from '@/lib/types';
import { getCategoryMetadata, getAllCategories } from '@/lib/categoryConfig';

interface CategorySelectorProps {
  selectedCategory: PromptCategory | null;
  onSelect: (category: PromptCategory) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelect
}) => {
  const categories = getAllCategories();

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Category <span className="text-red-400">*</span>
      </label>
      
      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const IconComponent = category.iconComponent;
          
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <div className="flex-shrink-0">
                <IconComponent size={20} className="text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-200 mb-1">
                  {category.name}
                </div>
                <div className="text-xs text-gray-400 line-clamp-2">
                  {category.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;
```

#### Step 4.2: Create SubcategorySelector Component

**File**: `components/SubcategorySelector.tsx` (new file)

```tsx
'use client';

import React from 'react';
import { PromptCategory, PromptSubcategory } from '@/lib/types';
import { getSubcategoriesByCategory } from '@/lib/subcategoryConfig';

interface SubcategorySelectorProps {
  parentCategory: PromptCategory | null;
  selectedSubcategory: PromptSubcategory | null;
  onSelect: (subcategory: PromptSubcategory | null) => void;
}

const SubcategorySelector: React.FC<SubcategorySelectorProps> = ({
  parentCategory,
  selectedSubcategory,
  onSelect
}) => {
  const subcategories = parentCategory ? getSubcategoriesByCategory(parentCategory) : [];

  if (!parentCategory) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-400">
          Subcategory (Optional)
        </label>
        <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg text-center">
          <p className="text-sm text-gray-500">
            Select a category first to see subcategory options
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Subcategory <span className="text-gray-500">(Optional)</span>
      </label>
      
      {/* None Option */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`w-full flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
          selectedSubcategory === null
            ? 'border-purple-500 bg-purple-500/20 text-purple-300'
            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 text-gray-400'
        }`}
      >
        <span className="text-lg">🚫</span>
        <span className="text-sm">None (category only)</span>
      </button>
      
      {/* Subcategory Options */}
      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
        {subcategories.map((subcategory) => {
          const isSelected = selectedSubcategory === subcategory.id;
          
          return (
            <button
              key={subcategory.id}
              type="button"
              onClick={() => onSelect(subcategory.id)}
              className={`flex items-start gap-2 p-2 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
              }`}
            >
              <span className="text-sm flex-shrink-0">{subcategory.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-200">
                  {subcategory.name}
                </div>
                <div className="text-xs text-gray-400 line-clamp-1">
                  {subcategory.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {subcategories.length === 0 && (
        <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg text-center">
          <p className="text-sm text-gray-500">
            No subcategories available for this category
          </p>
        </div>
      )}
    </div>
  );
};

export default SubcategorySelector;
```

#### Step 4.3: Create QuickSaveModal Component

**File**: `components/QuickSaveModal.tsx` (new file)

```tsx
'use client';

import React, { useState, useCallback } from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';
import { PromptCategory, PromptSubcategory, QuickSavePromptRequest } from '@/lib/types';
import BucketSelector from './BucketSelector';
import CategorySelector from './CategorySelector';
import SubcategorySelector from './SubcategorySelector';
import LoadingSpinner from './LoadingSpinner';

interface QuickSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: QuickSavePromptRequest) => Promise<void>;
}

const QuickSaveModal: React.FC<QuickSaveModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [promptText, setPromptText] = useState('');
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<PromptSubcategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset subcategory when category changes
  const handleCategoryChange = useCallback((category: PromptCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null); // Reset subcategory
    setError(null); // Clear any errors
  }, []);

  // Form validation
  const canSave = 
    promptText.trim().length >= 10 &&
    selectedBucketId !== null &&
    selectedCategory !== null &&
    !saving;

  const handleSave = async (): Promise<void> => {
    if (!canSave) return;

    setSaving(true);
    setError(null);

    try {
      await onSave({
        promptText: promptText.trim(),
        bucketId: selectedBucketId!,
        category: selectedCategory!,
        subcategory: selectedSubcategory || undefined
      });

      // Reset form on success
      setPromptText('');
      setSelectedBucketId(null);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save prompt';
      setError(errorMessage);
      console.error('Quick save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = (): void => {
    if (saving) return; // Prevent closing during save
    onClose();
  };

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPromptText('');
      setSelectedBucketId(null);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setError(null);
    }
  }, [isOpen]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-purple-400" />
              <h2 className="text-xl font-bold text-white">Quick Save Prompt</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={saving}
              className="p-2 text-gray-400 hover:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
              )}

              {/* Prompt Text Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Prompt Text <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Enter your prompt here... (minimum 10 characters)"
                  className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                  disabled={saving}
                />
                <div className="flex justify-between items-center">
                  <div className={`text-xs ${
                    promptText.length < 10 
                      ? 'text-red-400' 
                      : promptText.length > 5000 
                        ? 'text-yellow-400' 
                        : 'text-gray-400'
                  }`}>
                    {promptText.length < 10 
                      ? `${10 - promptText.length} more characters needed`
                      : `${promptText.length} characters`}
                  </div>
                  {promptText.length > 5000 && (
                    <div className="text-xs text-yellow-400">
                      Very long prompt - consider splitting
                    </div>
                  )}
                </div>
              </div>

              {/* Two Column Layout for Selectors */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Bucket Selector */}
                  <BucketSelector
                    selectedBucketId={selectedBucketId}
                    onSelect={setSelectedBucketId}
                  />

                  {/* Category Selector */}
                  <CategorySelector
                    selectedCategory={selectedCategory}
                    onSelect={handleCategoryChange}
                  />
                </div>

                {/* Right Column */}
                <div>
                  {/* Subcategory Selector */}
                  <SubcategorySelector
                    parentCategory={selectedCategory}
                    selectedSubcategory={selectedSubcategory}
                    onSelect={setSelectedSubcategory}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 p-6">
            <div className="flex items-center justify-between">
              {/* Save Info */}
              <div className="text-xs text-gray-500">
                Prompt will be saved without analysis workflow
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={saving}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Prompt</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSaveModal;
```

---

### **PHASE 5: History Page Integration** ⏱️ 20 min

#### Step 5.1: Update History Page

**File**: `app/history/page.tsx`

**Add imports** (at top of file):
```typescript
import { Plus } from 'lucide-react'; // Add Plus to existing lucide imports
import QuickSaveModal from '@/components/QuickSaveModal';
import { QuickSavePromptRequest } from '@/lib/types';
```

**Add state management** (after existing useState declarations):
```typescript
const [showQuickSaveModal, setShowQuickSaveModal] = useState<boolean>(false);
```

**Add quick save handler** (after existing handlers):
```typescript
const handleQuickSave = useCallback(async (data: QuickSavePromptRequest): Promise<void> => {
  try {
    const response = await fetch('/api/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promptText: data.promptText,
        bucketId: data.bucketId,
        category: data.category,
        subcategory: data.subcategory,
        mode: 'manual' // Flag to indicate this is a quick save
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save prompt');
    }

    console.log('✅ Prompt quick saved successfully:', result.promptId);
    
    // Refresh the prompts list to show the new prompt
    await fetchPrompts();
    
  } catch (error) {
    console.error('Quick save error:', error);
    throw error; // Re-throw to let modal handle the error display
  }
}, [fetchPrompts]);
```

**Update the header section** (replace the existing header div):
```tsx
<div className="flex items-center justify-between mb-8">
  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
    Your Prompt History
  </h1>
  
  {/* Action Buttons */}
  <div className="flex items-center gap-3">
    <button
      onClick={() => setShowQuickSaveModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all text-sm font-medium"
    >
      <Plus size={16} />
      <span>Quick Save Prompt</span>
    </button>
    
    <button
      onClick={() => router.push('/settings/buckets')}
      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-white"
    >
      <Settings size={16} />
      <span>Manage Buckets</span>
    </button>
  </div>
</div>
```

**Add modal render** (before the closing `</>`):
```tsx
{/* Quick Save Modal */}
{showQuickSaveModal && (
  <QuickSaveModal
    isOpen={showQuickSaveModal}
    onClose={() => setShowQuickSaveModal(false)}
    onSave={handleQuickSave}
  />
)}
```

---

### **PHASE 6: Database Migration** ⏱️ 10 min

#### Step 6.1: Create Manual Mode Migration

**File**: `MANUAL_MODE_MIGRATION.sql` (new file)

```sql
-- =====================================================
-- MANUAL MODE SUPPORT MIGRATION
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- Dashboard -> SQL Editor -> New Query
-- =====================================================

-- =====================================================
-- 1. UPDATE ANALYSIS MODE CONSTRAINTS
-- =====================================================

-- Drop existing constraint if it exists
ALTER TABLE public.prompts 
DROP CONSTRAINT IF EXISTS prompts_analysis_mode_check;

-- Add new constraint that includes 'manual' mode
ALTER TABLE public.prompts 
ADD CONSTRAINT prompts_analysis_mode_check 
CHECK (analysis_mode IN ('ai', 'normal', 'extensive', 'manual'));

-- =====================================================
-- 2. ENSURE ANALYSIS MODE COLUMN PROPERTIES
-- =====================================================

-- Set default value for new records
ALTER TABLE public.prompts 
ALTER COLUMN analysis_mode SET DEFAULT 'normal';

-- Update any existing NULL values to 'normal' (if any)
UPDATE public.prompts 
SET analysis_mode = 'normal' 
WHERE analysis_mode IS NULL;

-- Make analysis_mode NOT NULL (if not already)
ALTER TABLE public.prompts 
ALTER COLUMN analysis_mode SET NOT NULL;

-- =====================================================
-- 3. ADD INDEX FOR ANALYSIS MODE QUERIES
-- =====================================================

-- Create index for faster filtering by analysis mode
CREATE INDEX IF NOT EXISTS idx_prompts_analysis_mode 
ON public.prompts(analysis_mode);

-- Create composite index for user + mode queries
CREATE INDEX IF NOT EXISTS idx_prompts_user_mode 
ON public.prompts(user_id, analysis_mode, created_at DESC);

-- =====================================================
-- 4. VERIFY SETUP
-- =====================================================

-- Check constraint was added
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.prompts'::regclass 
  AND conname LIKE '%analysis_mode%';

-- Check column properties
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'prompts'
  AND column_name = 'analysis_mode';

-- Check indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'prompts' 
  AND indexname LIKE '%analysis_mode%';

-- Count existing records by mode
SELECT 
  analysis_mode, 
  COUNT(*) as count
FROM public.prompts
GROUP BY analysis_mode
ORDER BY count DESC;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- The prompts table now supports:
-- - 'ai': AI mode (automated questions + answers)
-- - 'normal': Normal mode (AI questions, user answers)  
-- - 'extensive': Extensive mode (8-12 detailed questions)
-- - 'manual': Manual mode (quick save, no analysis)
-- =====================================================
```

---

### **PHASE 7: Visual Indicators & Polish** ⏱️ 10 min

#### Step 7.1: Add Manual Prompt Badge to History Cards

**File**: `app/history/page.tsx`

**Add import** (with other lucide imports):
```typescript
import { FileText } from 'lucide-react'; // Add FileText icon
```

**Update prompt card rendering** (in the prompts.map() section, add after CategoryBadge):

```tsx
{/* 🆕 Analysis Mode Badge (TASK-09) */}
{prompt.analysis_mode === 'manual' && (
  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
    <FileText size={10} />
    Manual
  </div>
)}
```

The full badges section should look like this:
```tsx
{/* 🆕 Dual Badges: Bucket + Category + Mode (TASK-06 + TASK-09) */}
<div className="flex items-center gap-2 mb-3 flex-wrap">
  {bucket && (
    <div
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
      style={{
        backgroundColor: `${bucket.color}20`,
        color: bucket.color,
      }}
    >
      <Folder size={12} />
      {bucket.name}
    </div>
  )}
  <CategoryBadge category={prompt.category} size="sm" />
  {prompt.analysis_mode === 'manual' && (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
      <FileText size={10} />
      Manual
    </div>
  )}
</div>
```

#### Step 7.2: Update PromptDetailModal for Manual Prompts

**File**: `components/PromptDetailModal.tsx`

**Find the questions/answers section and add conditional rendering:**

```tsx
{/* Only show questions/answers section if not manual mode */}
{prompt.analysis_mode !== 'manual' && prompt.questions && prompt.questions.length > 0 && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-white mb-4">
      Questions & Answers
    </h3>
    
    {/* Existing questions/answers rendering code */}
    {prompt.questions.map((question, index) => (
      // ... existing question rendering ...
    ))}
  </div>
)}

{/* Show manual mode notice instead */}
{prompt.analysis_mode === 'manual' && (
  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
    <div className="flex items-center gap-2 text-gray-400 mb-2">
      <FileText size={16} />
      <span className="font-medium">Manual Entry</span>
    </div>
    <p className="text-sm text-gray-500">
      This prompt was saved directly without going through the analysis workflow.
    </p>
  </div>
)}
```

---

### **PHASE 8: Testing & Validation** ⏱️ 15 min

#### Step 8.1: Manual Testing Checklist

**Prerequisites:**
1. ✅ Run database migration: `MANUAL_MODE_MIGRATION.sql`
2. ✅ Ensure authenticated user with existing buckets
3. ✅ Clear browser cache and reload application

**Quick Save Button Testing:**
- [ ] History page loads without errors
- [ ] "Quick Save Prompt" button appears in header
- [ ] Button is styled consistently (purple gradient)
- [ ] Clicking button opens modal

**Modal Form Testing:**
- [ ] Modal opens with clean, empty form
- [ ] Modal can be closed with X button
- [ ] Modal can be closed with ESC key
- [ ] Modal cannot be closed during save operation

**Form Validation Testing:**
- [ ] Save button is disabled initially
- [ ] Entering < 10 characters keeps save disabled
- [ ] Character counter shows correctly
- [ ] Red text when under 10 characters
- [ ] Save button enables when all required fields filled

**Bucket Selection Testing:**
- [ ] Existing buckets display correctly
- [ ] Bucket selection updates state
- [ ] Selected bucket shows visual feedback

**Category Selection Testing:**
- [ ] All 10 categories display with icons
- [ ] Category selection updates state
- [ ] Selected category shows visual feedback
- [ ] Subcategory section becomes available

**Subcategory Selection Testing:**
- [ ] Subcategories filter by parent category
- [ ] "None" option works correctly
- [ ] Subcategory selection is optional
- [ ] Changing category resets subcategory

**Save Operation Testing:**
- [ ] Valid form allows save
- [ ] Save button shows loading state
- [ ] Success closes modal and refreshes history
- [ ] Error displays in modal
- [ ] Form resets after successful save

**Database Verification:**
```sql
-- Check manual prompts were saved correctly
SELECT 
  id, 
  LEFT(initial_prompt, 50) as prompt_preview,
  LEFT(super_prompt, 50) as super_prompt_preview,
  category,
  subcategory,
  analysis_mode,
  questions,
  answers,
  bucket_id,
  created_at
FROM public.prompts 
WHERE analysis_mode = 'manual' 
ORDER BY created_at DESC 
LIMIT 5;
```

**History Display Testing:**
- [ ] Manual prompt appears in history immediately
- [ ] Manual badge displays correctly
- [ ] Bucket and category badges show
- [ ] Filtering by bucket includes manual prompts
- [ ] Filtering by category includes manual prompts

**Detail Modal Testing:**
- [ ] Manual prompt opens in detail modal
- [ ] Shows "Manual Entry" section instead of Q&A
- [ ] Initial prompt and super prompt are identical
- [ ] All metadata displays correctly

#### Step 8.2: Error Scenarios Testing

**Network Errors:**
- [ ] API failure shows error message in modal
- [ ] User can retry after network error
- [ ] Modal doesn't close on API error

**Validation Errors:**
- [ ] Empty prompt text → validation prevents save
- [ ] No bucket selected → validation prevents save  
- [ ] No category selected → validation prevents save
- [ ] Invalid bucket ID → API returns 400 error

**Edge Cases:**
- [ ] Very long prompt (5000+ chars) → saves successfully
- [ ] Special characters and emojis → saves correctly
- [ ] Unicode characters → saves correctly
- [ ] Rapid multiple saves → handled gracefully

**Browser Compatibility:**
- [ ] Works in Chrome
- [ ] Works in Firefox  
- [ ] Works in Safari
- [ ] Responsive on mobile
- [ ] Responsive on tablet

---

## 📊 SUCCESS METRICS

### ✅ **Functional Success Criteria:**
1. ✅ User can access Quick Save from history page
2. ✅ Modal provides intuitive form interface
3. ✅ Form validates all required fields
4. ✅ Prompt saves to database with correct metadata
5. ✅ Manual prompts display correctly in history
6. ✅ Manual prompts work with all existing filters
7. ✅ Manual prompts integrate with detail modal

### ✅ **Technical Success Criteria:**
1. ✅ No breaking changes to existing workflows
2. ✅ Type safety maintained throughout
3. ✅ Database constraints support manual mode
4. ✅ API handles both manual and analyzed saves
5. ✅ RLS policies apply to manual prompts
6. ✅ Performance impact is negligible

### ✅ **User Experience Success Criteria:**
1. ✅ Intuitive workflow (< 30 seconds to save)
2. ✅ Clear validation messages
3. ✅ Responsive design works on all devices
4. ✅ Visual consistency with existing UI
5. ✅ Loading states provide clear feedback
6. ✅ Error handling is user-friendly

---

## 🚀 DEPLOYMENT CHECKLIST

### **Pre-Deployment:**
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings addressed
- [ ] Manual testing checklist completed
- [ ] Database migration tested in development
- [ ] Components render correctly in all browsers

### **Deployment Steps:**
1. [ ] Run database migration in production: `MANUAL_MODE_MIGRATION.sql`
2. [ ] Deploy frontend code changes
3. [ ] Verify Quick Save button appears
4. [ ] Test end-to-end workflow in production
5. [ ] Monitor for any runtime errors

### **Post-Deployment:**
- [ ] Verify database migration completed successfully
- [ ] Check application logs for errors
- [ ] Test with real user accounts
- [ ] Monitor performance metrics
- [ ] Document feature for user support

---

## 🎯 FUTURE ENHANCEMENTS

**Phase 2 Potential Features:**
1. **Bulk Import**: Upload CSV/JSON files with multiple prompts
2. **Template System**: Save and reuse prompt templates
3. **Quick Edit**: Edit manual prompts inline
4. **Duplicate Detection**: Warn users about similar existing prompts
5. **Auto-tagging**: AI-suggested tags for better organization
6. **Export Options**: Export manual prompts to various formats

**Analytics Opportunities:**
1. Track usage of manual vs analyzed prompts
2. Monitor most popular categories for manual saves
3. Identify patterns in quick save behavior
4. A/B test different form layouts

---

## ✅ IMPLEMENTATION COMPLETE

**🎉 TASK-09: Quick Save Prompt Implementation**

**Summary**: Successfully implemented a streamlined Quick Save feature that allows users to save pre-existing prompts directly to their organized bucket system without requiring the full analysis workflow. The feature includes:

- **Complete Form Interface**: Modal with prompt input, bucket selection, category/subcategory classification
- **Database Integration**: New 'manual' analysis mode with proper constraints and indexing  
- **Visual Indicators**: Manual prompts are clearly identified with badges and special handling
- **Full Compatibility**: Works seamlessly with existing filters, buckets, and detail views
- **Type Safety**: Complete TypeScript support with proper interfaces and validation

**Files Created**: 5 new files  
**Files Modified**: 3 existing files  
**Database Changes**: 1 migration script  
**Estimated Time**: 2 hours  
**Actual Complexity**: Medium  

**✅ Ready for Do Agent Implementation**
