import EngagementEvent from '../models/EngagementEvent';
import UserEngagement from '../models/UserEngagement';
import { Op } from 'sequelize';

export interface BehaviorPattern {
  userId: string;
  patternType: 'optimal_time' | 'content_preference' | 'engagement_style' | 'mood_correlation';
  pattern: any;
  confidence: number;
  lastUpdated: Date;
}

export interface UserSession {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  events: string[];
  deviceType: 'mobile' | 'desktop' | 'tablet';
  engagementScore: number;
}

export interface EngagementMetrics {
  dailyActiveUsers: number;
  averageSessionDuration: number;
  retentionRate: {
    day1: number;
    day7: number;
    day30: number;
  };
  engagementQuality: number;
  featureAdoption: { [feature: string]: number };
}

export class BehaviorAnalyzer {
  private sessionCache: Map<string, UserSession> = new Map();

  /**
   * Track user session start
   */
  async startSession(
    userId: string, 
    sessionId: string, 
    deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop'
  ): Promise<void> {
    const session: UserSession = {
      userId,
      sessionId,
      startTime: new Date(),
      events: [],
      deviceType,
      engagementScore: 0,
    };

    this.sessionCache.set(sessionId, session);

    // Update user engagement analytics
    const userEngagement = await UserEngagement.findOne({ where: { userId } });
    if (userEngagement) {
      userEngagement.totalSessions += 1;
      await userEngagement.save();
    }
  }

  /**
   * Track user session end
   */
  async endSession(sessionId: string): Promise<UserSession | null> {
    const session = this.sessionCache.get(sessionId);
    if (!session) return null;

    session.endTime = new Date();
    session.duration = session.endTime.getTime() - session.startTime.getTime();

    // Calculate engagement score based on session activity
    session.engagementScore = this.calculateSessionEngagementScore(session);

    // Update user's average session duration
    await this.updateAverageSessionDuration(session.userId, session.duration);

    // Remove from cache
    this.sessionCache.delete(sessionId);

    return session;
  }

  /**
   * Track event within a session
   */
  async trackSessionEvent(sessionId: string, eventType: string): Promise<void> {
    const session = this.sessionCache.get(sessionId);
    if (session) {
      session.events.push(eventType);
    }
  }

  /**
   * Analyze user behavior patterns
   */
  async analyzeUserBehavior(userId: string): Promise<BehaviorPattern[]> {
    const patterns: BehaviorPattern[] = [];

    // Analyze optimal engagement times
    const optimalTimes = await this.analyzeOptimalEngagementTimes(userId);
    if (optimalTimes) {
      patterns.push({
        userId,
        patternType: 'optimal_time',
        pattern: optimalTimes,
        confidence: 0.8,
        lastUpdated: new Date(),
      });
    }

    // Analyze content preferences
    const contentPrefs = await this.analyzeContentPreferences(userId);
    if (contentPrefs) {
      patterns.push({
        userId,
        patternType: 'content_preference',
        pattern: contentPrefs,
        confidence: 0.7,
        lastUpdated: new Date(),
      });
    }

    // Analyze engagement style
    const engagementStyle = await this.analyzeEngagementStyle(userId);
    if (engagementStyle) {
      patterns.push({
        userId,
        patternType: 'engagement_style',
        pattern: engagementStyle,
        confidence: 0.75,
        lastUpdated: new Date(),
      });
    }

    return patterns;
  }

  /**
   * Analyze optimal engagement times for a user
   */
  private async analyzeOptimalEngagementTimes(userId: string): Promise<any> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const events = await EngagementEvent.findAll({
      where: {
        userId,
        timestamp: { [Op.gte]: thirtyDaysAgo },
      },
      order: [['timestamp', 'ASC']],
    });

    if (events.length < 10) return null;

    // Group events by hour and day of week
    const hourlyActivity: { [hour: number]: number } = {};
    const dailyActivity: { [day: number]: number } = {};

    events.forEach(event => {
      const date = new Date(event.timestamp);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();

      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
      dailyActivity[dayOfWeek] = (dailyActivity[dayOfWeek] || 0) + 1;
    });

    // Find peak hours and days
    const peakHours = Object.entries(hourlyActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    const peakDays = Object.entries(dailyActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => parseInt(day));

    return {
      peakHours,
      peakDays,
      hourlyDistribution: hourlyActivity,
      dailyDistribution: dailyActivity,
    };
  }

  /**
   * Analyze content preferences based on engagement patterns
   */
  private async analyzeContentPreferences(userId: string): Promise<any> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const events = await EngagementEvent.findAll({
      where: {
        userId,
        eventType: { [Op.in]: ['post_create', 'diary_entry', 'like', 'comment'] },
        timestamp: { [Op.gte]: thirtyDaysAgo },
      },
    });

    if (events.length < 5) return null;

    // Analyze content interaction patterns
    const contentTypes: { [type: string]: number } = {};
    const qualityScores: number[] = [];

    events.forEach(event => {
      contentTypes[event.eventType] = (contentTypes[event.eventType] || 0) + 1;
      if (event.metadata.qualityScore) {
        qualityScores.push(event.metadata.qualityScore);
      }
    });

    const averageQuality = qualityScores.length > 0 
      ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length 
      : 1.0;

    return {
      preferredContentTypes: contentTypes,
      averageQualityScore: averageQuality,
      engagementFrequency: events.length / 30, // events per day
    };
  }

  /**
   * Analyze user's engagement style
   */
  private async analyzeEngagementStyle(userId: string): Promise<any> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const events = await EngagementEvent.findAll({
      where: {
        userId,
        timestamp: { [Op.gte]: thirtyDaysAgo },
      },
    });

    if (events.length < 10) return null;

    // Calculate engagement metrics
    const creationEvents = events.filter(e => ['post_create', 'diary_entry'].includes(e.eventType));
    const socialEvents = events.filter(e => ['like', 'comment', 'share'].includes(e.eventType));
    
    const creationRatio = creationEvents.length / events.length;
    const socialRatio = socialEvents.length / events.length;

    // Determine engagement style
    let style = 'balanced';
    if (creationRatio > 0.6) {
      style = 'creator';
    } else if (socialRatio > 0.7) {
      style = 'social';
    } else if (creationEvents.filter(e => e.eventType === 'diary_entry').length > creationEvents.length * 0.7) {
      style = 'reflective';
    }

    return {
      style,
      creationRatio,
      socialRatio,
      averageEventsPerDay: events.length / 30,
      consistency: this.calculateConsistency(events),
    };
  }

  /**
   * Calculate engagement consistency score
   */
  private calculateConsistency(events: EngagementEvent[]): number {
    if (events.length < 7) return 0;

    // Group events by day
    const dailyEvents: { [day: string]: number } = {};
    events.forEach(event => {
      const day = event.timestamp.toDateString();
      dailyEvents[day] = (dailyEvents[day] || 0) + 1;
    });

    const dailyCounts = Object.values(dailyEvents);
    const average = dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length;
    const variance = dailyCounts.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / dailyCounts.length;
    
    // Lower variance = higher consistency
    return Math.max(0, 1 - (variance / (average + 1)));
  }

  /**
   * Calculate session engagement score
   */
  private calculateSessionEngagementScore(session: UserSession): number {
    let score = 0;
    
    // Base score from session duration (up to 30 minutes)
    const durationMinutes = (session.duration || 0) / (1000 * 60);
    score += Math.min(durationMinutes / 30, 1) * 30;

    // Score from events
    const eventScores: { [event: string]: number } = {
      'post_create': 20,
      'diary_entry': 25,
      'comment': 10,
      'like': 5,
      'login': 5,
    };

    session.events.forEach(event => {
      score += eventScores[event] || 1;
    });

    // Bonus for diverse activity
    const uniqueEvents = new Set(session.events).size;
    if (uniqueEvents > 2) {
      score *= 1.2;
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Update user's average session duration
   */
  private async updateAverageSessionDuration(userId: string, sessionDuration: number): Promise<void> {
    const userEngagement = await UserEngagement.findOne({ where: { userId } });
    if (userEngagement) {
      const totalSessions = userEngagement.totalSessions;
      const currentAverage = userEngagement.averageSessionDuration;
      
      // Calculate new average
      const newAverage = ((currentAverage * (totalSessions - 1)) + sessionDuration) / totalSessions;
      
      userEngagement.averageSessionDuration = Math.round(newAverage);
      await userEngagement.save();
    }
  }

  /**
   * Get platform-wide engagement metrics
   */
  async getPlatformEngagementMetrics(): Promise<EngagementMetrics> {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Daily Active Users
    const dailyActiveUsers = await EngagementEvent.count({
      distinct: true,
      col: 'userId',
      where: {
        timestamp: { [Op.gte]: yesterday },
      },
    });

    // Average Session Duration
    const avgSessionDuration = await UserEngagement.findOne({
      attributes: [
        [UserEngagement.sequelize!.fn('AVG', UserEngagement.sequelize!.col('averageSessionDuration')), 'avgDuration']
      ],
    });

    // Retention Rates (simplified calculation)
    const totalUsers = await UserEngagement.count();
    const activeDay7 = await EngagementEvent.count({
      distinct: true,
      col: 'userId',
      where: {
        timestamp: { [Op.gte]: sevenDaysAgo },
      },
    });
    const activeDay30 = await EngagementEvent.count({
      distinct: true,
      col: 'userId',
      where: {
        timestamp: { [Op.gte]: thirtyDaysAgo },
      },
    });

    // Engagement Quality (average XP per event)
    const qualityEvents = await EngagementEvent.findAll({
      where: {
        timestamp: { [Op.gte]: sevenDaysAgo },
      },
      attributes: ['metadata'],
    });

    const avgQuality = qualityEvents.length > 0
      ? qualityEvents.reduce((sum, event) => sum + (event.metadata.experienceGained || 0), 0) / qualityEvents.length
      : 0;

    return {
      dailyActiveUsers,
      averageSessionDuration: (avgSessionDuration as any)?.dataValues?.avgDuration || 0,
      retentionRate: {
        day1: dailyActiveUsers / Math.max(totalUsers, 1),
        day7: activeDay7 / Math.max(totalUsers, 1),
        day30: activeDay30 / Math.max(totalUsers, 1),
      },
      engagementQuality: avgQuality,
      featureAdoption: {}, // TODO: Implement feature adoption tracking
    };
  }

  /**
   * Generate personalized insights for a user
   */
  async generateUserInsights(userId: string): Promise<any> {
    const userEngagement = await UserEngagement.findOne({ where: { userId } });
    if (!userEngagement) return null;

    const patterns = await this.analyzeUserBehavior(userId);
    const recentEvents = await EngagementEvent.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      limit: 50,
    });

    return {
      engagementLevel: this.calculateEngagementLevel(userEngagement),
      behaviorPatterns: patterns,
      recentActivity: recentEvents.slice(0, 10),
      recommendations: this.generateRecommendations(userEngagement, patterns),
      growthMetrics: {
        experienceGrowth: this.calculateExperienceGrowth(recentEvents),
        streakHealth: this.calculateStreakHealth(userEngagement),
        socialImpact: userEngagement.socialImpact,
      },
    };
  }

  /**
   * Calculate user's engagement level
   */
  private calculateEngagementLevel(userEngagement: UserEngagement): string {
    const score = userEngagement.experience + 
                 (userEngagement.combinedStreak.currentStreak * 10) +
                 (userEngagement.socialImpact.communityContributions * 5);

    if (score < 100) return 'Getting Started';
    if (score < 500) return 'Active Member';
    if (score < 1500) return 'Engaged Contributor';
    if (score < 3000) return 'Community Leader';
    return 'Mindful Master';
  }

  /**
   * Calculate experience growth trend
   */
  private calculateExperienceGrowth(events: EngagementEvent[]): number {
    const last7Days = events.filter(e => 
      new Date(e.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    );
    
    return last7Days.reduce((sum, event) => sum + (event.metadata.experienceGained || 0), 0);
  }

  /**
   * Calculate streak health score
   */
  private calculateStreakHealth(userEngagement: UserEngagement): number {
    const streaks = [
      userEngagement.postingStreak,
      userEngagement.diaryStreak,
      userEngagement.communityStreak,
    ];

    const avgStreak = streaks.reduce((sum, streak) => sum + streak.currentStreak, 0) / streaks.length;
    const consistency = streaks.filter(streak => streak.currentStreak > 0).length / streaks.length;

    return (avgStreak * 0.7) + (consistency * 30);
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(userEngagement: UserEngagement, patterns: BehaviorPattern[]): string[] {
    const recommendations: string[] = [];

    // Streak recommendations
    if (userEngagement.combinedStreak.currentStreak === 0) {
      recommendations.push("Start building your mindful streak by sharing a thought or writing a diary entry today!");
    } else if (userEngagement.combinedStreak.currentStreak < 7) {
      recommendations.push(`You're ${7 - userEngagement.combinedStreak.currentStreak} days away from your first week milestone!`);
    }

    // Level recommendations
    const nextLevelXP = [100, 300, 600, 1000, 1500, 2500][userEngagement.level - 1] || 3000;
    const xpNeeded = nextLevelXP - userEngagement.experience;
    if (xpNeeded > 0 && xpNeeded < 50) {
      recommendations.push(`You're only ${xpNeeded} XP away from leveling up! Try writing a thoughtful diary entry.`);
    }

    // Engagement pattern recommendations
    const optimalTimePattern = patterns.find(p => p.patternType === 'optimal_time');
    if (optimalTimePattern) {
      const peakHour = optimalTimePattern.pattern.peakHours[0];
      recommendations.push(`You're most active around ${peakHour}:00. Consider setting a daily reminder for this time!`);
    }

    return recommendations;
  }
}

export default new BehaviorAnalyzer();