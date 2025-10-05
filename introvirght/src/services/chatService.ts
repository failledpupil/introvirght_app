import type { ApiResponse } from '../types';

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
  relatedEntries?: Array<{
    id: string;
    date: string;
    mood: string;
    content: string;
    sentiment: number;
  }>;
}

export interface ConversationStats {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  averageSentiment: number;
  topTopics: string[];
}

export interface PersonalInsight {
  type: 'pattern' | 'mood' | 'growth' | 'theme';
  title: string;
  description: string;
  confidence: number;
  relatedEntries?: string[];
}

export class ChatService {
  /**
   * Helper method to get stored chat messages from localStorage
   */
  private static getStoredMessages(): ChatMessage[] {
    try {
      const stored = localStorage.getItem('chatMessages');
      if (!stored) return [];
      
      const messages = JSON.parse(stored);
      return messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Helper method to store chat messages to localStorage
   */
  private static storeMessages(messages: ChatMessage[]): void {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }

  /**
   * Generate a simple AI response (client-side demo)
   */
  private static generateAIResponse(userMessage: string): string {
    const responses = [
      "That's an interesting perspective. How does that make you feel?",
      "I can see you're reflecting deeply on this. What insights have you gained?",
      "Thank you for sharing that with me. What would you like to explore further?",
      "It sounds like you're going through a meaningful experience. How are you processing this?",
      "I appreciate your openness. What patterns do you notice in your thoughts?",
      "That's a thoughtful observation. How might this connect to your personal growth?",
      "I hear you. What steps feel right for you moving forward?",
      "Your self-awareness is growing. What have you learned about yourself recently?",
    ];
    
    // Simple keyword-based responses
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('depressed')) {
      return "I hear that you're feeling down. It's okay to have difficult emotions. What small thing might bring you a moment of comfort today?";
    }
    
    if (lowerMessage.includes('happy') || lowerMessage.includes('joy') || lowerMessage.includes('excited')) {
      return "It's wonderful to hear the joy in your words! What's contributing to these positive feelings?";
    }
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('stress')) {
      return "Anxiety can be challenging. Remember to breathe deeply. What's one thing that usually helps you feel more grounded?";
    }
    
    if (lowerMessage.includes('grateful') || lowerMessage.includes('thankful')) {
      return "Gratitude is such a powerful practice. What else are you feeling grateful for in this moment?";
    }
    
    // Default random response
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Send a message to the AI chatbot (client-side)
   */
  static async sendMessage(message: string): Promise<ApiResponse<ChatResponse>> {
    try {
      console.log('✅ Client-side sendMessage:', message);
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const existingMessages = this.getStoredMessages();
      
      // Create user message
      const userMessage: ChatMessage = {
        id: 'msg-user-' + Date.now(),
        userId: currentUser.id || 'demo-user',
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      
      // Generate AI response
      const aiResponse: ChatMessage = {
        id: 'msg-ai-' + (Date.now() + 1),
        userId: 'ai-assistant',
        role: 'assistant',
        content: this.generateAIResponse(message),
        timestamp: new Date(Date.now() + 1000), // 1 second later
      };
      
      // Store both messages
      const updatedMessages = [...existingMessages, userMessage, aiResponse];
      this.storeMessages(updatedMessages);
      
      return {
        success: true,
        data: {
          message: aiResponse,
          relatedEntries: [], // Could be enhanced to find related diary entries
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to send message',
        },
      };
    }
  }

  /**
   * Get chat conversation history (client-side)
   */
  static async getChatHistory(limit: number = 50): Promise<ApiResponse<{
    messages: ChatMessage[];
    totalMessages: number;
  }>> {
    try {
      console.log('✅ Client-side getChatHistory, limit:', limit);
      
      const allMessages = this.getStoredMessages();
      const limitedMessages = allMessages.slice(-limit); // Get last N messages
      
      return {
        success: true,
        data: {
          messages: limitedMessages,
          totalMessages: allMessages.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to fetch chat history',
        },
      };
    }
  }

  /**
   * Clear chat conversation history (client-side)
   */
  static async clearChatHistory(): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('✅ Client-side clearChatHistory');
      
      localStorage.removeItem('chatMessages');
      
      return {
        success: true,
        data: {
          message: 'Chat history cleared successfully',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to clear chat history',
        },
      };
    }
  }

  /**
   * Get conversation statistics (client-side)
   */
  static async getConversationStats(): Promise<ApiResponse<ConversationStats>> {
    try {
      console.log('✅ Client-side getConversationStats');
      
      const messages = this.getStoredMessages();
      const userMessages = messages.filter(m => m.role === 'user');
      const assistantMessages = messages.filter(m => m.role === 'assistant');
      
      return {
        success: true,
        data: {
          totalMessages: messages.length,
          userMessages: userMessages.length,
          assistantMessages: assistantMessages.length,
          averageSentiment: 0.7, // Demo value
          topTopics: ['reflection', 'growth', 'mindfulness'], // Demo values
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to fetch conversation stats',
        },
      };
    }
  }

  /**
   * Get personalized insights based on diary patterns (client-side demo)
   */
  static async getPersonalInsights(): Promise<ApiResponse<{
    insights: PersonalInsight[];
    totalEntries: number;
    analysisDate: string;
  }>> {
    try {
      console.log('✅ Client-side getPersonalInsights');
      
      // Get diary entries to analyze
      const diaryEntries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
      
      const insights: PersonalInsight[] = [
        {
          type: 'pattern',
          title: 'Consistent Reflection',
          description: 'You show a strong pattern of regular self-reflection, which is excellent for personal growth.',
          confidence: 0.85,
        },
        {
          type: 'mood',
          title: 'Emotional Awareness',
          description: 'Your entries demonstrate growing emotional intelligence and self-awareness.',
          confidence: 0.78,
        },
        {
          type: 'growth',
          title: 'Mindful Progress',
          description: 'You\'re making thoughtful progress in your personal development journey.',
          confidence: 0.82,
        },
      ];
      
      return {
        success: true,
        data: {
          insights,
          totalEntries: diaryEntries.length,
          analysisDate: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to fetch personal insights',
        },
      };
    }
  }
}