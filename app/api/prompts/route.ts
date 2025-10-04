import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { SavePromptRequest, PromptCategory, PromptSubcategory, QuickSavePromptRequest, AnalysisMode } from '@/lib/types';
import { categorizePrompt } from '@/lib/prompts';

// GET - Fetch user's prompts (with optional filters)
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user, supabase } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const bucketId = searchParams.get('bucketId');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory'); // TASK-08: Add subcategory filter

    let query = supabase
      .from('prompts')
      .select(`
        *,
        bucket:buckets(*)
      `)
      .eq('user_id', user.id);

    // Filter by bucket if provided
    if (bucketId) {
      query = query.eq('bucket_id', bucketId);
    }

    // Filter by category if provided (TASK-06)
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Filter by subcategory if provided (TASK-08)
    if (subcategory && subcategory !== 'all') {
      query = query.eq('subcategory', subcategory);
    }

    const { data: prompts, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Map database fields to expected TypeScript interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedPrompts = (prompts || []).map((prompt: any) => ({
      id: prompt.id,
      user_id: prompt.user_id,
      title: prompt.title,
      initial_prompt: prompt.original_idea,
      super_prompt: prompt.optimized_prompt,
      bucket_id: prompt.bucket_id,
      questions: prompt.questionnaire_data?.questions || null,
      answers: prompt.questionnaire_data?.answers || null,
      category: prompt.questionnaire_data?.category || 'general-other',
      subcategory: prompt.questionnaire_data?.subcategory || null,
      analysis_mode: prompt.questionnaire_data?.analysisMode || 'manual',
      created_at: prompt.created_at,
      bucket: prompt.bucket
    }));

    return NextResponse.json({ prompts: mappedPrompts });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

// POST - Save new prompt (handles both quick save and normal save)
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user, supabase } = authResult;

  try {
    const body = await request.json();
    
    // 🆕 DETECT REQUEST TYPE: Quick Save vs Normal Save
    const isQuickSave = 'promptText' in body;
    
    if (isQuickSave) {
      // 🆕 QUICK SAVE WORKFLOW
      return await handleQuickSave(body as QuickSavePromptRequest, user, supabase);
    } else {
      // 🔄 EXISTING NORMAL SAVE WORKFLOW
      return await handleNormalSave(body as SavePromptRequest, user, supabase);
    }
  } catch (error) {
    console.error('Error in prompts API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// 🆕 NEW: Handle Quick Save requests
async function handleQuickSave(
  body: QuickSavePromptRequest,
  user: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  supabase: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<NextResponse> {
  const { title, promptText, bucketId, category } = body;

  // 🆕 VALIDATION: Title
  if (!title || title.trim().length < 3) {
    return NextResponse.json(
      { error: 'Title must be at least 3 characters' },
      { status: 400 }
    );
  }

  if (title.trim().length > 100) {
    return NextResponse.json(
      { error: 'Title must not exceed 100 characters' },
      { status: 400 }
    );
  }

  // Validation: Prompt text
  if (!promptText || promptText.trim().length < 10) {
    return NextResponse.json(
      { error: 'Prompt text must be at least 10 characters' },
      { status: 400 }
    );
  }

  if (!bucketId) {
    return NextResponse.json(
      { error: 'Bucket selection is required' },
      { status: 400 }
    );
  }

  if (!category) {
    return NextResponse.json(
      { error: 'Category selection is required' },
      { status: 400 }
    );
  }

  // Verify bucket belongs to user
  const { data: bucket, error: bucketError } = await supabase
    .from('buckets')
    .select('id')
    .eq('id', bucketId)
    .eq('user_id', user.id)
    .single();

  if (bucketError || !bucket) {
    return NextResponse.json(
      { error: 'Invalid bucket selection' },
      { status: 400 }
    );
  }

  // Save prompt with manual mode - USE RAW SQL to bypass PostgREST schema cache
  // Convert user.id to string to match RLS policy requirement
  const userId = typeof user.id === 'string' ? user.id : user.id?.toString();
  
  console.log(`🔐 Attempting save - user_id: ${userId}, bucket_id: ${bucketId}`);
  
  // Use RPC/SQL query instead of .from() to bypass schema cache issues
  const { data, error } = await supabase
    .rpc('insert_prompt_manual', {
      p_user_id: userId,
      p_title: title.trim(),
      p_original_idea: promptText.trim(),
      p_optimized_prompt: promptText.trim(),
      p_bucket_id: bucketId
    });

  if (error) {
    console.error('Database error during quick save:', error);
    throw error;
  }

  // RPC functions return arrays, so get first result
  const savedPrompt = Array.isArray(data) ? data[0] : data;
  console.log(`✅ Quick saved prompt: ${savedPrompt.id} - "${title}"`);

  return NextResponse.json({ 
    success: true, 
    promptId: savedPrompt.id 
  });
}

// 🔄 EXISTING: Handle Normal Save requests (refactored for clarity)
async function handleNormalSave(
  body: SavePromptRequest,
  user: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  supabase: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<NextResponse> {
  const { title, initialPrompt, questions, answers, superPrompt, bucketId, category } = body;

  // 🆕 VALIDATION: Title
  if (!title || title.trim().length < 3) {
    return NextResponse.json(
      { error: 'Title must be at least 3 characters' },
      { status: 400 }
    );
  }

  if (title.trim().length > 100) {
    return NextResponse.json(
      { error: 'Title must not exceed 100 characters' },
      { status: 400 }
    );
  }

  if (!initialPrompt || !superPrompt) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  if (!bucketId) {
    return NextResponse.json(
      { error: 'Bucket selection is required' },
      { status: 400 }
    );
  }

  // Verify bucket belongs to user
  const { data: bucket, error: bucketError } = await supabase
    .from('buckets')
    .select('id')
    .eq('id', bucketId)
    .eq('user_id', user.id)
    .single();

  if (bucketError || !bucket) {
    return NextResponse.json(
      { error: 'Invalid bucket selection' },
      { status: 400 }
    );
  }

  // 🆕 AUTOMATIC CATEGORIZATION (existing logic)
  let finalCategory: PromptCategory;
  let finalSubcategory: PromptSubcategory | undefined;
  
  if (category) {
    finalCategory = category;
  } else {
    console.log('Auto-categorizing prompt with two-tier classification...');
    const classification = await categorizePrompt(initialPrompt);
    finalCategory = classification.category;
    finalSubcategory = classification.subcategory;
    console.log(`Categorized as: ${finalCategory} > ${finalSubcategory} (confidence: ${classification.confidence})`);
  }

  // Store questions/answers in questionnaire_data JSONB field
  const questionnaireData = {
    questions: questions || [],
    answers: answers || {},
    category: finalCategory,
    subcategory: finalSubcategory,
    analysisMode: AnalysisMode.NORMAL
  };

  // Convert user.id to string to match RLS policy requirement
  const userId = typeof user.id === 'string' ? user.id : user.id?.toString();
  
  console.log(`🔐 Attempting normal save - user_id: ${userId}, bucket_id: ${bucketId}`);

  // Use RPC/SQL query instead of .from() to bypass PostgREST schema cache issues
  const { data, error } = await supabase
    .rpc('insert_prompt_normal', {
      p_user_id: userId,
      p_title: title.trim(),
      p_original_idea: initialPrompt,
      p_optimized_prompt: superPrompt,
      p_bucket_id: bucketId,
      p_questionnaire_data: questionnaireData
    });

  if (error) throw error;

  // RPC functions return arrays, so get first result
  const savedPrompt = Array.isArray(data) ? data[0] : data;
  console.log(`✅ Saved prompt: ${savedPrompt.id} - "${title}"`);

  return NextResponse.json({ success: true, promptId: savedPrompt.id });
}

// DELETE - Delete prompt by ID
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user, supabase } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('id');

    if (!promptId) {
      return NextResponse.json(
        { error: 'Prompt ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', promptId)
      .eq('user_id', user.id); // Ensure user owns the prompt

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
