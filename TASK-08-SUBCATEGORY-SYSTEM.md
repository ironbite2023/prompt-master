# TASK-08: Multi-Level Subcategory System

**Created:** October 1, 2025  
**Status:** Planning Complete - Ready for Implementation  
**Priority:** High  
**Estimated Effort:** 10-12 hours  
**Depends On:** TASK-06 (AI Categorization) ✅ Complete  
**Approach:** Two-Tier AI Classification (Category → Subcategory)

---

## Table of Contents
1. [Overview](#overview)
2. [Request Analysis](#request-analysis)
3. [Subcategory Definitions](#subcategory-definitions)
4. [Database Schema](#database-schema)
5. [TypeScript Type System](#typescript-type-system)
6. [AI Classification Engine](#ai-classification-engine)
7. [API Updates](#api-updates)
8. [UI Components](#ui-components)
9. [Implementation Steps](#implementation-steps)
10. [Testing Checklist](#testing-checklist)
11. [Success Criteria](#success-criteria)

---

## Overview

This task implements a **two-tier AI-powered categorization system** that classifies prompts into:
1. **Main Category** (10 categories) - e.g., "Software Development"
2. **Subcategory** (5-7 per category, 61 total) - e.g., "AI/ML Development"

### Key Features:
- ✅ **61 Predefined Subcategories** across 10 main categories
- ✅ **Single AI Call** - classifies both category and subcategory simultaneously
- ✅ **Hierarchical Filtering** - Filter by category, then drill down to subcategories
- ✅ **Smart UI** - Expandable category filters with nested subcategories
- ✅ **Dual Badges** - Show both category and subcategory on prompts
- ✅ **Backward Compatible** - Existing prompts work without subcategories

### User Flow:
1. User completes prompt generation
2. User clicks "Save to History"
3. **AI analyzes prompt** → Assigns category + subcategory
4. Prompt saves with both values
5. History page shows dual badges and hierarchical filtering

---

## Request Analysis

### What the User Requested:
- **Software Development category** for AI agents and dev work ✅ (already exists)
- **5-10 subcategories per main category** for granular classification
- **AI chooses subcategory** automatically based on content
- **UI design choice** left to our recommendation

### Implicit Requirements:
- Must maintain existing category system
- Subcategories should be comprehensive but not overwhelming
- UI must remain intuitive with added complexity
- Performance should not degrade significantly
- Existing prompts should gracefully handle missing subcategories

---

## Subcategory Definitions

### Complete Two-Tier Structure (61 Subcategories)

#### 1. 💻 Software Development (7 subcategories)

**Main Category Keywords:** code, programming, software, development, technical

| Subcategory | Slug | Keywords |
|-------------|------|----------|
| 🤖 **AI/ML Development** | `ai-ml-development` | AI, machine learning, neural network, LLM, agent, GPT, model training, deep learning, NLP, computer vision, TensorFlow, PyTorch |
| 🌐 **Web Development** | `web-development` | website, web app, React, Vue, Angular, Next.js, frontend, backend, fullstack, HTML, CSS, JavaScript, TypeScript, REST API, GraphQL |
| 📱 **Mobile Development** | `mobile-development` | iOS, Android, Swift, Kotlin, React Native, Flutter, mobile app, app development, smartphone |
| 🗄️ **Database & Backend** | `database-backend` | database, SQL, PostgreSQL, MongoDB, Redis, server, backend, API design, microservices, Node.js, Python backend |
| 🔧 **DevOps & Infrastructure** | `devops-infrastructure` | Docker, Kubernetes, CI/CD, deployment, cloud, AWS, Azure, GCP, infrastructure, DevOps, automation, Jenkins, GitHub Actions |
| 🧪 **Testing & Quality** | `testing-quality` | testing, QA, unit test, integration test, debugging, bug fix, quality assurance, Jest, Pytest, test automation |
| 📚 **Documentation & Architecture** | `docs-architecture` | documentation, technical writing, system design, architecture, UML, API documentation, README, code documentation |

#### 2. ✍️ Content Writing (6 subcategories)

**Main Category Keywords:** write, content, article, blog, creative, story

| Subcategory | Slug | Keywords |
|-------------|------|----------|
| 📝 **Blog Posts & Articles** | `blog-articles` | blog post, article, web content, online writing, content creation, editorial |
| 📖 **Creative Writing & Fiction** | `creative-fiction` | story, novel, fiction, creative writing, narrative, character, plot, poetry, prose |
| 📰 **Journalism & News** | `journalism-news` | journalism, news article, reporting, press release, investigative, news writing |
| 📄 **Technical Writing** | `technical-writing` | technical documentation, user guide, manual, how-to guide, SaaS documentation |
| ✉️ **Copywriting & Marketing Copy** | `copywriting` | sales copy, ad copy, landing page, product description, marketing copy, CTA, persuasive writing |
| 🎬 **Scripts & Screenplays** | `scripts-screenplays` | screenplay, script, dialogue, video script, YouTube script, podcast script |

#### 3. 📊 Marketing & Advertising (7 subcategories)

**Main Category Keywords:** marketing, advertising, campaign, promotion, brand

| Subcategory | Slug | Keywords |
|-------------|------|----------|
| 📱 **Social Media Marketing** | `social-media` | social media, Facebook, Instagram, Twitter, TikTok, LinkedIn, social post, engagement |
| 📧 **Email Marketing** | `email-marketing` | email campaign, newsletter, email sequence, drip campaign, email blast, subscriber |
| 🎯 **Content Marketing** | `content-marketing` | content strategy, content calendar, content marketing, thought leadership, inbound marketing |
| 💰 **Paid Advertising** | `paid-advertising` | PPC, Google Ads, Facebook Ads, paid campaign, ad targeting, ROAS, CPC, display ads |
| 🎨 **Brand Strategy** | `brand-strategy` | branding, brand identity, brand positioning, brand voice, brand guidelines, rebranding |
| 📊 **Growth & Analytics** | `growth-analytics` | growth hacking, analytics, conversion optimization, A/B testing, funnel, metrics, KPI tracking |
| 🤝 **Influencer Marketing** | `influencer-marketing` | influencer, partnership, collaboration, sponsored content, affiliate marketing |

#### 4. 🔍 SEO & Research (5 subcategories)

**Main Category Keywords:** SEO, search, optimization, ranking, keyword

| Subcategory | Slug | Keywords |
|-------------|------|----------|
| 🔑 **Keyword Research** | `keyword-research` | keyword research, search volume, keyword difficulty, long-tail keywords, search intent |
| 📈 **On-Page SEO** | `on-page-seo` | on-page optimization, meta tags, title tag, heading tags, content optimization, internal linking |
| 🔗 **Link Building** | `link-building` | backlinks, link building, off-page SEO, domain authority, guest posting, link acquisition |
| 📊 **Technical SEO** | `technical-seo` | technical SEO, site speed, crawlability, sitemap, robots.txt, schema markup, Core Web Vitals |
| 🔬 **Competitive Analysis** | `competitive-analysis` | competitor analysis, market research, SERP analysis, competitive intelligence, gap analysis |

#### 5. 📧 Business Communication (6 subcategories)

**Main Category Keywords:** business, professional, communication, corporate

| Subcategory | Slug | Keywords |
|-------------|------|----------|
| ✉️ **Professional Emails** | `professional-emails` | business email, professional email, corporate communication, email etiquette |
| 📊 **Presentations & Pitch Decks** | `presentations` | presentation, pitch deck, slides, PowerPoint, keynote, investor pitch, sales presentation |
| 📋 **Reports & Documentation** | `reports-docs` | business report, annual report, documentation, white paper, case study, analysis report |
| 💼 **Proposals & Contracts** | `proposals-contracts` | proposal, RFP response, contract, agreement, statement of work, business proposal |
| 📞 **Meeting Materials** | `meeting-materials` | meeting agenda, minutes, meeting notes, action items, meeting prep |
| 🤝 **Client Communication** | `client-communication` | client email, client update, stakeholder communication, client presentation |

#### 6. 🎓 Education & Learning (6 subcategories)

**Main Category Keywords:** education, learning, teach, tutorial, training

| Subcategory | Slug | Keywords |
|-------------|------|----------|
| 📚 **Course Content** | `course-content` | course, curriculum, syllabus, course outline, learning objectives, course material |
| 📖 **Tutorials & How-Tos** | `tutorials` | tutorial, how-to, step-by-step guide, walkthrough, instructional |
| 🎯 **Educational Videos** | `educational-videos` | video lesson, educational video, e-learning, video course, instructional video |
| 📝 **Study Guides & Notes** | `study-guides` | study guide, notes, study material, revision notes, exam prep |
| 👨‍🏫 **Lesson Plans** | `lesson-plans` | lesson plan, teaching plan, class activity, teaching strategy, pedagogy |
| 📊 **Assessments & Quizzes** | `assessments` | quiz, test, assessment, exam, evaluation, rubric, grading |

#### 7. 🎨 Creative & Design (7 subcategories)

**Main Category Keywords:** design, creative, visual, UI, UX, graphic

| Subcategory | Slug | Keywords |
|-------------|------|----------|
| 🖼️ **UI/UX Design** | `ui-ux-design` | UI design, UX design, user interface, user experience, usability, interaction design, wireframe |
| 🎨 **Graphic Design** | `graphic-design` | graphic design, visual design, print design, poster, flyer, brochure |
| 🏷️ **Branding & Identity** | `branding-identity` | brand identity, logo design, brand guidelines, visual identity, brand system |
| 📐 **Web Design** | `web-design` | web design, website layout, responsive design, landing page design, web aesthetics |
| 🎭 **Visual Concepts** | `visual-concepts` | concept art, mood board, design concept, visual direction, art direction |
| 🖌️ **Illustration & Art** | `illustration-art` | illustration, digital art, artwork, drawing, vector art, icon design |
| 🎬 **Motion Design** | `motion-design` | motion graphics, animation, video editing, After Effects, motion design |

#### 8. 📈 Data & Analytics (6 subcategories)

**Main Category Keywords:** data, analytics, analysis, metrics, statistics

| Subcategory | Slug | Keywords |
|-------------|------|----------|
| 📊 **Data Analysis** | `data-analysis` | data analysis, data exploration, exploratory analysis, data insights |
| 📉 **Data Visualization** | `data-visualization` | data visualization, charts, graphs, dashboard, visual analytics, Tableau, Power BI |
| 🔢 **Statistical Analysis** | `statistical-analysis` | statistics, statistical analysis, hypothesis testing, regression, correlation |
| 📋 **Business Intelligence** | `business-intelligence` | business intelligence, BI, reporting, data warehouse, ETL |
| 🤖 **Data Science & ML** | `data-science-ml` | data science, machine learning, predictive modeling, feature engineering |
| 📈 **Reporting & Dashboards** | `reporting-dashboards` | reporting, KPI dashboard, metrics reporting, performance dashboard |

#### 9. 💡 Productivity & Planning (6 subcategories)

**Main Category Keywords:** productivity, planning, organization, task, project

| Subcategory | Slug | Keywords |
|-------------|------|----------|
| ✅ **Task Management** | `task-management` | task management, to-do list, task tracking, checklist, task organization |
| 📅 **Project Planning** | `project-planning` | project plan, project management, timeline, Gantt chart, project scope |
| 🎯 **Goal Setting & OKRs** | `goals-okrs` | goal setting, OKR, objectives, key results, SMART goals, goal tracking |
| 🧠 **Brainstorming & Ideation** | `brainstorming` | brainstorming, ideation, mind mapping, creative thinking, idea generation |
| ⏱️ **Time Management** | `time-management` | time management, scheduling, calendar, time blocking, productivity tips |
| 📊 **Workflow Optimization** | `workflow-optimization` | workflow, process optimization, automation, efficiency, productivity system |

#### 10. ❓ General & Other (5 subcategories)

**Main Category Keywords:** general, miscellaneous, various, mixed

| Subcategory | Slug | Keywords |
|-------------|------|----------|
| 🤔 **Miscellaneous** | `miscellaneous` | misc, general, various, other |
| 🔀 **Multi-Category** | `multi-category` | multiple, cross-category, hybrid, combined |
| 💬 **Conversational** | `conversational` | conversation, chat, dialogue, Q&A |
| 🎲 **Exploratory** | `exploratory` | experimental, exploratory, testing, trying |
| 📦 **Uncategorized** | `uncategorized` | uncategorized, undefined, unknown |

---

## Database Schema

### Migration SQL

```sql
-- =====================================================
-- MIGRATION: Add Subcategory Column to Prompts Table
-- Task: TASK-08 Multi-Level Subcategory System
-- =====================================================

-- Add subcategory column (nullable initially)
ALTER TABLE public.prompts 
ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- Create index for subcategory filtering
CREATE INDEX IF NOT EXISTS prompts_subcategory_idx 
ON public.prompts(subcategory);

-- Create composite index for category + subcategory filtering
CREATE INDEX IF NOT EXISTS prompts_cat_subcat_idx 
ON public.prompts(category, subcategory, created_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN public.prompts.subcategory IS 'AI-assigned subcategory within the main category for granular classification. Optional field that provides deeper categorization (e.g., "ai-ml-development" within "software-development").';

-- Verify column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'prompts' 
  AND column_name = 'subcategory';
```

**Note:** No check constraint on subcategory - allows flexibility as we may add more subcategories over time.

---

## TypeScript Type System

### Complete Type Definitions

**File:** `lib/types.ts`

```typescript
// =====================================================
// SUBCATEGORY SYSTEM TYPES (TASK-08)
// =====================================================

/**
 * All subcategories across all main categories
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
 * Updated classification result with subcategory
 */
export interface CategoryClassification {
  category: PromptCategory;
  subcategory?: PromptSubcategory; // Optional subcategory
  confidence?: number;
  reasoning?: string;
}

/**
 * Updated SavedPrompt with subcategory
 */
export interface SavedPrompt {
  id: string;
  user_id: string;
  initial_prompt: string;
  questions: Question[] | null;
  answers: Record<number, string> | null;
  super_prompt: string;
  bucket_id: string;
  category: PromptCategory;
  subcategory?: PromptSubcategory | null; // NEW: Optional subcategory
  created_at: string;
  bucket?: Bucket;
}

/**
 * Filter options with subcategory support
 */
export interface PromptFilters {
  category: PromptCategory | 'all';
  subcategory?: PromptSubcategory | 'all'; // NEW
  bucketId?: string | 'all';
  searchQuery?: string;
}
```

---

## AI Classification Engine

### Single-Call Two-Tier Classification

**Strategy:** One AI call that returns both category AND subcategory simultaneously for performance.

**File:** `lib/subcategoryConfig.ts` (new file)

```typescript
import { PromptCategory, PromptSubcategory, SubcategoryMetadata } from './types';

/**
 * Mapping of subcategories to their parent categories
 */
export const SUBCATEGORY_TO_CATEGORY: Record<PromptSubcategory, PromptCategory> = {
  // Software Development
  [PromptSubcategory.AI_ML_DEV]: PromptCategory.SOFTWARE_DEV,
  [PromptSubcategory.WEB_DEV]: PromptCategory.SOFTWARE_DEV,
  [PromptSubcategory.MOBILE_DEV]: PromptCategory.SOFTWARE_DEV,
  [PromptSubcategory.DATABASE_BACKEND]: PromptCategory.SOFTWARE_DEV,
  [PromptSubcategory.DEVOPS_INFRA]: PromptCategory.SOFTWARE_DEV,
  [PromptSubcategory.TESTING_QA]: PromptCategory.SOFTWARE_DEV,
  [PromptSubcategory.DOCS_ARCH]: PromptCategory.SOFTWARE_DEV,
  
  // ... (Continue for all 61 subcategories)
};

/**
 * Get subcategories for a specific category
 */
export const getSubcategoriesForCategory = (
  category: PromptCategory
): PromptSubcategory[] => {
  return Object.entries(SUBCATEGORY_TO_CATEGORY)
    .filter(([_, parentCat]) => parentCat === category)
    .map(([subcat]) => subcat as PromptSubcategory);
};

/**
 * Complete subcategory metadata configuration
 */
export const SUBCATEGORY_CONFIG: Record<PromptSubcategory, SubcategoryMetadata> = {
  // Software Development subcategories
  [PromptSubcategory.AI_ML_DEV]: {
    id: PromptSubcategory.AI_ML_DEV,
    name: 'AI/ML Development',
    description: 'AI agents, machine learning, neural networks',
    parentCategory: PromptCategory.SOFTWARE_DEV,
    icon: '🤖',
    keywords: ['AI', 'machine learning', 'neural network', 'LLM', 'agent', 'GPT']
  },
  // ... (All 61 subcategories with full metadata)
};
```

### Updated Categorization Function

**File:** `lib/prompts.ts` (update existing function)

```typescript
/**
 * Enhanced categorization with subcategory support
 */
export async function categorizePrompt(
  initialPrompt: string
): Promise<CategoryClassification> {
  try {
    // Validate input
    if (!initialPrompt || initialPrompt.trim().length === 0) {
      return {
        category: PromptCategory.GENERAL,
        subcategory: PromptSubcategory.UNCATEGORIZED,
        confidence: 1.0,
        reasoning: 'Empty prompt defaults to general category'
      };
    }

    // Build enhanced categorization prompt
    const categorizationPrompt = buildTwoTierCategorizationPrompt(initialPrompt);

    // Call Gemini API
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: categorizationPrompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 100,
      }
    });
    
    if (!response.text) {
      return fallbackCategorization(initialPrompt);
    }
    
    // Parse two-tier response
    const classification = parseTwoTierResponse(response.text);
    
    return classification;

  } catch (error) {
    console.error('Error categorizing prompt:', error);
    return fallbackCategorization(initialPrompt);
  }
}

/**
 * Build two-tier categorization prompt
 */
function buildTwoTierCategorizationPrompt(initialPrompt: string): string {
  return `Classify this prompt into a category and subcategory.

USER PROMPT:
"${initialPrompt}"

RESPOND IN THIS EXACT JSON FORMAT:
{
  "category": "category-slug",
  "subcategory": "subcategory-slug"
}

CATEGORIES & SUBCATEGORIES:

software-development:
  - ai-ml-development (AI, ML, agents, LLM)
  - web-development (React, Next.js, frontend, backend)
  - mobile-development (iOS, Android, React Native)
  - database-backend (SQL, APIs, servers)
  - devops-infrastructure (Docker, K8s, CI/CD)
  - testing-quality (testing, QA, debugging)
  - docs-architecture (documentation, system design)

content-writing:
  - blog-articles (blog posts, articles)
  - creative-fiction (stories, novels, creative)
  - journalism-news (news, reporting)
  - technical-writing (tech docs, guides)
  - copywriting (ad copy, sales copy)
  - scripts-screenplays (video scripts, screenplays)

... (Include all 10 categories with their subcategories)

RULES:
1. Choose the MOST SPECIFIC subcategory
2. If uncertain, use general-other/uncategorized
3. Return ONLY valid JSON

JSON:`;
}

/**
 * Parse two-tier AI response
 */
function parseTwoTierResponse(response: string): CategoryClassification {
  try {
    const cleaned = response.trim().replace(/```json|```/g, '');
    const parsed = JSON.parse(cleaned);
    
    const category = parsed.category as PromptCategory;
    const subcategory = parsed.subcategory as PromptSubcategory;
    
    // Validate both are valid
    if (isValidCategory(category) && isValidSubcategory(subcategory)) {
      // Verify subcategory belongs to category
      if (SUBCATEGORY_TO_CATEGORY[subcategory] === category) {
        return {
          category,
          subcategory,
          confidence: 0.85,
          reasoning: 'Two-tier AI classification'
        };
      }
    }
    
    // Fallback if validation fails
    return {
      category: category || PromptCategory.GENERAL,
      subcategory: PromptSubcategory.UNCATEGORIZED,
      confidence: 0.5,
      reasoning: 'Validation failed, using fallback'
    };
    
  } catch (error) {
    return {
      category: PromptCategory.GENERAL,
      subcategory: PromptSubcategory.UNCATEGORIZED,
      confidence: 0.3,
      reasoning: 'Parse error, using fallback'
    };
  }
}

/**
 * Validate subcategory
 */
export function isValidSubcategory(subcat: string): subcat is PromptSubcategory {
  return Object.values(PromptSubcategory).includes(subcat as PromptSubcategory);
}
```

---

## UI Components

### Recommended UI Approach: **Expandable Nested Filters**

**Rationale:**
- ✅ Clean visual hierarchy
- ✅ Doesn't overwhelm users
- ✅ Shows subcategories only when category selected
- ✅ Mobile-friendly (collapsible)
- ✅ Intuitive drill-down pattern

### Component 1: Subcategory Badge

**File:** `components/SubcategoryBadge.tsx`

```typescript
'use client';

import React from 'react';
import { PromptSubcategory } from '@/lib/types';
import { getSubcategoryMetadata } from '@/lib/subcategoryConfig';

interface SubcategoryBadgeProps {
  subcategory: PromptSubcategory;
  size?: 'sm' | 'md';
}

const SubcategoryBadge: React.FC<SubcategoryBadgeProps> = ({ 
  subcategory, 
  size = 'sm'
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
        font-medium
      `}
      title={metadata.description}
    >
      <span>{metadata.icon}</span>
      <span>{metadata.name}</span>
    </span>
  );
};

export default SubcategoryBadge;
```

### Component 2: Enhanced Category Filter with Subcategories

**File:** `components/CategoryFilter.tsx` (update existing)

```typescript
'use client';

import React, { useMemo, useState } from 'react';
import { PromptCategory, PromptSubcategory, SavedPrompt } from '@/lib/types';
import { getAllCategories } from '@/lib/categoryConfig';
import { getSubcategoriesForCategory, getSubcategoryMetadata } from '@/lib/subcategoryConfig';
import { Filter, X, ChevronDown, ChevronRight } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: PromptCategory | 'all';
  selectedSubcategory?: PromptSubcategory | 'all';
  onCategoryChange: (category: PromptCategory | 'all') => void;
  onSubcategoryChange?: (subcategory: PromptSubcategory | 'all') => void;
  prompts: SavedPrompt[];
  showCounts?: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  selectedSubcategory = 'all',
  onCategoryChange,
  onSubcategoryChange,
  prompts,
  showCounts = true
}) => {
  const categories = getAllCategories();
  const [expandedCategory, setExpandedCategory] = useState<PromptCategory | null>(
    selectedCategory !== 'all' ? selectedCategory : null
  );

  // Calculate category and subcategory counts
  const counts = useMemo(() => {
    const catCounts: Record<string, number> = { all: prompts.length };
    const subcatCounts: Record<string, number> = {};
    
    prompts.forEach(prompt => {
      catCounts[prompt.category] = (catCounts[prompt.category] || 0) + 1;
      if (prompt.subcategory) {
        subcatCounts[prompt.subcategory] = (subcatCounts[prompt.subcategory] || 0) + 1;
      }
    });

    return { category: catCounts, subcategory: subcatCounts };
  }, [prompts]);

  const handleCategoryClick = (category: PromptCategory | 'all'): void => {
    onCategoryChange(category);
    if (category !== 'all') {
      setExpandedCategory(category);
    }
  };

  const toggleExpand = (category: PromptCategory, e: React.MouseEvent): void => {
    e.stopPropagation();
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleSubcategoryClick = (subcategory: PromptSubcategory): void => {
    if (onSubcategoryChange) {
      onSubcategoryChange(subcategory);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-300">Filter by Category</h3>
        </div>
        
        {selectedCategory !== 'all' && (
          <button
            onClick={() => {
              onCategoryChange('all');
              if (onSubcategoryChange) onSubcategoryChange('all');
            }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* All Categories */}
      <button
        onClick={() => handleCategoryClick('all')}
        className={`
          w-full flex items-center justify-between px-4 py-2.5 rounded-lg
          text-sm font-medium transition-all
          ${selectedCategory === 'all'
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
          }
        `}
      >
        <span>All Categories</span>
        {showCounts && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            selectedCategory === 'all' ? 'bg-white/20' : 'bg-gray-700'
          }`}>
            {counts.category.all || 0}
          </span>
        )}
      </button>

      {/* Category List with Expandable Subcategories */}
      <div className="space-y-1">
        {categories.map(category => {
          const count = counts.category[category.id] || 0;
          const isSelected = selectedCategory === category.id;
          const isExpanded = expandedCategory === category.id;
          const IconComponent = category.iconComponent;
          const subcategories = getSubcategoriesForCategory(category.id);
          const hasSubcategories = subcategories.length > 0;

          return (
            <div key={category.id}>
              {/* Main Category Button */}
              <button
                onClick={() => handleCategoryClick(category.id)}
                disabled={count === 0}
                className={`
                  w-full flex items-center justify-between px-4 py-2.5 rounded-lg
                  text-sm font-medium transition-all
                  ${isSelected
                    ? `${category.colorClass} border`
                    : count === 0
                      ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-transparent'
                  }
                `}
                title={category.description}
              >
                <div className="flex items-center gap-2 flex-1">
                  {hasSubcategories && (
                    <button
                      onClick={(e) => toggleExpand(category.id, e)}
                      className="hover:bg-gray-600/30 rounded p-0.5"
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  )}
                  <IconComponent size={16} />
                  <span>{category.name}</span>
                </div>
                
                {showCounts && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-current/20' : count === 0 ? 'bg-gray-700/50' : 'bg-gray-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>

              {/* Subcategories (Expandable) */}
              {hasSubcategories && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {subcategories.map(subcatId => {
                    const subcatMeta = getSubcategoryMetadata(subcatId);
                    const subcatCount = counts.subcategory[subcatId] || 0;
                    const isSubcatSelected = selectedSubcategory === subcatId;

                    return (
                      <button
                        key={subcatId}
                        onClick={() => handleSubcategoryClick(subcatId)}
                        disabled={subcatCount === 0}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 rounded-md
                          text-xs font-medium transition-all
                          ${isSubcatSelected
                            ? 'bg-gray-600/50 text-white border border-gray-500'
                            : subcatCount === 0
                              ? 'bg-gray-800/20 text-gray-600 cursor-not-allowed'
                              : 'bg-gray-800/30 text-gray-400 hover:bg-gray-700/40'
                          }
                        `}
                        title={subcatMeta.description}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{subcatMeta.icon}</span>
                          <span>{subcatMeta.name}</span>
                        </div>
                        {showCounts && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            isSubcatSelected ? 'bg-white/10' : 'bg-gray-700/50'
                          }`}>
                            {subcatCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
```

---

## Implementation Steps

### Phase 1: Database & Types (2 hours)

1. **Run database migration**
   - Add `subcategory` column
   - Create indexes
   - Verify

2. **Create `lib/subcategoryConfig.ts`**
   - Define all 61 subcategories
   - Create metadata configuration
   - Add helper functions

3. **Update `lib/types.ts`**
   - Add `PromptSubcategory` enum
   - Update interfaces
   - Add subcategory to SavedPrompt

4. **Test TypeScript compilation**

### Phase 2: AI Classification (3 hours)

5. **Update `lib/prompts.ts`**
   - Enhance `categorizePrompt()` for two-tier
   - Build comprehensive AI prompt
   - Add parsing logic
   - Test with sample prompts

6. **Create validation functions**
   - `isValidSubcategory()`
   - `getSubcategoriesForCategory()`

7. **Test categorization accuracy**

### Phase 3: API Updates (1 hour)

8. **Update `app/api/prompts/route.ts`**
   - POST: Save subcategory
   - GET: Filter by subcategory
   - Return subcategory in responses

9. **Test API endpoints**

### Phase 4: UI Components (3 hours)

10. **Create `SubcategoryBadge.tsx`**
11. **Update `CategoryFilter.tsx`** with expandable subcategories
12. **Update `app/history/page.tsx`**
    - Add subcategory state
    - Update filtering logic
    - Show dual badges
13. **Update `PromptDetailModal.tsx`** to show subcategory

### Phase 5: Testing & Polish (2 hours)

14. **Comprehensive testing**
15. **Bug fixes**
16. **Documentation updates**

---

## Testing Checklist

### Database Tests
- [ ] Subcategory column added
- [ ] Indexes created
- [ ] Nullable constraint works
- [ ] Existing prompts unaffected

### AI Classification Tests
- [ ] Software Dev → AI/ML correctly identified
- [ ] Web Dev prompts → web-development
- [ ] Mobile prompts → mobile-development
- [ ] Edge cases handled gracefully
- [ ] Fallback works when AI fails

### API Tests
- [ ] POST saves subcategory
- [ ] GET returns subcategory
- [ ] Filter by category only
- [ ] Filter by subcategory only
- [ ] Filter by both simultaneously

### UI Tests
- [ ] Subcategory badge displays correctly
- [ ] Category filter expands/collapses
- [ ] Subcategory counts accurate
- [ ] Filtering updates grid
- [ ] Mobile responsive
- [ ] Dual badges show on cards

---

## Success Criteria

### Functional
- ✅ 61 subcategories working
- ✅ Two-tier AI classification accurate (75%+)
- ✅ Filtering by subcategory works
- ✅ Backward compatible (old prompts work)
- ✅ Performance acceptable (<3s for save)

### UX
- ✅ Expandable filters intuitive
- ✅ Dual badges clear and readable
- ✅ Counts accurate
- ✅ Mobile-friendly

### Technical
- ✅ Type-safe throughout
- ✅ No build errors
- ✅ Indexes improve performance
- ✅ Proper error handling

---

**Status:** 📋 Ready for Implementation  
**Complexity:** High  
**Impact:** Very High (Fine-grained organization)  
**Risk:** Medium (Complex UI, AI accuracy)
