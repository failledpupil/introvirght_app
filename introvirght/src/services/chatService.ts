import type { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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

export class ChatService {
  /**
   * Send a message to the AI chatbot
   */
  static async sendMessage(message: string): Promise<ApiResponse<ChatResponse>> {
    try {
      // Get the actual auth token from localStorage, fallback to test token
      const token = localStorage.getItem('authToken') || 'test-bypass-token';
      
      console.log('Sending chat message:', message);
      console.log('Using token:', token ? 'token exists' : 'no token');
      
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'CHAT_MESSAGE_FAILED', message: 'Failed to send message' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          ...data.data,
          message: {
            ...data.data.message,
            timestamp: new Date(data.data.message.timestamp),
          },
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
   * Get chat conversation history
   */
  static async getChatHistory(limit: number = 50): Promise<ApiResponse<{
    messages: ChatMessage[];
    totalMessages: number;
  }>> {
    try {
      // Get the actual auth token from localStorage, fallback to test token
      const token = localStorage.getItem('authToken') || 'test-bypass-token';
      const response = await fetch(`${API_BASE_URL}/chat/history?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_CHAT_HISTORY_FAILED', message: 'Failed to fetch chat history' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          ...data.data,
          messages: data.data.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
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
   * Clear chat conversation history
   */
  static async clearChatHistory(): Promise<ApiResponse<{ message: string }>> {
    try {
      // Get the actual auth token from localStorage, fallback to test token
      const token = localStorage.getItem('authToken') || 'test-bypass-token';
      const response = await fetch(`${API_BASE_URL}/chat/history`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'CLEAR_CHAT_HISTORY_FAILED', message: 'Failed to clear chat history' },
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
   * Get conversation statistics
   */
  static async getConversationStats(): Promise<ApiResponse<ConversationStats>> {
    try {
      // Get the actual auth token from localStorage, fallback to test token
      const token = localStorage.getItem('authToken') || 'test-bypass-token';
      const response = await fetch(`${API_BASE_URL}/chat/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_CONVERSATION_STATS_FAILED', message: 'Failed to fetch conversation stats' },
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