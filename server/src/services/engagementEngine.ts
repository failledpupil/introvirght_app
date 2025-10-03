import UserEngagement, { StreakData, Badge, Achievement } from '../models/UserEngagement';
import EngagementEvent, { EventMetadata, EventRewards, CelebrationData } from '../models/EngagementEvent';
import { Op } from 'sequelize';

export interface EngagementConfig {
  xpRewards: {
    postCreate: number;
    diaryEntry: number;
    meaningfulComment: number;
    receiveLike: number;
    communityParticipation: number;
  };
  levelThresholds: number[];
  streakMilestones: number[];
  gracePeriodsAllowed: number;
}

export class EngagementEngine {
  private config: EngagementConfig;

  constructor() {
    this.config = {
      xpRewards: {
        postCreate: 10,
        diaryEntry: 15,
        meaningfulComment: 5,
        receiveLike: 2,
        communityParticipation: 3,
      },
      levelThresholds: [0, 100, 300, 600, 1000, 1500, 2500], // XP needed for each level
      streakMilestones: [7, 14, 30, 60, 100, 365],
      gracePeriodsAllowed: 3,
    };
  }

  /**
   * Process an engagement event and update user's engagement profile
   */
  async processEngagementEvent(
    userId: string,
    eventType: string,
    metadata: Partial<EventMetadata> = {}
  ): Promise<{ rewards: EventRewards; celebrations: CelebrationData[] }> {
    try {
      // Get or create user engagement profile
      let userEngagement = await UserEngagement.findOne({ where: { userId } });
      if (!userEngagement) {
        userEngagement = await this.createInitialEngagementProfile(userId);
      }

      // Calculate rewards for this event
      const rewards = this.calculateEventRewards(eventType, metadata);
      
      // Update streaks
      const streakUpdates = await this.updateStreaks(userEngagement, eventType);
      
      // Update experience and check for level up
      const oldLevel = userEngagement.level;
      userEngagement.experience += rewards.experience;
      const newLevel = this.calculateLevel(userEngagement.experience);
      
      // Check for level up celebration
      const celebrations: CelebrationData[] = [];
      if (newLevel > oldLevel) {
        userEngagement.level = newLevel;
        celebrations.push(this.createLevelUpCelebration(oldLevel, newLevel));
        
        // Unlock new features based on level
        const newUnlocks = this.getFeatureUnlocks(newLevel);
        userEngagement.unlockedFeatures = [
          ...new Set([...userEngagement.unlockedFeatures, ...newUnlocks])
        ];
        rewards.unlocks = newUnlocks;
      }

      // Check for streak milestone celebrations
      const streakCelebrations = this.checkStreakMilestones(streakUpdates);
      celebrations.push(...streakCelebrations);

      // Update analytics
      this.updateAnalytics(userEngagement, eventType, metadata);

      // Save updated engagement profile
      await userEngagement.save();

      // Create engagement event record
      await EngagementEvent.create({
        userId,
        eventType: eventType as any,
        timestamp: new Date(),
        metadata: {
          experienceGained: rewards.experience,
          streakImpact: streakUpdates.length > 0,
          qualityScore: metadata.qualityScore || 1.0,
          ...metadata,
        },
        rewards,
        processed: true,
      });

      return { rewards, celebrations };
    } catch (error) {
      console.error('Error processing engagement event:', error);
      throw error;
    }
  }

  /**
   * Create initial engagement profile for new user
   */
  private async createInitialEngagementProfile(userId: string): Promise<UserEngagement> {
    const defaultStreakData: StreakData = {
      currentStreak: 0,
      longestStreak: 0,
      lastActivity: new Date(),
      nextMilestone: 7,
      gracePeriodsUsed: 0,
      streakType: 'posting',
    };

    return await UserEngagement.create({
      userId,
      postingStreak: { ...defaultStreakData, streakType: 'posting' },
      diaryStreak: { ...defaultStreakData, streakType: 'diary' },
      communityStreak: { ...defaultStreakData, streakType: 'engagement' },
      combinedStreak: { ...defaultStreakData, streakType: 'combined' },
      level: 1,
      experience: 0,
      badges: [],
      achievements: [],
      unlockedFeatures: ['basic_themes'],
      preferredThemes: ['sage'],
      contentPreferences: [],
      optimalEngagementTimes: [],
      moodPatterns: [],
      totalSessions: 0,
      averageSessionDuration: 0,
      contentCreated: 0,
      socialImpact: {
        postsInspired: 0,
        connectionsFormed: 0,
        helpfulnessScore: 0,
        communityContributions: 0,
        positiveInteractions: 0,
      },
      emotionalGrowth: {
        emotionalAwareness: 0,
        moodStability: 0,
        reflectionDepth: 0,
        gratitudePractice: 0,
        growthTrend: 'stable',
      },
    });
  }

  /**
   * Calculate XP rewards for different event types
   */
  private calculateEventRewards(eventType: string, metadata: Partial<EventMetadata>): EventRewards {
    let baseXP = 0;
    
    switch (eventType) {
      case 'post_create':
        baseXP = this.config.xpRewards.postCreate;
        // Bonus for longer, thoughtful posts
        if (metadata.qualityScore && metadata.qualityScore > 1.5) {
          baseXP *= 1.5;
        }
        break;
      case 'diary_entry':
        baseXP = this.config.xpRewards.diaryEntry;
        // Bonus for mood tracking and reflection sections
        if (metadata.emotionalContext) {
          baseXP += 5;
        }
        break;
      case 'comment':
        baseXP = this.config.xpRewards.meaningfulComment;
        break;
      case 'like':
        baseXP = this.config.xpRewards.receiveLike;
        break;
      case 'login':
        baseXP = this.config.xpRewards.communityParticipation;
        break;
      default:
        baseXP = 1;
    }

    return {
      experience: Math.round(baseXP),
      badges: [],
      unlocks: [],
      celebrations: [],
    };
  }

  /**
   * Update user streaks based on activity
   */
  private async updateStreaks(
    userEngagement: UserEngagement, 
    eventType: string
  ): Promise<{ streakType: string; newStreak: number; milestone?: number }[]> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const updates: { streakType: string; newStreak: number; milestone?: number }[] = [];

    // Determine which streaks to update
    const streaksToUpdate: Array<{ key: keyof UserEngagement; type: string }> = [];
    
    if (eventType === 'post_create') {
      streaksToUpdate.push({ key: 'postingStreak', type: 'posting' });
      streaksToUpdate.push({ key: 'combinedStreak', type: 'combined' });
    } else if (eventType === 'diary_entry') {
      streaksToUpdate.push({ key: 'diaryStreak', type: 'diary' });
      streaksToUpdate.push({ key: 'combinedStreak', type: 'combined' });
    } else if (['comment', 'like', 'share'].includes(eventType)) {
      streaksToUpdate.push({ key: 'communityStreak', type: 'engagement' });
      streaksToUpdate.push({ key: 'combinedStreak', type: 'combined' });
    }

    // Update each relevant streak
    for (const { key, type } of streaksToUpdate) {
      const streak = userEngagement[key] as StreakData;
      const lastActivity = new Date(streak.lastActivity);
      
      // Check if this continues the streak
      if (this.isSameDay(lastActivity, now)) {
        // Same day activity, no streak change
        continue;
      } else if (this.isSameDay(lastActivity, yesterday)) {
        // Consecutive day, increment streak
        streak.currentStreak += 1;
        streak.lastActivity = now;
        
        // Update longest streak if needed
        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak;
        }
        
        // Check for milestone
        const milestone = this.checkStreakMilestone(streak.currentStreak);
        if (milestone) {
          streak.nextMilestone = this.getNextMilestone(streak.currentStreak);
          updates.push({ streakType: type, newStreak: streak.currentStreak, milestone });
        } else {
          updates.push({ streakType: type, newStreak: streak.currentStreak });
        }
      } else {
        // Streak broken, check for grace period
        const daysSinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000));
        
        if (daysSinceLastActivity <= 2 && streak.gracePeriodsUsed < this.config.gracePeriodsAllowed) {
          // Use grace period
          streak.gracePeriodsUsed += 1;
          streak.lastActivity = now;
          updates.push({ streakType: type, newStreak: streak.currentStreak });
        } else {
          // Reset streak
          streak.currentStreak = 1;
          streak.lastActivity = now;
          streak.gracePeriodsUsed = 0;
          streak.nextMilestone = 7;
          updates.push({ streakType: type, newStreak: 1 });
        }
      }
    }

    return updates;
  }

  /**
   * Calculate user level based on experience points
   */
  private calculateLevel(experience: number): number {
    for (let i = this.config.levelThresholds.length - 1; i >= 0; i--) {
      if (experience >= this.config.levelThresholds[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * Get feature unlocks for a specific level
   */
  private getFeatureUnlocks(level: number): string[] {
    const unlocks: { [key: number]: string[] } = {
      2: ['custom_themes'],
      3: ['advanced_diary_templates'],
      4: ['priority_feed'],
      5: ['beta_features'],
      6: ['premium_features', 'mentor_badge'],
    };
    
    return unlocks[level] || [];
  }

  /**
   * Create level up celebration data
   */
  private createLevelUpCelebration(oldLevel: number, newLevel: number): CelebrationData {
    const levelTitles = [
      'Thoughtful Beginner',
      'Reflective Explorer', 
      'Mindful Contributor',
      'Community Connector',
      'Wisdom Keeper',
      'Mindful Sage'
    ];

    return {
      type: 'level_up',
      title: `Level Up! You're now a ${levelTitles[newLevel - 1] || 'Mindful Master'}`,
      description: `You've reached level ${newLevel} and unlocked new features!`,
      animationType: 'level_animation',
    };
  }

  /**
   * Check if a streak milestone was reached
   */
  private checkStreakMilestone(streakCount: number): number | null {
    return this.config.streakMilestones.includes(streakCount) ? streakCount : null;
  }

  /**
   * Get the next milestone for a given streak count
   */
  private getNextMilestone(currentStreak: number): number {
    for (const milestone of this.config.streakMilestones) {
      if (milestone > currentStreak) {
        return milestone;
      }
    }
    return this.config.streakMilestones[this.config.streakMilestones.length - 1] + 100;
  }

  /**
   * Check for streak milestone celebrations
   */
  private checkStreakMilestones(streakUpdates: { streakType: string; newStreak: number; milestone?: number }[]): CelebrationData[] {
    const celebrations: CelebrationData[] = [];
    
    for (const update of streakUpdates) {
      if (update.milestone) {
        celebrations.push({
          type: 'streak_milestone',
          title: `${update.milestone} Day ${update.streakType} Streak!`,
          description: `Amazing dedication! You've maintained your ${update.streakType} streak for ${update.milestone} days.`,
          animationType: 'confetti',
        });
      }
    }
    
    return celebrations;
  }

  /**
   * Update analytics data
   */
  private updateAnalytics(
    userEngagement: UserEngagement, 
    eventType: string, 
    metadata: Partial<EventMetadata>
  ): void {
    // Update content creation count
    if (['post_create', 'diary_entry'].includes(eventType)) {
      userEngagement.contentCreated += 1;
    }

    // Update social impact metrics
    if (eventType === 'comment' && metadata.qualityScore && metadata.qualityScore > 1.2) {
      userEngagement.socialImpact.communityContributions += 1;
    }

    if (eventType === 'like') {
      userEngagement.socialImpact.positiveInteractions += 1;
    }

    // Update emotional growth metrics
    if (eventType === 'diary_entry' && metadata.emotionalContext) {
      userEngagement.emotionalGrowth.emotionalAwareness += 0.1;
      userEngagement.emotionalGrowth.reflectionDepth += 0.05;
    }
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  /**
   * Get user's current engagement profile
   */
  async getUserEngagement(userId: string): Promise<UserEngagement | null> {
    return await UserEngagement.findOne({ where: { userId } });
  }

  /**
   * Get user's recent engagement events
   */
  async getUserEngagementEvents(userId: string, limit: number = 50): Promise<EngagementEvent[]> {
    return await EngagementEvent.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      limit,
    });
  }

  /**
   * Get engagement leaderboard
   */
  async getEngagementLeaderboard(limit: number = 10): Promise<UserEngagement[]> {
    return await UserEngagement.findAll({
      order: [['experience', 'DESC']],
      limit,
    });
  }
}

export default new EngagementEngine();