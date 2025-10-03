import UserEngagement from '../models/UserEngagement';
import EngagementEvent from '../models/EngagementEvent';
import Post from '../models/Post';
import User from '../models/User';
import DiaryEntry from '../models/DiaryEntry';
import { Op } from 'sequelize';

export interface RecommendationScore {
  itemId: string;
  itemType: 'post' | 'user' | 'diary_prompt';
  score: number;
  reasons: string[];
  metadata?: any;
}

export interface ContentSimilarity {
  contentId: string;
  similarity: number;
  sharedTopics: string[];
}

export interface UserSimilarity {
  userId: string;
  similarity: number;
  sharedInterests: string[];
  engagementOverlap: number;
}

export class ContentRecommendationService {
  
  /**
   * Get personalized content recommendations for a user
   */
  async getPersonalizedRecommendations(
    userId: string, 
    limit: number = 10
  ): Promise<RecommendationScore[]> {
    try {
      const userEngagement = await UserEngagement.findOne({ where: { userId } });
      if (!userEngagement) return [];

      // Get user's interaction history
      const userEvents = await EngagementEvent.findAll({
        where: { 
          userId,
          eventType: { [Op.in]: ['post_create', 'like', 'comment', 'diary_entry'] }
        },
        order: [['timestamp', 'DESC']],
        limit: 100
      });

      // Generate different types of recommendations
      const contentBasedRecs = await this.getContentBasedRecommendations(userId, userEvents);
      const collaborativeRecs = await this.getCollaborativeRecommendations(userId, userEngagement);
      const trendingRecs = await this.getTrendingRecommendations(userId);
      const diversityRecs = await this.getDiversityRecommendations(userId, userEngagement);

      // Combine and score recommendations
      const allRecommendations = [
        ...contentBasedRecs.map(r => ({ ...r, score: r.score * 0.4 })),
        ...collaborativeRecs.map(r => ({ ...r, score: r.score * 0.3 })),
        ...trendingRecs.map(r => ({ ...r, score: r.score * 0.2 })),
        ...diversityRecs.map(r => ({ ...r, score: r.score * 0.1 }))
      ];

      // Remove duplicates and sort by score
      const uniqueRecs = this.deduplicateRecommendations(allRecommendations);
      
      return uniqueRecs
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return [];
    }
  }

  /**
   * Content-based recommendations using NLP similarity
   */
  private async getContentBasedRecommendations(
    userId: string, 
    userEvents: EngagementEvent[]
  ): Promise<RecommendationScore[]> {
    const recommendations: RecommendationScore[] = [];

    // Get user's liked and created content
    const likedPostIds = userEvents
      .filter(e => e.eventType === 'like' && e.metadata.contentId)
      .map(e => e.metadata.contentId!);

    const createdPostIds = userEvents
      .filter(e => e.eventType === 'post_create' && e.metadata.contentId)
      .map(e => e.metadata.contentId!);

    if (likedPostIds.length === 0 && createdPostIds.length === 0) {
      return recommendations;
    }

    // Get content from liked/created posts
    const userContent = await Post.findAll({
      where: {
        id: { [Op.in]: [...likedPostIds, ...createdPostIds] }
      }
    });

    // Analyze content patterns
    const contentTopics = this.extractTopicsFromContent(
      userContent.map(p => p.content)
    );

    // Find similar posts
    const candidatePosts = await Post.findAll({
      where: {
        id: { [Op.notIn]: [...likedPostIds, ...createdPostIds] },
        authorId: { [Op.ne]: userId }
      },
      limit: 50,
      order: [['createdAt', 'DESC']]
    });

    // Score posts based on content similarity
    for (const post of candidatePosts) {
      const postTopics = this.extractTopicsFromContent([post.content]);
      const similarity = this.calculateTopicSimilarity(contentTopics, postTopics);
      
      if (similarity > 0.3) {
        recommendations.push({
          itemId: post.id,
          itemType: 'post',
          score: similarity,
          reasons: [`Similar to content you've engaged with`],
          metadata: { 
            authorId: post.authorId,
            sharedTopics: this.getSharedTopics(contentTopics, postTopics)
          }
        });
      }
    }

    return recommendations;
  }

  /**
   * Collaborative filtering recommendations
   */
  private async getCollaborativeRecommendations(
    userId: string,
    userEngagement: UserEngagement
  ): Promise<RecommendationScore[]> {
    const recommendations: RecommendationScore[] = [];

    // Find similar users based on engagement patterns
    const similarUsers = await this.findSimilarUsers(userId, userEngagement);

    for (const similarUser of similarUsers.slice(0, 5)) {
      // Get posts liked by similar users
      const similarUserEvents = await EngagementEvent.findAll({
        where: {
          userId: similarUser.userId,
          eventType: 'like'
        },
        order: [['timestamp', 'DESC']],
        limit: 20
      });

      const likedPostIds = similarUserEvents
        .map(e => e.metadata.contentId)
        .filter(id => id);

      if (likedPostIds.length > 0) {
        const posts = await Post.findAll({
          where: {
            id: { [Op.in]: likedPostIds },
            authorId: { [Op.ne]: userId }
          }
        });

        for (const post of posts) {
          recommendations.push({
            itemId: post.id,
            itemType: 'post',
            score: similarUser.similarity * 0.8,
            reasons: [`Users with similar interests enjoyed this`],
            metadata: { 
              authorId: post.authorId,
              similarUserId: similarUser.userId
            }
          });
        }
      }
    }

    return recommendations;
  }

  /**
   * Trending content recommendations
   */
  private async getTrendingRecommendations(userId: string): Promise<RecommendationScore[]> {
    const recommendations: RecommendationScore[] = [];
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get posts with high engagement in last 24 hours
    const trendingPosts = await Post.findAll({
      where: {
        createdAt: { [Op.gte]: last24Hours },
        authorId: { [Op.ne]: userId }
      },
      order: [['likeCount', 'DESC']],
      limit: 10
    });

    for (const post of trendingPosts) {
      const engagementScore = (post.likeCount || 0) + (post.commentCount || 0) * 2;
      
      if (engagementScore > 5) {
        recommendations.push({
          itemId: post.id,
          itemType: 'post',
          score: Math.min(engagementScore / 20, 1.0),
          reasons: [`Trending in the community`],
          metadata: { 
            authorId: post.authorId,
            engagementScore
          }
        });
      }
    }

    return recommendations;
  }

  /**
   * Diversity recommendations to introduce new content
   */
  private async getDiversityRecommendations(
    userId: string,
    userEngagement: UserEngagement
  ): Promise<RecommendationScore[]> {
    const recommendations: RecommendationScore[] = [];

    // Get user's content preferences
    const userTopics = userEngagement.contentPreferences.map(p => p.topic);

    // Find posts from different topics/authors
    const diversePosts = await Post.findAll({
      where: {
        authorId: { [Op.ne]: userId }
      },
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    for (const post of diversePosts) {
      const postTopics = this.extractTopicsFromContent([post.content]);
      const hasNewTopics = postTopics.some(topic => !userTopics.includes(topic));
      
      if (hasNewTopics) {
        recommendations.push({
          itemId: post.id,
          itemType: 'post',
          score: 0.6,
          reasons: [`Discover new perspectives`],
          metadata: { 
            authorId: post.authorId,
            newTopics: postTopics.filter(topic => !userTopics.includes(topic))
          }
        });
      }
    }

    return recommendations;
  }

  /**
   * Find users with similar engagement patterns
   */
  private async findSimilarUsers(
    userId: string,
    userEngagement: UserEngagement
  ): Promise<UserSimilarity[]> {
    const allUsers = await UserEngagement.findAll({
      where: {
        userId: { [Op.ne]: userId }
      }
    });

    const similarities: UserSimilarity[] = [];

    for (const otherUser of allUsers) {
      const similarity = this.calculateUserSimilarity(userEngagement, otherUser);
      
      if (similarity.similarity > 0.3) {
        similarities.push(similarity);
      }
    }

    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Calculate similarity between two users
   */
  private calculateUserSimilarity(
    user1: UserEngagement,
    user2: UserEngagement
  ): UserSimilarity {
    // Compare content preferences
    const user1Topics = user1.contentPreferences.map(p => p.topic);
    const user2Topics = user2.contentPreferences.map(p => p.topic);
    const sharedTopics = user1Topics.filter(topic => user2Topics.includes(topic));
    
    const topicSimilarity = sharedTopics.length / Math.max(user1Topics.length, user2Topics.length, 1);

    // Compare engagement levels
    const user1Level = user1.level;
    const user2Level = user2.level;
    const levelSimilarity = 1 - Math.abs(user1Level - user2Level) / Math.max(user1Level, user2Level, 1);

    // Compare activity patterns
    const user1Activity = user1.totalSessions;
    const user2Activity = user2.totalSessions;
    const activitySimilarity = 1 - Math.abs(user1Activity - user2Activity) / Math.max(user1Activity, user2Activity, 1);

    // Combined similarity score
    const overallSimilarity = (topicSimilarity * 0.5) + (levelSimilarity * 0.3) + (activitySimilarity * 0.2);

    return {
      userId: user2.userId,
      similarity: overallSimilarity,
      sharedInterests: sharedTopics,
      engagementOverlap: topicSimilarity
    };
  }

  /**
   * Extract topics from content using simple keyword analysis
   */
  private extractTopicsFromContent(contents: string[]): string[] {
    const topicKeywords: { [topic: string]: string[] } = {
      'mindfulness': ['mindful', 'meditation', 'awareness', 'present', 'breath', 'calm'],
      'gratitude': ['grateful', 'thankful', 'appreciate', 'blessing', 'gratitude'],
      'growth': ['growth', 'learn', 'develop', 'improve', 'progress', 'journey'],
      'relationships': ['friend', 'family', 'love', 'connection', 'relationship', 'support'],
      'creativity': ['creative', 'art', 'write', 'create', 'inspire', 'imagination'],
      'nature': ['nature', 'outdoor', 'tree', 'sky', 'garden', 'walk', 'hiking'],
      'wellness': ['health', 'exercise', 'sleep', 'nutrition', 'wellness', 'fitness'],
      'reflection': ['reflect', 'think', 'consider', 'ponder', 'contemplate', 'introspect'],
      'goals': ['goal', 'dream', 'aspire', 'achieve', 'accomplish', 'success'],
      'challenges': ['challenge', 'difficult', 'struggle', 'overcome', 'persevere']
    };

    const allText = contents.join(' ').toLowerCase();
    const foundTopics: string[] = [];

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const hasKeywords = keywords.some(keyword => allText.includes(keyword));
      if (hasKeywords) {
        foundTopics.push(topic);
      }
    }

    return foundTopics;
  }

  /**
   * Calculate similarity between two topic sets
   */
  private calculateTopicSimilarity(topics1: string[], topics2: string[]): number {
    if (topics1.length === 0 || topics2.length === 0) return 0;
    
    const sharedTopics = topics1.filter(topic => topics2.includes(topic));
    return sharedTopics.length / Math.max(topics1.length, topics2.length);
  }

  /**
   * Get shared topics between two topic sets
   */
  private getSharedTopics(topics1: string[], topics2: string[]): string[] {
    return topics1.filter(topic => topics2.includes(topic));
  }

  /**
   * Remove duplicate recommendations
   */
  private deduplicateRecommendations(recommendations: RecommendationScore[]): RecommendationScore[] {
    const seen = new Set<string>();
    const unique: RecommendationScore[] = [];

    for (const rec of recommendations) {
      const key = `${rec.itemType}:${rec.itemId}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(rec);
      }
    }

    return unique;
  }

  /**
   * Get optimal posting times for a user
   */
  async getOptimalPostingTimes(userId: string): Promise<{ hour: number; dayOfWeek: number; score: number }[]> {
    const userEvents = await EngagementEvent.findAll({
      where: { 
        userId,
        eventType: { [Op.in]: ['post_create', 'like', 'comment'] }
      },
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    const timeSlots: { [key: string]: number } = {};

    userEvents.forEach(event => {
      const date = new Date(event.timestamp);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      const key = `${dayOfWeek}-${hour}`;
      
      timeSlots[key] = (timeSlots[key] || 0) + 1;
    });

    const optimalTimes = Object.entries(timeSlots)
      .map(([key, count]) => {
        const [dayOfWeek, hour] = key.split('-').map(Number);
        return {
          hour,
          dayOfWeek,
          score: count / userEvents.length
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return optimalTimes;
  }

  /**
   * Generate personalized writing prompts
   */
  async generatePersonalizedPrompts(userId: string): Promise<string[]> {
    const userEngagement = await UserEngagement.findOne({ where: { userId } });
    if (!userEngagement) return this.getDefaultPrompts();

    const userTopics = userEngagement.contentPreferences.map(p => p.topic);
    const prompts: string[] = [];

    // Topic-based prompts
    const topicPrompts: { [topic: string]: string[] } = {
      'mindfulness': [
        'What moment today brought you the most peace?',
        'Describe a time when you felt completely present.',
        'How did you practice mindfulness today?'
      ],
      'gratitude': [
        'What are three small things you\'re grateful for today?',
        'Who in your life deserves appreciation right now?',
        'What challenge taught you something valuable?'
      ],
      'growth': [
        'What did you learn about yourself this week?',
        'How have you grown in the past month?',
        'What skill would you like to develop next?'
      ],
      'relationships': [
        'How did you connect with someone meaningful today?',
        'What makes your closest relationships special?',
        'How do you show care for the people you love?'
      ]
    };

    // Add prompts based on user's interests
    for (const topic of userTopics.slice(0, 2)) {
      if (topicPrompts[topic]) {
        const randomPrompt = topicPrompts[topic][Math.floor(Math.random() * topicPrompts[topic].length)];
        prompts.push(randomPrompt);
      }
    }

    // Add general prompts if needed
    if (prompts.length < 3) {
      prompts.push(...this.getDefaultPrompts().slice(0, 3 - prompts.length));
    }

    return prompts;
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
      'What would you tell your past self from a year ago?'
    ];
  }
}

export default new ContentRecommendationService();