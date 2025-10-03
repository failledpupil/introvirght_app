import React, { useState } from 'react';
import type { DiaryEntry } from '../../types/diary';
import { DiaryService } from '../../services/diaryService';
import DiaryEntryCard from './DiaryEntryCard';

interface DiarySearchProps {
  onEntryEdit: (entry: DiaryEntry) => void;
  onEntryDelete: (entryId: string) => void;
}

const DiarySearch: React.FC<DiarySearchProps> = ({ onEntryEdit, onEntryDelete }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DiaryEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await DiaryService.searchEntries(query.trim());
      if (response.success && response.data) {
        setResults(response.data.entries);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setExpandedEntry(null);
  };

  const toggleExpanded = (entryId: string) => {
    setExpandedEntry(expandedEntry === entryId ? null : entryId);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="card-gentle">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Search Your Diary
            </label>
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-gentle pr-10"
                  placeholder="Search for thoughts, feelings, or experiences..."
                  disabled={isSearching}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <span>Search</span>
                )}
              </button>
              
              {hasSearched && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="btn-secondary"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          <p className="text-stone-500 text-sm">
            Use natural language to search through your diary entries. For example: "times I felt grateful" or "work stress"
          </p>
        </form>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              Search Results
            </h3>
            {results.length > 0 && (
              <span className="text-sm text-stone-500">
                Found {results.length} {results.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </div>

          {results.length === 0 ? (
            <div className="card-gentle text-center py-12">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-stone-700 mb-2">No Results Found</h4>
                  <p className="text-stone-500 text-sm">
                    No diary entries match your search for "{query}". Try different keywords or phrases.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((entry) => (
                <DiaryEntryCard
                  key={entry.id}
                  entry={entry}
                  isExpanded={expandedEntry === entry.id}
                  onToggleExpanded={() => toggleExpanded(entry.id)}
                  onEdit={() => onEntryEdit(entry)}
                  onDelete={onEntryDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiarySearch;