/**
 * MASTER PROMPT ENGINEERING EXPERT SYSTEM
 * 
 * This module contains meta-prompts that implement industry-standard
 * prompt engineering methodologies to transform user prompts into
 * highly effective "super prompts."
 * 
 * Core Techniques Applied:
 * - Role-Playing & Persona Assignment
 * - Contextualization & Background
 * - Task Decomposition
 * - Constraint Definition
 * - Few-Shot Learning (Exemplification)
 * - Chain-of-Thought (CoT) Prompting
 * - Zero-Shot Prompting
 * - Persona Alignment
 * - Instruction Clarity & Specificity
 * - Output Control & Quality
 * - Negative Constraints
 * - Goal Reinforcement
 * 
 * The system performs critical analysis first, identifying strengths,
 * weaknesses, and ambiguities before strategically applying these
 * techniques to create optimized prompts.
 */

import { getGeminiClient, DEFAULT_MODEL } from './gemini';
import { PromptCategory, PromptSubcategory, CategoryClassification } from './types';
import { CATEGORY_CONFIG } from './categoryConfig';
import { SUBCATEGORY_CONFIG, getSubcategoriesByCategory } from './subcategoryConfig';

/**
 * Categorize a prompt using Gemini AI with two-tier classification (TASK-08)
 * @param initialPrompt - The user's initial prompt text
 * @returns Promise with category and subcategory classification
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

    // Handle very short prompts (less than 10 characters)
    if (initialPrompt.trim().length < 10) {
      return {
        category: PromptCategory.GENERAL,
        subcategory: PromptSubcategory.UNCATEGORIZED,
        confidence: 0.5,
        reasoning: 'Prompt too short for accurate classification'
      };
    }

    // Build two-tier categorization prompt for Gemini
    const categorizationPrompt = buildTwoTierCategorizationPrompt(initialPrompt);

    // Call Gemini API
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: categorizationPrompt,
      config: {
        temperature: 0.3,  // Lower for more consistent categorization
        maxOutputTokens: 150,  // Need more tokens for JSON response with category + subcategory
      }
    });
    
    if (!response.text) {
      console.warn('No response from Gemini API, using fallback');
      return fallbackCategorization(initialPrompt);
    }

    // Parse two-tier response
    const classification = parseTwoTierResponse(response.text);
    
    return classification;

  } catch (error) {
    console.error('Error categorizing prompt:', error);
    
    // Fallback to keyword-based categorization
    return fallbackCategorization(initialPrompt);
  }
}

/**
 * Build two-tier categorization prompt for Gemini (TASK-08)
 * Returns both category and subcategory in a single AI call
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
  - ai-ml-development (AI, ML, agents, LLM, neural networks)
  - web-development (React, Next.js, frontend, backend, web apps)
  - mobile-development (iOS, Android, React Native, Flutter)
  - database-backend (SQL, PostgreSQL, APIs, server-side)
  - devops-infrastructure (Docker, Kubernetes, CI/CD, cloud)
  - testing-quality (testing, QA, debugging, test automation)
  - docs-architecture (documentation, system design, architecture)

content-writing:
  - blog-articles (blog posts, articles, web content)
  - creative-fiction (stories, novels, creative writing, poetry)
  - journalism-news (news, reporting, press releases)
  - technical-writing (technical docs, user guides, manuals)
  - copywriting (sales copy, ad copy, landing pages)
  - scripts-screenplays (video scripts, screenplays, dialogue)

marketing-advertising:
  - social-media (Facebook, Instagram, Twitter, TikTok, social posts)
  - email-marketing (email campaigns, newsletters, drip sequences)
  - content-marketing (content strategy, thought leadership)
  - paid-advertising (PPC, Google Ads, Facebook Ads, paid campaigns)
  - brand-strategy (branding, brand identity, positioning)
  - growth-analytics (growth hacking, analytics, A/B testing, conversion)
  - influencer-marketing (influencer partnerships, collaborations)

seo-research:
  - keyword-research (search volume, keyword difficulty, long-tail)
  - on-page-seo (meta tags, content optimization, internal linking)
  - link-building (backlinks, off-page SEO, link acquisition)
  - technical-seo (site speed, crawlability, schema markup)
  - competitive-analysis (competitor analysis, market research, SERP)

business-communication:
  - professional-emails (business emails, corporate communication)
  - presentations (pitch decks, slides, investor pitches)
  - reports-docs (business reports, white papers, case studies)
  - proposals-contracts (RFP responses, contracts, proposals)
  - meeting-materials (agendas, minutes, meeting notes)
  - client-communication (client emails, updates, stakeholder comm)

education-learning:
  - course-content (curriculum, syllabus, learning objectives)
  - tutorials (how-to guides, step-by-step instructions)
  - educational-videos (video lessons, e-learning, instructional)
  - study-guides (study materials, revision notes, exam prep)
  - lesson-plans (teaching plans, class activities, pedagogy)
  - assessments (quizzes, tests, evaluations, rubrics)

creative-design:
  - ui-ux-design (UI design, UX design, user interface, wireframes)
  - graphic-design (visual design, print design, posters, flyers)
  - branding-identity (logo design, brand guidelines, visual identity)
  - web-design (website layout, responsive design, landing pages)
  - visual-concepts (concept art, mood boards, art direction)
  - illustration-art (digital art, illustrations, vector art, icons)
  - motion-design (motion graphics, animation, video editing)

data-analytics:
  - data-analysis (data exploration, exploratory analysis, insights)
  - data-visualization (charts, graphs, dashboards, Tableau, Power BI)
  - statistical-analysis (hypothesis testing, regression, correlation)
  - business-intelligence (BI, reporting, data warehouse, ETL)
  - data-science-ml (predictive modeling, feature engineering, ML)
  - reporting-dashboards (KPI dashboards, metrics reporting, performance)

productivity-planning:
  - task-management (to-do lists, task tracking, checklists)
  - project-planning (project management, timelines, Gantt charts)
  - goals-okrs (goal setting, OKRs, objectives, key results)
  - brainstorming (ideation, mind mapping, creative thinking)
  - time-management (scheduling, time blocking, productivity tips)
  - workflow-optimization (process optimization, automation, efficiency)

general-other:
  - miscellaneous (general purpose, various topics)
  - multi-category (spans multiple categories, hybrid)
  - conversational (dialogue, chat, Q&A)
  - exploratory (experimental, exploratory, testing)
  - uncategorized (not yet categorized, undefined)

RULES:
1. Choose the MOST SPECIFIC subcategory that best matches the prompt
2. The subcategory MUST belong to its parent category
3. If uncertain, use general-other/uncategorized
4. Return ONLY valid JSON (no extra text, no markdown, no explanations)

JSON:`;
}

/**
 * Parse two-tier AI response (TASK-08)
 */
function parseTwoTierResponse(response: string): CategoryClassification {
  try {
    // Clean the response (remove markdown code blocks if present)
    const cleaned = response.trim().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    const category = parsed.category as PromptCategory;
    const subcategory = parsed.subcategory as PromptSubcategory;
    
    // Validate both are valid
    if (isValidCategory(category) && isValidSubcategory(subcategory)) {
      // Verify subcategory belongs to category
      if (SUBCATEGORY_CONFIG[subcategory].parentCategory === category) {
        return {
          category,
          subcategory,
          confidence: 0.85,
          reasoning: 'Two-tier AI classification'
        };
      } else {
        console.warn(`Subcategory ${subcategory} doesn't belong to category ${category}`);
      }
    }
    
    // Fallback: use category if valid, default subcategory
    if (isValidCategory(category)) {
      const defaultSubcat = getSubcategoriesByCategory(category)[0]?.id || PromptSubcategory.UNCATEGORIZED;
      return {
        category,
        subcategory: defaultSubcat,
        confidence: 0.6,
        reasoning: 'Category valid, subcategory defaulted'
      };
    }
    
    // Full fallback
    return {
      category: PromptCategory.GENERAL,
      subcategory: PromptSubcategory.UNCATEGORIZED,
      confidence: 0.3,
      reasoning: 'Validation failed, using defaults'
    };
    
  } catch (error) {
    console.error('Error parsing two-tier response:', error);
    return {
      category: PromptCategory.GENERAL,
      subcategory: PromptSubcategory.UNCATEGORIZED,
      confidence: 0.3,
      reasoning: 'Parse error, using defaults'
    };
  }
}

/**
 * Fallback categorization using keyword matching (TASK-08 Updated)
 * Used when AI categorization fails
 * Now also attempts to find subcategory
 */
function fallbackCategorization(initialPrompt: string): CategoryClassification {
  const promptLower = initialPrompt.toLowerCase();
  let bestCategory: PromptCategory = PromptCategory.GENERAL;
  let bestSubcategory: PromptSubcategory = PromptSubcategory.UNCATEGORIZED;
  let highestCategoryScore = 0;
  let highestSubcategoryScore = 0;

  // Score each category based on keyword matches
  for (const [category, config] of Object.entries(CATEGORY_CONFIG)) {
    let score = 0;
    
    for (const keyword of config.keywords) {
      if (promptLower.includes(keyword.toLowerCase())) {
        score++;
      }
    }

    if (score > highestCategoryScore) {
      highestCategoryScore = score;
      bestCategory = category as PromptCategory;
    }
  }

  // Score each subcategory based on keyword matches
  for (const [subcategory, config] of Object.entries(SUBCATEGORY_CONFIG)) {
    // Only consider subcategories that belong to the best category
    if (config.parentCategory === bestCategory) {
      let score = 0;
      
      for (const keyword of config.keywords) {
        if (promptLower.includes(keyword.toLowerCase())) {
          score++;
        }
      }

      if (score > highestSubcategoryScore) {
        highestSubcategoryScore = score;
        bestSubcategory = subcategory as PromptSubcategory;
      }
    }
  }

  // If no subcategory matched, use first subcategory of category
  if (highestSubcategoryScore === 0 && bestCategory !== PromptCategory.GENERAL) {
    const subcats = getSubcategoriesByCategory(bestCategory);
    bestSubcategory = subcats[0]?.id || PromptSubcategory.UNCATEGORIZED;
  }

  return {
    category: bestCategory,
    subcategory: bestSubcategory,
    confidence: highestCategoryScore > 0 ? 0.6 : 0.3,
    reasoning: 'Fallback keyword-based classification'
  };
}

/**
 * Batch categorize multiple prompts
 * Useful for migrating existing prompts
 */
export async function batchCategorizePrompts(
  prompts: Array<{ id: string; initialPrompt: string }>
): Promise<Array<{ id: string; category: PromptCategory }>> {
  const results = [];

  for (const prompt of prompts) {
    const classification = await categorizePrompt(prompt.initialPrompt);
    results.push({
      id: prompt.id,
      category: classification.category
    });

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Validate if a string is a valid category
 */
export function isValidCategory(category: string): category is PromptCategory {
  return Object.values(PromptCategory).includes(category as PromptCategory);
}

/**
 * Validate if a string is a valid subcategory (TASK-08)
 */
export function isValidSubcategory(subcat: string): subcat is PromptSubcategory {
  return Object.values(PromptSubcategory).includes(subcat as PromptSubcategory);
}

// =====================================================
// ANALYSIS MODE PROMPTS (TASK-07)
// =====================================================

/**
 * AI Mode: Generate questions AND auto-fill answers
 */
export const AI_MODE_ANALYSIS_PROMPT = `You are an expert prompt engineer. Analyze the following user prompt and generate 4-6 clarifying questions that would help refine it into a high-quality super prompt.

IMPORTANT: For each question, also provide an intelligent, well-reasoned answer based on:
- Context clues in the original prompt
- Best practices for similar tasks
- Common user intentions
- Industry standards

Return a JSON object with this EXACT structure:
{
  "questions": [
    {
      "question": "Clear, specific question",
      "suggestion": "Helpful example or placeholder"
    }
  ],
  "autoAnswers": {
    "0": "Your intelligent answer to question 1",
    "1": "Your intelligent answer to question 2",
    ...
  }
}

Guidelines for auto-answers:
- Be specific and actionable
- Make reasonable assumptions based on context
- Provide professional, industry-standard responses
- Consider the most common use case
- If uncertain, provide a safe, versatile answer

User's prompt: `;

/**
 * Normal Mode: Current behavior (questions only)
 */
export const NORMAL_MODE_ANALYSIS_PROMPT = `You are a Master Prompt Engineering Expert conducting critical analysis. Your task is to analyze the user's initial prompt through the lens of industry-standard prompt engineering techniques and identify missing context that would enable superior prompt transformation.

Analyze the prompt for gaps in these key areas:
- Role definition and persona specification
- Contextual background information
- Task decomposition and step clarity
- Constraint specification (boundaries, requirements, limitations)
- Output expectations and quality criteria
- Reasoning approach needs (Chain-of-Thought, Zero-shot)
- Target audience identification
- Tone, style, and voice requirements
- Format and structure preferences
- Examples or patterns needed (Few-shot applicability)
- Negative constraints (what to avoid)

Generate 4-6 targeted clarifying questions that will help the user provide the necessary information to apply prompt engineering techniques effectively. For each question, also provide a helpful suggestion or example.

Return ONLY a valid JSON array in this exact format:
[
  {
    "question": "Who is the target audience for this content?",
    "suggestion": "e.g., beginners, professionals, students, general public"
  },
  {
    "question": "What is the desired tone and style?",
    "suggestion": "e.g., formal, casual, technical, conversational, humorous"
  }
]

Focus on identifying gaps in:
- Target audience
- Desired tone and style
- Output format and structure
- Specific constraints or requirements
- Context and background information
- Expected length or scope

User's initial prompt: `;

/**
 * Extensive Mode: Deep analysis with 8-12 comprehensive questions
 */
export const EXTENSIVE_MODE_ANALYSIS_PROMPT = `You are an expert prompt engineer performing a COMPREHENSIVE, DEEP analysis. Generate 8-12 detailed clarifying questions that explore EVERY aspect of the user's request.

Cover ALL of these dimensions:
1. **Context & Background**: What's the bigger picture? What problem is being solved?
2. **Target Audience**: Who will consume/use this output? What's their expertise level?
3. **Tone & Voice**: Formal/casual? Professional/friendly? Technical/accessible?
4. **Format & Structure**: How should the output be organized? What format?
5. **Constraints & Limitations**: Word count, time limits, specific requirements?
6. **Goals & Objectives**: What does success look like? What should this achieve?
7. **Examples & References**: Are there examples to follow or avoid?
8. **Edge Cases & Scenarios**: What special situations should be considered?
9. **Deliverables & Outputs**: What exactly should be produced?
10. **Success Metrics**: How will quality be measured?

Return ONLY a JSON array of 8-12 questions with this structure:
[
  {
    "question": "Detailed, probing question",
    "suggestion": "Comprehensive example or guidance"
  }
]

Make questions:
- Specific and actionable
- Non-overlapping
- Progressively detailed
- Cover different aspects

User's prompt: `;

// Keep backward compatibility with existing code
export const ANALYSIS_PROMPT = NORMAL_MODE_ANALYSIS_PROMPT;

// Meta-prompt for generating the final super prompt
// Implements the full Master Prompt Engineering Expert methodology
export const GENERATION_PROMPT = `You are a Master Prompt Engineering Expert. Your core function is to act as an AI assistant capable of critically analyzing any prompt provided to you. Your ultimate objective is to transform these user-provided prompts into "super prompts." These super prompts must meticulously incorporate all industry-standard prompt engineering techniques to guide an AI towards the most optimal answers and solutions.

Your process involves a deep and critical analysis of the input prompt. This means identifying its strengths, weaknesses, potential ambiguities, and areas for enhancement. You will then strategically apply a comprehensive suite of prompt engineering methodologies, including but not limited to:

* Role-Playing: Assigning a specific, authoritative, and highly competent persona to the AI.
* Contextualization: Providing rich background information and setting the stage for the task.
* Task Decomposition: Breaking down complex requests into smaller, manageable steps.
* Constraint Definition: Clearly outlining any limitations, boundaries, or requirements.
* Exemplification (Few-Shot Learning): Illustrating desired input-output patterns where applicable and beneficial.
* Chain-of-Thought (CoT) Prompting: Encouraging step-by-step reasoning and explanation.
* Zero-Shot Prompting: Directing the AI to perform a task without prior examples, relying on its inherent knowledge.
* Persona Alignment: Ensuring the AI's responses are consistent with the defined persona.
* Instruction Clarity and Specificity: Removing vagueness and ensuring every instruction is precise.
* Output Control: Guiding the AI towards the desired nature and quality of the output, without dictating the exact format.
* Negative Constraints: Specifying what the AI should NOT do.
* Reinforcement of Key Goals: Emphasizing the primary objective of the prompt.

Your output will be a single, highly detailed, and optimized prompt that is significantly more effective than the original. This enhanced prompt will be designed to elicit the highest quality responses from an AI, ensuring it understands the nuances of the request and executes it with maximum precision and effectiveness.

CRITICAL OUTPUT INSTRUCTIONS:
- Return ONLY the final super prompt itself - the exact text that should be given to an AI
- DO NOT include any introductory text like "Here's a super prompt..." or "Okay, here's..."
- DO NOT include labels like "Super Prompt:" or similar headers
- DO NOT wrap the prompt in markdown code blocks or backticks
- DO NOT include explanations of what you did or why
- DO NOT include sections like "Explanation of Improvements and Reasoning"
- DO NOT include meta-commentary about the techniques you applied
- The output should be ONLY the ready-to-use super prompt that can be directly copied and pasted into any AI system

Based on the original user prompt and the additional context from their answers to clarifying questions, perform a critical analysis and create a super prompt.

Original prompt: `;
