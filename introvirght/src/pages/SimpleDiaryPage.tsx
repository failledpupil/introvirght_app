import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

interface SimpleDiaryEntry {
  id: string;
  content: string;
  mood: string;
  createdAt: string;
}

const SimpleDiaryPage: React.FC = () => {
  const [entries, setEntries] = useState<SimpleDiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/diary', {
        headers: {
          'Authorization': 'Bearer test-bypass-token',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data && data.data.entries) {
        setEntries(data.data.entries);
      } else {
        setError('No entries found');
      }
    } catch (err) {
      console.error('Failed to load entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-serif font-semibold text-sage-700">
            My Diary
          </h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Your private space for reflection, growth, and mindful journaling.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-600">{error}</p>
              <button 
                onClick={loadEntries}
                className="mt-4 btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-serif font-semibold text-stone-700 mb-4">
              No entries found
            </h3>
            <p className="text-stone-600">
              Your diary appears to be empty.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-stone-100">
              <p className="text-stone-600 text-sm">
                You have <span className="font-semibold text-sage-600">{entries.length}</span> {entries.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>

            {entries.map((entry) => (
              <div key={entry.id} className="card-gentle">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
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
                </div>
                
                <div className="prose prose-stone max-w-none">
                  <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SimpleDiaryPage;