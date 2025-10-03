import { Request, Response } from 'express';
import { ChatbotService } from '../services/chatbotService';
import { vectorService } from '../services/vectorService';

export class ChatController {
  /**
   * Send a message to the AI chatbot
   * POST /api/chat/message
   */
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 Chat message request received');
      console.log('🔍 User:', req.user ? `ID: ${req.user.id}` : 'Not authenticated');
      console.log('🔍 Request body:', req.body);
      
      if (!req.user) {
        console.log('❌ User not authenticated');
        res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const { message } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MESSAGE',
            message: 'Message is required and must be a non-empty string',
          },
        });
        return;
      }

      if (message.length > 1000) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MESSAGE_TOO_LONG',
            message: 'Message must be less than 1000 characters',
          },
        });
        return;
      }

      // Generate AI response
      console.log('🤖 Generating AI response...');
      const response = await ChatbotService.generateResponse(req.user.id, message.trim());
      console.log('✅ AI response generated successfully');

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('❌ Chat message error:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({
        success: false,
        error: {
          code: 'CHAT_MESSAGE_FAILED',
          message: 'Failed to process chat message',
        },
      });
    }
  }

  /**
   * Get chat history
   * GET /api/chat/history
   */
  static async getChatHistory(req: Request, res: Response): Promise<void> {
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

      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const history = await ChatbotService.getChatHistory(req.user.id, limit);

      res.json({
        success: true,
        data: {
          messages: history,
          totalMessages: history.length,
        },
      });
    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_CHAT_HISTORY_FAILED',
          message: 'Failed to fetch chat history',
        },
      });
    }
  }

  /**
   * Clear chat history
   * DELETE /api/chat/history
   */
  static async clearChatHistory(req: Request, res: Response): Promise<void> {
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

      await ChatbotService.clearChatHistory(req.user.id);

      res.json({
        success: true,
        data: {
          message: 'Chat history cleared successfully',
        },
      });
    } catch (error) {
      console.error('Clear chat history error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CLEAR_CHAT_HISTORY_FAILED',
          message: 'Failed to clear chat history',
        },
      });
    }
  }

  /**
   * Get conversation statistics
   * GET /api/chat/stats
   */
  static async getConversationStats(req: Request, res: Response): Promise<void> {
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

      const stats = await ChatbotService.getConversationStats(req.user.id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get conversation stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_CONVERSATION_STATS_FAILED',
          message: 'Failed to fetch conversation statistics',
        },
      });
    }
  }

  /**
   * Get personalized insights based on diary patterns
   * GET /api/chat/insights
   */
  static async getPersonalInsights(req: Request, res: Response): Promise<void> {
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

      console.log(`🔍 Generating personal insights for user ${req.user.id}`);

      // Get user insights from DataStax vector store
      const vectorInsights = await vectorService.getUserInsights(req.user.id);
      
      if (!vectorInsights || vectorInsights.totalEntries === 0) {
        res.json({
          success: true,
          data: {
            insights: [],
            totalEntries: 0,
            analysisDate: new Date().toISOString(),
          },
        });
        return;
      }

      // Generate personalized insights based on vector data
      const insights = await generatePersonalInsights(vectorInsights, req.user.id);

      console.log(`✅ Generated ${insights.length} personal insights`);

      res.json({
        success: true,
        data: {
          insights,
          totalEntries: vectorInsights.totalEntries,
          analysisDate: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Get personal insights error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_PERSONAL_INSIGHTS_FAILED',
          message: 'Failed to fetch personal insights',
        },
      });
    }
  }
}

/**
 * Generate personalized insights from vector data
 */
async function generatePersonalInsights(vectorInsights: any, userId: string): Promise<Array<{
  type: 'pattern' | 'mood' | 'growth' | 'theme';
  title: string;
  description: string;
  confidence: number;
  relatedEntries?: string[];
}>> {
  const insights = [];

  // Entry count and consistency insights
  if (vectorInsights.totalEntries >= 5) {
    insights.push({
      type: 'growth' as const,
      title: 'Consistent Journaling Habit',
      description: `You've written ${vectorInsights.totalEntries} diary entries, showing great commitment to self-reflection. This consistency is building valuable self-awareness.`,
      confidence: 0.9,
    });
  }

  // Word count patterns
  if (vectorInsights.averageWordCount > 150) {
    insights.push({
      type: 'pattern' as const,
      title: 'Detailed Reflector',
      description: `Your entries average ${Math.round(vectorInsights.averageWordCount)} words, indicating you enjoy deep, thoughtful reflection. This thoroughness helps process complex emotions.`,
      confidence: 0.8,
    });
  } else if (vectorInsights.averageWordCount > 0) {
    insights.push({
      type: 'pattern' as const,
      title: 'Concise Communicator',
      description: `You prefer brief, focused entries averaging ${Math.round(vectorInsights.averageWordCount)} words. Sometimes the most powerful insights come in small packages.`,
      confidence: 0.7,
    });
  }

  // Theme analysis
  if (vectorInsights.commonTags && vectorInsights.commonTags.length >= 3) {
    const topThemes = vectorInsights.commonTags.slice(0, 3);
    insights.push({
      type: 'theme' as const,
      title: 'Recurring Life Themes',
      description: `Your writing frequently explores themes around ${topThemes.join(', ')}. These recurring topics suggest important areas of focus in your life journey.`,
      confidence: 0.85,
    });
  }

  // Mood pattern analysis
  const moodEntries = Object.entries(vectorInsights.moodDistribution || {});
  if (moodEntries.length > 0) {
    const totalMoodEntries = moodEntries.reduce((sum, [, count]) => sum + (count as number), 0);
    const topMood = moodEntries.reduce((a, b) => ((a[1] as number) > (b[1] as number) ? a : b));
    const moodPercentage = Math.round(((topMood[1] as number) / totalMoodEntries) * 100);
    
    if (moodPercentage > 40) {
      insights.push({
        type: 'mood' as const,
        title: `${topMood[0].charAt(0).toUpperCase() + topMood[0].slice(1)} Mood Pattern`,
        description: `${moodPercentage}% of your entries reflect a ${topMood[0]} mood. This pattern offers insight into your emotional landscape and can guide future self-care practices.`,
        confidence: 0.75,
      });
    }

    // Emotional diversity insight
    if (moodEntries.length >= 4) {
      insights.push({
        type: 'growth' as const,
        title: 'Emotional Range Awareness',
        description: `You've documented ${moodEntries.length} different emotional states, showing healthy emotional awareness and the courage to explore various feelings.`,
        confidence: 0.8,
      });
    }
  }

  // Time-based insights (if we have time range data)
  if (vectorInsights.timeRange) {
    const daysDiff = Math.ceil((vectorInsights.timeRange.end.getTime() - vectorInsights.timeRange.start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 7 && vectorInsights.totalEntries >= 5) {
      const frequency = Math.round(daysDiff / vectorInsights.totalEntries);
      insights.push({
        type: 'pattern' as const,
        title: 'Journaling Rhythm',
        description: `You write approximately every ${frequency} days over the past ${daysDiff} days. Finding your natural rhythm helps maintain this valuable practice.`,
        confidence: 0.7,
      });
    }
  }

  // Growth potential insights
  if (vectorInsights.totalEntries >= 10) {
    insights.push({
      type: 'growth' as const,
      title: 'Self-Discovery Journey',
      description: `With ${vectorInsights.totalEntries} entries, you're building a rich tapestry of self-knowledge. Consider reviewing older entries to see how you've grown and evolved.`,
      confidence: 0.9,
    });
  }

  return insights.slice(0, 6); // Limit to 6 insights for better UX
}