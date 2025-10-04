# TASK-05: Bucket Management UI - Add/Edit/Delete Buckets

**Created:** October 1, 2025  
**Status:** Planning - Ready for Implementation  
**Priority:** Medium  
**Estimated Effort:** 2-3 hours  
**Depends On:** TASK-04 (Bucket Categorization - ✅ Complete)

---

## Table of Contents
1. [Overview](#overview)
2. [User Requirements](#user-requirements)
3. [Current State](#current-state)
4. [Gap Analysis](#gap-analysis)
5. [Implementation Plan](#implementation-plan)
6. [UI/UX Design](#uiux-design)
7. [Success Criteria](#success-criteria)

---

## Overview

Implement a comprehensive bucket management interface that allows users to:
- ✅ **Add unlimited custom buckets** (already working via BucketSelector)
- ⏳ **Edit existing buckets** (name, color, icon)
- ⏳ **Delete buckets** with smart prompt reassignment
- ⏳ **View bucket statistics** (prompt counts, last used)
- ⏳ **Reorder buckets** (optional)

---

## User Requirements

### What the User Requested
> "i want to have user ABLE TO ADD MORE AS WELL OR DELETE EXISTING"

### Interpreted Requirements
1. **Add More Buckets** - Users should create unlimited custom buckets beyond Personal/Work
2. **Delete Existing Buckets** - Users should delete buckets they no longer need
3. **Edit Buckets** - Users should modify bucket properties (name, color, icon)
4. **Manage Default Buckets** - Personal/Work should be editable/deletable (with safeguards)

### Use Cases
1. **Freelancer:** Creates buckets for each client (Client A, Client B, Client C)
2. **Student:** Creates buckets for different subjects (Math, Science, History)
3. **Content Creator:** Creates buckets by content type (YouTube, Blog, Social Media)
4. **Project Manager:** Creates buckets per project (Project Alpha, Project Beta)
5. **Cleanup:** Deletes old project buckets and moves prompts to archive

---

## Current State

### ✅ Already Implemented
1. **Backend API Routes** - Full CRUD operations exist
   - `POST /api/buckets` - Create bucket ✅
   - `PUT /api/buckets` - Update bucket ✅
   - `DELETE /api/buckets?id=X&reassignTo=Y` - Delete bucket ✅
   - `GET /api/buckets` - List buckets ✅

2. **Inline Bucket Creation** - BucketSelector component
   - Users can create buckets during save flow ✅
   - Color picker and icon selection ✅
   - Duplicate name prevention ✅

3. **Database Support**
   - Unique constraint on (user_id, name) ✅
   - Foreign key with ON DELETE SET NULL ✅
   - RLS policies for all operations ✅

### ⏳ Missing
1. **Dedicated Management UI** - No centralized place to manage all buckets
2. **Edit Functionality** - No UI to edit existing buckets
3. **Delete UI** - No user-friendly way to delete buckets
4. **Reassignment UI** - No visual prompt reassignment when deleting
5. **Bucket Statistics** - No visibility into bucket usage

---

## Gap Analysis

### What Works
- ✅ Users can create buckets inline during save
- ✅ Backend fully supports all operations
- ✅ Data integrity maintained

### What's Missing
- ❌ No way to edit bucket name/color/icon after creation
- ❌ No way to delete buckets from UI
- ❌ No visibility into which buckets have prompts
- ❌ No centralized management interface
- ❌ No guidance on reassigning prompts when deleting

### User Pain Points
1. **Typos:** Created bucket with wrong name, can't fix it
2. **Color Change:** Want to change bucket color, can't do it
3. **Cleanup:** Have old buckets, can't delete them
4. **Organization:** No way to see all buckets in one place

---

## Implementation Plan

### Option A: Settings Page (Recommended)
Create dedicated `/settings/buckets` page for full bucket management

**Pros:**
- Clean, organized interface
- Room for advanced features
- Professional UX
- Can add analytics/statistics

**Cons:**
- Requires navigation away from main flow
- Extra page to maintain

### Option B: Modal/Drawer
Add bucket management modal accessible from history page

**Pros:**
- Quick access from history page
- No page navigation needed
- Overlay doesn't interrupt flow

**Cons:**
- Limited space for features
- Modal fatigue

### Option C: Enhanced History Page
Add management directly in history page sidebar

**Pros:**
- Everything in one place
- No additional navigation
- Contextual to usage

**Cons:**
- Can clutter history page
- Limited screen real estate

**🎯 Recommendation:** **Option A - Settings Page**

---

## UI/UX Design

### Page: `/settings/buckets` (Bucket Management)

#### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│ ← Back to History          Manage Your Buckets      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ + Create New Bucket                         │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ 🟣 Personal                       12 prompts│    │
│  │ Last used: 2 hours ago                      │    │
│  │                         [✏️ Edit] [🗑️ Delete]│    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ 🟠 Work                          5 prompts │    │
│  │ Last used: 1 day ago                        │    │
│  │                         [✏️ Edit] [🗑️ Delete]│    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ 🔵 Client Project                0 prompts │    │
│  │ Created: 3 days ago                         │    │
│  │                         [✏️ Edit] [🗑️ Delete]│    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

#### Features Per Bucket Card
1. **Bucket Icon & Color** - Visual identifier
2. **Bucket Name** - Clearly displayed
3. **Prompt Count** - Shows usage
4. **Last Used Date** - Activity indicator
5. **Edit Button** - Opens edit modal
6. **Delete Button** - Opens delete confirmation

#### Create New Bucket Flow
1. Click "Create New Bucket" button
2. Inline form expands or modal opens:
   - Name input (required)
   - Color picker (default: random)
   - Icon selector (dropdown)
   - Cancel / Create buttons
3. Success: New bucket added to list
4. Error: Show validation message

#### Edit Bucket Flow
1. Click "Edit" on bucket card
2. Inline edit or modal opens with current values:
   - Name input (pre-filled)
   - Color picker (current color)
   - Icon selector (current icon)
   - Cancel / Save buttons
3. Success: Bucket updated, card refreshes
4. Error: Show validation message

#### Delete Bucket Flow

**Scenario 1: Bucket has NO prompts**
```
┌─────────────────────────────────────┐
│ Delete "Client Project"?            │
├─────────────────────────────────────┤
│ This bucket has no prompts.         │
│ Are you sure you want to delete it? │
│                                      │
│         [Cancel]  [Delete Bucket]   │
└─────────────────────────────────────┘
```

**Scenario 2: Bucket has prompts**
```
┌─────────────────────────────────────────────┐
│ Delete "Work"?                              │
├─────────────────────────────────────────────┤
│ This bucket contains 5 prompts.             │
│ Where should we move them?                  │
│                                              │
│ Move prompts to:                            │
│ ┌─────────────────────────────────────────┐│
│ │ ⚪ Personal (12 prompts)                ││
│ │ ⚪ Client Project (0 prompts)           ││
│ └─────────────────────────────────────────┘│
│                                              │
│ ⚠️ This action cannot be undone.            │
│                                              │
│      [Cancel]  [Delete & Move Prompts]     │
└─────────────────────────────────────────────┘
```

**Scenario 3: Last bucket (prevent deletion)**
```
┌─────────────────────────────────────┐
│ Cannot Delete                       │
├─────────────────────────────────────┤
│ You must have at least one bucket.  │
│ Create another bucket first.        │
│                                      │
│              [OK]                    │
└─────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Create Settings Route Structure
**File:** `app/settings/buckets/page.tsx`

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Bucket } from '@/lib/types';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import BucketManagementCard from '@/components/BucketManagementCard';
import CreateBucketForm from '@/components/CreateBucketForm';
import { ArrowLeft } from 'lucide-react';

const BucketManagementPage: React.FC = () => {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Implementation here...
};

export default BucketManagementPage;
```

### Step 2: Create BucketManagementCard Component
**File:** `components/BucketManagementCard.tsx`

**Features:**
- Display bucket info (name, color, icon)
- Show prompt count and last used date
- Edit button with inline/modal editing
- Delete button with confirmation
- Loading states

**Props:**
```typescript
interface BucketManagementCardProps {
  bucket: Bucket;
  promptCount: number;
  lastUsedDate?: string;
  onEdit: (bucket: Bucket) => void;
  onDelete: (bucketId: string) => void;
  canDelete: boolean; // false if last bucket
}
```

### Step 3: Create CreateBucketForm Component
**File:** `components/CreateBucketForm.tsx`

**Features:**
- Reuse from BucketSelector or create standalone
- Form validation
- Color picker
- Icon selector
- Success/error feedback

### Step 4: Add Bucket Statistics to API
**File:** `app/api/buckets/route.ts`

Update GET endpoint to include:
```typescript
// Enhanced GET with statistics
export async function GET(): Promise<NextResponse> {
  // ... existing code ...
  
  // Add prompt counts and last used dates
  const bucketsWithStats = await Promise.all(
    buckets.map(async (bucket) => {
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
}
```

### Step 5: Create Delete Confirmation Modal
**File:** `components/DeleteBucketModal.tsx`

**Features:**
- Show bucket name being deleted
- Display prompt count
- Reassignment bucket selector if prompts exist
- Warning message
- Confirm/Cancel buttons

**Props:**
```typescript
interface DeleteBucketModalProps {
  bucket: Bucket;
  promptCount: number;
  availableBuckets: Bucket[];
  onConfirm: (reassignToBucketId: string) => Promise<void>;
  onCancel: () => void;
}
```

### Step 6: Add Navigation Link
**File:** `app/history/page.tsx`

Add "Manage Buckets" button:
```typescript
<button
  onClick={() => router.push('/settings/buckets')}
  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
>
  <Settings size={16} />
  Manage Buckets
</button>
```

### Step 7: Add Edit Bucket Modal
**File:** `components/EditBucketModal.tsx`

**Features:**
- Pre-filled form with current values
- Same validation as create
- Save/Cancel buttons
- Real-time preview

---

## Detailed Component Code

### Component 1: BucketManagementCard

```typescript
'use client';

import React, { useState } from 'react';
import { Bucket } from '@/lib/types';
import { Folder, Briefcase, User, Heart, Lightbulb, Edit2, Trash2 } from 'lucide-react';

interface BucketManagementCardProps {
  bucket: Bucket;
  promptCount: number;
  lastUsedDate?: string;
  onEdit: (bucket: Bucket) => void;
  onDelete: (bucketId: string) => void;
  canDelete: boolean;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  folder: Folder,
  briefcase: Briefcase,
  user: User,
  heart: Heart,
  lightbulb: Lightbulb,
};

const BucketManagementCard: React.FC<BucketManagementCardProps> = ({
  bucket,
  promptCount,
  lastUsedDate,
  onEdit,
  onDelete,
  canDelete,
}) => {
  const IconComponent = iconMap[bucket.icon] || Folder;
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Never used';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-600/50 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${bucket.color}30` }}
          >
            <IconComponent size={24} style={{ color: bucket.color }} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {bucket.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{promptCount} prompt{promptCount !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>{formatDate(lastUsedDate)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(bucket)}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            title="Edit bucket"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(bucket.id)}
            disabled={!canDelete}
            className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={canDelete ? 'Delete bucket' : 'Cannot delete last bucket'}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BucketManagementCard;
```

### Component 2: DeleteBucketModal

```typescript
'use client';

import React, { useState } from 'react';
import { Bucket } from '@/lib/types';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteBucketModalProps {
  bucket: Bucket;
  promptCount: number;
  availableBuckets: Bucket[];
  onConfirm: (reassignToBucketId: string) => Promise<void>;
  onCancel: () => void;
}

const DeleteBucketModal: React.FC<DeleteBucketModalProps> = ({
  bucket,
  promptCount,
  availableBuckets,
  onConfirm,
  onCancel,
}) => {
  const [selectedReassignBucket, setSelectedReassignBucket] = useState<string>(
    availableBuckets[0]?.id || ''
  );
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleConfirm = async (): Promise<void> => {
    if (promptCount > 0 && !selectedReassignBucket) {
      alert('Please select a bucket to move prompts to');
      return;
    }

    setDeleting(true);
    try {
      await onConfirm(selectedReassignBucket);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="text-red-400" size={24} />
            Delete "{bucket.name}"?
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {promptCount === 0 ? (
          <p className="text-gray-300 mb-6">
            This bucket has no prompts. Are you sure you want to delete it?
          </p>
        ) : (
          <>
            <p className="text-gray-300 mb-4">
              This bucket contains <strong>{promptCount}</strong> prompt{promptCount !== 1 ? 's' : ''}.
              Where should we move them?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Move prompts to:
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableBuckets.map((b) => (
                  <label
                    key={b.id}
                    className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    <input
                      type="radio"
                      name="reassign-bucket"
                      value={b.id}
                      checked={selectedReassignBucket === b.id}
                      onChange={(e) => setSelectedReassignBucket(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <span className="text-white font-medium">{b.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-200">
                ⚠️ This action cannot be undone.
              </p>
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting || (promptCount > 0 && !selectedReassignBucket)}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {deleting ? 'Deleting...' : promptCount > 0 ? 'Delete & Move Prompts' : 'Delete Bucket'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBucketModal;
```

---

## Success Criteria

### ✅ Core Functionality
- [ ] Users can create unlimited custom buckets
- [ ] Users can edit bucket name, color, and icon
- [ ] Users can delete buckets with prompt reassignment
- [ ] Cannot delete last bucket (enforced)
- [ ] Prompt counts displayed accurately
- [ ] Last used dates shown

### ✅ User Experience
- [ ] Settings page accessible from history
- [ ] Clear visual feedback for all actions
- [ ] Loading states during operations
- [ ] Error messages are helpful
- [ ] Confirmation required for destructive actions
- [ ] Mobile responsive design

### ✅ Data Integrity
- [ ] Prompts reassigned before bucket deletion
- [ ] No orphaned prompts
- [ ] Duplicate bucket names prevented
- [ ] Validation on all operations

### ✅ Technical Quality
- [ ] TypeScript type safety maintained
- [ ] No console errors
- [ ] Accessible UI components
- [ ] Performance optimized

---

## Testing Checklist

### Bucket Creation
- [ ] Create bucket with valid data
- [ ] Prevent duplicate names
- [ ] Validate required fields
- [ ] Test with special characters in name
- [ ] Test with all icon options

### Bucket Editing
- [ ] Edit bucket name successfully
- [ ] Change bucket color
- [ ] Change bucket icon
- [ ] Prevent duplicate names on edit
- [ ] Cancel edit without saving

### Bucket Deletion
- [ ] Delete empty bucket
- [ ] Delete bucket with prompts (reassign)
- [ ] Cannot delete last bucket
- [ ] Prompts correctly reassigned
- [ ] Cancel deletion

### Edge Cases
- [ ] User with only 1 bucket (Personal)
- [ ] Bucket with 100+ prompts
- [ ] Very long bucket names
- [ ] Rapid create/delete operations
- [ ] Network errors during operations

---

## Future Enhancements (Out of Scope)

1. **Bucket Reordering** - Drag & drop to reorder buckets
2. **Bucket Archiving** - Archive instead of delete
3. **Bulk Operations** - Move multiple prompts at once
4. **Bucket Templates** - Pre-defined bucket sets
5. **Bucket Sharing** - Share buckets between users (team feature)
6. **Bucket Icons** - Upload custom icons
7. **Bucket Analytics** - Usage charts and trends
8. **Bucket Export** - Export all prompts in a bucket

---

## Implementation Order

1. ✅ Create BucketManagementCard component
2. ✅ Create DeleteBucketModal component
3. ✅ Create EditBucketModal component
4. ✅ Update GET /api/buckets with statistics
5. ✅ Create /settings/buckets page
6. ✅ Add navigation link from history page
7. ✅ Test all functionality
8. ✅ Update documentation

---

## Notes

- Leverage existing API endpoints (already fully functional)
- Reuse BucketSelector styling/patterns for consistency
- Ensure mobile responsiveness
- Add keyboard shortcuts for power users
- Consider analytics on bucket usage

---

**Status:** 📋 Scoped - Ready for Implementation  
**Next Step:** Begin with Component 1 - BucketManagementCard  
**Depends On:** TASK-04 Complete ✅
