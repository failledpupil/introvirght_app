import React from 'react';
import type { LevelInfo } from '../../types/engagement';

interface LevelProgressCardProps {
  levelInfo: LevelInfo;
  currentXP: number;
  className?: string;
}

const LevelProgressCard: React.FC<LevelProgressCardProps> = ({
  levelInfo,
  currentXP,
  className = ''
}) => {
  const getProgressToNextLevel = () => {
    if (levelInfo.experienceToNext === 0) return 100;
    
    const levelStartXP = levelInfo.experienceRequired;
    const nextLevelXP = levelStartXP + levelInfo.experienceToNext;
    const progressXP = currentXP - levelStartXP;
    const totalXPForLevel = nextLevelXP - levelStartXP;
    
    return Math.min((progressXP / totalXPForLevel) * 100, 100);
  };

  const getLevelTheme = (level: number) => {
    if (level <= 2) return {
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      border: 'border-emerald-300',
      text: 'text-emerald-800',
      icon: '🌱'
    };
    if (level <= 4) return {
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      border: 'border-blue-300',
      text: 'text-blue-800',
      icon: '🌿'
    };
    if (level <= 6) return {
      gradient: 'from-purple-500 to-pink-600',
      bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
      border: 'border-purple-300',
      text: 'text-purple-800',
      icon: '🌳'
    };
    return {
      gradient: 'from-pink-500 to-rose-600',
      bg: 'bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50',
      border: 'border-pink-400',
      text: 'text-pink-900',
      icon: '🏔️'
    };
  };

  const theme = getLevelTheme(levelInfo.level);
  const progressPercentage = getProgressToNextLevel();

  return (
    <div className={`card-gentle ${theme.bg} ${theme.border} border-2 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
              {levelInfo.level}
            </div>
            <div>
              <h2 className={`text-xl font-serif font-bold ${theme.text}`}>
                {levelInfo.title}
              </h2>
              <p className="text-stone-600">
                Level {levelInfo.level} Mindful Explorer
              </p>
            </div>
          </div>
          
          <div className="text-4xl">
            {theme.icon}
          </div>
        </div>

        {/* Level Description */}
        <div className={`p-4 rounded-lg ${theme.bg} border ${theme.border}`}>
          <p className={`text-sm leading-relaxed ${theme.text}`}>
            {levelInfo.description}
          </p>
        </div>

        {/* Progress Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className={`font-medium ${theme.text}`}>
              Progress to Level {levelInfo.level + 1}
            </span>
            <span className="text-stone-600 text-sm">
              {currentXP.toLocaleString()} / {(levelInfo.experienceRequired + levelInfo.experienceToNext).toLocaleString()} XP
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-stone-200 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-1000 ease-out relative`}
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
              </div>
            </div>
            
            {/* Progress indicator */}
            <div 
              className="absolute top-0 h-4 w-1 bg-white shadow-md transition-all duration-1000 ease-out"
              style={{ left: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="text-center">
            <span className="text-sm text-stone-600">
              {levelInfo.experienceToNext > 0 
                ? `${levelInfo.experienceToNext.toLocaleString()} XP to next level`
                : 'Maximum level achieved!'
              }
            </span>
          </div>
        </div>

        {/* Unlocked Features */}
        {levelInfo.unlockedFeatures.length > 0 && (
          <div className="space-y-3">
            <h3 className={`font-semibold ${theme.text} flex items-center space-x-2`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <span>Unlocked Features</span>
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {levelInfo.unlockedFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-stone-200"
                >
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${theme.gradient}`} />
                  <span className="text-sm font-medium text-stone-700">
                    {formatFeatureName(feature)}
                  </span>
                  <div className="ml-auto">
                    <svg className="w-4 h-4 text-sage-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Level Preview */}
        {levelInfo.experienceToNext > 0 && (
          <div className="border-t border-stone-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getLevelTheme(levelInfo.level + 1).gradient} flex items-center justify-center text-white font-bold opacity-60`}>
                  {levelInfo.level + 1}
                </div>
                <div>
                  <p className="font-medium text-stone-700">
                    {getLevelTitle(levelInfo.level + 1)}
                  </p>
                  <p className="text-sm text-stone-500">
                    Next level rewards await
                  </p>
                </div>
              </div>
              
              <div className="text-2xl opacity-60">
                {getLevelTheme(levelInfo.level + 1).icon}
              </div>
            </div>
          </div>
        )}

        {/* Achievement Badge */}
        {levelInfo.badge && (
          <div className="text-center p-4 bg-gradient-to-r from-sage-100 to-lavender-100 rounded-lg border border-sage-200">
            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-sage-500 to-sage-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-sage-700">
              Level {levelInfo.level} Badge Earned
            </p>
            <p className="text-xs text-stone-600">
              {levelInfo.badge.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const formatFeatureName = (feature: string): string => {
  return feature
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getLevelTitle = (level: number): string => {
  const titles = [
    'Thoughtful Beginner',
    'Reflective Explorer',
    'Mindful Contributor',
    'Community Connector',
    'Wisdom Keeper',
    'Mindful Sage',
    'Enlightened Master'
  ];
  
  return titles[level - 1] || 'Transcendent Being';
};

export default LevelProgressCard;