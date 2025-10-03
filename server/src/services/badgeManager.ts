import { Badge, Achievement } from '../models/UserEngagement';
import UserEngagement from '../models/UserEngagement';
import EngagementEvent from '../models/EngagementEvent';
import { Op } from 'sequelize';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: 'streak' | 'achievement' | 'social' | 'growth';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockCondition: (userEngagement: UserEngagement, events: EngagementEvent[]) => boolean;
  iconUrl?: string;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  maxProgress: number;
  progressCalculator: (userEngagement: UserEngagement, events: EngagementEvent[]) => number;
  rewards: {
    experience: number;
    badges?: string[];
    unlocks?: string[];
  };
}

export class BadgeManager {
  private badgeDefinitions: BadgeDefinition[] = [];
  private achievementDefinitions: AchievementDefinition[] = [];

  constructor() {
    this.initializeBadgeDefinitions();
    this.initializeAchievementDefinitions();
  }

  /**
   * Initialize all badge definitions
   */
  private initializeBadgeDefinitions(): void {
    this.badgeDefinitions = [
      // Streak Badges
      {
        id: 'first_week_streak',
        name: 'First Steps',
        description: 'Maintained a 7-day streak in any activity',
        category: 'streak',
        rarity: 'common',
        unlockCondition: (userEngagement) => {
          return Object.values(userEngagement.postingStreak).some((streak: any) => 
            streak.currentStreak >= 7 || streak.longestStreak >= 7
          );
        }
      },
      {
        id: 'month_warrior',
        name: 'Month Warrior',
        description: 'Achieved a 30-day streak - true dedication!',
        category: 'streak',
        rarity: 'rare',
        unlockCondition: (userEngagement) => {
          return Object.values(userEngagement.postingStreak).some((streak: any) => 
            streak.currentStreak >= 30 || streak.longestStreak >= 30
          );
        }
      },
      {
        id: 'century_master',
        name: 'Century Master',
        description: 'Incredible! 100 days of consistent mindful practice',
        category: 'streak',
        rarity: 'epic',
        unlockCondition: (userEngagement) => {
          return Object.values(userEngagement.postingStreak).some((streak: any) => 
            streak.currentStreak >= 100 || streak.longestStreak >= 100
          );
        }
      },
      {
        id: 'year_legend',
        name: 'Year Legend',
        description: 'Legendary achievement: 365 days of mindful engagement',
        category: 'streak',
        rarity: 'legendary',
        unlockCondition: (userEngagement) => {
          return Object.values(userEngagement.postingStreak).some((streak: any) => 
            streak.currentStreak >= 365 || streak.longestStreak >= 365
          );
        }
      },

      // Social Badges
      {
        id: 'community_helper',
        name: 'Community Helper',
        description: 'Helped others through meaningful interactions',
        category: 'social',
        rarity: 'common',
        unlockCondition: (userEngagement) => {
          return userEngagement.socialImpact.communityContributions >= 10;
        }
      },
      {
        id: 'inspiration_source',
        name: 'Inspiration Source',
        description: 'Your posts have inspired 50+ people to reflect',
        category: 'social',
        rarity: 'rare',
        unlockCondition: (userEngagement) => {
          return userEngagement.socialImpact.postsInspired >= 50;
        }
      },
      {
        id: 'connection_catalyst',
        name: 'Connection Catalyst',
        description: 'Facilitated meaningful connections in the community',
        category: 'social',
        rarity: 'epic',
        unlockCondition: (userEngagement) => {
          return userEngagement.socialImpact.connectionsFormed >= 25;
        }
      },

      // Growth Badges
      {
        id: 'self_aware',
        name: 'Self Aware',
        description: 'Demonstrated growing emotional awareness',
        category: 'growth',
        rarity: 'common',
        unlockCondition: (userEngagement) => {
          return userEngagement.emotionalGrowth.emotionalAwareness >= 50;
        }
      },
      {
        id: 'mindful_sage',
        name: 'Mindful Sage',
        description: 'Achieved high levels of mindful reflection',
        category: 'growth',
        rarity: 'rare',
        unlockCondition: (userEngagement) => {
          return userEngagement.emotionalGrowth.reflectionDepth >= 75;
        }
      },
      {
        id: 'gratitude_master',
        name: 'Gratitude Master',
        description: 'Mastered the practice of daily gratitude',
        category: 'growth',
        rarity: 'epic',
        unlockCondition: (userEngagement) => {
          return userEngagement.emotionalGrowth.gratitudePractice >= 90;
        }
      },

      // Achievement Badges
      {
        id: 'level_5_achiever',
        name: 'Wisdom Keeper',
        description: 'Reached Level 5 - Wisdom Keeper status',
        category: 'achievement',
        rarity: 'rare',
        unlockCondition: (userEngagement) => {
          return userEngagement.level >= 5;
        }
      },
      {
        id: 'experience_master',
        name: 'Experience Master',
        description: 'Accumulated over 2000 experience points',
        category: 'achievement',
        rarity: 'epic',
        unlockCondition: (userEngagement) => {
          return userEngagement.experience >= 2000;
        }
      },
      {
        id: 'content_creator',
        name: 'Content Creator',
        description: 'Created 100+ pieces of mindful content',
        category: 'achievement',
        rarity: 'rare',
        unlockCondition: (userEngagement) => {
          return userEngagement.contentCreated >= 100;
        }
      }
    ];
  }

  /**
   * Initialize all achievement definitions
   */
  private initializeAchievementDefinitions(): void {
    this.achievementDefinitions = [
      {
        id: 'daily_writer',
        name: 'Daily Writer',
        description: 'Write diary entries for consecutive days',
        category: 'writing',
        maxProgress: 30,
        progressCalculator: (userEngagement) => {
          return Math.min(userEngagement.diaryStreak.currentStreak, 30);
        },
        rewards: {
          experience: 100,
          badges: ['daily_writer_badge'],
          unlocks: ['advanced_diary_templates']
        }
      },
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Engage with community members through likes and comments',
        category: 'social',
        maxProgress: 100,
        progressCalculator: (userEngagement) => {
          return Math.min(userEngagement.socialImpact.positiveInteractions, 100);
        },
        rewards: {
          experience: 150,
          badges: ['social_butterfly_badge'],
          unlocks: ['community_features']
        }
      },
      {
        id: 'mindful_explorer',
        name: 'Mindful Explorer',
        description: 'Explore different aspects of mindfulness and self-reflection',
        category: 'growth',
        maxProgress: 50,
        progressCalculator: (userEngagement) => {
          return Math.min(userEngagement.emotionalGrowth.emotionalAwareness, 50);
        },
        rewards: {
          experience: 200,
          badges: ['mindful_explorer_badge'],
          unlocks: ['mood_insights']
        }
      },
      {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Maintain multiple types of streaks simultaneously',
        category: 'consistency',
        maxProgress: 21, // 3 weeks of all streaks active
        progressCalculator: (userEngagement) => {
          const activeStreaks = [
            userEngagement.postingStreak,
            userEngagement.diaryStreak,
            userEngagement.communityStreak
          ].filter(streak => streak.currentStreak > 0).length;
          
          return activeStreaks === 3 ? Math.min(userEngagement.combinedStreak.currentStreak, 21) : 0;
        },
        rewards: {
          experience: 300,
          badges: ['streak_master_badge'],
          unlocks: ['premium_themes']
        }
      },
      {
        id: 'inspiration_giver',
        name: 'Inspiration Giver',
        description: 'Inspire others through your thoughtful posts and interactions',
        category: 'impact',
        maxProgress: 100,
        progressCalculator: (userEngagement) => {
          return Math.min(userEngagement.socialImpact.postsInspired, 100);
        },
        rewards: {
          experience: 250,
          badges: ['inspiration_giver_badge'],
          unlocks: ['featured_content']
        }
      }
    ];
  }

  /**
   * Check and award new badges for a user
   */
  async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    const userEngagement = await UserEngagement.findOne({ where: { userId } });
    if (!userEngagement) return [];

    const events = await EngagementEvent.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    const currentBadgeIds = userEngagement.badges.map(badge => badge.id);
    const newBadges: Badge[] = [];

    // Check each badge definition
    for (const badgeDef of this.badgeDefinitions) {
      // Skip if user already has this badge
      if (currentBadgeIds.includes(badgeDef.id)) continue;

      // Check unlock condition
      if (badgeDef.unlockCondition(userEngagement, events)) {
        const newBadge: Badge = {
          id: badgeDef.id,
          name: badgeDef.name,
          description: badgeDef.description,
          iconUrl: badgeDef.iconUrl || '',
          category: badgeDef.category,
          unlockedAt: new Date(),
          rarity: badgeDef.rarity
        };

        newBadges.push(newBadge);
      }
    }

    // Add new badges to user's collection
    if (newBadges.length > 0) {
      userEngagement.badges = [...userEngagement.badges, ...newBadges];
      await userEngagement.save();
    }

    return newBadges;
  }

  /**
   * Update achievement progress for a user
   */
  async updateAchievementProgress(userId: string): Promise<Achievement[]> {
    const userEngagement = await UserEngagement.findOne({ where: { userId } });
    if (!userEngagement) return [];

    const events = await EngagementEvent.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    const updatedAchievements: Achievement[] = [];
    const currentAchievements = userEngagement.achievements || [];

    // Process each achievement definition
    for (const achievementDef of this.achievementDefinitions) {
      let existingAchievement = currentAchievements.find(a => a.id === achievementDef.id);
      
      // Calculate current progress
      const currentProgress = achievementDef.progressCalculator(userEngagement, events);
      const isCompleted = currentProgress >= achievementDef.maxProgress;

      if (!existingAchievement) {
        // Create new achievement
        existingAchievement = {
          id: achievementDef.id,
          name: achievementDef.name,
          description: achievementDef.description,
          category: achievementDef.category,
          progress: currentProgress,
          maxProgress: achievementDef.maxProgress,
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : undefined,
          rewards: achievementDef.rewards
        };
        updatedAchievements.push(existingAchievement);
      } else if (!existingAchievement.completed && currentProgress > existingAchievement.progress) {
        // Update existing achievement progress
        existingAchievement.progress = currentProgress;
        existingAchievement.completed = isCompleted;
        if (isCompleted && !existingAchievement.completedAt) {
          existingAchievement.completedAt = new Date();
        }
        updatedAchievements.push(existingAchievement);
      }
    }

    // Update user's achievements
    if (updatedAchievements.length > 0) {
      // Merge with existing achievements
      const achievementMap = new Map(currentAchievements.map(a => [a.id, a]));
      updatedAchievements.forEach(achievement => {
        achievementMap.set(achievement.id, achievement);
      });
      
      userEngagement.achievements = Array.from(achievementMap.values());
      await userEngagement.save();
    }

    return updatedAchievements.filter(a => a.completed);
  }

  /**
   * Get all available badges
   */
  getAllBadgeDefinitions(): BadgeDefinition[] {
    return this.badgeDefinitions;
  }

  /**
   * Get all available achievements
   */
  getAllAchievementDefinitions(): AchievementDefinition[] {
    return this.achievementDefinitions;
  }

  /**
   * Get badge by ID
   */
  getBadgeDefinition(badgeId: string): BadgeDefinition | undefined {
    return this.badgeDefinitions.find(badge => badge.id === badgeId);
  }

  /**
   * Get achievement by ID
   */
  getAchievementDefinition(achievementId: string): AchievementDefinition | undefined {
    return this.achievementDefinitions.find(achievement => achievement.id === achievementId);
  }

  /**
   * Get user's badge progress (which badges they can earn next)
   */
  async getUserBadgeProgress(userId: string): Promise<{
    earned: Badge[];
    available: { badge: BadgeDefinition; canEarn: boolean; progress?: string }[];
  }> {
    const userEngagement = await UserEngagement.findOne({ where: { userId } });
    if (!userEngagement) {
      return { earned: [], available: [] };
    }

    const events = await EngagementEvent.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    const earnedBadgeIds = userEngagement.badges.map(badge => badge.id);
    const available = this.badgeDefinitions
      .filter(badgeDef => !earnedBadgeIds.includes(badgeDef.id))
      .map(badgeDef => ({
        badge: badgeDef,
        canEarn: badgeDef.unlockCondition(userEngagement, events),
        progress: this.getBadgeProgressDescription(badgeDef, userEngagement)
      }));

    return {
      earned: userEngagement.badges,
      available
    };
  }

  /**
   * Get progress description for a badge
   */
  private getBadgeProgressDescription(badgeDef: BadgeDefinition, userEngagement: UserEngagement): string {
    switch (badgeDef.id) {
      case 'first_week_streak':
        const maxStreak = Math.max(
          userEngagement.postingStreak.currentStreak,
          userEngagement.diaryStreak.currentStreak,
          userEngagement.communityStreak.currentStreak
        );
        return `${maxStreak}/7 days`;
      
      case 'month_warrior':
        const maxMonthStreak = Math.max(
          userEngagement.postingStreak.longestStreak,
          userEngagement.diaryStreak.longestStreak,
          userEngagement.communityStreak.longestStreak
        );
        return `${maxMonthStreak}/30 days`;
      
      case 'community_helper':
        return `${userEngagement.socialImpact.communityContributions}/10 contributions`;
      
      case 'content_creator':
        return `${userEngagement.contentCreated}/100 posts`;
      
      default:
        return 'Keep engaging to unlock!';
    }
  }

  /**
   * Award experience points for completed achievements
   */
  async awardAchievementRewards(userId: string, completedAchievements: Achievement[]): Promise<number> {
    let totalXP = 0;
    
    for (const achievement of completedAchievements) {
      totalXP += achievement.rewards.experience;
      
      // Award badges if specified
      if (achievement.rewards.badges) {
        // This would trigger badge checks in the main engagement engine
      }
      
      // Unlock features if specified
      if (achievement.rewards.unlocks) {
        const userEngagement = await UserEngagement.findOne({ where: { userId } });
        if (userEngagement) {
          userEngagement.unlockedFeatures = [
            ...new Set([...userEngagement.unlockedFeatures, ...achievement.rewards.unlocks])
          ];
          await userEngagement.save();
        }
      }
    }
    
    return totalXP;
  }
}

export default new BadgeManager();