import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuthContext } from '../contexts/AuthContext';
import DiaryComposer from '../components/diary/DiaryComposer';
import AICompanion from '../components/diary/AICompanion';
import type { DiaryEntry } from '../types';
import { DiaryService } from '../services';

const DiaryPage: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | undefined>();
  const [showAICompanion, setShowAICompanion] = useState(false);

  // Load diary entries
  useEffect(() => {
    if (isAuthenticated) {
      loadEntries();
    }
  }, [isAuthenticated]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      console.log('Loading diary entries...');
      const response = await DiaryService.getEntries();
      console.log('DiaryService response:', response);
      
      if (response.success && response.data) {
        console.log('Setting entries:', response.data.entries);
        setEntries(response.data.entries);
      } else {
        console.error('Failed to load entries:', response.error);
      }
    } catch (error) {
      console.error('Failed to load diary entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntryCreated = (newEntry: DiaryEntry) => {
    setEntries(prev => [newEntry, ...prev]);
    setShowComposer(false);
  };

  const handleEntryUpdated = (updatedEntry: DiaryEntry) => {
    setEntries(prev => prev.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
    setSelectedEntry(undefined);
  };

  // Removed unused handleEntryDeleted function

  // TEMPORARY: Bypass authentication check for testing
  // if (!isAuthenticated) {
  //   return (
  //     <Layout>
  //       <div className="text-center py-16">
  //         <h2 className="text-2xl font-serif font-semibold text-stone-700 mb-4">
  //           Please sign in to access your diary
  //         </h2>
  //         <p className="text-stone-600">
  //           Your personal diary space is waiting for you.
  //         </p>
  //       </div>
  //     </Layout>
  //   );
  // }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif font-semibold text-sage-700">
            My Diary
          </h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Your private space for reflection, growth, and mindful journaling.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-serif font-medium text-stone-800">
              {entries.length === 0 ? 'Start Your Journey' : 'Your Entries'}
            </h2>
            {entries.length > 0 && (
              <span className="text-sm text-stone-500">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {entries.length > 0 && (
              <button
                onClick={() => setShowAICompanion(true)}
                className="btn-secondary flex items-center space-x-2 bg-gradient-to-r from-sage-500 to-sage-600 text-white hover:from-sage-600 hover:to-sage-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>AI Companion</span>
              </button>
            )}
            <button
              onClick={() => setShowComposer(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-semibold text-stone-700 mb-4">
              Begin Your Diary Journey
            </h3>
            <p className="text-stone-600 max-w-md mx-auto mb-8">
              Your first entry awaits. Start documenting your thoughts, feelings, and experiences in this private space designed for reflection and growth.
            </p>
            <button
              onClick={() => setShowComposer(true)}
              className="btn-primary"
            >
              Write Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <div key={entry.id} className="card-gentle">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getMoodColor(entry.mood)}`}></div>
                    <span className="text-sm text-stone-500">
                      {new Date(entry.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="text-sm text-stone-400 capitalize">
                      {entry.mood}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedEntry(entry)}
                      className="text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {entry.title && (
                  <h3 className="text-lg font-serif font-semibold text-stone-800 mb-3">
                    {entry.title}
                  </h3>
                )}
                
                <div className="prose prose-stone max-w-none">
                  <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>
                
                {(entry.gratitude || entry.highlights || entry.goals) && (
                  <div className="mt-6 pt-4 border-t border-stone-100 space-y-3">
                    {entry.gratitude && (
                      <div>
                        <span className="text-sm font-medium text-stone-600">Gratitude: </span>
                        <span className="text-sm text-stone-700">{entry.gratitude}</span>
                      </div>
                    )}
                    {entry.highlights && (
                      <div>
                        <span className="text-sm font-medium text-stone-600">Highlights: </span>
                        <span className="text-sm text-stone-700">{entry.highlights}</span>
                      </div>
                    )}
                    {entry.goals && (
                      <div>
                        <span className="text-sm font-medium text-stone-600">Goals: </span>
                        <span className="text-sm text-stone-700">{entry.goals}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Composer Modal */}
        {showComposer && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowComposer(false)} />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-2xl">
                <DiaryComposer
                  onSave={handleEntryCreated}
                  onCancel={() => setShowComposer(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedEntry(undefined)} />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-2xl">
                <DiaryComposer
                  entry={selectedEntry}
                  onSave={handleEntryUpdated}
                  onCancel={() => setSelectedEntry(undefined)}
                />
              </div>
            </div>
          </div>
        )}

        {/* AI Companion Modal */}
        {showAICompanion && (
          <AICompanion onClose={() => setShowAICompanion(false)} />
        )}
      </div>
    </Layout>
  );
};

// Helper function for mood colors
const getMoodColor = (mood: string): string => {
  const moodColors: Record<string, string> = {
    happy: 'bg-yellow-400',
    sad: 'bg-blue-400',
    anxious: 'bg-orange-400',
    calm: 'bg-green-400',
    excited: 'bg-pink-400',
    grateful: 'bg-purple-400',
    reflective: 'bg-indigo-400',
    content: 'bg-emerald-400',
    frustrated: 'bg-red-400',
    hopeful: 'bg-cyan-400',
  };
  return moodColors[mood] || 'bg-stone-400';
};

export default DiaryPage;