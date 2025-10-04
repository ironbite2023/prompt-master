import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGeminiClient, DEFAULT_MODEL, getCreativeConfig, GEMINI_CONFIG } from '@/lib/gemini';
import { PlaygroundTestRequest, PlaygroundTestResponse } from '@/lib/types';

/**
 * POST /api/playground/test
 * 
 * Executes a prompt in the Playground using Gemini AI
 * Returns the complete generated answer
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // ============================================
    // 1. AUTHENTICATION
    // ============================================
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', generationTime: 0 } as PlaygroundTestResponse,
        { status: 401 }
      );
    }

    // ============================================
    // 2. PARSE AND VALIDATE REQUEST
    // ============================================
    const body: PlaygroundTestRequest = await request.json();
    const { promptId, promptText } = body;

    // Validate prompt text
    if (!promptText || typeof promptText !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt text is required', generationTime: 0, answer: '' } as PlaygroundTestResponse,
        { status: 400 }
      );
    }

    const trimmedPrompt = promptText.trim();
    if (trimmedPrompt.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt text cannot be empty', generationTime: 0, answer: '' } as PlaygroundTestResponse,
        { status: 400 }
      );
    }

    if (trimmedPrompt.length > 10000) {
      return NextResponse.json(
        { success: false, error: 'Prompt text exceeds maximum length of 10,000 characters', generationTime: 0, answer: '' } as PlaygroundTestResponse,
        { status: 400 }
      );
    }

    // ============================================
    // 3. VERIFY PROMPT OWNERSHIP
    // ============================================
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('id, original_idea')
      .eq('id', promptId)
      .eq('user_id', user.id)
      .single();

    if (promptError || !prompt) {
      console.error('Prompt fetch error:', promptError);
      return NextResponse.json(
        { success: false, error: 'Prompt not found or access denied', generationTime: 0, answer: '' } as PlaygroundTestResponse,
        { status: 404 }
      );
    }

    // ============================================
    // 4. GENERATE ANSWER WITH GEMINI
    // ============================================
    console.log(`🎮 Playground: Generating answer for prompt ${promptId}`);
    
    // Initialize Gemini client
    const ai = getGeminiClient();
    
    // Generate the answer using centralized config (lib/gemini.ts)
    const geminiResponse = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: trimmedPrompt,
      config: getCreativeConfig(GEMINI_CONFIG.maxOutputTokens.playground)
    });

    // Extract the response text
    const answer = geminiResponse.text;
    
    if (!answer || !answer.trim()) {
      throw new Error('No response from AI model');
    }

    const generationTime = Date.now() - startTime;

    console.log(`✅ Playground: Answer generated in ${generationTime}ms`);

    // ============================================
    // 5. RETURN RESPONSE
    // ============================================
    const response: PlaygroundTestResponse = {
      success: true,
      answer,
      generationTime,
      // Note: Gemini API doesn't always return token count
      // tokensUsed would require additional API call
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Playground test error:', error);
    
    // Handle specific Gemini errors
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to generate response. Please try again.';

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        generationTime: Date.now() - startTime,
        answer: ''
      } as PlaygroundTestResponse,
      { status: 500 }
    );
  }
}

