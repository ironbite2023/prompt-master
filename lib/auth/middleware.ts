import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

interface AuthResult {
  user: User;
  supabase: SupabaseClient;
}

export async function requireAuth(
  request: NextRequest
): Promise<NextResponse | AuthResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to continue.' },
      { status: 401 }
    );
  }

  return { user, supabase };
}
