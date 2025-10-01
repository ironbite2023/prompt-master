# TASK-10: Custom Delete Prompt Modal

**Created:** October 1, 2025  
**Status:** Planning - Ready for Implementation  
**Priority:** High (UX Improvement)  
**Estimated Effort:** 30-45 minutes  
**Depends On:** None (Standalone UX Enhancement)

---

## Table of Contents
1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Current vs Proposed](#current-vs-proposed)
4. [Implementation Plan](#implementation-plan)
5. [UI/UX Design](#uiux-design)
6. [Success Criteria](#success-criteria)

---

## Overview

Replace the native JavaScript `confirm()` dialog with a beautiful, custom-designed modal component for prompt deletion confirmation. This improves UX consistency, visual appeal, and maintains design system coherence.

**Key Improvement:**
- ❌ **Before:** System-level alert (ugly, inconsistent, unbranded)
- ✅ **After:** Custom modal (beautiful, on-brand, consistent)

---

## Problem Statement

### Current Issue
When users click to delete a prompt on the history page, they see a browser-native confirmation dialog:

```
┌──────────────────────────────────┐
│ localhost says:                  │
├──────────────────────────────────┤
│ Are you sure you want to delete  │
│ this prompt?                     │
│                                  │
│          [OK]    [Cancel]        │
└──────────────────────────────────┘
```

### Why This Is Bad

1. **Inconsistent Design**
   - Looks different on every browser (Chrome, Firefox, Safari, Edge)
   - Different on every OS (Windows, Mac, Linux)
   - Cannot be styled or customized
   - Breaks visual flow of the application

2. **Poor UX**
   - Generic "localhost says:" prefix
   - No context about what's being deleted
   - No preview of the prompt content
   - Abrupt, jarring interruption
   - Feels unprofessional

3. **Lacks Important Information**
   - Doesn't show prompt preview
   - No bucket information
   - No category badge
   - No creation date
   - User can't verify they're deleting the right prompt

4. **Design System Violation**
   - We have a beautiful `DeleteBucketModal` component
   - We have consistent modal patterns
   - Native alerts break the design language
   - Inconsistent with the rest of the app

---

## Current vs Proposed

### Current Implementation
**File:** `app/history/page.tsx`

```typescript
const handleDelete = async (promptId: string): Promise<void> => {
  // ❌ Native browser confirm dialog
  if (!confirm('Are you sure you want to delete this prompt?')) {
    return;
  }

  try {
    const response = await fetch(`/api/prompts?id=${promptId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      const updatedAllPrompts = allPrompts.filter((p) => p.id !== promptId);
      setAllPrompts(updatedAllPrompts);
      setPrompts(prompts.filter((p) => p.id !== promptId));
    }
  } catch (error) {
    console.error('Error deleting prompt:', error);
    alert('Failed to delete prompt'); // ❌ Another native alert!
  }
};
```

### Proposed Implementation

```typescript
const [deletingPrompt, setDeletingPrompt] = useState<SavedPrompt | null>(null);

const handleDeleteClick = (prompt: SavedPrompt): void => {
  // ✅ Show custom modal
  setDeletingPrompt(prompt);
};

const handleConfirmDelete = async (): Promise<void> => {
  if (!deletingPrompt) return;

  try {
    const response = await fetch(`/api/prompts?id=${deletingPrompt.id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      const updatedAllPrompts = allPrompts.filter((p) => p.id !== deletingPrompt.id);
      setAllPrompts(updatedAllPrompts);
      setPrompts(prompts.filter((p) => p.id !== deletingPrompt.id));
      setDeletingPrompt(null); // Close modal
    }
  } catch (error) {
    console.error('Error deleting prompt:', error);
    // ✅ Show error in modal instead of alert
  }
};
```

---

## Implementation Plan

### Step 1: Create DeletePromptModal Component

**File:** `components/DeletePromptModal.tsx`

**Features:**
- Display prompt preview (truncated to 200 chars)
- Show bucket badge
- Show category badge
- Show creation date
- Warning message
- Loading state during deletion
- Error handling within modal
- Cancel and Delete buttons
- Smooth animations

**Props Interface:**
```typescript
interface DeletePromptModalProps {
  prompt: SavedPrompt;
  bucket?: Bucket;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}
```

### Step 2: Update History Page

**File:** `app/history/page.tsx`

**Changes:**
1. Add state for `deletingPrompt`
2. Change `handleDelete` to `handleDeleteClick`
3. Create `handleConfirmDelete` function
4. Import and render `DeletePromptModal`
5. Pass bucket info to modal

### Step 3: Replace Alert for Errors

**Current:**
```typescript
alert('Failed to delete prompt');
```

**Proposed:**
- Show error message inside the modal
- Red error banner
- Allow user to retry or cancel

---

## UI/UX Design

### Modal Layout

```
┌─────────────────────────────────────────────┐
│ ⚠️ Delete Prompt?                      [X]  │
├─────────────────────────────────────────────┤
│                                             │
│ Are you sure you want to delete this        │
│ prompt? This action cannot be undone.       │
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ 📁 Work  📊 Data Analytics              ││
│ │                                         ││
│ │ "i am preparing for the monthly         ││
│ │  quality meeting. i will share our      ││
│ │  box check data which is consisted..."  ││
│ │                                         ││
│ │ Created: September 28, 2025             ││
│ └─────────────────────────────────────────┘│
│                                             │
│ ⚠️ This action cannot be undone.            │
│                                             │
│         [Cancel]  [Delete Prompt]          │
└─────────────────────────────────────────────┘
```

### Visual Specifications

**Modal Container:**
- Background: `bg-gray-800`
- Border: `border border-gray-700`
- Rounded: `rounded-xl`
- Max width: `max-w-lg`
- Padding: `p-6`
- Shadow: Backdrop with `bg-black/50`
- Z-index: `z-50`

**Header:**
- Icon: `AlertTriangle` (Lucide)
- Color: `text-red-400`
- Title: "Delete Prompt?"
- Close button: Top right with hover effect

**Prompt Preview Card:**
- Background: `bg-gray-900/50`
- Border: `border border-gray-700`
- Padding: `p-4`
- Badges: Bucket + Category inline
- Text: Truncated with ellipsis (`line-clamp-3`)
- Date: Gray text, small font

**Warning Banner:**
- Background: `bg-red-500/10`
- Border: `border border-red-500/30`
- Text: `text-red-200`
- Icon: Warning emoji ⚠️

**Buttons:**
- Cancel: `bg-gray-700 hover:bg-gray-600`
- Delete: `bg-red-600 hover:bg-red-700`
- Loading state: "Deleting..." with spinner
- Disabled state when deleting

### Animation

**Entry Animation:**
- Fade in backdrop: 150ms
- Scale + fade modal: 200ms
- Spring animation preferred

**Exit Animation:**
- Scale down + fade: 150ms
- Remove from DOM after animation

---

## Component Code

### DeletePromptModal.tsx (Complete Implementation)

```typescript
'use client';

import React, { useState } from 'react';
import { SavedPrompt, Bucket } from '@/lib/types';
import { AlertTriangle, X, Folder } from 'lucide-react';
import CategoryBadge from './CategoryBadge';

interface DeletePromptModalProps {
  prompt: SavedPrompt;
  bucket?: Bucket;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const DeletePromptModal: React.FC<DeletePromptModalProps> = ({
  prompt,
  bucket,
  onConfirm,
  onCancel,
}) => {
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (): Promise<void> => {
    setDeleting(true);
    setError(null);

    try {
      await onConfirm();
      // Modal will be closed by parent component
    } catch (err) {
      setError('Failed to delete prompt. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-lg w-full p-6 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="text-red-400" size={24} />
            Delete Prompt?
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-300 transition-colors"
            disabled={deleting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete this prompt? This action cannot be undone.
        </p>

        {/* Prompt Preview Card */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-4">
          {/* Badges */}
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
          </div>

          {/* Prompt Content Preview */}
          <p className="text-gray-300 text-sm mb-3 line-clamp-3">
            &quot;{prompt.initial_prompt}&quot;
          </p>

          {/* Creation Date */}
          <p className="text-xs text-gray-500">
            Created: {new Date(prompt.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-200">
            ⚠️ This action cannot be undone.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600/20 border border-red-600 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {deleting ? 'Deleting...' : 'Delete Prompt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePromptModal;
```

---

## Integration Changes

### History Page Updates

**File:** `app/history/page.tsx`

#### 1. Add Import
```typescript
import DeletePromptModal from '@/components/DeletePromptModal';
```

#### 2. Add State
```typescript
const [deletingPrompt, setDeletingPrompt] = useState<SavedPrompt | null>(null);
```

#### 3. Update Delete Handler
```typescript
// OLD: Direct deletion with confirm
const handleDelete = async (promptId: string): Promise<void> => {
  if (!confirm('Are you sure you want to delete this prompt?')) {
    return;
  }
  // ... deletion logic
};

// NEW: Open modal
const handleDeleteClick = (prompt: SavedPrompt): void => {
  setDeletingPrompt(prompt);
};

const handleConfirmDelete = async (): Promise<void> => {
  if (!deletingPrompt) return;

  try {
    const response = await fetch(`/api/prompts?id=${deletingPrompt.id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      const updatedAllPrompts = allPrompts.filter((p) => p.id !== deletingPrompt.id);
      setAllPrompts(updatedAllPrompts);
      setPrompts(prompts.filter((p) => p.id !== deletingPrompt.id));
      setDeletingPrompt(null);
    } else {
      throw new Error('Failed to delete prompt');
    }
  } catch (error) {
    console.error('Error deleting prompt:', error);
    throw error; // Re-throw to be caught by modal
  }
};
```

#### 4. Update Button Click
```typescript
// OLD
<button
  onClick={() => handleDelete(prompt.id)}
  className="..."
>
  <Trash2 size={16} />
</button>

// NEW
<button
  onClick={() => handleDeleteClick(prompt)}
  className="..."
>
  <Trash2 size={16} />
</button>
```

#### 5. Add Modal Render
```typescript
{/* Delete Prompt Modal */}
{deletingPrompt && (
  <DeletePromptModal
    prompt={deletingPrompt}
    bucket={buckets.find(b => b.id === deletingPrompt.bucket_id)}
    onConfirm={handleConfirmDelete}
    onCancel={() => setDeletingPrompt(null)}
  />
)}
```

---

## CSS Animations (Optional Enhancement)

### Add to `globals.css`

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 150ms ease-out;
}

.animate-scaleIn {
  animation: scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## Success Criteria

### ✅ Core Functionality
- [ ] Native `confirm()` dialog completely removed
- [ ] Custom modal displays correctly
- [ ] Prompt deletion works as before
- [ ] Modal can be cancelled
- [ ] Modal can be confirmed

### ✅ UX Improvements
- [ ] Beautiful, on-brand modal design
- [ ] Prompt preview shown in modal
- [ ] Bucket badge displayed
- [ ] Category badge displayed
- [ ] Creation date displayed
- [ ] Warning message clear
- [ ] Loading state during deletion
- [ ] Error handling within modal

### ✅ Visual Design
- [ ] Consistent with DeleteBucketModal design
- [ ] Consistent with EditBucketModal design
- [ ] Smooth animations (fade + scale)
- [ ] Proper z-index layering
- [ ] Backdrop blocks interaction
- [ ] Modal centered on screen
- [ ] Mobile responsive

### ✅ Technical Quality
- [ ] TypeScript type safety
- [ ] No console errors
- [ ] Proper error handling
- [ ] Accessible (keyboard navigation)
- [ ] Escape key closes modal
- [ ] Click outside closes modal (optional)

---

## Testing Checklist

### Deletion Flow
- [ ] Click delete button → Modal opens
- [ ] Modal shows correct prompt preview
- [ ] Bucket badge matches prompt
- [ ] Category badge matches prompt
- [ ] Creation date displays correctly
- [ ] Click Cancel → Modal closes
- [ ] Click Delete → Prompt deletes
- [ ] Loading state shows during deletion
- [ ] Modal closes after successful deletion

### Error Handling
- [ ] Network error → Error shown in modal
- [ ] Server error → Error shown in modal
- [ ] User can retry after error
- [ ] User can cancel after error

### Edge Cases
- [ ] Prompt with very long text (truncation works)
- [ ] Prompt without bucket (handled gracefully)
- [ ] Multiple rapid delete clicks
- [ ] Delete while filter active

### Accessibility
- [ ] Tab navigation works
- [ ] Enter key confirms
- [ ] Escape key cancels
- [ ] Screen reader announces modal
- [ ] Focus trapped in modal

---

## Benefits of This Change

### User Experience
- ✅ **Professional appearance** - Matches your beautiful design
- ✅ **More information** - User sees what they're deleting
- ✅ **Confidence** - Preview ensures they're deleting the right thing
- ✅ **Consistency** - Matches other modals in the app
- ✅ **Better feedback** - Loading states, error messages

### Technical
- ✅ **Maintainable** - Follows established patterns
- ✅ **Reusable** - Can be used elsewhere if needed
- ✅ **Testable** - Easier to test than native dialogs
- ✅ **Customizable** - Can be enhanced later

### Business
- ✅ **Brand consistency** - Everything feels cohesive
- ✅ **User trust** - Professional UI builds confidence
- ✅ **Reduced errors** - Users less likely to delete wrong prompt

---

## Future Enhancements (Out of Scope)

1. **Undo Delete** - Toast notification with undo button
2. **Bulk Delete** - Select multiple prompts to delete
3. **Soft Delete** - Move to trash before permanent deletion
4. **Archive** - Archive instead of delete
5. **Keyboard Shortcuts** - Shift+Delete for quick delete
6. **Confirmation Sound** - Subtle audio feedback

---

## Implementation Order

1. ✅ Create `DeletePromptModal.tsx` component
2. ✅ Add animations to `globals.css` (optional)
3. ✅ Update `app/history/page.tsx` - Import modal
4. ✅ Update `app/history/page.tsx` - Add state
5. ✅ Update `app/history/page.tsx` - Update handlers
6. ✅ Update `app/history/page.tsx` - Update button click
7. ✅ Update `app/history/page.tsx` - Render modal
8. ✅ Test all functionality
9. ✅ Test edge cases
10. ✅ Verify build success

---

## Notes

- Component follows same pattern as `DeleteBucketModal`
- Reuses existing `CategoryBadge` component
- No new API endpoints needed
- No database changes required
- Backward compatible
- Can be implemented in 30-45 minutes

---

**Status:** 📋 Scoped - Ready for Implementation  
**Next Step:** Create DeletePromptModal.tsx component  
**Estimated Time:** 30-45 minutes  
**Impact:** High (Major UX improvement)
