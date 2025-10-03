import type { EngagementResponse, RecommendationScore } from '../types/engagement';

export class EngagementService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  /**
   * Get user's engagement profile
   */
  async getUserEngagement(userId: string): Promise<EngagementResponse> {
    try {
      const token = localStorage.getItem('authToken') || 'test-bypass-token';
      const response = await fetch(`${this.baseUrl}/engagement/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get user engagement:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Track an engagement event
   */
  async trackEvent(
    eventType: string, 
    metadata: any = {}
  ): Promise<EngagementResponse> {
    try {
      const token = localStorage.getItem('authToken') || 'test-bypass-token';
      const response = await fetch(`${this.baseUrl}/engagement/event`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            deviceType: this.getDeviceType(),
            sessionId: this.getSessionId()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to track engagement event:', error);
      return {
        success: false,
        error: {
          code: 'TRACK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(limit: number = 10): Promise<RecommendationScore[]> {
    try {
      const token = localStorage.getItem('authToken') || 'test-bypass-token';
      const response = await fetch(`${this.baseUrl}/engagement/recommendations?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.success ? data.data.recommendations : [];
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return [];
    }
  }

  /**
   * Get user insights and analytics
   */
  async getUserInsights(userId: string): Promise<any> {
    try {
      const token = localStorage.getItem('authToken') || 'test-bypass-token';
      const response = await fetch(`${this.baseUrl}/engagement/insights/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.success ? data.data.insights : null;
    } catch (error) {
      console.error('Failed to get user insights:', error);
      return null;
    }
  }

  /**
   * Get personalized writing prompts
   */
  async getPersonalizedPrompts(): Promise<string[]> {
    try {
      const token = localStorage.getItem('authToken') || 'test-bypass-token';
      const response = await fetch(`${this.baseUrl}/engagement/prompts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.success ? data.data.prompts : this.getDefaultPrompts();
    } catch (error) {
      console.error('Failed to get personalized prompts:', error);
      return this.getDefaultPrompts();
    }
  }

  /**
   * Start a user session
   */
  async startSession(): Promise<void> {
    const sessionId = this.generateSessionId();
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('sessionStart', new Date().toISOString());

    await this.trackEvent('session_start', {
      sessionId,
      deviceType: this.getDeviceType(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }

  /**
   * End a user session
   */
  async endSession(): Promise<void> {
    const sessionId = this.getSessionId();
    const sessionStart = localStorage.getItem('sessionStart');
    
    if (sessionId && sessionStart) {
      const duration = Date.now() - new Date(sessionStart).getTime();
      
      await this.trackEvent('session_end', {
        sessionId,
        duration,
        deviceType: this.getDeviceType()
      });
    }

    localStorage.removeItem('sessionId');
    localStorage.removeItem('sessionStart');
  }

  /**
   * Track post creation
   */
  async trackPostCreation(postId: string, content: string): Promise<void> {
    const qualityScore = this.calculateContentQuality(content);
    
    await this.trackEvent('post_create', {
      contentId: postId,
      qualityScore,
      contentLength: content.length,
      wordCount: content.split(/\s+/).length
    });
  }

  /**
   * Track diary entry creation
   */
  async trackDiaryEntry(entryId: string, content: string, mood?: string): Promise<void> {
    const qualityScore = this.calculateContentQuality(content);
    
    await this.trackEvent('diary_entry', {
      contentId: entryId,
      qualityScore,
      contentLength: content.length,
      wordCount: content.split(/\s+/).length,
      emotionalContext: mood ? { mood, intensity: 1 } : undefined
    });
  }

  /**
   * Track like action
   */
  async trackLike(contentId: string, contentType: 'post' | 'comment' = 'post'): Promise<void> {
    await this.trackEvent('like', {
      contentId,
      contentType
    });
  }

  /**
   * Track comment creation
   */
  async trackComment(commentId: string, postId: string, content: string): Promise<void> {
    const qualityScore = this.calculateContentQuality(content);
    
    await this.trackEvent('comment', {
      contentId: commentId,
      parentContentId: postId,
      qualityScore,
      contentLength: content.length
    });
  }

  /**
   * Track login
   */
  async trackLogin(): Promise<void> {
    await this.trackEvent('login', {
      loginTime: new Date().toISOString(),
      deviceType: this.getDeviceType()
    });
  }

  /**
   * Calculate content quality score
   */
  private calculateContentQuality(content: string): number {
    let score = 1.0;
    
    // Length bonus
    if (content.length > 100) score += 0.2;
    if (content.length > 300) score += 0.3;
    
    // Word count bonus
    const wordCount = content.split(/\s+/).length;
    if (wordCount > 20) score += 0.2;
    if (wordCount > 50) score += 0.3;
    
    // Thoughtful content indicators
    const thoughtfulWords = ['reflect', 'grateful', 'mindful', 'consider', 'realize', 'understand', 'appreciate'];
    const hasThoughtfulWords = thoughtfulWords.some(word => 
      content.toLowerCase().includes(word)
    );
    if (hasThoughtfulWords) score += 0.3;
    
    // Question marks (engagement)
    const questionCount = (content.match(/\?/g) || []).length;
    if (questionCount > 0) score += Math.min(questionCount * 0.1, 0.2);
    
    return Math.min(score, 2.0); // Cap at 2.0
  }

  /**
   * Get device type
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Get current session ID
   */
  private getSessionId(): string {
    return localStorage.getItem('sessionId') || this.generateSessionId();
  }

  /**
   * Generate new session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get default writing prompts
   */
  private getDefaultPrompts(): string[] {
    return [
      'What brought you joy today?',
      'Describe a moment of unexpected beauty you witnessed.',
      'What are you looking forward to tomorrow?',
      'How did you take care of yourself today?',
      'What would you tell your past self from a year ago?',
      'What challenge helped you grow recently?',
      'Who in your life deserves appreciation right now?',
      'What small victory can you celebrate today?'
    ];
  }
}

export default new EngagementService();