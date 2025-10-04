import Papa from 'papaparse';
import { PromptAnswer, Bucket, PromptData, PromptWithAnswers } from './types';

/**
 * =====================================================
 * TYPE DEFINITIONS
 * =====================================================
 */

/**
 * Flattened row structure for CSV export
 * Ultra-simplified for maximum user readability (12 columns)
 * Includes latest playground test result for complete picture
 */
export interface ExportRow {
  // === IDENTIFICATION ===
  title: string;
  created_at: string; // Format: DD/MM/YYYY HH:mm (24-hour)
  
  // === ORGANIZATION ===
  bucket_name: string;
  category: string;
  subcategory: string;
  analysis_mode: string;
  
  // === CORE CONTENT ===
  original_idea: string;
  optimized_prompt: string;
  
  // === USER TAGS ===
  tags: string; // User-defined labels (comma-separated, may be empty)
  
  // === PLAYGROUND RESULTS ===
  latest_playground_answer: string; // Most recent test result
  latest_answer_notes: string; // User notes about latest test
  latest_answer_date: string; // When latest test was run (DD/MM/YYYY HH:mm)
}

/**
 * =====================================================
 * CORE EXPORT FUNCTIONS
 * =====================================================
 */

/**
 * Formats ISO timestamp to compact date string
 * Example: "2025-10-04T07:58:37.987111+00:00" → "04/10/2025 07:58"
 * Format: DD/MM/YYYY HH:mm (24-hour time)
 * 
 * @param isoString - ISO 8601 timestamp
 * @returns Compact date string (DD/MM/YYYY HH:mm)
 */
const formatUserFriendlyDate = (isoString: string): string => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    
    // Extract components
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    // Format: DD/MM/YYYY HH:mm
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return isoString; // Fallback to original if parsing fails
  }
};

/**
 * Finds the most recent playground answer for a prompt
 * Sorts by created_at timestamp (descending)
 * 
 * @param answers - Array of playground answers
 * @returns Latest answer or null if none exist
 */
const getLatestAnswer = (answers: PromptAnswer[]): PromptAnswer | null => {
  if (!answers || answers.length === 0) return null;
  
  // Sort by created_at descending (most recent first)
  const sorted = [...answers].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA; // Descending order
  });
  
  return sorted[0]; // Return most recent
};

/**
 * Flattens prompt database structure into CSV-ready row
 * Ultra-simplified: Core content + latest playground test result
 * Perfect for users who want their prompts WITH testing outcomes
 * 
 * @param prompt - Raw database prompt row
 * @param bucket - Related bucket data (can be null)
 * @param answers - Array of playground answers
 * @returns Flattened ExportRow ready for CSV conversion (12 columns)
 */
export const flattenPromptData = (
  prompt: PromptData,
  bucket: Bucket | null,
  answers: PromptAnswer[]
): ExportRow => {
  // Extract questionnaire_data (JSONB field)
  const questionnaireData = prompt.questionnaire_data || {};
  
  // Format arrays as comma-separated strings
  const tagsStr = Array.isArray(prompt.tags) 
    ? prompt.tags.join(', ') 
    : '';
  
  // Get latest playground answer
  const latestAnswer = getLatestAnswer(answers);
  
  // Helper to safely extract string values from unknown types
  const getString = (value: unknown, defaultValue: string): string => {
    return typeof value === 'string' ? value : defaultValue;
  };
  
  return {
    // Identification
    title: prompt.title || 'Untitled',
    created_at: formatUserFriendlyDate(prompt.created_at),
    
    // Organization
    bucket_name: bucket?.name || 'Uncategorized',
    category: getString(questionnaireData.category, 'general'),
    subcategory: getString(questionnaireData.subcategory, ''),
    analysis_mode: getString(questionnaireData.analysisMode, 'manual'),
    
    // Core content (the most important data!)
    original_idea: prompt.original_idea || '',
    optimized_prompt: prompt.optimized_prompt || '',
    
    // User tags
    tags: tagsStr,
    
    // Playground results
    latest_playground_answer: latestAnswer?.answer_text || '',
    latest_answer_notes: latestAnswer?.notes || '',
    latest_answer_date: latestAnswer ? formatUserFriendlyDate(latestAnswer.created_at) : '',
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

