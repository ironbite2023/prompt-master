'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bucket } from '@/lib/types';
import { Folder, Plus, Briefcase, User, Heart, Lightbulb, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface BucketSelectorProps {
  selectedBucketId: string | null;
  onSelect: (bucketId: string) => void;
  onCreateBucket?: (bucket: Bucket) => void;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>> = {
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

  const fetchBuckets = useCallback(async (): Promise<void> => {
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
  }, [selectedBucketId, onSelect]);

  useEffect(() => {
    fetchBuckets();
  }, [fetchBuckets]);

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
  }, [newBucketName, newBucketColor, newBucketIcon, creating, buckets, onSelect, onCreateBucket]);

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
