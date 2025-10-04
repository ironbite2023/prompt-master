import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  SaveAnswerRequest, 
  SaveAnswerResponse, 
  PromptAnswersResponse,
} from '@/lib/types';

/**
 * GET /api/prompt-answers?promptId={id}
 * 
 * Retrieves all saved answers for a specific prompt
 * Ordered by creation date (newest first)
 */
export async function GET(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTHENTICATION
    // ============================================
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { answers: [], error: 'Unauthorized' } as PromptAnswersResponse,
        { status: 401 }
      );
    }

    // ============================================
    // 2. PARSE QUERY PARAMETERS
    // ============================================
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('promptId');

    if (!promptId) {
      return NextResponse.json(
        { answers: [], error: 'Prompt ID is required' } as PromptAnswersResponse,
        { status: 400 }
      );
    }

    // ============================================
    // 3. VERIFY PROMPT OWNERSHIP
    // ============================================
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('id')
      .eq('id', promptId)
      .eq('user_id', user.id)
      .single();

    if (promptError || !prompt) {
      return NextResponse.json(
        { answers: [], error: 'Prompt not found or access denied' } as PromptAnswersResponse,
        { status: 404 }
      );
    }

    // ============================================
    // 4. FETCH ANSWERS
    // ============================================
    const { data: answers, error } = await supabase
      .from('prompt_answers')
      .select('*')
      .eq('prompt_id', promptId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching answers:', error);
      throw error;
    }

    console.log(`📚 Retrieved ${answers?.length || 0} answers for prompt ${promptId}`);

    const response: PromptAnswersResponse = {
      answers: answers || []
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Fetch answers error:', error);
    return NextResponse.json(
      { 
        answers: [], 
        error: 'Failed to fetch answers. Please try again.' 
      } as PromptAnswersResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/prompt-answers
 * 
 * Saves a new answer from the Playground
 */
export async function POST(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTHENTICATION
    // ============================================
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as SaveAnswerResponse,
        { status: 401 }
      );
    }

    // ============================================
    // 2. PARSE AND VALIDATE REQUEST
    // ============================================
    const body: SaveAnswerRequest = await request.json();
    const { promptId, answerText, notes, tokensUsed, generationTime } = body;

    // Validate required fields
    if (!promptId || !answerText) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Prompt ID and answer text are required' 
        } as SaveAnswerResponse,
        { status: 400 }
      );
    }

    // Validate answer text length
    if (answerText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Answer text cannot be empty' } as SaveAnswerResponse,
        { status: 400 }
      );
    }

    // Validate notes length (if provided)
    if (notes && notes.length > 1000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Notes cannot exceed 1,000 characters' 
        } as SaveAnswerResponse,
        { status: 400 }
      );
    }

    // ============================================
    // 3. VERIFY PROMPT OWNERSHIP
    // ============================================
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('id')
      .eq('id', promptId)
      .eq('user_id', user.id)
      .single();

    if (promptError || !prompt) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Prompt not found or access denied' 
        } as SaveAnswerResponse,
        { status: 404 }
      );
    }

    // ============================================
    // 4. INSERT ANSWER
    // ============================================
    const { data, error } = await supabase
      .from('prompt_answers')
      .insert({
        prompt_id: promptId,
        user_id: user.id,
        answer_text: answerText,
        notes: notes || null,
        tokens_used: tokensUsed || null,
        generation_time_ms: generationTime || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving answer:', error);
      throw error;
    }

    console.log(`✅ Answer saved successfully: ${data.id}`);

    return NextResponse.json({
      success: true,
      answerId: data.id
    } as SaveAnswerResponse);

  } catch (error) {
    console.error('❌ Save answer error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save answer. Please try again.' 
      } as SaveAnswerResponse,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prompt-answers?id={answerId}
 * 
 * Deletes a specific saved answer
 */
export async function DELETE(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTHENTICATION
    // ============================================
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ============================================
    // 2. PARSE QUERY PARAMETERS
    // ============================================
    const { searchParams } = new URL(request.url);
    const answerId = searchParams.get('id');

    if (!answerId) {
      return NextResponse.json(
        { success: false, error: 'Answer ID is required' },
        { status: 400 }
      );
    }

    // ============================================
    // 3. DELETE ANSWER (RLS ensures ownership)
    // ============================================
    const { error } = await supabase
      .from('prompt_answers')
      .delete()
      .eq('id', answerId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting answer:', error);
      throw error;
    }

    console.log(`🗑️ Answer deleted: ${answerId}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Delete answer error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete answer. Please try again.' },
      { status: 500 }
    );
  }
}

