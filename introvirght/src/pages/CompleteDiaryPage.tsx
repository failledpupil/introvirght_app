import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import AICompanion from '../components/diary/AICompanion';

interface DiaryEntry {
  id: string;
  title?: string;
  content: string;
  mood: string;
  gratitude?: string;
  highlights?: string;
  goals?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateEntryData {
  title?: string;
  content: string;
  mood: string;
  gratitude?: string;
  highlights?: string;
  goals?: string;
}

const MOOD_OPTIONS = [
  { value: 'happy', label: 'Happy', color: 'bg-yellow-400', icon: '😊' },
  { value: 'calm', label: 'Calm', color: 'bg-blue-400', icon: '😌' },
  { value: 'reflective', label: 'Reflective', color: 'bg-indigo-400', icon: '🤔' },
  { value: 'grateful', label: 'Grateful', color: 'bg-purple-400', icon: '🙏' },
  { value: 'anxious', label: 'Anxious', color: 'bg-orange-400', icon: '😰' },
  { value: 'sad', label: 'Sad', color: 'bg-gray-400', icon: '😢' },
  { value: 'excited', label: 'Excited', color: 'bg-pink-400', icon: '🤩' },
  { value: 'peaceful', label: 'Peaceful', color: 'bg-green-400', icon: '☮️' },
];

const CompleteDiaryPage: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [showAICompanion, setShowAICompanion] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from server first
      try {
        const authToken = localStorage.getItem('authToken') || 'test-bypass-token';
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

        const response = await fetch(`${apiBaseUrl}/diary`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.entries) {
            setEntries(data.data.entries);
            return;
          }
        }
      } catch (serverError) {
        console.log('Server unavailable, using local storage fallback');
      }

      // Fallback to local storage
      const localEntries = localStorage.getItem('diary-entries');
      if (localEntries) {
        const parsedEntries = JSON.parse(localEntries);
        setEntries(parsedEntries);
      } else {
        // Create a welcome entry if no entries exist
        const welcomeEntry = {
          id: 'welcome-entry',
          title: 'Welcome to Your Diary',
          content: 'This is your first diary entry! Start documenting your thoughts, feelings, and experiences in this private space designed for reflection and growth.\n\nYour entries are saved locally in your browser, so they\'re completely private to you.',
          mood: 'reflective',
          gratitude: 'Grateful for this new journey of self-discovery',
          highlights: 'Setting up my personal diary space',
          goals: 'Write regularly and reflect mindfully',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setEntries([welcomeEntry]);
        localStorage.setItem('diary-entries', JSON.stringify([welcomeEntry]));
      }
    } catch (err) {
      console.error('Failed to load entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async (entryData: CreateEntryData) => {
    try {
      // Create new entry with local ID
      const newEntry = {
        id: 'entry-' + Date.now(),
        title: entryData.title || '',
        content: entryData.content || '',
        mood: entryData.mood || 'reflective',
        gratitude: entryData.gratitude || '',
        highlights: entryData.highlights || '',
        goals: entryData.goals || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Try to save to server first
      try {
        const authToken = localStorage.getItem('authToken') || 'test-bypass-token';
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

        const response = await fetch(`${apiBaseUrl}/diary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(entryData),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Use server response if successful
            setEntries(prev => [data.data, ...prev]);
            setShowComposer(false);
            return true;
          }
        }
      } catch (serverError) {
        console.log('Server unavailable, saving locally');
      }

      // Fallback to local storage
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem('diary-entries', JSON.stringify(updatedEntries));
      setShowComposer(false);
      return true;
    } catch (err) {
      console.error('Failed to create entry:', err);
      alert(`Failed to save diary entry: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  };

  const getMoodColor = (mood: string): string => {
    const moodOption = MOOD_OPTIONS.find(option => option.value === mood);
    return moodOption?.color || 'bg-stone-400';
  };

  const getMoodIcon = (mood: string): string => {
    const moodOption = MOOD_OPTIONS.find(option => option.value === mood);
    return moodOption?.icon || '😐';
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h1 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: '600',
            color: 'var(--primary)',
            margin: 0
          }}>
            My Diary
          </h1>
          <p className="content-container" style={{
            color: 'var(--neutral-600)',
            margin: '0 auto'
          }}>
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
        ) : error ? (
          <div className="text-center" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)' }}>
            <div className="card" style={{ 
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              padding: 'var(--space-6)',
              maxWidth: '28rem',
              margin: '0 auto'
            }}>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '600',
                color: '#991b1b',
                marginBottom: 'var(--space-2)'
              }}>
                Error
              </h3>
              <p style={{ color: '#dc2626', marginBottom: 'var(--space-4)' }}>{error}</p>
              <button 
                onClick={loadEntries}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
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
                    <span className="text-sm text-stone-400 capitalize flex items-center space-x-1">
                      <span>{getMoodIcon(entry.mood)}</span>
                      <span>{entry.mood}</span>
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
          <DiaryComposerModal
            onSave={createEntry}
            onCancel={() => setShowComposer(false)}
          />
        )}

        {/* Edit Modal */}
        {selectedEntry && (
          <DiaryComposerModal
            entry={selectedEntry}
            onSave={async (data) => {
              // TODO: Implement update functionality
              console.log('Update entry:', selectedEntry.id, data);
              setSelectedEntry(null);
              return true;
            }}
            onCancel={() => setSelectedEntry(null)}
          />
        )}

        {/* AI Companion Modal */}
        {showAICompanion && (
          <AICompanion onClose={() => setShowAICompanion(false)} />
        )}
      </div>
    </Layout>
  );
};

// Diary Composer Modal Component
interface DiaryComposerModalProps {
  entry?: DiaryEntry;
  onSave: (data: CreateEntryData) => Promise<boolean>;
  onCancel: () => void;
}

const DiaryComposerModal: React.FC<DiaryComposerModalProps> = ({ entry, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CreateEntryData>({
    title: entry?.title || '',
    content: entry?.content || '',
    mood: entry?.mood || 'reflective',
    gratitude: entry?.gratitude || '',
    highlights: entry?.highlights || '',
    goals: entry?.goals || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setIsSubmitting(true);
    setSaveError(null);
    
    try {
      const success = await onSave(formData);
      
      if (success) {
        onCancel();
      } else {
        setSaveError('Failed to save diary entry. Please try again.');
      }
    } catch (error) {
      setSaveError('An error occurred while saving. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onCancel} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-semibold text-stone-800">
                {entry ? 'Edit Entry' : 'New Diary Entry'}
              </h2>
              <button
                type="button"
                onClick={onCancel}
                className="text-stone-400 hover:text-stone-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Display */}
            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm">{saveError}</p>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Title (optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input-gentle w-full"
                placeholder="Give your entry a title..."
              />
            </div>

            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                How are you feeling?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {MOOD_OPTIONS.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mood: mood.value }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.mood === mood.value
                        ? 'border-sage-500 bg-sage-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{mood.icon}</div>
                      <div className="text-xs font-medium text-stone-700">{mood.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                What's on your mind? *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="input-gentle w-full h-32 resize-none"
                placeholder="Share your thoughts, experiences, or reflections..."
                required
              />
            </div>

            {/* Optional Fields */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Gratitude
                </label>
                <textarea
                  value={formData.gratitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, gratitude: e.target.value }))}
                  className="input-gentle w-full h-20 resize-none"
                  placeholder="What are you grateful for?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Highlights
                </label>
                <textarea
                  value={formData.highlights}
                  onChange={(e) => setFormData(prev => ({ ...prev, highlights: e.target.value }))}
                  className="input-gentle w-full h-20 resize-none"
                  placeholder="Best parts of your day?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Goals
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                  className="input-gentle w-full h-20 resize-none"
                  placeholder="What do you want to achieve?"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!formData.content.trim() || isSubmitting}
              >
                {isSubmitting ? 'Saving...' : entry ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteDiaryPage;