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

    return NextResponse.json({ prompts: prompts || [] });
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
  const { promptText, bucketId, category, subcategory } = body;

  // Validation
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

  // Save prompt with manual mode
  const { data, error } = await supabase
    .from('prompts')
    .insert({
      user_id: user.id,
      initial_prompt: promptText.trim(),
      questions: null,                    // No questions for quick save
      answers: null,                      // No answers for quick save  
      super_prompt: promptText.trim(),    // Same as initial for quick save
      bucket_id: bucketId,
      category: category,
      subcategory: subcategory || null,   // Optional subcategory
      analysis_mode: AnalysisMode.MANUAL  // 🆕 Mark as manual entry
    })
    .select()
    .single();

  if (error) {
    console.error('Database error during quick save:', error);
    throw error;
  }

  console.log(`✅ Quick saved prompt: ${data.id} (${category}${subcategory ? ' > ' + subcategory : ''})`);

  return NextResponse.json({ 
    success: true, 
    promptId: data.id 
  });
}

// 🔄 EXISTING: Handle Normal Save requests (refactored for clarity)
async function handleNormalSave(
  body: SavePromptRequest,
  user: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  supabase: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<NextResponse> {
  const { initialPrompt, questions, answers, superPrompt, bucketId, category } = body;

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

  const { data, error } = await supabase
    .from('prompts')
    .insert({
      user_id: user.id,
      initial_prompt: initialPrompt,
      questions: questions || [],
      answers: answers || {},
      super_prompt: superPrompt,
      bucket_id: bucketId,
      category: finalCategory,
      subcategory: finalSubcategory,
      analysis_mode: AnalysisMode.NORMAL  // Default for analyzed prompts
    })
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({ success: true, promptId: data.id });
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
