'use client';

import React, { useState, useCallback } from 'react';
import { Bucket } from '@/lib/types';
import { X, Save } from 'lucide-react';

interface EditBucketModalProps {
  bucket: Bucket;
  onConfirm: (updates: { name: string; color: string; icon: string }) => Promise<void>;
  onCancel: () => void;
}

const EditBucketModal: React.FC<EditBucketModalProps> = ({
  bucket,
  onConfirm,
  onCancel,
}) => {
  const [name, setName] = useState<string>(bucket.name);
  const [color, setColor] = useState<string>(bucket.color);
  const [icon, setIcon] = useState<string>(bucket.icon);
  const [saving, setSaving] = useState<boolean>(false);

  const handleConfirm = useCallback(async (): Promise<void> => {
    if (!name.trim()) {
      alert('Bucket name is required');
      return;
    }

    setSaving(true);
    try {
      await onConfirm({ name: name.trim(), color, icon });
    } finally {
      setSaving(false);
    }
  }, [name, color, icon, onConfirm]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            Edit Bucket
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bucket Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Icon
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
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

          {/* Preview */}
          <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}30` }}
              >
                <span style={{ color: color }}>●</span>
              </div>
              <span className="text-white font-medium">{name || 'Bucket Name'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || !name.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBucketModal;
