import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, DEFAULT_MODEL } from '@/lib/gemini';
import {
  AI_MODE_ANALYSIS_PROMPT,
  NORMAL_MODE_ANALYSIS_PROMPT,
  EXTENSIVE_MODE_ANALYSIS_PROMPT,
} from '@/lib/prompts';
import { Question, AnalysisMode, AnalyzeResponse } from '@/lib/types';
import { requireAuth } from '@/lib/auth/middleware';
import { getModeConfig } from '@/lib/modeConfig';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Check authentication
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult; // Return 401 error
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    const { prompt, mode = AnalysisMode.NORMAL } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Invalid prompt provided' },
        { status: 400 }
      );
    }

    // Validate mode
    if (!Object.values(AnalysisMode).includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid analysis mode' },
        { status: 400 }
      );
    }

    // Get mode configuration
    const config = getModeConfig(mode);

    // Select appropriate prompt template
    let analysisPrompt: string;
    switch (mode) {
      case AnalysisMode.AI:
        analysisPrompt = AI_MODE_ANALYSIS_PROMPT;
        break;
      case AnalysisMode.EXTENSIVE:
        analysisPrompt = EXTENSIVE_MODE_ANALYSIS_PROMPT;
        break;
      case AnalysisMode.NORMAL:
      default:
        analysisPrompt = NORMAL_MODE_ANALYSIS_PROMPT;
        break;
    }

    // Initialize Gemini client
    const ai = getGeminiClient();

    // Generate clarifying questions
    const fullPrompt = analysisPrompt + prompt;
    
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: fullPrompt,
      config: {
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens,
      }
    });

    // Extract the response text
    const responseText = response.text;
    
    if (!responseText) {
      throw new Error('No response from AI model');
    }

    // Parse response based on mode
    let questions: Question[];
    let autoAnswers: Record<number, string> | undefined;

    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      if (mode === AnalysisMode.AI) {
        // AI Mode: Parse both questions and autoAnswers
        const parsed = JSON.parse(cleanedText);
        questions = parsed.questions || [];
        autoAnswers = parsed.autoAnswers || {};
      } else {
        // Normal/Extensive Mode: Parse questions only
        questions = JSON.parse(cleanedText);
      }
      
      // Validate the response format
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions format');
      }

      // Validate question count based on mode
      if (questions.length < config.minQuestions) {
        throw new Error(`Expected at least ${config.minQuestions} questions for ${mode} mode`);
      }

      // Trim to max if needed
      if (questions.length > config.maxQuestions) {
        questions = questions.slice(0, config.maxQuestions);
      }
      
      // Ensure each question has the required fields
      questions = questions.map((q) => ({
        question: q.question || '',
        suggestion: q.suggestion || ''
      }));
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Return mode-appropriate fallback questions
      questions = getFallbackQuestions(mode);
      
      if (mode === AnalysisMode.AI) {
        autoAnswers = getFallbackAutoAnswers();
      }
    }

    console.log(`[API] User ${user.id} analyzed prompt with ${mode} mode`);

    const apiResponse: AnalyzeResponse = {
      questions,
      mode,
      ...(autoAnswers && { autoAnswers }),
    };

    return NextResponse.json(apiResponse);

  } catch (error) {
    console.error('Error in analyze API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to analyze prompt: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Get fallback questions based on mode
 */
function getFallbackQuestions(mode: AnalysisMode): Question[] {
  const baseQuestions: Question[] = [
    {
      question: 'Who is the target audience for this content?',
      suggestion: 'e.g., beginners, professionals, students, general public'
    },
    {
      question: 'What tone and style should be used?',
      suggestion: 'e.g., formal, casual, technical, conversational'
    },
    {
      question: 'What format should the output be in?',
      suggestion: 'e.g., essay, bullet points, step-by-step guide'
    },
    {
      question: 'Are there any specific constraints or requirements?',
      suggestion: 'e.g., word count, specific topics to include/avoid'
    }
  ];

  if (mode === AnalysisMode.EXTENSIVE) {
    return [
      ...baseQuestions,
      {
        question: 'What is the primary goal or objective?',
        suggestion: 'e.g., educate, persuade, inform, entertain'
      },
      {
        question: 'What is the context or background for this request?',
        suggestion: 'e.g., project type, industry, use case'
      },
      {
        question: 'Are there any examples or references to follow?',
        suggestion: 'e.g., similar content, style guides, templates'
      },
      {
        question: 'What are the success criteria?',
        suggestion: 'e.g., engagement metrics, clarity, completeness'
      }
    ];
  }

  return baseQuestions;
}

/**
 * Get fallback auto-answers for AI mode
 */
function getFallbackAutoAnswers(): Record<number, string> {
  return {
    0: 'General audience with moderate familiarity with the topic',
    1: 'Professional yet accessible tone, balancing expertise with clarity',
    2: 'Well-structured format with clear sections and actionable points',
    3: 'Comprehensive coverage while maintaining readability and engagement'
  };
}
