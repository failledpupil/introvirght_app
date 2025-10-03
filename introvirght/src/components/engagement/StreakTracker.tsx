import React, { useState, useEffect } from 'react';
import type { StreakData } from '../../types/engagement';

interface StreakTrackerProps {
  streakData: StreakData;
  streakType: 'posting' | 'diary' | 'community' | 'combined';
  className?: string;
}

const StreakTracker: React.FC<StreakTrackerProps> = ({ 
  streakData, 
  streakType, 
  className = '' 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation when streak updates
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [streakData.currentStreak]);

  const getStreakIcon = () => {
    switch (streakType) {
      case 'posting':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      case 'diary':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'community':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  const getStreakColor = () => {
    if (streakData.currentStreak === 0) return 'text-gray-400';
    if (streakData.currentStreak < 7) return 'text-emerald-500';
    if (streakData.currentStreak < 30) return 'text-blue-500';
    if (streakData.currentStreak < 100) return 'text-purple-500';
    return 'text-pink-500';
  };

  const getProgressPercentage = () => {
    return Math.min((streakData.currentStreak / streakData.nextMilestone) * 100, 100);
  };

  const getStreakGradient = () => {
    if (streakData.currentStreak === 0) return 'from-gray-300 to-gray-400';
    if (streakData.currentStreak < 7) return 'from-emerald-400 to-emerald-500';
    if (streakData.currentStreak < 30) return 'from-blue-400 to-blue-500';
    if (streakData.currentStreak < 100) return 'from-purple-400 to-purple-500';
    return 'from-pink-400 to-pink-500';
  };

  const formatStreakType = (type: string) => {
    switch (type) {
      case 'posting': return 'Sharing';
      case 'diary': return 'Journaling';
      case 'community': return 'Community';
      case 'combined': return 'Overall';
      default: return type;
    }
  };

  const getEncouragementMessage = () => {
    if (streakData.currentStreak === 0) {
      return "Start your mindful journey today!";
    }
    if (streakData.currentStreak === 1) {
      return "Great start! Keep the momentum going.";
    }
    if (streakData.currentStreak < 7) {
      return `${7 - streakData.currentStreak} more days to your first milestone!`;
    }
    if (streakData.currentStreak < streakData.nextMilestone) {
      return `${streakData.nextMilestone - streakData.currentStreak} days to your next milestone!`;
    }
    return "Amazing dedication! You're on fire! 🔥";
  };

  return (
    <div className={`card-gentle bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${getStreakGradient()} text-white shadow-lg`}>
            {getStreakIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-stone-800">
              {formatStreakType(streakType)} Streak
            </h3>
            <p className="text-sm text-stone-600">
              {getEncouragementMessage()}
            </p>
          </div>
        </div>
        
        {/* Streak Counter with Animation */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${getStreakColor()} ${
            isAnimating ? 'animate-pulse scale-110' : ''
          } transition-all duration-300`}>
            {streakData.currentStreak}
          </div>
          <div className="text-xs text-stone-500">
            {streakData.currentStreak === 1 ? 'day' : 'days'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-stone-600 mb-2">
          <span>Progress to {streakData.nextMilestone} days</span>
          <span>{Math.round(getProgressPercentage())}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${getStreakGradient()} shadow-sm`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-stone-800">
            {streakData.longestStreak}
          </div>
          <div className="text-xs text-stone-600">Longest Streak</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-stone-800">
            {streakData.gracePeriodsUsed}/3
          </div>
          <div className="text-xs text-stone-600">Grace Periods</div>
        </div>
      </div>

      {/* Grace Period Info */}
      {streakData.gracePeriodsUsed > 0 && (
        <div className="mt-4 p-3 bg-lavender-50 rounded-lg border border-lavender-200">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-lavender-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-lavender-700">
              You've used {streakData.gracePeriodsUsed} mindful pause{streakData.gracePeriodsUsed > 1 ? 's' : ''} to maintain your streak.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakTracker;