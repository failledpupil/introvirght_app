import React, { useState, useEffect } from 'react';
import type { RecommendationScore } from '../../types/engagement';

interface PersonalizedFeedProps {
  userId: string;
  className?: string;
}

const PersonalizedFeed: React.FC<PersonalizedFeedProps> = ({
  userId,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'trending' | 'similar' | 'discover'>('all');

  useEffect(() => {
    loadRecommendations();
  }, [userId, selectedCategory]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual service
      const mockRecommendations: RecommendationScore[] = [
        {
          itemId: '1',
          itemType: 'post',
          score: 0.95,
          reasons: ['Similar to content you\'ve engaged with', 'Trending in mindfulness'],
          metadata: {
            title: 'Finding Peace in Daily Chaos',
            author: 'Sarah M.',
            excerpt: 'Today I discovered that mindfulness isn\'t about perfect silence...',
            sharedTopics: ['mindfulness', 'growth'],
            engagementScore: 24
          }
        },
        {
          itemId: '2',
          itemType: 'post',
          score: 0.87,
          reasons: ['Users with similar interests enjoyed this'],
          metadata: {
            title: 'The Art of Gratitude Journaling',
            author: 'Michael R.',
            excerpt: 'Three months ago, I started writing down three things I\'m grateful for...',
            sharedTopics: ['gratitude', 'reflection'],
            similarUserId: 'user123'
          }
        },
        {
          itemId: '3',
          itemType: 'post',
          score: 0.76,
          reasons: ['Discover new perspectives'],
          metadata: {
            title: 'Nature as My Teacher',
            author: 'Emma L.',
            excerpt: 'Walking through the forest this morning, I realized...',
            newTopics: ['nature', 'wisdom'],
            engagementScore: 18
          }
        }
      ];

      // Filter based on selected category
      let filteredRecs = mockRecommendations;
      if (selectedCategory !== 'all') {
        filteredRecs = mockRecommendations.filter(rec => {
          switch (selectedCategory) {
            case 'trending':
              return rec.reasons.some(r => r.includes('Trending'));
            case 'similar':
              return rec.reasons.some(r => r.includes('Similar to content'));
            case 'discover':
              return rec.reasons.some(r => r.includes('Discover new'));
            default:
              return true;
          }
        });
      }

      setRecommendations(filteredRecs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-sage-600';
    if (score >= 0.7) return 'text-sage-500';
    return 'text-stone-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.9) return 'Highly Recommended';
    if (score >= 0.7) return 'Recommended';
    return 'Worth Exploring';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-semibold text-stone-800">
            Personalized for You
          </h2>
          <p className="text-sm text-stone-600">
            Content curated based on your interests and engagement patterns
          </p>
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={loadRecommendations}
          className="btn-secondary flex items-center space-x-2"
          disabled={loading}
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {(['all', 'trending', 'similar', 'discover'] as const).map((category, index) => {
          const colors = [
            'from-blue-500 to-indigo-600',
            'from-orange-500 to-red-600', 
            'from-emerald-500 to-teal-600',
            'from-purple-500 to-pink-600'
          ];
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category
                  ? `bg-gradient-to-r ${colors[index]} text-white shadow-lg`
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              {category === 'all' ? '✨ All Recommendations' :
               category === 'trending' ? '🔥 Trending Now' :
               category === 'similar' ? '🎯 Similar Interests' : '🌟 Discover New'}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-gentle animate-pulse">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-stone-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                    <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-stone-200 rounded"></div>
                  <div className="h-3 bg-stone-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {!loading && (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.itemId} className="card-gentle hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                      <span className="text-sage-700 font-medium text-sm">
                        {rec.metadata?.author?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800">
                        {rec.metadata?.title || 'Recommended Content'}
                      </h3>
                      <p className="text-sm text-stone-600">
                        by {rec.metadata?.author || 'Anonymous'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Recommendation Score */}
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getScoreColor(rec.score)}`}>
                      {getScoreLabel(rec.score)}
                    </div>
                    <div className="text-xs text-stone-500">
                      {Math.round(rec.score * 100)}% match
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                {rec.metadata?.excerpt && (
                  <div className="bg-stone-50 rounded-lg p-3">
                    <p className="text-stone-700 text-sm leading-relaxed">
                      {rec.metadata.excerpt}
                    </p>
                  </div>
                )}

                {/* Recommendation Reasons */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-stone-600">Why we recommend this:</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.reasons.map((reason, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Shared Topics */}
                {rec.metadata?.sharedTopics && rec.metadata.sharedTopics.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-stone-600">Shared interests:</p>
                    <div className="flex flex-wrap gap-1">
                      {rec.metadata.sharedTopics.map((topic: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-lavender-100 text-lavender-700 text-xs rounded-full"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Topics */}
                {rec.metadata?.newTopics && rec.metadata.newTopics.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-stone-600">Explore new topics:</p>
                    <div className="flex flex-wrap gap-1">
                      {rec.metadata.newTopics.map((topic: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engagement Stats */}
                {rec.metadata?.engagementScore && (
                  <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                    <span>Community engagement: {rec.metadata.engagementScore} interactions</span>
                    <div className="flex items-center space-x-4">
                      <button className="hover:text-sage-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <button className="hover:text-sage-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                      <button className="hover:text-sage-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && recommendations.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-stone-700 mb-2">
            No {selectedCategory === 'all' ? '' : selectedCategory} recommendations yet
          </h3>
          <p className="text-stone-600 text-sm max-w-md mx-auto">
            {selectedCategory === 'all' 
              ? 'Engage with more content to receive personalized recommendations tailored to your interests.'
              : 'Try a different category or engage with more content to see recommendations here.'
            }
          </p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="mt-4 btn-primary"
          >
            View All Recommendations
          </button>
        </div>
      )}

      {/* Personalization Tip */}
      <div className="bg-gradient-to-r from-sage-50 to-lavender-50 rounded-lg p-4 border border-sage-200">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-sage-800 mb-1">
              Improving Your Recommendations
            </h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              The more you engage with content (likes, comments, posts), the better we become at 
              suggesting content that resonates with your interests and mindful journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedFeed;