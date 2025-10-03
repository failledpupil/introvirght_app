import React, { useState, useEffect } from 'react';

interface SuggestedConnectionsProps {
  userId: string;
  className?: string;
}

interface SuggestedUser {
  id: string;
  username: string;
  bio?: string;
  level: number;
  sharedInterests: string[];
  similarity: number;
  mutualConnections: number;
  recentActivity: string;
  avatar?: string;
}

const SuggestedConnections: React.FC<SuggestedConnectionsProps> = ({
  userId,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSuggestions();
  }, [userId]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual service
      const mockSuggestions: SuggestedUser[] = [
        {
          id: 'user1',
          username: 'mindful_sarah',
          bio: 'Finding peace in everyday moments. Meditation teacher and nature lover.',
          level: 4,
          sharedInterests: ['mindfulness', 'nature', 'growth'],
          similarity: 0.87,
          mutualConnections: 3,
          recentActivity: 'Shared a reflection on morning meditation',
          avatar: undefined
        },
        {
          id: 'user2',
          username: 'grateful_mike',
          bio: 'Daily gratitude practice changed my life. Sharing the journey.',
          level: 3,
          sharedInterests: ['gratitude', 'reflection', 'wellness'],
          similarity: 0.82,
          mutualConnections: 2,
          recentActivity: 'Posted about gratitude journaling',
          avatar: undefined
        },
        {
          id: 'user3',
          username: 'creative_emma',
          bio: 'Artist exploring the intersection of creativity and mindfulness.',
          level: 5,
          sharedInterests: ['creativity', 'mindfulness', 'art'],
          similarity: 0.76,
          mutualConnections: 1,
          recentActivity: 'Shared artwork inspired by meditation',
          avatar: undefined
        },
        {
          id: 'user4',
          username: 'nature_walker',
          bio: 'Every walk is a meditation. Hiking enthusiast and outdoor mindfulness advocate.',
          level: 4,
          sharedInterests: ['nature', 'wellness', 'mindfulness'],
          similarity: 0.73,
          mutualConnections: 0,
          recentActivity: 'Posted photos from forest meditation',
          avatar: undefined
        }
      ];

      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (suggestedUserId: string) => {
    try {
      // Mock API call - replace with actual service
      console.log('Following user:', suggestedUserId);
      
      setFollowingUsers(prev => new Set([...prev, suggestedUserId]));
      
      // Remove from suggestions after following
      setTimeout(() => {
        setSuggestions(prev => prev.filter(user => user.id !== suggestedUserId));
      }, 1000);
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleDismiss = (suggestedUserId: string) => {
    setSuggestions(prev => prev.filter(user => user.id !== suggestedUserId));
  };

  const getLevelColor = (level: number) => {
    if (level <= 2) return 'from-emerald-400 to-teal-500';
    if (level <= 4) return 'from-blue-400 to-indigo-500';
    return 'from-purple-400 to-pink-500';
  };

  const getLevelTitle = (level: number) => {
    const titles = [
      'Thoughtful Beginner',
      'Reflective Explorer',
      'Mindful Contributor',
      'Community Connector',
      'Wisdom Keeper',
      'Mindful Sage'
    ];
    return titles[level - 1] || 'Mindful Master';
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.8) return 'Highly Compatible';
    if (similarity >= 0.7) return 'Very Compatible';
    if (similarity >= 0.6) return 'Compatible';
    return 'Somewhat Compatible';
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return 'text-emerald-600';
    if (similarity >= 0.7) return 'text-blue-600';
    return 'text-purple-600';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-semibold text-stone-800">
            Suggested Connections
          </h2>
          <p className="text-sm text-stone-600">
            Discover mindful individuals who share your interests and values
          </p>
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={loadSuggestions}
          className="btn-secondary flex items-center space-x-2"
          disabled={loading}
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card-gentle animate-pulse">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-stone-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                    <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-stone-200 rounded"></div>
                  <div className="h-3 bg-stone-200 rounded w-5/6"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-stone-200 rounded flex-1"></div>
                  <div className="h-8 bg-stone-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions Grid */}
      {!loading && (
        <div className="grid md:grid-cols-2 gap-6">
          {suggestions.map((user) => (
            <div key={user.id} className="card-gentle hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                {/* User Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getLevelColor(user.level)} flex items-center justify-center text-white font-bold shadow-md`}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800">
                        @{user.username}
                      </h3>
                      <p className="text-sm text-stone-600">
                        Level {user.level} • {getLevelTitle(user.level)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Compatibility Score */}
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getSimilarityColor(user.similarity)}`}>
                      {getSimilarityLabel(user.similarity)}
                    </div>
                    <div className="text-xs text-stone-500">
                      {Math.round(user.similarity * 100)}% match
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {user.bio}
                  </p>
                )}

                {/* Shared Interests */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-stone-600">Shared interests:</p>
                  <div className="flex flex-wrap gap-1">
                    {user.sharedInterests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full"
                      >
                        #{interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connection Info */}
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center space-x-4">
                    {user.mutualConnections > 0 && (
                      <span className="flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{user.mutualConnections} mutual</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-stone-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-stone-600 mb-1">Recent activity:</p>
                  <p className="text-sm text-stone-700">
                    {user.recentActivity}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => handleFollow(user.id)}
                    disabled={followingUsers.has(user.id)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      followingUsers.has(user.id)
                        ? 'bg-sage-100 text-sage-700 cursor-not-allowed'
                        : 'bg-sage-600 text-white hover:bg-sage-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {followingUsers.has(user.id) ? (
                      <span className="flex items-center justify-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Following</span>
                      </span>
                    ) : (
                      'Follow'
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDismiss(user.id)}
                    className="px-3 py-2 text-stone-500 hover:text-stone-700 transition-colors"
                    title="Dismiss suggestion"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && suggestions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-stone-700 mb-2">
            No New Suggestions
          </h3>
          <p className="text-stone-600 text-sm max-w-md mx-auto">
            You've seen all current suggestions! Engage more with the community to discover new connections, 
            or check back later for fresh recommendations.
          </p>
          <button
            onClick={loadSuggestions}
            className="mt-4 btn-primary"
          >
            Refresh Suggestions
          </button>
        </div>
      )}

      {/* Connection Tips */}
      <div className="bg-gradient-to-r from-sage-50 to-lavender-50 rounded-lg p-4 border border-sage-200">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-sage-800 mb-1">
              Building Meaningful Connections
            </h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              These suggestions are based on shared interests, similar engagement patterns, and 
              compatibility in mindful practices. Quality connections enhance your journey of growth and reflection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestedConnections;