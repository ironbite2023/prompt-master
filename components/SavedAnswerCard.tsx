'use client';

import React, { useState } from 'react';
import { PromptAnswer } from '@/lib/types';
import { Clock, Trash2, StickyNote, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface SavedAnswerCardProps {
  answer: PromptAnswer;
  onDelete: (answerId: string) => Promise<void>;
}

const SavedAnswerCard: React.FC<SavedAnswerCardProps> = ({ answer, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDelete = async (): Promise<void> => {
    const confirmed = window.confirm('Are you sure you want to delete this saved answer?');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(answer.id);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete answer. Please try again.');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const truncatedAnswer = answer.answer_text.length > 150 
    ? answer.answer_text.substring(0, 150) + '...'
    : answer.answer_text;

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-purple-600/50 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock size={14} />
          {formatDate(answer.created_at)}
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          aria-label="Delete answer"
          tabIndex={0}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Answer Text */}
      <div className="mb-3">
        <p className="text-gray-300 text-sm whitespace-pre-wrap">
          {isExpanded ? answer.answer_text : truncatedAnswer}
        </p>
      </div>

      {/* Expand/Collapse Button */}
      {answer.answer_text.length > 150 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 mb-3"
          tabIndex={0}
        >
          {isExpanded ? (
            <>
              <ChevronUp size={14} />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              Read More
            </>
          )}
        </button>
      )}

      {/* Notes */}
      {answer.notes && (
        <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex items-start gap-2">
            <StickyNote size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-gray-400 text-sm">{answer.notes}</p>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        {answer.generation_time_ms && (
          <div className="flex items-center gap-1">
            <Zap size={12} />
            {(answer.generation_time_ms / 1000).toFixed(2)}s
          </div>
        )}
        {answer.tokens_used && (
          <div>
            {answer.tokens_used.toLocaleString()} tokens
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedAnswerCard;

