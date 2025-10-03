import React, { useState, useEffect } from 'react';
import StreakTracker from './StreakTracker';
import type { UserEngagementProfile } from '../../types/engagement';

interface StreakDashboardProps {
  userEngagement: UserEngagementProfile;
  className?: string;
}

const StreakDashboard: React.FC<StreakDashboardProps> = ({ 
  userEngagement, 
  className = '' 
}) => {
  const [selectedStreak, setSelectedStreak] = useState<'combined' | 'posting' | 'diary' | 'community'>('combined');
  const [showCelebration, setShowCelebration] = useState(false);

  // Check for milestone celebrations
  useEffect(() => {
    const streaks = userEngagement.streaks;
    const hasRecentMilestone = Object.values(streaks).some(streak => 
      [7, 14, 30, 60, 100, 365].includes(streak.currentStreak)
    );
    
    if (hasRecentMilestone) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [userEngagement.streaks]);

  const getTotalStreakScore = () => {
    const streaks = userEngagement.streaks;
    return streaks.posting.currentStreak + 
           streaks.diary.currentStreak + 
           streaks.community.currentStreak;
  };

  const getStreakHealthScore = () => {
    const streaks = Object.values(userEngagement.streaks);
    const activeStreaks = streaks.filter(streak => streak.currentStreak > 0).length;
    const avgStreak = streaks.reduce((sum, streak) => sum + streak.currentStreak, 0) / streaks.length;
    
    return Math.round((activeStreaks / streaks.length) * 50 + (avgStreak / 30) * 50);
  };

  const getNextMilestone = () => {
    const currentStreak = userEngagement.streaks[selectedStreak].currentStreak;
    const milestones = [7, 14, 30, 60, 100, 365];
    
    for (const milestone of milestones) {
      if (milestone > currentStreak) {
        return milestone;
      }
    }
    return milestones[milestones.length - 1] + 100;
  };

  const getDaysUntilMilestone = () => {
    const currentStreak = userEngagement.streaks[selectedStreak].currentStreak;
    return getNextMilestone() - currentStreak;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4 animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-sage-700 mb-2">
              Milestone Reached!
            </h2>
            <p className="text-stone-600">
              You've achieved an amazing streak milestone. Keep up the mindful momentum!
            </p>
            <button
              onClick={() => setShowCelebration(false)}
              className="mt-4 btn-primary"
            >
              Continue Journey
            </button>
          </div>
        </div>
      )}

      {/* Header Stats */}
      <div className="card-gentle">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-serif font-semibold text-sage-700">
            Your Mindful Streaks
          </h2>
          <p className="text-stone-600">
            Consistency is the key to mindful growth and authentic connection.
          </p>
          
          {/* Overall Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-sage-600">
                {getTotalStreakScore()}
              </div>
              <div className="text-sm text-stone-600">Total Streak Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sage-600">
                {getStreakHealthScore()}%
              </div>
              <div className="text-sm text-stone-600">Streak Health</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sage-600">
                {getDaysUntilMilestone()}
              </div>
              <div className="text-sm text-stone-600">Days to Next Milestone</div>
            </div>
          </div>
        </div>
      </div>

      {/* Streak Type Selector */}
      <div className="card-gentle">
        <div className="flex flex-wrap gap-2 mb-6">
          {(['combined', 'posting', 'diary', 'community'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedStreak(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStreak === type
                  ? 'bg-sage-600 text-white shadow-md'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {type === 'combined' ? 'Overall' : 
               type === 'posting' ? 'Sharing' :
               type === 'diary' ? 'Journaling' : 'Community'}
            </button>
          ))}
        </div>

        {/* Selected Streak Display */}
        <StreakTracker
          streakData={userEngagement.streaks[selectedStreak]}
          streakType={selectedStreak}
        />
      </div>

      {/* All Streaks Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StreakTracker
          streakData={userEngagement.streaks.posting}
          streakType="posting"
        />
        <StreakTracker
          streakData={userEngagement.streaks.diary}
          streakType="diary"
        />
        <StreakTracker
          streakData={userEngagement.streaks.community}
          streakType="community"
        />
      </div>

      {/* Streak Calendar View */}
      <div className="card-gentle">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">
          Activity Calendar
        </h3>
        <StreakCalendar userEngagement={userEngagement} />
      </div>

      {/* Motivational Section */}
      <div className="card-gentle bg-gradient-to-r from-sage-50 to-lavender-50 border border-sage-200">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-stone-800">
            Keep Your Momentum Going
          </h3>
          <p className="text-stone-600 max-w-md mx-auto">
            Every day you engage mindfully is a step towards deeper self-awareness 
            and authentic connection with others.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="btn-primary">
              Share Today
            </button>
            <button className="btn-secondary">
              Write in Diary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple calendar component for streak visualization
const StreakCalendar: React.FC<{ userEngagement: UserEngagementProfile }> = ({ userEngagement }) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  
  // Generate calendar days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Mock activity data (in real implementation, this would come from engagement events)
  const getActivityLevel = (day: number) => {
    // Simple mock: higher activity on recent days if streak is active
    const combinedStreak = userEngagement.streaks.combined.currentStreak;
    const daysSinceToday = today.getDate() - day;
    
    if (daysSinceToday < 0) return 0; // Future days
    if (daysSinceToday < combinedStreak) {
      return Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0;
    }
    return Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;
  };

  const getActivityColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-stone-100';
      case 1: return 'bg-sage-200';
      case 2: return 'bg-sage-400';
      case 3: return 'bg-sage-500';
      case 4: return 'bg-sage-600';
      default: return 'bg-stone-100';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-stone-700">
          {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="flex items-center space-x-2 text-xs text-stone-600">
          <span>Less</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs text-stone-500 text-center p-1">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startOfMonth.getDay() }, (_, i) => (
          <div key={`empty-${i}`} className="w-4 h-4" />
        ))}
        
        {/* Calendar days */}
        {days.map(day => {
          const activityLevel = getActivityLevel(day);
          const isToday = day === today.getDate();
          
          return (
            <div
              key={day}
              className={`w-4 h-4 rounded-sm ${getActivityColor(activityLevel)} ${
                isToday ? 'ring-2 ring-sage-600' : ''
              }`}
              title={`${day} - Activity level: ${activityLevel}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default StreakDashboard;