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
   * Create a new diary entry
   */
  static async createEntry(entryData: CreateDiaryEntryData): Promise<ApiResponse<DiaryEntry>> {
    try {
      // TEMPORARY: Bypass token for testing
      const token = 'test-bypass-token';
      
      console.log('Creating diary entry with data:', entryData);
      console.log('API URL:', `${API_BASE_URL}/diary`);
      
      const response = await fetch(`${API_BASE_URL}/diary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(entryData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Log the full response for debugging
      const responseClone = response.clone();
      const responseText = await responseClone.text();
      console.log('Full response text:', responseText);
      
      if (!response.ok) {
        let errorData;
        try {
          const responseText = await response.text();
          console.error('Response text:', responseText);
          errorData = responseText ? JSON.parse(responseText) : { error: { code: 'EMPTY_RESPONSE', message: 'Empty error response' } };
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { error: { code: 'PARSE_ERROR', message: `HTTP ${response.status}: ${response.statusText}` } };
        }
        console.error('API Error:', errorData);
        return {
          success: false,
          error: errorData.error || { code: 'CREATE_ENTRY_FAILED', message: 'Failed to create diary entry' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          ...data.data,
          createdAt: new Date(data.data.createdAt),
          updatedAt: new Date(data.data.updatedAt),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  /**
   * Get user's diary entries
   */
  static async getEntries(page: number = 1, limit: number = 20): Promise<ApiResponse<DiaryEntriesResponse>> {
    try {
      // TEMPORARY: Bypass token for testing
      const token = 'test-bypass-token';
      
      console.log('Fetching diary entries...');
      console.log('API URL:', `${API_BASE_URL}/diary?page=${page}&limit=${limit}`);
      
      const response = await fetch(`${API_BASE_URL}/diary?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('getEntries response status:', response.status);
      
      // Log the full response for debugging
      const responseClone = response.clone();
      const responseText = await responseClone.text();
      console.log('getEntries response text:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: { code: 'PARSE_ERROR', message: 'Failed to parse error response' } };
        }
        console.error('API Error:', errorData);
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_ENTRIES_FAILED', message: 'Failed to fetch diary entries' },
        };
      }

      const data = await response.json();
      console.log('Parsed entries data:', data);
      
      return {
        success: true,
        data: {
          entries: data.data.entries.map((entry: any) => ({
            ...entry,
            createdAt: new Date(entry.createdAt),
            updatedAt: new Date(entry.updatedAt),
          })),
          pagination: data.data.pagination,
        },
      };
    } catch (error) {
      console.error('Network error fetching entries:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  /**
   * Get a specific diary entry
   */
  static async getEntry(entryId: string): Promise<ApiResponse<DiaryEntry>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/diary/${entryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_ENTRY_FAILED', message: 'Failed to fetch diary entry' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          ...data.data,
          createdAt: new Date(data.data.createdAt),
          updatedAt: new Date(data.data.updatedAt),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  /**
   * Update a diary entry
   */
  static async updateEntry(entryId: string, updateData: UpdateDiaryEntryData): Promise<ApiResponse<DiaryEntry>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/diary/${entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'UPDATE_ENTRY_FAILED', message: 'Failed to update diary entry' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          ...data.data,
          createdAt: new Date(data.data.createdAt),
          updatedAt: new Date(data.data.updatedAt),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  /**
   * Delete a diary entry
   */
  static async deleteEntry(entryId: string): Promise<ApiResponse<void>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/diary/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'DELETE_ENTRY_FAILED', message: 'Failed to delete diary entry' },
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  /**
   * Get mood statistics
   */
  static async getMoodStats(): Promise<ApiResponse<MoodStats>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/diary/moods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_MOOD_STATS_FAILED', message: 'Failed to fetch mood statistics' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  /**
   * Search diary entries using semantic similarity
   */
  static async searchEntries(query: string, limit: number = 10): Promise<ApiResponse<{ query: string; entries: DiaryEntry[]; totalResults: number }>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/diary/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'SEARCH_FAILED', message: 'Failed to search diary entries' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          query: data.data.query,
          entries: data.data.entries.map((entry: any) => ({
            ...entry,
            createdAt: new Date(entry.createdAt),
            updatedAt: new Date(entry.updatedAt),
          })),
          totalResults: data.data.totalResults,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  /**
   * Get AI insights from diary patterns
   */
  static async getInsights(): Promise<ApiResponse<any>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/diary/insights`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'INSIGHTS_FAILED', message: 'Failed to get insights' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  /**
   * Get available mood types
   */
  static async getMoodTypes(): Promise<ApiResponse<MoodOption[]>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/diary/mood-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_MOOD_TYPES_FAILED', message: 'Failed to fetch mood types' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }
}