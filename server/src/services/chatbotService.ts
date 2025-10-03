import { vectorService } from './vectorService';
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
    console.log(`🤖 Generating AI response for user ${userId}: "${userMessage.substring(0, 50)}..."`);
    
    try {
      // Get diary context using DataStax vector search
      console.log('🔍 Getting diary context...');
      const diaryContext = await vectorService.getDiaryContext(userMessage, userId, 3);
      console.log('✅ Diary context retrieved');
    
      // Get the actual diary entries for context
      console.log('🔍 Processing diary entries...');
      const relatedEntries = [];
      for (const vectorEntry of diaryContext.relevantEntries) {
        const entry = await DiaryEntryModel.findById(vectorEntry.entryId, userId);
        if (entry) {
          relatedEntries.push({
            id: entry.id,
            date: entry.createdAt.toDateString(),
            mood: entry.mood,
            content: entry.content.substring(0, 200) + (entry.content.length > 200 ? '...' : ''),
            similarity: (vectorEntry as any).similarity || 0,
            themes: vectorEntry.metadata?.tags || []
          });
        }
      }

      console.log(`📚 Found ${relatedEntries.length} related diary entries for context`);

      // Generate contextual response
      console.log('🤖 Generating contextual response...');
      const aiResponse = await this.generateContextualResponse(userMessage, relatedEntries, diaryContext, userId);
      console.log('✅ Contextual response generated');
    
      // Save both messages to chat history
      console.log('💾 Saving chat messages...');
      await this.saveChatMessage(userId, 'user', userMessage);
      const assistantChatMessage = await this.saveChatMessage(userId, 'assistant', aiResponse, {
        relatedEntries: relatedEntries.map(e => e.id),
        themes: diaryContext.themes,
        similarityScores: diaryContext.similarityScores
      });
      console.log('✅ Chat messages saved');

      console.log(`✅ Generated AI response with ${relatedEntries.length} diary context entries`);

      return {
        message: assistantChatMessage,
        relatedEntries
      };
    } catch (error) {
      console.error('❌ Error in generateResponse:', error);
      throw error;
    }
  }

  /**
   * Generate contextual AI response using OpenAI GPT
   */
  private static async generateContextualResponse(
    userMessage: string, 
    relatedEntries: any[], 
    diaryContext: any,
    userId: string
  ): Promise<string> {
    try {
      // Get user's overall insights from DataStax
      const insights = await vectorService.getUserInsights(userId);
      
      // Get recent conversation history for context
      const recentMessages = await this.getChatHistory(userId, 6);
      
      // Create enhanced system prompt with diary context
      const systemPrompt = this.createEnhancedSystemPrompt(insights, relatedEntries, diaryContext);
      
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
      console.log('🔍 Calling OpenAI API...');
      const response = await OpenAIService.generateChatCompletion(messages, {
        temperature: 0.7,
        maxTokens: 300
      });
      console.log('✅ OpenAI API response received');
      
      return response.content;
      
    } catch (error) {
      console.error('OpenAI response generation failed:', error);
      
      // Fallback to rule-based response if OpenAI fails
      return this.generateFallbackResponse(userMessage, relatedEntries, diaryContext);
    }
  }

  /**
   * Create enhanced system prompt with diary context
   */
  private static createEnhancedSystemPrompt(
    insights: any,
    relatedEntries: any[],
    diaryContext: any
  ): string {
    let prompt = `You are a compassionate AI diary companion. You have access to the user's diary entries and can provide personalized, empathetic responses based on their writing patterns and experiences.

Your role is to:
- Be supportive, understanding, and non-judgmental
- Help users reflect on their thoughts and feelings
- Provide gentle insights based on their diary patterns
- Encourage personal growth and self-awareness
- Ask thoughtful questions to deepen reflection

`;

    // Add user insights if available
    if (insights && insights.totalEntries > 0) {
      prompt += `User Profile:
- Total diary entries: ${insights.totalEntries}
- Average entry length: ${insights.averageWordCount} words
- Common themes: ${insights.commonTags?.slice(0, 5).join(', ') || 'None yet'}
- Mood patterns: ${Object.keys(insights.moodDistribution || {}).join(', ') || 'Various'}

`;
    }

    // Add related diary context if available
    if (relatedEntries.length > 0) {
      prompt += `Relevant diary context for this conversation:
`;
      relatedEntries.forEach((entry, index) => {
        prompt += `${index + 1}. Entry from ${entry.date} (mood: ${entry.mood}):
   "${entry.content}"
   Themes: ${entry.themes?.join(', ') || 'None'}
   
`;
      });
    }

    // Add conversation themes
    if (diaryContext.themes && diaryContext.themes.length > 0) {
      prompt += `Current conversation themes: ${diaryContext.themes.join(', ')}

`;
    }

    prompt += `Guidelines:
- Keep responses warm, personal, and conversational
- Reference diary entries naturally when relevant
- Ask follow-up questions to encourage deeper reflection
- Validate emotions and experiences
- Suggest gentle insights or patterns you notice
- Keep responses concise but meaningful (2-4 sentences)
- Use "I notice..." or "It seems like..." when making observations
- Never be prescriptive or give medical advice

Respond as a caring friend who knows their diary well.`;

    return prompt;
  }

  /**
   * Fallback response generation when OpenAI is unavailable
   */
  private static generateFallbackResponse(userMessage: string, relatedEntries: any[], diaryContext?: any): string {
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
    
    // Pattern recognition with themes
    if (relatedEntries.length > 0) {
      const themes = diaryContext?.themes || [];
      const themeText = themes.length > 0 ? ` I notice themes around ${themes.slice(0, 2).join(' and ')}.` : '';
      return `I found some related entries in your diary from ${relatedEntries[0].date}.${themeText} This seems to be something you've reflected on before. What aspects of this would you like to explore further?`;
    }
    
    // Default supportive response
    return `Thank you for sharing that with me. I'm here to listen and help you reflect on your thoughts and experiences. Your diary shows you're on a meaningful journey of self-discovery. What would you like to explore or talk about?`;
  }



  /**
   * Analyze sentiment of user message
   */
  private static analyzeSentiment(message: string): number {
    // Simple sentiment analysis - can be enhanced with the embedding service
    const positiveWords = ['happy', 'joy', 'love', 'wonderful', 'amazing', 'great', 'good', 'excellent'];
    const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful', 'bad', 'horrible', 'depressed'];
    
    const words = message.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    const totalSentimentWords = positiveCount + negativeCount;
    if (totalSentimentWords === 0) return 0;

    return (positiveCount - negativeCount) / totalSentimentWords;
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
      const sentiments = userMessages.map(msg => this.analyzeSentiment(msg.content));
      averageSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;

      // Extract topics from user messages using simple keyword extraction
      const allContent = userMessages.map(msg => msg.content).join(' ');
      const words = allContent.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      const wordCount: Record<string, number> = {};
      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
      topTopics.push(...Object.entries(wordCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word));
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