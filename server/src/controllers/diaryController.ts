import { Request, Response } from 'express';
import { DiaryEntryModel, MoodType, type CreateDiaryEntryData, type UpdateDiaryEntryData } from '../models/DiaryEntry';
import { VectorService } from '../services/vectorService';

export interface CreateDiaryEntryRequest {
  title?: string;
  content: string;
  mood: MoodType;
  gratitude?: string;
  highlights?: string;
  goals?: string;
}

export interface UpdateDiaryEntryRequest {
  title?: string;
  content?: string;
  mood?: MoodType;
  gratitude?: string;
  highlights?: string;
  goals?: string;
}

export class DiaryController {
  /**
   * Create a new diary entry
   * POST /api/diary
   */
  static async createEntry(req: Request, res: Response): Promise<void> {
    try {
      console.log('Diary create request received');
      console.log('Request body:', req.body);
      console.log('User authenticated:', !!req.user);
      console.log('User ID:', req.user?.id);
      
      if (!req.user) {
        console.log('Authentication failed - no user');
        res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const entryData: CreateDiaryEntryRequest = req.body;

      // Validate the request data
      const validation = DiaryEntryModel.validateCreateData({
        userId: req.user.id,
        ...entryData,
      });

      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid diary entry data',
            details: { errors: validation.errors },
          },
        });
        return;
      }

      // Create the diary entry
      const diaryEntry = await DiaryEntryModel.create({
        userId: req.user.id,
        title: entryData.title,
        content: entryData.content,
        mood: entryData.mood,
        gratitude: entryData.gratitude,
        highlights: entryData.highlights,
        goals: entryData.goals,
      });

      // Generate vector embedding for AI features (async, non-blocking)
      const userId = req.user.id; // Capture user ID before async operation
      setImmediate(async () => {
        try {
          const fullContent = [
            entryData.title,
            entryData.content,
            entryData.gratitude,
            entryData.highlights,
            entryData.goals
          ].filter(Boolean).join(' ');

          const vectorId = await VectorService.storeVector(
            userId,
            diaryEntry.id,
            fullContent,
            entryData.mood,
            diaryEntry.createdAt
          );

          // Update diary entry with vector ID
          await DiaryEntryModel.updateVectorId(diaryEntry.id, userId, vectorId);
          console.log('Vector embedding created successfully for entry:', diaryEntry.id);
        } catch (vectorError) {
          console.error('Failed to create vector embedding:', vectorError);
          // This is non-blocking, so diary entry creation still succeeds
        }
      });

      res.status(201).json({
        success: true,
        data: diaryEntry,
      });
    } catch (error) {
      console.error('Create diary entry error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ENTRY_FAILED',
          message: 'Failed to create diary entry',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * Get user's diary entries
   * GET /api/diary
   */
  static async getEntries(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      // Parse query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50); // Max 50 entries per page
      const offset = (page - 1) * limit;

      // Get entries for the user
      const entries = await DiaryEntryModel.findByUserId(req.user.id, {
        limit,
        offset,
        orderBy: 'created_at',
        order: 'DESC',
      });

      // Get total count for pagination
      const totalCount = await DiaryEntryModel.getCountByUserId(req.user.id);
      const hasMore = offset + entries.length < totalCount;

      res.json({
        success: true,
        data: {
          entries,
          pagination: {
            page,
            limit,
            total: totalCount,
            hasMore,
          },
        },
      });
    } catch (error) {
      console.error('Get diary entries error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ENTRIES_FAILED',
          message: 'Failed to fetch diary entries',
        },
      });
    }
  }

  /**
   * Get a specific diary entry
   * GET /api/diary/:id
   */
  static async getEntry(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_ENTRY_ID',
            message: 'Diary entry ID is required',
          },
        });
        return;
      }

      // Find the entry (with user ownership check)
      const entry = await DiaryEntryModel.findById(id, req.user.id);

      if (!entry) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ENTRY_NOT_FOUND',
            message: 'Diary entry not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: entry,
      });
    } catch (error) {
      console.error('Get diary entry error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ENTRY_FAILED',
          message: 'Failed to fetch diary entry',
        },
      });
    }
  }

  /**
   * Update a diary entry
   * PUT /api/diary/:id
   */
  static async updateEntry(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const { id } = req.params;
      const updateData: UpdateDiaryEntryRequest = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_ENTRY_ID',
            message: 'Diary entry ID is required',
          },
        });
        return;
      }

      // Validate the update data
      const validation = DiaryEntryModel.validateUpdateData(updateData);

      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid update data',
            details: { errors: validation.errors },
          },
        });
        return;
      }

      // Update the entry
      const updatedEntry = await DiaryEntryModel.update(id, req.user.id, updateData);

      if (!updatedEntry) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ENTRY_NOT_FOUND',
            message: 'Diary entry not found or you do not have permission to update it',
          },
        });
        return;
      }

      // Update vector embedding if entry has one
      if (updatedEntry.vectorId) {
        try {
          const fullContent = [
            updatedEntry.title,
            updatedEntry.content,
            updatedEntry.gratitude,
            updatedEntry.highlights,
            updatedEntry.goals
          ].filter(Boolean).join(' ');

          await VectorService.updateVector(
            updatedEntry.vectorId,
            fullContent,
            updatedEntry.mood,
            updatedEntry.updatedAt
          );
        } catch (vectorError) {
          console.error('Failed to update vector embedding:', vectorError);
          // Continue without vector update - don't fail the diary entry update
        }
      }

      res.json({
        success: true,
        data: updatedEntry,
      });
    } catch (error) {
      console.error('Update diary entry error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ENTRY_FAILED',
          message: 'Failed to update diary entry',
        },
      });
    }
  }

  /**
   * Delete a diary entry
   * DELETE /api/diary/:id
   */
  static async deleteEntry(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_ENTRY_ID',
            message: 'Diary entry ID is required',
          },
        });
        return;
      }

      // Get the entry first to check if it has a vector
      const entry = await DiaryEntryModel.findById(id, req.user.id);
      
      if (!entry) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ENTRY_NOT_FOUND',
            message: 'Diary entry not found or you do not have permission to delete it',
          },
        });
        return;
      }

      // Delete the entry
      const deleted = await DiaryEntryModel.delete(id, req.user.id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ENTRY_NOT_FOUND',
            message: 'Diary entry not found or you do not have permission to delete it',
          },
        });
        return;
      }

      // Delete associated vector if it exists
      if (entry.vectorId) {
        try {
          await VectorService.deleteVector(entry.vectorId);
        } catch (vectorError) {
          console.error('Failed to delete vector embedding:', vectorError);
          // Continue - diary entry is already deleted
        }
      }

      res.json({
        success: true,
        data: {
          message: 'Diary entry deleted successfully',
        },
      });
    } catch (error) {
      console.error('Delete diary entry error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ENTRY_FAILED',
          message: 'Failed to delete diary entry',
        },
      });
    }
  }

  /**
   * Get mood statistics for user
   * GET /api/diary/moods
   */
  static async getMoodStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const moodStats = await DiaryEntryModel.getMoodStats(req.user.id);

      res.json({
        success: true,
        data: {
          moodStats,
          totalEntries: Object.values(moodStats).reduce((sum, count) => sum + count, 0),
        },
      });
    } catch (error) {
      console.error('Get mood stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_MOOD_STATS_FAILED',
          message: 'Failed to fetch mood statistics',
        },
      });
    }
  }

  /**
   * Search diary entries using semantic similarity
   * GET /api/diary/search?q=query
   */
  static async searchEntries(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const query = req.query.q as string;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 20);

      if (!query || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_QUERY',
            message: 'Search query is required',
          },
        });
        return;
      }

      // Search similar entries using vector similarity
      const similarVectors = await VectorService.searchSimilar(req.user.id, query, limit);
      
      // Get the actual diary entries
      const entryIds = similarVectors.map(vector => vector.entryId);
      const entries = [];
      
      for (const entryId of entryIds) {
        const entry = await DiaryEntryModel.findById(entryId, req.user.id);
        if (entry) {
          entries.push(entry);
        }
      }

      res.json({
        success: true,
        data: {
          query,
          entries,
          totalResults: entries.length,
        },
      });
    } catch (error) {
      console.error('Search diary entries error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SEARCH_FAILED',
          message: 'Failed to search diary entries',
        },
      });
    }
  }

  /**
   * Get AI insights from diary patterns
   * GET /api/diary/insights
   */
  static async getInsights(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const stats = await VectorService.getUserVectorStats(req.user.id);

      // Generate simple insights based on the data
      const insights = {
        totalEntries: stats.totalVectors,
        overallMood: stats.averageSentiment > 0.1 ? 'positive' : 
                     stats.averageSentiment < -0.1 ? 'negative' : 'neutral',
        sentimentScore: Math.round(stats.averageSentiment * 100) / 100,
        topTopics: stats.topTopics.slice(0, 5),
        moodDistribution: stats.moodDistribution,
        insights: generateInsightMessages(stats)
      };

      res.json({
        success: true,
        data: insights,
      });
    } catch (error) {
      console.error('Get insights error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INSIGHTS_FAILED',
          message: 'Failed to generate insights',
        },
      });
    }
  }

  /**
   * Get available mood types
   * GET /api/diary/mood-types
   */
  static async getMoodTypes(req: Request, res: Response): Promise<void> {
    try {
      const moodTypes = Object.values(MoodType).map(mood => ({
        value: mood,
        label: mood.charAt(0).toUpperCase() + mood.slice(1),
        color: getMoodColor(mood),
        icon: getMoodIcon(mood),
      }));

      res.json({
        success: true,
        data: moodTypes,
      });
    } catch (error) {
      console.error('Get mood types error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_MOOD_TYPES_FAILED',
          message: 'Failed to fetch mood types',
        },
      });
    }
  }
}

/**
 * Helper function to get mood color
 */
function getMoodColor(mood: MoodType): string {
  const colors: Record<MoodType, string> = {
    [MoodType.HAPPY]: '#fbbf24', // yellow-400
    [MoodType.CALM]: '#60a5fa', // blue-400
    [MoodType.REFLECTIVE]: '#a78bfa', // violet-400
    [MoodType.GRATEFUL]: '#34d399', // emerald-400
    [MoodType.ANXIOUS]: '#f87171', // red-400
    [MoodType.SAD]: '#6b7280', // gray-500
    [MoodType.EXCITED]: '#fb7185', // rose-400
    [MoodType.PEACEFUL]: '#6ee7b7', // emerald-300
  };
  return colors[mood] || '#9ca3af'; // gray-400 as fallback
}

/**
 * Helper function to get mood icon
 */
function getMoodIcon(mood: MoodType): string {
  const icons: Record<MoodType, string> = {
    [MoodType.HAPPY]: '😊',
    [MoodType.CALM]: '😌',
    [MoodType.REFLECTIVE]: '🤔',
    [MoodType.GRATEFUL]: '🙏',
    [MoodType.ANXIOUS]: '😰',
    [MoodType.SAD]: '😢',
    [MoodType.EXCITED]: '🤩',
    [MoodType.PEACEFUL]: '☮️',
  };
  return icons[mood] || '😐';
}

/**
 * Generate insight messages based on user's diary patterns
 */
function generateInsightMessages(stats: any): string[] {
  const insights: string[] = [];

  // Sentiment insights
  if (stats.averageSentiment > 0.3) {
    insights.push("Your diary reflects a generally positive outlook. Keep nurturing this optimistic mindset!");
  } else if (stats.averageSentiment < -0.3) {
    insights.push("Your entries show some challenging emotions. Remember, it's okay to feel difficult emotions - they're part of growth.");
  } else {
    insights.push("Your emotional tone is balanced, showing both ups and downs - a natural part of life's journey.");
  }

  // Topic insights
  if (stats.topTopics.length > 0) {
    insights.push(`You frequently write about: ${stats.topTopics.slice(0, 3).join(', ')}. These seem to be important themes in your life.`);
  }

  // Mood distribution insights
  const moodEntries = Object.entries(stats.moodDistribution);
  if (moodEntries.length > 0) {
    const topMood = moodEntries.reduce((a, b) => (a[1] as number) > (b[1] as number) ? a : b);
    insights.push(`Your most common mood is "${topMood[0]}" - this gives insight into your emotional patterns.`);
  }

  // Entry count insights
  if (stats.totalVectors > 10) {
    insights.push("You're building a wonderful habit of regular reflection. This consistency will serve you well!");
  } else if (stats.totalVectors > 0) {
    insights.push("You're starting your journaling journey. Each entry is a step toward greater self-awareness.");
  }

  return insights;
}