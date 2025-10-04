# TASK-04: Prompt Bucket Categorization System

**Created:** October 1, 2025  
**Status:** Planning Complete - Ready for Implementation  
**Priority:** High  
**Estimated Effort:** 6-8 hours

---

## Table of Contents
1. [Overview](#overview)
2. [Request Analysis](#request-analysis)
3. [Justification & Benefits](#justification--benefits)
4. [Prerequisites](#prerequisites)
5. [Implementation Steps](#implementation-steps)
6. [Testing Checklist](#testing-checklist)
7. [Success Criteria](#success-criteria)

---

## Overview

This task implements a comprehensive bucket categorization system for the Prompt Master application, allowing users to organize their prompts into categories (e.g., "Personal", "Work", custom categories). Users will be required to select a bucket before saving any prompt to their history.

**Key Features:**
- Bucket creation, editing, and deletion
- Default buckets: "Personal" and "Work"
- Custom bucket creation with color coding
- Bucket-based filtering on history page
- Enforced bucket selection during prompt save

---

## Request Analysis

**What the user requested:**
- Implement a bucket/category system for prompt organization
- Initially provide "Personal" and "Work" buckets
- Require users to specify bucket before saving to history
- Allow separation of prompts by context/purpose

**Implicit Requirements:**
- Ability to create custom buckets beyond default ones
- Visual distinction between buckets (colors/icons)
- Filtering capability on history page
- Bucket management interface
- Data migration for existing prompts

---

## Justification & Benefits

### Why Implement Bucket Categorization?

1. **Improved Organization**
   - Users can separate professional from personal prompts
   - Easier to find specific prompts in growing history
   - Mental model aligns with real-world categorization

2. **Context Switching**
   - Users working on both personal and professional projects can maintain clear boundaries
   - Reduces cognitive load when searching for prompts

3. **Scalability**
   - As users accumulate prompts, categorization becomes essential
   - Prevents "prompt clutter" in history view

4. **Privacy & Professionalism**
   - Keep work-related prompts separate from personal ones
   - Important for professional users and consultants

5. **Enhanced User Experience**
   - Filtering and searching becomes more efficient
   - Users can focus on relevant prompt categories

---

## Prerequisites

### Technical Knowledge Required
- Supabase database migrations and RLS policies
- TypeScript interface definitions and type safety
- React state management and hooks
- Next.js API routes and server-side operations
- TailwindCSS for styling

### Current System Understanding
- ✅ Supabase authentication is implemented
- ✅ `prompts` table exists with user_id foreign key
- ✅ RLS policies are in place for prompts
- ✅ API routes handle CRUD operations
- ✅ UI components use TypeScript and Tailwind

### Dependencies
- Supabase client library
- React hooks (useState, useEffect, useCallback)
- Lucide React icons
- Next.js 14+ with App Router

---

## Implementation Steps

### Step 1: Database Schema Migration

**Objective:** Create the `buckets` table and update `prompts` table with bucket relationship

#### 1.1 Create Buckets Table

**SQL Migration:**

```sql
-- Create buckets table
CREATE TABLE IF NOT EXISTS public.buckets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#8B5CF6',
    icon TEXT DEFAULT 'folder',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name)
);

-- Create index for faster queries
CREATE INDEX idx_buckets_user_id ON public.buckets(user_id);

-- Enable Row Level Security
ALTER TABLE public.buckets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own buckets
CREATE POLICY "Users can view their own buckets"
    ON public.buckets
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own buckets
CREATE POLICY "Users can insert their own buckets"
    ON public.buckets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own buckets
CREATE POLICY "Users can update their own buckets"
    ON public.buckets
    FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own buckets
CREATE POLICY "Users can delete their own buckets"
    ON public.buckets
    FOR DELETE
    USING (auth.uid() = user_id);
```

#### 1.2 Update Prompts Table

**SQL Migration:**

```sql
-- Add bucket_id column to prompts table (nullable initially for migration)
ALTER TABLE public.prompts 
ADD COLUMN bucket_id UUID REFERENCES public.buckets(id) ON DELETE SET NULL;

-- Create index for faster bucket-based queries
CREATE INDEX idx_prompts_bucket_id ON public.prompts(bucket_id);
```

#### 1.3 Create Default Buckets & Migrate Existing Data

**SQL Migration:**

```sql
-- Function to create default buckets for all existing users
CREATE OR REPLACE FUNCTION create_default_buckets_for_users()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    personal_bucket_id UUID;
BEGIN
    -- Loop through all users who have prompts but no buckets
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM public.prompts 
        WHERE user_id IS NOT NULL
    LOOP
        -- Create Personal bucket
        INSERT INTO public.buckets (user_id, name, color, icon)
        VALUES (user_record.user_id, 'Personal', '#8B5CF6', 'user')
        RETURNING id INTO personal_bucket_id;
        
        -- Create Work bucket
        INSERT INTO public.buckets (user_id, name, color, icon)
        VALUES (user_record.user_id, 'Work', '#EA580C', 'briefcase');
        
        -- Assign all existing prompts to Personal bucket
        UPDATE public.prompts
        SET bucket_id = personal_bucket_id
        WHERE user_id = user_record.user_id AND bucket_id IS NULL;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_default_buckets_for_users();

-- Drop the function as it's no longer needed
DROP FUNCTION create_default_buckets_for_users();
```

#### 1.4 Create Trigger for New Users

**SQL Migration:**

```sql
-- Function to create default buckets for new users
CREATE OR REPLACE FUNCTION create_default_buckets_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create Personal bucket
    INSERT INTO public.buckets (user_id, name, color, icon)
    VALUES (NEW.id, 'Personal', '#8B5CF6', 'user');
    
    -- Create Work bucket
    INSERT INTO public.buckets (user_id, name, color, icon)
    VALUES (NEW.id, 'Work', '#EA580C', 'briefcase');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default buckets when a new profile is created
CREATE TRIGGER on_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_buckets_for_new_user();
```

#### 1.5 Make bucket_id Required (After Migration)

**SQL Migration:**

```sql
-- After all existing prompts have bucket_id, make it NOT NULL
ALTER TABLE public.prompts 
ALTER COLUMN bucket_id SET NOT NULL;
```

---

### Step 2: Update TypeScript Types

**Objective:** Add type definitions for buckets and update existing interfaces

**File:** `lib/types.ts`

**Add the following interfaces:**

```typescript
// Bucket interface
export interface Bucket {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

// Update SavedPrompt interface to include bucket information
export interface SavedPrompt {
  id: string;
  user_id: string;
  initial_prompt: string;
  questions: Question[] | null;
  answers: Record<number, string> | null;
  super_prompt: string;
  bucket_id: string;
  created_at: string;
  bucket?: Bucket; // Optional joined bucket data
}

// Update SavePromptRequest to require bucketId
export interface SavePromptRequest {
  initialPrompt: string;
  questions: Question[];
  answers: Record<number, string>;
  superPrompt: string;
  bucketId: string; // NEW: Required bucket selection
}

// Bucket API responses
export interface BucketsResponse {
  buckets: Bucket[];
  error?: string;
}

export interface CreateBucketRequest {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateBucketRequest {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
}

export interface DeleteBucketRequest {
  bucketId: string;
  reassignToBucketId: string; // Required: where to move prompts
}

export interface BucketResponse {
  success: boolean;
  bucket?: Bucket;
  error?: string;
}
```

---

### Step 3: Create Buckets API Routes

**Objective:** Implement CRUD operations for buckets

**File:** `app/api/buckets/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { CreateBucketRequest, UpdateBucketRequest } from '@/lib/types';

// GET - Fetch user's buckets
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

    return NextResponse.json({ buckets: buckets || [] });
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

    const updateData: any = { updated_at: new Date().toISOString() };
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
```

---

### Step 4: Update Prompts API

**Objective:** Modify prompts API to handle bucket associations

**File:** `app/api/prompts/route.ts`

**Update the GET function:**

```typescript
// GET - Fetch user's prompts (with optional bucket filter)
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user, supabase } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const bucketId = searchParams.get('bucketId');

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
```

**Update the POST function:**

```typescript
// POST - Save new prompt
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user, supabase } = authResult;

  try {
    const body: SavePromptRequest = await request.json();
    const { initialPrompt, questions, answers, superPrompt, bucketId } = body;

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

    const { data, error } = await supabase
      .from('prompts')
      .insert({
        user_id: user.id,
        initial_prompt: initialPrompt,
        questions: questions || [],
        answers: answers || {},
        super_prompt: superPrompt,
        bucket_id: bucketId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, promptId: data.id });
  } catch (error) {
    console.error('Error saving prompt:', error);
    return NextResponse.json(
      { error: 'Failed to save prompt' },
      { status: 500 }
    );
  }
}
```

---

### Step 5: Create Bucket Selector Component

**Objective:** Create a reusable component for selecting buckets

**File:** `components/BucketSelector.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Bucket } from '@/lib/types';
import { Folder, Plus, Briefcase, User, Heart, Lightbulb, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface BucketSelectorProps {
  selectedBucketId: string | null;
  onSelect: (bucketId: string) => void;
  onCreateBucket?: (bucket: Bucket) => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  folder: Folder,
  briefcase: Briefcase,
  user: User,
  heart: Heart,
  lightbulb: Lightbulb,
};

const BucketSelector: React.FC<BucketSelectorProps> = ({
  selectedBucketId,
  onSelect,
  onCreateBucket,
}) => {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newBucketName, setNewBucketName] = useState<string>('');
  const [newBucketColor, setNewBucketColor] = useState<string>('#8B5CF6');
  const [newBucketIcon, setNewBucketIcon] = useState<string>('folder');
  const [creating, setCreating] = useState<boolean>(false);

  useEffect(() => {
    fetchBuckets();
  }, []);

  const fetchBuckets = async (): Promise<void> => {
    try {
      const response = await fetch('/api/buckets');
      const data = await response.json();

      if (response.ok) {
        setBuckets(data.buckets);
        // Auto-select first bucket if none selected
        if (!selectedBucketId && data.buckets.length > 0) {
          onSelect(data.buckets[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching buckets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBucket = async (): Promise<void> => {
    if (!newBucketName.trim() || creating) return;

    setCreating(true);

    try {
      const response = await fetch('/api/buckets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newBucketName.trim(),
          color: newBucketColor,
          icon: newBucketIcon,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to create bucket');
        return;
      }

      setBuckets([...buckets, data.bucket]);
      onSelect(data.bucket.id);
      if (onCreateBucket) {
        onCreateBucket(data.bucket);
      }

      // Reset form
      setNewBucketName('');
      setNewBucketColor('#8B5CF6');
      setNewBucketIcon('folder');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating bucket:', error);
      alert('Failed to create bucket');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Select Bucket <span className="text-red-400">*</span>
      </label>

      <div className="grid grid-cols-2 gap-2">
        {buckets.map((bucket) => {
          const IconComponent = iconMap[bucket.icon] || Folder;
          const isSelected = selectedBucketId === bucket.id;

          return (
            <button
              key={bucket.id}
              type="button"
              onClick={() => onSelect(bucket.id)}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <IconComponent
                size={18}
                style={{ color: bucket.color }}
              />
              <span className="text-sm font-medium text-gray-200 truncate">
                {bucket.name}
              </span>
            </button>
          );
        })}

        {!showCreateForm && (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-gray-600 bg-gray-800/30 hover:border-purple-500 hover:bg-purple-500/10 transition-all"
          >
            <Plus size={18} className="text-purple-400" />
            <span className="text-sm font-medium text-purple-400">
              New Bucket
            </span>
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">Create New Bucket</h4>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              <X size={18} />
            </button>
          </div>

          <input
            type="text"
            value={newBucketName}
            onChange={(e) => setNewBucketName(e.target.value)}
            placeholder="Bucket name"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            maxLength={50}
          />

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Color</label>
              <input
                type="color"
                value={newBucketColor}
                onChange={(e) => setNewBucketColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>

            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Icon</label>
              <select
                value={newBucketIcon}
                onChange={(e) => setNewBucketIcon(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="folder">Folder</option>
                <option value="briefcase">Briefcase</option>
                <option value="user">User</option>
                <option value="heart">Heart</option>
                <option value="lightbulb">Lightbulb</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateBucket}
            disabled={!newBucketName.trim() || creating}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {creating ? 'Creating...' : 'Create Bucket'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BucketSelector;
```

---

### Step 6: Update Stage3SuperPrompt Component

**Objective:** Integrate bucket selection into the save prompt flow

**File:** `components/Stage3SuperPrompt.tsx`

**Key Changes:**

1. Import BucketSelector component
2. Add state for selected bucket
3. Show bucket selector before allowing save
4. Pass bucketId when saving

```typescript
'use client';

import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Sparkles, Save } from 'lucide-react';
import { Question } from '@/lib/types';
import { useAuth } from './providers/AuthProvider';
import BucketSelector from './BucketSelector';

interface Stage3SuperPromptProps {
  superPrompt: string;
  onStartOver: () => void;
  initialPrompt: string;
  questions: Question[];
  answers: Record<number, string>;
}

const Stage3SuperPrompt: React.FC<Stage3SuperPromptProps> = ({
  superPrompt,
  onStartOver,
  initialPrompt,
  questions,
  answers
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
  const [showBucketSelector, setShowBucketSelector] = useState<boolean>(false);
  const { user } = useAuth();

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(superPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = superPrompt;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveClick = (): void => {
    setShowBucketSelector(true);
  };

  const handleSave = async (): Promise<void> => {
    if (!user || saving || saved || !selectedBucketId) return;

    setSaving(true);

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialPrompt,
          questions,
          answers,
          superPrompt,
          bucketId: selectedBucketId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save prompt');
      }

      setSaved(true);
      setShowBucketSelector(false);
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Failed to save prompt. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-purple-pink mb-4 animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Your Super Prompt is Ready!
        </h2>
        <p className="text-gray-400">
          Copy this optimized prompt and use it with any AI model
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-300">Generated Super Prompt</h3>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-white"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
        </div>

        <div
          className="w-full min-h-[300px] max-h-[500px] overflow-y-auto px-4 py-3 bg-gray-900/80 border border-gray-600 rounded-lg text-foreground whitespace-pre-wrap"
          role="textbox"
          aria-readonly="true"
          aria-label="Generated super prompt"
        >
          {superPrompt}
        </div>

        {/* Bucket Selection Modal */}
        {showBucketSelector && user && !saved && (
          <div className="mt-6 bg-gray-900/80 border border-purple-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">
              Choose a bucket to save this prompt
            </h3>
            <BucketSelector
              selectedBucketId={selectedBucketId}
              onSelect={setSelectedBucketId}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={!selectedBucketId || saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-white shadow-lg"
              >
                {saving ? (
                  <>
                    <Save className="w-5 h-5 animate-pulse" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save to Bucket</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowBucketSelector(false)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-medium text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {user && !saved && !showBucketSelector && (
            <button
              onClick={handleSaveClick}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-colors font-medium text-white shadow-lg"
              aria-label="Save prompt to history"
            >
              <Save className="w-5 h-5" />
              <span>Save to History</span>
            </button>
          )}
          
          {saved && (
            <div className="flex items-center gap-2 px-6 py-3 bg-green-600/20 border border-green-500/30 rounded-lg font-medium text-green-400">
              <Check className="w-5 h-5" />
              <span>Saved to History</span>
            </div>
          )}

          <button
            onClick={onStartOver}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-medium text-white shadow-lg"
            aria-label="Start over with new prompt"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Start Over</span>
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <p className="text-sm text-purple-200 text-center">
          💡 <strong>Tip:</strong> Test this super prompt with different AI models like ChatGPT, Claude, or Gemini to see which produces the best results!
        </p>
      </div>
    </div>
  );
};

export default Stage3SuperPrompt;
```

---

### Step 7: Update History Page with Bucket Filtering

**Objective:** Add bucket filtering and display to the history page

**File:** `app/history/page.tsx`

**Key Changes:**

1. Add bucket filtering tabs
2. Display bucket badges on prompt cards
3. Show bucket statistics
4. Fetch and display buckets

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { SavedPrompt, Bucket } from '@/lib/types';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Clock, Trash2, Eye, Folder, Settings } from 'lucide-react';
import PromptDetailModal from '@/components/PromptDetailModal';

const HistoryPage: React.FC = () => {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchBuckets();
      fetchPrompts();
    }
  }, [user, selectedBucketId]);

  const fetchBuckets = async (): Promise<void> => {
    try {
      const response = await fetch('/api/buckets');
      const data = await response.json();

      if (response.ok) {
        setBuckets(data.buckets);
      }
    } catch (error) {
      console.error('Error fetching buckets:', error);
    }
  };

  const fetchPrompts = async (): Promise<void> => {
    try {
      const url = selectedBucketId
        ? `/api/prompts?bucketId=${selectedBucketId}`
        : '/api/prompts';

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setPrompts(data.prompts);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (promptId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return;
    }

    try {
      const response = await fetch(`/api/prompts?id=${promptId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPrompts(prompts.filter((p) => p.id !== promptId));
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Failed to delete prompt');
    }
  };

  const getBucketPromptCount = (bucketId: string): number => {
    return prompts.filter((p) => p.bucket_id === bucketId).length;
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Prompt History
            </h1>
            <button
              onClick={() => router.push('/settings/buckets')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-white"
            >
              <Settings size={16} />
              <span>Manage Buckets</span>
            </button>
          </div>

          {/* Bucket Filter Tabs */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedBucketId(null)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedBucketId === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All Prompts ({prompts.length})
            </button>

            {buckets.map((bucket) => {
              const count = getBucketPromptCount(bucket.id);
              return (
                <button
                  key={bucket.id}
                  onClick={() => setSelectedBucketId(bucket.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedBucketId === bucket.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Folder size={16} style={{ color: bucket.color }} />
                  <span>{bucket.name}</span>
                  <span className="text-xs opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {prompts.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 text-center">
              <p className="text-gray-400 text-lg">
                {selectedBucketId
                  ? 'No prompts in this bucket yet.'
                  : 'No saved prompts yet. Create your first super prompt to get started!'}
              </p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Create Prompt
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {prompts.map((prompt) => {
                const bucket = buckets.find((b) => b.id === prompt.bucket_id);
                
                return (
                  <div
                    key={prompt.id}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-600 transition-all"
                  >
                    {/* Bucket Badge */}
                    {bucket && (
                      <div
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium mb-3"
                        style={{
                          backgroundColor: `${bucket.color}20`,
                          color: bucket.color,
                        }}
                      >
                        <Folder size={12} />
                        {bucket.name}
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-gray-300 line-clamp-3 mb-2">
                        {prompt.initial_prompt}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        {new Date(prompt.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPrompt(prompt)}
                        className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(prompt.id)}
                        className="flex items-center justify-center gap-2 bg-red-600/20 text-red-400 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {selectedPrompt && (
        <PromptDetailModal
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
        />
      )}
    </>
  );
};

export default HistoryPage;
```

---

### Step 8: Create Bucket Management Page (Optional)

**Objective:** Create a dedicated page for managing buckets

**File:** `app/settings/buckets/page.tsx`

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Bucket } from '@/lib/types';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Folder, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

const BucketManagementPage: React.FC = () => {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingBucket, setEditingBucket] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; color: string; icon: string }>({
    name: '',
    color: '',
    icon: '',
  });
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchBuckets();
    }
  }, [user]);

  const fetchBuckets = async (): Promise<void> => {
    try {
      const response = await fetch('/api/buckets');
      const data = await response.json();

      if (response.ok) {
        setBuckets(data.buckets);
      }
    } catch (error) {
      console.error('Error fetching buckets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bucket: Bucket): void => {
    setEditingBucket(bucket.id);
    setEditForm({
      name: bucket.name,
      color: bucket.color,
      icon: bucket.icon,
    });
  };

  const handleSaveEdit = async (bucketId: string): Promise<void> => {
    try {
      const response = await fetch('/api/buckets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bucketId,
          ...editForm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to update bucket');
        return;
      }

      setBuckets(buckets.map((b) => (b.id === bucketId ? data.bucket : b)));
      setEditingBucket(null);
    } catch (error) {
      console.error('Error updating bucket:', error);
      alert('Failed to update bucket');
    }
  };

  const handleDelete = async (bucketId: string): Promise<void> => {
    if (buckets.length <= 1) {
      alert('Cannot delete your last bucket');
      return;
    }

    if (!confirm('Delete this bucket? All prompts will be moved to another bucket.')) {
      return;
    }

    // Get another bucket to reassign prompts to
    const reassignTo = buckets.find((b) => b.id !== bucketId);
    if (!reassignTo) return;

    try {
      const response = await fetch(
        `/api/buckets?id=${bucketId}&reassignTo=${reassignTo.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to delete bucket');
        return;
      }

      setBuckets(buckets.filter((b) => b.id !== bucketId));
    } catch (error) {
      console.error('Error deleting bucket:', error);
      alert('Failed to delete bucket');
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
            Manage Buckets
          </h1>

          <div className="space-y-4">
            {buckets.map((bucket) => (
              <div
                key={bucket.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
              >
                {editingBucket === bucket.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white"
                    />
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-400 mb-2">Color</label>
                        <input
                          type="color"
                          value={editForm.color}
                          onChange={(e) =>
                            setEditForm({ ...editForm, color: e.target.value })
                          }
                          className="w-full h-10 rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-gray-400 mb-2">Icon</label>
                        <select
                          value={editForm.icon}
                          onChange={(e) =>
                            setEditForm({ ...editForm, icon: e.target.value })
                          }
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white"
                        >
                          <option value="folder">Folder</option>
                          <option value="briefcase">Briefcase</option>
                          <option value="user">User</option>
                          <option value="heart">Heart</option>
                          <option value="lightbulb">Lightbulb</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(bucket.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                      >
                        <Save size={16} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingBucket(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Folder size={24} style={{ color: bucket.color }} />
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {bucket.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Created {new Date(bucket.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(bucket)}
                        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(bucket.id)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/history')}
            className="mt-8 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
          >
            Back to History
          </button>
        </div>
      </main>
    </>
  );
};

export default BucketManagementPage;
```

---

## Testing Checklist

### Database Testing
- [ ] Verify `buckets` table created successfully
- [ ] Verify RLS policies work correctly
- [ ] Test default buckets created for existing users
- [ ] Test trigger creates buckets for new users
- [ ] Verify foreign key constraints work
- [ ] Test bucket deletion with prompt reassignment

### API Testing
- [ ] Test GET /api/buckets - fetch user buckets
- [ ] Test POST /api/buckets - create new bucket
- [ ] Test PUT /api/buckets - update bucket
- [ ] Test DELETE /api/buckets - delete bucket with reassignment
- [ ] Test GET /api/prompts - fetch prompts by bucket
- [ ] Test POST /api/prompts - save prompt with bucket
- [ ] Verify bucket validation on save

### UI Testing
- [ ] Test bucket selector displays correctly
- [ ] Test inline bucket creation in selector
- [ ] Test bucket selection before save
- [ ] Test save prompt with selected bucket
- [ ] Test history page bucket filtering
- [ ] Test bucket badges display on prompt cards
- [ ] Test bucket management page (create/edit/delete)
- [ ] Test responsive design on mobile

### Edge Cases
- [ ] Test preventing deletion of last bucket
- [ ] Test duplicate bucket name prevention
- [ ] Test saving without bucket selection (should fail)
- [ ] Test reassignment when deleting bucket with prompts
- [ ] Test long bucket names (truncation)
- [ ] Test special characters in bucket names
- [ ] Test color picker functionality
- [ ] Test with no prompts in a bucket

### User Experience
- [ ] Verify smooth workflow from prompt generation to save
- [ ] Test loading states during bucket operations
- [ ] Test error messages are clear and helpful
- [ ] Verify bucket colors display consistently
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility

---

## Success Criteria

### ✅ Database Migration Complete
- `buckets` table created with proper schema
- RLS policies enforced for user isolation
- Default buckets created for all users
- Existing prompts assigned to default bucket
- Triggers set up for new user onboarding

### ✅ Bucket Selection Enforced
- Users cannot save without selecting a bucket
- Clear, intuitive UI for bucket selection
- Ability to create new bucket during save flow
- Validation prevents invalid bucket selections

### ✅ History Filtering Works
- Users can filter prompts by bucket
- "All Prompts" view shows everything
- Bucket badges visible on prompt cards
- Smooth filtering without page reload
- Accurate prompt counts per bucket

### ✅ Bucket Management Functional
- Users can create custom buckets
- Users can edit bucket details (name, color, icon)
- Users can delete buckets with prompt reassignment
- Cannot delete the last remaining bucket
- Duplicate bucket names prevented

### ✅ Type Safety Maintained
- All TypeScript interfaces updated
- No type errors in the codebase
- Proper validation on frontend and backend
- Type safety for API requests/responses

### ✅ User Experience
- Intuitive workflow that doesn't disrupt current UX
- Responsive design on all screen sizes
- Proper loading states and error handling
- Accessible UI components
- Visual feedback for all actions

---

## Implementation Order

1. **Database First** - Apply all migrations
2. **Types** - Update TypeScript definitions
3. **API Routes** - Implement bucket and prompt APIs
4. **Components** - Build UI components
5. **Integration** - Update existing pages
6. **Testing** - Comprehensive testing
7. **Documentation** - Update user-facing docs

---

## Notes

- All colors use hex format for consistency
- Icons are limited to predefined set for simplicity
- Bucket deletion requires prompt reassignment to prevent orphaned data
- Default buckets are created via database trigger for new users
- RLS policies ensure users can only access their own buckets

---

**Status:** ✅ Plan Complete - Ready for Implementation  
**Next Step:** Begin with Step 1 - Database Schema Migration
