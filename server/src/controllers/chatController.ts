import { Request, Response } from 'express';
import { ChatbotService } from '../services/chatbotService';

export class ChatController {
  /**
   * Send a message to the AI chatbot
   * POST /api/chat/message
   */
  static async sendMessage(req: Request, res: Response): Promise<void> {
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
      const response = await ChatbotService.generateResponse(req.user.id, message.trim());

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Chat message error:', error);
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
}