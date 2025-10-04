import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { PromptAnswer } from '@/lib/types';

/**
 * =====================================================
 * EXPORT API ENDPOINT
 * =====================================================
 * GET /api/export
 * 
 * Query Parameters:
 * - scope: 'prompt' | 'bucket' | 'all' (required)
 * - promptId: UUID (required if scope='prompt')
 * - bucketId: UUID (required if scope='bucket')
 * 
 * Returns:
 * {
 *   success: boolean,
 *   data: PromptWithAnswers[],
 *   count: number,
 *   error?: string
 * }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // ========================================
  // 1. AUTHENTICATION CHECK
  // ========================================
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user, supabase } = authResult;
  
  try {
    // ========================================
    // 2. PARSE AND VALIDATE PARAMETERS
    // ========================================
    const searchParams = request.nextUrl.searchParams;
    const scope = searchParams.get('scope') as 'prompt' | 'bucket' | 'all';
    const promptId = searchParams.get('promptId');
    const bucketId = searchParams.get('bucketId');
    
    // Validate scope
    if (!scope || !['prompt', 'bucket', 'all'].includes(scope)) {
      return NextResponse.json(
        { success: false, error: 'Invalid scope. Must be: prompt, bucket, or all' }, 
        { status: 400 }
      );
    }
    
    // Validate required IDs based on scope
    if (scope === 'prompt' && !promptId) {
      return NextResponse.json(
        { success: false, error: 'promptId required for prompt scope' }, 
        { status: 400 }
      );
    }
    
    if (scope === 'bucket' && !bucketId) {
      return NextResponse.json(
        { success: false, error: 'bucketId required for bucket scope' }, 
        { status: 400 }
      );
    }
    
    // ========================================
    // 3. BUILD QUERY BASED ON SCOPE
    // ========================================
    let query = supabase
      .from('prompts')
      .select(`
        *,
        buckets (
          id,
          name,
          description,
          color,
          icon,
          is_default
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    // Apply scope filters
    if (scope === 'prompt' && promptId) {
      query = query.eq('id', promptId);
    } else if (scope === 'bucket' && bucketId) {
      query = query.eq('bucket_id', bucketId);
    }
    // For 'all' scope, no additional filters needed
    
    // ========================================
    // 4. FETCH PROMPTS
    // ========================================
    const { data: prompts, error: promptsError } = await query;
    
    if (promptsError) {
      console.error('❌ Error fetching prompts:', promptsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch prompts' }, 
        { status: 500 }
      );
    }
    
    if (!prompts || prompts.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      });
    }
    
    // ========================================
    // 5. FETCH PROMPT ANSWERS
    // ========================================
    const promptIds = prompts.map(p => p.id);
    
    const { data: answers, error: answersError } = await supabase
      .from('prompt_answers')
      .select('*')
      .in('prompt_id', promptIds)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    
    if (answersError) {
      console.error('⚠️ Error fetching answers (non-fatal):', answersError);
      // Continue without answers rather than failing entire export
    }
    
    // ========================================
    // 6. GROUP ANSWERS BY PROMPT ID
    // ========================================
    const answersByPromptId: Record<string, PromptAnswer[]> = {};
    
    (answers || []).forEach(answer => {
      if (!answersByPromptId[answer.prompt_id]) {
        answersByPromptId[answer.prompt_id] = [];
      }
      answersByPromptId[answer.prompt_id].push(answer);
    });
    
    // ========================================
    // 7. COMBINE DATA FOR EXPORT
    // ========================================
    const exportData = prompts.map(prompt => ({
      prompt: {
        id: prompt.id,
        title: prompt.title,
        original_idea: prompt.original_idea,
        optimized_prompt: prompt.optimized_prompt,
        questionnaire_data: prompt.questionnaire_data,
        analysis_data: prompt.analysis_data,
        variables_used: prompt.variables_used,
        tags: prompt.tags,
        usage_count: prompt.usage_count,
        is_favorite: prompt.is_favorite,
        created_at: prompt.created_at,
        updated_at: prompt.updated_at,
      },
      bucket: prompt.buckets || null,
      answers: answersByPromptId[prompt.id] || []
    }));
    
    // ========================================
    // 8. RETURN SUCCESS RESPONSE
    // ========================================
    console.log(`✅ Export prepared: ${exportData.length} prompt(s)`);
    
    return NextResponse.json({ 
      success: true,
      data: exportData,
      count: exportData.length
    });
    
  } catch (error) {
    console.error('❌ Export API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

