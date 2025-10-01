'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { SavedPrompt, Bucket, PromptCategory, QuickSavePromptRequest } from '@/lib/types';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import CategoryBadge from '@/components/CategoryBadge';
import CategoryFilter from '@/components/CategoryFilter';
import PromptDetailModal from '@/components/PromptDetailModal';
import DeletePromptModal from '@/components/DeletePromptModal';
import QuickSaveModal from '@/components/QuickSaveModal';
import { Clock, Trash2, Eye, Folder, Settings, Plus, FileText } from 'lucide-react';

const HistoryPage: React.FC = () => {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [allPrompts, setAllPrompts] = useState<SavedPrompt[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | 'all'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<SavedPrompt | null>(null);
  const [showQuickSaveModal, setShowQuickSaveModal] = useState<boolean>(false);
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
    }
  }, []);

  const fetchPrompts = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/prompts');
      const data = await response.json();

      if (response.ok) {
        setAllPrompts(data.prompts);
        setPrompts(data.prompts);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchBuckets();
      fetchPrompts();
    }
  }, [user, fetchBuckets, fetchPrompts]);

  // 🆕 Dual filtering: bucket + category (TASK-06)
  const filteredPrompts = useMemo(() => {
    let filtered = allPrompts;

    // Apply bucket filter
    if (selectedBucketId) {
      filtered = filtered.filter(p => p.bucket_id === selectedBucketId);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    return filtered;
  }, [allPrompts, selectedBucketId, selectedCategory]);

  useEffect(() => {
    setPrompts(filteredPrompts);
  }, [filteredPrompts]);

  const handleDeleteClick = (promptId: string): void => {
    const prompt = allPrompts.find((p) => p.id === promptId);
    if (prompt) {
      setDeletingPrompt(prompt);
    }
  };

  const confirmDelete = async (): Promise<void> => {
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
      throw error; // Let the modal handle the error
    }
  };

  const getBucketPromptCount = useCallback((bucketId: string): number => {
    return allPrompts.filter((p) => p.bucket_id === bucketId).length;
  }, [allPrompts]);

  const handleCategoryChange = (category: PromptCategory | 'all'): void => {
    setSelectedCategory(category);
  };

  const handleQuickSave = useCallback(async (data: QuickSavePromptRequest): Promise<void> => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptText: data.promptText,
          bucketId: data.bucketId,
          category: data.category,
          subcategory: data.subcategory,
          mode: 'manual' // Flag to indicate this is a quick save
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save prompt');
      }

      console.log('✅ Prompt quick saved successfully:', result.promptId);
      
      // Refresh the prompts list to show the new prompt
      await fetchPrompts();
      
    } catch (error) {
      console.error('Quick save error:', error);
      throw error; // Re-throw to let modal handle the error display
    }
  }, [fetchPrompts]);

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
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowQuickSaveModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all text-sm font-medium"
              >
                <Plus size={16} />
                <span>Quick Save Prompt</span>
              </button>
              
              <button
                onClick={() => router.push('/settings/buckets')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-white"
              >
                <Settings size={16} />
                <span>Manage Buckets</span>
              </button>
            </div>
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
              All Prompts ({allPrompts.length})
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
                {selectedBucketId || selectedCategory !== 'all'
                  ? 'No prompts match the selected filters.'
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 🆕 Sidebar - Category Filter (TASK-06) */}
              <aside className="lg:col-span-1">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sticky top-6">
                  <CategoryFilter
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                    prompts={allPrompts}
                    showCounts={true}
                  />
                </div>
              </aside>

              {/* Main Content - Prompt Grid */}
              <div className="lg:col-span-3">
                <div className="grid gap-6 md:grid-cols-2">
                  {prompts.map((prompt) => {
                    const bucket = buckets.find((b) => b.id === prompt.bucket_id);
                    
                    return (
                      <div
                        key={prompt.id}
                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-600 transition-all"
                      >
                        {/* 🆕 Triple Badges: Bucket + Category + Mode (TASK-06 + TASK-09) */}
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
                            onClick={() => handleDeleteClick(prompt.id)}
                            className="flex items-center justify-center gap-2 bg-red-600/20 text-red-400 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Results Summary */}
                {prompts.length > 0 && (
                  <div className="mt-6 text-center text-sm text-gray-400">
                    Showing {prompts.length} of {allPrompts.length} prompts
                  </div>
                )}
              </div>
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

      {deletingPrompt && (
        <DeletePromptModal
          prompt={deletingPrompt}
          bucket={buckets.find((b) => b.id === deletingPrompt.bucket_id)}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingPrompt(null)}
        />
      )}

      {/* Quick Save Modal */}
      {showQuickSaveModal && (
        <QuickSaveModal
          isOpen={showQuickSaveModal}
          onClose={() => setShowQuickSaveModal(false)}
          onSave={handleQuickSave}
        />
      )}
    </>
  );
};

export default HistoryPage;
