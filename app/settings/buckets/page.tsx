'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Bucket } from '@/lib/types';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import BucketManagementCard from '@/components/BucketManagementCard';
import DeleteBucketModal from '@/components/DeleteBucketModal';
import EditBucketModal from '@/components/EditBucketModal';
import { ArrowLeft, Plus } from 'lucide-react';

const BucketManagementPage: React.FC = () => {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingBucket, setEditingBucket] = useState<Bucket | null>(null);
  const [deletingBucket, setDeletingBucket] = useState<Bucket | null>(null);
  
  // Create bucket form state
  const [newBucketName, setNewBucketName] = useState<string>('');
  const [newBucketColor, setNewBucketColor] = useState<string>('#8B5CF6');
  const [newBucketIcon, setNewBucketIcon] = useState<string>('folder');
  const [creating, setCreating] = useState<boolean>(false);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchBuckets = useCallback(async (): Promise<void> => {
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
  }, []);

  useEffect(() => {
    if (user) {
      fetchBuckets();
    }
  }, [user, fetchBuckets]);

  const handleCreateBucket = useCallback(async (): Promise<void> => {
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

      // Add new bucket to list
      await fetchBuckets();
      
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
  }, [newBucketName, newBucketColor, newBucketIcon, creating, fetchBuckets]);

  const handleEditBucket = useCallback(async (updates: { name: string; color: string; icon: string }): Promise<void> => {
    if (!editingBucket) return;

    try {
      const response = await fetch('/api/buckets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingBucket.id,
          ...updates,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to update bucket');
        return;
      }

      // Refresh buckets
      await fetchBuckets();
      setEditingBucket(null);
    } catch (error) {
      console.error('Error updating bucket:', error);
      alert('Failed to update bucket');
    }
  }, [editingBucket, fetchBuckets]);

  const handleDeleteBucket = useCallback(async (reassignToBucketId: string): Promise<void> => {
    if (!deletingBucket) return;

    try {
      const response = await fetch(
        `/api/buckets?id=${deletingBucket.id}&reassignTo=${reassignToBucketId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to delete bucket');
        return;
      }

      // Refresh buckets
      await fetchBuckets();
      setDeletingBucket(null);
    } catch (error) {
      console.error('Error deleting bucket:', error);
      alert('Failed to delete bucket');
    }
  }, [deletingBucket, fetchBuckets]);

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

  const availableBucketsForReassignment = buckets.filter(b => b.id !== deletingBucket?.id);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => router.push('/history')}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-2 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to History
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Manage Your Buckets
              </h1>
            </div>
          </div>

          {/* Create New Bucket Button */}
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full mb-6 p-4 bg-purple-600/20 hover:bg-purple-600/30 border-2 border-dashed border-purple-600 rounded-xl text-purple-400 font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Plus size={20} />
              Create New Bucket
            </button>
          )}

          {/* Create Bucket Form */}
          {showCreateForm && (
            <div className="mb-6 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Create New Bucket</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bucket Name
                  </label>
                  <input
                    type="text"
                    value={newBucketName}
                    onChange={(e) => setNewBucketName(e.target.value)}
                    placeholder="Enter bucket name"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    maxLength={50}
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={newBucketColor}
                      onChange={(e) => setNewBucketColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Icon
                    </label>
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

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateBucket}
                    disabled={!newBucketName.trim() || creating}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {creating ? 'Creating...' : 'Create Bucket'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bucket List */}
          <div className="space-y-4">
            {buckets.map((bucket) => (
              <BucketManagementCard
                key={bucket.id}
                bucket={bucket}
                promptCount={bucket.promptCount || 0}
                lastUsedDate={bucket.lastUsedDate || undefined}
                onEdit={setEditingBucket}
                onDelete={(bucketId) => {
                  const bucketToDelete = buckets.find(b => b.id === bucketId);
                  if (bucketToDelete) {
                    setDeletingBucket(bucketToDelete);
                  }
                }}
                canDelete={buckets.length > 1}
              />
            ))}
          </div>

          {buckets.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No buckets found. Create your first bucket!</p>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingBucket && (
        <EditBucketModal
          bucket={editingBucket}
          onConfirm={handleEditBucket}
          onCancel={() => setEditingBucket(null)}
        />
      )}

      {/* Delete Modal */}
      {deletingBucket && (
        <DeleteBucketModal
          bucket={deletingBucket}
          promptCount={deletingBucket.promptCount || 0}
          availableBuckets={availableBucketsForReassignment}
          onConfirm={handleDeleteBucket}
          onCancel={() => setDeletingBucket(null)}
        />
      )}
    </>
  );
};

export default BucketManagementPage;
