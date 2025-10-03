import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// TypeScript interfaces for engagement events
export interface MoodData {
  mood: string;
  intensity: number;
  context?: string;
}

export interface CelebrationData {
  type: 'level_up' | 'badge_unlock' | 'streak_milestone' | 'achievement';
  title: string;
  description: string;
  animationType: 'confetti' | 'particles' | 'badge_reveal' | 'level_animation';
}

export interface EventMetadata {
  contentId?: string;
  experienceGained: number;
  streakImpact: boolean;
  qualityScore: number;
  emotionalContext?: MoodData;
  sessionId?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  location?: {
    country?: string;
    timezone?: string;
  };
}

export interface EventRewards {
  experience: number;
  badges?: string[];
  unlocks?: string[];
  celebrations?: CelebrationData[];
}

// Main EngagementEvent model attributes
export interface EngagementEventAttributes {
  id: string;
  userId: string;
  eventType: 'post_create' | 'diary_entry' | 'like' | 'comment' | 'share' | 'login' | 'achievement' | 'streak_milestone' | 'level_up' | 'badge_unlock';
  timestamp: Date;
  metadata: EventMetadata;
  rewards: EventRewards;
  processed: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface EngagementEventCreationAttributes 
  extends Optional<EngagementEventAttributes, 'id' | 'processed' | 'createdAt' | 'updatedAt'> {}

// Sequelize model
export class EngagementEvent extends Model<EngagementEventAttributes, EngagementEventCreationAttributes>
  implements EngagementEventAttributes {
  
  public id!: string;
  public userId!: string;
  public eventType!: 'post_create' | 'diary_entry' | 'like' | 'comment' | 'share' | 'login' | 'achievement' | 'streak_milestone' | 'level_up' | 'badge_unlock';
  public timestamp!: Date;
  public metadata!: EventMetadata;
  public rewards!: EventRewards;
  public processed!: boolean;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
EngagementEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    eventType: {
      type: DataTypes.ENUM(
        'post_create',
        'diary_entry', 
        'like',
        'comment',
        'share',
        'login',
        'achievement',
        'streak_milestone',
        'level_up',
        'badge_unlock'
      ),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        experienceGained: 0,
        streakImpact: false,
        qualityScore: 1.0,
      },
    },
    rewards: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        experience: 0,
      },
    },
    processed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    modelName: 'EngagementEvent',
    tableName: 'engagement_events',
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['eventType'],
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['processed'],
      },
      {
        fields: ['userId', 'eventType'],
      },
      {
        fields: ['userId', 'timestamp'],
      },
    ],
  }
);

export default EngagementEvent;