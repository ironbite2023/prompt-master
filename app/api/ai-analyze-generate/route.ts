import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, DEFAULT_MODEL, getAnalysisConfig, getCreativeConfig, GEMINI_CONFIG } from '@/lib/gemini';
import { AI_MODE_ANALYSIS_PROMPT, GENERATION_PROMPT } from '@/lib/prompts';
import { Question, AnalysisMode } from '@/lib/types';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * AI Mode: Combined analysis + generation endpoint
 * Skips user input completely - analyzes prompt, auto-fills answers, and generates super prompt
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Invalid prompt provided' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    // Step 1: Analyze and generate questions + auto-answers
    console.log(`[AI-MODE] User ${user.id} - Step 1: Analyzing prompt`);
    
    const analysisResponse = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: AI_MODE_ANALYSIS_PROMPT + prompt,
      config: getAnalysisConfig(GEMINI_CONFIG.maxOutputTokens.analysis)
    });

    let questions: Question[];
    let autoAnswers: Record<number, string>;

    try {
      if (!analysisResponse.text) {
        throw new Error('No response from AI model');
      }

      const cleaned = analysisResponse.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsed = JSON.parse(cleaned);
      questions = parsed.questions || [];
      autoAnswers = parsed.autoAnswers || {};

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions format');
      }

      console.log(`[AI-MODE] User ${user.id} - Generated ${questions.length} questions with auto-answers`);
    } catch (parseError) {
      console.error('Failed to parse AI analysis:', parseError);
      throw new Error('Failed to analyze prompt');
    }

    // Step 2: Generate super prompt using auto-answers
    console.log(`[AI-MODE] User ${user.id} - Step 2: Generating super prompt`);
    
    const questionsAndAnswers = questions.map((q, index) => ({
      question: q.question,
      answer: autoAnswers[index] || '',
    }));

    const qaText = questionsAndAnswers
      .map((qa, i) => `${i + 1}. Q: ${qa.question}\n   A: ${qa.answer}`)
      .join('\n\n');

    const generationPromptText = GENERATION_PROMPT + prompt + '\n\nQuestions and Answers:\n' + qaText;

    const generationResponse = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: generationPromptText,
      config: getCreativeConfig(GEMINI_CONFIG.maxOutputTokens.generation)
    });

    const superPrompt = generationResponse.text || '';

    if (!superPrompt) {
      throw new Error('No super prompt generated');
    }

    console.log(`[AI-MODE] User ${user.id} - Successfully generated super prompt (${superPrompt.length} chars)`);

    // Return everything for transparency
    return NextResponse.json({
      questions,
      autoAnswers,
      superPrompt,
      mode: AnalysisMode.AI,
    });

  } catch (error) {
    console.error('Error in AI mode analyze-generate:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `AI mode failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
