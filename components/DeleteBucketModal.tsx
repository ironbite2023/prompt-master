'use client';

import React, { useState, useCallback } from 'react';
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

  const handleConfirm = useCallback(async (): Promise<void> => {
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
  }, [promptCount, selectedReassignBucket, onConfirm]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="text-red-400" size={24} />
            Delete &quot;{bucket.name}&quot;?
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
