import React, { useState } from 'react';
import type { DiaryEntry } from '../../types/diary';
import { DiaryService } from '../../services/diaryService';

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onEdit: () => void;
  onDelete: (entryId: string) => void;
}

const DiaryEntryCard: React.FC<DiaryEntryCardProps> = ({
  entry,
  isExpanded,
  onToggleExpanded,
  onEdit,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await DiaryService.deleteEntry(entry.id);
      if (response.success) {
        onDelete(entry.id);
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      happy: 'bg-yellow-100 text-yellow-800',
      calm: 'bg-blue-100 text-blue-800',
      reflective: 'bg-purple-100 text-purple-800',
      grateful: 'bg-green-100 text-green-800',
      anxious: 'bg-red-100 text-red-800',
      sad: 'bg-gray-100 text-gray-800',
      excited: 'bg-pink-100 text-pink-800',
      peaceful: 'bg-emerald-100 text-emerald-800',
    };
    return colors[mood] || 'bg-gray-100 text-gray-800';
  };

  const getMoodIcon = (mood: string) => {
    const icons: Record<string, string> = {
      happy: '😊',
      calm: '😌',
      reflective: '🤔',
      grateful: '🙏',
      anxious: '😰',
      sad: '😢',
      excited: '🤩',
      peaceful: '☮️',
    };
    return icons[mood] || '😐';
  };

  const getPreviewText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="card-gentle hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMoodColor(entry.mood)}`}>
              <span className="mr-1">{getMoodIcon(entry.mood)}</span>
              {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
            </span>
            <span className="text-stone-500 text-sm">
              {formatDate(entry.createdAt)}
            </span>
            <span className="text-stone-400 text-sm">
              {formatTime(entry.createdAt)}
            </span>
          </div>
          
          {entry.title && (
            <h3 className="text-lg font-serif font-semibold text-stone-800 mb-2">
              {entry.title}
            </h3>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onEdit}
            className="text-stone-400 hover:text-sage-600 transition-colors p-1"
            title="Edit entry"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-stone-400 hover:text-red-600 transition-colors p-1"
            title="Delete entry"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Preview */}
      <div className="space-y-3">
        <div className="prose prose-stone max-w-none">
          <p className="text-stone-700 leading-relaxed">
            {isExpanded ? entry.content : getPreviewText(entry.content)}
          </p>
        </div>

        {/* Optional sections (only show if expanded and content exists) */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-stone-100">
            {entry.gratitude && (
              <div>
                <h4 className="text-sm font-medium text-stone-600 mb-2">Gratitude</h4>
                <p className="text-stone-700 text-sm leading-relaxed">{entry.gratitude}</p>
              </div>
            )}
            
            {entry.highlights && (
              <div>
                <h4 className="text-sm font-medium text-stone-600 mb-2">Today's Highlights</h4>
                <p className="text-stone-700 text-sm leading-relaxed">{entry.highlights}</p>
              </div>
            )}
            
            {entry.goals && (
              <div>
                <h4 className="text-sm font-medium text-stone-600 mb-2">Tomorrow's Intentions</h4>
                <p className="text-stone-700 text-sm leading-relaxed">{entry.goals}</p>
              </div>
            )}
          </div>
        )}

        {/* Expand/Collapse Button */}
        {entry.content.length > 150 && (
          <div className="pt-3">
            <button
              onClick={onToggleExpanded}
              className="text-sage-600 hover:text-sage-700 text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <span>{isExpanded ? 'Show less' : 'Read more'}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-800">Delete Entry</h3>
                  <p className="text-stone-600 text-sm">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-stone-700 mb-6">
                Are you sure you want to delete this diary entry from {formatDate(entry.createdAt)}?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Entry</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryEntryCard;