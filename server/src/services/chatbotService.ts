import { VectorService } from './vectorService';
import { DiaryEntryModel } from '../models/DiaryEntry';
import { getDatabase } from '../config/database';
import { OpenAIService, type OpenAIMessage } from './openaiService';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    relatedEntries: string[];
    mood?: string;
    sentiment?: number;
  };
}

export interface ChatResponse {
  message: ChatMessage;
  relatedEntries?: any[];
}

export class ChatbotService {
  /**
   * Generate AI response based on user message and diary context
   */
  static async generateResponse(userId: string, userMessage: string): Promise<ChatResponse> {
    // Get relevant diary entries using vector similarity
    const similarVectors = await VectorService.searchSimilar(userId, userMessage, 3);
    
    // Get the actual diary entries for context
    const relatedEntries = [];
    for (const vector of similarVectors) {
      const entry = await DiaryEntryModel.findById(vector.entryId, userId);
      if (entry) {
        relatedEntries.push({
          id: entry.id,
          date: entry.createdAt.toDateString(),
          mood: entry.mood,
          content: entry.content.substring(0, 200) + (entry.content.length > 200 ? '...' : ''),
          sentiment: vector.metadata.sentiment
        });
      }
    }

    // Generate contextual response
    const aiResponse = await this.generateContextualResponse(userMessage, relatedEntries, userId);
    
    // Save both messages to chat history
    await this.saveChatMessage(userId, 'user', userMessage);
    const assistantChatMessage = await this.saveChatMessage(userId, 'assistant', aiResponse, {
      relatedEntries: relatedEntries.map(e => e.id),
      sentiment: this.analyzeSentiment(userMessage)
    });

    return {
      message: assistantChatMessage,
      relatedEntries
    };
  }

  /**
   * Generate contextual AI response using OpenAI GPT
   */
  private static async generateContextualResponse(
    userMessage: string, 
    relatedEntries: any[], 
    userId: string
  ): Promise<string> {
    try {
      // Get user's overall patterns
      const stats = await VectorService.getUserVectorStats(userId);
      
      // Get recent conversation history for context
      const recentMessages = await this.getChatHistory(userId, 6);
      
      // Create system prompt with user context
      const systemPrompt = OpenAIService.createDiaryCompanionSystemPrompt(stats, relatedEntries);
      
      // Build conversation messages
      const messages: OpenAIMessage[] = [
        { role: 'system', content: systemPrompt }
      ];
      
      // Add recent conversation history (excluding system messages)
      recentMessages.slice(-4).forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
      
      // Add current user message
      messages.push({ role: 'user', content: userMessage });
      
      // Generate response using OpenAI
      const response = await OpenAIService.generateChatCompletion(messages, {
        temperature: 0.7,
        maxTokens: 300
      });
      
      return response.content;
      
    } catch (error) {
      console.error('OpenAI response generation failed:', error);
      
      // Fallback to rule-based response if OpenAI fails
      return this.generateFallbackResponse(userMessage, relatedEntries);
    }
  }

  /**
   * Fallback response generation when OpenAI is unavailable
   */
  private static generateFallbackResponse(userMessage: string, relatedEntries: any[]): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello! I'm here to help you reflect on your thoughts and feelings. I've been reading your diary entries and I'm here to support your journey of self-discovery. What's on your mind today?`;
    }
    
    // Mood-related queries
    if (lowerMessage.includes('mood') || lowerMessage.includes('feeling')) {
      if (relatedEntries.length > 0) {
        const moods = relatedEntries.map(e => e.mood);
        return `I notice you've written about feeling ${moods.join(', ')} in similar situations. How are you feeling about this right now?`;
      }
      return `I'd love to help you explore your feelings. Your diary shows you experience a range of emotions, which is completely natural. What specific mood or feeling would you like to talk about?`;
    }
    
    // Pattern recognition
    if (relatedEntries.length > 0) {
      return `I found some related entries in your diary from ${relatedEntries[0].date}. This seems to be something you've reflected on before. What aspects of this would you like to explore further?`;
    }
    
    // Default supportive response
    return `Thank you for sharing that with me. I'm here to listen and help you reflect on your thoughts and experiences. Your diary shows you're on a meaningful journey of self-discovery. What would you like to explore or talk about?`;
  }



  /**
   * Analyze sentiment of user message
   */
  private static analyzeSentiment(message: string): number {
    return VectorService.calculateSentiment(message);
  }

  /**
   * Save chat message to database
   */
  private static async saveChatMessage(
    userId: string, 
    role: 'user' | 'assistant', 
    content: string,
    context?: any
  ): Promise<ChatMessage> {
    const db = getDatabase();
    const id = uuidv4();
    const timestamp = new Date();

    await db.run(
      `INSERT INTO chat_messages (id, user_id, role, content, context, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        role,
        content,
        context ? JSON.stringify(context) : null,
        timestamp.toISOString()
      ]
    );

    return {
      id,
      userId,
      role,
      content,
      timestamp,
      context
    };
  }

  /**
   * Get chat history for user
   */
  static async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    const db = getDatabase();

    const rows = await db.all(
      `SELECT id, user_id, role, content, context, created_at
       FROM chat_messages 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      role: row.role as 'user' | 'assistant',
      content: row.content,
      timestamp: new Date(row.created_at),
      context: row.context ? JSON.parse(row.context) : undefined
    })).reverse(); // Return in chronological order
  }

  /**
   * Clear chat history for user
   */
  static async clearChatHistory(userId: string): Promise<void> {
    const db = getDatabase();
    await db.run('DELETE FROM chat_messages WHERE user_id = ?', [userId]);
  }

  /**
   * Get conversation statistics
   */
  static async getConversationStats(userId: string): Promise<{
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    averageSentiment: number;
    topTopics: string[];
  }> {
    const db = getDatabase();

    const totalRow = await db.get(
      'SELECT COUNT(*) as total FROM chat_messages WHERE user_id = ?',
      [userId]
    );

    const userRow = await db.get(
      'SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ? AND role = ?',
      [userId, 'user']
    );

    const assistantRow = await db.get(
      'SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ? AND role = ?',
      [userId, 'assistant']
    );

    // Get user messages for sentiment analysis
    const userMessages = await db.all(
      'SELECT content FROM chat_messages WHERE user_id = ? AND role = ?',
      [userId, 'user']
    );

    let averageSentiment = 0;
    const topTopics: string[] = [];

    if (userMessages.length > 0) {
      const sentiments = userMessages.map(msg => VectorService.calculateSentiment(msg.content));
      averageSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;

      // Extract topics from user messages
      const allContent = userMessages.map(msg => msg.content).join(' ');
      topTopics.push(...VectorService.extractTopics(allContent).slice(0, 5));
    }

    return {
      totalMessages: totalRow?.total || 0,
      userMessages: userRow?.count || 0,
      assistantMessages: assistantRow?.count || 0,
      averageSentiment,
      topTopics
    };
  }
}