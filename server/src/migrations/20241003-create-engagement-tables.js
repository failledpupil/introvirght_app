'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create user_engagements table
    await queryInterface.createTable('user_engagements', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      
      // Streak data
      postingStreak: {
        type: Sequelize.JSON,
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
        type: Sequelize.JSON,
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
        type: Sequelize.JSON,
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
        type: Sequelize.JSON,
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
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      experience: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      badges: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      achievements: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      unlockedFeatures: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      
      // Personalization
      preferredThemes: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: ['sage'],
      },
      contentPreferences: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      optimalEngagementTimes: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      moodPatterns: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      
      // Analytics
      totalSessions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      averageSessionDuration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      contentCreated: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      socialImpact: {
        type: Sequelize.JSON,
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
        type: Sequelize.JSON,
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
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Create engagement_events table
    await queryInterface.createTable('engagement_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      eventType: {
        type: Sequelize.ENUM(
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
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          experienceGained: 0,
          streakImpact: false,
          qualityScore: 1.0,
        },
      },
      rewards: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          experience: 0,
        },
      },
      processed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes for user_engagements
    await queryInterface.addIndex('user_engagements', ['userId'], {
      unique: true,
      name: 'user_engagements_userId_unique',
    });
    await queryInterface.addIndex('user_engagements', ['level']);
    await queryInterface.addIndex('user_engagements', ['experience']);

    // Add indexes for engagement_events
    await queryInterface.addIndex('engagement_events', ['userId']);
    await queryInterface.addIndex('engagement_events', ['eventType']);
    await queryInterface.addIndex('engagement_events', ['timestamp']);
    await queryInterface.addIndex('engagement_events', ['processed']);
    await queryInterface.addIndex('engagement_events', ['userId', 'eventType']);
    await queryInterface.addIndex('engagement_events', ['userId', 'timestamp']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('engagement_events');
    await queryInterface.dropTable('user_engagements');
  }
};