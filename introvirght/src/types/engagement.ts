// Core engagement data types
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

// Main user engagement profile
export interface UserEngagementProfile {
  id: string;
  userId: string;
  
  // Streak data
  streaks: {
    posting: StreakData;
    diary: StreakData;
    community: StreakData;
    combined: StreakData;
  };
  
  // Gamification
  gamification: {
    level: number;
    experience: number;
    badges: Badge[];
    achievements: Achievement[];
    unlockedFeatures: string[];
  };
  
  // Personalization
  personalization: {
    preferredThemes: string[];
    contentPreferences: ContentPreference[];
    optimalEngagementTimes: TimeSlot[];
    moodPatterns: MoodPattern[];
  };
  
  // Analytics
  analytics: {
    totalSessions: number;
    averageSessionDuration: number;
    contentCreated: number;
    socialImpact: SocialImpactMetrics;
    emotionalGrowth: EmotionalGrowthMetrics;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Engagement events
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

export interface EngagementEvent {
  id: string;
  userId: string;
  eventType: 'post_create' | 'diary_entry' | 'like' | 'comment' | 'share' | 'login' | 'achievement' | 'streak_milestone' | 'level_up' | 'badge_unlock';
  timestamp: Date;
  metadata: EventMetadata;
  rewards: EventRewards;
  processed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Level system
export interface LevelInfo {
  level: number;
  title: string;
  description: string;
  experienceRequired: number;
  experienceToNext: number;
  unlockedFeatures: string[];
  badge?: Badge;
}

// Notification types
export interface EngagementNotification {
  id: string;
  userId: string;
  type: 'streak_reminder' | 'milestone_celebration' | 'level_up' | 'badge_unlock' | 'daily_prompt' | 'community_event';
  title: string;
  message: string;
  actionUrl?: string;
  scheduledFor: Date;
  sent: boolean;
  opened: boolean;
  createdAt: Date;
}

// Analytics and insights
export interface BehaviorPattern {
  userId: string;
  patternType: 'optimal_time' | 'content_preference' | 'engagement_style' | 'mood_correlation';
  pattern: any;
  confidence: number;
  lastUpdated: Date;
}

export interface UserInsights {
  engagementLevel: string;
  behaviorPatterns: BehaviorPattern[];
  recentActivity: EngagementEvent[];
  recommendations: string[];
  growthMetrics: {
    experienceGrowth: number;
    streakHealth: number;
    socialImpact: SocialImpactMetrics;
  };
}

// Recommendation types
export interface RecommendationScore {
  itemId: string;
  itemType: 'post' | 'user' | 'diary_prompt';
  score: number;
  reasons: string[];
  metadata?: any;
}

export interface UserSimilarity {
  userId: string;
  similarity: number;
  sharedInterests: string[];
  engagementOverlap: number;
}

// API response types
export interface EngagementResponse {
  success: boolean;
  data?: {
    userEngagement?: UserEngagementProfile;
    rewards?: EventRewards;
    celebrations?: CelebrationData[];
    insights?: UserInsights;
    recommendations?: RecommendationScore[];
  };
  error?: {
    code: string;
    message: string;
  };
}

// Theme and personalization
export interface ThemeConfig {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  unlockLevel: number;
  category: 'basic' | 'premium' | 'seasonal' | 'achievement';
}

export interface PersonalizationSettings {
  selectedTheme: string;
  animationIntensity: 'minimal' | 'moderate' | 'full';
  notificationPreferences: {
    streakReminders: boolean;
    milestoneAlerts: boolean;
    dailyPrompts: boolean;
    communityUpdates: boolean;
  };
  privacySettings: {
    showStreaksPublicly: boolean;
    showAchievementsPublicly: boolean;
    allowRecommendations: boolean;
  };
}