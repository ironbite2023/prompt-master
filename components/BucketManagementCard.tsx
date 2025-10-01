'use client';

import React from 'react';
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

const iconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>> = {
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
