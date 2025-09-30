import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, DEFAULT_MODEL } from '@/lib/gemini';
import { GENERATION_PROMPT } from '@/lib/prompts';
import { requireAuth } from '@/lib/auth/middleware';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Check authentication
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult; // Return 401 error
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    const { initialPrompt, questionsAndAnswers } = body;

    if (!initialPrompt || typeof initialPrompt !== 'string' || !initialPrompt.trim()) {
      return NextResponse.json(
        { error: 'Invalid initial prompt provided' },
        { status: 400 }
      );
    }

    if (!Array.isArray(questionsAndAnswers)) {
      return NextResponse.json(
        { error: 'Invalid questions and answers format' },
        { status: 400 }
      );
    }

    // Initialize Gemini client
    const ai = getGeminiClient();

    // Build the context for generation
    let contextText = GENERATION_PROMPT + initialPrompt + '\n\n';
    contextText += 'Additional context from clarifying questions:\n';
    
    questionsAndAnswers.forEach((qa, index) => {
      if (qa.answer && qa.answer.trim()) {
        contextText += `\n${index + 1}. ${qa.question}\n`;
        contextText += `Answer: ${qa.answer}\n`;
      }
    });

    contextText += '\n\nNow generate the comprehensive super prompt:';

    // Generate the super prompt
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: contextText,
      config: {
        temperature: 0.7,  // Slightly lower for more consistent, focused quality
        maxOutputTokens: 8192,  // Higher limit for comprehensive super prompts
      }
    });

    // Extract the response text
    const superPrompt = response.text;
    
    if (!superPrompt || !superPrompt.trim()) {
      throw new Error('No response from AI model');
    }

    console.log(`[API] User ${user.id} generated super prompt successfully`);

    return NextResponse.json({ superPrompt: superPrompt.trim() });

  } catch (error) {
    console.error('Error in generate API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to generate super prompt: ${errorMessage}` },
      { status: 500 }
    );
  }
}
