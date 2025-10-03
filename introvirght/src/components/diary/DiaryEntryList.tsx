import React, { useState } from 'react';
import type { DiaryEntry } from '../../types/diary';
import DiaryEntryCard from './DiaryEntryCard';

interface DiaryEntryListProps {
  entries: DiaryEntry[];
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (entryId: string) => void;
}

const DiaryEntryList: React.FC<DiaryEntryListProps> = ({ entries, onEdit, onDelete }) => {
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const toggleExpanded = (entryId: string) => {
    setExpandedEntry(expandedEntry === entryId ? null : entryId);
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="space-y-6">
          <div className="w-24 h-24 bg-sage-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-serif font-semibold text-sage-700">
              Begin Your Journey
            </h3>
            <p className="text-stone-600 max-w-md mx-auto leading-relaxed">
              Your diary is empty, but full of potential. Start by writing your first entry 
              to begin this journey of self-reflection and mindful growth.
            </p>
            <div className="pt-4">
              <p className="text-stone-500 text-sm font-serif italic">
                "The journey of a thousand miles begins with a single step."
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Entry Count and Stats */}
      <div className="text-center pb-4 border-b border-stone-100">
        <p className="text-stone-600 text-sm">
          You have written <span className="font-semibold text-sage-600">{entries.length}</span> {entries.length === 1 ? 'entry' : 'entries'} in your personal diary
        </p>
      </div>

      {/* Entries */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <DiaryEntryCard
            key={entry.id}
            entry={entry}
            isExpanded={expandedEntry === entry.id}
            onToggleExpanded={() => toggleExpanded(entry.id)}
            onEdit={() => onEdit(entry)}
            onDelete={() => onDelete(entry.id)}
          />
        ))}
      </div>

      {/* Load More (placeholder for future pagination) */}
      {entries.length >= 20 && (
        <div className="text-center py-6">
          <button className="btn-secondary">
            Load More Entries
          </button>
        </div>
      )}
    </div>
  );
};

export default DiaryEntryList;