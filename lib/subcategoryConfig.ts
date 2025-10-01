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
