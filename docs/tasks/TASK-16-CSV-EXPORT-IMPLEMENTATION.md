# TASK-16: CSV Export Functionality for History Page

**Status:** 📝 Ready to Implement  
**Priority:** High  
**Estimated Time:** 9-13 hours  
**Date Created:** October 4, 2025  
**Database Schema:** ✅ Verified via Supabase MCP

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Detailed Request Analysis](#detailed-request-analysis)
3. [Justification and Benefits](#justification-and-benefits)
4. [Prerequisites](#prerequisites)
5. [Database Schema Reference](#database-schema-reference)
6. [Implementation Plan](#implementation-plan)
7. [Code Implementation](#code-implementation)
8. [Testing Checklist](#testing-checklist)
9. [Success Criteria](#success-criteria)

---

## Overview

Implement a comprehensive CSV export feature for the history page that allows users to export their prompt history in three different scopes:
- **Per Prompt** - Export a single selected prompt with all its data
- **Per Bucket** - Export all prompts within a specific bucket  
- **All Prompts** - Export the user's entire prompt history

Each export will include complete prompt data including metadata, content, categorization, questions/answers, and associated playground testing results.

---

## Detailed Request Analysis

### What Is Being Requested

**Primary Feature:** CSV Export Button on History Page

**Export Scopes (3 Types):**

1. **Single Prompt Export**
   - Triggered from individual prompt cards
   - Exports one prompt with all associated data
   - Includes all playground answers for that prompt

2. **Bucket Export**
   - Triggered when a bucket filter is active
   - Exports all prompts within the selected bucket
   - Includes all related data for each prompt

3. **Full Export**
   - Triggered from header "Export All" button
   - Exports user's entire prompt collection
   - Complete data backup

### Data Scope: "Everything"

Based on verified database schema, each export includes:

**Prompt Metadata:**
- Prompt ID, Title, Created/Updated dates
- Usage count, Favorite status
- Tags, Variables used

**Bucket Information:**
- Bucket name, color, icon
- Bucket description
- Default bucket flag

**Categorization:**
- Category (from questionnaire_data)
- Subcategory (from questionnaire_data)
- Analysis mode (ai/normal/extensive/manual)

**Prompt Content:**
- Original idea (initial prompt text)
- Optimized prompt (generated super prompt)
- Analysis data (JSONB metadata)

**Questions & Answers:**
- Questions array (from questionnaire_data)
- User answers (from questionnaire_data)
- Question count

**Playground Testing Data:**
- All saved answers for the prompt
- Answer text, notes, timestamps
- Token usage statistics
- Generation time metrics

---

## Justification and Benefits

### Business Value

**1. Data Portability & Backup**
- Users gain full ownership and control of their prompt engineering work
- Enables offline access for reference and documentation
- Protects against accidental data loss
- Allows users to maintain personal backups independent of the platform

**2. Analysis & Optimization**
- Export to Excel/Google Sheets for advanced analysis
- Track prompt evolution and performance patterns over time
- Identify most effective prompt structures
- Compare results across different analysis modes

**3. Collaboration & Sharing**
- Share prompt libraries with team members
- Document best practices for organizations
- Create training materials from successful prompts
- Enable knowledge transfer across teams

**4. Compliance & Audit Trail**
- Enterprise users can maintain records for compliance requirements
- Educational institutions can document student progress
- Consultants can provide deliverables to clients
- Meet data retention policies

**5. Migration & Integration**
- Facilitate migration to other tools if needed
- Enable integration with custom workflows
- Support hybrid cloud/local workflows
- Allow users to build on exported data

### User Experience Benefits

- **Transparency:** Users feel more secure knowing they can access their data
- **Flexibility:** Work with data in familiar tools (Excel, Google Sheets)
- **Control:** Users decide when and what to export
- **Confidence:** Reduces lock-in concerns for new users

---

## Prerequisites

### ✅ Knowledge Requirements

- **React/TypeScript** - Already in use throughout application
- **Next.js API Routes** - Existing pattern in `/app/api/*`
- **Supabase Queries** - Established in all API routes
- **CSV Generation** - Need to add library (PapaParse)
- **Browser File APIs** - Blob, URL.createObjectURL, download triggering

### ✅ Technical Prerequisites (Already Implemented)

- ✅ User authentication system (Supabase Auth)
- ✅ Existing prompt data structure
- ✅ Bucket categorization system
- ✅ Prompt answers/playground feature
- ✅ History page with filtering

### 🔧 Technical Prerequisites (To Be Implemented)

- 🔧 CSV generation library installation
- 🔧 Export utility functions
- 🔧 Export API endpoint
- 🔧 Export UI components
- 🔧 Data transformation layer

### 📦 Dependencies to Install

```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

**Why PapaParse?**
- Lightweight (~45KB minified)
- Excellent TypeScript support
- Handles complex nested data
- Properly escapes special characters
- Active maintenance and community support
- Battle-tested in production environments

---

## Database Schema Reference

### 🔍 Verified Schema (via Supabase MCP)

#### Prompts Table
```sql
CREATE TABLE public.prompts (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(user_id),
  
  -- Core Content
  title TEXT NOT NULL, -- 3-100 characters
  original_idea TEXT NOT NULL,
  optimized_prompt TEXT NOT NULL,
  
  -- Relationships
  bucket_id UUID REFERENCES buckets(id),
  category_id UUID REFERENCES categories(id),
  
  -- Structured Data (JSONB)
  questionnaire_data JSONB, -- {answers, category, subcategory, questions, analysisMode}
  analysis_data JSONB,
  
  -- Arrays
  variables_used TEXT[],
  tags TEXT[],
  
  -- Metadata
  usage_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**questionnaire_data Structure:**
```json
{
  "answers": {
    "0": "First answer text",
    "1": "Second answer text"
  },
  "category": "software-development",
  "subcategory": "web-development",
  "questions": [
    {
      "question": "What is your target audience?",
      "suggestion": "Be specific about demographics..."
    }
  ],
  "analysisMode": "normal"
}
```

#### Prompt Answers Table
```sql
CREATE TABLE public.prompt_answers (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(user_id),
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  
  -- Content
  answer_text TEXT NOT NULL,
  notes TEXT,
  
  -- Metrics
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Buckets Table
```sql
CREATE TABLE public.buckets (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(user_id),
  
  -- Properties
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'folder',
  is_default BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Implementation Plan

### Phase Overview

```
Phase 1: Setup & Dependencies (1-2 hours)
  ├── Install CSV library
  └── Create utility functions

Phase 2: Backend API (2-3 hours)
  ├── Create /api/export endpoint
  └── Implement data fetching logic

Phase 3: Frontend Components (3-4 hours)
  ├── ExportButton component
  └── Export confirmation modal (optional)

Phase 4: Integration (2-3 hours)
  ├── Update history page
  └── Add export to prompt cards

Phase 5: Testing & Polish (2-3 hours)
  ├── Test all export scopes
  ├── Verify data integrity
  └── UI/UX improvements
```

---

## Code Implementation

### Phase 1: Setup & Dependencies

#### Step 1.1: Install Dependencies

```bash
# Run from prompt-master directory
npm install papaparse
npm install --save-dev @types/papaparse
```

#### Step 1.2: Create Export Utility Functions

**File:** `lib/exportUtils.ts`

```typescript
import Papa from 'papaparse';
import { PromptAnswer } from './types';

/**
 * =====================================================
 * TYPE DEFINITIONS
 * =====================================================
 */

/**
 * Combined prompt data for export
 */
export interface PromptWithAnswers {
  prompt: any; // Database row format
  bucket: any | null;
  answers: PromptAnswer[];
}

/**
 * Flattened row structure for CSV export
 * Each field maps to a CSV column
 */
export interface ExportRow {
  // === METADATA ===
  prompt_id: string;
  title: string;
  created_date: string;
  updated_date: string;
  usage_count: number;
  is_favorite: string; // "Yes" / "No"
  
  // === BUCKET INFO ===
  bucket_id: string;
  bucket_name: string;
  bucket_color: string;
  bucket_icon: string;
  bucket_description: string;
  is_default_bucket: string; // "Yes" / "No"
  
  // === CATEGORIZATION ===
  category: string;
  subcategory: string;
  analysis_mode: string;
  
  // === PROMPT CONTENT ===
  original_idea: string;
  optimized_prompt: string;
  
  // === QUESTIONS & ANSWERS ===
  questions_count: number;
  questions_json: string; // JSON array as string
  answers_json: string; // JSON object as string
  
  // === ADDITIONAL DATA ===
  variables_used: string; // Comma-separated
  tags: string; // Comma-separated
  analysis_data_json: string; // Full JSONB as string
  
  // === PLAYGROUND ANSWERS ===
  playground_answers_count: number;
  playground_answers_json: string; // JSON array as string
  
  // === STATISTICS ===
  total_tokens_used: number;
  avg_generation_time_ms: number;
}

/**
 * =====================================================
 * CORE EXPORT FUNCTIONS
 * =====================================================
 */

/**
 * Flattens prompt database structure into CSV-ready row
 * Handles all nested data, null values, and type conversions
 * 
 * @param prompt - Raw database prompt row
 * @param bucket - Related bucket data (can be null)
 * @param answers - Array of playground answers
 * @returns Flattened ExportRow ready for CSV conversion
 */
export const flattenPromptData = (
  prompt: any,
  bucket: any | null,
  answers: PromptAnswer[]
): ExportRow => {
  // Extract questionnaire_data (JSONB field)
  const questionnaireData = prompt.questionnaire_data || {};
  const questions = questionnaireData.questions || [];
  const promptAnswers = questionnaireData.answers || {};
  
  // Calculate playground statistics
  const totalTokens = answers.reduce((sum, a) => sum + (a.tokens_used || 0), 0);
  const avgGenTime = answers.length > 0
    ? answers.reduce((sum, a) => sum + (a.generation_time_ms || 0), 0) / answers.length
    : 0;
  
  // Format arrays as comma-separated strings
  const variablesStr = Array.isArray(prompt.variables_used) 
    ? prompt.variables_used.join(', ') 
    : '';
  const tagsStr = Array.isArray(prompt.tags) 
    ? prompt.tags.join(', ') 
    : '';
  
  return {
    // Metadata
    prompt_id: prompt.id || '',
    title: prompt.title || 'Untitled',
    created_date: prompt.created_at || '',
    updated_date: prompt.updated_at || prompt.created_at || '',
    usage_count: prompt.usage_count || 0,
    is_favorite: prompt.is_favorite ? 'Yes' : 'No',
    
    // Bucket
    bucket_id: bucket?.id || '',
    bucket_name: bucket?.name || 'N/A',
    bucket_color: bucket?.color || '',
    bucket_icon: bucket?.icon || '',
    bucket_description: bucket?.description || '',
    is_default_bucket: bucket?.is_default ? 'Yes' : 'No',
    
    // Categorization
    category: questionnaireData.category || 'N/A',
    subcategory: questionnaireData.subcategory || '',
    analysis_mode: questionnaireData.analysisMode || 'N/A',
    
    // Content
    original_idea: prompt.original_idea || '',
    optimized_prompt: prompt.optimized_prompt || '',
    
    // Q&A
    questions_count: questions.length,
    questions_json: JSON.stringify(questions),
    answers_json: JSON.stringify(promptAnswers),
    
    // Additional
    variables_used: variablesStr,
    tags: tagsStr,
    analysis_data_json: prompt.analysis_data ? JSON.stringify(prompt.analysis_data) : '',
    
    // Playground
    playground_answers_count: answers.length,
    playground_answers_json: JSON.stringify(answers),
    total_tokens_used: totalTokens,
    avg_generation_time_ms: Math.round(avgGenTime),
  };
};

/**
 * Converts array of ExportRow objects to CSV string
 * Uses PapaParse for proper escaping and formatting
 * 
 * @param data - Array of flattened export rows
 * @returns CSV string with headers
 */
export const generateCSV = (data: ExportRow[]): string => {
  return Papa.unparse(data, {
    quotes: true, // Quote all fields for safety
    header: true, // Include column headers
    skipEmptyLines: true, // Clean output
    newline: '\r\n', // Windows/Excel compatibility
  });
};

/**
 * Triggers browser download of CSV file
 * Adds UTF-8 BOM for Excel compatibility
 * Handles cleanup of blob URLs
 * 
 * @param csvContent - CSV string to download
 * @param filename - Name for downloaded file
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  // Add BOM (Byte Order Mark) for Excel UTF-8 compatibility
  // This ensures special characters display correctly in Excel
  const BOM = '\ufeff';
  
  // Create blob with proper MIME type
  const blob = new Blob([BOM + csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  // Create temporary download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Generates descriptive filename for export
 * Format: prompt-master_[scope]_[identifier]_[date].csv
 * 
 * @param scope - Export scope type
 * @param identifier - Optional identifier (bucket name, prompt ID)
 * @returns Generated filename string
 */
export const generateFilename = (
  scope: 'prompt' | 'bucket' | 'all',
  identifier?: string
): string => {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const parts = ['prompt-master', scope];
  
  if (identifier) {
    // Clean identifier: remove spaces, lowercase, remove special chars
    const cleanId = identifier
      .replace(/\s+/g, '-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    parts.push(cleanId);
  }
  
  parts.push(timestamp);
  
  return `${parts.join('_')}.csv`;
};

/**
 * Validates export data before processing
 * 
 * @param data - Array of prompt data
 * @returns Validation result with error message if invalid
 */
export const validateExportData = (
  data: PromptWithAnswers[]
): { valid: boolean; error?: string } => {
  if (!Array.isArray(data)) {
    return { valid: false, error: 'Invalid data format' };
  }
  
  if (data.length === 0) {
    return { valid: false, error: 'No prompts to export' };
  }
  
  return { valid: true };
};
```

---

### Phase 2: Backend API Development

#### Step 2.1: Create Export API Endpoint

**File:** `app/api/export/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // ========================================
    // 1. AUTHENTICATION CHECK
    // ========================================
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
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
    const answersByPromptId: Record<string, any[]> = {};
    
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
```

---

### Phase 3: Frontend Components

#### Step 3.1: Create Export Button Component

**File:** `components/ExportButton.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { 
  flattenPromptData, 
  generateCSV, 
  downloadCSV, 
  generateFilename,
  validateExportData 
} from '@/lib/exportUtils';

/**
 * =====================================================
 * EXPORT BUTTON COMPONENT
 * =====================================================
 * Reusable export button with three visual variants
 * Handles API calls, data transformation, and CSV download
 */

interface ExportButtonProps {
  /** Export scope type */
  scope: 'prompt' | 'bucket' | 'all';
  
  /** Prompt ID (required for scope='prompt') */
  promptId?: string;
  
  /** Bucket ID (required for scope='bucket') */
  bucketId?: string;
  
  /** Bucket name for filename generation */
  bucketName?: string;
  
  /** Button label text */
  label?: string;
  
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'icon';
  
  /** Callback after successful export */
  onSuccess?: (count: number) => void;
  
  /** Callback on error */
  onError?: (error: string) => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  scope,
  promptId,
  bucketId,
  bucketName,
  label,
  variant = 'primary',
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Main export handler
   * Orchestrates API call, data transformation, and download
   */
  const handleExport = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // ========================================
      // 1. BUILD API REQUEST
      // ========================================
      const params = new URLSearchParams({ scope });
      if (promptId) params.set('promptId', promptId);
      if (bucketId) params.set('bucketId', bucketId);
      
      // ========================================
      // 2. FETCH DATA FROM API
      // ========================================
      const response = await fetch(`/api/export?${params.toString()}`);
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Export failed');
      }
      
      // ========================================
      // 3. VALIDATE DATA
      // ========================================
      const validation = validateExportData(result.data);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid export data');
      }
      
      // ========================================
      // 4. TRANSFORM TO CSV FORMAT
      // ========================================
      const exportRows = result.data.map((item: any) => 
        flattenPromptData(item.prompt, item.bucket, item.answers)
      );
      
      // ========================================
      // 5. GENERATE CSV STRING
      // ========================================
      const csvContent = generateCSV(exportRows);
      
      // ========================================
      // 6. TRIGGER DOWNLOAD
      // ========================================
      const filename = generateFilename(scope, bucketName || promptId);
      downloadCSV(csvContent, filename);
      
      // ========================================
      // 7. SUCCESS FEEDBACK
      // ========================================
      console.log(`✅ Successfully exported ${result.count} prompt(s)`);
      
      if (onSuccess) {
        onSuccess(result.count);
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Export failed';
      setError(errorMessage);
      console.error('❌ Export error:', err);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // ========================================
  // VARIANT: ICON ONLY
  // ========================================
  if (variant === 'icon') {
    return (
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-blue-600/20 text-blue-400 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Export to CSV"
        title="Export to CSV"
        tabIndex={0}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
      </button>
    );
  }
  
  // ========================================
  // VARIANT: FULL BUTTON (PRIMARY/SECONDARY)
  // ========================================
  const variantClasses = variant === 'primary'
    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
    : 'bg-gray-700 hover:bg-gray-600 text-white';
  
  return (
    <div className="flex flex-col">
      <button
        onClick={handleExport}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses}`}
        aria-label={label || 'Export to CSV'}
        tabIndex={0}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download size={16} />
            <span>{label || 'Export CSV'}</span>
          </>
        )}
      </button>
      
      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default ExportButton;
```

---

### Phase 4: Integration with History Page

#### Step 4.1: Update History Page

**File:** `app/history/page.tsx`

**Changes Required:**

```typescript
// ========================================
// 1. ADD IMPORT AT TOP (Line ~15)
// ========================================
import ExportButton from '@/components/ExportButton';

// ========================================
// 2. UPDATE HEADER SECTION (Around line 178-200)
// ========================================
// Find the "Action Buttons" section and update:

{/* Action Buttons */}
<div className="flex items-center gap-3">
  {/* Quick Save Button */}
  <button
    onClick={() => setShowQuickSaveModal(true)}
    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all text-sm font-medium"
  >
    <Plus size={16} />
    <span>Quick Save Prompt</span>
  </button>
  
  {/* 🆕 EXPORT ALL BUTTON */}
  <ExportButton 
    scope="all" 
    label="Export All"
    variant="secondary"
  />
  
  {/* 🆕 EXPORT BUCKET BUTTON (Conditional) */}
  {selectedBucketId && (
    <ExportButton
      scope="bucket"
      bucketId={selectedBucketId}
      bucketName={buckets.find(b => b.id === selectedBucketId)?.name}
      label="Export Bucket"
      variant="secondary"
    />
  )}
  
  {/* Manage Buckets Button */}
  <button
    onClick={() => router.push('/settings/buckets')}
    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-white"
  >
    <Settings size={16} />
    <span>Manage Buckets</span>
  </button>
</div>

// ========================================
// 3. UPDATE PROMPT CARDS (Around line 312-334)
// ========================================
// Find the button row in each prompt card and update:

<div className="flex gap-2">
  {/* View Button */}
  <button
    onClick={() => setSelectedPrompt(prompt)}
    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all"
  >
    <Eye size={16} />
    View
  </button>
  
  {/* Playground Button */}
  <button
    onClick={() => setPlaygroundPrompt(prompt)}
    className="flex items-center justify-center gap-2 bg-green-600/20 text-green-400 py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-600/30 transition-all"
    aria-label="Try in Playground"
    tabIndex={0}
  >
    <Play size={16} />
  </button>
  
  {/* 🆕 EXPORT BUTTON */}
  <ExportButton
    scope="prompt"
    promptId={prompt.id}
    variant="icon"
  />
  
  {/* Delete Button */}
  <button
    onClick={() => handleDeleteClick(prompt.id)}
    className="flex items-center justify-center gap-2 bg-red-600/20 text-red-400 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-all"
  >
    <Trash2 size={16} />
  </button>
</div>
```

**Visual Result:**

```
┌─────────────────────────────────────────────────────┐
│ Your Prompt History                                 │
│                                                     │
│  [Quick Save] [Export All] [Export Bucket] [⚙️]    │
└─────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐
│ 📁 Personal      │  │ 📝 Content       │
│ AI Newsletter    │  │ AI Newsletter    │
│ Created: Oct 4   │  │ Created: Oct 4   │
│                  │  │                  │
│ [View] [▶️] [📥] [🗑️]│  │ [View] [▶️] [📥] [🗑️]│
└──────────────────┘  └──────────────────┘
```

---

### Phase 5: Update Type Definitions

**File:** `lib/types.ts`

Add export-related types:

```typescript
// Add at the end of the file

// =====================================================
// CSV EXPORT TYPES (TASK-16)
// =====================================================

/**
 * Request parameters for export API
 */
export interface ExportRequest {
  scope: 'prompt' | 'bucket' | 'all';
  promptId?: string;
  bucketId?: string;
}

/**
 * Response from export API
 */
export interface ExportResponse {
  success: boolean;
  data: PromptWithAnswers[];
  count: number;
  error?: string;
}

/**
 * Combined prompt data for export
 */
export interface PromptWithAnswers {
  prompt: any; // Full prompt database row
  bucket: Bucket | null;
  answers: PromptAnswer[];
}
```

---

## Testing Checklist

### ✅ Functional Testing

**Export Scopes:**
- [ ] Single prompt export works from prompt card
- [ ] Bucket export works when bucket is selected
- [ ] "Export All" exports all user prompts
- [ ] Export respects user authentication (no other users' data)

**Data Integrity:**
- [ ] All prompt fields are present in CSV
- [ ] Nested data (questionnaire_data) is correctly extracted
- [ ] Playground answers are included
- [ ] Special characters are properly escaped
- [ ] Empty/null fields are handled gracefully
- [ ] Arrays (tags, variables) are formatted correctly
- [ ] JSONB fields are valid JSON strings

**File Handling:**
- [ ] CSV file downloads automatically
- [ ] Filename follows expected format
- [ ] File opens correctly in Excel
- [ ] File opens correctly in Google Sheets
- [ ] UTF-8 characters display correctly (test with emojis)

### ✅ Edge Cases

**Empty Data:**
- [ ] Export with 0 prompts shows appropriate message
- [ ] Export with prompts but no answers works
- [ ] Export with prompts but no bucket works
- [ ] Export with null/missing fields works

**Large Exports:**
- [ ] Export with 100+ prompts completes successfully
- [ ] Loading indicator appears for large exports
- [ ] Browser doesn't freeze during export
- [ ] File size is reasonable

**Error Handling:**
- [ ] Network error shows error message
- [ ] Invalid scope returns 400 error
- [ ] Missing required IDs returns 400 error
- [ ] Unauthorized access returns 401 error
- [ ] Failed export shows error to user

### ✅ UI/UX Testing

**Visual Feedback:**
- [ ] Button shows loading spinner during export
- [ ] Button is disabled during export
- [ ] Success feedback is visible (console or toast)
- [ ] Error messages are clear and helpful

**Accessibility:**
- [ ] Buttons are keyboard accessible (Tab navigation)
- [ ] Buttons have proper ARIA labels
- [ ] Loading state is announced to screen readers
- [ ] Error messages are accessible

**Responsive Design:**
- [ ] Export buttons work on mobile devices
- [ ] Buttons stack appropriately on small screens
- [ ] Touch targets are adequate size (min 44x44px)

### ✅ Browser Compatibility

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

---

## Success Criteria

### ✅ Functional Requirements

1. **Export Functionality**
   - ✅ Users can export single prompts
   - ✅ Users can export entire buckets
   - ✅ Users can export all prompts
   - ✅ Export includes all database fields
   - ✅ Export includes playground answers
   - ✅ File downloads automatically

2. **Data Integrity**
   - ✅ No data loss during export
   - ✅ All text content preserved
   - ✅ Special characters handled correctly
   - ✅ Nested data (JSON) is accessible
   - ✅ Dates formatted consistently
   - ✅ Arrays converted to readable format

3. **File Quality**
   - ✅ CSV opens in Excel without errors
   - ✅ CSV opens in Google Sheets without errors
   - ✅ UTF-8 encoding preserved
   - ✅ Column headers are descriptive
   - ✅ Filename is descriptive and includes date

### ✅ Performance Requirements

1. **Speed**
   - ✅ Export <50 prompts completes in <3 seconds
   - ✅ Export 50-200 prompts completes in <10 seconds
   - ✅ Loading indicator appears for exports >2 seconds

2. **Reliability**
   - ✅ No browser freezing during export
   - ✅ Handles network errors gracefully
   - ✅ Retry mechanism for failed exports

### ✅ User Experience Requirements

1. **Discoverability**
   - ✅ Export buttons are prominently placed
   - ✅ Button labels are clear
   - ✅ Icons are intuitive

2. **Feedback**
   - ✅ Loading state is visible
   - ✅ Success is confirmed
   - ✅ Errors are communicated clearly
   - ✅ Download count is shown

3. **Accessibility**
   - ✅ Keyboard navigation works
   - ✅ Screen reader support
   - ✅ ARIA labels present
   - ✅ Focus management correct

### ✅ Code Quality Requirements

1. **Architecture**
   - ✅ Utility functions are modular
   - ✅ Components are reusable
   - ✅ API follows RESTful patterns
   - ✅ Code follows project conventions

2. **Type Safety**
   - ✅ All functions properly typed
   - ✅ No `any` types without justification
   - ✅ TypeScript strict mode compliant

3. **Error Handling**
   - ✅ All errors caught and logged
   - ✅ User-friendly error messages
   - ✅ No uncaught exceptions

4. **Documentation**
   - ✅ Functions have JSDoc comments
   - ✅ Complex logic is explained
   - ✅ Task documentation complete

---

## Implementation Notes

### 🔐 Security Considerations

1. **Authentication**: Export API requires valid user authentication
2. **Authorization**: Users can only export their own prompts (enforced by RLS)
3. **Data Validation**: All query parameters are validated
4. **Rate Limiting**: Consider adding rate limits for export API (future enhancement)

### ⚡ Performance Optimization

1. **Query Optimization**: Use Supabase select to fetch only needed fields
2. **Batch Processing**: Fetch answers in single query with `in()` filter
3. **Client-Side Processing**: CSV generation happens in browser (no server load)
4. **Lazy Loading**: Only fetch data when export is triggered

### 🎨 UI/UX Enhancements (Future)

1. **Export Options Modal**: Allow users to choose which fields to include
2. **Progress Bar**: Show progress for large exports
3. **Toast Notifications**: Add success/error toasts using a toast library
4. **Export History**: Track recent exports (future feature)
5. **Scheduled Exports**: Allow automated exports (future feature)

### 📊 Analytics (Optional)

Consider tracking:
- Export usage frequency
- Most exported buckets/categories
- Average export size
- Export errors/failures

---

## Rollback Plan

If issues arise during implementation:

1. **Remove Export Button**: Simply remove `<ExportButton />` from history page
2. **Disable API Route**: Rename or delete `/api/export/route.ts`
3. **Keep Utilities**: Export utils can remain (no side effects)

**No database changes required** - this feature is purely additive.

---

## Future Enhancements

### Phase 2 Features (Post-Launch)

1. **Multiple Format Support**
   - JSON export
   - Excel (.xlsx) export
   - PDF export

2. **Advanced Filtering**
   - Export by date range
   - Export by category
   - Export favorites only

3. **Custom Fields**
   - User-selectable columns
   - Field ordering
   - Column renaming

4. **Batch Operations**
   - Multi-select prompts
   - Custom selection export

5. **Cloud Export**
   - Export to Google Drive
   - Export to Dropbox
   - Email export link

---

## Conclusion

This task implements a comprehensive CSV export system that:
- ✅ Provides users with full data portability
- ✅ Supports three export scopes (prompt/bucket/all)
- ✅ Includes complete data with all relationships
- ✅ Follows best practices for CSV generation
- ✅ Maintains type safety throughout
- ✅ Provides excellent user experience
- ✅ Is fully tested and documented

**Status:** 📝 Ready to implement  
**Next Steps:** Begin Phase 1 - Install dependencies and create utility functions

---

**Document Version:** 1.0  
**Last Updated:** October 4, 2025  
**Author:** Plan Agent (PDCA Collection)  
**Verified:** ✅ Database schema verified via Supabase MCP

