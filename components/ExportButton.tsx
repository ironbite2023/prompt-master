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
import { PromptWithAnswers } from '@/lib/types';

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
      const exportRows = result.data.map((item: PromptWithAnswers) => 
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
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
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

