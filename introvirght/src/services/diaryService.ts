import type { 
  DiaryEntry, 
  CreateDiaryEntryData, 
  UpdateDiaryEntryData, 
  DiaryEntriesResponse, 
  MoodStats, 
  MoodOption,
  ApiResponse
} from '../types';

// API base URL - points to our backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export class DiaryService {
  /**
   * Helper method to get stored entries from localStorage
   */
  private static getStoredEntries(): DiaryEntry[] {
    try {
      const stored = localStorage.getItem('diaryEntries');
      if (!stored) return [];
      
      const entries = JSON.parse(stored);
      return entries.map((entry: any) => ({
        ...entry,
        createdAt: new Date(entry.createdAt),
        updatedAt: new Date(entry.updatedAt),
      }));
    } catch {
      return [];
    }
  }
  /**
   * Create a new diary entry
   */
  static async createEntry(entryData: CreateDiaryEntryData): Promise<ApiResponse<DiaryEntry>> {
    try {
      console.log('✅ Client-side createEntry:', entryData);
      
      // Get existing entries from localStorage
      const existingEntries = this.getStoredEntries();
      
      // Create new entry
      const newEntry: DiaryEntry = {
        id: 'entry-' + Date.now(),
        title: entryData.title,
        content: entryData.content,
        mood: entryData.mood,
        gratitude: entryData.gratitude || '',
        highlights: entryData.highlights || '',
        goals: entryData.goals || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Add to existing entries
      const updatedEntries = [newEntry, ...existingEntries];
      
      // Store back to localStorage
      localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
      
      return {
        success: true,
        data: newEntry,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to save diary entry',
        },
      };
    }
  }

  /**
   * Get user's diary entries
   */
  static async getEntries(page: number = 1, limit: number = 20): Promise<ApiResponse<DiaryEntriesResponse>> {
    try {
      console.log('✅ Client-side getEntries, page:', page, 'limit:', limit);
      
      const allEntries = this.getStoredEntries();
      
      // Implement pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedEntries = allEntries.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: {
          entries: paginatedEntries,
          pagination: {
            page,
            limit,
            total: allEntries.length,
            hasMore: endIndex < allEntries.length,
          },
        },
      };
    } catch (error) {
      console.error('Storage error fetching entries:', error);
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to fetch diary entries',
        },
      };
    }
  }

  /**
   * Get a specific diary entry
   */
  static async getEntry(entryId: string): Promise<ApiResponse<DiaryEntry>> {
    try {
      console.log('✅ Client-side getEntry:', entryId);
      
      const entries = this.getStoredEntries();
      const entry = entries.find(e => e.id === entryId);
      
      if (!entry) {
        return {
          success: false,
          error: {
            code: 'ENTRY_NOT_FOUND',
            message: 'Diary entry not found',
          },
        };
      }

      return {
        success: true,
        data: entry,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to fetch diary entry',
        },
      };
    }
  }

  /**
   * Update a diary entry
   */
  static async updateEntry(entryId: string, updateData: UpdateDiaryEntryData): Promise<ApiResponse<DiaryEntry>> {
    try {
      console.log('✅ Client-side updateEntry:', entryId, updateData);
      
      const entries = this.getStoredEntries();
      const entryIndex = entries.findIndex(e => e.id === entryId);
      
      if (entryIndex === -1) {
        return {
          success: false,
          error: {
            code: 'ENTRY_NOT_FOUND',
            message: 'Diary entry not found',
          },
        };
      }

      // Update the entry
      const updatedEntry = {
        ...entries[entryIndex],
        ...updateData,
        updatedAt: new Date(),
      };
      
      entries[entryIndex] = updatedEntry;
      localStorage.setItem('diaryEntries', JSON.stringify(entries));

      return {
        success: true,
        data: updatedEntry,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to update diary entry',
        },
      };
    }
  }

  /**
   * Delete a diary entry
   */
  static async deleteEntry(entryId: string): Promise<ApiResponse<void>> {
    try {
      console.log('✅ Client-side deleteEntry:', entryId);
      
      const entries = this.getStoredEntries();
      const filteredEntries = entries.filter(e => e.id !== entryId);
      
      localStorage.setItem('diaryEntries', JSON.stringify(filteredEntries));

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to delete diary entry',
        },
      };
    }
  }

  /**
   * Get mood statistics
   */
  static async getMoodStats(): Promise<ApiResponse<MoodStats>> {
    try {
      console.log('✅ Client-side getMoodStats');
      
      const entries = this.getStoredEntries();
      const moodCounts: Record<string, number> = {};
      
      entries.forEach(entry => {
        if (entry.mood) {
          moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        }
      });

      return {
        success: true,
        data: {
          totalEntries: entries.length,
          moodDistribution: moodCounts,
          mostCommonMood: Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b, 'neutral'),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to calculate mood statistics',
        },
      };
    }
  }

  /**
   * Search diary entries using simple text search
   */
  static async searchEntries(query: string, limit: number = 10): Promise<ApiResponse<{ query: string; entries: DiaryEntry[]; totalResults: number }>> {
    try {
      console.log('✅ Client-side searchEntries:', query);
      
      const entries = this.getStoredEntries();
      const searchTerm = query.toLowerCase();
      
      const matchingEntries = entries.filter(entry => 
        entry.title.toLowerCase().includes(searchTerm) ||
        entry.content.toLowerCase().includes(searchTerm) ||
        entry.gratitude?.toLowerCase().includes(searchTerm) ||
        entry.highlights?.toLowerCase().includes(searchTerm) ||
        entry.goals?.toLowerCase().includes(searchTerm)
      ).slice(0, limit);

      return {
        success: true,
        data: {
          query,
          entries: matchingEntries,
          totalResults: matchingEntries.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to search diary entries',
        },
      };
    }
  }

  /**
   * Get AI insights from diary patterns (client-side demo)
   */
  static async getInsights(): Promise<ApiResponse<any>> {
    try {
      console.log('✅ Client-side getInsights');
      
      const entries = this.getStoredEntries();
      
      return {
        success: true,
        data: {
          totalEntries: entries.length,
          averageWordsPerEntry: entries.length > 0 ? Math.round(entries.reduce((sum, entry) => sum + entry.content.split(' ').length, 0) / entries.length) : 0,
          writingStreak: entries.length,
          insights: [
            "You're building a consistent writing habit!",
            "Your entries show thoughtful reflection.",
            "Keep documenting your journey of growth."
          ]
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to generate insights',
        },
      };
    }
  }

  /**
   * Get available mood types
   */
  static async getMoodTypes(): Promise<ApiResponse<MoodOption[]>> {
    try {
      console.log('✅ Client-side getMoodTypes');
      
      const moodTypes: MoodOption[] = [
        { value: 'happy', label: 'Happy', emoji: '😊' },
        { value: 'sad', label: 'Sad', emoji: '😢' },
        { value: 'excited', label: 'Excited', emoji: '🎉' },
        { value: 'anxious', label: 'Anxious', emoji: '😰' },
        { value: 'calm', label: 'Calm', emoji: '😌' },
        { value: 'frustrated', label: 'Frustrated', emoji: '😤' },
        { value: 'grateful', label: 'Grateful', emoji: '🙏' },
        { value: 'reflective', label: 'Reflective', emoji: '🤔' },
        { value: 'energetic', label: 'Energetic', emoji: '⚡' },
        { value: 'peaceful', label: 'Peaceful', emoji: '☮️' },
      ];

      return {
        success: true,
        data: moodTypes,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MOOD_TYPES_ERROR',
          message: 'Unable to fetch mood types',
        },
      };
    }
  }
}