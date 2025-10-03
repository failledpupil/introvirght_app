import React, { useState, useEffect } from 'react';
import type { UserEngagementProfile } from '../../types/engagement';
import StreakDashboard from './StreakDashboard';
import BadgeCollection from './BadgeCollection';
import AchievementGallery from './AchievementGallery';
import PersonalizedFeed from './PersonalizedFeed';
import SuggestedConnections from './SuggestedConnections';
import LevelProgressCard from './LevelProgressCard';

interface EngagementDashboardProps {
  userId: string;
  className?: string;
}

const EngagementDashboard: React.FC<EngagementDashboardProps> = ({
  userId,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'streaks' | 'achievements' | 'recommendations' | 'connections'>('overview');
  const [userEngagement, setUserEngagement] = useState<UserEngagementProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserEngagement();
  }, [userId]);

  const loadUserEngagement = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockEngagement: UserEngagementProfile = {
        id: 'engagement_1',
        userId,
        streaks: {
          posting: {
            currentStreak: 12,
            longestStreak: 25,
            lastActivity: new Date(),
            nextMilestone: 14,
            gracePeriodsUsed: 1,
            streakType: 'posting'
          },
          diary: {
            currentStreak: 8,
            longestStreak: 15,
            lastActivity: new Date(),
            nextMilestone: 14,
            gracePeriodsUsed: 0,
            streakType: 'diary'
          },
          community: {
            currentStreak: 5,
            longestStreak: 12,
            lastActivity: new Date(),
            nextMilestone: 7,
            gracePeriodsUsed: 2,
            streakType: 'engagement'
          },
          combined: {
            currentStreak: 15,
            longestStreak: 28,
            lastActivity: new Date(),
            nextMilestone: 30,
            gracePeriodsUsed: 1,
            streakType: 'combined'
          }
        },
        gamification: {
          level: 4,
          experience: 850,
          badges: [
            {
              id: 'first_week',
              name: 'First Steps',
              description: 'Completed your first week of mindful engagement',
              iconUrl: '',
              category: 'streak',
              unlockedAt: new Date('2024-09-15'),
              rarity: 'common'
            },
            {
              id: 'community_helper',
              name: 'Community Helper',
              description: 'Helped others through meaningful interactions',
              iconUrl: '',
              category: 'social',
              unlockedAt: new Date('2024-09-20'),
              rarity: 'rare'
            }
          ],
          achievements: [
            {
              id: 'daily_writer',
              name: 'Daily Writer',
              description: 'Write diary entries for consecutive days',
              category: 'writing',
              progress: 8,
              maxProgress: 30,
              completed: false,
              rewards: {
                experience: 100,
                badges: ['daily_writer_badge'],
                unlocks: ['advanced_diary_templates']
              }
            },
            {
              id: 'social_butterfly',
              name: 'Social Butterfly',
              description: 'Engage with community members',
              category: 'social',
              progress: 45,
              maxProgress: 100,
              completed: false,
              rewards: {
                experience: 150,
                badges: ['social_butterfly_badge']
              }
            }
          ],
          unlockedFeatures: ['custom_themes', 'advanced_diary_templates']
        },
        personalization: {
          preferredThemes: ['sage', 'lavender'],
          contentPreferences: [
            { topic: 'mindfulness', weight: 0.8, lastUpdated: new Date() },
            { topic: 'gratitude', weight: 0.6, lastUpdated: new Date() },
            { topic: 'growth', weight: 0.7, lastUpdated: new Date() }
          ],
          optimalEngagementTimes: [
            { hour: 9, dayOfWeek: 1, engagementScore: 0.8 },
            { hour: 19, dayOfWeek: 3, engagementScore: 0.9 }
          ],
          moodPatterns: []
        },
        analytics: {
          totalSessions: 45,
          averageSessionDuration: 1200000, // 20 minutes
          contentCreated: 32,
          socialImpact: {
            postsInspired: 12,
            connectionsFormed: 8,
            helpfulnessScore: 75,
            communityContributions: 15,
            positiveInteractions: 89
          },
          emotionalGrowth: {
            emotionalAwareness: 65,
            moodStability: 70,
            reflectionDepth: 80,
            gratitudePractice: 85,
            growthTrend: 'improving'
          }
        },
        createdAt: new Date('2024-09-01'),
        updatedAt: new Date()
      };

      setUserEngagement(mockEngagement);
    } catch (error) {
      console.error('Failed to load user engagement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelInfo = () => {
    if (!userEngagement) return null;
    
    const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2500];
    const level = userEngagement.gamification.level;
    const experience = userEngagement.gamification.experience;
    const experienceRequired = levelThresholds[level - 1] || 0;
    const nextLevelXP = levelThresholds[level] || 3000;
    const experienceToNext = Math.max(0, nextLevelXP - experience);

    const titles = [
      'Thoughtful Beginner',
      'Reflective Explorer',
      'Mindful Contributor',
      'Community Connector',
      'Wisdom Keeper',
      'Mindful Sage'
    ];

    return {
      level,
      title: titles[level - 1] || 'Mindful Master',
      description: `You've reached Level ${level} through consistent mindful engagement and authentic connection.`,
      experienceRequired,
      experienceToNext,
      unlockedFeatures: userEngagement.gamification.unlockedFeatures
    };
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'streaks', label: 'Streaks', icon: '🔥' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'recommendations', label: 'For You', icon: '✨' },
    { id: 'connections', label: 'Connect', icon: '🤝' }
  ];

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-stone-200 rounded w-1/3 mb-4"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card-gentle">
                <div className="space-y-4">
                  <div className="h-6 bg-stone-200 rounded"></div>
                  <div className="h-4 bg-stone-200 rounded w-2/3"></div>
                  <div className="h-20 bg-stone-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!userEngagement) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-stone-700 mb-2">
          Unable to Load Engagement Data
        </h3>
        <p className="text-stone-600 text-sm mb-4">
          There was an issue loading your engagement profile.
        </p>
        <button onClick={loadUserEngagement} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const levelInfo = getLevelInfo();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Your Mindful Journey
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Track your progress, celebrate achievements, and discover new connections 
          on your path of authentic self-expression and mindful growth.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-3 border-b-2 border-blue-200 pb-6">
        {tabs.map((tab, index) => {
          const gradients = [
            'from-blue-500 to-indigo-600',
            'from-emerald-500 to-teal-600', 
            'from-purple-500 to-pink-600',
            'from-orange-500 to-red-600',
            'from-pink-500 to-rose-600'
          ];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${gradients[index]} text-white shadow-lg`
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Level Progress */}
            {levelInfo && (
              <LevelProgressCard
                levelInfo={levelInfo}
                currentXP={userEngagement.gamification.experience}
              />
            )}

            {/* Quick Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card-gentle text-center bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 hover:shadow-xl transition-all duration-300">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {userEngagement.streaks.combined.currentStreak}
                </div>
                <div className="text-blue-700 text-sm font-semibold">Day Combined Streak</div>
                <div className="text-xs text-blue-600 mt-1">
                  Longest: {userEngagement.streaks.combined.longestStreak} days
                </div>
              </div>
              
              <div className="card-gentle text-center bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 hover:shadow-xl transition-all duration-300">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {userEngagement.gamification.badges.length}
                </div>
                <div className="text-purple-700 text-sm font-semibold">Badges Earned</div>
                <div className="text-xs text-purple-600 mt-1">
                  {userEngagement.gamification.achievements.filter(a => a.completed).length} achievements completed
                </div>
              </div>
              
              <div className="card-gentle text-center bg-gradient-to-br from-emerald-50 to-teal-100 border-2 border-emerald-200 hover:shadow-xl transition-all duration-300">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  {userEngagement.analytics.socialImpact.positiveInteractions}
                </div>
                <div className="text-emerald-700 text-sm font-semibold">Positive Interactions</div>
                <div className="text-xs text-emerald-600 mt-1">
                  {userEngagement.analytics.socialImpact.communityContributions} contributions
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="card-gentle">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">
                Recent Achievements
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {userEngagement.gamification.badges.slice(-2).map((badge) => (
                  <div key={badge.id} className="flex items-center space-x-3 p-3 bg-stone-50 rounded-lg">
                    <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{badge.name}</p>
                      <p className="text-sm text-stone-600">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'streaks' && (
          <StreakDashboard userEngagement={userEngagement} />
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-8">
            <BadgeCollection 
              badges={userEngagement.gamification.badges}
              recentlyUnlocked={userEngagement.gamification.badges.slice(-1)}
            />
            <AchievementGallery 
              achievements={userEngagement.gamification.achievements}
            />
          </div>
        )}

        {activeTab === 'recommendations' && (
          <PersonalizedFeed userId={userId} />
        )}

        {activeTab === 'connections' && (
          <SuggestedConnections userId={userId} />
        )}
      </div>
    </div>
  );
};

export default EngagementDashboard;