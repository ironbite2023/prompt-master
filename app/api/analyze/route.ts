import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, DEFAULT_MODEL } from '@/lib/gemini';
import { ANALYSIS_PROMPT } from '@/lib/prompts';
import { Question } from '@/lib/types';
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
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Invalid prompt provided' },
        { status: 400 }
      );
    }

    // Initialize Gemini client
    const ai = getGeminiClient();

    // Generate clarifying questions
    const fullPrompt = ANALYSIS_PROMPT + prompt;
    
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: fullPrompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

    // Extract the response text
    const responseText = response.text;
    
    if (!responseText) {
      throw new Error('No response from AI model');
    }

    // Parse JSON response
    let questions: Question[];
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      questions = JSON.parse(cleanedText);
      
      // Validate the response format
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions format');
      }
      
      // Ensure each question has the required fields
      questions = questions.map((q) => ({
        question: q.question || '',
        suggestion: q.suggestion || ''
      }));
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return default questions as fallback
      questions = [
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
    }

    console.log(`[API] User ${user.id} analyzed prompt successfully`);

    return NextResponse.json({ questions });

  } catch (error) {
    console.error('Error in analyze API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to analyze prompt: ${errorMessage}` },
      { status: 500 }
    );
  }
}
