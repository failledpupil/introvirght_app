import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// TypeScript interfaces for engagement data
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
  nextMilestone: number;
  gracePeriodsUsed: number;
  streakType: 'posting' | 'diary' | 'engagement' | 'combined';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: 'streak' | 'achievement' | 'social' | 'growth';
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  completedAt?: Date;
  rewards: {
    experience: number;
    badges?: string[];
    unlocks?: string[];
  };
}

export interface ContentPreference {
  topic: string;
  weight: number;
  lastUpdated: Date;
}

export interface TimeSlot {
  hour: number;
  dayOfWeek: number;
  engagementScore: number;
}

export interface MoodPattern {
  mood: string;
  frequency: number;
  correlations: {
    timeOfDay: number[];
    dayOfWeek: number[];
    activities: string[];
  };
}

export interface SocialImpactMetrics {
  postsInspired: number;
  connectionsFormed: number;
  helpfulnessScore: number;
  communityContributions: number;
  positiveInteractions: number;
}

export interface EmotionalGrowthMetrics {
  emotionalAwareness: number;
  moodStability: number;
  reflectionDepth: number;
  gratitudePractice: number;
  growthTrend: 'improving' | 'stable' | 'declining';
}

// Main UserEngagement model attributes
export interface UserEngagementAttributes {
  id: string;
  userId: string;
  
  // Streak data
  postingStreak: StreakData;
  diaryStreak: StreakData;
  communityStreak: StreakData;
  combinedStreak: StreakData;
  
  // Gamification
  level: number;
  experience: number;
  badges: Badge[];
  achievements: Achievement[];
  unlockedFeatures: string[];
  
  // Personalization
  preferredThemes: string[];
  contentPreferences: ContentPreference[];
  optimalEngagementTimes: TimeSlot[];
  moodPatterns: MoodPattern[];
  
  // Analytics
  totalSessions: number;
  averageSessionDuration: number;
  contentCreated: number;
  socialImpact: SocialImpactMetrics;
  emotionalGrowth: EmotionalGrowthMetrics;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface UserEngagementCreationAttributes 
  extends Optional<UserEngagementAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Sequelize model
export class UserEngagement extends Model<UserEngagementAttributes, UserEngagementCreationAttributes>
  implements UserEngagementAttributes {
  
  public id!: string;
  public userId!: string;
  
  public postingStreak!: StreakData;
  public diaryStreak!: StreakData;
  public communityStreak!: StreakData;
  public combinedStreak!: StreakData;
  
  public level!: number;
  public experience!: number;
  public badges!: Badge[];
  public achievements!: Achievement[];
  public unlockedFeatures!: string[];
  
  public preferredThemes!: string[];
  public contentPreferences!: ContentPreference[];
  public optimalEngagementTimes!: TimeSlot[];
  public moodPatterns!: MoodPattern[];
  
  public totalSessions!: number;
  public averageSessionDuration!: number;
  public contentCreated!: number;
  public socialImpact!: SocialImpactMetrics;
  public emotionalGrowth!: EmotionalGrowthMetrics;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
UserEngagement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    
    // Streak data stored as JSON
    postingStreak: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        currentStreak: 0,
        longestStreak: 0,
        lastActivity: new Date(),
        nextMilestone: 7,
        gracePeriodsUsed: 0,
        streakType: 'posting',
      },
    },
    diaryStreak: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        currentStreak: 0,
        longestStreak: 0,
        lastActivity: new Date(),
        nextMilestone: 7,
        gracePeriodsUsed: 0,
        streakType: 'diary',
      },
    },
    communityStreak: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        currentStreak: 0,
        longestStreak: 0,
        lastActivity: new Date(),
        nextMilestone: 7,
        gracePeriodsUsed: 0,
        streakType: 'engagement',
      },
    },
    combinedStreak: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        currentStreak: 0,
        longestStreak: 0,
        lastActivity: new Date(),
        nextMilestone: 7,
        gracePeriodsUsed: 0,
        streakType: 'combined',
      },
    },
    
    // Gamification
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    badges: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    achievements: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    unlockedFeatures: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    
    // Personalization
    preferredThemes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['sage'],
    },
    contentPreferences: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    optimalEngagementTimes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    moodPatterns: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    
    // Analytics
    totalSessions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    averageSessionDuration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    contentCreated: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    socialImpact: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        postsInspired: 0,
        connectionsFormed: 0,
        helpfulnessScore: 0,
        communityContributions: 0,
        positiveInteractions: 0,
      },
    },
    emotionalGrowth: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        emotionalAwareness: 0,
        moodStability: 0,
        reflectionDepth: 0,
        gratitudePractice: 0,
        growthTrend: 'stable',
      },
    },
    
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'UserEngagement',
    tableName: 'user_engagements',
    indexes: [
      {
        fields: ['userId'],
        unique: true,
      },
      {
        fields: ['level'],
      },
      {
        fields: ['experience'],
      },
    ],
  }
);

export default UserEngagement;