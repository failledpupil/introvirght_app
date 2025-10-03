import React, { useState, useEffect } from 'react';
import type { DiaryEntry, CreateDiaryEntryData, UpdateDiaryEntryData, MoodType, MoodOption } from '../../types';
import { DiaryService } from '../../services';

interface DiaryComposerProps {
  entry?: DiaryEntry;
  onSave: (entry: DiaryEntry) => void;
  onCancel: () => void;
}

const DiaryComposer: React.FC<DiaryComposerProps> = ({ entry, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: entry?.title || '',
    content: entry?.content || '',
    mood: entry?.mood || 'reflective' as MoodType,
    gratitude: entry?.gratitude || '',
    highlights: entry?.highlights || '',
    goals: entry?.goals || '',
  });
  
  const [moodOptions, setMoodOptions] = useState<MoodOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Load mood options
  useEffect(() => {
    const loadMoodOptions = async () => {
      try {
        const response = await DiaryService.getMoodTypes();
        if (response.success && response.data) {
          setMoodOptions(response.data);
        }
      } catch (error) {
        console.error('Failed to load mood options:', error);
      }
    };
    loadMoodOptions();
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: string[] = [];
    if (!formData.content.trim()) {
      newErrors.push('Reflection content is required');
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      if (entry) {
        // Update existing entry
        const updateData: UpdateDiaryEntryData = {
          title: formData.title || undefined,
          content: formData.content,
          mood: formData.mood,
          gratitude: formData.gratitude || undefined,
          highlights: formData.highlights || undefined,
          goals: formData.goals || undefined,
        };
        
        const response = await DiaryService.updateEntry(entry.id, updateData);
        if (response.success && response.data) {
          onSave(response.data);
        } else {
          setErrors([response.error?.message || 'Failed to update entry']);
        }
      } else {
        // Create new entry
        const createData: CreateDiaryEntryData = {
          title: formData.title || undefined,
          content: formData.content,
          mood: formData.mood,
          gratitude: formData.gratitude || undefined,
          highlights: formData.highlights || undefined,
          goals: formData.goals || undefined,
        };
        
        const response = await DiaryService.createEntry(createData);
        if (response.success && response.data) {
          onSave(response.data);
        } else {
          console.error('Failed to create diary entry:', response.error);
          setErrors([response.error?.message || 'Failed to create entry']);
        }
      }
    } catch (error) {
      setErrors(['An unexpected error occurred']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-stone-200 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-sage-700">
              {entry ? 'Edit Entry' : 'New Diary Entry'}
            </h2>
            <p className="text-stone-500 text-sm mt-1">{currentDate}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                {errors.map((error, index) => (
                  <p key={index} className="text-red-700 text-sm">{error}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">
            Title <span className="text-stone-400">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="input-gentle"
            placeholder="Give your entry a title..."
            disabled={isSubmitting}
          />
        </div>

        {/* Mood Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-stone-700">
            How are you feeling today?
          </label>
          <div className="grid grid-cols-4 gap-3">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => handleInputChange('mood', mood.value)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-1 ${
                  formData.mood === mood.value
                    ? 'border-sage-300 bg-sage-50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
                disabled={isSubmitting}
              >
                <span className="text-2xl">{mood.icon}</span>
                <span className="text-xs font-medium text-stone-700">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gratitude */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">
            What am I grateful for today? <span className="text-stone-400">(optional)</span>
          </label>
          <textarea
            value={formData.gratitude}
            onChange={(e) => handleInputChange('gratitude', e.target.value)}
            className="input-gentle resize-none h-20"
            placeholder="Three things I'm grateful for..."
            disabled={isSubmitting}
          />
        </div>

        {/* Main Reflection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">
            My Reflection <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            className="input-gentle resize-none h-32"
            placeholder="What's on my mind today? How am I feeling? What happened that was meaningful..."
            disabled={isSubmitting}
            required
          />
          <div className="text-right">
            <span className="text-xs text-stone-500">
              {formData.content.length}/10000 characters
            </span>
          </div>
        </div>

        {/* Highlights */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">
            Today's Highlights <span className="text-stone-400">(optional)</span>
          </label>
          <textarea
            value={formData.highlights}
            onChange={(e) => handleInputChange('highlights', e.target.value)}
            className="input-gentle resize-none h-20"
            placeholder="What were the best parts of today?"
            disabled={isSubmitting}
          />
        </div>

        {/* Goals */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">
            Tomorrow's Intentions <span className="text-stone-400">(optional)</span>
          </label>
          <textarea
            value={formData.goals}
            onChange={(e) => handleInputChange('goals', e.target.value)}
            className="input-gentle resize-none h-20"
            placeholder="What do I want to focus on tomorrow?"
            disabled={isSubmitting}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-stone-100">
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
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            disabled={isSubmitting || !formData.content.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{entry ? 'Updating...' : 'Saving...'}</span>
              </>
            ) : (
              <span>{entry ? 'Update Entry' : 'Save Entry'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiaryComposer;