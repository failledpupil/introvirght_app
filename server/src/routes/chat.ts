import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all chat routes
router.use(authenticateToken);

/**
 * POST /api/chat/message
 * Send a message to the AI chatbot
 */
router.post('/message', ChatController.sendMessage);

/**
 * GET /api/chat/history
 * Get chat conversation history
 * Query params: limit (max messages to return)
 */
router.get('/history', ChatController.getChatHistory);

/**
 * DELETE /api/chat/history
 * Clear chat conversation history
 */
router.delete('/history', ChatController.clearChatHistory);

/**
 * GET /api/chat/stats
 * Get conversation statistics
 */
router.get('/stats', ChatController.getConversationStats);

export default router;