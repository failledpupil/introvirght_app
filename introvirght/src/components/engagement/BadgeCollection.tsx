import React, { useState } from 'react';
import type { Badge } from '../../types/engagement';

interface BadgeCollectionProps {
  badges: Badge[];
  recentlyUnlocked?: Badge[];
  className?: string;
}

const BadgeCollection: React.FC<BadgeCollectionProps> = ({
  badges,
  recentlyUnlocked = [],
  className = ''
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [filter, setFilter] = useState<'all' | 'streak' | 'achievement' | 'social' | 'growth'>('all');

  const filteredBadges = badges.filter(badge => 
    filter === 'all' || badge.category === filter
  );

  const getBadgeRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-emerald-400 to-teal-500';
      case 'rare': return 'from-blue-400 to-indigo-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getBadgeRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-emerald-300 shadow-emerald-200';
      case 'rare': return 'border-blue-300 shadow-blue-200';
      case 'epic': return 'border-purple-300 shadow-purple-200';
      case 'legendary': return 'border-yellow-300 shadow-yellow-200 shadow-lg';
      default: return 'border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'streak':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'achievement':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'social':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'growth':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
    }
  };

  const isRecentlyUnlocked = (badge: Badge) => {
    return recentlyUnlocked.some(recent => recent.id === badge.id);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-semibold text-stone-800">
            Badge Collection
          </h2>
          <p className="text-sm text-stone-600">
            {badges.length} badge{badges.length !== 1 ? 's' : ''} earned through mindful engagement
          </p>
        </div>
        
        {/* Recently Unlocked Indicator */}
        {recentlyUnlocked.length > 0 && (
          <div className="flex items-center space-x-2 bg-sage-50 px-3 py-2 rounded-lg border border-sage-200">
            <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-sage-700">
              {recentlyUnlocked.length} new badge{recentlyUnlocked.length !== 1 ? 's' : ''}!
            </span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'streak', 'achievement', 'social', 'growth'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              filter === category
                ? 'bg-sage-600 text-white shadow-md'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {category !== 'all' && getCategoryIcon(category)}
            <span className="capitalize">{category}</span>
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className={`relative cursor-pointer group ${
              isRecentlyUnlocked(badge) ? 'animate-pulse' : ''
            }`}
          >
            <div className={`
              aspect-square rounded-xl border-2 ${getBadgeRarityBorder(badge.rarity)}
              bg-gradient-to-br ${getBadgeRarityColor(badge.rarity)}
              p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg
              ${isRecentlyUnlocked(badge) ? 'ring-4 ring-sage-300 ring-opacity-50' : ''}
            `}>
              {/* Badge Icon/Image */}
              <div className="w-full h-full flex items-center justify-center">
                {badge.iconUrl ? (
                  <img 
                    src={badge.iconUrl} 
                    alt={badge.name}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="text-2xl text-white">
                    {getCategoryIcon(badge.category)}
                  </div>
                )}
              </div>
              
              {/* Rarity Indicator */}
              <div className="absolute top-1 right-1">
                <div className={`w-3 h-3 rounded-full ${
                  badge.rarity === 'legendary' ? 'bg-yellow-300' :
                  badge.rarity === 'epic' ? 'bg-purple-300' :
                  badge.rarity === 'rare' ? 'bg-blue-300' : 'bg-stone-300'
                }`} />
              </div>
              
              {/* New Badge Indicator */}
              {isRecentlyUnlocked(badge) && (
                <div className="absolute -top-2 -right-2 bg-sage-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  NEW!
                </div>
              )}
            </div>
            
            {/* Badge Name */}
            <div className="mt-2 text-center">
              <p className="text-sm font-medium text-stone-800 truncate">
                {badge.name}
              </p>
              <p className="text-xs text-stone-500 capitalize">
                {badge.rarity}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-stone-700 mb-2">
            No {filter === 'all' ? '' : filter} badges yet
          </h3>
          <p className="text-stone-600 text-sm">
            Keep engaging mindfully to earn your first badges!
          </p>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            {/* Badge Display */}
            <div className="text-center">
              <div className={`
                w-24 h-24 mx-auto rounded-xl border-4 ${getBadgeRarityBorder(selectedBadge.rarity)}
                bg-gradient-to-br ${getBadgeRarityColor(selectedBadge.rarity)}
                p-4 mb-4
              `}>
                <div className="w-full h-full flex items-center justify-center">
                  {selectedBadge.iconUrl ? (
                    <img 
                      src={selectedBadge.iconUrl} 
                      alt={selectedBadge.name}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <div className="text-4xl text-white">
                      {getCategoryIcon(selectedBadge.category)}
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-stone-800 mb-2">
                {selectedBadge.name}
              </h3>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedBadge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                  selectedBadge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                  selectedBadge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' : 
                  'bg-stone-100 text-stone-800'
                }`}>
                  {selectedBadge.rarity}
                </span>
                <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm capitalize">
                  {selectedBadge.category}
                </span>
              </div>
            </div>
            
            {/* Badge Description */}
            <div className="text-center">
              <p className="text-stone-600 leading-relaxed">
                {selectedBadge.description}
              </p>
            </div>
            
            {/* Unlock Date */}
            <div className="text-center text-sm text-stone-500">
              Unlocked on {new Date(selectedBadge.unlockedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            
            {/* Close Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setSelectedBadge(null)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeCollection;