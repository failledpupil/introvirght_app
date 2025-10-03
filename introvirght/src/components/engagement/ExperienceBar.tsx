import React, { useState, useEffect } from 'react';
import type { LevelInfo } from '../../types/engagement';

interface ExperienceBarProps {
  currentXP: number;
  levelInfo: LevelInfo;
  recentXPGain?: number;
  className?: string;
}

const ExperienceBar: React.FC<ExperienceBarProps> = ({
  currentXP,
  levelInfo,
  recentXPGain = 0,
  className = ''
}) => {
  const [animatedXP, setAnimatedXP] = useState(currentXP - recentXPGain);
  const [showXPGain, setShowXPGain] = useState(false);

  useEffect(() => {
    if (recentXPGain > 0) {
      setShowXPGain(true);
      
      // Animate XP gain
      const timer = setTimeout(() => {
        setAnimatedXP(currentXP);
      }, 100);

      // Hide XP gain indicator
      const hideTimer = setTimeout(() => {
        setShowXPGain(false);
      }, 2000);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    } else {
      setAnimatedXP(currentXP);
    }
  }, [currentXP, recentXPGain]);

  const getProgressPercentage = () => {
    const levelStartXP = levelInfo.experienceRequired;
    const nextLevelXP = levelStartXP + levelInfo.experienceToNext;
    const progressXP = animatedXP - levelStartXP;
    const totalXPForLevel = nextLevelXP - levelStartXP;
    
    return Math.min((progressXP / totalXPForLevel) * 100, 100);
  };

  const getLevelColor = (level: number) => {
    if (level <= 2) return 'from-emerald-400 to-teal-500';
    if (level <= 4) return 'from-blue-400 to-indigo-500';
    if (level <= 6) return 'from-purple-400 to-pink-500';
    return 'from-pink-500 to-rose-600';
  };

  const getLevelIcon = (level: number) => {
    if (level <= 2) return '🌱';
    if (level <= 4) return '🌿';
    if (level <= 6) return '🌳';
    return '🏔️';
  };

  return (
    <div className={`card-gentle ${className}`}>
      <div className="space-y-4">
        {/* Level Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getLevelColor(levelInfo.level)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
              {levelInfo.level}
            </div>
            <div>
              <h3 className="font-semibold text-stone-800">
                Level {levelInfo.level}
              </h3>
              <p className="text-sm text-stone-600">
                {levelInfo.title}
              </p>
            </div>
          </div>
          
          {/* Level Icon */}
          <div className="text-2xl">
            {getLevelIcon(levelInfo.level)}
          </div>
        </div>

        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-stone-600">
              {animatedXP.toLocaleString()} XP
            </span>
            <div className="flex items-center space-x-2">
              {showXPGain && recentXPGain > 0 && (
                <span className="text-sm font-semibold text-sage-600 animate-bounce">
                  +{recentXPGain} XP
                </span>
              )}
              <span className="text-sm text-stone-500">
                {levelInfo.experienceToNext > 0 
                  ? `${levelInfo.experienceToNext} to next level`
                  : 'Max level reached!'
                }
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className={`h-full bg-gradient-to-r ${getLevelColor(levelInfo.level)} transition-all duration-1000 ease-out relative shadow-sm`}
                style={{ width: `${getProgressPercentage()}%` }}
              >
                {/* Shimmer effect for active progress */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse" />
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 blur-sm" />
              </div>
            </div>
            
            {/* Progress percentage indicator */}
            <div 
              className="absolute top-0 h-3 w-1 bg-white shadow-sm transition-all duration-1000 ease-out"
              style={{ left: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Level Description */}
        <div className="bg-stone-50 rounded-lg p-3">
          <p className="text-sm text-stone-700 leading-relaxed">
            {levelInfo.description}
          </p>
          
          {/* Unlocked Features */}
          {levelInfo.unlockedFeatures.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-stone-600 mb-2">
                Unlocked Features:
              </p>
              <div className="flex flex-wrap gap-1">
                {levelInfo.unlockedFeatures.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full"
                  >
                    {feature.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Next Level Preview */}
        {levelInfo.experienceToNext > 0 && (
          <div className="border-t border-stone-200 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">Next Level:</span>
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getLevelColor(levelInfo.level + 1)} flex items-center justify-center text-white text-xs font-bold`}>
                  {levelInfo.level + 1}
                </div>
                <span className="text-stone-700 font-medium">
                  {getLevelTitle(levelInfo.level + 1)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get level titles
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

export default ExperienceBar;