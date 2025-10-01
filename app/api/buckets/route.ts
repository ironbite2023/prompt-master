import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { CreateBucketRequest, UpdateBucketRequest } from '@/lib/types';

// GET - Fetch user's buckets with statistics
export async function GET(): Promise<NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user, supabase } = authResult;

  try {
    const { data: buckets, error } = await supabase
      .from('buckets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Add prompt counts and last used dates
    const bucketsWithStats = await Promise.all(
      (buckets || []).map(async (bucket) => {
        const { data: promptData } = await supabase
          .from('prompts')
          .select('created_at')
          .eq('bucket_id', bucket.id)
          .order('created_at', { ascending: false });
        
        return {
          ...bucket,
          promptCount: promptData?.length || 0,
          lastUsedDate: promptData?.[0]?.created_at || null,
        };
      })
    );

    return NextResponse.json({ buckets: bucketsWithStats });
  } catch (error) {
    console.error('Error fetching buckets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buckets' },
      { status: 500 }
    );
  }
}

// POST - Create new bucket
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user, supabase } = authResult;

  try {
    const body: CreateBucketRequest = await request.json();
    const { name, color = '#8B5CF6', icon = 'folder' } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bucket name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const { data: existing } = await supabase
      .from('buckets')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name.trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A bucket with this name already exists' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('buckets')
      .insert({
        user_id: user.id,
        name: name.trim(),
        color,
        icon,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, bucket: data });
  } catch (error) {
    console.error('Error creating bucket:', error);
    return NextResponse.json(
      { error: 'Failed to create bucket' },
      { status: 500 }
    );
  }
}

// PUT - Update bucket
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user, supabase } = authResult;

  try {
    const body: UpdateBucketRequest = await request.json();
    const { id, name, color, icon } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Bucket ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, string> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name.trim();
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;

    const { data, error } = await supabase
      .from('buckets')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, bucket: data });
  } catch (error) {
    console.error('Error updating bucket:', error);
    return NextResponse.json(
      { error: 'Failed to update bucket' },
      { status: 500 }
    );
  }
}

// DELETE - Delete bucket and reassign prompts
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user, supabase } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const bucketId = searchParams.get('id');
    const reassignTo = searchParams.get('reassignTo');

    if (!bucketId) {
      return NextResponse.json(
        { error: 'Bucket ID is required' },
        { status: 400 }
      );
    }

    // Check if user has more than one bucket
    const { data: buckets, error: countError } = await supabase
      .from('buckets')
      .select('id')
      .eq('user_id', user.id);

    if (countError) throw countError;

    if (buckets && buckets.length <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete your last bucket' },
        { status: 400 }
      );
    }

    // If reassignTo is provided, reassign prompts
    if (reassignTo) {
      const { error: updateError } = await supabase
        .from('prompts')
        .update({ bucket_id: reassignTo })
        .eq('bucket_id', bucketId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    }

    // Delete the bucket
    const { error: deleteError } = await supabase
      .from('buckets')
      .delete()
      .eq('id', bucketId)
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bucket:', error);
    return NextResponse.json(
      { error: 'Failed to delete bucket' },
      { status: 500 }
    );
  }
}
