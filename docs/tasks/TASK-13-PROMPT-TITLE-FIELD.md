# TASK-13: Add Title Field to Prompts

**Status:** 📋 Ready for Implementation  
**Priority:** High  
**Complexity:** Medium  
**Estimated Time:** 2-3 hours

---

## 📋 Overview

### Objective
Add a `title` field to all prompts, allowing users to give each prompt a memorable, descriptive title for easier identification and organization in the history page.

### Problem Statement
Currently, the history page only displays truncated snippets of the `initial_prompt` text, making it difficult for users to:
- Quickly identify specific prompts
- Distinguish between similar prompts
- Remember the purpose of saved prompts
- Organize and navigate their prompt library efficiently

### Solution
Implement a required `title` field that:
- Appears in both save workflows (Normal Save and Quick Save)
- Displays prominently in the history page
- Supports 3-100 characters with validation
- Provides auto-suggestions based on prompt content
- Maintains backward compatibility with existing prompts

---

## 🎯 Success Criteria

- [x] Database migration adds `title` column with defaults for existing data
- [x] TypeScript types updated across all interfaces
- [x] API endpoints validate and store titles
- [x] Stage3SuperPrompt includes title input with validation
- [x] QuickSaveModal includes title input with validation
- [x] History page displays titles prominently
- [x] PromptDetailModal shows titles
- [x] All existing prompts have default titles
- [x] No breaking changes to existing functionality

---

## 📊 Database Changes

### Migration SQL

**File:** `prompt-master/docs/database/TITLE_FIELD_MIGRATION.sql`

```sql
-- =====================================================
-- MIGRATION: Add title field to prompts table
-- Date: October 4, 2025
-- Purpose: Enable users to add custom titles for better prompt organization
-- =====================================================

-- Step 1: Add title column (nullable initially for migration)
ALTER TABLE public.prompts
ADD COLUMN title TEXT;

-- Step 2: Set default titles for existing prompts
-- Use first 60 characters of initial_prompt, clean up whitespace
UPDATE public.prompts
SET title = CASE 
  WHEN LENGTH(TRIM(initial_prompt)) <= 60 
    THEN TRIM(initial_prompt)
  ELSE SUBSTRING(TRIM(initial_prompt) FROM 1 FOR 57) || '...'
END
WHERE title IS NULL;

-- Step 3: Make title NOT NULL now that all rows have values
ALTER TABLE public.prompts
ALTER COLUMN title SET NOT NULL;

-- Step 4: Add check constraint for title length
ALTER TABLE public.prompts
ADD CONSTRAINT prompts_title_length_check 
CHECK (LENGTH(TRIM(title)) >= 3 AND LENGTH(TRIM(title)) <= 100);

-- Step 5: Create index for future search functionality
CREATE INDEX idx_prompts_title ON public.prompts USING gin(to_tsvector('english', title));

-- Step 6: Add comment for documentation
COMMENT ON COLUMN public.prompts.title IS 'User-provided descriptive title for the prompt (3-100 characters)';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify column was added
SELECT column_name, data_type, is_nullable, character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'prompts' 
  AND column_name = 'title';

-- Verify all prompts have titles
SELECT 
  COUNT(*) as total_prompts,
  COUNT(title) as prompts_with_title,
  MIN(LENGTH(title)) as shortest_title,
  MAX(LENGTH(title)) as longest_title
FROM public.prompts;

-- Sample titles (verify quality)
SELECT id, title, SUBSTRING(initial_prompt, 1, 50) as prompt_preview
FROM public.prompts
LIMIT 10;

-- Verify index was created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'prompts' 
  AND indexname = 'idx_prompts_title';
```

---

## 🔧 TypeScript Type Updates

### File: `lib/types.ts`

**Update Location:** Line 121-134 (SavedPrompt interface)

```typescript
export interface SavedPrompt {
  id: string;
  user_id: string;
  title: string;                    // 🆕 NEW: User-provided title
  initial_prompt: string;
  questions: Question[] | null;
  answers: Record<number, string> | null;
  super_prompt: string;
  bucket_id: string;
  category: PromptCategory;
  subcategory?: PromptSubcategory | null;
  analysis_mode: AnalysisMode;
  created_at: string;
  bucket?: Bucket;
}
```

**Update Location:** Line 142-149 (SavePromptRequest interface)

```typescript
export interface SavePromptRequest {
  title: string;                    // 🆕 NEW: Required title field
  initialPrompt: string;
  questions: Question[];
  answers: Record<number, string>;
  superPrompt: string;
  bucketId: string;
  category?: PromptCategory;
}
```

**Update Location:** Line 412-417 (QuickSavePromptRequest interface)

```typescript
export interface QuickSavePromptRequest {
  title: string;                    // 🆕 NEW: Required title field
  promptText: string;
  bucketId: string;
  category: PromptCategory;
  subcategory?: PromptSubcategory;
}
```

---

## 🔌 API Endpoint Updates

### File: `app/api/prompts/route.ts`

#### Update 1: GET Endpoint (Line 7-56)

**Change:** Ensure title is included in SELECT query

```typescript
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user, supabase } = authResult;

  try {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        bucket:buckets (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ prompts: data });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}
```

#### Update 2: handleQuickSave Function (Line 90-162)

**Changes:**
1. Extract title from request body
2. Validate title
3. Include in INSERT query

```typescript
async function handleQuickSave(
  body: QuickSavePromptRequest,
  user: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  supabase: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<NextResponse> {
  const { title, promptText, bucketId, category, subcategory } = body;

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

  // Save prompt with manual mode
  const { data, error } = await supabase
    .from('prompts')
    .insert({
      user_id: user.id,
      title: title.trim(),              // 🆕 NEW: Include title
      initial_prompt: promptText.trim(),
      questions: null,
      answers: null,
      super_prompt: promptText.trim(),
      bucket_id: bucketId,
      category: category,
      subcategory: subcategory || null,
      analysis_mode: AnalysisMode.MANUAL
    })
    .select()
    .single();

  if (error) {
    console.error('Database error during quick save:', error);
    throw error;
  }

  console.log(`✅ Quick saved prompt: ${data.id} - "${title}" (${category}${subcategory ? ' > ' + subcategory : ''})`);

  return NextResponse.json({ 
    success: true, 
    promptId: data.id 
  });
}
```

#### Update 3: handleNormalSave Function (Line 165-234)

**Changes:**
1. Extract title from request body
2. Validate title
3. Include in INSERT query

```typescript
async function handleNormalSave(
  body: SavePromptRequest,
  user: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  supabase: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<NextResponse> {
  const { title, initialPrompt, questions, answers, superPrompt, bucketId, category, subcategory } = body;

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

  // AUTOMATIC CATEGORIZATION
  let finalCategory: PromptCategory;
  let finalSubcategory: PromptSubcategory | undefined;
  
  if (category) {
    finalCategory = category;
  } else {
    console.log('Auto-categorizing prompt with two-tier classification...');
    const classification = await categorizePrompt(initialPrompt);
    finalCategory = classification.category;
    finalSubcategory = classification.subcategory;
    console.log(`Categorized as: ${finalCategory}${finalSubcategory ? ' > ' + finalSubcategory : ''} (confidence: ${classification.confidence})`);
  }

  const { data, error } = await supabase
    .from('prompts')
    .insert({
      user_id: user.id,
      title: title.trim(),              // 🆕 NEW: Include title
      initial_prompt: initialPrompt,
      questions: questions || [],
      answers: answers || {},
      super_prompt: superPrompt,
      bucket_id: bucketId,
      category: finalCategory,
      subcategory: finalSubcategory,
      analysis_mode: AnalysisMode.NORMAL
    })
    .select()
    .single();

  if (error) throw error;

  console.log(`✅ Saved prompt: ${data.id} - "${title}"`);

  return NextResponse.json({ success: true, promptId: data.id });
}
```

---

## 🎨 UI Component Updates

### 1. Stage3SuperPrompt Component

**File:** `components/Stage3SuperPrompt.tsx`

**Add state and helper function (after line 17):**

```typescript
const Stage3SuperPrompt: React.FC<Stage3SuperPromptProps> = ({
  superPrompt,
  onStartOver,
  initialPrompt,
  questions,
  answers,
  mode
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
  const [showBucketSelector, setShowBucketSelector] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');           // 🆕 NEW: Title state
  const [titleError, setTitleError] = useState<string>(''); // 🆕 NEW: Title error state
  const { user } = useAuth();

  // 🆕 NEW: Generate smart title suggestion from initial prompt
  const suggestTitle = useCallback((): string => {
    const cleaned = initialPrompt.trim()
      .replace(/\n/g, ' ')           // Replace newlines with spaces
      .replace(/\s+/g, ' ')          // Collapse multiple spaces
      .replace(/[^\w\s-]/g, '');     // Remove special chars except dash
    
    if (cleaned.length <= 60) {
      return cleaned;
    }
    
    // Find last complete word within 60 chars
    const truncated = cleaned.substring(0, 60);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 40) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated.substring(0, 57) + '...';
  }, [initialPrompt]);

  // 🆕 NEW: Auto-fill title when modal opens
  React.useEffect(() => {
    if (showBucketSelector && !title) {
      setTitle(suggestTitle());
    }
  }, [showBucketSelector, title, suggestTitle]);

  // 🆕 NEW: Validate title
  const validateTitle = useCallback((value: string): boolean => {
    const trimmed = value.trim();
    
    if (trimmed.length < 3) {
      setTitleError('Title must be at least 3 characters');
      return false;
    }
    
    if (trimmed.length > 100) {
      setTitleError('Title must not exceed 100 characters');
      return false;
    }
    
    setTitleError('');
    return true;
  }, []);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setTitle(value);
    validateTitle(value);
  }, [validateTitle]);
```

**Update handleSave function (around line 60):**

```typescript
const handleSave = useCallback(async (): Promise<void> => {
  if (!user || saving || saved || !selectedBucketId) return;

  // 🆕 Validate title before saving
  if (!validateTitle(title)) {
    return;
  }

  setSaving(true);

  try {
    const response = await fetch('/api/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title.trim(),        // 🆕 NEW: Include title
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
}, [user, saving, saved, selectedBucketId, title, validateTitle, initialPrompt, questions, answers, superPrompt]);
```

**Add UI for title input in bucket selector modal (around line 200-230):**

```typescript
{showBucketSelector && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Save Prompt</h3>
      
      {/* 🆕 NEW: Title Input */}
      <div className="mb-4">
        <label htmlFor="prompt-title" className="block text-sm font-medium text-gray-300 mb-2">
          Prompt Title <span className="text-red-400">*</span>
        </label>
        <input
          id="prompt-title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="e.g., Blog Post Generator, SEO Analysis Tool..."
          maxLength={100}
          className={`w-full bg-gray-900 border ${
            titleError ? 'border-red-500' : 'border-gray-700'
          } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
        />
        {titleError && (
          <p className="mt-1 text-sm text-red-400">{titleError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {title.length}/100 characters
        </p>
      </div>

      {/* Existing Bucket Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Bucket <span className="text-red-400">*</span>
        </label>
        <BucketSelector
          selectedBucketId={selectedBucketId}
          onSelectBucket={setSelectedBucketId}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowBucketSelector(false);
            setTitle('');
            setTitleError('');
          }}
          disabled={saving}
          className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !selectedBucketId || !title.trim() || !!titleError}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  </div>
)}
```

---

### 2. QuickSaveModal Component

**File:** `components/QuickSaveModal.tsx`

**Update state (line 22-27):**

```typescript
const QuickSaveModal: React.FC<QuickSaveModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');                           // 🆕 NEW: Title state
  const [promptText, setPromptText] = useState('');
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<PromptSubcategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string>('');        // 🆕 NEW: Title error
```

**Add validation function (after handleCategoryChange):**

```typescript
// 🆕 NEW: Validate title
const validateTitle = useCallback((value: string): boolean => {
  const trimmed = value.trim();
  
  if (trimmed.length < 3) {
    setTitleError('Title must be at least 3 characters');
    return false;
  }
  
  if (trimmed.length > 100) {
    setTitleError('Title must not exceed 100 characters');
    return false;
  }
  
  setTitleError('');
  return true;
}, []);

const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
  const value = e.target.value;
  setTitle(value);
  validateTitle(value);
}, [validateTitle]);

// 🆕 NEW: Auto-suggest title from prompt text
const suggestTitleFromPrompt = useCallback((): void => {
  if (title || !promptText.trim()) return;
  
  const firstLine = promptText.trim().split('\n')[0];
  const cleaned = firstLine
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  const suggested = cleaned.length <= 60 
    ? cleaned 
    : cleaned.substring(0, 57) + '...';
  
  setTitle(suggested);
  validateTitle(suggested);
}, [title, promptText, validateTitle]);
```

**Update canSave validation (line 37-41):**

```typescript
// Form validation
const canSave = 
  title.trim().length >= 3 &&          // 🆕 NEW: Title validation
  !titleError &&                        // 🆕 NEW: No title errors
  promptText.trim().length >= 10 &&
  selectedBucketId !== null &&
  selectedCategory !== null &&
  !saving;
```

**Update handleSave (line 43-70):**

```typescript
const handleSave = async (): Promise<void> => {
  if (!canSave) return;

  // Final validation
  if (!validateTitle(title)) {
    return;
  }

  setSaving(true);
  setError(null);

  try {
    await onSave({
      title: title.trim(),              // 🆕 NEW: Include title
      promptText: promptText.trim(),
      bucketId: selectedBucketId!,
      category: selectedCategory!,
      subcategory: selectedSubcategory || undefined
    });

    // Reset form on success
    setTitle('');
    setPromptText('');
    setSelectedBucketId(null);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setTitleError('');
    onClose();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to save prompt';
    setError(errorMessage);
    console.error('Quick save error:', err);
  } finally {
    setSaving(false);
  }
};
```

**Update form reset in useEffect (line 78-85):**

```typescript
React.useEffect(() => {
  if (isOpen) {
    setTitle('');
    setPromptText('');
    setSelectedBucketId(null);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setError(null);
    setTitleError('');
  }
}, [isOpen]);
```

**Add title input in modal UI (around line 100-120, before prompt text area):**

```typescript
<div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
  {error && <ErrorMessage message={error} />}
  
  {/* 🆕 NEW: Title Input */}
  <div>
    <label htmlFor="prompt-title-quick" className="block text-sm font-medium text-gray-300 mb-2">
      Prompt Title <span className="text-red-400">*</span>
    </label>
    <input
      id="prompt-title-quick"
      type="text"
      value={title}
      onChange={handleTitleChange}
      placeholder="e.g., Marketing Email Template, Code Review Checklist..."
      maxLength={100}
      className={`w-full bg-gray-900 border ${
        titleError ? 'border-red-500' : 'border-gray-700'
      } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
    />
    {titleError ? (
      <p className="mt-1 text-sm text-red-400">{titleError}</p>
    ) : (
      <p className="mt-1 text-xs text-gray-500">
        {title.length}/100 characters
      </p>
    )}
  </div>

  {/* Existing Prompt Text Area */}
  <div>
    <div className="flex items-center justify-between mb-2">
      <label htmlFor="quick-prompt-text" className="block text-sm font-medium text-gray-300">
        Your Prompt <span className="text-red-400">*</span>
      </label>
      {promptText.trim() && !title && (
        <button
          onClick={suggestTitleFromPrompt}
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          Suggest title from prompt ✨
        </button>
      )}
    </div>
    {/* Rest of prompt text area code... */}
  </div>
  
  {/* Rest of the form... */}
</div>
```

---

### 3. History Page Updates

**File:** `app/history/page.tsx`

**Update prompt card display (line 267-333):**

```typescript
{prompts.map((prompt) => {
  const bucket = buckets.find((b) => b.id === prompt.bucket_id);
  
  return (
    <div
      key={prompt.id}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-600 transition-all"
    >
      {/* Badges: Bucket + Category + Mode */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {bucket && (
          <div
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
            style={{
              backgroundColor: `${bucket.color}20`,
              color: bucket.color,
            }}
          >
            <Folder size={12} />
            {bucket.name}
          </div>
        )}
        <CategoryBadge category={prompt.category} size="sm" />
        {prompt.analysis_mode === 'manual' && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
            <FileText size={10} />
            Manual
          </div>
        )}
      </div>

      {/* 🆕 UPDATED: Title + Prompt Preview */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
          {prompt.title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2">
          {prompt.initial_prompt}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <Clock size={14} />
          {new Date(prompt.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedPrompt(prompt)}
          className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all"
        >
          <Eye size={16} />
          View
        </button>
        <button
          onClick={() => setPlaygroundPrompt(prompt)}
          className="flex items-center justify-center gap-2 bg-green-600/20 text-green-400 py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-600/30 transition-all"
          aria-label="Try in Playground"
          tabIndex={0}
        >
          <Play size={16} />
        </button>
        <button
          onClick={() => handleDeleteClick(prompt.id)}
          className="flex items-center justify-center gap-2 bg-red-600/20 text-red-400 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
})}
```

---

### 4. PromptDetailModal Component

**File:** `components/PromptDetailModal.tsx`

**Update modal header (around line 20-60):**

```typescript
<div className="p-6 space-y-4">
  {/* Header with Category and Mode */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3 flex-wrap">
      <CategoryBadge category={prompt.category} size="md" />
      {prompt.subcategory && (
        <SubcategoryBadge subcategory={prompt.subcategory} size="sm" />
      )}
      {prompt.analysis_mode === 'manual' && (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
          <FileText size={12} />
          Manual Entry
        </div>
      )}
    </div>
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <Clock size={16} />
      {new Date(prompt.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </div>
  </div>

  {/* 🆕 NEW: Title Display */}
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-white mb-2">
      {prompt.title}
    </h2>
  </div>

  {/* Original Prompt */}
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-purple-400 mb-2">
      Original Prompt
    </h3>
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
      <p className="text-gray-200 whitespace-pre-wrap">
        {prompt.initial_prompt}
      </p>
    </div>
  </div>

  {/* Rest of the modal content... */}
</div>
```

---

### 5. DeletePromptModal Component

**File:** `components/DeletePromptModal.tsx`

**Update to show title in confirmation dialog:**

```typescript
// Assuming the component receives prompt with title
<div className="p-6">
  <p className="text-gray-300 mb-4">
    Are you sure you want to delete this prompt?
  </p>
  
  {/* 🆕 Show title instead of truncated prompt */}
  <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
    <p className="text-white font-semibold mb-2">{prompt.title}</p>
    <p className="text-gray-400 text-sm line-clamp-2">
      {prompt.initial_prompt}
    </p>
  </div>

  {bucket && (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
      <p className="text-yellow-400 text-sm">
        From bucket: <span className="font-medium">{bucket.name}</span>
      </p>
    </div>
  )}

  {/* Rest of modal... */}
</div>
```

---

## 🧪 Testing Checklist

### Database Testing
- [ ] Run migration SQL in Supabase
- [ ] Verify all existing prompts have titles
- [ ] Test constraint validation (3-100 chars)
- [ ] Verify index was created
- [ ] Check that titles are searchable

### API Testing
- [ ] GET `/api/prompts` returns title field
- [ ] POST `/api/prompts` with valid title succeeds (Normal Save)
- [ ] POST `/api/prompts` with valid title succeeds (Quick Save)
- [ ] POST with empty title returns 400 error
- [ ] POST with title < 3 chars returns 400 error
- [ ] POST with title > 100 chars returns 400 error

### UI Testing - Normal Save Flow
- [ ] Title input appears in Stage3SuperPrompt modal
- [ ] Auto-suggestion populates title field
- [ ] Title validation shows error for invalid input
- [ ] Cannot save without valid title
- [ ] Title is included in save request
- [ ] Success message appears after save

### UI Testing - Quick Save Flow
- [ ] Title input appears in QuickSaveModal
- [ ] "Suggest title from prompt" button works
- [ ] Title validation shows error for invalid input
- [ ] Cannot save without valid title
- [ ] Title is included in save request
- [ ] Modal closes after successful save

### UI Testing - Display
- [ ] History page shows titles prominently
- [ ] Long titles are properly handled (wrap/truncate)
- [ ] Prompt preview text shows below title
- [ ] PromptDetailModal displays title at top
- [ ] DeletePromptModal shows title in confirmation

### Edge Cases
- [ ] Title with special characters (emoji, accents)
- [ ] Very long single word (no spaces)
- [ ] Title with only spaces (should fail validation)
- [ ] Existing prompts with default titles display correctly
- [ ] Title with newlines/tabs (should be cleaned)

---

## 📝 Implementation Order

1. ✅ **Database Migration** - Run SQL migration first
2. ✅ **TypeScript Types** - Update all interfaces
3. ✅ **API Endpoints** - Add validation and include title
4. ✅ **Stage3SuperPrompt** - Add title input for normal save
5. ✅ **QuickSaveModal** - Add title input for quick save
6. ✅ **History Page** - Update display to show titles
7. ✅ **PromptDetailModal** - Add title display
8. ✅ **DeletePromptModal** - Show title in confirmation
9. ✅ **Testing** - Comprehensive testing of all flows
10. ✅ **Documentation** - Update schema docs

---

## 🚀 Rollout Plan

### Phase 1: Database & Backend (30 min)
1. Execute database migration
2. Verify data integrity
3. Update TypeScript types
4. Update API endpoints
5. Test API endpoints with Postman/Thunder Client

### Phase 2: UI Components (60 min)
1. Update Stage3SuperPrompt component
2. Update QuickSaveModal component
3. Test both save workflows
4. Verify validation works correctly

### Phase 3: Display Updates (30 min)
1. Update History page
2. Update PromptDetailModal
3. Update DeletePromptModal
4. Test display on various screen sizes

### Phase 4: Testing & Polish (30 min)
1. Full end-to-end testing
2. Test edge cases
3. Verify existing prompts work
4. Final validation and cleanup

---

## ⚠️ Important Notes

### Backward Compatibility
- All existing prompts will get auto-generated titles from their initial_prompt
- The migration ensures NO null titles exist before making the field required
- UI gracefully handles both new titled prompts and legacy auto-titled ones

### Performance Considerations
- Full-text search index on title enables future search features
- Title length constraint (100 chars) prevents database bloat
- Auto-suggestion runs client-side (no API calls)

### User Experience
- Auto-suggestions reduce friction in save workflow
- Validation is immediate and clear
- Title is optional to edit (suggestions are usually good enough)
- Character counter provides clear feedback

### Future Enhancements
- Search prompts by title
- Edit title after saving
- Title templates/suggestions based on category
- Duplicate detection by title similarity

---

## 📚 Related Documentation

- [Database Schema Documentation](../database/SCHEMA_DOCUMENTATION.md)
- [API Reference](../api/API_REFERENCE.md)
- [TypeScript Type System](../../lib/types.ts)

---

**Task Created:** October 4, 2025  
**Estimated Completion:** 2-3 hours  
**Dependencies:** None  
**Status:** Ready for Implementation 🚀

